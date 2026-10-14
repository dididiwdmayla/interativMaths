/**
 * Calibragem: a escada adaptativa que diz em que marca o jogador está. Não é prova e não dá nota.
 * Começa em D3. Sucesso sobe um degrau; falha ou "não sei ainda" desce um.
 * Termina quando falha num degrau tendo vencido o de baixo, quando vence o último, quando falha o
 * primeiro, ou em seis interações. Sem tempo.
 */
import type { ResultadoEvidencia } from "../dominio/evidencias";
import type { IdConceito } from "../curriculo/curriculo";
import type { RespostaCalibragem } from "../progresso/tipos";
import type { AcaoBancada, ConfigBancada } from "../maquinas/bancada/tipos";
import type { Objetivo, TipoResposta } from "../missoes/tipos";

export const DEGRAU_INICIAL = 3;
export const DEGRAUS = 6;
export const INTERACOES_MAX = 6;

export interface EstadoCalibragem {
  readonly atual: number;
  readonly respostas: readonly RespostaCalibragem[];
  readonly terminou: boolean;
}

export function iniciarCalibragem(): EstadoCalibragem {
  return { atual: DEGRAU_INICIAL, respostas: [], terminou: false };
}

function venceu(respostas: readonly RespostaCalibragem[], degrau: number): boolean {
  return respostas.some((r) => r.degrau === degrau && r.resultado === "sucesso");
}

export function responderCalibragem(e: EstadoCalibragem, resultado: ResultadoEvidencia): EstadoCalibragem {
  if (e.terminou) return e;
  const respostas = [...e.respostas, { degrau: e.atual, resultado }];
  const ok = resultado === "sucesso";
  // Fronteira achada: falhou em k e venceu k-1 (em qualquer ordem).
  const fronteira = respostas.some((r) => r.resultado !== "sucesso" && venceu(respostas, r.degrau - 1));
  const terminou =
    fronteira ||
    (ok && e.atual === DEGRAUS) ||
    (!ok && e.atual === 1) ||
    respostas.length >= INTERACOES_MAX;
  const proximo = ok ? Math.min(DEGRAUS, e.atual + 1) : Math.max(1, e.atual - 1);
  return { atual: terminou ? e.atual : proximo, respostas, terminou };
}

export interface RegrasCalibragem {
  /** Conceito medido em cada degrau (1 a 6). */
  readonly degraus: readonly { readonly degrau: number; readonly conceito: IdConceito }[];
  /** Conceitos que ficam prováveis a partir de um degrau vencido. */
  readonly provaveisExtras: readonly { readonly conceito: IdConceito; readonly minimo: number }[];
  /** Ponto de partida recomendado: a regra de maior mínimo que o jogador alcançou. */
  readonly recomendacoes: readonly { readonly minimo: number; readonly atividade: string }[];
  /** Missões que oferecem a prova direta a partir de um degrau. */
  readonly provas: readonly { readonly atividade: string; readonly minimo: number }[];
}

export interface ResultadoCalibragem {
  readonly maiorDegrau: number;
  readonly provaveis: IdConceito[];
  readonly recomendacao: string | null;
  /** Venceu além do que o arco cobre. */
  readonly alemDoArco: boolean;
}

/** Maior degrau vencido; um degrau vencido implica os de baixo como prováveis. */
export function resultadoCalibragem(respostas: readonly RespostaCalibragem[], regras: RegrasCalibragem): ResultadoCalibragem {
  const vencidos = respostas.filter((r) => r.resultado === "sucesso").map((r) => r.degrau);
  const maior = vencidos.length > 0 ? Math.max(...vencidos) : 0;
  const provaveis = new Set<IdConceito>();
  for (const d of regras.degraus) if (d.degrau <= maior) provaveis.add(d.conceito);
  for (const x of regras.provaveisExtras) if (maior >= x.minimo) provaveis.add(x.conceito);
  const rec = [...regras.recomendacoes].filter((r) => maior >= r.minimo).sort((a, b) => b.minimo - a.minimo)[0];
  return {
    maiorDegrau: maior,
    provaveis: [...provaveis],
    recomendacao: rec?.atividade ?? null,
    alemDoArco: maior >= DEGRAUS,
  };
}

export function provaLiberada(atividade: string, maiorDegrau: number, regras: RegrasCalibragem): boolean {
  return regras.provas.some((p) => p.atividade === atividade && maiorDegrau >= p.minimo);
}

/* ---------- Contrato dos itens (o conteúdo declara) ---------- */

interface ItemBase {
  readonly degrau: number;
  readonly conceito: IdConceito;
  /** O pedido, numa linha. */
  readonly pedido: string;
  /** O que fazer agora, com verbo no imperativo primeiro, até 80 caracteres, terminando em ponto. */
  readonly instrucao: string;
  /** O que o Nônio diz ao apresentar o degrau. */
  readonly fala: string;
}

/** Uma versão pequena da própria máquina: o jogador opera e diz "pronto". */
export interface ItemMaquina extends ItemBase {
  readonly tipo: "maquina";
  readonly maquina: ConfigBancada;
  readonly objetivo: Objetivo;
  /** Ações que vencem o degrau (para as checagens). */
  readonly solucao: readonly AcaoBancada[];
}

/** Uma resposta (fichas ou seletor); a máquina confere quando há máquina. */
export interface ItemResposta extends ItemBase {
  readonly tipo: "resposta";
  readonly resposta: TipoResposta;
  readonly esperado: string;
  readonly aceitaEquivalente?: boolean;
  readonly maquina?: ConfigBancada;
  readonly demonstracao?: readonly AcaoBancada[];
  /** Desenho simples de medidas (proporção), sem bancada. */
  readonly figura?: { readonly a: number; readonly b: number; readonly rotuloA: string; readonly rotuloB: string; readonly dadoA: number };
}

export type ItemCalibragem = ItemMaquina | ItemResposta;
