/**
 * A chegada de um passo: o que a máquina nova traz em relação à anterior (sacas que chegaram,
 * bica que abriu, fatiador que apareceu). A tela anima só a diferença; quem calcula é aqui.
 */
import { chave, compara, comoRacional, type Racional } from "../../racional/racional";
import { cargaInicial } from "./bancada";
import type { ConfigBancada } from "./tipos";

export interface DiferencaMaquinas {
  /** Mesma pele: dá para contar a chegada como continuação da história. */
  readonly continua: boolean;
  /** Peças a mais na esteira, por tamanho (só as que aumentaram). */
  readonly pecasNovas: readonly { readonly tamanho: string; readonly quantidade: number }[];
  /** Peças a menos na esteira, por tamanho. */
  readonly pecasSairam: readonly { readonly tamanho: string; readonly quantidade: number }[];
  /** Bicas abertas na nova e não na anterior (índices). */
  readonly bicasAbriram: readonly number[];
  /** Bicas abertas na anterior e não na nova (índices). */
  readonly bicasFecharam: readonly number[];
  readonly fatiadorNovo: boolean;
  /** Carga total antes e depois. */
  readonly antes: Racional;
  readonly depois: Racional;
}

function contagem(c: ConfigBancada): Map<string, number> {
  const m = new Map<string, number>();
  const somar = (t: string, k: number) => {
    if (k <= 0) return;
    const ch = chave(comoRacional(t));
    m.set(ch, (m.get(ch) ?? 0) + k);
  };
  somar(c.pecas.tamanho ?? "1", c.pecas.quantidade);
  for (const p of c.pecas.pilhas ?? []) somar(p.tamanho, p.quantidade);
  return m;
}

/** Diferença entre as cargas iniciais de duas configurações da bancada. */
export function diferencaDeMaquinas(anterior: ConfigBancada | null, nova: ConfigBancada): DiferencaMaquinas {
  const depois = cargaInicial(nova);
  if (!anterior) {
    return {
      continua: false,
      pecasNovas: [...contagem(nova)].map(([tamanho, quantidade]) => ({ tamanho, quantidade })),
      pecasSairam: [],
      bicasAbriram: Array.from({ length: nova.bicas.quantidade }, (_, i) => i),
      bicasFecharam: [],
      fatiadorNovo: nova.fatiador !== undefined,
      antes: { n: 0, d: 1 },
      depois,
    };
  }
  const a = contagem(anterior);
  const b = contagem(nova);
  const tamanhos = [...new Set([...a.keys(), ...b.keys()])].sort((x, y) => compara(comoRacional(y), comoRacional(x)));
  const pecasNovas: { tamanho: string; quantidade: number }[] = [];
  const pecasSairam: { tamanho: string; quantidade: number }[] = [];
  for (const t of tamanhos) {
    const d = (b.get(t) ?? 0) - (a.get(t) ?? 0);
    if (d > 0) pecasNovas.push({ tamanho: t, quantidade: d });
    if (d < 0) pecasSairam.push({ tamanho: t, quantidade: -d });
  }
  const abertasAntes = anterior.bicas.quantidade;
  const abertasDepois = nova.bicas.quantidade;
  const bicasAbriram: number[] = [];
  const bicasFecharam: number[] = [];
  for (let i = abertasAntes; i < abertasDepois; i++) bicasAbriram.push(i);
  for (let i = abertasDepois; i < abertasAntes; i++) bicasFecharam.push(i);
  return {
    continua: anterior.pele === nova.pele,
    pecasNovas,
    pecasSairam,
    bicasAbriram,
    bicasFecharam,
    fatiadorNovo: anterior.fatiador === undefined && nova.fatiador !== undefined,
    antes: cargaInicial(anterior),
    depois,
  };
}

/** Há algo para animar? */
export function temDiferenca(d: DiferencaMaquinas): boolean {
  return d.pecasNovas.length > 0 || d.pecasSairam.length > 0 || d.bicasAbriram.length > 0 || d.bicasFecharam.length > 0 || d.fatiadorNovo;
}
