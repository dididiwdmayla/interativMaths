/**
 * Calibragem: seis degraus, cada um uma interação curta com uma versão pequena das máquinas.
 * Não é prova e não dá nota. SÓ DADOS.
 */
import type { ItemCalibragem, RegrasCalibragem } from "@/nucleo/calibragem/calibragem";

export const ITENS_CALIBRAGEM: readonly ItemCalibragem[] = [
  {
    degrau: 1,
    conceito: "mul.grupos",
    tipo: "maquina",
    pedido: "4 carroças com 3 sacas cada.",
    fala: "Quantas sacas você põe na esteira para cada uma das quatro carroças sair com três?",
    maquina: {
      pele: "sacas-carrocas",
      pecas: { quantidade: 1 },
      carga: { minimo: 1, maximo: 20 },
      bicas: { quantidade: 4, ajustavel: false },
      lote: { maximo: 3 },
    },
    objetivo: { validador: "partilha.carga-exata", params: { carga: 3 } },
    solucao: [{ tipo: "carga", quantidade: 12 }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
  },
  {
    degrau: 2,
    conceito: "div.partilha",
    tipo: "maquina",
    pedido: "12 sacas, 3 carroças, numa volta só.",
    fala: "Doze sacas entre três carroças, todas iguais, numa volta só.",
    maquina: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 3, ajustavel: false }, voltasMax: 1 },
    objetivo: { validador: "partilha.fechada", params: { voltasMax: 1 } },
    solucao: [{ tipo: "lote", valor: 4 }, { tipo: "repartir" }],
  },
  {
    degrau: 3,
    conceito: "div.resto",
    tipo: "maquina",
    pedido: "14 sacas, 4 carroças, numa volta só.",
    fala: "Catorze sacas, quatro carroças, todas iguais. Uma volta só: quanto em cada, e o que sobra fica na bandeja.",
    maquina: { pele: "sacas-carrocas", pecas: { quantidade: 14 }, bicas: { quantidade: 4, ajustavel: false }, voltasMax: 1 },
    objetivo: { validador: "partilha.fechada", params: { voltasMax: 1 } },
    solucao: [{ tipo: "lote", valor: 3 }, { tipo: "repartir" }],
  },
  {
    degrau: 4,
    conceito: "fra.parte",
    tipo: "maquina",
    pedido: "Entregue 3/4 da broa à mesa.",
    fala: "Uma broa, uma mesa. Entregue exatamente três quartos da broa; o resto fica na esteira.",
    maquina: {
      pele: "broas-mesas",
      pecas: { quantidade: 1 },
      bicas: { quantidade: 1, ajustavel: false },
      fatiador: { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 },
    },
    objetivo: { validador: "partilha.carga-exata", params: { carga: "3/4", sobra: "1/4" } },
    solucao: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
  },
  {
    degrau: 5,
    conceito: "fra.quociente",
    tipo: "resposta",
    pedido: "2 broas, 4 mesas: quanto em cada?",
    fala: "Duas broas para quatro mesas. Quanto de broa cada mesa recebe? Monte com as fichas.",
    resposta: { tipo: "fracao", maximo: 8 },
    esperado: "1/2",
    aceitaEquivalente: true,
    maquina: {
      pele: "broas-mesas",
      pecas: { quantidade: 2 },
      bicas: { quantidade: 4, ajustavel: false },
      fatiador: { partes: [2, 4], denominadorMaximo: 4 },
    },
    demonstracao: [{ tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "repartir" }],
  },
  {
    degrau: 6,
    conceito: "pro.proporcao",
    tipo: "resposta",
    pedido: "2 de farinha para 3 de água.",
    fala: "A receita pede duas medidas de farinha para três de água. Com seis de farinha, quantas de água?",
    resposta: { tipo: "numero", minimo: 0, maximo: 20, unidade: "medidas" },
    esperado: "9",
    figura: { a: 2, b: 3, rotuloA: "farinha", rotuloB: "água", dadoA: 6 },
  },
];

export const REGRAS_CALIBRAGEM: RegrasCalibragem = {
  degraus: [
    { degrau: 1, conceito: "mul.grupos" },
    { degrau: 2, conceito: "div.partilha" },
    { degrau: 3, conceito: "div.resto" },
    { degrau: 4, conceito: "fra.parte" },
    { degrau: 5, conceito: "fra.quociente" },
    { degrau: 6, conceito: "pro.proporcao" },
  ],
  provaveisExtras: [{ conceito: "div.medida", minimo: 3 }],
  recomendacoes: [
    { minimo: 0, atividade: "partilha.arco1.carga-igual" },
    { minimo: 2, atividade: "partilha.arco1.quantas-carrocas" },
    { minimo: 3, atividade: "partilha.arco1.pao-nao-e-saca" },
    { minimo: 5, atividade: "partilha.arco1.encomenda" },
  ],
  provas: [
    { atividade: "partilha.arco1.carga-igual", minimo: 2 },
    { atividade: "partilha.arco1.quantas-carrocas", minimo: 3 },
    { atividade: "partilha.arco1.sobrou", minimo: 3 },
    { atividade: "partilha.arco1.pao-nao-e-saca", minimo: 5 },
  ],
};
