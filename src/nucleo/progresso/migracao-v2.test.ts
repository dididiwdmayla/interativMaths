/**
 * O progresso salvo pela v0.2 (versão 1) abre na v0.3. A amostra foi gravada pelo código da v0.2:
 * missão 1 concluída com página no Caderno, missão 4 parada no meio e o eco começado.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ATIVIDADES } from "@/conteudo/atividades";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { ECO_ARCO_1 } from "@/conteudo/eco";
import { restaurarExecucao } from "../missoes/efeitos";
import { iniciarExecucao, passosDoModo } from "../missoes/motor";
import { armazenamentoEmMemoria, carregarProgresso, CHAVE_PROGRESSO, marcarApresentacao, VERSAO_PROGRESSO, zerarApresentacoes } from "./index";

const AMOSTRA = readFileSync(join(__dirname, "amostras", "progresso-v1.json"), "utf8");
const AGORA = 1_760_100_000_000;

function abrir() {
  return carregarProgresso(armazenamentoEmMemoria({ [CHAVE_PROGRESSO]: AMOSTRA }), AGORA);
}

describe("progresso v1 (v0.2) na v0.3", () => {
  it("abre sem aviso, na versão nova, com tudo o que foi conquistado", () => {
    const original = JSON.parse(AMOSTRA);
    expect(original.versao).toBe(1);
    const { progresso, aviso } = abrir();
    expect(aviso).toBeNull();
    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(progresso.preferencias).toEqual({ ...original.preferencias, conversa: "ligada" });
    expect(progresso.apresentacoes).toEqual({});
    expect(progresso.evidencias).toEqual(original.evidencias);
    expect(progresso.caderno).toEqual(original.caderno);
    expect(progresso.campanha.atividades).toEqual(original.campanha.atividades);
    expect(progresso.campanha.concluidas).toEqual(original.campanha.concluidas);
  });

  it("a missão 4 parada no meio recomeça limpa, sem tocar no resto", () => {
    const { progresso } = abrir();
    const salva = progresso.campanha.execucoes[MISSAO_4.id];
    expect(salva).toMatchObject({ versao: 1, indice: 2 });
    const r = restaurarExecucao(salva, MISSAO_4, (m) => passosDoModo(MISSAO_4, m).length);
    expect(r).toBeNull();
    const nova = iniciarExecucao(MISSAO_4, "guiada");
    expect(nova.indice).toBe(0);
    expect(nova.versao).toBe(2);
    expect(progresso.campanha.atividades[MISSAO_4.id].status).toBe("em_andamento");
  });

  it("o eco começado segue de onde estava", () => {
    const { progresso } = abrir();
    const r = restaurarExecucao(progresso.campanha.execucoes[ECO_ARCO_1.id], ECO_ARCO_1, (m) => passosDoModo(ECO_ARCO_1, m).length);
    expect(r).not.toBeNull();
    expect(r?.indice).toBe(1);
    expect(r?.versao).toBe(2);
    expect(r?.passo.retorno).toBeNull();
  });

  it("execução v2 com passos que mudaram também recomeça", () => {
    const e = iniciarExecucao(MISSAO_4, "guiada");
    const mexida = { ...e, assinatura: `${e.assinatura}|outro:narrativa` };
    expect(restaurarExecucao(mexida, MISSAO_4, (m) => passosDoModo(MISSAO_4, m).length)).toBeNull();
    expect(restaurarExecucao(e, MISSAO_4, (m) => passosDoModo(MISSAO_4, m).length)).not.toBeNull();
  });

  it("toda atividade abre do começo na versão nova", () => {
    for (const a of ATIVIDADES) {
      const e = iniciarExecucao(a, "guiada");
      expect(restaurarExecucao(JSON.parse(JSON.stringify(e)), a, (m) => passosDoModo(a, m).length), a.id).not.toBeNull();
    }
  });

  it("apresentações: marcar uma vez, zerar no laboratório", () => {
    const { progresso } = abrir();
    const p1 = marcarApresentacao(progresso, "faixa", AGORA);
    expect(p1.apresentacoes).toEqual({ faixa: AGORA });
    expect(marcarApresentacao(p1, "faixa", AGORA + 5)).toBe(p1);
    expect(zerarApresentacoes(p1, AGORA).apresentacoes).toEqual({});
  });
});
