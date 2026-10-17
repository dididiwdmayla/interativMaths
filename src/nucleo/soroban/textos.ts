/**
 * O estado do soroban em palavras e números: a linha do gesto, o recado do Nônio, a ajuda de cada
 * degrau, os pares que importam, o rascunho a lápis, a conta passada a caneta e o caso parecido.
 * Puro: os modelos de texto vêm do conteudo (src/conteudo/lapidacao.ts) como argumento; aqui só se
 * escolhe o modelo e se preenchem os números do momento.
 */
import { lanceAtual, lancesDoItem, modoDoItem, type EstadoItem, type LanceFechado } from "./item";
import { algarismosDe, lancesDaOperacao, resultadoDe, type LanceDaOperacao, type Operacao } from "./operacao";
import { marcasDeTecnica, planoDoLance, type Marca } from "./plano";
import { mostrar, posicaoDaHaste, sorobanVazio, valorDaHaste, type Movimento, type Soroban } from "./soroban";

export function preencher(modelo: string, valores: Readonly<Record<string, string | number>>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => (k in valores ? String(valores[k]) : `{${k}}`));
}

/** Os nomes das hastes por posição (0 = unidades), como no conteúdo. */
export interface NomeDaPosicao {
  readonly rotulo: string;
  readonly nome: string;
  readonly da: string;
}

export function nomeDaHaste(nomes: readonly NomeDaPosicao[], hastes: number, i: number): NomeDaPosicao {
  return nomes[Math.min(nomes.length - 1, posicaoDaHaste(hastes, i))];
}

/** O tipo de um lance para escolher os textos: o que a haste do lance pede. */
export type TipoDeLance = "mostrar" | "direto" | "diretoTirar" | "cincoPor" | "cincoTirar" | "dezPor" | "dezTirar" | "juntosPor" | "juntosTirar";

export function tipoDoLance(ld: LanceDaOperacao): TipoDeLance {
  if (ld.lance.tipo === "mostrar") return "mostrar";
  const por = ld.lance.tipo === "por";
  const m = ld.plano.marcas;
  if (m.includes("juntos")) return por ? "juntosPor" : "juntosTirar";
  if (m.includes("complemento-10")) return por ? "dezPor" : "dezTirar";
  if (m.includes("complemento-5")) return por ? "cincoPor" : "cincoTirar";
  return por ? "direto" : "diretoTirar";
}

/** Os números do momento de um lance, para os modelos ({d}, {m}, {par}, {livres}, {uns}, {resto}, {haste}). */
export function medidasDoLance(ld: LanceDaOperacao, nomes: readonly NomeDaPosicao[]): Record<string, string> {
  if (ld.lance.tipo === "mostrar") return { n: String(ld.lance.valor) };
  const h = ld.inicio[ld.lance.haste];
  const d = ld.lance.d;
  const m = 10 - d;
  const juntos = ld.plano.marcas.includes("juntos");
  return {
    d: String(d),
    m: String(m),
    par: String(juntos ? 5 - m : 5 - d),
    livres: String(4 - h.uns),
    uns: String(h.uns),
    resto: String(Math.max(0, d - 5)),
    haste: nomeDaHaste(nomes, ld.inicio.length, ld.lance.haste).da,
  };
}

/** Os pares que importam neste lance (o degrau 2 e o caminho junto os marcam). */
export function paresDoLance(ld: LanceDaOperacao): { readonly cinco: readonly [number, number] | null; readonly dez: readonly [number, number] | null } {
  if (ld.lance.tipo === "mostrar") return { cinco: null, dez: null };
  const d = ld.lance.d;
  const ordem = (a: number, b: number): [number, number] => (a <= b ? [a, b] : [b, a]);
  const m = ld.plano.marcas;
  if (m.includes("juntos")) return { cinco: ordem(10 - d, 5 - (10 - d)), dez: ordem(d, 10 - d) };
  if (m.includes("complemento-10")) return { cinco: null, dez: ordem(d, 10 - d) };
  if (m.includes("complemento-5")) return { cinco: ordem(d, 5 - d), dez: null };
  return { cinco: null, dez: null };
}

/* ---------- A linha do gesto ---------- */

export interface ModelosGesto {
  readonly mostrar: string;
  readonly por: string;
  readonly tirar: string;
  readonly ler: string;
  readonly sombra: string;
  readonly sombraFim: string;
  readonly cabeca: string;
  readonly ditadoOuvir: string;
  readonly ditadoFim: string;
  readonly junto: string;
}

/** A lista "1, 2 e 3". */
export function listaDeOrdens(n: number): string {
  const nums = Array.from({ length: n }, (_, i) => String(i + 1));
  return nums.length <= 1 ? nums.join("") : `${nums.slice(0, -1).join(", ")} e ${nums[nums.length - 1]}`;
}

/** O que fazer agora, com verbo, em caneta. null quando o item terminou. */
export function gestoDoItem(e: EstadoItem, t: ModelosGesto, nomes: readonly NomeDaPosicao[], caminho: readonly Movimento[] | null): string | null {
  if (e.terminado) return null;
  const modo = modoDoItem(e.item);
  const op = e.item.operacao;
  if (modo === "leitura") return t.ler;
  if (modo === "cabeca") return t.cabeca;
  if (modo === "ditado") return op.tipo === "ditado" && e.mostrados < op.numeros.length ? t.ditadoOuvir : t.ditadoFim;
  if (modo === "sombra") return e.aberto.movimentos.length === 0 && (op.tipo === "somar" || op.tipo === "subtrair") ? preencher(t.sombra, { a: op.a }) : t.sombraFim;
  if (caminho && caminho.length > 0) return preencher(t.junto, { lista: listaDeOrdens(caminho.length) });
  const atual = lanceAtual(e);
  if (!atual) return null;
  const ld = atual.lance;
  if (ld.lance.tipo === "mostrar") return preencher(t.mostrar, { n: ld.lance.valor });
  return preencher(ld.lance.tipo === "por" ? t.por : t.tirar, medidasDoLance(ld, nomes));
}

/** O caminho curto que falta, do estado de agora até o alvo do lance aberto (o caminho junto). */
export function caminhoQueFalta(e: EstadoItem): readonly Movimento[] {
  const atual = lanceAtual(e);
  if (!atual) return [];
  const p = planoDoLance(e.soroban, { tipo: "mostrar", valor: valorDoSoroban(atual.lance.plano.alvo) });
  return p?.movimentos ?? [];
}

function valorDoSoroban(s: Soroban): number {
  return s.reduce((t, h) => t * 10 + valorDaHaste(h), 0);
}

/* ---------- O rascunho a lápis ---------- */

export interface ModelosRascunho {
  readonly mostrou: string;
  readonly mostrouVaiEVolta: string;
  readonly linhaHaste: string;
  readonly separador: string;
}

/** "+5", "−1": como um movimento se escreve. */
export function textoDoMovimento(m: Movimento): string {
  const v = m.cinco !== 0 ? 5 * m.cinco : m.uns;
  return `${v > 0 ? "+" : "−"}${Math.abs(v)}`;
}

/** Os movimentos de um lance, juntando os seguidos da mesma haste: "Dezena: +1 · Unidade: −5 +2". */
export function movimentosPorHaste(movimentos: readonly Movimento[], hastes: number, nomes: readonly NomeDaPosicao[], t: Pick<ModelosRascunho, "linhaHaste" | "separador">): string {
  const grupos: { haste: number; textos: string[] }[] = [];
  for (const m of movimentos) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.haste === m.haste) ultimo.textos.push(textoDoMovimento(m));
    else grupos.push({ haste: m.haste, textos: [textoDoMovimento(m)] });
  }
  return grupos.map((g) => preencher(t.linhaHaste, { haste: nomeDaHaste(nomes, hastes, g.haste).nome, movimentos: g.textos.join(" ") })).join(t.separador);
}

/** Uma linha por lance fechado, com os movimentos que o jogador fez. */
export function rascunhoDoItem(e: EstadoItem, nomes: readonly NomeDaPosicao[], t: ModelosRascunho): string[] {
  const lances = lancesDoItem(e);
  return e.fechados.map((f, i) => {
    const ld = lances[i];
    if (ld.lance.tipo === "mostrar") return preencher(f.limpo ? t.mostrou : t.mostrouVaiEVolta, { n: ld.lance.valor });
    return movimentosPorHaste(f.movimentos, e.hastes, nomes, t);
  });
}

/* ---------- A conta passada a caneta ---------- */

export interface LinhaDaConta {
  /** "Dezena", "Unidade". */
  readonly haste: string;
  /** "+4" (o algarismo) e, se não é direto, a decomposição: "+5 − 1". */
  readonly lance: string;
  readonly decomposicao: string | null;
  /** As marcas que viram técnica (a etiqueta), na ordem. */
  readonly marcas: readonly Exclude<Marca, "cadeia">[];
  readonly cadeia: boolean;
  readonly vaiEVolta: boolean;
  readonly comAjuda: boolean;
}

export interface ContaDoItem {
  readonly tipo: "operacao" | "numero" | "ditado";
  /** Os números e sinais da linha de cima: [23, "+", 14, "=", 37]. */
  readonly termos: readonly (number | string)[];
  readonly nomes: readonly string[];
  readonly linhas: readonly LinhaDaConta[];
  /** Na leitura e no mostrar: o algarismo de cada haste ("Unidade 7 = 5 + 2"). */
  readonly hastes: readonly { readonly haste: string; readonly algarismo: number }[];
  readonly expressao: string;
}

/** "+5 − 1", "−10 + 5 − 2": a decomposição de um lance, com sinais. */
export function textoDaDecomposicao(dec: readonly number[]): string {
  return dec.map((v, i) => (i === 0 ? `${v > 0 ? "+" : "−"}${Math.abs(v)}` : `${v > 0 ? "+" : "−"} ${Math.abs(v)}`)).join(" ");
}

export function contaDoItem(e: EstadoItem, nomes: readonly NomeDaPosicao[], nomesDosTermos: { readonly somar: readonly string[]; readonly subtrair: readonly string[]; readonly numero: string; readonly ditado: string }): ContaDoItem {
  const op = e.item.operacao;
  const r = resultadoDe(op);
  if (op.tipo === "mostrar" || op.tipo === "ler") {
    const s = mostrar(e.hastes, op.valor);
    const hastes = s.map((h, i) => ({ haste: nomeDaHaste(nomes, e.hastes, i).nome, algarismo: valorDaHaste(h) })).filter((x, i) => x.algarismo > 0 || i === s.length - 1);
    return { tipo: "numero", termos: [op.valor], nomes: [nomesDosTermos.numero], linhas: [], hastes, expressao: String(op.valor) };
  }
  if (op.tipo === "ditado") {
    const termos: (number | string)[] = [];
    op.numeros.forEach((n, i) => {
      if (i > 0) termos.push(n > 0 ? "+" : "−");
      termos.push(Math.abs(n));
    });
    termos.push("=", r);
    return { tipo: "ditado", termos, nomes: [], linhas: [], hastes: [], expressao: termos.join(" ") };
  }
  const sinal = op.tipo === "somar" ? "+" : "−";
  const lances = lancesDaOperacao(op, e.hastes);
  const fechados: readonly (LanceFechado | undefined)[] = modoDoItem(e.item) === "maos" ? e.fechados : [];
  const linhas: LinhaDaConta[] = [];
  lances.forEach((ld, i) => {
    if (ld.lance.tipo === "mostrar") return;
    const f = fechados[i];
    const tecnicas = marcasDeTecnica(ld.plano.marcas).filter((m): m is Exclude<Marca, "cadeia"> => m !== "cadeia");
    const direto = tecnicas.length === 1 && tecnicas[0] === "direto";
    linhas.push({
      haste: nomeDaHaste(nomes, e.hastes, ld.lance.haste).nome,
      lance: `${ld.lance.tipo === "por" ? "+" : "−"}${ld.lance.d}`,
      decomposicao: direto ? null : textoDaDecomposicao(ld.plano.decomposicao),
      marcas: tecnicas,
      cadeia: ld.plano.marcas.includes("cadeia"),
      vaiEVolta: f !== undefined && !f.limpo,
      comAjuda: f !== undefined && (f.ajuda >= 2 || f.pares),
    });
  });
  const nomesOp = op.tipo === "somar" ? nomesDosTermos.somar : nomesDosTermos.subtrair;
  return { tipo: "operacao", termos: [op.a, sinal, op.b, "=", r], nomes: nomesOp, linhas, hastes: [], expressao: `${op.a} ${sinal} ${op.b} = ${r}` };
}

/* ---------- O caso parecido (degrau 3) ---------- */

/** Mesma técnica, outros números, numa haste ou duas: o soroban pequeno do caso parecido. */
export function casoParecido(ld: LanceDaOperacao): Operacao | null {
  if (ld.lance.tipo === "mostrar") return null;
  const alvo = marcasDeTecnica(ld.plano.marcas).join(",");
  const tipo = ld.lance.tipo;
  const x = valorDaHaste(ld.inicio[ld.lance.haste]);
  // Primeiro os números pequenos e sem resultado redondo; se não houver, qualquer um até 99.
  for (const redondo of [false, true]) {
    for (let s = 1; s <= 99; s++) {
      for (let e = 1; e <= 9; e++) {
        if (s % 10 === x && e === ld.lance.d) continue;
        const r = tipo === "por" ? s + e : s - e;
        if (r < 1 || r > 99 || (!redondo && r % 10 === 0)) continue;
        const op: Operacao = tipo === "por" ? { tipo: "somar", a: s, b: e } : { tipo: "subtrair", a: s, b: e };
        const l = lancesDaOperacao(op, 2);
        const digito = l[l.length - 1];
        if (marcasDeTecnica(digito.plano.marcas).join(",") === alvo) return op;
      }
    }
  }
  return null;
}

/** O exemplo de uma técnica (a abertura e o caso parecido): o soroban de duas hastes no começo do lance e o caminho. */
export interface ExemploDesenhado {
  readonly inicio: Soroban;
  readonly movimentos: readonly Movimento[];
  readonly resultado: number;
  /** "3 + 4 = 3 + 5 − 1 = 7" (a conta do exemplo). */
  readonly conta: string;
  readonly hastes: number;
}

export function exemploDaOperacao(op: Operacao): ExemploDesenhado | null {
  if (op.tipo !== "somar" && op.tipo !== "subtrair") return null;
  const r = resultadoDe(op);
  const hastes = Math.max(algarismosDe(op.a).length, algarismosDe(r).length, algarismosDe(op.b).length);
  const lances = lancesDaOperacao(op, hastes);
  const digitos = lances.filter((l) => l.lance.tipo !== "mostrar");
  if (digitos.length === 0) return null;
  const inicio = digitos[0].inicio;
  const movimentos = digitos.flatMap((l) => l.plano.movimentos);
  const sinal = op.tipo === "somar" ? "+" : "−";
  const unico = digitos.length === 1 ? digitos[0] : null;
  const direto = unico ? unico.plano.marcas.length === 1 && unico.plano.marcas[0] === "direto" : true;
  const meio = unico && !direto ? ` = ${op.a} ${textoDaDecomposicao(unico.plano.decomposicao).replace(/^\+/, "+ ").replace(/^−/, "− ")}` : "";
  return { inicio, movimentos, resultado: r, conta: `${op.a} ${sinal} ${op.b}${meio} = ${r}`, hastes };
}

/** O soroban vazio de n hastes (o exemplo de ler e a sombra). */
export function sorobanDoExemplo(hastes: number, valor: number): Soroban {
  return valor === 0 ? sorobanVazio(hastes) : mostrar(hastes, valor);
}
