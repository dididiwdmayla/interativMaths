/**
 * Peças de dados reutilizadas pelas missões. SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Entrada } from "@/nucleo/missoes/tipos";

export const SEGUIR: Entrada = { tipo: "seguir" };
export const FECHAR: Entrada = { tipo: "fechar" };
export const CONFERIR: Entrada = { tipo: "conferir" };
export const REPARTIR: Entrada = { tipo: "maquina", acao: { tipo: "repartir" } };
export const CORTAR_TODAS: Entrada = { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } };
export const CORTAR_UMA: Entrada = { tipo: "maquina", acao: { tipo: "fatiar", quantidade: 1 } };
export const NAO_SEI: Entrada = { tipo: "responder", valor: null };

export const FATIADOR_PADARIA = { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 } as const;

/** Máquina do caminho de volta: o jogador põe a carga e escolhe as bicas. */
export const MAQUINA_MONTAR_SACAS: ConfigBancada = {
  pele: "sacas-carrocas",
  pecas: { quantidade: 10 },
  carga: { minimo: 1, maximo: 40 },
  bicas: { quantidade: 4, ajustavel: true, vagas: 8 },
};

export const MAQUINA_MONTAR_BROAS: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 1 },
  carga: { minimo: 1, maximo: 8 },
  bicas: { quantidade: 4, ajustavel: true, vagas: 8 },
  fatiador: { partes: [2, 3, 4, 5, 6, 8, 10], denominadorMaximo: 10 },
};

export const LOTE_1: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 1 } };
export const LOTE_2: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 2 } };
export const LOTE_3: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 3 } };
export const LOTE_4: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 4 } };
export const LOTE_5: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 5 } };
export const LOTE_6: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 6 } };
export const LOTE_7: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 7 } };
export const LOTE_8: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 8 } };

/** Mão livre: pôr uma peça inteira na bica (0 é a primeira). */
export const POR_1: Entrada = { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 0 } };
export const POR_2: Entrada = { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 1 } };
export const POR_3: Entrada = { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 2 } };
export const POR_4: Entrada = { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 3 } };
/** Uma inteira em cada uma das quatro primeiras bicas. */
export const UMA_EM_CADA_4: readonly Entrada[] = [POR_1, POR_2, POR_3, POR_4];
