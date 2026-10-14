import { describe, expect, it } from "vitest";
import { PELES } from "@/conteudo/peles";
import { MODELOS_RASCUNHO } from "@/conteudo/rascunho";
import { criarBancada, operar, operarVarias } from "./bancada";
import { rascunhoDaBancada, rodadasDaBancada, somaDasRodadas, LIMITE_LINHA_RASCUNHO } from "./rascunho";
import type { AcaoBancada, ConfigBancada } from "./tipos";

const SACAS: ConfigBancada = { pele: "sacas-carrocas", pecas: { quantidade: 26 }, bicas: { quantidade: 4, ajustavel: false } };
const BROAS: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 5 },
  bicas: { quantidade: 4, ajustavel: false },
  fatiador: { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 },
};

function textos(config: ConfigBancada, acoes: readonly AcaoBancada[]): string[] {
  const b = operarVarias(criarBancada(config), acoes);
  return rascunhoDaBancada(b, PELES[config.pele], MODELOS_RASCUNHO).map((l) => l.texto);
}

const por = (bica: number, tamanho = "1/1"): AcaoBancada => ({ tipo: "colocar", tamanho, bica });

describe("rascunho a lápis", () => {
  it("cada volta é uma linha com a conta e o que fica", () => {
    expect(textos(SACAS, [{ tipo: "lote", valor: 5 }, { tipo: "repartir" }, { tipo: "lote", valor: 1 }, { tipo: "repartir" }])).toEqual([
      "Volta 1: 5 em cada · 4 × 5 = 20 · ficam 26 − 20 = 6",
      "Volta 2: 1 em cada · 4 × 1 = 4 · ficam 6 − 4 = 2",
    ]);
  });

  it("a linha curta só entra quando a longa não cabe", () => {
    const linhas = textos(BROAS, [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 5 }, { tipo: "repartir" }]);
    expect(linhas[1]).toBe("Volta 1: 5/4 em cada mesa · 4 × 5/4 = 5 · ficam 5 − 5 = 0".length <= LIMITE_LINHA_RASCUNHO ? "Volta 1: 5/4 em cada mesa · 4 × 5/4 = 5 · ficam 5 − 5 = 0" : "Volta 1: 5/4 em cada · 4 × 5/4 = 5 · ficam 5 − 5 = 0");
    for (const l of linhas) expect(l.length).toBeLessThanOrEqual(LIMITE_LINHA_RASCUNHO);
  });

  it("corte de uma peça e de todas", () => {
    expect(textos(BROAS, [{ tipo: "repartir" }, { tipo: "cortar", tamanho: "1/1", partes: 4 }])).toEqual([
      "Volta 1: 1 broa em cada mesa · 4 × 1 = 4 · ficam 5 − 4 = 1",
      "Corte: 1 broa em 4 pedaços · 1 = 4 × 1/4",
    ]);
    const tres: ConfigBancada = { ...BROAS, pecas: { quantidade: 3 } };
    expect(textos(tres, [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }])).toEqual(["Corte: 3 broas em 4 · 3 = 12 × 1/4"]);
  });

  it("à mão: avulsas viram uma rodada quando cada receptor aberto ganhou uma", () => {
    expect(textos(BROAS, [por(0), por(1)])).toEqual(["Mesa 1: + 1 broa", "Mesa 2: + 1 broa"]);
    expect(textos(BROAS, [por(0), por(1), por(2), por(3)])).toEqual(["À mão: 1 broa em cada mesa · 4 × 1 = 4"]);
    // Uma peça a mais numa mesa fica avulsa depois da rodada.
    expect(textos(BROAS, [por(0), por(0), por(1), por(2), por(3)])).toEqual(["À mão: 1 broa em cada mesa · 4 × 1 = 4", "Mesa 1: + 1 broa"]);
  });

  it("devolver uma avulsa apaga a linha dela; devolver da rodada fica escrito", () => {
    expect(textos(BROAS, [por(0), por(1), { tipo: "devolver", bica: 1, tamanho: "1/1" }])).toEqual(["Mesa 1: + 1 broa"]);
    expect(textos(BROAS, [por(0), por(1), por(2), por(3), { tipo: "devolver", bica: 1, tamanho: "1/1" }])).toEqual([
      "À mão: 1 broa em cada mesa · 4 × 1 = 4",
      "Mesa 2: − 1 broa",
    ]);
  });

  it("pedaços à mão escrevem a quantidade de pão", () => {
    const acoes: AcaoBancada[] = [{ tipo: "repartir" }, { tipo: "cortar", tamanho: "1/1", partes: 4 }, por(0, "1/4")];
    expect(textos(BROAS, acoes).at(-1)).toBe("Mesa 1: + 1/4 de broa");
  });

  it("o engasgo aparece enquanto é o último evento; o gesto seguinte o tira", () => {
    const b = operarVarias(criarBancada({ ...SACAS, pecas: { quantidade: 24 } }), [{ tipo: "lote", valor: 8 }, { tipo: "repartir" }]);
    expect(rascunhoDaBancada(b, PELES["sacas-carrocas"], MODELOS_RASCUNHO).map((l) => l.texto)).toEqual([
      "Engasgo: uma volta de 8 em 4 bicas pede 32 · há 24",
    ]);
    const depois = operar(b, { tipo: "lote", valor: 6 });
    expect(rascunhoDaBancada(depois, PELES["sacas-carrocas"], MODELOS_RASCUNHO)).toEqual([]);
  });

  it("desfazer tira a última linha; recomeçar limpa", () => {
    const b = operarVarias(criarBancada(SACAS), [{ tipo: "lote", valor: 5 }, { tipo: "repartir" }, { tipo: "lote", valor: 1 }, { tipo: "repartir" }]);
    const p = PELES["sacas-carrocas"];
    expect(rascunhoDaBancada(operar(b, { tipo: "desfazer" }), p, MODELOS_RASCUNHO).map((l) => l.texto)).toEqual(["Volta 1: 5 em cada · 4 × 5 = 20 · ficam 26 − 20 = 6"]);
    expect(rascunhoDaBancada(operar(b, { tipo: "recomecar" }), p, MODELOS_RASCUNHO)).toEqual([]);
  });

  it("fechar não escreve nada; ajustes e bicas abertas também não", () => {
    const comBicas: ConfigBancada = { ...SACAS, pecas: { quantidade: 30 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } };
    expect(textos(comBicas, [{ tipo: "bica", indice: 4 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }, { tipo: "fechar" }])).toEqual([
      "Volta 1: 6 em cada · 5 × 6 = 30 · ficam 30 − 30 = 0",
    ]);
  });

  it("as rodadas somam o que cada receptor recebeu", () => {
    const b = operarVarias(criarBancada(SACAS), [por(0), por(1), por(2), por(3), { tipo: "lote", valor: 5 }, { tipo: "repartir" }]);
    const r = rodadasDaBancada(b, PELES["sacas-carrocas"], MODELOS_RASCUNHO);
    expect(r.map((x) => x.tipo)).toEqual(["mao", "volta"]);
    expect(somaDasRodadas(r)).toEqual({ n: 6, d: 1 });
  });
});
