import { describe, expect, it } from "vitest";
import { indexarConceitos, ordemTopologica } from "@/nucleo/curriculo/curriculo";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "./conceitos";

describe("conteúdo: conceitos", () => {
  it("ids únicos e dependências existentes, sem ciclo", () => {
    const mapa = indexarConceitos(CONCEITOS);
    for (const conceito of CONCEITOS) {
      for (const dep of conceito.dependeDe) expect(mapa.has(dep), `${conceito.id} → ${dep}`).toBe(true);
    }
    expect(ordemTopologica(CONCEITOS)).toHaveLength(CONCEITOS.length);
  });

  it("os ids publicados desta versão existem", () => {
    const ids = CONCEITOS.map((c) => c.id);
    for (const id of [
      "mul.grupos",
      "div.partilha",
      "div.medida",
      "div.resto",
      "fra.parte",
      "fra.quociente",
      "fra.equivalencia",
      "fra.comparacao",
      "fra.de-quantidade",
      "raz.razao",
      "pro.proporcao",
      "est.plausibilidade",
    ]) {
      expect(ids).toContain(id);
    }
    for (const id of CONCEITOS_DO_ARCO_1) expect(CONCEITOS.find((c) => c.id === id)?.situacao).toBe("ativo");
  });
});
