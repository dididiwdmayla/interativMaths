/**
 * Checagens das falas do Nônio: todo motivo e todo equívoco têm fala; rodando todas as soluções
 * de teste e sabotagens, cada fala da faixa cabe em 160 caracteres, sem marcador sobrando e
 * sem as palavras que julgam.
 */
import { describe, expect, it } from "vitest";
import { MOTIVOS_VALIDACAO } from "@/nucleo/maquinas/bancada/validadores";
import { aplicarEntrada, iniciarExecucao, palpiteDoPasso, passoAtual, passosDoModo, type Execucao } from "@/nucleo/missoes/motor";
import type { Atividade, Entrada, ModoExecucao } from "@/nucleo/missoes/tipos";
import { atividadeRevisita, atividadeSondagem } from "@/nucleo/geradores/atividades";
import { CONCEITOS_COM_GERADOR } from "@/nucleo/geradores/questoes";
import type { Postura } from "@/nucleo/progresso/tipos";
import { falaDeAbertura, falaDeAjuda, falaDeOferta, LIMITE_FALA, reagir } from "@/nucleo/tutor/reacoes";
import type { FalaFaixa } from "@/nucleo/tutor/fila";
import { ATIVIDADES } from "./atividades";
import { EQUIVOCOS } from "./equivocos";
import { PELES } from "./peles";
import { MOTIVOS, TEXTOS_REACAO } from "./reacoes";

const PROIBIDAS = /\berrad[oa]s?\b|\berro\b|\bincorret[oa]\b|\bfalhou\b|parab[eé]ns|muito bem|!/i;
const POSTURAS: readonly Postura[] = ["quieto", "disponivel", "presente"];

function conferirFala(f: FalaFaixa | null, onde: string): void {
  if (!f) return;
  expect(f.texto.length, `${onde}: "${f.texto}"`).toBeLessThanOrEqual(LIMITE_FALA);
  expect(f.texto, `${onde}: vazia`).not.toBe("");
  expect(f.texto, `${onde}: marcador sobrando`).not.toMatch(/[{}]/);
  expect(f.texto, `${onde}: palavra que julga`).not.toMatch(PROIBIDAS);
}

const ctx = { agora: 1, conceitoDoEquivoco: (id: string) => EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null };

function percorrer(a: Atividade, modo: ModoExecucao, entradas: readonly Entrada[], postura: Postura): void {
  let e: Execucao = iniciarExecucao(a, modo);
  for (const [i, entrada] of entradas.entries()) {
    const passo = passoAtual(a, e);
    if (!passo) break;
    const pele = e.bancada ? PELES[e.bancada.atual.config.pele] : null;
    conferirFala(falaDeAbertura(a, passo, e, TEXTOS_REACAO, pele), `${a.id}#${passo.id} abertura`);
    const r = aplicarEntrada(a, e, entrada, ctx);
    const pelePosterior = r.exec.bancada ? PELES[r.exec.bancada.atual.config.pele] : pele;
    const f = reagir({
      atividade: a,
      passo,
      antes: e,
      depois: r.exec,
      entrada,
      efeitos: r.efeitos,
      postura,
      textos: TEXTOS_REACAO,
      pele: pelePosterior,
      palpite: palpiteDoPasso(a, r.exec),
    });
    conferirFala(f, `${a.id}#${passo.id} entrada ${i} ${JSON.stringify(entrada)} (${postura})`);
    conferirFala(falaDeOferta(passo, r.exec, postura, TEXTOS_REACAO), `${a.id}#${passo.id} oferta`);
    e = r.exec;
  }
}

const GERADAS: Atividade[] = [1, 2, 3, 7, 11, 19, 23, 42].flatMap((semente) => [
  atividadeRevisita(["div.resto", "fra.quociente", "fra.parte"], semente, { titulo: "r", ideia: "r", abertura: [], fecho: [] }),
  ...CONCEITOS_COM_GERADOR.map((c) => atividadeSondagem(c, semente, { titulo: "s", ideia: "s", abertura: [], fecho: [] })),
]);

describe("falas do Nônio", () => {
  it("todo motivo de validação tem consequência", () => {
    for (const m of MOTIVOS_VALIDACAO) expect(MOTIVOS[m]?.consequencia.length, m).toBeGreaterThan(5);
  });

  it("todo equívoco tem consequência e pergunta", () => {
    for (const e of EQUIVOCOS) {
      expect(e.consequencia.length, e.id).toBeGreaterThan(10);
      expect(e.pergunta.length, e.id).toBeGreaterThan(5);
      expect(`${e.consequencia} ${e.pergunta}`, e.id).not.toMatch(PROIBIDAS);
    }
  });

  it.each(ATIVIDADES.map((a) => [a.id, a] as const))("soluções e sabotagens de %s: falas curtas e limpas", (_, a) => {
    for (const postura of POSTURAS) {
      for (const s of [...a.solucoesDeTeste, ...a.sabotagens]) percorrer(a, s.modo, s.entradas, postura);
    }
  });

  it("degraus de ajuda de todo passo cabem na faixa", () => {
    for (const a of [...ATIVIDADES, ...GERADAS]) {
      for (const modo of ["guiada", "prova"] as const) {
        let e = iniciarExecucao(a, modo);
        for (let i = 0; i < passosDoModo(a, modo).length; i++) {
          const passo = passosDoModo(a, modo)[i];
          e = { ...e, indice: i };
          const pele = e.bancada ? PELES[e.bancada.atual.config.pele] : null;
          for (const ajuda of [1, 2, 3, 4] as const) {
            conferirFala(falaDeAjuda(passo, { ...e, passo: { ...e.passo, ajuda } }, TEXTOS_REACAO, pele), `${a.id}#${passo.id} ajuda ${ajuda}`);
          }
          conferirFala(falaDeAbertura(a, passo, e, TEXTOS_REACAO, pele), `${a.id}#${passo.id} abertura`);
        }
      }
    }
  });

  it("geradas: uma resposta que não bate e outra certa têm falas limpas", () => {
    for (const a of GERADAS) {
      const entradas: Entrada[] = [{ tipo: "seguir" }];
      for (const p of a.passos) {
        if (p.tipo !== "prever") continue;
        entradas.push({ tipo: "responder", valor: p.respostasEquivoco?.[0]?.resposta ?? "1" }, { tipo: "responder", valor: null }, { tipo: "seguir" });
      }
      for (const postura of POSTURAS) percorrer(a, "guiada", entradas, postura);
    }
  });
});
