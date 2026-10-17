/**
 * As operações da bancada. Numa soma ou subtração o jogador mostra o primeiro número (um lance
 * "mostrar") e depois põe ou tira o segundo um algarismo por vez, da esquerda para a direita, que
 * é o método do soroban. Algarismo zero não gera lance. Resultado nunca negativo, nunca acima de 999.
 */
import { planoDoLance, type Lance, type Plano } from "./plano";
import { hasteDaPosicao, HASTES_PADRAO, MAIOR_NUMERO, mostrar, sorobanVazio, type Soroban } from "./soroban";

export type Operacao =
  | { readonly tipo: "mostrar"; readonly valor: number }
  | { readonly tipo: "ler"; readonly valor: number }
  | { readonly tipo: "somar"; readonly a: number; readonly b: number }
  | { readonly tipo: "subtrair"; readonly a: number; readonly b: number }
  /** Números ditados um por vez: o primeiro positivo; os outros com sinal (7, −3, +5). */
  | { readonly tipo: "ditado"; readonly numeros: readonly number[] };

/** Um lance da operação, com o soroban em que ele começa e o caminho curto dele. */
export interface LanceDaOperacao {
  readonly lance: Lance;
  readonly inicio: Soroban;
  readonly plano: Plano;
  /** Na soma e na subtração, a posição do algarismo no segundo número (0 = unidade); no mostrar, null. */
  readonly posicao: number | null;
}

export function algarismosDe(n: number): number[] {
  return String(n).split("").map(Number);
}

export function resultadoDe(op: Operacao): number {
  switch (op.tipo) {
    case "mostrar":
    case "ler":
      return op.valor;
    case "somar":
      return op.a + op.b;
    case "subtrair":
      return op.a - op.b;
    case "ditado":
      return op.numeros.reduce((t, n) => t + n, 0);
  }
}

/** Os parciais do ditado (o total depois de cada número). */
export function parciaisDoDitado(numeros: readonly number[]): number[] {
  const saida: number[] = [];
  let t = 0;
  for (const n of numeros) {
    t += n;
    saida.push(t);
  }
  return saida;
}

/** A operação cabe nas regras: nada negativo, nada acima de 999, inteiros. */
export function operacaoValida(op: Operacao): boolean {
  const ok = (n: number) => Number.isInteger(n) && n >= 0 && n <= MAIOR_NUMERO;
  switch (op.tipo) {
    case "mostrar":
    case "ler":
      return ok(op.valor);
    case "somar":
    case "subtrair":
      return ok(op.a) && ok(op.b) && op.b > 0 && ok(resultadoDe(op));
    case "ditado":
      return op.numeros.length >= 2 && op.numeros.every(Number.isInteger) && ok(op.numeros[0]) && op.numeros.slice(1).every((n) => n !== 0) && parciaisDoDitado(op.numeros).every(ok);
  }
}

/**
 * Os lances da operação, cada um com o soroban de começo (o alvo do anterior) e o caminho curto.
 * Ler e ditado não têm lance no soroban.
 */
export function lancesDaOperacao(op: Operacao, hastes: number = HASTES_PADRAO): LanceDaOperacao[] {
  if (op.tipo === "ler" || op.tipo === "ditado") return [];
  const primeiro = op.tipo === "mostrar" ? op.valor : op.a;
  const saida: LanceDaOperacao[] = [];
  const vazio = sorobanVazio(hastes);
  const mostra = planoDoLance(vazio, { tipo: "mostrar", valor: primeiro });
  if (!mostra) throw new RangeError(`não cabe no soroban: ${primeiro}`);
  saida.push({ lance: { tipo: "mostrar", valor: primeiro }, inicio: vazio, plano: mostra, posicao: null });
  if (op.tipo === "mostrar") return saida;
  let s = mostra.alvo;
  const digitos = algarismosDe(op.b);
  digitos.forEach((d, k) => {
    if (d === 0) return;
    const posicao = digitos.length - 1 - k;
    const lance: Lance = { tipo: op.tipo === "somar" ? "por" : "tirar", haste: hasteDaPosicao(hastes, posicao), d };
    const plano = planoDoLance(s, lance);
    if (!plano) throw new RangeError("operação que não cabe no soroban");
    saida.push({ lance, inicio: s, plano, posicao });
    s = plano.alvo;
  });
  return saida;
}

/** O soroban no fim da operação (o resultado mostrado). */
export function sorobanDoResultado(op: Operacao, hastes: number = HASTES_PADRAO): Soroban {
  return mostrar(hastes, resultadoDe(op));
}

/** A expressão curta, para as fichas pequenas do fim da rodada. */
export function resumoDaOperacao(op: Operacao): string {
  switch (op.tipo) {
    case "mostrar":
      return `mostrar ${op.valor}`;
    case "ler":
      return `ler ${op.valor}`;
    case "somar":
      return `${op.a} + ${op.b}`;
    case "subtrair":
      return `${op.a} − ${op.b}`;
    case "ditado":
      return op.numeros.map((n, i) => (i === 0 ? String(n) : n > 0 ? `+ ${n}` : `− ${-n}`)).join(" ");
  }
}

/** Uma operação escrita ("26 + 7", "52 − 17", "305"): para o laboratório. null se não vale. */
export function operacaoDoTexto(texto: string): Operacao | null {
  const t = texto.trim().replace(/[−–]/g, "-");
  const soma = /^(\d{1,3})\s*([+-])\s*(\d{1,3})$/.exec(t);
  if (soma) {
    const a = Number(soma[1]);
    const b = Number(soma[3]);
    const op: Operacao = soma[2] === "+" ? { tipo: "somar", a, b } : { tipo: "subtrair", a, b };
    return operacaoValida(op) ? op : null;
  }
  if (/^\d{1,3}$/.test(t)) {
    const op: Operacao = { tipo: "mostrar", valor: Number(t) };
    return operacaoValida(op) && op.valor > 0 ? op : null;
  }
  return null;
}
