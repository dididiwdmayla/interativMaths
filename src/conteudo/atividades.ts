/**
 * Catálogo de atividades desta versão. SÓ DADOS.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";
import { ECO_ARCO_1 } from "./eco";
import { MISSOES_ARCO_1 } from "./missoes";
import { EXPOSICAO_AHMES } from "./museu";
import { CENA_PIZZAS } from "./rua";

export const ATIVIDADES: readonly Atividade[] = [...MISSOES_ARCO_1, ECO_ARCO_1, EXPOSICAO_AHMES, CENA_PIZZAS];
