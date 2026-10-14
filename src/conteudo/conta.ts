/**
 * Os textos da conta passada a caneta. SÓ DADOS: o núcleo (`nucleo/missoes/conta.ts`) calcula
 * os números do estado final da máquina e preenche os marcadores.
 */
import type { ModelosConta } from "@/nucleo/missoes/conta";

export const MODELOS_CONTA: ModelosConta = {
  nomes: {
    dividendo: "dividendo",
    divisor: "divisor",
    quociente: "quociente",
    resto: "resto",
    numerador: "numerador",
    denominador: "denominador",
    pedacos: "pedaços",
    cadaUm: "cada um",
    daPeca: "de {peca}",
  },
  confere: "Confere: {conta}",
  /** 4 × 1 1/4 = 4 + 1 = 5 */
  confereMisto: "Confere: {divisor} × {quociente} = {inteiros} + {resto} = {dividendo}",
  cabe: "o {divisor} cabe {quociente} vezes no {dividendo}",
  equivalente: "ou {fracao}",
  sobramVarias: "as {resto} que sobram pedem mais {umReceptor}: {total}",
  sobraUma: "a 1 que sobra pede mais {umReceptor}: {total}",
  mesmaAltura: "Confere: as duas {receptores} param na mesma altura do medidor.",
  maisAlto: "Confere: {receptor} para mais alto no medidor.",
  ladoVarias: "Cada volta é uma linha: {voltas}. Somando as voltas, {quociente} para cada.",
  ladoPrimeira: "{parcial} para cada {receptor} tira {tira}",
  ladoSeguinte: "depois {parcial} para cada tira {tira}",
  ladoUma: "Uma volta só: {parcial} para cada {receptor} tira {tira}.",
  receptorNomeado: "{receptor} {nome}",
};

export const ROTULOS_CONTA = {
  caneta: "A conta, passada a caneta",
  armada: "A conta armada, volta por volta",
} as const;
