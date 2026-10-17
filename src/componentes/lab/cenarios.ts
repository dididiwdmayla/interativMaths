/**
 * Cenários do laboratório: progresso montado rodando as soluções de teste no motor,
 * exatamente como um jogador faria. Nada é escrito à mão no documento.
 */
import { aplicarEntrada, iniciarExecucao } from "@/nucleo/missoes/motor";
import { aplicarEfeitos } from "@/nucleo/missoes/efeitos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import {
  definirJoia,
  iniciarAtividade,
  marcarAberturaVista,
  progressoNovo,
  registrarEvidencias,
  salvarCalibragem,
  type EstadoJoia,
  type Progresso,
} from "@/nucleo/progresso";
import { comecarRodadaDoAbaco, jogarRodadaDoAbaco } from "@/nucleo/joias/abaco";
import { guardarAberto, registrarItem, situacaoDaTecnica, treinoDe } from "@/nucleo/joias/treino";
import { aplicarEntradaItem, iniciarItem, itemFeito, type ItemRodada } from "@/nucleo/soroban/item";
import { entradasDoCaminhoCurto, jogarItem } from "@/nucleo/soroban/jogador";
import { JOIAS } from "@/conteudo/joias";
import { PARAMETROS_LAPIDACAO } from "@/conteudo/lapidacao";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { ATIVIDADES } from "@/conteudo/atividades";
import { conceitoDoEquivoco } from "@/componentes/estado/catalogo";

export function jogar(p: Progresso, a: Atividade, entradas: readonly Entrada[], inicio: number): { p: Progresso; fim: number } {
  let exec = iniciarExecucao(a, "guiada");
  let q = iniciarAtividade(p, a.id, inicio);
  let t = inicio;
  for (const ent of entradas) {
    t += 2000;
    const r = aplicarEntrada(a, exec, ent, { agora: t, conceitoDoEquivoco });
    exec = r.exec;
    q = aplicarEfeitos(q, a, exec, r.efeitos, t);
  }
  return { p: q, fim: t };
}

export function progressoCalibrado(agora: number): Progresso {
  let p = marcarAberturaVista(progressoNovo(agora), agora);
  p = salvarCalibragem(p, { feitaEm: agora, pulada: true, respostas: [], maiorDegrau: 0, provaveis: [], recomendacao: MISSOES_ARCO_1[0].id }, agora);
  return p;
}

/** Progresso com as primeiras `n` missões concluídas pela solução guiada. */
export function progressoAteMissao(n: number, agora: number): Progresso {
  let p = progressoCalibrado(agora);
  let t = agora;
  for (const m of MISSOES_ARCO_1.slice(0, n)) {
    const s = m.solucoesDeTeste.find((x) => x.modo === "guiada");
    if (!s) continue;
    const r = jogar(p, m, s.entradas, t);
    p = r.p;
    t = r.fim + 60_000;
  }
  return { ...p, relogio: { deslocamentoMs: Math.max(0, t - agora) } };
}

/** Também faz o museu e a rua (quando existirem). */
export function progressoComTransferencia(agora: number): Progresso {
  let p = progressoAteMissao(5, agora);
  let t = agora + p.relogio.deslocamentoMs;
  for (const id of ["museu.paes-de-ahmes", "rua.tres-pizzas"]) {
    const a = ATIVIDADES.find((x) => x.id === id);
    const s = a?.solucoesDeTeste.find((x) => x.modo === "guiada");
    if (!a || !s) continue;
    const r = jogar(p, a, s.entradas, t);
    p = r.p;
    t = r.fim + 60_000;
  }
  return { ...p, relogio: { deslocamentoMs: Math.max(0, t - agora) } };
}

/** Duas falhas com o mesmo equívoco em atividades diferentes: a sondagem fica pendente. */
export function progressoComSondagem(agora: number): Progresso {
  const p = progressoAteMissao(2, agora);
  const t = agora + p.relogio.deslocamentoMs;
  return registrarEvidencias(
    p,
    [
      { conceito: "div.partilha", tipo: "experimento", resultado: "falha", ajuda: 0, contexto: "partilha.arco1.carga-igual", equivoco: "parou-cedo", momento: t + 1000 },
      { conceito: "div.partilha", tipo: "aplicacao", resultado: "falha", ajuda: 0, contexto: "partilha.arco1.sobrou", equivoco: "parou-cedo", momento: t + 2000 },
    ],
    t + 2000,
  );
}

/* ---------- A Joia do Ábaco: rodadas jogadas pelo motor, como um jogador ---------- */

const HORA_MS = 3_600_000;
const ABACO = JOIAS.find((j) => j.id === "abaco");

/** Joga rodadas perfeitas a cada `passo` horas até a condição; o relógio do jogo acompanha. */
function lapidarAte(p: Progresso, agora: number, ate: (e: EstadoJoia, t: number) => boolean, passo: number, teto = 40): Progresso {
  const joia = ABACO;
  let e = p.joias.abaco;
  if (!joia || !e) return p;
  let t = agora + p.relogio.deslocamentoMs + 60_000;
  for (let i = 0; i < teto && !ate(e, t); i++) {
    e = jogarRodadaDoAbaco(joia, e, PARAMETROS_LAPIDACAO, t).estado;
    t += passo * HORA_MS;
  }
  const q = definirJoia(p, "abaco", e, t);
  return { ...q, relogio: { deslocamentoMs: Math.max(0, t - agora) } };
}

const situacaoDe = (e: EstadoJoia, id: string, t: number) => {
  const tec = ABACO?.tecnicas.find((x) => x.id === id);
  return tec ? situacaoDaTecnica(tec, treinoDe(e, id), PARAMETROS_LAPIDACAO, t) : "lapis";
};

export function progressoAbacoEncontrado(agora: number): Progresso {
  return progressoAteMissao(5, agora);
}

export function progressoAbacoTalhado(agora: number): Progresso {
  return lapidarAte(progressoAbacoEncontrado(agora), agora, (e) => e.estagio >= 1, 1);
}

/** Talhada, com uma rodada do complemento de 5 feita: firmando (4 de 6, 1 de 2 rodadas). */
export function progressoAbacoCincoFirmando(agora: number): Progresso {
  const p = progressoAbacoTalhado(agora);
  return lapidarAte(p, agora, (e) => treinoDe(e, "soroban.complemento-5").rodadas.length >= 1, 1);
}

/** Talhada, com o complemento de 5 esperando o intervalo (rodadas de hora em hora). */
export function progressoAbacoCincoEsperando(agora: number): Progresso {
  const p = progressoAbacoTalhado(agora);
  return lapidarAte(p, agora, (e, t) => situacaoDe(e, "soroban.complemento-5", t) === "esperando", 1);
}

export function progressoAbacoLapidado(agora: number): Progresso {
  return lapidarAte(progressoAbacoEncontrado(agora), agora, (e) => e.estagio >= 2, 21);
}

export function progressoAbacoPolido(agora: number): Progresso {
  return lapidarAte(progressoAbacoEncontrado(agora), agora, (e) => e.estagio >= 3, 21);
}

/** Uma rodada parada no meio de um lance: o primeiro item feito; no segundo, o número mostrado e um gesto. */
export function progressoAbacoRodadaNoMeio(agora: number): Progresso {
  const p = progressoAbacoCincoFirmando(agora);
  const joia = ABACO;
  const e0 = p.joias.abaco;
  if (!joia || !e0) return p;
  const t = agora + p.relogio.deslocamentoMs + 60_000;
  let e = comecarRodadaDoAbaco(joia, e0, PARAMETROS_LAPIDACAO, t);
  const itens = (e.rodada?.itens ?? []) as ItemRodada[];
  e = registrarItem(e, itemFeito(jogarItem(iniciarItem(itens[0]))));
  let item = iniciarItem(itens[1]);
  // Mostra o primeiro número pelo caminho curto e dá o primeiro gesto do lance seguinte.
  for (const ent of entradasDoCaminhoCurto(item)) item = aplicarEntradaItem(item, ent).estado;
  const proximo = entradasDoCaminhoCurto(item)[0];
  if (proximo) item = aplicarEntradaItem(item, proximo).estado;
  e = guardarAberto(e, item);
  const q = definirJoia(p, "abaco", e, t);
  return { ...q, relogio: { deslocamentoMs: Math.max(0, t + 60_000 - agora) } };
}
