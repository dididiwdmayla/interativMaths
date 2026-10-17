/**
 * O registro por joia: o que o treino genérico precisa de cada joia treinável. Gerar os itens da
 * rodada (dados da joia, guardados no progresso) e avaliar um item terminado. Cálculo Mental,
 * Multiplicação e Estimativa entram por aqui, sem refazer o treino.
 */
import type { EstadoJoia, ItemFeito } from "../progresso/tipos";
import type { Joia } from "./contrato";
import type { DecisaoRodada, ParametrosLapidacao } from "./treino";

export interface ContextoRodada {
  readonly joia: Joia;
  readonly estado: EstadoJoia;
  readonly decisao: DecisaoRodada;
  readonly parametros: ParametrosLapidacao;
  readonly semente: number;
}

export interface RegistroJoia {
  /** Os itens da rodada (dados da joia; o progresso guarda sem olhar dentro). */
  gerarItens(c: ContextoRodada): readonly unknown[];
  /** O item salvo ainda vale? (o progresso pode ter vindo de outra versão) */
  itemValido(item: unknown): boolean;
}

/** Monta os itens da rodada e confere que todos valem. */
export function itensDaRodada(r: RegistroJoia, c: ContextoRodada): readonly unknown[] {
  const itens = r.gerarItens(c);
  if (itens.length === 0 || !itens.every((i) => r.itemValido(i))) throw new Error(`rodada inválida para ${c.joia.id}`);
  return itens;
}

/** A rodada salva ainda vale para esta joia (itens que o registro reconhece). */
export function rodadaValida(r: RegistroJoia, estado: EstadoJoia): boolean {
  return estado.rodada !== null && estado.rodada.itens.every((i) => r.itemValido(i));
}

export type { ItemFeito };
