/**
 * O caminho curto de um lance: pôr ou tirar um algarismo numa haste, ou mostrar um número.
 *
 * O plano diz o alvo (o soroban depois), os movimentos na ordem em que se ensina (cada um é um
 * gesto só) e as marcas da técnica. Dentro de um lance cada haste muda uma vez só; por isso o custo
 * do plano é sempre igual à distância entre o começo e o alvo (testado à exaustão).
 *
 * pôr d na haste i (x = algarismo de agora):
 *   x + d ≤ 9: direto se as contas comportam; senão (só com d ≤ 4) complemento de 5: +5 −(5 − d).
 *   senão: complemento de 10: põe 1 na vizinha da esquerda (que pode pedir complemento de 5, ou
 *   de 10 em cadeia) e tira (10 − d) desta haste, direto ou com o 5 ("juntos").
 * tirar d da haste i:
 *   x ≥ d: direto, ou complemento de 5: −5 +(5 − d).
 *   senão: complemento de 10: tira 1 da vizinha (em cadeia, se ela for 0) e põe (10 − d) aqui,
 *   direto ou com o 5 ("juntos").
 * A vizinha vem primeiro: "pôr 7 é pôr 10 e tirar 3".
 */
import { aplicarMovimento, distancia, mostrar, valorDaHaste, type Haste, type Movimento, type Soroban } from "./soroban";

export type Marca = "direto" | "complemento-5" | "complemento-10" | "juntos" | "cadeia";

/** A ordem em que as marcas aparecem. */
export const ORDEM_MARCAS: readonly Marca[] = ["direto", "complemento-5", "complemento-10", "juntos", "cadeia"];

export type Lance =
  | { readonly tipo: "mostrar"; readonly valor: number }
  | { readonly tipo: "por" | "tirar"; readonly haste: number; readonly d: number };

export interface Plano {
  readonly alvo: Soroban;
  /** Na ordem em que se ensina; cada um mexe só a de cima ou só as de baixo de uma haste. */
  readonly movimentos: readonly Movimento[];
  /** Vazio no "mostrar". */
  readonly marcas: readonly Marca[];
  /** A parte da haste do lance, para a conta escrita: [5, −1] em "+4 = +5 − 1"; [10, −5, 2] em "+7 = +10 − 5 + 2". */
  readonly decomposicao: readonly number[];
}

type Tipo = "direto" | "cinco";

interface Parte {
  readonly movimentos: readonly Movimento[];
  readonly marcas: ReadonlySet<Marca>;
}

/** Pôr d sem a vizinha (x + d ≤ 9): direto, ou com o 5. */
function porAqui(h: Haste, i: number, d: number): { movimentos: Movimento[]; tipo: Tipo } {
  if (d >= 5) {
    const m: Movimento[] = [{ haste: i, cinco: 1, uns: 0 }];
    if (d > 5) m.push({ haste: i, cinco: 0, uns: d - 5 });
    return { movimentos: m, tipo: "direto" };
  }
  if (h.uns + d <= 4) return { movimentos: [{ haste: i, cinco: 0, uns: d }], tipo: "direto" };
  return {
    movimentos: [
      { haste: i, cinco: 1, uns: 0 },
      { haste: i, cinco: 0, uns: -(5 - d) },
    ],
    tipo: "cinco",
  };
}

/** Tirar d sem a vizinha (x ≥ d): direto, ou com o 5. */
function tirarAqui(h: Haste, i: number, d: number): { movimentos: Movimento[]; tipo: Tipo } {
  if (d >= 5) {
    const m: Movimento[] = [{ haste: i, cinco: -1, uns: 0 }];
    if (d > 5) m.push({ haste: i, cinco: 0, uns: -(d - 5) });
    return { movimentos: m, tipo: "direto" };
  }
  if (h.uns >= d) return { movimentos: [{ haste: i, cinco: 0, uns: -d }], tipo: "direto" };
  return {
    movimentos: [
      { haste: i, cinco: -1, uns: 0 },
      { haste: i, cinco: 0, uns: 5 - d },
    ],
    tipo: "cinco",
  };
}

/** O que a vizinha acrescenta às marcas: o complemento de 5 dela, ou a cadeia. */
function marcasDaVizinha(v: Parte): Marca[] {
  const saida: Marca[] = [];
  for (const m of v.marcas) {
    if (m === "complemento-5") saida.push("complemento-5");
    else if (m === "complemento-10" || m === "juntos" || m === "cadeia") saida.push("cadeia");
  }
  return saida;
}

function por(s: Soroban, i: number, d: number): Parte | null {
  const h = s[i];
  if (!h) return null;
  const x = valorDaHaste(h);
  if (x + d <= 9) {
    const r = porAqui(h, i, d);
    return { movimentos: r.movimentos, marcas: new Set<Marca>(r.tipo === "cinco" ? ["complemento-5"] : []) };
  }
  if (i === 0) return null;
  const vizinha = por(s, i - 1, 1);
  if (!vizinha) return null;
  const aqui = tirarAqui(h, i, 10 - d);
  return {
    movimentos: [...vizinha.movimentos, ...aqui.movimentos],
    marcas: new Set<Marca>([aqui.tipo === "cinco" ? "juntos" : "complemento-10", ...marcasDaVizinha(vizinha)]),
  };
}

function tirar(s: Soroban, i: number, d: number): Parte | null {
  const h = s[i];
  if (!h) return null;
  const x = valorDaHaste(h);
  if (x >= d) {
    const r = tirarAqui(h, i, d);
    return { movimentos: r.movimentos, marcas: new Set<Marca>(r.tipo === "cinco" ? ["complemento-5"] : []) };
  }
  if (i === 0) return null;
  const vizinha = tirar(s, i - 1, 1);
  if (!vizinha) return null;
  const aqui = porAqui(h, i, 10 - d);
  return {
    movimentos: [...vizinha.movimentos, ...aqui.movimentos],
    marcas: new Set<Marca>([aqui.tipo === "cinco" ? "juntos" : "complemento-10", ...marcasDaVizinha(vizinha)]),
  };
}

function decomposicaoDe(tipo: "por" | "tirar", d: number, marcas: ReadonlySet<Marca>): number[] {
  const sinal = tipo === "por" ? 1 : -1;
  const m = 10 - d;
  if (marcas.has("juntos")) return [10 * sinal, -5 * sinal, (5 - m) * sinal];
  if (marcas.has("complemento-10")) return [10 * sinal, -m * sinal];
  // O complemento de 5 da própria haste (o da vizinha não muda a conta desta).
  if (marcas.has("complemento-5")) return [5 * sinal, -(5 - d) * sinal];
  return [d * sinal];
}

function aplicarTodos(s: Soroban, movimentos: readonly Movimento[]): Soroban {
  return movimentos.reduce(aplicarMovimento, s);
}

/** Mostrar um número: haste por haste, da esquerda para a direita, a de cima e depois as de baixo. */
function planoDeMostrar(s: Soroban, valor: number): Plano | null {
  if (!Number.isInteger(valor) || valor < 0 || valor >= 10 ** s.length) return null;
  const alvo = mostrar(s.length, valor);
  const movimentos: Movimento[] = [];
  s.forEach((h, i) => {
    const a = alvo[i];
    if (h.cinco !== a.cinco) movimentos.push({ haste: i, cinco: a.cinco ? 1 : -1, uns: 0 });
    if (h.uns !== a.uns) movimentos.push({ haste: i, cinco: 0, uns: a.uns - h.uns });
  });
  return { alvo, movimentos, marcas: [], decomposicao: [] };
}

/** O plano de um lance; null quando não cabe (passa do que as hastes comportam, ou fica negativo). */
export function planoDoLance(s: Soroban, lance: Lance): Plano | null {
  if (lance.tipo === "mostrar") return planoDeMostrar(s, lance.valor);
  if (!Number.isInteger(lance.d) || lance.d < 1 || lance.d > 9) return null;
  const parte = lance.tipo === "por" ? por(s, lance.haste, lance.d) : tirar(s, lance.haste, lance.d);
  if (!parte) return null;
  const marcas = ORDEM_MARCAS.filter((m) => parte.marcas.has(m));
  // Ensinar "direto" quando não houve nenhum complemento.
  const finais: Marca[] = marcas.length === 0 ? ["direto"] : marcas;
  const alvo = aplicarTodos(s, parte.movimentos);
  return { alvo, movimentos: parte.movimentos, marcas: finais, decomposicao: decomposicaoDe(lance.tipo, lance.d, parte.marcas) };
}

/** As marcas que viram técnica (a cadeia é informação). */
export function marcasDeTecnica(marcas: readonly Marca[]): Marca[] {
  return marcas.filter((m) => m !== "cadeia");
}

/** As hastes que o plano mexe. */
export function hastesDoPlano(p: Plano): number[] {
  return [...new Set(p.movimentos.map((m) => m.haste))].sort((a, b) => a - b);
}

/** Confere a propriedade: o caminho do plano é o mais curto possível. */
export function planoEhCurto(inicio: Soroban, p: Plano): boolean {
  return p.movimentos.reduce((t, m) => t + Math.abs(m.cinco) + Math.abs(m.uns), 0) === distancia(inicio, p.alvo);
}
