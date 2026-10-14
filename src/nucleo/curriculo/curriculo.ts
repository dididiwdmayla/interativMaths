/**
 * Currículo: conceitos e dependências. Os dados vivem em `src/conteudo/conceitos.ts`;
 * aqui ficam o contrato e as consultas.
 */

/** Id estável. Uma vez publicado, não muda (renomear exige migração do progresso). */
export type IdConceito = string;

export type SituacaoNoJogo =
  /** Ensinado por missões desta versão. */
  | "ativo"
  /** Só medido na calibragem; nenhuma missão ensina nesta versão. */
  | "pre_requisito"
  /** Ainda não construído; aparece na Planta para o jogador ver o que vem. */
  | "em_projeto";

export interface Conceito {
  readonly id: IdConceito;
  readonly nome: string;
  /** O nome de escola, para o Manual e o cabeçalho: "Divisão exata: repartir em partes iguais". */
  readonly formal: string;
  /** O mesmo, curto, para caber numa linha: "Divisão exata". */
  readonly formalCurto: string;
  /**
   * Quando dois conceitos de uma atividade têm o mesmo curto, o aspecto os separa na etiqueta:
   * "Frações: parte e divisão".
   */
  readonly aspecto?: string;
  /** O que ele é, em uma linha. */
  readonly linha: string;
  readonly dependeDe: readonly IdConceito[];
  readonly situacao: SituacaoNoJogo;
  readonly distrito: string;
  /** Como o jogador fez isso, para frases de evidência: "repartiu com sobra". */
  readonly verbo: string;
  /** Posição do componente na Planta (unidades da planta, não pixels). */
  readonly planta: { readonly x: number; readonly y: number };
}

export function indexarConceitos(lista: readonly Conceito[]): ReadonlyMap<IdConceito, Conceito> {
  const mapa = new Map<IdConceito, Conceito>();
  for (const c of lista) {
    if (mapa.has(c.id)) throw new Error(`conceito repetido: ${c.id}`);
    mapa.set(c.id, c);
  }
  return mapa;
}

export function dependentesDe(lista: readonly Conceito[], id: IdConceito): Conceito[] {
  return lista.filter((c) => c.dependeDe.includes(id));
}

/** Todos os pré-requisitos (diretos e indiretos), do mais próximo ao mais distante. */
export function ancestrais(lista: readonly Conceito[], id: IdConceito): IdConceito[] {
  const mapa = indexarConceitos(lista);
  const vistos = new Set<IdConceito>();
  const fila: IdConceito[] = [...(mapa.get(id)?.dependeDe ?? [])];
  const saida: IdConceito[] = [];
  while (fila.length > 0) {
    const atual = fila.shift() as IdConceito;
    if (vistos.has(atual)) continue;
    vistos.add(atual);
    saida.push(atual);
    fila.push(...(mapa.get(atual)?.dependeDe ?? []));
  }
  return saida;
}

/** Ordem em que um conceito vem depois de todos os seus pré-requisitos. Falha se houver ciclo. */
export function ordemTopologica(lista: readonly Conceito[]): IdConceito[] {
  const mapa = indexarConceitos(lista);
  const estado = new Map<IdConceito, "visitando" | "feito">();
  const saida: IdConceito[] = [];
  const visitar = (id: IdConceito, caminho: IdConceito[]) => {
    const e = estado.get(id);
    if (e === "feito") return;
    if (e === "visitando") throw new Error(`ciclo no currículo: ${[...caminho, id].join(" → ")}`);
    estado.set(id, "visitando");
    for (const dep of mapa.get(id)?.dependeDe ?? []) visitar(dep, [...caminho, id]);
    estado.set(id, "feito");
    saida.push(id);
  };
  for (const c of lista) visitar(c.id, []);
  return saida;
}
