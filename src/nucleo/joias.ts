/**
 * Contrato das joias: habilidades reais do próprio jogador, que reduzem o atrito do raciocínio,
 * como os rubis que servem de mancal num relógio. Não dão poder fictício.
 * O treino ainda está em projeto; os contratos e os campos no progresso já valem.
 */
export type IdJoia = string;

export interface EstagioJoia {
  readonly nome: "bruta" | "talhada" | "lapidada" | "polida";
  /** O que muda na habilidade quando a joia chega a este estágio. */
  readonly criterio: string;
}

export interface TecnicaJoia {
  readonly id: string;
  readonly nome: string;
}

export interface Joia {
  readonly id: IdJoia;
  readonly nome: string;
  readonly mineral: string;
  /** Tokens de cor do mineral (de tokens.css): sombra e luz. */
  readonly cor: { readonly base: string; readonly luz: string };
  /** A habilidade real que ela representa. */
  readonly habilidade: string;
  /** Duas linhas sobre como será o treino. */
  readonly treino: readonly [string, string];
  readonly estagios: readonly [EstagioJoia, EstagioJoia, EstagioJoia, EstagioJoia];
  readonly tecnicas: readonly TecnicaJoia[];
  /** Como a joia é encontrada. */
  readonly requisito: { readonly tipo: "atividade"; readonly atividade: string } | { readonly tipo: "em_projeto" };
  /** Posição do engaste no mecanismo (0 a 3). */
  readonly engaste: number;
}
