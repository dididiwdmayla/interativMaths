/**
 * Aplicação direta: transporte com resto. SÓ DADOS.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";

export const CENA_RACAO: Atividade = {
  id: "rua.racao-do-sitio",
  tipo: "cena",
  distrito: "rua",
  titulo: "A ração do sítio",
  ideia: "o resto vira mais uma viagem",
  conceitos: ["div.medida", "div.resto"],
  passos: [
    {
      id: "cena",
      tipo: "narrativa",
      fase: "problema",
      pedido: "A carga chegou ao sítio.",
      instrucao: "Leia a cena e leve a ração.",
      falas: [
        {
          quem: "dalia",
          texto: "Um sítio na beira da cidade recebeu 26 sacas de ração. A carroça do vizinho leva no máximo 8 por viagem. Quantas viagens serão necessárias?"
        },
        {
          quem: "nonio",
          texto: "Cada carroça da bancada é uma viagem. Faça tudo sair com o menor número de viagens."
        }
      ],
      botao: "Levar a ração"
    },
    {
      id: "bancada",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "26 sacas, até 8 por viagem.",
      instrucao: "Leve as 26 sacas com o menor número de viagens, até 8 em cada.",
      maquina: {
        config: {
          pele: "sacas-carrocas",
          pecas: { quantidade: 26 },
          bicas: { quantidade: 3, ajustavel: true, vagas: 6 },
          teto: 8
        }
      },
      objetivo: { validador: "transporte.tudo-saiu", params: { teto: 8 } },
      resolucao: [
        { tipo: "bicas", abertas: 3 },
        { tipo: "lote", valor: 8 },
        { tipo: "repartir" },
        { tipo: "bicas", abertas: 0 },
        { tipo: "bica", indice: 3 },
        { tipo: "colocar", tamanho: "1/1", bica: 3 },
        { tipo: "colocar", tamanho: "1/1", bica: 3 }
      ],
      dicas: [
        { texto: "Olhe a esteira: tudo precisa sair. Cada carroça é uma viagem." },
        { texto: "Compare a carga de cada carroça com o limite de 8 sacas." },
        { texto: "Com outros números: 14 sacas, até 5 por viagem, pedem 3 viagens: 5, 5 e 4." }
      ],
      equivocos: ["arredondou-para-baixo"],
      evidencias: [{ conceito: "div.medida", tipo: "transferencia" }]
    },
    {
      id: "previsao",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Quantas viagens a carroça fez?",
      instrucao: "Responda quantas viagens a carroça fez.",
      pergunta: "Quantas viagens a carroça fez?",
      resposta: { tipo: "numero", minimo: 0, maximo: 6, unidade: "viagens" },
      medida: "bicas-em-uso",
      demonstracao: [],
      respostasEquivoco: [{ resposta: "3", equivoco: "arredondou-para-baixo" }],
      explicacao: "26 = 8 × 3 + 2. São 4 viagens: três cheias e uma com 2 sacas. Cargas de 7, 7, 6 e 6 também servem.",
      dicas: [
        { texto: "Cada carroça carregada representa uma viagem." },
        { texto: "Conte as carroças que receberam carga, mesmo sem ficarem cheias." },
        { texto: "Com outros números: 14 sacas em viagens de até 5 usam 3 viagens." }
      ],
      evidencias: [{ conceito: "div.resto", tipo: "transferencia" }]
    },
    {
      id: "fim",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "O resto também viaja.",
      instrucao: "Leia e volte à Rua.",
      falas: [
        {
          quem: "nonio",
          texto: "O resto não some; aqui ele vira mais uma viagem. Aplicação direta: a mesma conta da Missão 3, do mesmo jeito."
        }
      ],
      botao: "Voltar à Rua"
    }
  ],
  solucoesDeTeste: [
    {
      nome: "Resolve e responde",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 3 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 8 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 0 } },
        { tipo: "maquina", acao: { tipo: "bica", indice: 3 } },
        { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 3 } },
        { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 3 } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "4" },
        { tipo: "seguir" },
        { tipo: "seguir" }
      ]
    },
    {
      nome: "Cargas 7, 7, 6 e 6",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 4 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 6 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 2 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 1 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "4" },
        { tipo: "seguir" },
        { tipo: "seguir" }
      ]
    }
  ],
  sabotagens: [
    {
      nome: "Responde pela interpretação ainda não confirmada",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 3 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 8 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 0 } },
        { tipo: "maquina", acao: { tipo: "bica", indice: 3 } },
        { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 3 } },
        { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/1", bica: 3 } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "3" }
      ],
      equivoco: "arredondou-para-baixo"
    },
    {
      nome: "Deixa duas sacas no sítio",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 3 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 8 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" }
      ],
      equivoco: "arredondou-para-baixo"
    }
  ],
  categoria: "aplicacao-direta"
};
