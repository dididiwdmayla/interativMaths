import { describe, expect, it } from "vitest";
import { MISSAO_1 } from "@/conteudo/missoes/m1-carga-igual";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { aplicarEntrada, iniciarExecucao, resolucaoDoPasso, type Efeito, type Execucao } from "./motor";
import type { Atividade, Entrada } from "./tipos";

const ctx = { agora: 1000, conceitoDoEquivoco: (id: string) => (id === "lote-maior-que-cabe" ? "div.partilha" : null) };

function rodar(a: Atividade, entradas: Entrada[], exec?: Execucao) {
  let e = exec ?? iniciarExecucao(a, "guiada");
  const efeitos: Efeito[] = [];
  for (const ent of entradas) {
    const r = aplicarEntrada(a, e, ent, ctx);
    e = r.exec;
    efeitos.push(...r.efeitos);
  }
  return { e, efeitos };
}

const evidencias = (efs: Efeito[]) => efs.flatMap((x) => (x.tipo === "evidencias" ? x.lista : []));
const ATE_OPERAR: Entrada[] = [{ tipo: "seguir" }, { tipo: "responder", valor: null }];

describe("motor de missão", () => {
  it("palpite 'não faço ideia' não gera evidência e não bloqueia", () => {
    const { e, efeitos } = rodar(MISSAO_1, ATE_OPERAR);
    expect(e.indice).toBe(2);
    expect(evidencias(efeitos)).toEqual([]);
    expect(efeitos.find((x) => x.tipo === "palpite")).toMatchObject({ valor: null, certo: "6" });
  });

  it("a escada sobe um degrau por pedido, até 3", () => {
    const { e } = rodar(MISSAO_1, [...ATE_OPERAR, { tipo: "dica" }, { tipo: "dica" }, { tipo: "dica" }, { tipo: "dica" }]);
    expect(e.passo.ajuda).toBe(3);
  });

  it("sucesso com ajuda 1 registra o nível de ajuda", () => {
    const { efeitos } = rodar(MISSAO_1, [
      ...ATE_OPERAR,
      { tipo: "dica" },
      { tipo: "maquina", acao: { tipo: "lote", valor: 6 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
    ]);
    expect(evidencias(efeitos)).toEqual([expect.objectContaining({ conceito: "div.partilha", resultado: "sucesso", ajuda: 1 })]);
  });

  it("resolver junto volta a máquina ao começo, guia ação por ação e marca ajuda 4", () => {
    const meio = rodar(MISSAO_1, [...ATE_OPERAR, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "junto" }]);
    expect(meio.e.passo.junto).toBe(0);
    expect(meio.e.bancada?.atual.bicas[0].pecas).toEqual([]);
    const passo = MISSAO_1.passos[2];
    if (passo.tipo !== "operar") throw new Error("passo errado");
    const acoes = resolucaoDoPasso(passo, meio.e);
    const fim = rodar(MISSAO_1, [...acoes.map((acao) => ({ tipo: "maquina", acao }) as Entrada), { tipo: "fechar" }], meio.e);
    expect(fim.e.passo.junto).toBe(acoes.length);
    const ev = evidencias(fim.efeitos);
    expect(ev).toHaveLength(1);
    expect(ev[0].ajuda).toBe(4);
  });

  it("engasgo na experimentação mostra a medida mas não vira evidência", () => {
    const { efeitos } = rodar(MISSAO_1, [...ATE_OPERAR, { tipo: "maquina", acao: { tipo: "lote", valor: 7 } }, { tipo: "maquina", acao: { tipo: "repartir" } }]);
    expect(efeitos.find((x) => x.tipo === "equivoco")).toMatchObject({ id: "lote-maior-que-cabe", medidas: { pedido: "28", ha: "24", falta: "4" } });
    expect(evidencias(efeitos)).toEqual([]);
  });

  it("fechar cedo vira evidência de falha uma vez só por passo", () => {
    const { efeitos } = rodar(MISSAO_1, [
      ...ATE_OPERAR,
      { tipo: "maquina", acao: { tipo: "lote", valor: 5 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
      { tipo: "fechar" },
    ]);
    const falhas = evidencias(efeitos).filter((x) => x.resultado === "falha");
    expect(falhas).toHaveLength(1);
    expect(falhas[0].equivoco).toBe("parou-cedo");
  });

  it("previsão com 'não sei ainda' gera evidência nao_sei e a máquina confere", () => {
    const ate: Entrada[] = [
      { tipo: "seguir" },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "maquina", acao: { tipo: "partes", valor: 4 } },
      { tipo: "maquina", acao: { tipo: "fatiar", quantidade: 1 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
      { tipo: "seguir" },
      { tipo: "maquina", acao: { tipo: "partes", valor: 4 } },
      { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
      { tipo: "maquina", acao: { tipo: "lote", valor: 3 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
      { tipo: "seguir" },
      { tipo: "responder", valor: null },
    ];
    const { e, efeitos } = rodar(MISSAO_4, ate);
    expect(e.passo.situacao).toBe("conferindo");
    expect(evidencias(efeitos).at(-1)).toMatchObject({ resultado: "nao_sei", conceito: "fra.parte" });
  });
});

describe("mão livre no motor", () => {
  it("na prova direta numa volta só, a mão fica de fora", () => {
    let e = iniciarExecucao(MISSAO_1, "prova");
    e = aplicarEntrada(MISSAO_1, e, { tipo: "seguir" }, ctx).exec;
    const r = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 0 } }, ctx);
    expect(r.exec.bancada?.atual.evento).toEqual({ tipo: "recusa", motivo: "sem-mao-livre" });
  });

  it("no desafio de uma volta só, a mão também fica de fora; fora dele, vale", () => {
    const idx = MISSAO_1.passos.findIndex((p) => p.tipo === "operar" && p.convite !== undefined);
    const passo = MISSAO_1.passos[idx];
    if (passo.tipo !== "operar") throw new Error("passo errado");
    let e: Execucao = { ...iniciarExecucao(MISSAO_1, "guiada") };
    while (e.indice < idx) e = aplicarEntrada(MISSAO_1, e, e.indice === 1 ? { tipo: "responder", valor: null } : { tipo: "seguir" }, ctx).exec;
    const mao = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 0 } }, ctx).exec;
    expect(mao.bancada?.atual.evento).toEqual({ tipo: "colocou", tamanho: "1/1", bica: 0 });
    for (const acao of passo.resolucao) e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao }, ctx).exec;
    e = aplicarEntrada(MISSAO_1, e, { tipo: "fechar" }, ctx).exec;
    e = aplicarEntrada(MISSAO_1, e, { tipo: "convite", aceitar: true }, ctx).exec;
    expect(e.passo.situacao).toBe("convite");
    const r = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 0 } }, ctx);
    expect(r.exec.bancada?.atual.evento).toEqual({ tipo: "recusa", motivo: "sem-mao-livre" });
  });
});
