import { describe, expect, it } from "vitest";
import { criarBancada, operarVarias } from "@/nucleo/maquinas/bancada/bancada";
import { igualdadeVerdadeira, missaoQueRestaura } from "@/nucleo/manual/manual";
import { medidasVivas } from "@/nucleo/missoes/motor";
import { ATIVIDADES } from "./atividades";
import { CONCEITOS } from "./conceitos";
import { EQUIVOCOS } from "./equivocos";
import { CONCEITOS_A_LAPIS, PAGINAS_MANUAL } from "./manual";

describe("conteúdo: o Manual", () => {
  it("uma página por conceito ensinado; os outros, a lápis", () => {
    const comPagina = PAGINAS_MANUAL.map((p) => p.conceito);
    const aLapis = CONCEITOS_A_LAPIS.map((l) => l.conceito);
    for (const c of CONCEITOS) {
      const ensinado = missaoQueRestaura(c.id, ATIVIDADES) !== null;
      expect(comPagina.includes(c.id), c.id).toBe(ensinado);
      expect(aLapis.includes(c.id), c.id).toBe(!ensinado);
    }
    expect(new Set(PAGINAS_MANUAL.map((p) => p.slug)).size).toBe(PAGINAS_MANUAL.length);
  });

  it("todo exemplo de 'Como se escreve' é verdadeiro, e os termos estão nele", () => {
    for (const p of PAGINAS_MANUAL) {
      expect(igualdadeVerdadeira(p.escrita.exemplo), p.escrita.exemplo).toBe(true);
      expect(igualdadeVerdadeira(p.escrita.forma), p.escrita.forma).toBe(true);
      const numeros = p.escrita.exemplo.split(/[\s,]+/);
      for (const t of p.escrita.termos) expect(numeros, `${p.slug}: ${t.valor}`).toContain(t.valor);
      expect(p.escrita.termos.filter((t) => t.marca)).toHaveLength(1);
    }
  });

  it("o desenho de 'Na máquina', montado pelo núcleo, mostra os números do exemplo", () => {
    for (const p of PAGINAS_MANUAL) {
      const b = operarVarias(criarBancada(p.maquina.config), p.maquina.acoes);
      const medidas = medidasVivas(b.atual);
      const valores = p.escrita.termos.map((t) => t.valor);
      for (const [chave, valor] of Object.entries(p.maquina.mostra)) {
        expect(medidas[chave], `${p.slug}: ${chave}`).toBe(valor);
        if (valor !== "0") expect(valores, `${p.slug}: ${chave} = ${valor}`).toContain(valor);
      }
    }
  });

  it("todo equívoco citado existe e tem a explicação do Manual", () => {
    for (const p of PAGINAS_MANUAL) {
      for (const id of p.cuidado) expect(EQUIVOCOS.find((e) => e.id === id)?.manual, `${p.slug}: ${id}`).toBeTruthy();
      expect(p.nomes.length).toBeGreaterThan(0);
      expect(p.valeSempre.length).toBeGreaterThanOrEqual(2);
      expect(p.valeSempre.length).toBeLessThanOrEqual(3);
    }
  });
});
