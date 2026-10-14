/**
 * O nome formal de uma atividade: a área do distrito e o conteúdo, vindo dos conceitos dela.
 * "Missão 4 · Aritmética · Frações"; sem espaço, a área sai: "Missão 3 · Divisão com resto".
 * Nunca ano escolar nem série: os dados só têm área e conteúdo.
 */
import type { Conceito, IdConceito } from "./curriculo";

export interface AreaDistrito {
  readonly distrito: string;
  /** O nome do distrito no mapa: "A Partilha". */
  readonly nome: string;
  /** A área, como na escola: "Aritmética". */
  readonly area: string;
}

/** O que o nome formal precisa saber de uma atividade. */
export interface AtividadeFormal {
  readonly distrito: string;
  readonly conceitos: readonly IdConceito[];
  readonly conteudoFormal?: string;
}

export interface NomeFormal {
  readonly area: string | null;
  /** O conteúdo curto, para o cabeçalho e os cartões: "Frações". */
  readonly conteudo: string;
  /** O conteúdo para a etiqueta da referência: "Frações: parte e divisão". */
  readonly etiqueta: string;
}

function semRepetir(lista: readonly string[]): string[] {
  return lista.filter((x, i) => lista.indexOf(x) === i);
}

/** "a", "a e b", "a, b e c". */
export function juntar(lista: readonly string[]): string {
  if (lista.length <= 1) return lista[0] ?? "";
  return `${lista.slice(0, -1).join(", ")} e ${lista[lista.length - 1]}`;
}

export function areaDoDistrito(areas: readonly AreaDistrito[], distrito: string): AreaDistrito | null {
  return areas.find((a) => a.distrito === distrito) ?? null;
}

export function nomeFormal(a: AtividadeFormal, conceitos: readonly Conceito[], areas: readonly AreaDistrito[]): NomeFormal {
  const dela = a.conceitos.map((id) => conceitos.find((c) => c.id === id)).filter((c): c is Conceito => !!c);
  // Museu e Rua não são distritos de área: a área vem dos conceitos.
  const area = (areaDoDistrito(areas, a.distrito) ?? (dela[0] ? areaDoDistrito(areas, dela[0].distrito) : null))?.area ?? null;
  if (a.conteudoFormal) return { area, conteudo: a.conteudoFormal, etiqueta: a.conteudoFormal };
  const curtos = semRepetir(dela.map((c) => c.formalCurto));
  const conteudo = juntar(curtos);
  let etiqueta: string;
  if (dela.length === 1) etiqueta = dela[0].formal;
  else if (curtos.length === 1 && dela.every((c) => c.aspecto)) etiqueta = `${curtos[0]}: ${juntar(semRepetir(dela.map((c) => c.aspecto as string)))}`;
  else etiqueta = conteudo;
  return { area, conteudo, etiqueta };
}

/** A linha de cima do cabeçalho, inteira e sem a área (para quando não cabe). */
export function linhaFormal(prefixo: string, n: NomeFormal): { readonly cheia: string; readonly curta: string } {
  const curta = `${prefixo} · ${n.conteudo}`;
  return { cheia: n.area ? `${prefixo} · ${n.area} · ${n.conteudo}` : curta, curta };
}
