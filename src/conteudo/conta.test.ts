/**
 * A conta passada a caneta, conferida rodando todas as soluções de teste: cada conta de acerto é
 * verdadeira (com Racional), bate com o estado final da máquina, só aparece depois do acerto, e a
 * conta armada fecha (os quocientes parciais somam o quociente; o resto é menor que o divisor).
 */
import { describe, expect, it } from "vitest";
import { bicasEmUso, quantidadeDe, quantidadeNaBica } from "@/nucleo/maquinas/bancada/bancada";
import { contaArmadaDaNotacao, contaDoAcerto, contaVerdadeira, type Conta, type ContextoConta } from "@/nucleo/missoes/conta";
import { aplicarEntrada, iniciarExecucao, passoAtual, type Execucao } from "@/nucleo/missoes/motor";
import type { Atividade, Entrada, ModoExecucao } from "@/nucleo/missoes/tipos";
import { igual, inteiro } from "@/nucleo/racional/racional";
import { atividadeRevisita, atividadeSondagem } from "@/nucleo/geradores/atividades";
import { CONCEITOS_COM_GERADOR } from "@/nucleo/geradores/questoes";
import { conferirPrevisao } from "@/nucleo/missoes/motor";
import { ATIVIDADES } from "./atividades";
import { MODELOS_CONTA } from "./conta";
import { DEGUSTACAO } from "./degustacao";
import { EQUIVOCOS } from "./equivocos";
import { MISSAO_1 } from "./missoes/m1-carga-igual";
import { MISSAO_2 } from "./missoes/m2-quantas-carrocas";
import { MISSAO_3 } from "./missoes/m3-sobrou";
import { MISSAO_4 } from "./missoes/m4-pao-nao-e-saca";
import { PELES } from "./peles";
import { MODELOS_RASCUNHO } from "./rascunho";

const ctxMotor = { agora: 1, conceitoDoEquivoco: (id: string) => EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null };

function ctxConta(e: Execucao): ContextoConta | null {
  if (!e.bancada) return null;
  return { pele: PELES[e.bancada.atual.config.pele], modelos: MODELOS_CONTA, rascunho: MODELOS_RASCUNHO };
}

/** Roda a solução e devolve, por passo, a conta do acerto (a primeira que apareceu). */
function contasDe(a: Atividade, modo: ModoExecucao, entradas: readonly Entrada[]): Map<string, { conta: Conta; exec: Execucao }> {
  let e = iniciarExecucao(a, modo);
  const saida = new Map<string, { conta: Conta; exec: Execucao }>();
  for (const entrada of entradas) {
    const p = passoAtual(a, e);
    if (!p) break;
    e = aplicarEntrada(a, e, entrada, ctxMotor).exec;
    const depois = passoAtual(a, e);
    if (!depois || depois.id !== p.id) continue;
    const ctx = ctxConta(e);
    const conta = ctx ? contaDoAcerto(p, e, ctx) : null;
    if (e.passo.situacao === "ativo") expect(conta, `${a.id}#${p.id}: conta antes do acerto`).toBeNull();
    if (conta && !saida.has(p.id)) saida.set(p.id, { conta, exec: e });
  }
  return saida;
}

function bateComAMaquina(c: Conta, e: Execucao): boolean {
  const m = e.bancada?.atual;
  if (!m) return false;
  if (c.tipo === "comparacao") return true;
  if (c.tipo === "parte") return !!c.produto && bicasEmUso(m).length === 1 && igual(c.produto.resultado, quantidadeNaBica(m.bicas[bicasEmUso(m)[0]]));
  const uso = bicasEmUso(m);
  const total = quantidadeDe([...m.esteira, ...m.bandeja, ...m.bicas.flatMap((b) => b.pecas)]);
  const cada = quantidadeNaBica(m.bicas[uso[0]]);
  if (!c.dividendo || !igual(c.dividendo, total)) return false;
  if (c.tipo === "medida") return !!c.divisor && !!c.quociente && igual(c.divisor, cada) && igual(c.quociente, inteiro(uso.length));
  if (c.tipo === "transporte") return true;
  return !!c.divisor && !!c.quociente && igual(c.divisor, inteiro(uso.length)) && igual(c.quociente, cada);
}

const TODAS: readonly Atividade[] = [...ATIVIDADES, DEGUSTACAO];

describe("a conta passada a caneta", () => {
  it.each(TODAS.map((a) => [a.id, a] as const))("%s: toda conta de acerto é verdadeira e bate com a máquina", (_, a) => {
    let contas = 0;
    for (const s of a.solucoesDeTeste) {
      for (const [id, { conta, exec }] of contasDe(a, s.modo, s.entradas)) {
        contas += 1;
        expect(contaVerdadeira(conta), `${a.id}#${id} (${s.nome}): ${conta.expressao}`).toBe(true);
        expect(bateComAMaquina(conta, exec), `${a.id}#${id} (${s.nome}): ${conta.expressao}`).toBe(true);
        expect(conta.expressao).not.toMatch(/undefined|NaN|\{/);
        expect(conta.extenso.length).toBeGreaterThan(5);
      }
    }
    expect(contas, `${a.id}: nenhum acerto com conta`).toBeGreaterThan(0);
  });

  it("revisitas e sondagens geradas: a previsão certa ganha a conta, verdadeira", () => {
    for (const semente of [1, 2, 3, 7, 11, 19, 23, 42]) {
      const geradas = [
        atividadeRevisita(["div.resto", "fra.quociente", "fra.parte"], semente, { titulo: "r", ideia: "r", abertura: [], fecho: [] }),
        ...CONCEITOS_COM_GERADOR.map((c) => atividadeSondagem(c, semente, { titulo: "s", ideia: "s", abertura: [], fecho: [] })),
      ];
      for (const a of geradas) {
        // Responde cada previsão com o que a máquina vai dar: o acerto.
        let e = iniciarExecucao(a, "guiada");
        for (let guarda = 0; guarda < 40; guarda++) {
          const p = passoAtual(a, e);
          if (!p) break;
          let entrada: Entrada = { tipo: "seguir" };
          if (p.tipo === "prever" && e.passo.situacao === "ativo" && e.passo.inicio) entrada = { tipo: "responder", valor: conferirPrevisao(p, e.passo.inicio).esperado };
          e = aplicarEntrada(a, e, entrada, ctxMotor).exec;
          const depois = passoAtual(a, e);
          const ctx = ctxConta(e);
          if (depois && depois.id === p.id && ctx) {
            const conta = contaDoAcerto(p, e, ctx);
            if (conta) expect(contaVerdadeira(conta), `${a.id}#${p.id}: ${conta.expressao}`).toBe(true);
          }
        }
      }
    }
  });

  it("parte de um inteiro e transporte numa previsão gerada", () => {
    const a = atividadeRevisita(["div.resto", "fra.quociente", "fra.parte"], 1, { titulo: "r", ideia: "r", abertura: [], fecho: [] });
    const p = a.passos.find((x) => x.id === "pergunta-3");
    if (!p || p.tipo !== "prever") throw new Error("pergunta-3");
    let e = iniciarExecucao(a, "guiada");
    for (let guarda = 0; guarda < 20 && passoAtual(a, e)?.id !== "pergunta-3"; guarda++) {
      const atual = passoAtual(a, e);
      const certa = atual?.tipo === "prever" && e.passo.situacao === "ativo" && e.passo.inicio ? conferirPrevisao(atual, e.passo.inicio).esperado : null;
      e = aplicarEntrada(a, e, certa ? { tipo: "responder", valor: certa } : { tipo: "seguir" }, ctxMotor).exec;
    }
    if (!e.passo.inicio) throw new Error("sem máquina");
    e = aplicarEntrada(a, e, { tipo: "responder", valor: conferirPrevisao(p, e.passo.inicio).esperado }, ctxMotor).exec;
    const ctx = ctxConta(e);
    const conta = ctx ? contaDoAcerto(p, e, ctx) : null;
    expect(conta?.tipo).toBe("parte");
    expect(conta?.expressao).toBe("2 × 1/6 = 2/6");
    expect(conta?.equivalente).toBe("ou 1/3");
    expect(conta?.nomes).toEqual(["pedaços", "cada um", "de broa"]);
  });

  it("Missão 1: partilha exata, previsão e caminho de volta", () => {
    const c = contasDe(MISSAO_1, "guiada", MISSAO_1.solucoesDeTeste[0].entradas);
    expect(c.get("a-mao")).toBeUndefined();
    expect(c.get("repartir")?.conta.expressao).toBe("24 ÷ 4 = 6");
    expect(c.get("repartir")?.conta.prova).toBe("Confere: 4 × 6 = 24");
    expect(c.get("repartir")?.conta.nomes).toEqual(["dividendo", "divisor", "quociente"]);
    expect(c.get("trinta")?.conta.expressao).toBe("30 ÷ 5 = 6");
    expect(c.get("volta")?.conta.expressao).toBe("18 ÷ 3 = 6");
  });

  it("Missão 2: quantos cabem, com a leitura", () => {
    const c = contasDe(MISSAO_2, "guiada", MISSAO_2.solucoesDeTeste[0].entradas);
    const chamar = c.get("chamar")?.conta;
    expect(chamar?.tipo).toBe("medida");
    expect(chamar?.expressao).toBe("30 ÷ 6 = 5");
    expect(chamar?.leitura).toBe("o 6 cabe 5 vezes no 30");
    expect(c.get("familia")?.conta.expressao).toBe("30 ÷ 6 = 5");
  });

  it("Missão 3: resto, conta armada das voltas e transporte", () => {
    const c = contasDe(MISSAO_3, "guiada", MISSAO_3.solucoesDeTeste[0].entradas);
    const rep = c.get("repartir")?.conta;
    expect(rep?.expressao).toBe("26 ÷ 4 = 6, resto 2");
    expect(rep?.forma).toBe("26 = 4 × 6 + 2");
    expect(rep?.nomes).toEqual(["dividendo", "divisor", "quociente", "resto"]);
    expect(rep?.chave?.quociente).toBe(6);
    expect(rep?.chave?.resto).toBe(2);
    expect(c.get("vinte-e-sete")?.conta.expressao).toBe("27 ÷ 4 = 6, resto 3");
    // A aposta: a máquina veio com 6 em cada; o jogador deu mais uma volta de 1.
    const aposta = c.get("pode-sobrar-quatro")?.conta;
    expect(aposta?.expressao).toBe("28 ÷ 4 = 7");
    expect(aposta?.chave?.linhas.map((l) => l.parcial)).toEqual([6, 1]);
    const tr = c.get("transporte")?.conta;
    expect(tr?.expressao).toBe("26 ÷ 6 = 4, resto 2");
    expect(tr?.frase).toBe("as 2 que sobram pedem mais uma carroça: 5");
    expect(c.get("volta")?.conta.expressao).toBe("23 ÷ 5 = 4, resto 3");
  });

  it("Missão 3: a conta armada sai das voltas que o jogador deu", () => {
    const voltas: Entrada[] = [
      { tipo: "seguir" },
      { tipo: "responder", valor: "6" },
      { tipo: "maquina", acao: { tipo: "lote", valor: 5 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "maquina", acao: { tipo: "lote", valor: 1 } },
      { tipo: "maquina", acao: { tipo: "repartir" } },
      { tipo: "fechar" },
    ];
    const chave = contasDe(MISSAO_3, "guiada", voltas).get("repartir")?.conta.chave;
    expect(chave?.linhas).toEqual([
      { tira: 20, fica: 6, parcial: 5 },
      { tira: 4, fica: 2, parcial: 1 },
    ]);
    expect(chave?.lado).toBe("Cada volta é uma linha: 5 para cada carroça tira 20; depois 1 para cada tira 4. Somando as voltas, 6 para cada.");
  });

  it("a página do Caderno da Missão 3 arma a conta da notação", () => {
    const registro = MISSAO_3.passos.find((p) => p.tipo === "registro");
    if (!registro || registro.tipo !== "registro") throw new Error("registro");
    const chave = contaArmadaDaNotacao(registro.pagina.notacao[0], MODELOS_CONTA, "carroça");
    expect(chave).toMatchObject({ dividendo: 26, divisor: 4, quociente: 6, resto: 2 });
    expect(chave?.linhas).toEqual([{ tira: 24, fica: 2, parcial: 6 }]);
    expect(contaArmadaDaNotacao("24 ÷ 4 = 6", MODELOS_CONTA, "carroça")).toBeNull();
    expect(contaArmadaDaNotacao("26 ÷ 4 = 5, resto 6", MODELOS_CONTA, "carroça")).toBeNull();
  });

  it("Missão 4: misto com a fração ao lado, fração com os termos, comparação", () => {
    const c = contasDe(MISSAO_4, "guiada", MISSAO_4.solucoesDeTeste[1].entradas);
    const cinco = c.get("cinco-broas")?.conta;
    expect(cinco?.expressao).toBe("5 ÷ 4 = 1 1/4");
    expect(cinco?.equivalente).toBe("ou 5/4");
    expect(cinco?.prova).toBe("Confere: 4 × 1 1/4 = 4 + 1 = 5");
    const tres = c.get("tres-broas")?.conta;
    expect(tres?.expressao).toBe("3 ÷ 4 = 3/4");
    expect(tres?.fracao).toEqual({ numerador: 3, denominador: 4 });
    const comparar = c.get("comparar")?.conta;
    expect(comparar?.expressao).toBe("2/8 = 1/4");
    expect(comparar?.nomes).toEqual(["mesa A", "mesa B"]);
    expect(comparar?.prova).toBe("Confere: as duas mesas param na mesma altura do medidor.");
    expect(c.get("duas-tres")?.conta.expressao).toBe("2 ÷ 3 = 2/3");
    expect(c.get("volta")?.conta.expressao).toBe("2 ÷ 5 = 2/5");
  });
});
