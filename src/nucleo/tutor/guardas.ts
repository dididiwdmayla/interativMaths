/**
 * Guardas determinísticas, entre qualquer texto livre (a conversa com IA, o gesto) e o jogador:
 *
 * 1. Não entregar: procura cada segredo do passo em algarismo ("6", "3/4", "3 / 4"), em número
 *    misto ("1 1/4", "1 e 1/4"), por extenso ("três quartos", "uma broa e um quarto") e em corte
 *    ("em 4 partes", "em quartos"). Achou e o passo não está vencido: o texto não passa.
 * 2. Conta certa: toda afirmação de conta ("5 ÷ 4 = 1", "2/8 é mais que 1/4", "a dividido por b
 *    dá c") é lida e conferida com Racional. Uma falsa: o texto não passa.
 * Puras; testadas com as simulações da rota.
 */
import { fracaoPorExtenso, inteiroPorExtenso, nomeDoPedaco } from "../racional/extenso";
import {
  comoRacional,
  compara,
  divide,
  igual,
  multiplica,
  parteFracionaria,
  parteInteira,
  soma,
  subtrai,
  type Racional,
} from "../racional/racional";
import type { Segredo } from "../missoes/segredos";

/* ---------- Leitura de números no texto ---------- */

function normalizar(t: string): string {
  return t
    .toLowerCase()
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, " ");
}

/** Todos os valores numéricos escritos com algarismos: inteiros, frações e mistos. */
export function valoresEscritos(texto: string): Racional[] {
  const t = normalizar(texto);
  const saida: Racional[] = [];
  const re = /(\d+)\s+(?:e\s+)?(\d+)\s*\/\s*(\d+)|(\d+)\s*\/\s*(\d+)|(\d+)(?:[.,](\d+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t)) !== null) {
    if (m[1] !== undefined) {
      if (Number(m[3]) === 0) continue;
      saida.push(soma(comoRacional(Number(m[1])), comoRacional(`${m[2]}/${m[3]}`)));
      // O misto também mostra a fração sozinha ("1 1/4" tem um quarto).
      saida.push(comoRacional(`${m[2]}/${m[3]}`));
    } else if (m[4] !== undefined) {
      if (Number(m[5]) === 0) continue;
      saida.push(comoRacional(`${m[4]}/${m[5]}`));
    } else if (m[6] !== undefined) {
      if (m[7] !== undefined) {
        const den = 10 ** m[7].length;
        saida.push(comoRacional(`${Number(m[6]) * den + Number(m[7])}/${den}`));
      } else saida.push(comoRacional(Number(m[6])));
    }
  }
  return saida;
}

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function palavra(frase: string): RegExp {
  return new RegExp(`(^|[^\\p{L}])${escapar(frase)}($|[^\\p{L}])`, "u");
}

/** Formas por extenso de um valor: "seis", "três quartos", "seis oitavos", "um e um quarto". */
function formasPorExtenso(r: Racional): RegExp[] {
  const saida: RegExp[] = [];
  if (r.d === 1) {
    // Zero e um aparecem em toda frase ("uma volta"): só algarismo conta.
    if (r.n <= 1) return [];
    for (const gen of ["m", "f"] as const) saida.push(palavra(inteiroPorExtenso(r.n, gen)));
    return saida;
  }
  for (let k = 1; k <= 4; k++) saida.push(palavra(fracaoPorExtenso(r.n * k, r.d * k)));
  if (r.n > r.d) {
    const inteira = parteInteira(r);
    const resto = parteFracionaria(r);
    for (const gen of ["m", "f"] as const) {
      const k = escapar(inteiroPorExtenso(inteira, gen));
      for (let j = 1; j <= 2; j++) {
        const fr = escapar(fracaoPorExtenso(resto.n * j, resto.d * j));
        saida.push(new RegExp(`(^|[^\\p{L}])${k}(\\s+\\p{L}+)?\\s+e\\s+(mais\\s+)?${fr}($|[^\\p{L}])`, "u"));
      }
    }
    saida.push(palavra(`um inteiro e ${fracaoPorExtenso(resto.n, resto.d)}`));
  }
  return saida;
}

/** Formas de dizer um corte: "em 4", "em quatro", "4 partes", "em quartos". */
function formasDeCorte(k: number): RegExp[] {
  const saida: RegExp[] = [new RegExp(`\\bem\\s+${k}\\b`), new RegExp(`\\b${k}\\s+partes\\b`), new RegExp(`\\b${k}\\s+peda[çc]os\\s+iguais\\b`)];
  for (const gen of ["m", "f"] as const) {
    const ext = escapar(inteiroPorExtenso(k, gen));
    saida.push(new RegExp(`(^|[^\\p{L}])em\\s+${ext}($|[^\\p{L}])`, "u"), new RegExp(`(^|[^\\p{L}])${ext}\\s+partes($|[^\\p{L}])`, "u"));
  }
  if (k >= 2) saida.push(new RegExp(`(^|[^\\p{L}])em\\s+${escapar(nomeDoPedaco(k, true))}($|[^\\p{L}])`, "u"));
  return saida;
}

/* ---------- 1. Não entregar ---------- */

/** O primeiro segredo que o texto entrega, ou null. */
export function segredoEntregue(texto: string, lista: readonly Segredo[]): Segredo | null {
  const t = normalizar(texto);
  const escritos = valoresEscritos(texto);
  for (const s of lista) {
    if (s.tipo === "opcao") {
      if (s.texto && palavra(normalizar(s.texto)).test(t)) return s;
      continue;
    }
    if (s.tipo === "partes") {
      if (formasDeCorte(s.valor.n).some((re) => re.test(t))) return s;
      continue;
    }
    if (escritos.some((v) => igual(v, s.valor))) return s;
    if (formasPorExtenso(s.valor).some((re) => re.test(t))) return s;
  }
  return null;
}

/* ---------- 2. Conta certa ---------- */

export interface AfirmacaoConta {
  readonly texto: string;
  readonly verdadeira: boolean;
}

const NUM = String.raw`(\d+(?:\s+(?:e\s+)?\d+\s*\/\s*\d+)?(?:\s*\/\s*\d+)?)`;

function lerValor(s: string): Racional | null {
  const v = valoresEscritos(s);
  return v.length > 0 ? v[0] : null;
}

function operar(a: Racional, op: string, b: Racional): Racional | null {
  switch (op) {
    case "+":
    case "mais":
      return soma(a, b);
    case "-":
    case "menos":
      return subtrai(a, b);
    case "×":
    case "x":
    case "*":
    case "vezes":
      return multiplica(a, b);
    case "÷":
    case ":":
    case "dividido por":
      if (b.n === 0) return null;
      return divide(a, b);
    default:
      return null;
  }
}

/**
 * As afirmações de conta do texto, conferidas. "5 ÷ 4 = 1" é falsa (só vale com "resto"); "24 ÷ 4
 * dá 6" é verdadeira; "2/8 é mais que 1/4" é falsa.
 */
export function afirmacoesDeConta(texto: string): AfirmacaoConta[] {
  const t = normalizar(texto);
  const saida: AfirmacaoConta[] = [];
  const opRe = String.raw`(\+|-|×|x|\*|÷|:|mais|menos|vezes|dividido por)`;
  const contaRe = new RegExp(`${NUM}\\s*${opRe}\\s*${NUM}\\s*(?:=|é igual a|dá|da|são|resulta em|fica)\\s*${NUM}(\\s*,?\\s*(?:e\\s+)?(?:com\\s+)?resto\\s+(\\d+))?`, "g");
  let m: RegExpExecArray | null;
  while ((m = contaRe.exec(t)) !== null) {
    const a = lerValor(m[1]);
    const b = lerValor(m[3]);
    const c = lerValor(m[4]);
    if (!a || !b || !c) continue;
    const op = m[2];
    const resto = m[6] !== undefined ? comoRacional(Number(m[6])) : null;
    let verdadeira: boolean;
    if (resto && (op === "÷" || op === ":" || op === "dividido por")) {
      // a ÷ b = q, resto r: a = b·q + r, com r < b.
      verdadeira = igual(a, soma(multiplica(b, c), resto)) && compara(resto, b) < 0 && c.d === 1;
    } else {
      const r = operar(a, op, b);
      verdadeira = r !== null && igual(r, c);
    }
    saida.push({ texto: m[0], verdadeira });
  }
  const compRe = new RegExp(`${NUM}\\s*(?:é|e)?\\s*(maior que|mais que|menor que|menos que|igual a|o mesmo que|>|<)\\s*${NUM}`, "g");
  while ((m = compRe.exec(t)) !== null) {
    const a = lerValor(m[1]);
    const b = lerValor(m[3]);
    if (!a || !b) continue;
    const c = compara(a, b);
    const rel = m[2];
    const verdadeira = rel === "maior que" || rel === "mais que" || rel === ">" ? c > 0 : rel === "menor que" || rel === "menos que" || rel === "<" ? c < 0 : c === 0;
    saida.push({ texto: m[0], verdadeira });
  }
  return saida;
}

/** A primeira conta falsa do texto, ou null. */
export function contaFalsa(texto: string): AfirmacaoConta | null {
  return afirmacoesDeConta(texto).find((x) => !x.verdadeira) ?? null;
}
