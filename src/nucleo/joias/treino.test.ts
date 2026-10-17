import { describe, expect, it } from "vitest";
import { JOIAS } from "@/conteudo/joias";
import type { EstadoJoia } from "../progresso/tipos";
import { ORDEM_TECNICAS_SOROBAN, TECNICAS_SOROBAN as T } from "../soroban/tecnicas";
import { comecarRodadaDoAbaco, jogarRodadaDoAbaco } from "./abaco";
import { andamentoDaTecnica, decidirRodada, encerrarRodada, estagioDasTecnicas, situacaoDaTecnica, treinoDe, type ParametrosLapidacao } from "./treino";

/** Os parâmetros do teste ficam aqui: o conteúdo pode afinar os do jogo sem quebrar o núcleo. */
const P: ParametrosLapidacao = { operacoesPorRodada: 6, limposParaFirmar: 6, rodadasParaFirmar: 2, limposPorRodada: 2, intervaloHoras: 20, intercaladas: 2 };

const ABACO = JOIAS.find((j) => j.id === "abaco") ?? JOIAS[0];
const HORA = 3_600_000;
const T0 = 1_760_600_000_000;

const NOVA: EstadoJoia = { encontrada: true, encontradaEm: T0, estagio: 0, treinos: 0, tecnicas: [], treino: {}, rodada: null };

function tecnica(id: string) {
  const t = ABACO.tecnicas.find((x) => x.id === id);
  if (!t) throw new Error(id);
  return t;
}

/** Joga rodadas perfeitas, uma a cada `passo` horas, até a condição. */
function jogarAte(estado: EstadoJoia, ate: (e: EstadoJoia) => boolean, passo: number, inicio = T0): { estado: EstadoJoia; agora: number; rodadas: number } {
  let e = estado;
  let agora = inicio;
  let rodadas = 0;
  while (!ate(e)) {
    if (rodadas > 60) throw new Error("a joia não andou");
    e = jogarRodadaDoAbaco(ABACO, e, P, agora).estado;
    agora += passo * HORA;
    rodadas++;
  }
  return { estado: e, agora, rodadas };
}

describe("o treino das joias, com relógio fixo", () => {
  it("a joia do Ábaco tem as seis técnicas do soroban, na ordem, com os estágios", () => {
    expect(ABACO.tecnicas.map((t) => t.id)).toEqual(ORDEM_TECNICAS_SOROBAN);
    expect(ABACO.tecnicas.map((t) => t.estagio)).toEqual([1, 1, 2, 2, 2, 3]);
    expect(ABACO.treinavel).toBe(true);
  });

  it("a primeira rodada é de Ler e mostrar, técnica nova", () => {
    const d = decidirRodada(ABACO, NOVA, P, T0);
    expect(d).toMatchObject({ tipo: "tecnica", nova: true });
    if (d.tipo === "tecnica") expect(d.foco.id).toBe(T.ler);
  });

  it("firma com 6 lances limpos em 2 rodadas (estágio 1, sem intervalo)", () => {
    const r1 = jogarRodadaDoAbaco(ABACO, NOVA, P, T0);
    // Duas com o Nônio (não contam) e quatro sozinho.
    expect(treinoDe(r1.estado, T.ler).limpos).toBe(4);
    expect(r1.contaram).toEqual([T.ler]);
    expect(r1.firmaram).toEqual([]);
    expect(situacaoDaTecnica(tecnica(T.ler), treinoDe(r1.estado, T.ler), P, T0)).toBe("firmando");
    const r2 = jogarRodadaDoAbaco(ABACO, r1.estado, P, T0 + HORA);
    expect(r2.firmaram).toEqual([T.ler]);
    expect(r2.estado.tecnicas).toEqual([T.ler]);
    expect(r2.estado.treinos).toBe(2);
    // O foco vai para as contas diretas.
    const d = decidirRodada(ABACO, r2.estado, P, T0 + 2 * HORA);
    expect(d.tipo === "tecnica" && d.foco.id).toBe(T.diretas);
  });

  it("os pares abertos e o degrau 2 tiram os lances: a rodada não conta", () => {
    const comAjuda = jogarRodadaDoAbaco(ABACO, NOVA, P, T0, () => ({ ajuda: () => 2 }));
    expect(treinoDe(comAjuda.estado, T.ler).limpos).toBe(0);
    expect(comAjuda.contaram).toEqual([]);
    expect(comAjuda.feitos.map((f) => f.marca).every((m) => m === "com-ajuda")).toBe(true);
    const comVaiEVolta = jogarRodadaDoAbaco(ABACO, NOVA, P, T0, (_, item) => ({ vaiEVolta: () => item.operacao.tipo === "mostrar" }));
    // Só as leituras contam (os mostrar tiveram vai e volta).
    expect(treinoDe(comVaiEVolta.estado, T.ler).limpos).toBe(2);
  });

  it("estágio 2 só firma com 20 horas entre a primeira e a última rodada; o foco pula a que está esperando", () => {
    const talhada = jogarAte(NOVA, (e) => e.estagio >= 1, 1);
    expect(talhada.estado.estagio).toBe(1);
    expect(talhada.estado.tecnicas).toEqual([T.ler, T.diretas]);
    const c5 = tecnica(T.complemento5);
    // Rodadas de hora em hora: o complemento de 5 junta lances e rodadas, mas não firma.
    let e = talhada.estado;
    let agora = talhada.agora;
    for (let i = 0; i < 3; i++) {
      const d = decidirRodada(ABACO, e, P, agora);
      if (d.tipo !== "tecnica" || d.foco.id !== T.complemento5) break;
      e = jogarRodadaDoAbaco(ABACO, e, P, agora).estado;
      agora += HORA;
    }
    const tr = treinoDe(e, T.complemento5);
    expect(tr.firmeEm).toBeNull();
    expect(tr.limpos).toBeGreaterThanOrEqual(P.limposParaFirmar);
    expect(situacaoDaTecnica(c5, tr, P, agora)).toBe("esperando");
    const andamento = andamentoDaTecnica(c5, tr, P, agora);
    expect(andamento.liberaEm).toBe(tr.rodadas[0].momento + 20 * HORA);
    // O foco pula o 5 (esperando) e apresenta o 10.
    const d = decidirRodada(ABACO, e, P, agora);
    expect(d).toMatchObject({ tipo: "tecnica", nova: true });
    expect(d.tipo === "tecnica" && d.foco.id).toBe(T.complemento10);
    // Passadas as 20 horas, o 5 volta a ser o foco e firma na rodada seguinte.
    const depois = tr.rodadas[0].momento + 21 * HORA;
    expect(situacaoDaTecnica(c5, tr, P, depois)).toBe("firmando");
    const d2 = decidirRodada(ABACO, e, P, depois);
    expect(d2.tipo === "tecnica" && d2.foco.id).toBe(T.complemento5);
    const r = jogarRodadaDoAbaco(ABACO, e, P, depois);
    expect(r.firmaram).toContain(T.complemento5);
  });

  it("revisão quando todas as que faltam estão esperando", () => {
    const talhada = jogarAte(NOVA, (e) => e.estagio >= 1, 1).estado;
    const agora = T0 + 100 * HORA;
    // As três de estágio 2 com lances de sobra e uma rodada recente: só falta o intervalo.
    const treino = { ...talhada.treino };
    for (const id of [T.complemento5, T.complemento10, T.juntos]) treino[id] = { limpos: 8, apresentadaEm: agora - 2 * HORA, rodadas: [{ momento: agora - HORA, nivel: "sem-algarismos" }], firmeEm: null };
    const e = { ...talhada, treino };
    const d = decidirRodada(ABACO, e, P, agora);
    expect(d.tipo).toBe("revisao");
    if (d.tipo === "revisao") expect(d.faltam.map((t) => t.id)).toEqual([T.complemento5, T.complemento10, T.juntos]);
    const r = jogarRodadaDoAbaco(ABACO, e, P, agora);
    expect(r.tipo).toBe("revisao");
    expect(r.firmaram).toEqual([]);
  });

  it("o estágio sobe e nunca desce", () => {
    const lapidada = { ...NOVA, estagio: 2 as const };
    expect(estagioDasTecnicas(ABACO, lapidada)).toBe(0);
    const r = jogarRodadaDoAbaco(ABACO, lapidada, P, T0);
    expect(r.estagioAntes).toBe(2);
    expect(r.estagioDepois).toBe(2);
    expect(r.estado.estagio).toBe(2);
  });

  it("a joia inteira: talhada, lapidada e polida, com o imaginado fechando de cabeça ou no ditado", () => {
    const estagios: number[] = [];
    let e = NOVA;
    let agora = T0;
    let rodadas = 0;
    while (e.estagio < 3 && rodadas < 60) {
      const fim = jogarRodadaDoAbaco(ABACO, e, P, agora);
      expect(fim.estagioDepois).toBeGreaterThanOrEqual(fim.estagioAntes);
      e = fim.estado;
      estagios.push(e.estagio);
      agora += 21 * HORA;
      rodadas++;
    }
    expect(e.estagio).toBe(3);
    expect(e.tecnicas).toEqual(ORDEM_TECNICAS_SOROBAN);
    expect(estagios).toEqual([...estagios].sort((a, b) => a - b));
    expect(rodadas).toBeLessThan(25);
    const imag = treinoDe(e, T.imaginado);
    expect(["de-cabeca", "ditado"]).toContain(imag.rodadas[imag.rodadas.length - 1].nivel);
    // Depois de polida, manutenção.
    expect(decidirRodada(ABACO, e, P, agora).tipo).toBe("manutencao");
    const m = jogarRodadaDoAbaco(ABACO, e, P, agora);
    expect(m.estado.estagio).toBe(3);
    expect(m.estado.treinos).toBe(e.treinos + 1);
  });

  it("o imaginado não firma com a última rodada na sombra", () => {
    const polidaQuase: EstadoJoia = {
      ...NOVA,
      estagio: 2,
      treino: Object.fromEntries(
        ABACO.tecnicas.map((t) => [
          t.id,
          t.id === T.imaginado
            ? { limpos: 8, apresentadaEm: T0, rodadas: [{ momento: T0, nivel: "sombra" }], firmeEm: null }
            : { limpos: 6, apresentadaEm: T0, rodadas: [], firmeEm: T0 },
        ]),
      ),
    };
    // Uma rodada na sombra (forçada), 30 horas depois: lances e rodadas bastam, mas não fecha.
    let e = comecarRodadaDoAbaco(ABACO, polidaQuase, P, T0 + 30 * HORA);
    const itens = (e.rodada?.itens ?? []) as { nivel: string }[];
    expect(itens[0].nivel).toBe("de-cabeca");
    const sombra = { ...e, rodada: e.rodada ? { ...e.rodada, feitos: itens.map(() => ({ resumo: "x", marca: "limpo" as const, nivel: "sombra", evidencias: [{ tecnica: T.imaginado, conta: true }] })) } : null };
    const fim = encerrarRodada(ABACO, sombra, P, T0 + 30 * HORA);
    expect(fim?.firmaram).toEqual([]);
    expect(fim?.estado.estagio).toBe(2);
    // A mesma rodada de cabeça firma.
    e = { ...e, rodada: e.rodada ? { ...e.rodada, feitos: itens.map(() => ({ resumo: "x", marca: "limpo" as const, nivel: "de-cabeca", evidencias: [{ tecnica: T.imaginado, conta: true }] })) } : null };
    const fim2 = encerrarRodada(ABACO, e, P, T0 + 30 * HORA);
    expect(fim2?.firmaram).toEqual([T.imaginado]);
    expect(fim2?.estado.estagio).toBe(3);
  });

  it("a rodada só encerra com todos os itens feitos", () => {
    const e = comecarRodadaDoAbaco(ABACO, NOVA, P, T0);
    expect(e.rodada?.itens).toHaveLength(6);
    expect(treinoDe(e, T.ler).apresentadaEm).toBe(T0);
    expect(encerrarRodada(ABACO, e, P, T0)).toBeNull();
  });
});
