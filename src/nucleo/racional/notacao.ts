/**
 * Notação matemática como dado: "26 ÷ 4 = 6, resto 2", "3 ÷ 4 = 3/4", "5 ÷ 4 = 1 1/4 = 5/4".
 * Convenções brasileiras: vírgula decimal, × e ÷, fração empilhada (a tela desenha o traço).
 * Toda expressão tem leitura por extenso para leitor de tela.
 */
import { fracaoPorExtenso, inteiroPorExtenso } from "./extenso";
import { inteiro, racional, soma, type Racional } from "./racional";

export type Operador = "÷" | "×" | "+" | "−" | "=";

export type FormaNumero = "inteiro" | "fracao" | "misto";

export interface TokenNumero {
  readonly t: "num";
  readonly forma: FormaNumero;
  /** Parte inteira (inteiro e misto). */
  readonly inteiro: number | null;
  /** Numerador e denominador como escritos, sem reduzir (fração e misto). */
  readonly n: number | null;
  readonly d: number | null;
}

export interface TokenOperador {
  readonly t: "op";
  readonly op: Operador;
}

export interface TokenPalavra {
  readonly t: "palavra";
  readonly texto: string;
}

export interface TokenVirgula {
  readonly t: "virgula";
}

export type Token = TokenNumero | TokenOperador | TokenPalavra | TokenVirgula;

export type Papel =
  | "dividendo"
  | "divisor"
  | "quociente"
  | "resto"
  | "fator"
  | "produto"
  | "parcela"
  | "soma";

const OPERADORES: Record<string, Operador> = {
  "÷": "÷",
  ":": "÷",
  "×": "×",
  x: "×",
  "*": "×",
  "+": "+",
  "−": "−",
  "-": "−",
  "=": "=",
};

function lerNumeroSimples(p: string): TokenNumero | null {
  let m = /^(\d+)$/.exec(p);
  if (m) return { t: "num", forma: "inteiro", inteiro: Number(m[1]), n: null, d: null };
  m = /^(\d+)\/(\d+)$/.exec(p);
  if (m && Number(m[2]) !== 0) {
    return { t: "num", forma: "fracao", inteiro: null, n: Number(m[1]), d: Number(m[2]) };
  }
  return null;
}

/** Lê uma expressão escrita com espaços entre os termos. Mistos: "1 1/4". */
export function lerExpressao(texto: string): Token[] {
  const partes = texto
    .replace(/,/g, " , ")
    .split(/\s+/)
    .filter((p) => p.length > 0);
  const tokens: Token[] = [];
  for (const p of partes) {
    if (p === ",") {
      tokens.push({ t: "virgula" });
      continue;
    }
    const op = OPERADORES[p];
    if (op) {
      tokens.push({ t: "op", op });
      continue;
    }
    const num = lerNumeroSimples(p);
    if (num) {
      const anterior = tokens[tokens.length - 1];
      if (num.forma === "fracao" && anterior && anterior.t === "num" && anterior.forma === "inteiro") {
        tokens[tokens.length - 1] = { t: "num", forma: "misto", inteiro: anterior.inteiro, n: num.n, d: num.d };
      } else {
        tokens.push(num);
      }
      continue;
    }
    tokens.push({ t: "palavra", texto: p });
  }
  return tokens;
}

export function valorDoNumero(tk: TokenNumero): Racional {
  if (tk.forma === "inteiro") return inteiro(tk.inteiro ?? 0);
  const frac = racional(tk.n ?? 0, tk.d ?? 1);
  if (tk.forma === "fracao") return frac;
  return soma(inteiro(tk.inteiro ?? 0), frac);
}

export function textoDoNumero(tk: TokenNumero): string {
  if (tk.forma === "inteiro") return String(tk.inteiro);
  if (tk.forma === "fracao") return `${tk.n}/${tk.d}`;
  return `${tk.inteiro} ${tk.n}/${tk.d}`;
}

export function numeroPorExtenso(tk: TokenNumero): string {
  if (tk.forma === "inteiro") return inteiroPorExtenso(tk.inteiro ?? 0);
  const frac = fracaoPorExtenso(tk.n ?? 0, tk.d ?? 1);
  if (tk.forma === "fracao") return frac;
  const k = tk.inteiro ?? 0;
  return `${k === 1 ? "um inteiro" : `${inteiroPorExtenso(k)} inteiros`} e ${frac}`;
}

const LEITURA_OPERADOR: Record<Operador, string> = {
  "÷": "dividido por",
  "×": "vezes",
  "+": "mais",
  "−": "menos",
  "=": "é igual a",
};

/** "26 ÷ 4 = 6, resto 2" → "vinte e seis dividido por quatro é igual a seis, resto dois". */
export function expressaoPorExtenso(tokens: readonly Token[]): string {
  let saida = "";
  for (const tk of tokens) {
    if (tk.t === "virgula") {
      saida += ",";
      continue;
    }
    const pedaco =
      tk.t === "num" ? numeroPorExtenso(tk) : tk.t === "op" ? LEITURA_OPERADOR[tk.op] : tk.texto;
    saida += saida.length === 0 ? pedaco : ` ${pedaco}`;
  }
  return saida;
}

export function lerEmVoz(texto: string): string {
  return expressaoPorExtenso(lerExpressao(texto));
}

/**
 * Papéis convencionais dos termos (para os rótulos tocáveis). Devolve um papel por índice de token.
 * Reconhece: a ÷ b = q [, resto r]; a × b = c; c = a × b + r; a + b = c.
 */
export function papeis(tokens: readonly Token[]): (Papel | null)[] {
  const saida: (Papel | null)[] = tokens.map(() => null);
  const idx = tokens.map((tk, i) => ({ tk, i })).filter((x) => x.tk.t !== "virgula");
  const forma = idx
    .map(({ tk }) => (tk.t === "num" ? "N" : tk.t === "op" ? tk.op : tk.t === "palavra" ? tk.texto : ""))
    .join(" ");

  const marcar = (posicoes: number[], nomes: Papel[]) => {
    posicoes.forEach((p, k) => {
      const alvo = idx[p];
      if (alvo) saida[alvo.i] = nomes[k];
    });
  };

  if (/^N ÷ N = N( = N)*( resto N)?$/.test(forma)) {
    marcar([0, 2], ["dividendo", "divisor"]);
    for (let p = 4; p < idx.length; p += 2) {
      const tk = idx[p]?.tk;
      if (tk && tk.t === "num") saida[idx[p].i] = "quociente";
    }
    const ir = forma.split(" ").indexOf("resto");
    if (ir >= 0) marcar([ir + 1], ["resto"]);
    return saida;
  }
  if (/^N × N = N$/.test(forma)) {
    marcar([0, 2, 4], ["fator", "fator", "produto"]);
    return saida;
  }
  if (/^N = N × N \+ N$/.test(forma)) {
    marcar([0, 2, 4, 6], ["dividendo", "divisor", "quociente", "resto"]);
    return saida;
  }
  if (/^N( \+ N)+ = N$/.test(forma)) {
    for (let p = 0; p < idx.length - 2; p += 2) marcar([p], ["parcela"]);
    marcar([idx.length - 1], ["soma"]);
  }
  return saida;
}

export const NOME_DO_PAPEL: Record<Papel, string> = {
  dividendo: "dividendo: o que se reparte",
  divisor: "divisor: entre quantos se reparte",
  quociente: "quociente: quanto fica para cada",
  resto: "resto: o que sobra sem repartir",
  fator: "fator: o que se multiplica",
  produto: "produto: o resultado da multiplicação",
  parcela: "parcela: o que se soma",
  soma: "soma: o total",
};

export const NOME_NUMERADOR = "numerador: quantos pedaços";
export const NOME_DENOMINADOR = "denominador: em quantas partes iguais o inteiro foi cortado";
