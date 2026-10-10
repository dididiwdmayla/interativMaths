import { describe, expect, it } from "vitest";
import { criarBancada, operar, operarVarias } from "@/nucleo/maquinas/bancada/bancada";
import { medir } from "@/nucleo/maquinas/bancada/medidas";
import { validarBancada } from "@/nucleo/maquinas/bancada/validadores";
import { comoRacional, igual } from "@/nucleo/racional/racional";
import { CONCEITOS } from "./conceitos";
import { ITENS_CALIBRAGEM, REGRAS_CALIBRAGEM } from "./calibragem";
import { ATIVIDADES } from "./atividades";

describe("conteúdo: calibragem", () => {
  it("seis degraus, em ordem, com conceitos existentes", () => {
    expect(ITENS_CALIBRAGEM.map((i) => i.degrau)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const i of ITENS_CALIBRAGEM) expect(CONCEITOS.some((c) => c.id === i.conceito)).toBe(true);
    for (const d of REGRAS_CALIBRAGEM.degraus) expect(ITENS_CALIBRAGEM[d.degrau - 1].conceito).toBe(d.conceito);
  });

  it("cada degrau de máquina tem solução comprovada", () => {
    for (const i of ITENS_CALIBRAGEM) {
      if (i.tipo !== "maquina") continue;
      const b = operarVarias(criarBancada(i.maquina), i.solucao);
      expect(validarBancada(i.objetivo.validador, i.objetivo.params ?? {}, b.atual).ok, `D${i.degrau}`).toBe(true);
    }
  });

  it("cada degrau de resposta com máquina confere com a demonstração", () => {
    for (const i of ITENS_CALIBRAGEM) {
      if (i.tipo !== "resposta" || !i.maquina) continue;
      const b = operar(operarVarias(criarBancada(i.maquina), i.demonstracao ?? []), { tipo: "fechar" });
      expect(igual(medir(b.atual, "carga-por-bica"), comoRacional(i.esperado)), `D${i.degrau}`).toBe(true);
    }
  });

  it("recomendações e provas apontam para atividades existentes", () => {
    for (const r of [...REGRAS_CALIBRAGEM.recomendacoes, ...REGRAS_CALIBRAGEM.provas]) {
      expect(ATIVIDADES.some((a) => a.id === r.atividade), r.atividade).toBe(true);
    }
  });

  it("pedidos cabem numa linha", () => {
    for (const i of ITENS_CALIBRAGEM) expect(i.pedido.length).toBeLessThanOrEqual(44);
  });
});
