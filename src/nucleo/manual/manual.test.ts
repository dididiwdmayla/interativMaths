import { describe, expect, it } from "vitest";
import type { Evidencia } from "../dominio/evidencias";
import { progressoNovo, type PaginaCaderno, type Progresso } from "../progresso/tipos";
import { igualdadeVerdadeira, missaoQueRestaura, paginasRestauradas } from "./manual";

const ATIVIDADES = [
  { id: "m1", tipo: "missao" as const, conceitos: ["div.partilha"], numero: 1 },
  { id: "m4", tipo: "missao" as const, conceitos: ["fra.parte", "fra.quociente"], numero: 4 },
  { id: "eco", tipo: "eco" as const, conceitos: ["div.resto"] },
];

const pagina = (atividade: string): PaginaCaderno => ({ id: atividade, atividade, titulo: "", frase: "", notacao: [], volta: null, notas: [], maquina: null, registradaEm: 1 });

const sucesso = (conceito: string, contexto: string, tipo: Evidencia["tipo"], momento: number): Evidencia =>
  ({ conceito, contexto, tipo, momento, resultado: "sucesso", ajuda: 0 });

describe("restauração do Manual", () => {
  it("começa toda rasgada", () => {
    expect(paginasRestauradas(progressoNovo(0), ATIVIDADES).size).toBe(0);
  });

  it("a página no Caderno, de uma missão que ensina, restaura os conceitos dela", () => {
    const p: Progresso = { ...progressoNovo(0), caderno: [pagina("m4")] };
    expect([...paginasRestauradas(p, ATIVIDADES)].sort()).toEqual(["fra.parte", "fra.quociente"]);
  });

  it("página de quem não é missão não restaura", () => {
    const p: Progresso = { ...progressoNovo(0), caderno: [pagina("eco")] };
    expect(paginasRestauradas(p, ATIVIDADES).size).toBe(0);
  });

  it("conceito dominado restaura, mesmo sem página (a prova direta, as revisitas)", () => {
    const evidencias = [sucesso("div.partilha", "a", "aplicacao", 1), sucesso("div.partilha", "b", "transferencia", 2)];
    const p: Progresso = { ...progressoNovo(0), evidencias };
    expect([...paginasRestauradas(p, ATIVIDADES)]).toEqual(["div.partilha"]);
  });

  it("a missão que restaura é a primeira que ensina", () => {
    expect(missaoQueRestaura("fra.quociente", ATIVIDADES)?.numero).toBe(4);
    expect(missaoQueRestaura("div.resto", ATIVIDADES)).toBeNull();
  });
});

describe("igualdades do Manual", () => {
  it("confere com Racional", () => {
    expect(igualdadeVerdadeira("24 ÷ 4 = 6")).toBe(true);
    expect(igualdadeVerdadeira("26 = 4 × 6 + 2")).toBe(true);
    expect(igualdadeVerdadeira("3 ÷ 4 = 3/4")).toBe(true);
    expect(igualdadeVerdadeira("5 ÷ 4 = 1 1/4")).toBe(true);
    expect(igualdadeVerdadeira("26 ÷ 4 = 6, resto 2")).toBe(true);
    expect(igualdadeVerdadeira("26 ÷ 4 = 5, resto 6")).toBe(false);
    expect(igualdadeVerdadeira("24 ÷ 4 = 5")).toBe(false);
    expect(igualdadeVerdadeira("4 ÷ 0 = 0")).toBe(false);
  });
});
