/**
 * O Arco 1 de A Partilha: "O resto que ninguém repartia". SÓ DADOS.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";
import { MISSAO_1 } from "./m1-carga-igual";
import { MISSAO_2 } from "./m2-quantas-carrocas";
import { MISSAO_3 } from "./m3-sobrou";
import { MISSAO_4 } from "./m4-pao-nao-e-saca";
import { MISSAO_5 } from "./m5-encomenda";

export const MISSOES_ARCO_1: readonly Atividade[] = [MISSAO_1, MISSAO_2, MISSAO_3, MISSAO_4, MISSAO_5];
