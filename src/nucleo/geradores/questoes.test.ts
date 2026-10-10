import { describe, expect, it } from "vitest";
import { criarBancada, operar, operarVarias } from "../maquinas/bancada/bancada";
import { medir } from "../maquinas/bancada/medidas";
import { validarBancada } from "../maquinas/bancada/validadores";
import { comoRacional, divide, formatar, igual, inteiro } from "../racional/racional";
import { conferirResposta } from "../missoes/respostas";
import { CONCEITOS_COM_GERADOR, conceitosDaRevisita, gerarQuestao } from "./questoes";

describe("gerador de questões", () => {
  it.each(CONCEITOS_COM_GERADOR.map((c) => [c]))("%s: cada semente gera uma questão que a máquina confere", (conceito) => {
    for (let semente = 1; semente <= 300; semente++) {
      const q = gerarQuestao(conceito, semente);
      expect(q.pedido.length, q.pedido).toBeLessThanOrEqual(44);
      expect(q.dicas).toHaveLength(3);
      const inicio = criarBancada(q.maquina?.config ?? { pele: "sacas-carrocas", pecas: { quantidade: 0 }, bicas: { quantidade: 1, ajustavel: false } });
      const final = operarVarias(inicio, q.demonstracao);
      // A demonstração nunca engasga nem é recusada.
      expect(final.atual.evento?.tipo, `${conceito} #${semente}`).toBe("volta");
      const config = final.atual.config;
      // E passa pelo mesmo validador das missões.
      if (config.teto !== undefined) {
        expect(validarBancada("transporte.tudo-saiu", { teto: config.teto }, final.atual).ok).toBe(true);
      } else if (config.pecas.quantidade === 1 && config.bicas.quantidade === 1) {
        const carga = medir(final.atual, "carga-por-bica");
        expect(validarBancada("partilha.carga-exata", { carga: formatar(carga), sobra: formatar(medir(final.atual, "sobra")) }, final.atual).ok).toBe(true);
      } else {
        expect(validarBancada("partilha.fechada", {}, final.atual).ok, `${conceito} #${semente}`).toBe(true);
      }
      const valor = medir(operar(final, { tipo: "fechar" }).atual, q.medida ?? "carga-por-bica");
      // A resposta certa é aceita; "não sei" é aceito como não sei.
      expect(conferirResposta(formatar(valor), q.resposta.tipo === "opcoes" ? formatar(valor) : valor).certa).toBe(true);
      if (conceito === "fra.quociente") {
        const a = config.pecas.quantidade;
        const b = config.bicas.quantidade;
        expect(igual(valor, divide(inteiro(a), inteiro(b)))).toBe(true);
      }
      for (const r of q.respostasEquivoco ?? []) expect(igual(comoRacional(r.resposta), valor)).toBe(false);
    }
  });

  it("mesma semente, mesma questão", () => {
    expect(gerarQuestao("div.resto", 42)).toEqual(gerarQuestao("div.resto", 42));
  });

  it("a revisita escolhe três perguntas pela preferência e repete se faltar conceito", () => {
    expect(conceitosDaRevisita(["div.partilha", "fra.parte", "div.resto", "div.medida"])).toEqual(["div.resto", "fra.parte", "div.partilha"]);
    expect(conceitosDaRevisita(["div.medida"])).toEqual(["div.medida", "div.medida", "div.medida"]);
    expect(conceitosDaRevisita([])).toEqual([]);
  });
});
