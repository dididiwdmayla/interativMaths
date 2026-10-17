/**
 * O soroban: moldura, régua e hastes. Em cada haste, a conta de cima (vale 5) e quatro contas de
 * baixo (valem 1 cada). Só conta o que encosta na régua. Cada haste é um algarismo; a última haste
 * (da direita) é a das unidades. TypeScript puro e determinístico.
 *
 * Um gesto é um toque numa conta. Tocar numa conta de baixo afastada encosta ela e as que estão
 * entre ela e a régua; tocar numa encostada afasta ela e as que estão entre ela e a moldura; tocar
 * na conta de cima alterna. Todo gesto mexe pelo menos uma conta e devolve o movimento que fez.
 */

export type Uns = 0 | 1 | 2 | 3 | 4;

export interface Haste {
  /** A conta de cima encostada na régua. */
  readonly cinco: boolean;
  /** Quantas contas de baixo encostam na régua. */
  readonly uns: Uns;
}

/** Da esquerda para a direita; a última é a das unidades. */
export type Soroban = readonly Haste[];

/** Índice de uma conta de baixo: 0 é a mais perto da régua. */
export type IndiceBaixo = 0 | 1 | 2 | 3;

export type Gesto =
  | { readonly haste: number; readonly conta: "cima" }
  | { readonly haste: number; readonly conta: "baixo"; readonly indice: IndiceBaixo };

/** O que um gesto (ou um passo do caminho) mexeu numa haste: a de cima e quantas de baixo. */
export interface Movimento {
  readonly haste: number;
  readonly cinco: -1 | 0 | 1;
  readonly uns: number;
}

/** O soroban da bancada: cinco hastes (milhar à esquerda, mais uma sem nome). */
export const HASTES_PADRAO = 5;

/** O maior número que as operações da bancada usam. */
export const MAIOR_NUMERO = 999;

const VAZIA: Haste = { cinco: false, uns: 0 };

export function sorobanVazio(hastes: number = HASTES_PADRAO): Soroban {
  return Array.from({ length: hastes }, () => VAZIA);
}

export function valorDaHaste(h: Haste): number {
  return (h.cinco ? 5 : 0) + h.uns;
}

export function hasteDoAlgarismo(d: number): Haste {
  if (!Number.isInteger(d) || d < 0 || d > 9) throw new RangeError(`algarismo fora de 0 a 9: ${d}`);
  return { cinco: d >= 5, uns: (d % 5) as Uns };
}

/** O soroban mostrando um número (de 0 até o que as hastes comportam). */
export function mostrar(hastes: number, valor: number): Soroban {
  if (!Number.isInteger(valor) || valor < 0 || valor >= 10 ** hastes) throw new RangeError(`não cabe em ${hastes} hastes: ${valor}`);
  const saida: Haste[] = [];
  let resto = valor;
  for (let i = hastes - 1; i >= 0; i--) {
    saida[i] = hasteDoAlgarismo(resto % 10);
    resto = Math.floor(resto / 10);
  }
  return saida;
}

/** O número que o soroban mostra. */
export function ler(s: Soroban): number {
  return s.reduce((total, h) => total * 10 + valorDaHaste(h), 0);
}

/** O algarismo da haste i. */
export function algarismo(s: Soroban, i: number): number {
  return valorDaHaste(s[i]);
}

/** A potência de dez da haste i (1 nas unidades). */
export function posicaoDaHaste(hastes: number, i: number): number {
  return hastes - 1 - i;
}

export function hasteDaPosicao(hastes: number, posicao: number): number {
  return hastes - 1 - posicao;
}

export function iguais(a: Soroban, b: Soroban): boolean {
  return a.length === b.length && a.every((h, i) => h.cinco === b[i].cinco && h.uns === b[i].uns);
}

/** A conta de baixo `indice` encosta na régua? */
export function encostada(h: Haste, indice: IndiceBaixo): boolean {
  return indice < h.uns;
}

function trocar(s: Soroban, i: number, h: Haste): Soroban {
  return s.map((x, j) => (j === i ? h : x));
}

/** Aplica um gesto: o soroban novo e o movimento (nunca vazio). */
export function aplicarGesto(s: Soroban, g: Gesto): { readonly soroban: Soroban; readonly movimento: Movimento } {
  const h = s[g.haste];
  if (!h) throw new RangeError(`haste inexistente: ${g.haste}`);
  if (g.conta === "cima") {
    return { soroban: trocar(s, g.haste, { ...h, cinco: !h.cinco }), movimento: { haste: g.haste, cinco: h.cinco ? -1 : 1, uns: 0 } };
  }
  // Afastada: ela e as de entre ela e a régua encostam. Encostada: ela e as de fora afastam.
  const uns = (encostada(h, g.indice) ? g.indice : g.indice + 1) as Uns;
  return { soroban: trocar(s, g.haste, { ...h, uns }), movimento: { haste: g.haste, cinco: 0, uns: uns - h.uns } };
}

/** Aplica um movimento (do caminho curto, ou o inverso de um gesto no Desfazer). */
export function aplicarMovimento(s: Soroban, m: Movimento): Soroban {
  const h = s[m.haste];
  if (!h) throw new RangeError(`haste inexistente: ${m.haste}`);
  const cinco = m.cinco === 0 ? h.cinco : m.cinco > 0;
  const uns = h.uns + m.uns;
  if ((m.cinco > 0 && h.cinco) || (m.cinco < 0 && !h.cinco) || uns < 0 || uns > 4) throw new RangeError("movimento impossível nesta haste");
  return trocar(s, m.haste, { cinco, uns: uns as Uns });
}

export function inverso(m: Movimento): Movimento {
  return { haste: m.haste, cinco: (m.cinco === 0 ? 0 : -m.cinco) as -1 | 0 | 1, uns: -m.uns };
}

/** O gesto que faz um movimento simples (só a de cima, ou só as de baixo, numa haste). */
export function gestoDoMovimento(s: Soroban, m: Movimento): Gesto {
  if (m.cinco !== 0 && m.uns === 0) return { haste: m.haste, conta: "cima" };
  if (m.cinco !== 0 || m.uns === 0) throw new RangeError("movimento que não é um gesto só");
  const h = s[m.haste];
  // Encostar n: tocar na última das que vão encostar. Afastar n: tocar na mais perto da régua das que saem.
  const indice = (m.uns > 0 ? h.uns + m.uns - 1 : h.uns + m.uns) as IndiceBaixo;
  return { haste: m.haste, conta: "baixo", indice };
}

/** Quantas contas andaram numa lista de movimentos (ida e volta contam as duas). */
export function custo(movimentos: readonly Movimento[]): number {
  return movimentos.reduce((t, m) => t + Math.abs(m.cinco) + Math.abs(m.uns), 0);
}

/** O mínimo de contas que precisam andar de um estado ao outro. */
export function distancia(a: Soroban, b: Soroban): number {
  return a.reduce((t, h, i) => t + (h.cinco === b[i].cinco ? 0 : 1) + Math.abs(h.uns - b[i].uns), 0);
}
