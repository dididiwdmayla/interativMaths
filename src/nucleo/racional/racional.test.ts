import { describe, expect, it } from "vitest";
import {
  chave,
  compara,
  comoRacional,
  divide,
  expressaoPorExtenso,
  formatar,
  fracaoPorExtenso,
  igual,
  inteiroPorExtenso,
  lerEmVoz,
  lerExpressao,
  lerRacional,
  multiplica,
  papeis,
  parteInteira,
  racional,
  racionalPorExtenso,
  soma,
  somaTodos,
  subtrai,
  valorDoNumero,
} from "./index";

describe("racional", () => {
  it("reduz e normaliza o sinal", () => {
    expect(racional(6, 8)).toEqual({ n: 3, d: 4 });
    expect(racional(3, -6)).toEqual({ n: -1, d: 2 });
    expect(racional(0, 5)).toEqual({ n: 0, d: 1 });
  });

  it("recusa denominador zero e não inteiros", () => {
    expect(() => racional(1, 0)).toThrow();
    expect(() => racional(0.5, 1)).toThrow();
  });

  it("faz as quatro operações exatas", () => {
    expect(soma(racional(1, 2), racional(1, 4))).toEqual(racional(3, 4));
    expect(subtrai(racional(1, 2), racional(1, 10))).toEqual(racional(2, 5));
    expect(multiplica(racional(2, 3), racional(3))).toEqual(racional(2));
    expect(divide(racional(3), racional(4))).toEqual(racional(3, 4));
    expect(() => divide(racional(1), racional(0))).toThrow();
  });

  it("soma sem erro de ponto flutuante", () => {
    const dez = Array.from({ length: 10 }, () => racional(1, 10));
    expect(somaTodos(dez)).toEqual(racional(1));
    expect(soma(racional(1, 2), racional(1, 10))).toEqual(racional(3, 5));
  });

  it("compara por valor", () => {
    expect(compara(racional(2, 8), racional(1, 4))).toBe(0);
    expect(igual(racional(2, 4), racional(1, 2))).toBe(true);
    expect(compara(racional(1, 3), racional(1, 4))).toBe(1);
  });

  it("lê e escreve", () => {
    expect(lerRacional("3/4")).toEqual(racional(3, 4));
    expect(lerRacional("1 1/4")).toEqual(racional(5, 4));
    expect(lerRacional("0,75")).toEqual(racional(3, 4));
    expect(lerRacional("abc")).toBeNull();
    expect(lerRacional("1/0")).toBeNull();
    expect(formatar(racional(5, 4))).toBe("5/4");
    expect(formatar(racional(5, 4), { misto: true })).toBe("1 1/4");
    expect(formatar(racional(6))).toBe("6");
    expect(chave(racional(2, 4))).toBe("1/2");
    expect(comoRacional("2/3")).toEqual(racional(2, 3));
    expect(parteInteira(racional(26, 4))).toBe(6);
  });
});

describe("por extenso", () => {
  it("lê inteiros", () => {
    expect(inteiroPorExtenso(0)).toBe("zero");
    expect(inteiroPorExtenso(26)).toBe("vinte e seis");
    expect(inteiroPorExtenso(100)).toBe("cem");
    expect(inteiroPorExtenso(115)).toBe("cento e quinze");
    expect(inteiroPorExtenso(2, "f")).toBe("duas");
    expect(inteiroPorExtenso(1550)).toBe("mil quinhentos e cinquenta");
    expect(inteiroPorExtenso(2000)).toBe("dois mil");
  });

  it("lê frações sem reduzir", () => {
    expect(fracaoPorExtenso(3, 4)).toBe("três quartos");
    expect(fracaoPorExtenso(1, 2)).toBe("um meio");
    expect(fracaoPorExtenso(2, 4)).toBe("dois quartos");
    expect(fracaoPorExtenso(1, 10)).toBe("um décimo");
    expect(fracaoPorExtenso(5, 12)).toBe("cinco doze avos");
  });

  it("lê mistos", () => {
    expect(racionalPorExtenso(racional(5, 4), { misto: true })).toBe("um inteiro e um quarto");
    expect(racionalPorExtenso(racional(5, 4))).toBe("cinco quartos");
    expect(racionalPorExtenso(racional(6))).toBe("seis");
  });
});

describe("notação", () => {
  it("lê divisão com resto em voz", () => {
    expect(lerEmVoz("26 ÷ 4 = 6, resto 2")).toBe(
      "vinte e seis dividido por quatro é igual a seis, resto dois",
    );
  });

  it("lê fração como divisão e misto", () => {
    expect(lerEmVoz("3 ÷ 4 = 3/4")).toBe("três dividido por quatro é igual a três quartos");
    const tk = lerExpressao("5 ÷ 4 = 1 1/4 = 5/4");
    expect(tk.filter((t) => t.t === "num")).toHaveLength(4);
    expect(expressaoPorExtenso(tk)).toBe(
      "cinco dividido por quatro é igual a um inteiro e um quarto é igual a cinco quartos",
    );
    const misto = tk[4];
    expect(misto.t === "num" && valorDoNumero(misto)).toEqual(racional(5, 4));
  });

  it("dá papéis aos termos", () => {
    const tk = lerExpressao("26 ÷ 4 = 6, resto 2");
    const p = papeis(tk).filter((x) => x !== null);
    expect(p).toEqual(["dividendo", "divisor", "quociente", "resto"]);
    expect(papeis(lerExpressao("4 × 6 = 24")).filter(Boolean)).toEqual(["fator", "fator", "produto"]);
    expect(papeis(lerExpressao("26 = 4 × 6 + 2")).filter(Boolean)).toEqual([
      "dividendo",
      "divisor",
      "quociente",
      "resto",
    ]);
  });
});
