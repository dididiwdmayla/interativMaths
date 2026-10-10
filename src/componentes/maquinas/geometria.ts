/**
 * Geometria de desenho da bancada. Aqui ponto flutuante é permitido: só posiciona desenho.
 * A matemática (quanto há em cada lugar) vem sempre do estado exato da simulação.
 */
import { chave, compara, paraNumero, soma, ZERO, type Racional } from "@/nucleo/racional/racional";
import type { Pilha } from "@/nucleo/maquinas/bancada/tipos";

/** Um pedaço desenhado dentro de uma unidade: começa e termina em fração da unidade (0 a 1). */
export interface FatiaDesenho {
  readonly chave: string;
  readonly inicio: number;
  readonly fim: number;
  readonly tamanho: Racional;
}

/** Uma unidade desenhada (um círculo de broa, um tonel...). */
export interface UnidadeDesenho {
  readonly fatias: readonly FatiaDesenho[];
  /** true quando a unidade é uma peça inteira sem corte. */
  readonly inteira: boolean;
}

/**
 * Encaixa os pedaços em unidades, na ordem (maiores primeiro). Um pedaço nunca atravessa
 * de uma unidade para outra; se não couber, abre outra unidade.
 */
export function comporUnidades(pilhas: readonly Pilha[]): UnidadeDesenho[] {
  const ordenadas = [...pilhas].sort((a, b) => compara(b.tamanho, a.tamanho));
  const unidades: { fatias: FatiaDesenho[]; cheio: Racional }[] = [];
  let n = 0;
  for (const p of ordenadas) {
    for (let k = 0; k < p.quantidade; k++) {
      let alvo = unidades.find((u) => compara(soma(u.cheio, p.tamanho), { n: 1, d: 1 }) <= 0);
      if (!alvo) {
        alvo = { fatias: [], cheio: ZERO };
        unidades.push(alvo);
      }
      const inicio = paraNumero(alvo.cheio);
      alvo.cheio = soma(alvo.cheio, p.tamanho);
      alvo.fatias.push({ chave: `${chave(p.tamanho)}#${n++}`, inicio, fim: paraNumero(alvo.cheio), tamanho: p.tamanho });
    }
  }
  return unidades.map((u) => ({
    fatias: u.fatias,
    inteira: u.fatias.length === 1 && u.fatias[0].tamanho.n === 1 && u.fatias[0].tamanho.d === 1,
  }));
}

/** Caminho de um setor circular, de `a` a `b` em fração de volta, começando no topo, sentido horário. */
export function setor(cx: number, cy: number, r: number, a: number, b: number): string {
  if (b - a >= 0.9999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }
  const ang = (t: number) => t * Math.PI * 2 - Math.PI / 2;
  const x1 = cx + r * Math.cos(ang(a));
  const y1 = cy + r * Math.sin(ang(a));
  const x2 = cx + r * Math.cos(ang(b));
  const y2 = cy + r * Math.sin(ang(b));
  const grande = b - a > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${grande} 1 ${x2} ${y2} Z`;
}

/** Distribui `n` itens em grade dentro de uma caixa; devolve centros e o raio que cabe. */
export function grade(
  n: number,
  caixa: { x: number; y: number; largura: number; altura: number },
  opcoes: { raioMax: number; colunasMax?: number },
): { centros: { x: number; y: number }[]; raio: number } {
  if (n <= 0) return { centros: [], raio: opcoes.raioMax };
  let melhor = { colunas: 1, raio: 0 };
  const limite = Math.min(n, opcoes.colunasMax ?? n);
  for (let colunas = 1; colunas <= limite; colunas++) {
    const linhas = Math.ceil(n / colunas);
    const r = Math.min(caixa.largura / colunas / 2.2, caixa.altura / linhas / 2.2, opcoes.raioMax);
    if (r > melhor.raio) melhor = { colunas, raio: r };
  }
  const { colunas, raio } = melhor;
  const linhas = Math.ceil(n / colunas);
  const passoX = caixa.largura / colunas;
  const passoY = Math.min(caixa.altura / linhas, raio * 2.3);
  const alturaUsada = passoY * linhas;
  const centros = Array.from({ length: n }, (_, i) => {
    const c = i % colunas;
    const l = Math.floor(i / colunas);
    const naLinha = l === linhas - 1 ? n - colunas * (linhas - 1) : colunas;
    const desloc = ((colunas - naLinha) * passoX) / 2;
    return {
      x: caixa.x + desloc + passoX * (c + 0.5),
      y: caixa.y + caixa.altura - alturaUsada + passoY * (l + 0.5),
    };
  });
  return { centros, raio };
}
