/**
 * Todo passo publicado tem contexto para a conversa: a execução de referência alcança o passo,
 * o system sai montado e o esquema só aceita partes que existem na máquina.
 */
import { describe, expect, it } from "vitest";
import { ATIVIDADES } from "@/conteudo/atividades";
import { passosDoModo } from "@/nucleo/missoes/motor";
import { montarContexto, esquemaDaSaida } from "./contexto";

describe("contexto da conversa", () => {
  for (const a of ATIVIDADES) {
    it(`${a.id}: todo passo monta contexto`, () => {
      for (const modo of ["guiada", "prova"] as const) {
        for (const p of passosDoModo(a, modo)) {
          const ctx = montarContexto({
            atividade: a.id,
            passo: p.id,
            modo,
            situacao: "ativo",
            degrau: 0,
            maquina: "",
            equivocos: [],
            historico: [],
            pergunta: "O que eu faço?",
          });
          expect(ctx, `${modo}#${p.id}`).not.toBeNull();
          expect(ctx?.system).toContain(p.instrucao);
          if (p.tipo === "prever" || p.tipo === "aposta") expect(ctx?.segredos.length, `${p.id} sem segredo`).toBeGreaterThan(0);
          if (p.fase === "aplicacao" || modo === "prova") expect(ctx?.system).toContain("só esclareça");
          const esquema = JSON.stringify(esquemaDaSaida(ctx?.alvos ?? []));
          expect(esquema).toContain('"additionalProperties":false');
        }
      }
    });
  }
});
