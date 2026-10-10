/**
 * Medidas que se leem de um estado da bancada: o que as cotas mostram e o que uma previsão confere.
 */
import { compara, inteiro, ZERO, type Racional } from "../../racional/racional";
import { bicasEmUso, contarPecas, quantidadeDe, quantidadeNaBica } from "./bancada";
import type { EstadoBancada } from "./tipos";

export type NomeMedida =
  | "carga-por-bica"
  | "sobra"
  | "bicas-em-uso"
  | "pedacos-por-bica"
  | "carga-total"
  | "tamanho-do-pedaco"
  | "partes";

export const MEDIDAS: readonly NomeMedida[] = [
  "carga-por-bica",
  "sobra",
  "bicas-em-uso",
  "pedacos-por-bica",
  "carga-total",
  "tamanho-do-pedaco",
  "partes",
];

export function medir(e: EstadoBancada, medida: NomeMedida): Racional {
  const uso = bicasEmUso(e);
  switch (medida) {
    case "carga-por-bica":
      return uso.length > 0 ? quantidadeNaBica(e.bicas[uso[0]]) : ZERO;
    case "sobra":
      return quantidadeDe([...e.esteira, ...e.bandeja]);
    case "bicas-em-uso":
      return inteiro(uso.length);
    case "pedacos-por-bica":
      return inteiro(uso.length > 0 ? contarPecas(e.bicas[uso[0]].pecas) : 0);
    case "carga-total":
      return quantidadeDe([...e.esteira, ...e.bandeja, ...e.bicas.flatMap((b) => b.pecas)]);
    case "tamanho-do-pedaco":
    case "partes": {
      const pecas = uso.length > 0 ? e.bicas[uso[0]].pecas : [];
      if (pecas.length === 0) return ZERO;
      const menor = pecas.reduce((a, p) => (compara(p.tamanho, a.tamanho) < 0 ? p : a)).tamanho;
      return medida === "partes" ? inteiro(menor.d) : menor;
    }
  }
}
