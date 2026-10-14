/**
 * Checagens das atividades geradas: a revisita e a sondagem, para várias sementes, rodam inteiras
 * no motor com as respostas certas e geram evidências do tipo certo.
 */
import { describe, expect, it } from "vitest";
import { atividadeRevisita, atividadeSondagem } from "@/nucleo/geradores/atividades";
import { CONCEITOS_COM_GERADOR, conceitosDaRevisita } from "@/nucleo/geradores/questoes";
import { aplicarEntrada, conferirPrevisao, iniciarExecucao, type Efeito } from "@/nucleo/missoes/motor";
import { problemasDaInstrucao } from "@/nucleo/missoes/instrucao";
import type { Atividade } from "@/nucleo/missoes/tipos";
import { TEXTOS_REVISITA, TEXTOS_SONDAGEM } from "./chamados";

function rodarCerto(a: Atividade) {
  let e = iniciarExecucao(a, "guiada");
  const efeitos: Efeito[] = [];
  const ctx = { agora: 5000, conceitoDoEquivoco: () => null };
  for (let guarda = 0; guarda < 40 && !e.concluida; guarda++) {
    const p = a.passos[e.indice];
    let entrada: Parameters<typeof aplicarEntrada>[2] = { tipo: "seguir" };
    if (p.tipo === "prever" && e.passo.situacao === "ativo" && e.passo.inicio) entrada = { tipo: "responder", valor: conferirPrevisao(p, e.passo.inicio).esperado };
    const r = aplicarEntrada(a, e, entrada, ctx);
    e = r.exec;
    efeitos.push(...r.efeitos);
  }
  return { e, efeitos };
}

describe("atividades geradas", () => {
  it("todo passo gerado diz, com verbo, o que fazer", () => {
    for (let semente = 1; semente < 80; semente++) {
      const geradas = [
        atividadeRevisita(conceitosDaRevisita(["div.resto", "fra.quociente", "fra.parte", "div.partilha", "div.medida"]), semente, TEXTOS_REVISITA),
        ...CONCEITOS_COM_GERADOR.map((c) => atividadeSondagem(c, semente, TEXTOS_SONDAGEM)),
      ];
      for (const a of geradas) for (const p of a.passos) expect(problemasDaInstrucao(p.instrucao), `${a.id}#${p.id} (${semente}): "${p.instrucao}"`).toEqual([]);
    }
  });

  it("a revisita roda inteira e só gera evidência de revisita", () => {
    for (let semente = 1; semente < 60; semente++) {
      const a = atividadeRevisita(conceitosDaRevisita(["div.resto", "fra.quociente", "fra.parte"]), semente * 7919, TEXTOS_REVISITA);
      const { e, efeitos } = rodarCerto(a);
      expect(e.concluida).toBe(true);
      const evs = efeitos.flatMap((x) => (x.tipo === "evidencias" ? x.lista : []));
      expect(evs).toHaveLength(3);
      expect(evs.every((x) => x.tipo === "revisita" && x.resultado === "sucesso")).toBe(true);
      expect(new Set(a.passos.map((p) => p.id)).size).toBe(a.passos.length);
    }
  });

  it("a sondagem de cada conceito roda e gera evidência de sondagem", () => {
    for (const c of CONCEITOS_COM_GERADOR) {
      const a = atividadeSondagem(c, 3001, TEXTOS_SONDAGEM);
      const { e, efeitos } = rodarCerto(a);
      expect(e.concluida).toBe(true);
      const evs = efeitos.flatMap((x) => (x.tipo === "evidencias" ? x.lista : []));
      expect(evs).toEqual([expect.objectContaining({ conceito: c, tipo: "sondagem", resultado: "sucesso" })]);
    }
  });
});
