/**
 * O progresso salvo pela v0.3 (versão 2) abre na v0.4. A amostra foi gravada pelo código da v0.3:
 * missões 1 a 3 concluídas com as páginas no Caderno, a Missão 4 parada no meio, preferências
 * fora do padrão e duas apresentações vistas.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { restaurarExecucao } from "../missoes/efeitos";
import { passosDoModo } from "../missoes/motor";
import { armazenamentoEmMemoria, carregarProgresso, CHAVE_PROGRESSO, migrar, normalizar, VERSAO_PROGRESSO } from "./index";

const AMOSTRA = readFileSync(join(__dirname, "amostras", "progresso-v2.json"), "utf8");
const AGORA = 1_760_300_000_000;

function abrir() {
  return carregarProgresso(armazenamentoEmMemoria({ [CHAVE_PROGRESSO]: AMOSTRA }), AGORA);
}

describe("progresso v2 (v0.3) na v0.4", () => {
  it("abre sem aviso, na versão atual, com a aparência automática e o resto intacto", () => {
    const original = JSON.parse(AMOSTRA);
    expect(original.versao).toBe(2);
    const { progresso, aviso } = abrir();
    expect(aviso).toBeNull();
    expect(progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(progresso.preferencias).toEqual({ ...original.preferencias, aparencia: "automatico" });
    expect(progresso.apresentacoes).toEqual(original.apresentacoes);
    expect(progresso.evidencias).toEqual(original.evidencias);
    expect(progresso.caderno).toEqual(original.caderno);
    expect(progresso.campanha).toEqual(original.campanha);
  });

  it("a Missão 4 parada no meio continua de onde estava", () => {
    const { progresso } = abrir();
    const r = restaurarExecucao(progresso.campanha.execucoes[MISSAO_4.id], MISSAO_4, (m) => passosDoModo(MISSAO_4, m).length);
    expect(r).not.toBeNull();
    expect(r?.indice).toBe(1);
    expect(r?.bancada?.passado.length).toBeGreaterThan(0);
  });

  it("a migração respeita uma aparência já escolhida e corrige valor estranho", () => {
    const base = JSON.parse(AMOSTRA);
    const escuro = migrar({ ...base, preferencias: { ...base.preferencias, aparencia: "escuro" } }).doc;
    expect(normalizar(escuro, AGORA).preferencias.aparencia).toBe("escuro");
    const estranho = migrar({ ...base, preferencias: { ...base.preferencias, aparencia: "roxo" } }).doc;
    expect(normalizar(estranho, AGORA).preferencias.aparencia).toBe("automatico");
  });
});
