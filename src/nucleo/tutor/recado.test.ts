import { describe, expect, it } from "vitest";
import { categoriaComRecado, categoriaNotavel, frasesDe, LIMITE_RECADO, recadoCabe, recadoDaFala, recadoDoTexto } from "./recado";

describe("recado do Nônio", () => {
  it("separa as frases pelo ponto e pela interrogação", () => {
    expect(frasesDe("Sobrou uma broa. Pão a gente corta: em quantas partes?")).toEqual(["Sobrou uma broa.", "Pão a gente corta: em quantas partes?"]);
    expect(frasesDe("26 ÷ 4 = 6, resto 2. A bandeja é o resto")).toEqual(["26 ÷ 4 = 6, resto 2.", "A bandeja é o resto"]);
  });

  it("leva frases inteiras enquanto cabem em 60", () => {
    expect(recadoDoTexto("Travou duas vezes. Quer uma medida?")).toBe("Travou duas vezes. Quer uma medida?");
    expect(recadoDoTexto("Sobrou uma broa. Pão a gente corta: em quantas partes, para as quatro mesas ficarem iguais?")).toBe("Sobrou uma broa.");
    expect(recadoDoTexto("Repare nos medidores das carroças: todos precisam parar na mesma altura.")).toBeNull();
  });

  it("o recado do dado vence; sem ele, a primeira frase; a resposta livre longa é cortada nas palavras", () => {
    expect(recadoDaFala({ texto: "Uma frase bem comprida que não cabe de jeito nenhum no recado da bolinha do Nônio.", recado: "Curto." })).toBe("Curto.");
    expect(recadoDaFala({ texto: "Fechou. O resto é detalhe." })).toBe("Fechou. O resto é detalhe.");
    const cortado = recadoDaFala({ texto: "Uma frase bem comprida que não cabe de jeito nenhum no recado da bolinha do Nônio." });
    expect(cortado.length).toBeLessThanOrEqual(LIMITE_RECADO);
    expect(cortado.endsWith("…")).toBe(true);
    expect(recadoCabe({ texto: "Uma frase bem comprida que não cabe de jeito nenhum no recado da bolinha do Nônio." })).toBe(false);
  });

  it("a postura decide o que vira recado; a leitura da máquina não ganha ponto", () => {
    expect(categoriaComRecado("retorno", "quieto")).toBe(false);
    expect(categoriaComRecado("retorno", "disponivel")).toBe(true);
    expect(categoriaComRecado("passo", "disponivel")).toBe(true);
    expect(categoriaComRecado("oferta", "disponivel")).toBe(true);
    expect(categoriaComRecado("evento", "disponivel")).toBe(false);
    expect(categoriaComRecado("evento", "presente")).toBe(true);
    expect(categoriaComRecado("ajuda", "presente")).toBe(false);
    expect(categoriaNotavel("retorno")).toBe(true);
    expect(categoriaNotavel("evento")).toBe(false);
  });
});
