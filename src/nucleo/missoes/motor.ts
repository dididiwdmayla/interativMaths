/**
 * Motor de atividade: execução + entrada → nova execução + efeitos. Puro e determinístico.
 * A tela aplica os efeitos ao progresso; os testes rodam missões inteiras sem navegador.
 */
import type { Evidencia, NivelAjuda, ResultadoEvidencia } from "../dominio/evidencias";
import {
  bicasAbertas,
  bicasEmUso,
  contarPecas,
  criarBancada,
  operar,
  operarVarias,
  pilhaDe,
  quantidadeDe,
  quantidadeNaBica,
  totalGeral,
} from "../maquinas/bancada/bancada";
import { medir } from "../maquinas/bancada/medidas";
import type { AcaoBancada, Bancada, EstadoBancada } from "../maquinas/bancada/tipos";
import { assinaturaPartilha, ehPartilhaUnitaria, validarBancada, type ResultadoValidacao } from "../maquinas/bancada/validadores";
import { aindaFecha } from "../maquinas/bancada/viabilidade";
import { comoRacional, formatar, igual } from "../racional/racional";
import type { PaginaCaderno } from "../progresso/tipos";
import { conferirResposta } from "./respostas";
import type {
  Atividade,
  Entrada,
  EvidenciaDeclarada,
  Fase,
  MaquinaDoPasso,
  ModoExecucao,
  Passo,
  PassoFrase,
  PassoOperar,
  PassoPrever,
} from "./tipos";

export type SituacaoPasso = "ativo" | "conferindo" | "vencido" | "convite";

export interface EstadoPasso {
  readonly situacao: SituacaoPasso;
  /** Degrau mais alto da escada usado neste passo. */
  readonly ajuda: NivelAjuda;
  /** Tentativas travadas (fechar recusado, engasgo): a postura "disponível" oferece ajuda depois de duas. */
  readonly tentativas: number;
  /** Resolvendo junto: índice da próxima ação da resolução. */
  readonly junto: number | null;
  readonly resposta: string | null | undefined;
  readonly respostaCerta: boolean | null;
  readonly lacunas: Readonly<Record<string, string>>;
  readonly lacunasErradas: readonly string[];
  readonly solucoes: readonly string[];
  readonly ultimo: ResultadoValidacao | null;
  readonly equivocosRegistrados: readonly string[];
  readonly convite: "aberto" | "feito" | null;
  /** A máquina como estava no começo do passo (para resolver junto e conferir). */
  readonly inicio: Bancada | null;
}

export interface Execucao {
  readonly versao: 1;
  readonly atividade: string;
  readonly modo: ModoExecucao;
  readonly indice: number;
  readonly bancada: Bancada | null;
  readonly passo: EstadoPasso;
  /** Frases completadas pelo jogador, por passo. */
  readonly frases: Readonly<Record<string, string>>;
  readonly palpites: Readonly<Record<string, string | null>>;
  readonly concluida: boolean;
  /** Equívocos vistos nesta execução, em ordem (para o tutor futuro). */
  readonly equivocos: readonly string[];
}

export type Efeito =
  | { readonly tipo: "evidencias"; readonly lista: readonly Evidencia[] }
  | { readonly tipo: "palpite"; readonly passo: string; readonly valor: string | null; readonly certo: string }
  | { readonly tipo: "equivoco"; readonly id: string; readonly medidas: Readonly<Record<string, string>> }
  | { readonly tipo: "resultado"; readonly resultado: ResultadoValidacao }
  | { readonly tipo: "pagina"; readonly pagina: PaginaCaderno }
  | { readonly tipo: "marca"; readonly id: string }
  | { readonly tipo: "concluida"; readonly via: "guiada" | "prova" | "registro" }
  | { readonly tipo: "joia"; readonly id: string };

export interface ContextoMotor {
  readonly agora: number;
  /** Para onde vai a suspeita de cada equívoco (o pré-requisito). */
  readonly conceitoDoEquivoco: (id: string) => string | null;
}

const TETO_HISTORICO_SALVO = 24;

/* ---------- Passos ---------- */

export function passosDoModo(a: Atividade, modo: ModoExecucao): readonly Passo[] {
  if (modo === "prova") return a.prova ?? [];
  if (modo === "registro") return a.passos.filter((p) => p.fase === "formalizacao");
  return a.passos;
}

export function passoAtual(a: Atividade, e: Execucao): Passo | null {
  return passosDoModo(a, e.modo)[e.indice] ?? null;
}

function passoNovo(inicio: Bancada | null): EstadoPasso {
  return {
    situacao: "ativo",
    ajuda: 0,
    tentativas: 0,
    junto: null,
    resposta: undefined,
    respostaCerta: null,
    lacunas: {},
    lacunasErradas: [],
    solucoes: [],
    ultimo: null,
    equivocosRegistrados: [],
    convite: null,
    inicio,
  };
}

export function montarMaquina(m: MaquinaDoPasso): Bancada {
  const b = operarVarias(criarBancada(m.config), m.acoes ?? []);
  return { atual: { ...b.atual, evento: null }, passado: [] };
}

/** Máquina com que um passo começa: a dele, ou a que vem do passo anterior. */
function maquinaDoPasso(passos: readonly Passo[], indice: number, anterior: Bancada | null): Bancada | null {
  const p = passos[indice];
  if (p?.maquina) return montarMaquina(p.maquina);
  return anterior;
}

function prepararPasso(a: Atividade, e: Execucao, indice: number): Execucao {
  const passos = passosDoModo(a, e.modo);
  const bancada = maquinaDoPasso(passos, indice, e.bancada);
  return { ...e, indice, bancada, passo: passoNovo(bancada) };
}

/** Começa uma execução. No modo registro, o primeiro passo de formalização traz a própria máquina. */
export function iniciarExecucao(a: Atividade, modo: ModoExecucao): Execucao {
  const base: Execucao = {
    versao: 1,
    atividade: a.id,
    modo,
    indice: 0,
    bancada: null,
    passo: passoNovo(null),
    frases: {},
    palpites: {},
    concluida: false,
    equivocos: [],
  };
  return prepararPasso(a, base, 0);
}

/* ---------- Medidas vivas para as dicas ---------- */

export function medidasVivas(e: EstadoBancada | null): Record<string, string> {
  if (!e) return {};
  const abertas = bicasAbertas(e).length;
  const uso = bicasEmUso(e);
  const pilha = pilhaDe(e.esteira, e.pilha);
  const pedido = e.lote * abertas;
  const ha = pilha?.quantidade ?? 0;
  return {
    lote: String(e.lote),
    abertas: String(abertas),
    emUso: String(uso.length),
    pedido: String(pedido),
    ha: String(ha),
    falta: String(Math.max(0, pedido - ha)),
    sobra: formatar(quantidadeDe(e.esteira), { misto: true }),
    cada: uso.length > 0 ? formatar(quantidadeNaBica(e.bicas[uso[0]]), { misto: true }) : "0",
    total: formatar(totalGeral(e), { misto: true }),
    pecas: String(contarPecas(e.esteira)),
  };
}

export function preencher(modelo: string, valores: Readonly<Record<string, string>>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => valores[k] ?? `{${k}}`);
}

/* ---------- Evidências ---------- */

function evidencias(
  a: Atividade,
  declaradas: readonly EvidenciaDeclarada[] | undefined,
  resultado: ResultadoEvidencia,
  ajuda: NivelAjuda,
  ctx: ContextoMotor,
  equivoco?: string,
): Evidencia[] {
  return (declaradas ?? []).map((d) => ({
    conceito: d.conceito,
    tipo: d.tipo,
    resultado,
    ajuda,
    contexto: a.id,
    momento: ctx.agora,
    ...(equivoco ? { equivoco } : {}),
  }));
}

/** Falha com equívoco: a suspeita vai para o conceito do equívoco (o pré-requisito, se for o caso). */
function evidenciaDeFalha(
  a: Atividade,
  p: Passo,
  equivoco: string,
  tipo: Evidencia["tipo"],
  ajuda: NivelAjuda,
  ctx: ContextoMotor,
): Evidencia[] {
  const conceito = ctx.conceitoDoEquivoco(equivoco) ?? p.evidencias?.[0]?.conceito ?? a.conceitos[0];
  if (!conceito) return [];
  return [{ conceito, tipo, resultado: "falha", ajuda, contexto: a.id, equivoco, momento: ctx.agora }];
}

/** Erros de exploração não viram evidência; erros de conclusão e de previsão sim. */
function faseRegistraExploracao(f: Fase): boolean {
  return f === "aplicacao" || f === "descoberta" || f === "retencao";
}

/* ---------- Avançar ---------- */

function avancar(a: Atividade, e: Execucao, efeitos: Efeito[]): { exec: Execucao; efeitos: Efeito[] } {
  const passos = passosDoModo(a, e.modo);
  const prox = e.indice + 1;
  if (prox >= passos.length) {
    efeitos.push({ tipo: "concluida", via: e.modo });
    if (a.joia && e.modo !== "registro") efeitos.push({ tipo: "joia", id: a.joia });
    return { exec: { ...e, concluida: true, indice: prox }, efeitos };
  }
  return { exec: prepararPasso(a, e, prox), efeitos };
}

function comPasso(e: Execucao, mudancas: Partial<EstadoPasso>): Execucao {
  return { ...e, passo: { ...e.passo, ...mudancas } };
}

function aparar(b: Bancada): Bancada {
  return b.passado.length > TETO_HISTORICO_SALVO ? { ...b, passado: b.passado.slice(-TETO_HISTORICO_SALVO) } : b;
}

/* ---------- Entradas ---------- */

export function aplicarEntrada(
  a: Atividade,
  e: Execucao,
  entrada: Entrada,
  ctx: ContextoMotor,
): { exec: Execucao; efeitos: Efeito[] } {
  const efeitos: Efeito[] = [];
  const p = passoAtual(a, e);
  if (!p || e.concluida) return { exec: e, efeitos };

  if (entrada.tipo === "dica") {
    if (e.passo.situacao !== "ativo" && e.passo.situacao !== "convite") return { exec: e, efeitos };
    const nivel = Math.min(3, e.passo.ajuda + 1) as NivelAjuda;
    return { exec: comPasso(e, { ajuda: Math.max(e.passo.ajuda, nivel) as NivelAjuda }), efeitos };
  }

  if (entrada.tipo === "junto") return resolverJunto(a, e, p, efeitos);

  switch (p.tipo) {
    case "narrativa":
    case "notacao":
      if (entrada.tipo === "seguir") return avancar(a, e, efeitos);
      return { exec: e, efeitos };

    case "palpite":
      if (entrada.tipo === "responder") {
        efeitos.push({ tipo: "palpite", passo: p.id, valor: entrada.valor, certo: p.certo });
        return avancar(a, { ...e, palpites: { ...e.palpites, [p.id]: entrada.valor } }, efeitos);
      }
      return { exec: e, efeitos };

    case "operar":
      return entradaOperar(a, e, p, entrada, ctx, efeitos);

    case "prever":
      return entradaPrever(a, e, p, entrada, ctx, efeitos);

    case "frase":
      return entradaFrase(a, e, p, entrada, efeitos);

    case "registro":
      if (entrada.tipo === "seguir") {
        const frase = p.pagina.frase ?? Object.values(e.frases).at(-1) ?? "";
        efeitos.push({
          tipo: "pagina",
          pagina: {
            id: p.pagina.id,
            atividade: a.id,
            titulo: p.pagina.titulo,
            frase,
            notacao: p.pagina.notacao,
            volta: p.pagina.volta ?? null,
            notas: p.pagina.notas,
            maquina: e.passo.inicio?.atual ?? null,
            registradaEm: ctx.agora,
          },
        });
        return avancar(a, e, efeitos);
      }
      return { exec: e, efeitos };
  }
}

function resolverJunto(a: Atividade, e: Execucao, p: Passo, efeitos: Efeito[]): { exec: Execucao; efeitos: Efeito[] } {
  if (e.passo.situacao !== "ativo") return { exec: e, efeitos };
  if (p.tipo === "operar") {
    return { exec: { ...comPasso(e, { ajuda: 4, junto: 0 }), bancada: e.passo.inicio }, efeitos };
  }
  if (p.tipo === "frase" && e.bancada) {
    const lacunas: Record<string, string> = {};
    for (const l of p.lacunas) lacunas[l.id] = formatar(medir(e.bancada.atual, l.medida), { misto: true });
    return { exec: comPasso(e, { ajuda: 4, lacunas }), efeitos };
  }
  return { exec: comPasso(e, { ajuda: 4 }), efeitos };
}

function entradaOperar(
  a: Atividade,
  e: Execucao,
  p: PassoOperar,
  entrada: Entrada,
  ctx: ContextoMotor,
  efeitos: Efeito[],
): { exec: Execucao; efeitos: Efeito[] } {
  const sit = e.passo.situacao;
  if (entrada.tipo === "seguir") {
    if (sit === "vencido") return avancar(a, e, efeitos);
    return { exec: e, efeitos };
  }
  if (entrada.tipo === "convite") {
    if (sit !== "vencido" || !p.convite || e.passo.convite !== null) return { exec: e, efeitos };
    if (!entrada.aceitar) return avancar(a, e, efeitos);
    return { exec: { ...comPasso(e, { situacao: "convite", convite: "aberto", ultimo: null }), bancada: e.passo.inicio }, efeitos };
  }
  if (!e.bancada) return { exec: e, efeitos };

  if (entrada.tipo === "maquina") {
    if (sit === "vencido") return { exec: e, efeitos };
    const antes = e.bancada;
    const depois = aparar(operar(antes, entrada.acao));
    let exec: Execucao = { ...e, bancada: depois };
    const ev = depois.atual.evento;
    if (ev?.tipo === "engasgo") {
      const medidas = { lote: String(ev.lote), abertas: String(ev.abertas), pedido: String(ev.pedido), ha: String(ev.ha), falta: String(ev.pedido - ev.ha) };
      efeitos.push({ tipo: "equivoco", id: "lote-maior-que-cabe", medidas });
      exec = registrarEquivoco(a, exec, p, "lote-maior-que-cabe", faseRegistraExploracao(p.fase), ctx, efeitos);
      exec = comPasso(exec, { tentativas: exec.passo.tentativas + 1 });
    }
    if (ev?.tipo === "fatia" && aindaFecha(antes.atual) === true && aindaFecha(depois.atual) === false) {
      const medidas = { partes: String(ev.partes), pedacos: String(ev.quantidade * ev.partes), bicas: String(bicasEmUso(depois.atual).length) };
      efeitos.push({ tipo: "equivoco", id: "corte-que-nao-fecha", medidas });
      exec = registrarEquivoco(a, exec, p, "corte-que-nao-fecha", faseRegistraExploracao(p.fase), ctx, efeitos);
      exec = comPasso(exec, { tentativas: exec.passo.tentativas + 1 });
    }
    // Resolver junto: andou um passo da resolução?
    const j = exec.passo.junto;
    const resolucao = resolucaoDoPasso(p, e);
    if (j !== null && resolucao[j] && JSON.stringify(resolucao[j]) === JSON.stringify(entrada.acao)) {
      exec = comPasso(exec, { junto: j + 1 });
    }
    return { exec, efeitos };
  }

  if (entrada.tipo === "fechar") {
    if (sit === "vencido") return { exec: e, efeitos };
    const objetivo = sit === "convite" && p.convite ? p.convite.objetivo : p.objetivo;
    const r = validarBancada(objetivo.validador, objetivo.params ?? {}, e.bancada.atual, { solucoes: e.passo.solucoes });
    efeitos.push({ tipo: "resultado", resultado: r });
    if (r.ok) {
      const fechada = operar(e.bancada, { tipo: "fechar" });
      if (sit === "convite") {
        efeitos.push({ tipo: "evidencias", lista: evidencias(a, p.convite?.evidencias, "sucesso", e.passo.ajuda, ctx) });
        return { exec: { ...comPasso(e, { situacao: "vencido", convite: "feito", ultimo: r }), bancada: fechada }, efeitos };
      }
      efeitos.push({ tipo: "evidencias", lista: evidencias(a, p.evidencias, "sucesso", e.passo.ajuda, ctx) });
      const assinaturas = r.assinatura ? [...e.passo.solucoes, r.assinatura] : e.passo.solucoes;
      if (p.marcaUnitaria && ehPartilhaUnitaria(e.bancada.atual)) efeitos.push({ tipo: "marca", id: p.marcaUnitaria });
      return { exec: { ...comPasso(e, { situacao: "vencido", ultimo: r, solucoes: assinaturas }), bancada: fechada }, efeitos };
    }
    if (r.parcial && r.assinatura) {
      // Uma solução aceita, falta outra diferente: a máquina recomeça.
      if (p.marcaUnitaria && ehPartilhaUnitaria(e.bancada.atual)) efeitos.push({ tipo: "marca", id: p.marcaUnitaria });
      return {
        exec: {
          ...comPasso(e, { solucoes: [...e.passo.solucoes, r.assinatura], ultimo: r, junto: e.passo.junto === null ? null : 0 }),
          bancada: e.passo.inicio,
        },
        efeitos,
      };
    }
    let exec = comPasso(e, { ultimo: r, tentativas: e.passo.tentativas + 1 });
    if (r.equivoco) {
      efeitos.push({ tipo: "equivoco", id: r.equivoco, medidas: r.medidas });
      exec = registrarEquivoco(a, exec, p, r.equivoco, true, ctx, efeitos);
    }
    return { exec, efeitos };
  }
  return { exec: e, efeitos };
}

function registrarEquivoco(
  a: Atividade,
  e: Execucao,
  p: Passo,
  id: string,
  geraEvidencia: boolean,
  ctx: ContextoMotor,
  efeitos: Efeito[],
): Execucao {
  const ja = e.passo.equivocosRegistrados.includes(id);
  const exec: Execucao = { ...e, equivocos: [...e.equivocos, id].slice(-12) };
  if (ja) return exec;
  if (geraEvidencia) {
    const tipo = p.fase === "aplicacao" ? "aplicacao" : p.fase === "descoberta" ? "descoberta" : p.fase === "retencao" ? "revisita" : "experimento";
    const lista = evidenciaDeFalha(a, p, id, p.evidencias?.[0]?.tipo ?? tipo, e.passo.ajuda, ctx);
    if (lista.length > 0) efeitos.push({ tipo: "evidencias", lista });
  }
  return comPasso(exec, { equivocosRegistrados: [...e.passo.equivocosRegistrados, id] });
}

/**
 * A resolução que o "resolver junto" segue: a primeira que leva a uma partilha ainda não feita
 * neste passo (importa quando o passo pede soluções distintas).
 */
export function resolucaoDoPasso(p: PassoOperar, e: Execucao): readonly AcaoBancada[] {
  const opcoes = [p.resolucao, ...(p.alternativas ?? [])];
  const inicio = e.passo.inicio;
  if (!inicio || e.passo.solucoes.length === 0) return opcoes[0];
  for (const acoes of opcoes) {
    const final = operarVarias(inicio, acoes);
    if (!e.passo.solucoes.includes(assinaturaPartilha(final.atual))) return acoes;
  }
  return opcoes[0];
}

/** O que a máquina mostra ao conferir uma previsão. */
export function conferirPrevisao(p: PassoPrever, inicio: Bancada): { final: Bancada; esperado: string } {
  let final = operarVarias(inicio, p.demonstracao);
  if (p.medida && !final.atual.fechada) final = operar(final, { tipo: "fechar" });
  if (p.esperado !== undefined) return { final, esperado: p.esperado };
  const valor = medir(final.atual, p.medida ?? "carga-por-bica");
  return { final, esperado: formatar(valor) };
}

function entradaPrever(
  a: Atividade,
  e: Execucao,
  p: PassoPrever,
  entrada: Entrada,
  ctx: ContextoMotor,
  efeitos: Efeito[],
): { exec: Execucao; efeitos: Efeito[] } {
  if (entrada.tipo === "seguir") {
    if (e.passo.situacao === "conferindo") return avancar(a, e, efeitos);
    return { exec: e, efeitos };
  }
  if (entrada.tipo !== "responder" || e.passo.situacao !== "ativo" || !e.passo.inicio) return { exec: e, efeitos };
  const { final, esperado } = conferirPrevisao(p, e.passo.inicio);
  const opcao = p.resposta.tipo === "opcoes";
  const c = conferirResposta(entrada.valor, opcao ? esperado : comoRacional(esperado), {
    aceitaEquivalente: p.aceitaEquivalente ?? true,
    respostasEquivoco: p.respostasEquivoco,
    opcao,
  });
  const ajuda = e.passo.ajuda;
  let exec: Execucao = { ...comPasso(e, { situacao: "conferindo", resposta: entrada.valor, respostaCerta: c.certa }), bancada: final };
  if (c.naoSei) {
    efeitos.push({ tipo: "evidencias", lista: evidencias(a, p.evidencias, "nao_sei", ajuda, ctx) });
  } else if (c.certa) {
    efeitos.push({ tipo: "evidencias", lista: evidencias(a, p.evidencias, "sucesso", ajuda, ctx) });
  } else if (c.equivoco) {
    efeitos.push({ tipo: "equivoco", id: c.equivoco, medidas: { resposta: entrada.valor ?? "", certa: esperado } });
    exec = registrarEquivoco(a, exec, p, c.equivoco, true, ctx, efeitos);
  } else {
    efeitos.push({ tipo: "evidencias", lista: evidencias(a, p.evidencias, "falha", ajuda, ctx) });
  }
  return { exec, efeitos };
}

function entradaFrase(
  a: Atividade,
  e: Execucao,
  p: PassoFrase,
  entrada: Entrada,
  efeitos: Efeito[],
): { exec: Execucao; efeitos: Efeito[] } {
  if (entrada.tipo === "seguir") {
    if (e.passo.situacao === "vencido") return avancar(a, e, efeitos);
    return { exec: e, efeitos };
  }
  if (e.passo.situacao !== "ativo") return { exec: e, efeitos };
  if (entrada.tipo === "lacuna") {
    const lacunas = { ...e.passo.lacunas, [entrada.lacuna]: entrada.valor };
    return { exec: comPasso(e, { lacunas, lacunasErradas: e.passo.lacunasErradas.filter((x) => x !== entrada.lacuna) }), efeitos };
  }
  if (entrada.tipo === "conferir" && e.bancada) {
    const estado = e.bancada.atual;
    const erradas = p.lacunas
      .filter((l) => {
        const v = e.passo.lacunas[l.id];
        if (v === undefined) return true;
        try {
          return !igual(comoRacional(v), medir(estado, l.medida));
        } catch {
          return true;
        }
      })
      .map((l) => l.id);
    if (erradas.length > 0) {
      return { exec: comPasso(e, { lacunasErradas: erradas, tentativas: e.passo.tentativas + 1 }), efeitos };
    }
    const frase = preencher(p.frase, e.passo.lacunas);
    return { exec: { ...comPasso(e, { situacao: "vencido", lacunasErradas: [] }), frases: { ...e.frases, [p.id]: frase } }, efeitos };
  }
  return { exec: e, efeitos };
}

/** Valores das fichas de uma frase (as cotas da máquina parada). */
export function valoresDasFichas(p: PassoFrase, e: EstadoBancada): { medida: string; valor: string }[] {
  const vistos = new Set<string>();
  const saida: { medida: string; valor: string }[] = [];
  for (const m of p.fichas) {
    const valor = formatar(medir(e, m), { misto: true });
    const chaveFicha = `${m}:${valor}`;
    if (vistos.has(chaveFicha)) continue;
    vistos.add(chaveFicha);
    saida.push({ medida: m, valor });
  }
  return saida;
}
