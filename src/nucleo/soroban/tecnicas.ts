/**
 * As técnicas do soroban (ids publicados da Joia do Ábaco) e como as marcas de um lance viram
 * técnica. A cadeia é informação, não técnica. Uma checagem de conteúdo confere que os dados da
 * joia têm exatamente estas técnicas, nesta ordem.
 */
import type { Marca } from "./plano";

export const TECNICAS_SOROBAN = {
  ler: "soroban.ler",
  diretas: "soroban.unidades",
  complemento5: "soroban.complemento-5",
  complemento10: "soroban.complemento-10",
  juntos: "soroban.juntos",
  imaginado: "soroban.imaginado",
} as const;

export type TecnicaSoroban = (typeof TECNICAS_SOROBAN)[keyof typeof TECNICAS_SOROBAN];

/** Na ordem da joia. */
export const ORDEM_TECNICAS_SOROBAN: readonly TecnicaSoroban[] = [
  TECNICAS_SOROBAN.ler,
  TECNICAS_SOROBAN.diretas,
  TECNICAS_SOROBAN.complemento5,
  TECNICAS_SOROBAN.complemento10,
  TECNICAS_SOROBAN.juntos,
  TECNICAS_SOROBAN.imaginado,
];

/** As técnicas que se fazem com a mão no soroban (as que têm marca de lance). */
export const TECNICA_DA_MARCA: Readonly<Record<Exclude<Marca, "cadeia">, TecnicaSoroban>> = {
  direto: TECNICAS_SOROBAN.diretas,
  "complemento-5": TECNICAS_SOROBAN.complemento5,
  "complemento-10": TECNICAS_SOROBAN.complemento10,
  juntos: TECNICAS_SOROBAN.juntos,
};

export function tecnicasDasMarcas(marcas: readonly Marca[]): TecnicaSoroban[] {
  const saida: TecnicaSoroban[] = [];
  for (const m of marcas) if (m !== "cadeia") saida.push(TECNICA_DA_MARCA[m]);
  return saida;
}

/** A marca que cada técnica de mão exige no gerador. */
export const MARCA_DA_TECNICA: Readonly<Partial<Record<TecnicaSoroban, Exclude<Marca, "cadeia">>>> = {
  [TECNICAS_SOROBAN.diretas]: "direto",
  [TECNICAS_SOROBAN.complemento5]: "complemento-5",
  [TECNICAS_SOROBAN.complemento10]: "complemento-10",
  [TECNICAS_SOROBAN.juntos]: "juntos",
};

export function ehTecnicaSoroban(id: string): id is TecnicaSoroban {
  return (ORDEM_TECNICAS_SOROBAN as readonly string[]).includes(id);
}
