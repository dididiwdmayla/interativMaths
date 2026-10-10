/**
 * Leitura por extenso em português do Brasil, para leitor de tela e para a frase do Caderno.
 */
import { parteInteira, racional, subtrai, inteiro, type Racional } from "./racional";

export type Genero = "m" | "f";

const UNIDADES_M = [
  "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS_M = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function unidade(k: number, genero: Genero): string {
  if (genero === "f") {
    if (k === 1) return "uma";
    if (k === 2) return "duas";
  }
  return UNIDADES_M[k];
}

function centena(k: number, genero: Genero): string {
  const c = CENTENAS_M[k];
  if (genero === "f" && k >= 2) return c.replace(/os$/, "as");
  return c;
}

function ate999(k: number, genero: Genero): string {
  if (k < 20) return unidade(k, genero);
  if (k < 100) {
    const d = Math.floor(k / 10);
    const u = k % 10;
    return u === 0 ? DEZENAS[d] : `${DEZENAS[d]} e ${unidade(u, genero)}`;
  }
  if (k === 100) return "cem";
  const c = Math.floor(k / 100);
  const r = k % 100;
  return r === 0 ? centena(c, genero) : `${centena(c, genero)} e ${ate999(r, genero)}`;
}

/** Inteiro por extenso: 26 → "vinte e seis"; 2 (f) → "duas". Cobre até 999 999. */
export function inteiroPorExtenso(k: number, genero: Genero = "m"): string {
  if (!Number.isSafeInteger(k)) throw new RangeError(`não é inteiro: ${k}`);
  if (k < 0) return `menos ${inteiroPorExtenso(-k, genero)}`;
  if (k < 1000) return ate999(k, genero);
  if (k > 999_999) return String(k);
  const milhares = Math.floor(k / 1000);
  const resto = k % 1000;
  const parteMil = milhares === 1 ? "mil" : `${ate999(milhares, "m")} mil`;
  if (resto === 0) return parteMil;
  const liga = resto < 100 || resto % 100 === 0 ? " e " : " ";
  return `${parteMil}${liga}${ate999(resto, genero)}`;
}

const ORDINAIS: Record<number, [string, string]> = {
  2: ["meio", "meios"],
  3: ["terço", "terços"],
  4: ["quarto", "quartos"],
  5: ["quinto", "quintos"],
  6: ["sexto", "sextos"],
  7: ["sétimo", "sétimos"],
  8: ["oitavo", "oitavos"],
  9: ["nono", "nonos"],
  10: ["décimo", "décimos"],
  100: ["centésimo", "centésimos"],
  1000: ["milésimo", "milésimos"],
};

/** Nome do pedaço: 4 → "quarto"; 12 → "doze avos". Plural quando `plural`. */
export function nomeDoPedaco(d: number, plural = false): string {
  const o = ORDINAIS[d];
  if (o) return plural ? o[1] : o[0];
  return `${inteiroPorExtenso(d)} avos`;
}

/**
 * Fração como escrita (sem reduzir): (2, 4) → "dois quartos"; (3, 1) → "três inteiros".
 */
export function fracaoPorExtenso(n: number, d: number): string {
  if (d === 1) return n === 1 ? "um inteiro" : `${inteiroPorExtenso(n)} inteiros`;
  const sinal = n < 0 ? "menos " : "";
  const abs = Math.abs(n);
  return `${sinal}${inteiroPorExtenso(abs)} ${nomeDoPedaco(d, abs !== 1)}`;
}

/**
 * Racional por extenso. Inteiro sai como número ("seis");
 * fração imprópria sai mista quando `misto` ("um inteiro e um quarto").
 */
export function racionalPorExtenso(r: Racional, opcoes: { misto?: boolean; genero?: Genero } = {}): string {
  const genero = opcoes.genero ?? "m";
  if (r.d === 1) return inteiroPorExtenso(r.n, genero);
  if (opcoes.misto && Math.abs(r.n) > r.d) {
    const sinal = r.n < 0 ? "menos " : "";
    const abs = racional(Math.abs(r.n), r.d);
    const k = parteInteira(abs);
    const resto = subtrai(abs, inteiro(k));
    const parteK = k === 1 ? "um inteiro" : `${inteiroPorExtenso(k)} inteiros`;
    return `${sinal}${parteK} e ${fracaoPorExtenso(resto.n, resto.d)}`;
  }
  return fracaoPorExtenso(r.n, r.d);
}
