/**
 * Contrato das joias: habilidades reais do próprio jogador, que reduzem o atrito do raciocínio,
 * como os rubis que servem de mancal num relógio. Não dão poder fictício.
 *
 * Desde a v0.5 cada técnica diz o estágio que ela ajuda a alcançar: a joia fica talhada quando
 * todas as técnicas de estágio 1 estão firmes, lapidada com as de estágio 2, polida com as de 3.
 * O treino é genérico (`treino.ts`); cada joia treinável se pluga por um registro (`registro.ts`).
 */
export type IdJoia = string;

export interface EstagioJoia {
  readonly nome: "bruta" | "talhada" | "lapidada" | "polida";
  /** O que muda na habilidade quando a joia chega a este estágio. */
  readonly criterio: string;
}

/** 1 talhada, 2 lapidada, 3 polida. */
export type EstagioDaTecnica = 1 | 2 | 3;

export interface TecnicaJoia {
  readonly id: string;
  readonly nome: string;
  /** O estágio que esta técnica ajuda a alcançar. */
  readonly estagio: EstagioDaTecnica;
  /** Enquanto a lápis (ainda não apresentada), quando ela chega: "depois do 5". */
  readonly aLapis: string;
  /**
   * Níveis com que a última rodada que conta precisa ter sido feita (o soroban imaginado firma
   * só com uma rodada de cabeça ou de ditado). Sem a lista, qualquer nível que conta serve.
   */
  readonly fechaCom?: readonly string[];
}

export interface Joia {
  readonly id: IdJoia;
  readonly nome: string;
  readonly mineral: string;
  /** Tokens de cor do mineral (de tokens.css): sombra e luz. */
  readonly cor: { readonly base: string; readonly luz: string };
  /** A habilidade real que ela representa. */
  readonly habilidade: string;
  /** Duas linhas sobre como é o treino. */
  readonly treino: readonly [string, string];
  readonly estagios: readonly [EstagioJoia, EstagioJoia, EstagioJoia, EstagioJoia];
  /** Em ordem: o foco de uma rodada é a primeira do próximo estágio que ainda falta. */
  readonly tecnicas: readonly TecnicaJoia[];
  /** Como a joia é encontrada. */
  readonly requisito: { readonly tipo: "atividade"; readonly atividade: string } | { readonly tipo: "em_projeto" };
  /** Posição do engaste no mecanismo (0 a 3). */
  readonly engaste: number;
  /** A bancada de lapidação desta joia já existe (só o Ábaco, na v0.5). */
  readonly treinavel: boolean;
  /** O nome formal da bancada (área e conteúdo), quando treinável: "Aritmética · Soroban". */
  readonly formal?: string;
}
