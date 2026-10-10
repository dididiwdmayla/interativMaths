import { describe, expect, it } from "vitest";
import { ancestrais, dependentesDe, indexarConceitos, ordemTopologica, type Conceito } from "./curriculo";

const c = (id: string, dependeDe: string[] = []): Conceito => ({
  id,
  nome: id,
  linha: "",
  dependeDe,
  situacao: "ativo",
  distrito: "d",
  verbo: "",
  planta: { x: 0, y: 0 },
});

describe("currículo", () => {
  const lista = [c("a"), c("b", ["a"]), c("c", ["b"]), c("d", ["a", "c"])];

  it("ordena pré-requisitos antes", () => {
    const ordem = ordemTopologica(lista);
    expect(ordem.indexOf("a")).toBeLessThan(ordem.indexOf("b"));
    expect(ordem.indexOf("c")).toBeLessThan(ordem.indexOf("d"));
  });

  it("acha ancestrais e dependentes", () => {
    expect(ancestrais(lista, "d").sort()).toEqual(["a", "b", "c"]);
    expect(dependentesDe(lista, "a").map((x) => x.id)).toEqual(["b", "d"]);
  });

  it("recusa ciclo e repetição", () => {
    expect(() => ordemTopologica([c("x", ["y"]), c("y", ["x"])])).toThrow(/ciclo/);
    expect(() => indexarConceitos([c("x"), c("x")])).toThrow(/repetido/);
  });
});
