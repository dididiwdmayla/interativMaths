/**
 * A bancada de partilha: uma simulação só, com dois módulos (Repartidor e Fatiador).
 * Estado, ação, novo estado. Determinística. Toda quantidade é inteiro ou Racional exato.
 */
import type { Racional } from "../../racional/racional";

export type IdPele = "sacas-carrocas" | "broas-mesas" | "toneis-casas" | "paes-cestos" | "pizzas-amigos";

export interface PilhaInicial {
  /** Tamanho de cada peça, escrito: "1", "1/8". */
  readonly tamanho: string;
  readonly quantidade: number;
}

export interface ConfigBancada {
  readonly pele: IdPele;
  /** Peças que chegam na esteira. Se a carga for ajustável, este é o valor inicial. */
  readonly pecas: {
    readonly quantidade: number;
    /** Tamanho das peças iniciais (padrão "1", inteiras). */
    readonly tamanho?: string;
    /** Pilhas extras já cortadas (ex.: pizzas que chegam em oitavos). */
    readonly pilhas?: readonly PilhaInicial[];
  };
  /** O jogador escolhe quantas peças inteiras vêm na esteira, antes de operar. */
  readonly carga?: { readonly minimo: number; readonly maximo: number };
  readonly bicas: {
    /** Bicas abertas no começo. */
    readonly quantidade: number;
    /** O jogador abre e fecha bicas. */
    readonly ajustavel: boolean;
    /** Quantas bicas existem na máquina (padrão: quantidade). */
    readonly vagas?: number;
  };
  /** Fatiador disponível: peças podem ser cortadas. Sem fatiador, peças não se cortam. */
  readonly fatiador?: {
    readonly partes: readonly number[];
    readonly denominadorMaximo: number;
  };
  readonly lote?: { readonly maximo: number };
  /** Carga máxima por bica (transporte). Aparece como linha de teto. */
  readonly teto?: number;
  /** Máximo de voltas (ex.: "numa volta só"). */
  readonly voltasMax?: number;
  /**
   * Mão livre: pôr e tirar peças à mão (colocar, devolver). Ligada por padrão; desligada quando
   * há `voltasMax` (o desafio é sobre a alavanca) ou quando o passo disser.
   */
  readonly maoLivre?: boolean;
}

export interface Pilha {
  readonly tamanho: Racional;
  readonly quantidade: number;
}

export interface Bica {
  readonly aberta: boolean;
  readonly pecas: readonly Pilha[];
}

export type MotivoRecusa =
  | "sem-pilha"
  | "pilha-vazia"
  | "sem-bica-aberta"
  | "limite-voltas"
  | "sem-fatiador"
  | "partes-invalidas"
  | "pedaco-pequeno-demais"
  | "carga-travada"
  | "bicas-travadas"
  | "fechada"
  | "fora-do-limite"
  | "sem-mao-livre"
  | "bica-fechada"
  | "sem-peca"
  | "passou-do-teto";

export type Evento =
  | { readonly tipo: "volta"; readonly tamanho: string; readonly lote: number; readonly bicas: readonly number[] }
  | {
      readonly tipo: "engasgo";
      readonly tamanho: string;
      readonly lote: number;
      readonly abertas: number;
      /** Peças que a volta pedia (lote × bicas abertas). */
      readonly pedido: number;
      /** Peças que havia na pilha. */
      readonly ha: number;
    }
  | {
      readonly tipo: "fatia";
      readonly tamanho: string;
      readonly partes: number;
      readonly quantidade: number;
      readonly novo: string;
    }
  | {
      /** Um corte feito pelo menu, na peça tocada. */
      readonly tipo: "cortou";
      readonly tamanho: string;
      readonly partes: number;
      readonly quantidade: number;
      readonly novo: string;
    }
  | { readonly tipo: "colocou"; readonly tamanho: string; readonly bica: number }
  | { readonly tipo: "devolveu"; readonly tamanho: string; readonly bica: number }
  | { readonly tipo: "fechou"; readonly sobra: readonly Pilha[] }
  | { readonly tipo: "bica"; readonly indice: number; readonly aberta: boolean }
  | { readonly tipo: "carga"; readonly quantidade: number }
  | { readonly tipo: "ajuste" }
  | { readonly tipo: "recusa"; readonly motivo: MotivoRecusa };

export interface EstadoBancada {
  readonly config: ConfigBancada;
  /** Pilhas na esteira, da maior peça para a menor. */
  readonly esteira: readonly Pilha[];
  readonly bicas: readonly Bica[];
  readonly bandeja: readonly Pilha[];
  readonly lote: number;
  /** Chave do tamanho da pilha escolhida ("1/1", "1/4"). */
  readonly pilha: string | null;
  /** Em quantas partes o Fatiador corta. */
  readonly partes: number;
  readonly voltas: number;
  /** Depois da primeira volta ou corte, a carga inicial não muda mais. */
  readonly cargaTravada: boolean;
  readonly fechada: boolean;
  readonly evento: Evento | null;
  /** Conta eventos, para a tela animar cada um uma vez. */
  readonly seq: number;
}

export type AcaoBancada =
  | { readonly tipo: "lote"; readonly valor: number }
  | { readonly tipo: "pilha"; readonly tamanho: string }
  | { readonly tipo: "bica"; readonly indice: number }
  | { readonly tipo: "bicas"; readonly abertas: number }
  | { readonly tipo: "carga"; readonly quantidade: number }
  | { readonly tipo: "partes"; readonly valor: number }
  | { readonly tipo: "repartir" }
  | { readonly tipo: "fatiar"; readonly quantidade: number | "todas" }
  /** Mão livre: tira uma peça daquele tamanho da esteira e põe na bica aberta. */
  | { readonly tipo: "colocar"; readonly tamanho: string; readonly bica: number }
  /** Mão livre: devolve uma peça daquele tamanho da bica para a esteira. */
  | { readonly tipo: "devolver"; readonly bica: number; readonly tamanho: string }
  /** Menu de corte: corta uma peça (ou todas) daquele tamanho em partes iguais, num passo só. */
  | { readonly tipo: "cortar"; readonly tamanho: string; readonly partes: number; readonly quantidade?: number | "todas" }
  | { readonly tipo: "fechar" }
  | { readonly tipo: "desfazer" }
  | { readonly tipo: "recomecar" };

/** Estado com histórico, para desfazer. */
export interface Bancada {
  readonly atual: EstadoBancada;
  readonly passado: readonly EstadoBancada[];
}
