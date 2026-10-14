/**
 * Contrato da conversa com o Nônio (Pergunte ao Nônio). O cliente manda só ids e o estado visível;
 * o contexto (enunciado, escada, segredos) o servidor monta pelos ids. Validado à risca: campo a
 * mais, tipo errado ou texto longo demais, e o pedido é recusado.
 * A correção matemática continua sendo do motor: a conversa nunca diz se o jogador acertou.
 */
import type { AlvoMaquina, ModoExecucao } from "../missoes/tipos";
import type { ExpressaoTutor } from "./expressoes";

export const LIMITES_TUTOR = {
  maquina: 600,
  historico: 6,
  mensagem: 400,
  pergunta: 300,
  equivocos: 8,
  /** O texto da resposta do Nônio (o esquema não aceita maxLength: confere-se aqui). */
  resposta: 300,
  /** Perguntas por execução de missão; depois, o campo fecha. */
  perguntasPorExecucao: 20,
} as const;

export const EXPRESSOES_TUTOR: readonly ExpressaoTutor[] = ["neutro", "atento", "medindo", "duvida", "satisfeito", "quieto"];

export interface MensagemConversa {
  readonly autor: "jogador" | "nonio";
  readonly texto: string;
}

export interface EntradaTutor {
  readonly atividade: string;
  readonly passo: string;
  readonly modo: ModoExecucao;
  /** "vencido" libera o que o passo escondia; qualquer outra situação conta como ativo. */
  readonly situacao: "ativo" | "vencido";
  /** Degrau da escada já subido (0 a 4). */
  readonly degrau: number;
  /** O estado da máquina em texto (o mesmo do leitor de tela). Só descrição, nunca instrução. */
  readonly maquina: string;
  /** Equívocos recentes (ids), do mais antigo ao mais novo. */
  readonly equivocos: readonly string[];
  readonly historico: readonly MensagemConversa[];
  readonly pergunta: string;
}

export type PedidoTutor = { readonly tipo: "disponibilidade" } | ({ readonly tipo: "pergunta" } & EntradaTutor);

export interface SaidaTutor {
  readonly texto: string;
  readonly expressao: ExpressaoTutor;
  readonly alvo: AlvoMaquina | null;
}

/** Falhas esperadas: respondem 200 com { erro: { tipo } }. */
export type TipoFalhaTutor = "sobrecarga" | "sem_chave" | "sem_credito" | "rede" | "desconhecido";

export type RespostaTutor =
  | { readonly disponivel: boolean }
  | { readonly resposta: SaidaTutor }
  /**
   * A resposta do modelo foi barrada por uma guarda (entregava o segredo, ou trazia conta falsa):
   * no lugar, o degrau seguinte da escada, que o cliente escreve com as medidas vivas da máquina.
   * degrau null: o passo não tem escada; vale a fala padrão.
   */
  | { readonly recurso: { readonly degrau: 1 | 2 | 3 | null } }
  | { readonly erro: { readonly tipo: TipoFalhaTutor } };

/* ---------- Validação do pedido ---------- */

const ID = /^[a-z0-9][a-z0-9.\-]{0,79}$/;
const MODOS: readonly ModoExecucao[] = ["guiada", "prova", "registro"];

function chavesExatas(o: Record<string, unknown>, chaves: readonly string[]): boolean {
  const k = Object.keys(o);
  return k.length === chaves.length && k.every((c) => chaves.includes(c));
}

function texto(v: unknown, max: number, vazio = true): v is string {
  return typeof v === "string" && v.length <= max && (vazio || v.trim().length > 0);
}

function ehMensagem(x: unknown): x is MensagemConversa {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false;
  const m = x as Record<string, unknown>;
  return chavesExatas(m, ["autor", "texto"]) && (m.autor === "jogador" || m.autor === "nonio") && texto(m.texto, LIMITES_TUTOR.mensagem, false);
}

/** Lê o corpo do pedido. null: fora do contrato (a rota responde 400). */
export function lerPedidoTutor(x: unknown): PedidoTutor | null {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return null;
  const p = x as Record<string, unknown>;
  if (p.tipo === "disponibilidade") return chavesExatas(p, ["tipo"]) ? { tipo: "disponibilidade" } : null;
  if (p.tipo !== "pergunta") return null;
  const chaves = ["tipo", "atividade", "passo", "modo", "situacao", "degrau", "maquina", "equivocos", "historico", "pergunta"];
  if (!chavesExatas(p, chaves)) return null;
  if (typeof p.atividade !== "string" || !ID.test(p.atividade)) return null;
  if (typeof p.passo !== "string" || !ID.test(p.passo)) return null;
  if (typeof p.modo !== "string" || !MODOS.includes(p.modo as ModoExecucao)) return null;
  if (p.situacao !== "ativo" && p.situacao !== "vencido") return null;
  if (typeof p.degrau !== "number" || !Number.isInteger(p.degrau) || p.degrau < 0 || p.degrau > 4) return null;
  if (!texto(p.maquina, LIMITES_TUTOR.maquina)) return null;
  if (!Array.isArray(p.equivocos) || p.equivocos.length > LIMITES_TUTOR.equivocos) return null;
  if (!p.equivocos.every((e) => typeof e === "string" && ID.test(e))) return null;
  if (!Array.isArray(p.historico) || p.historico.length > LIMITES_TUTOR.historico || !p.historico.every(ehMensagem)) return null;
  if (!texto(p.pergunta, LIMITES_TUTOR.pergunta, false)) return null;
  return {
    tipo: "pergunta",
    atividade: p.atividade,
    passo: p.passo,
    modo: p.modo as ModoExecucao,
    situacao: p.situacao,
    degrau: p.degrau,
    maquina: p.maquina,
    equivocos: p.equivocos as string[],
    historico: p.historico as MensagemConversa[],
    pergunta: p.pergunta,
  };
}

/* ---------- Validação da saída do modelo ---------- */

/**
 * Lê a saída estruturada do modelo: { texto, expressao, alvo }. Enums comparados sem diferenciar
 * maiúsculas; texto vazio ou maior que o limite, ou alvo que não existe na máquina: inválida (null).
 */
export function lerSaidaModelo(x: unknown, alvos: readonly AlvoMaquina[]): SaidaTutor | null {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return null;
  const s = x as Record<string, unknown>;
  if (typeof s.texto !== "string") return null;
  const t = s.texto.trim();
  if (t.length === 0 || t.length > LIMITES_TUTOR.resposta) return null;
  if (typeof s.expressao !== "string") return null;
  const expressao = EXPRESSOES_TUTOR.find((e) => e === String(s.expressao).toLowerCase());
  if (!expressao) return null;
  let alvo: AlvoMaquina | null = null;
  if (s.alvo !== null && s.alvo !== undefined) {
    if (typeof s.alvo !== "string") return null;
    const achado = alvos.find((a) => a === String(s.alvo).toLowerCase());
    if (!achado) return null;
    alvo = achado;
  }
  return { texto: t, expressao, alvo };
}
