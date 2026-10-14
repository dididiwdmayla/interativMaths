/**
 * Eco do Arco 1: a mesma ideia com outra roupa (tonéis e casas). SÓ DADOS.
 * Aparece depois de pelo menos duas outras atividades desde a missão 4.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";

export const ECO_ARCO_1: Atividade = {
  id: "partilha.arco1.eco",
  tipo: "eco",
  distrito: "partilha",
  arco: "partilha.arco1",
  titulo: "Eco: tonéis e casas",
  ideia: "a mesma ideia com outra roupa",
  conceitos: ["fra.quociente"],
  passos: [
    {
      id: "chamado",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Um chamado da caixa-d'água.",
      instrucao: "Leia o chamado da caixa-d'água.",
      falas: [
        { quem: "dalia", texto: "A caixa-d'água do alto mandou três tonéis cheios para cinco casas, e quer tudo repartido por igual." },
        { quem: "nonio", texto: "Desta vez, a resposta antes. Sem máquina: só as fichas. Depois ela confere." },
      ],
      botao: "Responder",
    },
    {
      id: "toneis",
      tipo: "prever",
      fase: "retencao",
      pedido: "3 tonéis, 5 casas: quanto em cada?",
      instrucao: "Responda quanto de tonel cada casa recebe: 3 tonéis, 5 casas.",
      maquina: {
        config: {
          pele: "toneis-casas",
          pecas: { quantidade: 3 },
          bicas: { quantidade: 5, ajustavel: false },
          fatiador: { partes: [2, 5, 10], denominadorMaximo: 10 },
        },
      },
      pergunta: "3 tonéis de água para 5 casas. Quanto de tonel cada casa recebe?",
      resposta: { tipo: "fracao", maximo: 10 },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [{ tipo: "partes", valor: 5 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      explicacao: "Cada tonel em cinco partes: quinze partes, três para cada casa. 3 ÷ 5 = 3/5, como as broas.",
      recados: { acerto: "Três quintos de tonel para cada casa." },
      dicas: [
        { texto: "É a mesma conta das broas da padaria, com água.", alvo: "fatiador" },
        { texto: "Em cima, o que se reparte; embaixo, entre quantos." },
        { texto: "Com outros números: 2 tonéis para 3 casas dão 2/3 para cada." },
      ],
      evidencias: [{ conceito: "fra.quociente", tipo: "transferencia" }],
    },
    {
      id: "fim",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A caixa-d'água agradece.",
      instrucao: "Leia e volte ao distrito.",
      falas: [{ quem: "nonio", texto: "Broa, tonel, pizza: o traço da fração não muda de roupa." }],
      botao: "Voltar",
    },
  ],
  solucoesDeTeste: [{ nome: "responde 3/5", modo: "guiada", entradas: [{ tipo: "seguir" }, { tipo: "responder", valor: "3/5" }, { tipo: "seguir" }, { tipo: "seguir" }] }],
  sabotagens: [{ nome: "escreve 5/3", modo: "guiada", entradas: [{ tipo: "seguir" }, { tipo: "responder", valor: "5/3" }], equivoco: "fracao-invertida" }],
};
