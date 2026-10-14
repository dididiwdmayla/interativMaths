import { describe, expect, it } from "vitest";
import { MISSAO_1 } from "@/conteudo/missoes/m1-carga-igual";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { aplicarEntrada, iniciarExecucao, passoAtual, resolucaoDoPasso, type Efeito, type Execucao } from "./motor";
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
const ATE_PALPITE: Entrada[] = [{ tipo: "seguir" }, { tipo: "responder", valor: null }];
const MAO: Entrada[] = [0, 1, 2, 3].map((bica) => ({ tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica } }));
/** Até o passo "repartir" da missão 1: palpite, uma saca em cada carroça à mão (20 na esteira). */
const ATE_OPERAR: Entrada[] = [...ATE_PALPITE, ...MAO, { tipo: "seguir" }];

/** Vence os passos até chegar ao pedido, pelo caminho do motor. */
function ate(a: Atividade, idPasso: string): Execucao {
  let e = iniciarExecucao(a, "guiada");
  const enviar = (x: Entrada) => (e = aplicarEntrada(a, e, x, ctx).exec);
  for (let i = 0; i < 40 && passoAtual(a, e)?.id !== idPasso; i++) {
    const p = passoAtual(a, e);
    if (p?.tipo === "palpite") enviar({ tipo: "responder", valor: null });
    else if (p?.tipo === "operar" || p?.tipo === "aposta") {
      for (const acao of p.resolucao) enviar({ tipo: "maquina", acao });
      if (p.tipo === "operar" && !p.automatico) enviar({ tipo: "fechar" });
      if (p.tipo === "aposta") enviar({ tipo: "responder", valor: p.esperado });
      enviar({ tipo: "seguir" });
    } else if (p?.tipo === "prever") {
      enviar({ tipo: "responder", valor: null });
      enviar({ tipo: "seguir" });
    } else enviar({ tipo: "seguir" });
  }
  return e;
}

describe("motor de missão", () => {
  it("palpite 'não faço ideia' não gera evidência e não bloqueia", () => {
    const { e, efeitos } = rodar(MISSAO_1, ATE_PALPITE);
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
      { tipo: "maquina", acao: { tipo: "lote", valor: 5 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
    ]);
    expect(evidencias(efeitos)).toEqual([expect.objectContaining({ conceito: "div.partilha", resultado: "sucesso", ajuda: 1 })]);
  });

  it("resolver junto volta a máquina ao começo, guia ação por ação e marca ajuda 4", () => {
    const meio = rodar(MISSAO_1, [...ATE_OPERAR, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "junto" }]);
    expect(meio.e.passo.junto).toBe(0);
    expect(meio.e.bancada?.atual.bicas[0].pecas).toEqual([{ tamanho: { n: 1, d: 1 }, quantidade: 1 }]);
    const passo = MISSAO_1.passos[3];
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
    expect(efeitos.find((x) => x.tipo === "equivoco")).toMatchObject({ id: "lote-maior-que-cabe", medidas: { pedido: "28", ha: "20", falta: "8" } });
    expect(evidencias(efeitos)).toEqual([]);
  });

  it("fechar cedo vira evidência de falha uma vez só por passo", () => {
    const { efeitos } = rodar(MISSAO_1, [
      ...ATE_OPERAR,
      { tipo: "maquina", acao: { tipo: "lote", valor: 4 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
      { tipo: "fechar" },
    ]);
    const falhas = evidencias(efeitos).filter((x) => x.resultado === "falha");
    expect(falhas).toHaveLength(1);
    expect(falhas[0].equivoco).toBe("parou-cedo");
  });

  it("previsão com 'não sei ainda' gera evidência nao_sei e a máquina confere", () => {
    const { e, efeitos } = rodar(MISSAO_4, [{ tipo: "responder", valor: null }], ate(MISSAO_4, "duas-tres"));
    expect(e.passo.situacao).toBe("conferindo");
    expect(evidencias(efeitos).at(-1)).toMatchObject({ resultado: "nao_sei", conceito: "fra.quociente" });
  });
});

describe("aposta e passo automático", () => {
  it("o passo da mão vence sozinho no quarto toque, sem fechar a máquina", () => {
    const { e, efeitos } = rodar(MISSAO_1, [...ATE_PALPITE, ...MAO]);
    expect(e.passo.situacao).toBe("vencido");
    expect(e.passo.retorno).toBe("acertou");
    expect(e.bancada?.atual.fechada).toBe(false);
    expect(efeitos.some((x) => x.tipo === "resultado")).toBe(true);
    const seguinte = rodar(MISSAO_1, [{ tipo: "seguir" }], e).e;
    expect(passoAtual(MISSAO_1, seguinte)?.id).toBe("repartir");
    expect(seguinte.bancada?.atual.esteira[0].quantidade).toBe(20);
  });

  it("a pergunta da aposta só destrava com a prova na máquina", () => {
    const inicio = ate(MISSAO_4, "comparar");
    const cedo = rodar(MISSAO_4, [{ tipo: "responder", valor: "empate" }], inicio);
    expect(cedo.e).toBe(inicio);
    const p = passoAtual(MISSAO_4, inicio);
    if (p?.tipo !== "aposta") throw new Error("passo errado");
    const prova = rodar(MISSAO_4, p.resolucao.map((acao) => ({ tipo: "maquina", acao }) as Entrada), inicio).e;
    expect(prova.passo.cumprido).toBe(true);
    const errou = rodar(MISSAO_4, [{ tipo: "responder", valor: "mesa-a" }], prova);
    expect(errou.e.passo.retorno).toBe("ainda-nao");
    expect(errou.efeitos.find((x) => x.tipo === "equivoco")).toMatchObject({ id: "conta-pedacos" });
    const certo = rodar(MISSAO_4, [{ tipo: "responder", valor: "empate" }], errou.e);
    expect(certo.e.passo.situacao).toBe("vencido");
    expect(certo.e.passo.retorno).toBe("acertou");
    expect(evidencias(certo.efeitos)).toMatchObject([{ resultado: "sucesso", ajuda: 1 }]);
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
    const passo = MISSAO_1.passos.find((p) => p.tipo === "operar" && p.convite !== undefined);
    if (passo?.tipo !== "operar") throw new Error("passo errado");
    let e = ate(MISSAO_1, passo.id);
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

describe("retorno: acertou e ainda não", () => {
  const ateOperar = (a: Atividade) => ate(a, "repartir");

  it("fechar recusado deixa ainda não; o gesto seguinte volta a neutro", () => {
    let e = ateOperar(MISSAO_1);
    e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "lote", valor: 4 } }, ctx).exec;
    e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "repartir" } }, ctx).exec;
    e = aplicarEntrada(MISSAO_1, e, { tipo: "fechar" }, ctx).exec;
    expect(e.passo.retorno).toBe("ainda-nao");
    e = aplicarEntrada(MISSAO_1, e, { tipo: "dica" }, ctx).exec;
    expect(e.passo.retorno).toBe("ainda-nao");
    e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "lote", valor: 1 } }, ctx).exec;
    expect(e.passo.retorno).toBeNull();
  });

  it("fechar aceito deixa acertou enquanto o passo está vencido", () => {
    let e = ateOperar(MISSAO_1);
    const p = passoAtual(MISSAO_1, e);
    if (p?.tipo !== "operar") throw new Error("passo errado");
    for (const acao of p.resolucao) e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao }, ctx).exec;
    e = aplicarEntrada(MISSAO_1, e, { tipo: "fechar" }, ctx).exec;
    expect(e.passo.situacao).toBe("vencido");
    expect(e.passo.retorno).toBe("acertou");
    e = aplicarEntrada(MISSAO_1, e, { tipo: "maquina", acao: { tipo: "lote", valor: 2 } }, ctx).exec;
    expect(e.passo.retorno).toBe("acertou");
    e = aplicarEntrada(MISSAO_1, e, { tipo: "seguir" }, ctx).exec;
    expect(e.passo.retorno).toBeNull();
  });
});

describe("previsão com segunda chance", () => {
  const prever: Atividade = {
    id: "teste.prever",
    tipo: "eco",
    distrito: "partilha",
    titulo: "t",
    ideia: "t",
    conceitos: ["div.partilha"],
    passos: [
      {
        id: "p",
        tipo: "prever",
        fase: "descoberta",
        pedido: "p",
        instrucao: "Responda quantas sacas vão em cada carroça.",
        maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 3, ajustavel: false } } },
        pergunta: "?",
        resposta: { tipo: "numero", minimo: 0, maximo: 12 },
        medida: "carga-por-bica",
        demonstracao: [{ tipo: "lote", valor: 4 }, { tipo: "repartir" }],
        evidencias: [{ conceito: "div.partilha", tipo: "descoberta" }],
      },
    ],
    solucoesDeTeste: [],
    sabotagens: [],
  };

  it("primeira resposta que não bate: ainda não, sem a máquina conferir; a segunda certa vale com ajuda 1", () => {
    const r1 = rodar(prever, [{ tipo: "responder", valor: "3" }]);
    expect(r1.e.passo.situacao).toBe("ativo");
    expect(r1.e.passo.retorno).toBe("ainda-nao");
    expect(evidencias(r1.efeitos)).toMatchObject([{ resultado: "falha" }]);
    const r2 = rodar(prever, [{ tipo: "responder", valor: "4" }], r1.e);
    expect(r2.e.passo.situacao).toBe("conferindo");
    expect(r2.e.passo.retorno).toBe("acertou");
    expect(evidencias(r2.efeitos)).toMatchObject([{ resultado: "sucesso", ajuda: 1 }]);
  });

  it("duas que não batem: a máquina confere e mostra; falha registrada uma vez", () => {
    const r = rodar(prever, [{ tipo: "responder", valor: "3" }, { tipo: "responder", valor: "5" }]);
    expect(r.e.passo.situacao).toBe("conferindo");
    expect(r.e.passo.retorno).toBe("ainda-nao");
    expect(evidencias(r.efeitos).filter((x) => x.resultado === "falha")).toHaveLength(1);
  });

  it("na sondagem não há segunda chance: ela só mede", () => {
    const sondagem: Atividade = { ...prever, tipo: "sondagem" };
    const r = rodar(sondagem, [{ tipo: "responder", valor: "3" }]);
    expect(r.e.passo.situacao).toBe("conferindo");
  });
});
