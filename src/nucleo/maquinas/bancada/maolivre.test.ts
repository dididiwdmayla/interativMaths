import { describe, expect, it } from "vitest";
import { aleatorio } from "../../geradores/aleatorio";
import { chave, igual } from "../../racional/racional";
import {
  criarBancada,
  diferencaDeMaquinas,
  maoLivreLigada,
  operar,
  operarVarias,
  quantidadeNaBica,
  temDiferenca,
  totalGeral,
  validarBancada,
  type AcaoBancada,
  type ConfigBancada,
} from "./index";

const sacas = (quantidade: number, bicas: number, extra: Partial<ConfigBancada> = {}): ConfigBancada => ({
  pele: "sacas-carrocas",
  pecas: { quantidade },
  bicas: { quantidade: bicas, ajustavel: false },
  ...extra,
});

const broas = (quantidade: number, mesas: number, extra: Partial<ConfigBancada> = {}): ConfigBancada => ({
  pele: "broas-mesas",
  pecas: { quantidade },
  bicas: { quantidade: mesas, ajustavel: false },
  fatiador: { partes: [2, 3, 4, 8], denominadorMaximo: 8 },
  ...extra,
});

const colocar = (bica: number, tamanho = "1/1"): AcaoBancada => ({ tipo: "colocar", tamanho, bica });
const devolver = (bica: number, tamanho = "1/1"): AcaoBancada => ({ tipo: "devolver", tamanho, bica });

describe("mão livre", () => {
  it("colocar tira uma peça da esteira e põe na bica, sem contar volta", () => {
    const b = operarVarias(criarBancada(sacas(24, 4)), [colocar(0), colocar(1)]);
    expect(b.atual.esteira[0].quantidade).toBe(22);
    expect(b.atual.bicas[0].pecas).toEqual([{ tamanho: { n: 1, d: 1 }, quantidade: 1 }]);
    expect(b.atual.voltas).toBe(0);
    expect(b.atual.cargaTravada).toBe(true);
    expect(b.atual.evento).toEqual({ tipo: "colocou", tamanho: "1/1", bica: 1 });
    expect(b.passado).toHaveLength(2);
  });

  it("devolver traz a peça de volta e desfazer refaz o caminho", () => {
    let b = operarVarias(criarBancada(sacas(10, 2)), [colocar(0), colocar(0), devolver(0)]);
    expect(quantidadeNaBica(b.atual.bicas[0])).toEqual({ n: 1, d: 1 });
    expect(b.atual.esteira[0].quantidade).toBe(9);
    expect(b.atual.evento).toEqual({ tipo: "devolveu", tamanho: "1/1", bica: 0 });
    b = operar(b, { tipo: "desfazer" });
    expect(quantidadeNaBica(b.atual.bicas[0])).toEqual({ n: 2, d: 1 });
  });

  it("recusa: bica fechada, peça que não existe, teto, partilha fechada", () => {
    const ajust = sacas(10, 2, { bicas: { quantidade: 2, ajustavel: true, vagas: 4 }, teto: 2 });
    expect(operar(criarBancada(ajust), colocar(3)).atual.evento).toEqual({ tipo: "recusa", motivo: "bica-fechada" });
    expect(operar(criarBancada(ajust), colocar(0, "1/2")).atual.evento).toEqual({ tipo: "recusa", motivo: "sem-pilha" });
    expect(operar(criarBancada(ajust), devolver(0)).atual.evento).toEqual({ tipo: "recusa", motivo: "sem-peca" });
    const cheia = operarVarias(criarBancada(ajust), [colocar(0), colocar(0), colocar(0)]);
    expect(cheia.atual.evento).toEqual({ tipo: "recusa", motivo: "passou-do-teto" });
    const fechada = operarVarias(criarBancada(ajust), [colocar(0), { tipo: "fechar" }, colocar(1)]);
    expect(fechada.atual.evento).toEqual({ tipo: "recusa", motivo: "fechada" });
  });

  it("desligada com voltasMax e quando a configuração disser", () => {
    expect(maoLivreLigada(sacas(35, 7))).toBe(true);
    expect(maoLivreLigada(sacas(35, 7, { voltasMax: 1 }))).toBe(false);
    expect(maoLivreLigada(sacas(35, 7, { maoLivre: false }))).toBe(false);
    const b = operar(criarBancada(sacas(35, 7, { voltasMax: 1 })), colocar(0));
    expect(b.atual.evento).toEqual({ tipo: "recusa", motivo: "sem-mao-livre" });
    expect(b.passado).toHaveLength(0);
  });

  it("cortar corta uma peça só, num passo de desfazer, com as regras do fatiador", () => {
    const b = operar(criarBancada(broas(5, 4)), { tipo: "cortar", tamanho: "1/1", partes: 4 });
    expect(b.atual.esteira.map((p) => [chave(p.tamanho), p.quantidade])).toEqual([
      ["1/1", 4],
      ["1/4", 4],
    ]);
    expect(b.atual.evento).toEqual({ tipo: "cortou", tamanho: "1/1", partes: 4, quantidade: 1, novo: "1/4" });
    expect(b.passado).toHaveLength(1);
    expect(operar(criarBancada(broas(5, 4)), { tipo: "cortar", tamanho: "1/1", partes: 5 }).atual.evento).toEqual({ tipo: "recusa", motivo: "partes-invalidas" });
    expect(operar(criarBancada(sacas(5, 4)), { tipo: "cortar", tamanho: "1/1", partes: 2 }).atual.evento).toEqual({ tipo: "recusa", motivo: "sem-fatiador" });
    const fino = operarVarias(criarBancada(broas(1, 2)), [
      { tipo: "cortar", tamanho: "1/1", partes: 4 },
      { tipo: "cortar", tamanho: "1/4", partes: 4 },
    ]);
    expect(fino.atual.evento).toEqual({ tipo: "recusa", motivo: "pedaco-pequeno-demais" });
    const todas = operar(criarBancada(broas(3, 4)), { tipo: "cortar", tamanho: "1/1", partes: 4, quantidade: "todas" });
    expect(todas.atual.esteira.map((p) => [chave(p.tamanho), p.quantidade])).toEqual([["1/4", 12]]);
    expect(todas.atual.pilha).toBe("1/4");
  });

  it("mesas desiguais feitas à mão: o validador diz desiguais", () => {
    const b = operarVarias(criarBancada(sacas(6, 2)), [colocar(0), colocar(0), colocar(1)]);
    expect(validarBancada("partilha.fechada", {}, b.atual).motivo).toBe("desiguais");
  });

  it("a partilha da missão 4 feita só à mão é aceita", () => {
    const acoes: AcaoBancada[] = [
      ...[0, 1, 2, 3].map((i) => colocar(i)),
      { tipo: "cortar", tamanho: "1/1", partes: 4 },
      ...[0, 1, 2, 3].map((i) => colocar(i, "1/4")),
    ];
    const b = operarVarias(criarBancada(broas(5, 4)), acoes);
    expect(validarBancada("partilha.fechada", {}, b.atual).ok).toBe(true);
  });
});

describe("validadores novos", () => {
  it("inteiras por bica: uma em cada, esteira ainda com peças", () => {
    const um = { n: 1 };
    const b0 = criarBancada(sacas(24, 4));
    expect(validarBancada("partilha.inteiras-por-bica", um, b0.atual).motivo).toBe("carga-diferente");
    const certo = operarVarias(b0, [0, 1, 2, 3].map((i) => colocar(i)));
    expect(validarBancada("partilha.inteiras-por-bica", um, certo.atual).ok).toBe(true);
    const lote = operar(b0, { tipo: "repartir" });
    expect(validarBancada("partilha.inteiras-por-bica", um, lote.atual).ok).toBe(true);
    const demais = operar(certo, colocar(2));
    expect(validarBancada("partilha.inteiras-por-bica", um, demais.atual)).toMatchObject({ ok: false, motivo: "carga-diferente", medidas: { bica: "3", carga: "2" } });
    const tudo = operarVarias(criarBancada(sacas(4, 4)), [{ tipo: "repartir" }]);
    expect(validarBancada("partilha.inteiras-por-bica", um, tudo.atual).motivo).toBe("esteira-vazia");
  });

  it("composição por bica: dois oitavos na A, um quarto na B", () => {
    const params = { bica1: "2x1/8", bica2: "1x1/4" };
    const inicio = criarBancada(broas(2, 2));
    const certo = operarVarias(inicio, [
      { tipo: "cortar", tamanho: "1/1", partes: 8 },
      { tipo: "cortar", tamanho: "1/1", partes: 4 },
      colocar(0, "1/8"),
      colocar(0, "1/8"),
      colocar(1, "1/4"),
    ]);
    expect(validarBancada("partilha.composicao", params, certo.atual).ok).toBe(true);
    const trocado = operarVarias(inicio, [
      { tipo: "cortar", tamanho: "1/1", partes: 8 },
      { tipo: "cortar", tamanho: "1/1", partes: 4 },
      colocar(0, "1/4"),
      colocar(1, "1/8"),
      colocar(1, "1/8"),
    ]);
    expect(validarBancada("partilha.composicao", params, trocado.atual)).toMatchObject({
      ok: false,
      motivo: "composicao-diferente",
      medidas: { bica: "1", pedido: "2 de 1/8", tem: "1 de 1/4" },
    });
  });
});

describe("diferença entre máquinas (chegada)", () => {
  it("chegaram seis sacas e a quinta bica abriu", () => {
    const d = diferencaDeMaquinas(sacas(24, 4), sacas(30, 5));
    expect(d.continua).toBe(true);
    expect(d.pecasNovas).toEqual([{ tamanho: "1/1", quantidade: 6 }]);
    expect(d.bicasAbriram).toEqual([4]);
    expect(d.bicasFecharam).toEqual([]);
    expect(temDiferenca(d)).toBe(true);
  });

  it("uma saca a mais e nada mais", () => {
    const d = diferencaDeMaquinas(sacas(26, 4), sacas(27, 4));
    expect(d.pecasNovas).toEqual([{ tamanho: "1/1", quantidade: 1 }]);
    expect(d.bicasAbriram).toEqual([]);
  });

  it("máquina igual não tem chegada; outra pele não continua", () => {
    expect(temDiferenca(diferencaDeMaquinas(sacas(24, 4), sacas(24, 4)))).toBe(false);
    expect(diferencaDeMaquinas(sacas(3, 4), broas(3, 4)).continua).toBe(false);
    expect(diferencaDeMaquinas(sacas(3, 4), broas(3, 4)).fatiadorNovo).toBe(true);
  });
});

describe("conservação com a mão", () => {
  it("colocar, devolver, cortar, repartir, fatiar e desfazer conservam a quantidade exata", () => {
    const configs: ConfigBancada[] = [
      broas(7, 3, { bicas: { quantidade: 3, ajustavel: true, vagas: 6 }, fatiador: { partes: [2, 3, 4, 5, 6, 8], denominadorMaximo: 48 } }),
      sacas(26, 4, { bicas: { quantidade: 4, ajustavel: true, vagas: 7 }, teto: 6 }),
      broas(5, 4),
    ];
    for (const [k, config] of configs.entries()) {
      const r = aleatorio(4242 + k);
      for (let rodada = 0; rodada < 60; rodada++) {
        let b = criarBancada(config);
        const total = totalGeral(b.atual);
        for (let passo = 0; passo < 80; passo++) {
          const e = b.atual;
          const naEsteira = e.esteira.map((p) => chave(p.tamanho));
          const bicaQualquer = r.inteiro(0, e.bicas.length - 1);
          const naBica = e.bicas[bicaQualquer].pecas.map((p) => chave(p.tamanho));
          const opcoes: AcaoBancada[] = [
            { tipo: "lote", valor: r.inteiro(1, 6) },
            { tipo: "repartir" },
            { tipo: "partes", valor: r.escolher([2, 3, 4]) },
            { tipo: "fatiar", quantidade: r.escolher([1, "todas"] as const) },
            { tipo: "desfazer" },
            { tipo: "bica", indice: bicaQualquer },
            ...(naEsteira.length > 0
              ? [
                  colocar(bicaQualquer, r.escolher(naEsteira)),
                  colocar(bicaQualquer, r.escolher(naEsteira)),
                  { tipo: "cortar", tamanho: r.escolher(naEsteira), partes: r.escolher([2, 3, 4, 8]), quantidade: r.escolher([1, "todas"] as const) } as AcaoBancada,
                ]
              : []),
            ...(naBica.length > 0 ? [devolver(bicaQualquer, r.escolher(naBica))] : []),
            ...(r.proximo() < 0.04 ? [{ tipo: "fechar" } as AcaoBancada] : []),
          ];
          b = operar(b, r.escolher(opcoes));
          expect(igual(totalGeral(b.atual), total)).toBe(true);
        }
      }
    }
  });
});
