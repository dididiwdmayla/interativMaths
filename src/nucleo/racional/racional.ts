/**
 * Racional exato: numerador e denominador inteiros, sempre reduzido, denominador positivo.
 * Toda quantidade do jogo é um Racional (ou um inteiro). Ponto flutuante só para desenhar.
 */
export interface Racional {
  readonly n: number;
  readonly d: number;
}

function mdc(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x;
}

export function mmc(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / mdc(a, b)) * b);
}

function exigirInteiro(valor: number, nome: string): void {
  if (!Number.isSafeInteger(valor)) {
    throw new RangeError(`${nome} precisa ser inteiro seguro; veio ${valor}`);
  }
}

/** Cria um racional reduzido. `racional(6, 8)` vale 3/4. */
export function racional(n: number, d: number = 1): Racional {
  exigirInteiro(n, "numerador");
  exigirInteiro(d, "denominador");
  if (d === 0) throw new RangeError("denominador zero");
  const sinal = d < 0 ? -1 : 1;
  const g = mdc(n, d) || 1;
  const nn = (sinal * n) / g;
  const dd = Math.abs(d) / g;
  return { n: nn === 0 ? 0 : nn, d: dd };
}

export const ZERO: Racional = racional(0);
export const UM: Racional = racional(1);

export function inteiro(k: number): Racional {
  return racional(k, 1);
}

export function soma(a: Racional, b: Racional): Racional {
  return racional(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function subtrai(a: Racional, b: Racional): Racional {
  return racional(a.n * b.d - b.n * a.d, a.d * b.d);
}

export function multiplica(a: Racional, b: Racional): Racional {
  return racional(a.n * b.n, a.d * b.d);
}

export function divide(a: Racional, b: Racional): Racional {
  if (b.n === 0) throw new RangeError("divisão por zero");
  return racional(a.n * b.d, a.d * b.n);
}

/** Multiplica por um inteiro. */
export function vezes(a: Racional, k: number): Racional {
  exigirInteiro(k, "fator");
  return racional(a.n * k, a.d);
}

export function somaTodos(lista: readonly Racional[]): Racional {
  return lista.reduce<Racional>((acc, r) => soma(acc, r), ZERO);
}

export function igual(a: Racional, b: Racional): boolean {
  return a.n === b.n && a.d === b.d;
}

export function compara(a: Racional, b: Racional): -1 | 0 | 1 {
  const x = a.n * b.d;
  const y = b.n * a.d;
  return x < y ? -1 : x > y ? 1 : 0;
}

export function menorQue(a: Racional, b: Racional): boolean {
  return compara(a, b) < 0;
}

export function maiorQue(a: Racional, b: Racional): boolean {
  return compara(a, b) > 0;
}

export function ehZero(a: Racional): boolean {
  return a.n === 0;
}

export function ehInteiro(a: Racional): boolean {
  return a.d === 1;
}

/** Parte inteira (arredonda para baixo). */
export function parteInteira(a: Racional): number {
  return Math.floor(a.n / a.d);
}

export function parteFracionaria(a: Racional): Racional {
  return subtrai(a, inteiro(parteInteira(a)));
}

/** Só para desenho: nunca use o resultado em regra. */
export function paraNumero(a: Racional): number {
  return a.n / a.d;
}

/** Chave estável para mapas: "3/4", "5/1". */
export function chave(a: Racional): string {
  return `${a.n}/${a.d}`;
}

export function deChave(texto: string): Racional {
  const r = lerRacional(texto);
  if (!r) throw new RangeError(`chave de racional inválida: ${texto}`);
  return r;
}

/** Escreve em notação curta: "5", "3/4", ou misto "1 1/4". */
export function formatar(a: Racional, opcoes: { misto?: boolean } = {}): string {
  if (a.d === 1) return String(a.n);
  if (opcoes.misto && Math.abs(a.n) > a.d) {
    const sinal = a.n < 0 ? "-" : "";
    const abs = racional(Math.abs(a.n), a.d);
    const k = parteInteira(abs);
    const resto = subtrai(abs, inteiro(k));
    return `${sinal}${k} ${resto.n}/${resto.d}`;
  }
  return `${a.n}/${a.d}`;
}

/**
 * Lê "5", "3/4", "1 1/4", "-2/3" ou decimal com vírgula ("0,75").
 * Devolve null se o texto não for um número.
 */
export function lerRacional(texto: string): Racional | null {
  const t = texto.trim();
  let m = /^(-?\d+)$/.exec(t);
  if (m) return racional(Number(m[1]));
  m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[2]);
    return d === 0 ? null : racional(Number(m[1]), d);
  }
  m = /^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(t);
  if (m) {
    const d = Number(m[4]);
    if (d === 0) return null;
    const abs = soma(inteiro(Number(m[2])), racional(Number(m[3]), d));
    return m[1] === "-" ? racional(-abs.n, abs.d) : abs;
  }
  m = /^(-?)(\d+),(\d+)$/.exec(t);
  if (m) {
    const casas = m[3].length;
    const valor = racional(Number(m[2] + m[3]), 10 ** casas);
    return m[1] === "-" ? racional(-valor.n, valor.d) : valor;
  }
  return null;
}

/** Aceita número ou texto e devolve Racional. Útil para dados de conteúdo. */
export function comoRacional(valor: number | string | Racional): Racional {
  if (typeof valor === "number") return inteiro(valor);
  if (typeof valor === "string") {
    const r = lerRacional(valor);
    if (!r) throw new RangeError(`não é número: ${valor}`);
    return r;
  }
  return racional(valor.n, valor.d);
}

export function minimo(a: Racional, b: Racional): Racional {
  return menorQue(a, b) ? a : b;
}

export function maximo(a: Racional, b: Racional): Racional {
  return maiorQue(a, b) ? a : b;
}
