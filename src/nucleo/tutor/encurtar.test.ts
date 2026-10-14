import { describe, expect, it } from "vitest";
import { encurtarFala, LIMITE_FALA } from "./reacoes";

describe("fala que cabe na faixa", () => {
  it("texto curto passa igual", () => {
    expect(encurtarFala("Olhe a esteira.")).toBe("Olhe a esteira.");
  });
  it("texto longo corta na última frase inteira", () => {
    const longo = `${"Olhe a esteira antes de girar a alavanca. ".repeat(3)}E depois conte as mesas que ainda estão vazias, uma a uma, com calma.`;
    const curto = encurtarFala(longo);
    expect(curto.length).toBeLessThanOrEqual(LIMITE_FALA);
    expect(curto.endsWith(".")).toBe(true);
  });
  it("sem frase inteira, corta nas palavras", () => {
    const curto = encurtarFala("palavra ".repeat(40));
    expect(curto.length).toBeLessThanOrEqual(LIMITE_FALA);
    expect(curto.endsWith("…")).toBe(true);
  });
});
