import { describe, expect, it } from "vitest";
import { aleatorio } from "../../geradores/aleatorio";
import { igual, racional, type Racional } from "../../racional/racional";
import {
  aindaFecha,
  bicasEmUso,
  criarBancada,
  medir,
  operar,
  operarVarias,
  quantidadesPorBica,
  totalGeral,
  validarBancada,
  type AcaoBancada,
  type Bancada,
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
  fatiador: { partes: [2, 3, 4, 5, 6, 8], denominadorMaximo: 8 },
  ...extra,
});

const lote = (valor: number): AcaoBancada => ({ tipo: "lote", valor });
const repartir: AcaoBancada = { tipo: "repartir" };
const pilha = (tamanho: string): AcaoBancada => ({ tipo: "pilha", tamanho });
const partes = (valor: number): AcaoBancada => ({ tipo: "partes", valor });
const fatiarTodas: AcaoBancada = { tipo: "fatiar", quantidade: "todas" };

function cadaBica(b: Bancada): Racional[] {
  return quantidadesPorBica(b.atual);
}

describe("repartidor (missão 1: 24 sacas, 4 carroças)", () => {
  const inicio = criarBancada(sacas(24, 4));

  it.each([
    ["de 1 em 1", Array(6).fill(repartir)],
    ["de 2 em 2", [lote(2), repartir, repartir, repartir]],
    ["de 6 em 6", [lote(6), repartir]],
  ])("fecha %s", (_, acoes) => {
    const b = operarVarias(inicio, acoes as AcaoBancada[]);
    expect(validarBancada("partilha.fechada", {}, b.atual).ok).toBe(true);
    expect(cadaBica(b).every((q) => igual(q, racional(6)))).toBe(true);
  });

  it("lote 7 engasga e mostra a medida, sem mexer nas sacas", () => {
    const b = operarVarias(inicio, [lote(7), repartir]);
    expect(b.atual.evento).toEqual({ tipo: "engasgo", tamanho: "1/1", lote: 7, abertas: 4, pedido: 28, ha: 24 });
    expect(b.atual.esteira[0].quantidade).toBe(24);
    expect(b.passado).toHaveLength(0);
  });

  it("parar cedo é reconhecido", () => {
    const b = operarVarias(inicio, [lote(5), repartir]);
    const r = validarBancada("partilha.fechada", {}, b.atual);
    expect(r.ok).toBe(false);
    expect(r.equivoco).toBe("parou-cedo");
  });

  it("quocientes parciais: 26 entre 4 como 5 e depois 1", () => {
    const b = operarVarias(criarBancada(sacas(26, 4)), [lote(5), repartir, lote(1), repartir]);
    const r = validarBancada("partilha.fechada", {}, b.atual);
    expect(r.ok).toBe(true);
    expect(medir(b.atual, "carga-por-bica")).toEqual(racional(6));
    expect(medir(b.atual, "sobra")).toEqual(racional(2));
  });

  it("desfazer e recomeçar", () => {
    let b = operarVarias(inicio, [lote(2), repartir, repartir]);
    b = operar(b, { tipo: "desfazer" });
    expect(cadaBica(b)[0]).toEqual(racional(2));
    b = operar(b, { tipo: "recomecar" });
    expect(cadaBica(b)[0]).toEqual(racional(0));
    expect(b.atual.esteira[0].quantidade).toBe(24);
  });
});

describe("bicas ajustáveis (missão 2: 30 sacas, 6 em cada)", () => {
  const config = sacas(30, 4, { bicas: { quantidade: 4, ajustavel: true, vagas: 8 } });

  it("fecha com 5 bicas", () => {
    const b = operarVarias(criarBancada(config), [{ tipo: "bica", indice: 4 }, lote(6), repartir]);
    expect(validarBancada("partilha.carga-exata", { carga: 6 }, b.atual).ok).toBe(true);
  });

  it("com 4 abertas sobram 6", () => {
    const b = operarVarias(criarBancada(config), [lote(6), repartir]);
    const r = validarBancada("partilha.carga-exata", { carga: 6 }, b.atual);
    expect(r.ok).toBe(false);
    expect(r.motivo).toBe("sobra-diferente");
    expect(r.medidas.sobra).toBe("6");
  });

  it("fechar bicas cheias e abrir outra também chega lá", () => {
    const b = operarVarias(criarBancada(config), [
      lote(6),
      repartir,
      { tipo: "bicas", abertas: 0 },
      { tipo: "bica", indice: 4 },
      repartir,
    ]);
    expect(bicasEmUso(b.atual)).toHaveLength(5);
    expect(validarBancada("partilha.carga-exata", { carga: 6 }, b.atual).ok).toBe(true);
  });
});

describe("transporte (missão 3: 26 sacas, até 6 por carroça)", () => {
  const config = sacas(26, 4, { bicas: { quantidade: 4, ajustavel: true, vagas: 7 }, teto: 6 });

  it("5 carroças levam tudo", () => {
    const b = operarVarias(criarBancada(config), [lote(6), repartir, { tipo: "bicas", abertas: 0 }, { tipo: "bica", indice: 4 }, lote(2), repartir]);
    expect(validarBancada("transporte.tudo-saiu", { teto: 6 }, b.atual).ok).toBe(true);
  });

  it("4 carroças deixam 2 no pátio", () => {
    const b = operarVarias(criarBancada(config), [lote(6), repartir]);
    const r = validarBancada("transporte.tudo-saiu", { teto: 6 }, b.atual);
    expect(r.equivoco).toBe("arredondou-para-baixo");
    expect(r.medidas.sobra).toBe("2");
  });

  it("carroça a mais é apontada", () => {
    const b = operarVarias(criarBancada(config), [{ tipo: "bicas", abertas: 7 }, lote(3), repartir, { tipo: "bicas", abertas: 5 }, lote(1), repartir]);
    const r = validarBancada("transporte.tudo-saiu", { teto: 6 }, b.atual);
    expect(r.motivo).toBe("bicas-demais");
  });
});

describe("fatiador (missão 4)", () => {
  it("5 broas e 4 mesas: 1 1/4 para cada", () => {
    let b = operarVarias(criarBancada(broas(5, 4)), [repartir]);
    const antes = validarBancada("partilha.fechada", {}, b.atual);
    expect(antes.equivoco).toBe("resto-jogado-fora");
    b = operarVarias(b, [partes(4), { tipo: "fatiar", quantidade: 1 }, repartir]);
    expect(validarBancada("partilha.fechada", {}, b.atual).ok).toBe(true);
    expect(medir(b.atual, "carga-por-bica")).toEqual(racional(5, 4));
  });

  const tres = criarBancada(broas(3, 4));
  it.each([
    ["tudo em quartos", [partes(4), fatiarTodas, lote(3), repartir]],
    ["metades e depois quartos", [partes(2), fatiarTodas, repartir, pilha("1/2"), partes(2), fatiarTodas, repartir]],
    ["oitavos", [partes(8), fatiarTodas, lote(6), repartir]],
  ])("3 broas e 4 mesas: %s dá 3/4, mesma altura", (_, acoes) => {
    const b = operarVarias(tres, acoes as AcaoBancada[]);
    expect(validarBancada("partilha.fechada", {}, b.atual).ok).toBe(true);
    expect(cadaBica(b).every((q) => igual(q, racional(3, 4)))).toBe(true);
  });

  it("cortar uma broa em 3 para 4 mesas não fecha mais", () => {
    const b = operarVarias(criarBancada(broas(1, 4)), [partes(3), fatiarTodas]);
    expect(aindaFecha(b.atual)).toBe(false);
    expect(aindaFecha(criarBancada(broas(1, 4)).atual)).toBe(true);
  });

  it("cortar em 3 com outras broas inteiras ainda fecha (sextos e oitavos)", () => {
    const b = operarVarias(criarBancada(broas(3, 4)), [partes(3), { tipo: "fatiar", quantidade: 1 }]);
    expect(aindaFecha(b.atual)).toBe(true);
  });

  it("metade primeiro, para 3 mesas, ainda fecha (1/2 + 1/6)", () => {
    const b = operarVarias(criarBancada(broas(2, 3)), [partes(2), fatiarTodas]);
    expect(aindaFecha(b.atual)).toBe(true);
  });

  it("mesma contagem, quantidades diferentes: conta pedaços", () => {
    const config = broas(2, 2, { bicas: { quantidade: 2, ajustavel: true } });
    const b = operarVarias(criarBancada(config), [
      partes(2),
      { tipo: "fatiar", quantidade: 1 },
      { tipo: "bica", indice: 1 },
      pilha("1/2"),
      lote(2),
      repartir,
      { tipo: "bica", indice: 1 },
      { tipo: "bica", indice: 0 },
      pilha("1/1"),
      partes(4),
      { tipo: "fatiar", quantidade: 1 },
      pilha("1/4"),
      lote(2),
      repartir,
    ]);
    const r = validarBancada("partilha.fechada", {}, b.atual);
    expect(r.equivoco).toBe("conta-pedacos");
  });

  it("pedaço pequeno demais é recusado", () => {
    const b = operarVarias(criarBancada(broas(1, 4)), [partes(8), fatiarTodas, partes(2), fatiarTodas]);
    expect(b.atual.evento).toEqual({ tipo: "recusa", motivo: "pedaco-pequeno-demais" });
  });
});

describe("validadores especiais", () => {
  it("à maneira do escriba: 6 pães para 10, 1/2 + 1/10", () => {
    const config: ConfigBancada = {
      pele: "paes-cestos",
      pecas: { quantidade: 6 },
      bicas: { quantidade: 10, ajustavel: false },
      fatiador: { partes: [2, 3, 4, 5, 10], denominadorMaximo: 10 },
    };
    const escriba = operarVarias(criarBancada(config), [
      partes(2),
      { tipo: "fatiar", quantidade: 5 },
      pilha("1/2"),
      repartir,
      pilha("1/1"),
      partes(10),
      fatiarTodas,
      repartir,
    ]);
    expect(validarBancada("partilha.unitarias-distintas", {}, escriba.atual).ok).toBe(true);
    const decimos = operarVarias(criarBancada(config), [partes(10), fatiarTodas, lote(6), repartir]);
    expect(validarBancada("partilha.fechada", {}, decimos.atual).ok).toBe(true);
    expect(validarBancada("partilha.unitarias-distintas", {}, decimos.atual).motivo).toBe("pedaco-repetido");
  });

  it("soluções distintas", () => {
    const quartos = operarVarias(criarBancada(broas(3, 4)), [partes(4), fatiarTodas, lote(3), repartir]);
    const r1 = validarBancada("partilha.solucoes-distintas", { n: 2 }, quartos.atual, { solucoes: [] });
    expect(r1.parcial).toBe(true);
    const r2 = validarBancada("partilha.solucoes-distintas", { n: 2 }, quartos.atual, { solucoes: [r1.assinatura as string] });
    expect(r2.motivo).toBe("solucao-repetida");
    const oitavos = operarVarias(criarBancada(broas(3, 4)), [partes(8), fatiarTodas, lote(6), repartir]);
    const r3 = validarBancada("partilha.solucoes-distintas", { n: 2 }, oitavos.atual, { solucoes: [r1.assinatura as string] });
    expect(r3.ok).toBe(true);
  });

  it("máquina que mostra 28 ÷ 7, nos dois sentidos", () => {
    const config = sacas(10, 4, { carga: { minimo: 1, maximo: 40 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } });
    const partilha = operarVarias(criarBancada(config), [{ tipo: "carga", quantidade: 28 }, { tipo: "bicas", abertas: 7 }, lote(4), repartir]);
    expect(validarBancada("maquina.mostra-divisao", { dividendo: 28, divisor: 7, aceitaMedida: true }, partilha.atual).ok).toBe(true);
    const medida = operarVarias(criarBancada(config), [{ tipo: "carga", quantidade: 28 }, { tipo: "bicas", abertas: 4 }, lote(7), repartir]);
    expect(validarBancada("maquina.mostra-divisao", { dividendo: 28, divisor: 7, aceitaMedida: true }, medida.atual).ok).toBe(true);
    expect(validarBancada("maquina.mostra-divisao", { dividendo: 28, divisor: 7 }, medida.atual).ok).toBe(false);
  });

  it("carga travada depois da primeira volta", () => {
    const config = sacas(10, 4, { carga: { minimo: 1, maximo: 40 } });
    const b = operarVarias(criarBancada(config), [repartir, { tipo: "carga", quantidade: 20 }]);
    expect(b.atual.evento).toEqual({ tipo: "recusa", motivo: "carga-travada" });
  });

  it("uma volta só", () => {
    const b = operarVarias(criarBancada(sacas(35, 7, { voltasMax: 1 })), [repartir, repartir]);
    expect(b.atual.evento).toEqual({ tipo: "recusa", motivo: "limite-voltas" });
  });
});

describe("invariante de conservação", () => {
  it("a soma exata é constante sob sequências aleatórias", () => {
    const configs: ConfigBancada[] = [
      broas(7, 3, { bicas: { quantidade: 3, ajustavel: true, vagas: 6 }, fatiador: { partes: [2, 3, 4, 5, 6, 8, 10], denominadorMaximo: 40 } }),
      sacas(26, 4, { bicas: { quantidade: 4, ajustavel: true, vagas: 7 } }),
      { pele: "pizzas-amigos", pecas: { quantidade: 0, pilhas: [{ tamanho: "1/8", quantidade: 24 }] }, bicas: { quantidade: 4, ajustavel: false } },
    ];
    for (const [k, config] of configs.entries()) {
      const r = aleatorio(1000 + k);
      for (let rodada = 0; rodada < 40; rodada++) {
        let b = criarBancada(config);
        const total = totalGeral(b.atual);
        for (let passo = 0; passo < 60; passo++) {
          const opcoes: AcaoBancada[] = [
            lote(r.inteiro(1, 8)),
            repartir,
            repartir,
            { tipo: "bica", indice: r.inteiro(0, b.atual.bicas.length - 1) },
            partes(r.escolher([2, 3, 4, 5])),
            { tipo: "fatiar", quantidade: r.escolher([1, 2, "todas"] as const) },
            ...(b.atual.esteira.length > 0 ? [pilha(`${b.atual.esteira[0].tamanho.n}/${b.atual.esteira[0].tamanho.d}`)] : []),
            { tipo: "desfazer" },
            ...(r.proximo() < 0.05 ? [{ tipo: "fechar" } as AcaoBancada] : []),
            ...(r.proximo() < 0.03 ? [{ tipo: "recomecar" } as AcaoBancada] : []),
          ];
          b = operar(b, r.escolher(opcoes));
          expect(igual(totalGeral(b.atual), total)).toBe(true);
        }
      }
    }
  });
});
