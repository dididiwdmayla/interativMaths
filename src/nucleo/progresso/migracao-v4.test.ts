/**
 * O progresso salvo pela v0.4 (versão 3) abre na v0.5. A amostra foi gravada pelo código da v0.4:
 * o Arco 1 inteiro, o Museu e a Rua feitos, a Joia do Ábaco encontrada (bruta), a aparência
 * escura e duas apresentações vistas.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { armazenamentoEmMemoria, carregarProgresso, CHAVE_PROGRESSO, migrar, normalizar, VERSAO_PROGRESSO } from "./index";

const AMOSTRA = readFileSync(join(__dirname, "amostras", "progresso-v3.json"), "utf8");
const AGORA = 1_760_500_000_000;

function abrir() {
  return carregarProgresso(armazenamentoEmMemoria({ [CHAVE_PROGRESSO]: AMOSTRA }), AGORA);
}

describe("progresso v3 (v0.4) na v0.5", () => {
  it("abre sem aviso, na versão 4, com a joia encontrada e o treino vazio", () => {
    const original = JSON.parse(AMOSTRA);
    expect(original.versao).toBe(3);
    expect(VERSAO_PROGRESSO).toBe(4);
    const { progresso, aviso } = abrir();
    expect(aviso).toBeNull();
    expect(progresso.versao).toBe(4);
    expect(progresso.joias.abaco).toEqual({ ...original.joias.abaco, treino: {}, rodada: null });
    expect(progresso.joias.abaco.encontrada).toBe(true);
    expect(progresso.joias.abaco.estagio).toBe(0);
  });

  it("o resto fica como estava", () => {
    const original = JSON.parse(AMOSTRA);
    const { progresso } = abrir();
    expect(progresso.preferencias).toEqual(original.preferencias);
    expect(progresso.apresentacoes).toEqual(original.apresentacoes);
    expect(progresso.evidencias).toEqual(original.evidencias);
    expect(progresso.caderno).toEqual(original.caderno);
    expect(progresso.campanha).toEqual(original.campanha);
    expect(progresso.museu).toEqual(original.museu);
    expect(progresso.cenas).toEqual(original.cenas);
    expect(progresso.relogio).toEqual(original.relogio);
  });

  it("treino e rodada estranhos caem fora, campo a campo", () => {
    const base = JSON.parse(AMOSTRA);
    const doc = migrar(base).doc;
    const mexido = {
      ...doc,
      joias: {
        abaco: {
          ...base.joias.abaco,
          tecnicas: ["soroban.ler", "soroban.ler", 3],
          treino: {
            "soroban.ler": { limpos: 7.6, apresentadaEm: 10, rodadas: [{ momento: 1, nivel: "sozinho" }, { momento: "x" }, { momento: 2 }, { momento: 3 }, { momento: 4 }, { momento: 5 }], firmeEm: 9 },
            ruim: "nada",
          },
          rodada: { itens: [], feitos: [] },
        },
      },
    };
    const j = normalizar(mexido, AGORA).joias.abaco;
    expect(j.tecnicas).toEqual(["soroban.ler"]);
    expect(Object.keys(j.treino)).toEqual(["soroban.ler"]);
    const ler = j.treino["soroban.ler"];
    expect(ler.limpos).toBe(7);
    // A primeira rodada fica; das outras, as mais recentes.
    expect(ler.rodadas.map((r) => r.momento)).toEqual([1, 3, 4, 5]);
    expect(j.rodada).toBeNull();
  });
});
