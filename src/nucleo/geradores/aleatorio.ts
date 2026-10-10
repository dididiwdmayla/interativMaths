/**
 * Gerador pseudoaleatório com semente (mulberry32). Mesma semente, mesma sequência.
 */
export interface Aleatorio {
  /** Número em [0, 1). */
  proximo(): number;
  /** Inteiro em [min, max], inclusivo. */
  inteiro(min: number, max: number): number;
  escolher<T>(lista: readonly T[]): T;
}

export function aleatorio(semente: number): Aleatorio {
  let a = semente >>> 0;
  const proximo = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    proximo,
    inteiro: (min, max) => min + Math.floor(proximo() * (max - min + 1)),
    escolher: (lista) => {
      if (lista.length === 0) throw new RangeError("lista vazia");
      return lista[Math.floor(proximo() * lista.length)];
    },
  };
}
