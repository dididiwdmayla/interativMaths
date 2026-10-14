import { describe, expect, it } from "vitest";
import { CONCEITOS } from "@/conteudo/conceitos";
import { AREAS } from "@/conteudo/areas";
import { ATIVIDADES } from "@/conteudo/atividades";
import { DEGUSTACAO } from "@/conteudo/degustacao";
import { linhaFormal, nomeFormal } from "./formal";

const porId = (id: string) => ATIVIDADES.find((a) => a.id === id)!;

describe("nome formal", () => {
  it("missões: área e conteúdo dos conceitos", () => {
    const m4 = nomeFormal(porId("partilha.arco1.pao-nao-e-saca"), CONCEITOS, AREAS);
    expect(m4).toEqual({ area: "Aritmética", conteudo: "Frações", etiqueta: "Frações: parte e divisão" });
    expect(linhaFormal("Missão 4", m4)).toEqual({ cheia: "Missão 4 · Aritmética · Frações", curta: "Missão 4 · Frações" });
    expect(nomeFormal(porId("partilha.arco1.sobrou"), CONCEITOS, AREAS).conteudo).toBe("Divisão com resto");
    expect(nomeFormal(porId("partilha.arco1.carga-igual"), CONCEITOS, AREAS).etiqueta).toBe("Divisão exata: repartir em partes iguais");
    expect(nomeFormal(porId("partilha.arco1.encomenda"), CONCEITOS, AREAS).conteudo).toBe("Frações: aplicação");
  });

  it("toda atividade tem área e conteúdo, sem ano escolar", () => {
    for (const a of [...ATIVIDADES, DEGUSTACAO]) {
      const n = nomeFormal(a, CONCEITOS, AREAS);
      expect(n.conteudo, a.id).not.toBe("");
      expect(n.area ?? "Aritmética", a.id).toBe("Aritmética");
    }
    for (const c of CONCEITOS) {
      for (const t of [c.formal, c.formalCurto]) expect(t).not.toMatch(/\d\s*º|\bano\b|\bsérie\b|EF\d/i);
    }
  });
});
