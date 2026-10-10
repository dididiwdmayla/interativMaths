/**
 * Situação da campanha, derivada do progresso: o que está disponível, o que pede revisita,
 * o que se abriu. Funções puras; o conteúdo entra por parâmetro.
 */
import { provaLiberada, type RegrasCalibragem } from "../calibragem/calibragem";
import type { IdConceito } from "../curriculo/curriculo";
import { revisitasDevidas, situacaoConceito } from "../dominio/dominio";
import type { Atividade } from "../missoes/tipos";
import type { Progresso } from "../progresso/tipos";

export type StatusMissao = "bloqueada" | "disponivel" | "em_andamento" | "concluida";

export interface SituacaoMissao {
  readonly missao: Atividade;
  readonly status: StatusMissao;
  readonly via: "guiada" | "prova" | null;
  readonly provaLiberada: boolean;
  readonly recomendada: boolean;
  readonly temPagina: boolean;
}

export function concluida(p: Progresso, id: string): boolean {
  return p.campanha.atividades[id]?.status === "concluida";
}

export function situacaoMissoes(p: Progresso, missoes: readonly Atividade[], regras: RegrasCalibragem): SituacaoMissao[] {
  const recomendada = p.calibragem?.recomendacao ?? null;
  const numeroRecomendado = missoes.find((m) => m.id === recomendada)?.numero ?? 1;
  const maior = p.calibragem?.maiorDegrau ?? 0;
  const lista = missoes.map((m, i) => {
    const feita = concluida(p, m.id);
    const anterior = i === 0 || concluida(p, missoes[i - 1].id);
    const andamento = m.id in p.campanha.execucoes || `${m.id}#prova` in p.campanha.execucoes;
    const aberta = anterior || (m.numero ?? 99) <= numeroRecomendado;
    const status: StatusMissao = feita ? "concluida" : andamento ? "em_andamento" : aberta ? "disponivel" : "bloqueada";
    return {
      missao: m,
      status,
      via: feita ? (p.campanha.atividades[m.id]?.via ?? "guiada") : null,
      provaLiberada: !feita && p.calibragem !== null && provaLiberada(m.id, maior, regras) && m.prova !== undefined,
      recomendada: false,
      temPagina: p.caderno.some((x) => x.atividade === m.id),
    };
  });
  const proxima = lista.find((s) => s.status === "em_andamento") ?? lista.find((s) => s.status === "disponivel" && (s.missao.numero ?? 0) >= numeroRecomendado) ?? lista.find((s) => s.status === "disponivel");
  return lista.map((s) => (s === proxima ? { ...s, recomendada: true } : s));
}

export function arcoConcluido(p: Progresso, missoes: readonly Atividade[]): boolean {
  return missoes.length > 0 && missoes.every((m) => concluida(p, m.id));
}

/** Atividades concluídas depois de um momento (para o eco saber quantas vieram depois). */
export function concluidasDepois(p: Progresso, desde: number, excluir: readonly string[] = []): number {
  return new Set(p.campanha.concluidas.filter((c) => c.momento > desde && !excluir.includes(c.atividade)).map((c) => c.atividade)).size;
}

/** Eco: depois de pelo menos `minimo` outras atividades desde a conclusão de `base`. */
export function ecoDisponivel(p: Progresso, base: string, eco: string, minimo = 2): boolean {
  if (concluida(p, eco) || !concluida(p, base)) return false;
  const quando = p.campanha.concluidas.find((c) => c.atividade === base)?.momento ?? Infinity;
  return concluidasDepois(p, quando, [base, eco]) >= minimo;
}

export function revisitaDisponivel(p: Progresso, conceitos: readonly IdConceito[], agora: number): IdConceito[] {
  return revisitasDevidas(conceitos, p.evidencias, agora).map((r) => r.conceito);
}

/** Conceitos com sondagem pendente. */
export function sondagensPendentes(p: Progresso, conceitos: readonly IdConceito[], agora: number): { conceito: IdConceito; equivoco: string }[] {
  return conceitos
    .map((c) => ({ c, s: situacaoConceito(c, p.evidencias, agora) }))
    .filter((x) => x.s.sondagemPendente !== null)
    .map((x) => ({ conceito: x.c, equivoco: x.s.sondagemPendente?.equivoco ?? "" }));
}
