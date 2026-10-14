/**
 * Os modelos do rascunho a lápis: o que cada gesto significou em conta. SÓ DADOS.
 * Marcadores: {n} (número da volta), {cadaNome} ("1 broa", "1/4"), {cada} ("1", "1/4"),
 * {receptor} ("mesa" ou "Mesa"), {receptores} (quantos), {tirou}, {antes}, {depois},
 * {qtdNome} ("1 broa", "3 broas", "1 pedaço de 1/4"), {partes}, {pedacos} ("pedaços", "fatias"),
 * {total}, {novos}, {novo}, {i} (o receptor), {peca} ("1 broa", "1/4 de broa"),
 * {lote}, {abertas}, {pedido}, {ha}.
 * Só o que aconteceu, nunca o que fazer. Números em Rubik, legíveis: nada de letra de mão.
 */
import type { ModelosRascunho } from "@/nucleo/maquinas/bancada/rascunho";

export const MODELOS_RASCUNHO: ModelosRascunho = {
  volta: "Volta {n}: {cadaNome} em cada {receptor} · {receptores} × {cada} = {tirou}",
  voltaCurta: "Volta {n}: {cada} em cada · {receptores} × {cada} = {tirou}",
  ficam: " · ficam {antes} − {tirou} = {depois}",
  mao: "À mão: {cadaNome} em cada {receptor} · {receptores} × {cada} = {tirou}",
  maoCurta: "À mão: {cada} em cada · {receptores} × {cada} = {tirou}",
  avulsa: "{receptor} {i}: + {peca}",
  devolveu: "{receptor} {i}: − {peca}",
  corteUma: "Corte: {qtdNome} em {partes} {pedacos} · {total} = {novos} × {novo}",
  corteVarias: "Corte: {qtdNome} em {partes} · {total} = {novos} × {novo}",
  engasgo: "Engasgo: uma volta de {lote} em {abertas} bicas pede {pedido} · há {ha}",
};

/** O rótulo da lista, para o leitor de tela. */
export const ROTULO_RASCUNHO = "Rascunho da máquina";
