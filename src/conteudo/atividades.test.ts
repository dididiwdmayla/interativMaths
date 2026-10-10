/**
 * Checagens de conteúdo: é o que garante a matemática. Missão sem solução comprovada não é publicada.
 * Roda cada solução de teste no motor, sem navegador.
 */
import { describe, expect, it } from "vitest";
import { aplicarEntrada, iniciarExecucao, passosDoModo, type Efeito, type Execucao } from "@/nucleo/missoes/motor";
import type { Atividade, Entrada, ModoExecucao } from "@/nucleo/missoes/tipos";
import { situacaoConceito, type Evidencia } from "@/nucleo/dominio";
import { VALIDADORES_BANCADA } from "@/nucleo/maquinas/bancada/validadores";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "./conceitos";
import { EQUIVOCOS, MOTIVOS } from "./equivocos";
import { ATIVIDADES } from "./atividades";

export const TODAS: readonly Atividade[] = ATIVIDADES;

const ctx = (agora: number) => ({
  agora,
  conceitoDoEquivoco: (id: string) => EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null,
});

export function rodar(a: Atividade, modo: ModoExecucao, entradas: readonly Entrada[], agora = 1_000_000) {
  let exec: Execucao = iniciarExecucao(a, modo);
  const efeitos: Efeito[] = [];
  const travadas: string[] = [];
  entradas.forEach((ent, i) => {
    const antes = exec;
    const r = aplicarEntrada(a, exec, ent, ctx(agora + i * 1000));
    exec = r.exec;
    efeitos.push(...r.efeitos);
    if (r.exec === antes && r.efeitos.length === 0 && ent.tipo !== "dica") {
      travadas.push(`#${i} ${JSON.stringify(ent)} no passo ${passosDoModo(a, modo)[antes.indice]?.id}`);
    }
  });
  return { exec, efeitos, travadas };
}

const conceitosIds = new Set(CONCEITOS.map((c) => c.id));
const equivocosIds = new Set(EQUIVOCOS.map((e) => e.id));

describe.each(TODAS.map((a) => [a.id, a] as const))("atividade %s", (_, a) => {
  it("ids únicos e referências existentes", () => {
    for (const modo of ["guiada", "prova"] as const) {
      const ids = passosDoModo(a, modo).map((p) => p.id);
      expect(new Set(ids).size, `passos repetidos em ${modo}`).toBe(ids.length);
    }
    for (const c of a.conceitos) expect(conceitosIds.has(c), c).toBe(true);
    for (const p of [...a.passos, ...(a.prova ?? [])]) {
      for (const ev of p.evidencias ?? []) expect(conceitosIds.has(ev.conceito), `${p.id}: ${ev.conceito}`).toBe(true);
      for (const eq of p.equivocos ?? []) expect(equivocosIds.has(eq), `${p.id}: ${eq}`).toBe(true);
      if (p.tipo === "operar") expect(VALIDADORES_BANCADA).toContain(p.objetivo.validador);
      if (p.tipo === "prever") for (const r of p.respostasEquivoco ?? []) expect(equivocosIds.has(r.equivoco)).toBe(true);
    }
  });

  it("cada passo guiado de máquina ou previsão tem a escada de dicas", () => {
    for (const p of [...a.passos, ...(a.prova ?? [])]) {
      if (p.tipo === "operar" || p.tipo === "prever" || p.tipo === "frase") {
        expect(p.dicas?.length, `${p.id} sem escada`).toBe(3);
        expect(p.dicas?.[2].texto.length).toBeGreaterThan(0);
      }
    }
  });

  it("o pedido de cada passo cabe numa linha do celular", () => {
    for (const p of [...a.passos, ...(a.prova ?? [])]) expect(p.pedido.length, `${p.id}: ${p.pedido}`).toBeLessThanOrEqual(44);
  });

  it("a formalização começa com a própria máquina (para o modo registro)", () => {
    const formal = passosDoModo(a, "registro");
    if (formal.length > 0 && formal.some((p) => p.tipo !== "registro")) {
      expect(formal[0].maquina, `${a.id}: primeiro passo de formalização sem máquina`).toBeDefined();
    }
  });

  it.each(a.solucoesDeTeste.map((s) => [s.nome, s] as const))("solução de teste passa: %s", (_n, s) => {
    const r = rodar(a, s.modo, s.entradas);
    expect(r.travadas).toEqual([]);
    expect(r.exec.concluida, `parou no passo ${passosDoModo(a, s.modo)[r.exec.indice]?.id}`).toBe(true);
    expect(r.efeitos.some((e) => e.tipo === "concluida")).toBe(true);
  });

  it.each(a.sabotagens.map((s) => [s.nome, s] as const))("sabotagem falha com o equívoco certo: %s", (_n, s) => {
    const r = rodar(a, s.modo, s.entradas);
    const vistos = r.efeitos.filter((e): e is Extract<Efeito, { tipo: "equivoco" }> => e.tipo === "equivoco").map((e) => e.id);
    expect(vistos).toContain(s.equivoco);
    expect(r.exec.concluida).toBe(false);
  });

  it("toda missão guiada termina com página no Caderno", () => {
    if (a.tipo !== "missao") return;
    const guiada = a.solucoesDeTeste.find((s) => s.modo === "guiada");
    expect(guiada, "sem solução guiada").toBeDefined();
    const r = rodar(a, "guiada", guiada?.entradas ?? []);
    expect(r.efeitos.some((e) => e.tipo === "pagina")).toBe(true);
  });
});

describe("conteúdo das respostas", () => {
  it("todo equívoco tem resposta e conceito existente", () => {
    for (const e of EQUIVOCOS) {
      expect(e.resposta.length).toBeGreaterThan(10);
      expect(conceitosIds.has(e.conceito), e.id).toBe(true);
    }
    expect(Object.keys(MOTIVOS).length).toBeGreaterThan(10);
  });
});

describe("cada conceito do arco chega a dominado só com o que existe", () => {
  it("rodando as soluções guiadas em ordem", () => {
    const evidencias: Evidencia[] = [];
    let t = 1_000_000;
    for (const a of TODAS) {
      const s = a.solucoesDeTeste.find((x) => x.modo === "guiada");
      if (!s) continue;
      const r = rodar(a, "guiada", s.entradas, t);
      t += 10_000_000;
      for (const e of r.efeitos) if (e.tipo === "evidencias") evidencias.push(...e.lista);
    }
    for (const c of CONCEITOS_DO_ARCO_1) {
      const s = situacaoConceito(c, evidencias, t);
      expect(["dominado", "consolidado"], `${c}: ${s.estado}`).toContain(s.estado);
    }
  });
});
