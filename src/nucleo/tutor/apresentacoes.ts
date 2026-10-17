/**
 * Apresentações: na primeira vez que o jogador encontra uma ferramenta, uma frase do Nônio com a
 * ferramenta em destaque e "Entendi". No máximo uma por passo, nunca em cima de um retorno, nunca
 * na calibragem nem na sondagem. O progresso guarda as vistas (id e momento).
 * O "Perguntar" se apresenta dentro da própria conversa (o aviso de privacidade, id "conversa").
 */
import { maoLivreLigada } from "../maquinas/bancada/bancada";
import type { Execucao } from "../missoes/motor";
import type { Atividade, Passo } from "../missoes/tipos";

export type IdApresentacao = "bolha" | "mao-livre" | "aposta" | "menu-corte" | "bicas" | "fichas" | "soroban";

/** Ordem de prioridade quando um passo traz mais de uma ferramenta nova. */
export const ORDEM_APRESENTACOES: readonly IdApresentacao[] = ["bolha", "mao-livre", "aposta", "menu-corte", "bicas", "fichas", "soroban"];

/** As ferramentas que este passo põe na mão do jogador. */
export function ferramentasDoPasso(passo: Passo, e: Execucao): IdApresentacao[] {
  const lista: IdApresentacao[] = ["bolha"];
  const m = e.bancada?.atual ?? null;
  const operavel = (passo.tipo === "operar" || passo.tipo === "aposta") && m !== null && !m.fechada;
  if (operavel && maoLivreLigada(m.config)) {
    lista.push("mao-livre");
    if (m.config.fatiador) lista.push("menu-corte");
  }
  if (passo.tipo === "aposta") lista.push("aposta");
  if (passo.tipo === "operar" && m?.config.bicas.ajustavel) lista.push("bicas");
  if ((passo.tipo === "prever" || passo.tipo === "palpite") && passo.resposta.tipo === "fracao") lista.push("fichas");
  return ORDEM_APRESENTACOES.filter((id) => lista.includes(id));
}

export function proximaApresentacao(
  a: Atividade,
  passo: Passo,
  e: Execucao,
  vistas: Readonly<Record<string, number>>,
  momento: { readonly jaNestePasso: boolean; readonly retornoVisivel: boolean },
): IdApresentacao | null {
  if (a.tipo === "sondagem" || momento.jaNestePasso || momento.retornoVisivel) return null;
  if (e.passo.situacao !== "ativo") return null;
  return ferramentasDoPasso(passo, e).find((id) => !(id in vistas)) ?? null;
}
