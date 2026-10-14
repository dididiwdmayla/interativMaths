import { describe, expect, it } from "vitest";
import { lerToken } from "./lerToken";

/** Luminância relativa (WCAG) de uma cor em hexadecimal de seis dígitos. */
function luz(hex: string): number {
  const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

/** Contraste WCAG entre duas cores. */
function contraste(a: string, b: string): number {
  const [x, y] = [luz(a), luz(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const PARES: [string, string, number][] = [
  ["tinta", "folha", 7],
  ["tinta", "papel", 7],
  ["tinta-suave", "folha", 4.5],
  ["tinta-suave", "grafite-claro", 4.5],
  ["caneta", "folha", 4.5],
  ["sobre-caneta", "caneta", 4.5],
  ["sobre-marca", "marca-texto", 4.5],
  ["sobre-marca", "bilhete", 4.5],
  ["sobre-verde", "verde-escuro", 4.5],
  ["verde-tinta", "verde-palido", 4.5],
  ["tinta", "caneta-palida", 4.5],
  ["tinta", "marca-texto-palido", 4.5],
];

describe("tokens: contraste nos dois modos", () => {
  for (const tema of ["claro", "escuro"] as const) {
    it(`texto legível no ${tema}`, () => {
      for (const [texto, fundo, minimo] of PARES) {
        const c = contraste(lerToken(texto, tema), lerToken(fundo, tema));
        expect(c, `${tema}: ${texto} sobre ${fundo} = ${c.toFixed(1)}`).toBeGreaterThanOrEqual(minimo);
      }
    });
  }

  it("no escuro, a sombra dura fica mais escura que o papel e objetos não invertem", () => {
    expect(luz(lerToken("sombra", "escuro"))).toBeLessThan(luz(lerToken("papel", "escuro")));
    for (const objeto of ["marca-texto", "nonio-rosto", "nonio-aba", "nonio-olho", "sobre-marca"]) expect(lerToken(objeto, "escuro")).toBe(lerToken(objeto));
  });
});
