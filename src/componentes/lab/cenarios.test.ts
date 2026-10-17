/** Os saltos do laboratório da Joia do Ábaco dão o que prometem (montados rodando o motor). */
import { describe, expect, it } from "vitest";
import { JOIAS } from "@/conteudo/joias";
import { PARAMETROS_LAPIDACAO } from "@/conteudo/lapidacao";
import { situacaoDaTecnica, treinoDe } from "@/nucleo/joias/treino";
import { jogarRodadaDoAbaco } from "@/nucleo/joias/abaco";
import { relogioDoJogo } from "@/nucleo/progresso";
import { lanceAtual, restaurarItem, type ItemRodada } from "@/nucleo/soroban/item";
import {
  progressoAbacoCincoEsperando,
  progressoAbacoCincoFirmando,
  progressoAbacoEncontrado,
  progressoAbacoLapidado,
  progressoAbacoPolido,
  progressoAbacoQuaseLapidado,
  progressoAbacoRodadaNoMeio,
  progressoAbacoTalhado,
} from "./cenarios";

const AGORA = 1_760_700_000_000;
const ABACO = JOIAS.find((j) => j.id === "abaco") ?? JOIAS[0];
const C5 = ABACO.tecnicas[2];

function agoraDoJogo(p: { relogio: { deslocamentoMs: number } }) {
  return relogioDoJogo(p.relogio.deslocamentoMs, () => AGORA).agora();
}

describe("saltos do Ábaco no laboratório", () => {
  it("encontrado, talhado, lapidado e polido", () => {
    expect(progressoAbacoEncontrado(AGORA).joias.abaco).toMatchObject({ encontrada: true, estagio: 0 });
    expect(progressoAbacoTalhado(AGORA).joias.abaco.estagio).toBe(1);
    expect(progressoAbacoLapidado(AGORA).joias.abaco.estagio).toBe(2);
    expect(progressoAbacoPolido(AGORA).joias.abaco.estagio).toBe(3);
  });

  it("prestes a lapidar: talhada, e a próxima rodada perfeita lapida", () => {
    const p = progressoAbacoQuaseLapidado(AGORA);
    expect(p.joias.abaco.estagio).toBe(1);
    expect(jogarRodadaDoAbaco(ABACO, p.joias.abaco, PARAMETROS_LAPIDACAO, agoraDoJogo(p)).estagioDepois).toBe(2);
  });

  it("talhado com o 5 firmando, e com o 5 esperando", () => {
    const f = progressoAbacoCincoFirmando(AGORA);
    expect(situacaoDaTecnica(C5, treinoDe(f.joias.abaco, C5.id), PARAMETROS_LAPIDACAO, agoraDoJogo(f))).toBe("firmando");
    expect(treinoDe(f.joias.abaco, C5.id).rodadas).toHaveLength(1);
    const e = progressoAbacoCincoEsperando(AGORA);
    expect(situacaoDaTecnica(C5, treinoDe(e.joias.abaco, C5.id), PARAMETROS_LAPIDACAO, agoraDoJogo(e))).toBe("esperando");
  });

  it("a rodada parada no meio de um lance volta no mesmo lance", () => {
    const p = progressoAbacoRodadaNoMeio(AGORA);
    const r = p.joias.abaco.rodada;
    expect(r?.feitos).toHaveLength(1);
    const item = restaurarItem(JSON.parse(JSON.stringify(r?.aberto)), r?.itens[1] as ItemRodada);
    expect(item).not.toBeNull();
    expect(item && lanceAtual(item)?.indice).toBe(1);
    expect(item?.aberto.movimentos.length).toBe(1);
    // O relógio do jogo está depois de tudo o que aconteceu.
    expect(agoraDoJogo(p)).toBeGreaterThanOrEqual(r?.iniciadaEm ?? Infinity);
  });
});
