/**
 * Catálogo de atividades desta versão. SÓ DADOS.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";
import { ECO_ARCO_1 } from "./eco";
import { MISSOES_ARCO_1 } from "./missoes";
import { EXPOSICAO_AHMES } from "./museu";
import { CENA_PIZZAS } from "./rua";
import { CENA_RACAO } from "./rua-racao-do-sitio";
import { CENA_CINCO_TERCAS } from "./rua-cinco-tercas";
import { CENA_COMPASSO } from "./rua-o-compasso";
import { EXPOSICAO_QUANTAS_VEZES } from "./museu-quantas-vezes";

export const ATIVIDADES: readonly Atividade[] = [
  ...MISSOES_ARCO_1,
  ECO_ARCO_1,
  EXPOSICAO_AHMES,
  CENA_PIZZAS,
  CENA_RACAO,
  CENA_CINCO_TERCAS,
  CENA_COMPASSO,
  EXPOSICAO_QUANTAS_VEZES,
];
