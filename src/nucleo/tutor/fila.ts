/**
 * A fila de falas da faixa do Nônio. Uma voz só: a medida da máquina, o retorno de uma
 * conferência, a ajuda pedida, a oferta, o lembrete. Pura e determinística: o tempo entra
 * como número (o relógio injetável do progresso), nunca lido aqui.
 *
 * - importante (retorno de validação, chegada de passo, leitura da máquina): entra na hora;
 * - pedida (Me ajuda, resposta da conversa): só espera uma importante ficar o mínimo na tela;
 * - automática (oferta, lembrete, comentário): é descartada se outra fala está na tela há menos
 *   do mínimo, e obedece à postura.
 * A mesma fala não se repete em seguida.
 */
import type { AlvoMaquina } from "../missoes/tipos";
import type { Postura } from "../progresso/tipos";
import type { ExpressaoTutor } from "./expressoes";

export type PrioridadeFala = "importante" | "pedida" | "automatica";

/** Para que serve a fala: decide a postura que a aceita e como a faixa a desenha. */
export type CategoriaFala =
  | "passo"
  | "retorno"
  | "evento"
  | "ajuda"
  | "conversa"
  | "oferta"
  | "lembrete"
  | "comentario"
  | "sondagem";

export type SeloFala = "acertou" | "ainda-nao";

export interface FalaFaixa {
  readonly id: string;
  readonly texto: string;
  readonly expressao: ExpressaoTutor;
  readonly prioridade: PrioridadeFala;
  readonly categoria: CategoriaFala;
  /** Parte da máquina que o Nônio aponta enquanto a fala está na tela. */
  readonly alvo?: AlvoMaquina;
  /** O selo do retorno, no começo do balão. */
  readonly selo?: SeloFala;
  /** Ponto vermelho ao lado (recusa ou engasgo da máquina): informação, não "ainda não". */
  readonly atencao?: boolean;
  /** Passo em que a fala nasceu: a faixa não mostra fala de outro passo. */
  readonly passo: string;
  /** O recado curto (até 60), quando a primeira frase do texto não cabe nele. */
  readonly recado?: string;
}

export const PERMANENCIA_MINIMA_MS = 2500;

export interface FilaFalas {
  readonly atual: FalaFaixa | null;
  /** Momento em que a fala atual entrou. */
  readonly desde: number;
  /** Uma pedida esperando a importante cumprir o mínimo. */
  readonly pendente: FalaFaixa | null;
}

export function filaVazia(): FilaFalas {
  return { atual: null, desde: 0, pendente: null };
}

/** A postura aceita esta fala automática? */
export function posturaAceita(categoria: CategoriaFala, postura: Postura): boolean {
  if (postura === "quieto") return false;
  if (postura === "disponivel") return categoria === "oferta" || categoria === "lembrete";
  return true;
}

function mesma(a: FalaFaixa | null, b: FalaFaixa): boolean {
  return a !== null && a.id === b.id && a.texto === b.texto && a.passo === b.passo;
}

function entra(f: FilaFalas, fala: FalaFaixa, agora: number): FilaFalas {
  return { ...f, atual: fala, desde: agora };
}

/** Oferece uma fala à faixa. Devolve a fila nova (a mesma, se a fala não entrou). */
export function oferecer(f: FilaFalas, fala: FalaFaixa, agora: number, postura: Postura): FilaFalas {
  if (mesma(f.atual, fala)) return f;
  const naTela = f.atual !== null && agora - f.desde < PERMANENCIA_MINIMA_MS;
  switch (fala.prioridade) {
    case "importante":
      return entra(f, fala, agora);
    case "pedida":
      if (naTela && f.atual?.prioridade === "importante" && f.atual.passo === fala.passo) return { ...f, pendente: fala };
      return { ...entra(f, fala, agora), pendente: null };
    case "automatica":
      if (!posturaAceita(fala.categoria, postura)) return f;
      if (naTela) return f;
      return entra(f, fala, agora);
  }
}

/** Passa o tempo: a pedida que esperava entra quando a importante cumpriu o mínimo. */
export function atualizarFila(f: FilaFalas, agora: number): FilaFalas {
  if (!f.pendente) return f;
  if (f.atual && f.atual.prioridade === "importante" && agora - f.desde < PERMANENCIA_MINIMA_MS) return f;
  return { atual: f.pendente, desde: agora, pendente: null };
}

/** Quando a fila muda sozinha (para a tela marcar um relógio); null se nada espera. */
export function proximaMudanca(f: FilaFalas): number | null {
  return f.pendente ? f.desde + PERMANENCIA_MINIMA_MS : null;
}

/** A fala que a faixa mostra para este passo (fala de outro passo não aparece). */
export function falaDoPasso(f: FilaFalas, passo: string): FalaFaixa | null {
  return f.atual && f.atual.passo === passo ? f.atual : null;
}
