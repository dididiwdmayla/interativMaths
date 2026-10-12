/**
 * O gesto nunca entrega: em todo estado de toda solução de teste e de toda sabotagem, o gesto
 * escrito na tela não contém um segredo do passo (o valor que o jogador precisa achar).
 */
import { describe, expect, it } from "vitest";
import { proximoGesto } from "@/nucleo/missoes/gesto";
import { aplicarEntrada, iniciarExecucao, passoAtual, type Execucao } from "@/nucleo/missoes/motor";
import { segredos } from "@/nucleo/missoes/segredos";
import type { Atividade, Entrada, ModoExecucao } from "@/nucleo/missoes/tipos";
import { segredoEntregue } from "@/nucleo/tutor/guardas";
import { ATIVIDADES } from "./atividades";
import { GESTOS } from "./gestos";
import { PELES } from "./peles";
import { TEXTOS_REACAO } from "./reacoes";

const ctx = { agora: 1, conceitoDoEquivoco: () => null };

function conferir(a: Atividade, modo: ModoExecucao, entradas: readonly Entrada[]): string[] {
  const problemas: string[] = [];
  let e: Execucao = iniciarExecucao(a, modo);
  const olhar = () => {
    const p = passoAtual(a, e);
    if (!p) return;
    const g = proximoGesto(p, e, { textos: GESTOS, reacoes: TEXTOS_REACAO, pele: e.bancada ? PELES[e.bancada.atual.config.pele] : null });
    expect(g.texto.length, `${a.id}#${p.id}: "${g.texto}"`).toBeLessThanOrEqual(110);
    expect(g.texto, `${a.id}#${p.id}`).not.toMatch(/[{}]|errad|!/);
    const s = segredoEntregue(g.texto, segredos(p, e));
    if (s) problemas.push(`${a.id}#${p.id}: "${g.texto}" entrega ${s.origem} (${s.valor.n}/${s.valor.d}${s.texto ? ` ${s.texto}` : ""})`);
  };
  olhar();
  for (const ent of entradas) {
    e = aplicarEntrada(a, e, ent, ctx).exec;
    olhar();
  }
  return problemas;
}

describe("o gesto nunca entrega o segredo do passo", () => {
  it.each(ATIVIDADES.map((a) => [a.id, a] as const))("%s", (_, a) => {
    const problemas = [...a.solucoesDeTeste, ...a.sabotagens].flatMap((s) => conferir(a, s.modo, s.entradas));
    expect(problemas).toEqual([]);
  });
});
