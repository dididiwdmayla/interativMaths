/**
 * Peles da bancada: a mesma máquina com outro desenho, outros nomes e outras falas.
 * Regras, nunca. SÓ DADOS.
 */
import type { IdPele } from "@/nucleo/maquinas/bancada/tipos";

export type FormaPeca = "saco" | "broa" | "pizza" | "tonel" | "pao";
export type FormaReceptor = "carroca" | "mesa" | "casa" | "cesto" | "prato";

export interface Nome {
  readonly singular: string;
  readonly plural: string;
  /** "f" para "duas sacas"; "m" para "dois tonéis". */
  readonly genero: "m" | "f";
}

export interface Pele {
  readonly id: IdPele;
  /** A peça inteira. */
  readonly peca: Nome & { readonly forma: FormaPeca };
  /** Um pedaço cortado dela. */
  readonly pedaco: Nome;
  readonly receptor: Nome & { readonly forma: FormaReceptor };
  /** Onde a sobra fica. */
  readonly sobra: string;
  /** Nome do botão de repartir. */
  readonly repartir: string;
}

export const PELES: Readonly<Record<IdPele, Pele>> = {
  "sacas-carrocas": {
    id: "sacas-carrocas",
    peca: { singular: "saca", plural: "sacas", genero: "f", forma: "saco" },
    pedaco: { singular: "saca", plural: "sacas", genero: "f" },
    receptor: { singular: "carroça", plural: "carroças", genero: "f", forma: "carroca" },
    sobra: "bandeja da sobra",
    repartir: "Repartir",
  },
  "broas-mesas": {
    id: "broas-mesas",
    peca: { singular: "broa", plural: "broas", genero: "f", forma: "broa" },
    pedaco: { singular: "pedaço", plural: "pedaços", genero: "m" },
    receptor: { singular: "mesa", plural: "mesas", genero: "f", forma: "mesa" },
    sobra: "bandeja da sobra",
    repartir: "Repartir",
  },
  "toneis-casas": {
    id: "toneis-casas",
    peca: { singular: "tonel", plural: "tonéis", genero: "m", forma: "tonel" },
    pedaco: { singular: "parte", plural: "partes", genero: "f" },
    receptor: { singular: "casa", plural: "casas", genero: "f", forma: "casa" },
    sobra: "reservatório",
    repartir: "Distribuir",
  },
  "paes-cestos": {
    id: "paes-cestos",
    peca: { singular: "pão", plural: "pães", genero: "m", forma: "pao" },
    pedaco: { singular: "pedaço", plural: "pedaços", genero: "m" },
    receptor: { singular: "cesto", plural: "cestos", genero: "m", forma: "cesto" },
    sobra: "bandeja da sobra",
    repartir: "Repartir",
  },
  "pizzas-amigos": {
    id: "pizzas-amigos",
    peca: { singular: "pizza", plural: "pizzas", genero: "f", forma: "pizza" },
    pedaco: { singular: "fatia", plural: "fatias", genero: "f" },
    receptor: { singular: "prato", plural: "pratos", genero: "m", forma: "prato" },
    sobra: "caixa",
    repartir: "Servir",
  },
};
