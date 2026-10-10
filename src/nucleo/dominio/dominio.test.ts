import { describe, expect, it } from "vitest";
import {
  acrescentarEvidencias,
  evidenciasEmPalavras,
  MODELO_DOMINIO,
  revisitasDevidas,
  situacaoConceito,
  type Evidencia,
} from "./index";

const HORA = 3600_000;
let t = 1_000_000;
function ev(parcial: Partial<Evidencia>): Evidencia {
  t += 1000;
  return {
    conceito: "div.resto",
    tipo: "experimento",
    resultado: "sucesso",
    ajuda: 0,
    contexto: "m3",
    momento: t,
    ...parcial,
  };
}

describe("estado do conceito", () => {
  it("sem evidência é não avaliado", () => {
    expect(situacaoConceito("div.resto", [], t).estado).toBe("nao_avaliado");
  });

  it("concluir uma missão não domina: tudo no mesmo contexto", () => {
    const evs = [
      ev({ tipo: "experimento" }),
      ev({ tipo: "descoberta" }),
      ev({ tipo: "aplicacao" }),
    ];
    expect(situacaoConceito("div.resto", evs, t).estado).toBe("em_aprendizagem");
  });

  it("domina com dois contextos, um deles forte", () => {
    const evs = [ev({ tipo: "experimento", contexto: "m3" }), ev({ tipo: "aplicacao", contexto: "m4" })];
    expect(situacaoConceito("div.resto", evs, t).estado).toBe("dominado");
  });

  it("dois contextos fracos não bastam", () => {
    const evs = [ev({ tipo: "experimento", contexto: "m3" }), ev({ tipo: "descoberta", contexto: "m4" })];
    expect(situacaoConceito("div.resto", evs, t).estado).toBe("em_aprendizagem");
  });

  it("sucesso com ajuda 2 ou mais não conta", () => {
    const evs = [ev({ contexto: "m3" }), ev({ tipo: "aplicacao", contexto: "m4", ajuda: 2 })];
    expect(situacaoConceito("div.resto", evs, t).estado).toBe("em_aprendizagem");
    const comUm = [ev({ contexto: "m3" }), ev({ tipo: "aplicacao", contexto: "m4", ajuda: 1 })];
    expect(situacaoConceito("div.resto", comUm, t).estado).toBe("dominado");
  });

  it("calibragem só marca como provável", () => {
    const evs = [
      ev({ tipo: "calibragem", contexto: "calibragem" }),
      ev({ tipo: "aplicacao", contexto: "m3" }),
    ];
    const s = situacaoConceito("div.resto", evs, t);
    expect(s.provavel).toBe(true);
    expect(s.estado).toBe("em_aprendizagem");
  });

  it("consolida com revisita", () => {
    const evs = [
      ev({ contexto: "m3" }),
      ev({ tipo: "aplicacao", contexto: "m4" }),
      ev({ tipo: "revisita", contexto: "revisita" }),
    ];
    expect(situacaoConceito("div.resto", evs, t).estado).toBe("consolidado");
  });
});

describe("um erro nunca basta", () => {
  it("uma falha isolada não muda o estado", () => {
    const base = [ev({ contexto: "m3" }), ev({ tipo: "aplicacao", contexto: "m4" })];
    const antes = situacaoConceito("div.resto", base, t);
    const depois = situacaoConceito(
      "div.resto",
      [...base, ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m5" })],
      t,
    );
    expect(depois.estado).toBe(antes.estado);
    expect(depois.sondagemPendente).toBeNull();
  });

  it("duas falhas iguais no mesmo contexto não disparam sondagem", () => {
    const evs = [
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
    ];
    expect(situacaoConceito("div.resto", evs, t).sondagemPendente).toBeNull();
  });

  it("duas falhas iguais em atividades diferentes disparam sondagem, sem mudar estado", () => {
    const evs = [
      ev({ contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m4" }),
    ];
    const s = situacaoConceito("div.resto", evs, t);
    expect(s.sondagemPendente).toEqual({ equivoco: "parou-cedo" });
    expect(s.estado).toBe("em_aprendizagem");
  });

  it("falhas com equívocos diferentes não somam", () => {
    const evs = [
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "resto-jogado-fora", contexto: "m4" }),
    ];
    expect(situacaoConceito("div.resto", evs, t).sondagemPendente).toBeNull();
  });

  it("sondagem que falha leva a pede ajuste; dois sucessos novos devolvem", () => {
    const base = [
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m4" }),
      ev({ tipo: "sondagem", resultado: "falha", contexto: "sondagem" }),
    ];
    expect(situacaoConceito("div.resto", base, t).estado).toBe("pede_ajuste");
    const um = [...base, ev({ contexto: "m3" })];
    expect(situacaoConceito("div.resto", um, t).estado).toBe("pede_ajuste");
    const dois = [...um, ev({ contexto: "m3", tipo: "descoberta" })];
    expect(situacaoConceito("div.resto", dois, t).estado).toBe("em_aprendizagem");
  });

  it("sondagem bem-sucedida limpa a suspeita", () => {
    const evs = [
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m3" }),
      ev({ resultado: "falha", equivoco: "parou-cedo", contexto: "m4" }),
      ev({ tipo: "sondagem", resultado: "sucesso", contexto: "sondagem" }),
    ];
    const s = situacaoConceito("div.resto", evs, t);
    expect(s.sondagemPendente).toBeNull();
    expect(s.estado).toBe("em_aprendizagem");
  });
});

describe("revisita com relógio simulado", () => {
  it("aparece 20 horas depois do primeiro sucesso", () => {
    const inicio = 50 * HORA;
    const evs: Evidencia[] = [{ ...ev({}), momento: inicio }];
    expect(revisitasDevidas(["div.resto"], evs, inicio + 19 * HORA)).toHaveLength(0);
    const devidas = revisitasDevidas(["div.resto"], evs, inicio + MODELO_DOMINIO.esperaRevisitaMs);
    expect(devidas).toEqual([{ conceito: "div.resto", desde: inicio + 20 * HORA }]);
  });

  it("some depois de uma revisita bem-sucedida", () => {
    const inicio = 50 * HORA;
    const evs: Evidencia[] = [
      { ...ev({}), momento: inicio },
      { ...ev({ tipo: "revisita", contexto: "revisita" }), momento: inicio + 21 * HORA },
    ];
    expect(revisitasDevidas(["div.resto"], evs, inicio + 60 * HORA)).toHaveLength(0);
  });

  it("volta 20 horas depois de uma revisita que falhou", () => {
    const inicio = 50 * HORA;
    const evs: Evidencia[] = [
      { ...ev({}), momento: inicio },
      { ...ev({ tipo: "revisita", contexto: "revisita", resultado: "falha" }), momento: inicio + 21 * HORA },
    ];
    expect(revisitasDevidas(["div.resto"], evs, inicio + 30 * HORA)).toHaveLength(0);
    expect(revisitasDevidas(["div.resto"], evs, inicio + 41 * HORA)).toHaveLength(1);
  });
});

describe("registro", () => {
  it("respeita o teto preservando a calibragem", () => {
    const cal = ev({ tipo: "calibragem", contexto: "calibragem" });
    const muitas = Array.from({ length: 20 }, () => ev({}));
    const r = acrescentarEvidencias([cal], muitas, 10);
    expect(r).toHaveLength(10);
    expect(r[0]).toBe(cal);
  });

  it("descreve em palavras", () => {
    const linhas = evidenciasEmPalavras("repartiu com sobra", [
      ev({ contexto: "m3" }),
      ev({ contexto: "m4" }),
    ]);
    expect(linhas[0]).toBe("Você repartiu com sobra, sem ajuda, em duas situações.");
  });
});
