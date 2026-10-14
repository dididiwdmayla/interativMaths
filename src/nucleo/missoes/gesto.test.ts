import { describe, expect, it } from "vitest";
import { MISSAO_1 } from "@/conteudo/missoes/m1-carga-igual";
import { MISSAO_3 } from "@/conteudo/missoes/m3-sobrou";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { DEGUSTACAO } from "@/conteudo/degustacao";
import { GESTOS } from "@/conteudo/gestos";
import { PELES } from "@/conteudo/peles";
import { TEXTOS_REACAO } from "@/conteudo/reacoes";
import { proximoGesto } from "./gesto";
import { segredos } from "./segredos";
import { aplicarEntrada, iniciarExecucao, palpiteDoPasso, passoAtual, type Execucao } from "./motor";
import type { Atividade, Entrada } from "./tipos";

const ctxMotor = { agora: 1, conceitoDoEquivoco: () => null };

/** Vence os passos até chegar ao pedido, pelo caminho do motor. */
function ate(a: Atividade, idPasso: string, depois: Entrada[] = []): Execucao {
  let e = iniciarExecucao(a, "guiada");
  const enviar = (x: Entrada) => (e = aplicarEntrada(a, e, x, ctxMotor).exec);
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
    } else if (p?.tipo === "frase") {
      enviar({ tipo: "junto" });
      enviar({ tipo: "conferir" });
      enviar({ tipo: "seguir" });
    } else enviar({ tipo: "seguir" });
  }
  for (const d of depois) e = aplicarEntrada(a, e, d, ctxMotor).exec;
  return e;
}

function gesto(a: Atividade, e: Execucao) {
  const p = passoAtual(a, e);
  if (!p) throw new Error("sem passo");
  return proximoGesto(p, e, { textos: GESTOS, reacoes: TEXTOS_REACAO, pele: e.bancada ? PELES[e.bancada.atual.config.pele] : null });
}

const maq = (acao: Extract<Entrada, { tipo: "maquina" }>["acao"]): Entrada => ({ tipo: "maquina", acao });

describe("próximo gesto", () => {
  it("nada nas mesas e as inteiras dão uma volta: a mão ou a alavanca", () => {
    expect(gesto(MISSAO_4, ate(MISSAO_4, "cinco-broas")).texto).toBe("Agora: ponha uma broa em cada mesa, ou use Repartir.");
  });

  it("sobrou peça que não dá volta inteira, e há fatiador: escolher em quantas partes (sem dizer quantas)", () => {
    const g = gesto(MISSAO_4, ate(MISSAO_4, "cinco-broas", [maq({ tipo: "repartir" })]));
    expect(g.texto).toBe("Agora: toque na peça que sobrou e escolha em quantas partes cortar.");
    expect(g.alvo).toBe("fatiador");
  });

  it("nada repartido e as inteiras não dão uma para cada: cortar, sem falar em sobra", () => {
    expect(gesto(MISSAO_4, ate(MISSAO_4, "tres-broas")).texto).toBe("Agora: toque numa peça e escolha em quantas partes cortar.");
  });

  it("pedaços na esteira: pôr nas mesas ou repartir", () => {
    const e = ate(MISSAO_4, "cinco-broas", [maq({ tipo: "repartir" }), maq({ tipo: "cortar", tamanho: "1/1", partes: 4 })]);
    expect(gesto(MISSAO_4, e).texto).toBe("Agora: ponha os pedaços nas mesas, ou use Repartir.");
  });

  it("esteira vazia e partilha não fechada: fechar", () => {
    const e = ate(MISSAO_1, "repartir", [maq({ tipo: "lote", valor: 5 }), maq({ tipo: "repartir" })]);
    expect(gesto(MISSAO_1, e).texto).toBe("Agora: feche a partilha.");
  });

  it("sobra que não dá volta e sem fatiador: fechar", () => {
    const e = ate(MISSAO_3, "repartir", [maq({ tipo: "lote", valor: 6 }), maq({ tipo: "repartir" })]);
    expect(gesto(MISSAO_3, e).texto).toBe("Agora: feche a partilha.");
  });

  it("o passo da mão: uma de cada vez, e devolver o que passou", () => {
    expect(gesto(MISSAO_1, ate(MISSAO_1, "a-mao")).texto).toBe("Agora: toque numa saca, depois numa carroça.");
    const passou = ate(MISSAO_1, "a-mao", [maq({ tipo: "colocar", tamanho: "1/1", bica: 1 }), maq({ tipo: "colocar", tamanho: "1/1", bica: 1 })]);
    expect(gesto(MISSAO_1, passou)).toMatchObject({ texto: "Agora: devolva o que passou na carroça 2: toque na peça.", alvo: "bica:1" });
  });

  it("aposta: tirar a prova com o gesto do passo; cumprida, responder", () => {
    const e = ate(MISSAO_4, "comparar");
    expect(gesto(MISSAO_4, e).texto).toBe("Corte uma broa em 8 e outra em 4. Arraste 2 oitavos para a mesa A e 1 quarto para a mesa B.");
    const p = passoAtual(MISSAO_4, e);
    if (p?.tipo !== "aposta") throw new Error("passo errado");
    const prova = p.resolucao.reduce((x, acao) => aplicarEntrada(MISSAO_4, x, maq(acao), ctxMotor).exec, e);
    expect(gesto(MISSAO_4, prova).texto).toBe("Agora: escolha a resposta e toque em Mostrar ao Nônio.");
  });

  it("ainda cabe volta: repartir, ou pôr mais uma em cada", () => {
    const e = ate(MISSAO_1, "repartir", [maq({ tipo: "repartir" })]);
    expect(gesto(MISSAO_1, e).texto).toBe("Agora: toque em Repartir, ou ponha mais uma em cada carroça.");
  });

  it("engasgo: diminuir o lote, com a medida", () => {
    const e = ate(MISSAO_1, "repartir", [maq({ tipo: "lote", valor: 7 }), maq({ tipo: "repartir" })]);
    expect(gesto(MISSAO_1, e).texto).toBe("Agora: diminua o lote. A volta pede 28; há 20.");
  });

  it("corte que não fecha mais: desfazer", () => {
    const e = ate(MISSAO_4, "cinco-broas", [maq({ tipo: "repartir" }), maq({ tipo: "cortar", tamanho: "1/1", partes: 3 })]);
    expect(gesto(MISSAO_4, e).texto).toBe("Esse corte não fecha. Desfaça e tente outro.");
  });

  it("depois do ainda não, diz o que tentar", () => {
    const e = ate(MISSAO_1, "repartir", [maq({ tipo: "lote", valor: 4 }), maq({ tipo: "repartir" }), { tipo: "fechar" }]);
    expect(gesto(MISSAO_1, e)).toMatchObject({ tom: "tentar", texto: "Agora: reparta o que ainda está na esteira." });
  });

  it("depois do acerto, vira o resumo verde com os números", () => {
    const e = ate(MISSAO_4, "cinco-broas", [maq({ tipo: "repartir" }), maq({ tipo: "cortar", tamanho: "1/1", partes: 4 }), maq({ tipo: "repartir" }), { tipo: "fechar" }]);
    expect(gesto(MISSAO_4, e)).toMatchObject({ tom: "resumo", texto: "Fechou: uma broa e mais um quarto em cada mesa." });
  });

  it("previsão: escolher e conferir; depois do ainda não, trocar e conferir de novo", () => {
    expect(gesto(MISSAO_1, ate(MISSAO_1, "trinta")).texto).toBe("Agora: ajuste o número e toque em Conferir.");
    const fracao = ate(MISSAO_4, "duas-tres");
    expect(gesto(MISSAO_4, fracao).texto).toBe("Agora: monte a fração com as fichas e toque em Conferir.");
    const depois = aplicarEntrada(MISSAO_4, fracao, { tipo: "responder", valor: "3/2" }, ctxMotor).exec;
    expect(gesto(MISSAO_4, depois).texto).toBe("Agora: troque as fichas e confira de novo.");
  });

  it("frase: levar um número para a primeira lacuna vazia; completa, conferir", () => {
    const e = ate(MISSAO_1, "frase");
    expect(gesto(MISSAO_1, e).texto).toBe("Agora: leve um número da máquina para a primeira lacuna vazia.");
    const cheia = [{ l: "a", v: "24" }, { l: "b", v: "4" }, { l: "c", v: "6" }].reduce((x, { l, v }) => aplicarEntrada(MISSAO_1, x, { tipo: "lacuna", lacuna: l, valor: v }, ctxMotor).exec, e);
    expect(gesto(MISSAO_1, cheia).texto).toBe("Agora: toque em Conferir com a máquina.");
  });

  it("caminho de volta: a carga primeiro", () => {
    expect(gesto(MISSAO_1, ate(MISSAO_1, "volta")).texto).toBe("Agora: ponha na esteira o primeiro número da conta.");
  });

  it("palpite: de número, ligar a máquina; de opções (a degustação), tocar numa opção", () => {
    expect(gesto(MISSAO_1, ate(MISSAO_1, "palpite")).texto).toBe("Agora: escolha um número e toque em Ligar a máquina.");
    expect(gesto(DEGUSTACAO, ate(DEGUSTACAO, "palpite")).texto).toBe("Agora: toque numa das opções. É só um palpite.");
  });
});

describe("segredos do passo", () => {
  it("operar esconde o quanto em cada e o corte; o que está no enunciado não é segredo", () => {
    const s = segredos(passoAtual(MISSAO_4, ate(MISSAO_4, "cinco-broas"))!, ate(MISSAO_4, "cinco-broas"));
    expect(s.map((x) => `${x.tipo}:${x.valor.n}/${x.valor.d}`).sort()).toEqual(["partes:4/1", "quantidade:5/4"]);
    const m1 = ate(MISSAO_1, "repartir");
    expect(segredos(passoAtual(MISSAO_1, m1)!, m1).map((x) => `${x.tipo}:${x.valor.n}`)).toEqual(["quantidade:6"]);
  });

  it("previsão esconde o esperado; passo conferido não esconde mais nada", () => {
    const e = ate(MISSAO_1, "trinta");
    expect(segredos(passoAtual(MISSAO_1, e)!, e).map((x) => x.valor.n)).toEqual([6]);
    const depois = aplicarEntrada(MISSAO_1, e, { tipo: "responder", valor: "6" }, ctxMotor).exec;
    expect(segredos(passoAtual(MISSAO_1, depois)!, depois)).toEqual([]);
  });

  it("frase esconde as lacunas vazias", () => {
    const e = ate(MISSAO_1, "frase");
    expect(segredos(passoAtual(MISSAO_1, e)!, e).map((x) => x.valor.n)).toEqual([24, 4, 6]);
  });
});

describe("palpite revelado", () => {
  it("num palpite de opções, mostra o texto da opção, não o id", () => {
    const e = ate(DEGUSTACAO, "tres-broas");
    const comPalpite = { ...e, palpites: { ...e.palpites, palpite: "uma" } };
    expect(palpiteDoPasso(DEGUSTACAO, comPalpite)).toEqual({ valor: "uma broa", certo: "menos de uma broa" });
  });

  it("num palpite de número, o valor fica como está", () => {
    const e = ate(MISSAO_1, "repartir");
    expect(palpiteDoPasso(MISSAO_1, { ...e, palpites: { ...e.palpites, palpite: "5" } })).toEqual({ valor: "5", certo: "6" });
  });
});
