/**
 * A bancada de lapidação e o soroban: parâmetros do treino e todos os textos. SÓ DADOS.
 * Os marcadores ({d}, {m}, {livres}, {haste}...) o núcleo preenche com os números do momento.
 * Uma sessão de conteúdo pode afinar daqui: veja docs/AUTORIA.md.
 */
import type { ParametrosLapidacao } from "@/nucleo/joias/treino";

/** Os nomes das hastes, pela posição (0 = unidades). A quinta haste fica sem rótulo. */
export const NOMES_POSICAO = [
  { rotulo: "unidade", nome: "Unidade", da: "das unidades" },
  { rotulo: "dezena", nome: "Dezena", da: "das dezenas" },
  { rotulo: "centena", nome: "Centena", da: "das centenas" },
  { rotulo: "milhar", nome: "Milhar", da: "do milhar" },
  { rotulo: "", nome: "Dezena de milhar", da: "da dezena de milhar" },
] as const;

/** O que o leitor de tela ouve do soroban. */
export const LEITOR_SOROBAN = {
  rotulo: "Soroban de cinco hastes",
  mostrando: "mostrando",
  haste: "Haste",
  contaDeCima: "Conta de cima",
  encostada: "encostada",
  afastada: "afastada",
  semContas: "as contas não aparecem",
} as const;

/** O nome de cada marca de lance, na conta escrita e no laboratório. */
export const ROTULOS_MARCA = {
  direto: "direto",
  "complemento-5": "complemento de 5",
  "complemento-10": "complemento de 10",
  juntos: "5 e 10 juntos",
  cadeia: "cadeia",
} as const;

/** Os números do treino. Uma sessão de conteúdo pode afinar (e roda as checagens depois). */
export const PARAMETROS_LAPIDACAO: ParametrosLapidacao = {
  operacoesPorRodada: 6,
  limposParaFirmar: 6,
  rodadasParaFirmar: 2,
  limposPorRodada: 2,
  intervaloHoras: 20,
  intercaladas: 2,
};
