import { describe, expect, it } from "vitest";
import { iniciarCalibragem, responderCalibragem, resultadoCalibragem, type RegrasCalibragem } from "./calibragem";
import type { ResultadoEvidencia } from "../dominio/evidencias";

const REGRAS: RegrasCalibragem = {
  degraus: [
    { degrau: 1, conceito: "mul.grupos" },
    { degrau: 2, conceito: "div.partilha" },
    { degrau: 3, conceito: "div.resto" },
    { degrau: 4, conceito: "fra.parte" },
    { degrau: 5, conceito: "fra.quociente" },
    { degrau: 6, conceito: "pro.proporcao" },
  ],
  provaveisExtras: [{ conceito: "div.medida", minimo: 3 }],
  recomendacoes: [
    { minimo: 0, atividade: "m1" },
    { minimo: 2, atividade: "m2" },
    { minimo: 3, atividade: "m4" },
    { minimo: 5, atividade: "m5" },
  ],
  provas: [{ atividade: "m1", minimo: 2 }],
};

function rodar(resultados: ResultadoEvidencia[]) {
  let e = iniciarCalibragem();
  const degraus: number[] = [];
  for (const r of resultados) {
    if (e.terminou) break;
    degraus.push(e.atual);
    e = responderCalibragem(e, r);
  }
  return { e, degraus };
}

describe("calibragem", () => {
  it("começa em D3 e sobe com sucesso até vencer D6", () => {
    const { e, degraus } = rodar(["sucesso", "sucesso", "sucesso", "sucesso"]);
    expect(degraus).toEqual([3, 4, 5, 6]);
    expect(e.terminou).toBe(true);
    const r = resultadoCalibragem(e.respostas, REGRAS);
    expect(r.maiorDegrau).toBe(6);
    expect(r.alemDoArco).toBe(true);
    expect(r.recomendacao).toBe("m5");
  });

  it("termina ao falhar tendo vencido o de baixo", () => {
    const { e, degraus } = rodar(["sucesso", "falha", "sucesso"]);
    expect(degraus).toEqual([3, 4]);
    expect(e.terminou).toBe(true);
    const r = resultadoCalibragem(e.respostas, REGRAS);
    expect(r.maiorDegrau).toBe(3);
    expect(r.provaveis.sort()).toEqual(["div.medida", "div.partilha", "div.resto", "mul.grupos"]);
    expect(r.recomendacao).toBe("m4");
  });

  it("desce com falha ou 'não sei ainda' e para ao achar a fronteira por baixo", () => {
    const { e, degraus } = rodar(["nao_sei", "sucesso"]);
    expect(degraus).toEqual([3, 2]);
    expect(e.terminou).toBe(true);
    expect(resultadoCalibragem(e.respostas, REGRAS).recomendacao).toBe("m2");
  });

  it("termina ao falhar D1", () => {
    const { e, degraus } = rodar(["falha", "falha", "falha"]);
    expect(degraus).toEqual([3, 2, 1]);
    expect(e.terminou).toBe(true);
    const r = resultadoCalibragem(e.respostas, REGRAS);
    expect(r.maiorDegrau).toBe(0);
    expect(r.recomendacao).toBe("m1");
  });

  it("nunca passa de seis interações", () => {
    const { e } = rodar(["sucesso", "sucesso", "sucesso", "falha", "sucesso", "falha", "sucesso", "sucesso"]);
    expect(e.respostas.length).toBeLessThanOrEqual(6);
    expect(e.terminou).toBe(true);
  });
});
