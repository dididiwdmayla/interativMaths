/**
 * Cenários do laboratório: progresso montado rodando as soluções de teste no motor,
 * exatamente como um jogador faria. Nada é escrito à mão no documento.
 */
import { aplicarEntrada, iniciarExecucao } from "@/nucleo/missoes/motor";
import { aplicarEfeitos } from "@/nucleo/missoes/efeitos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import {
  iniciarAtividade,
  marcarAberturaVista,
  progressoNovo,
  registrarEvidencias,
  salvarCalibragem,
  type Progresso,
} from "@/nucleo/progresso";
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
