/**
 * Analogia do calendário. SÓ DADOS.
 * Conferido: terças 1, 8, 15, 22, 29; quartas 2, 9, 16, 23, 30; 30 = 7 × 4 + 2.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";

export const CENA_CINCO_TERCAS: Atividade = {
  id: "rua.cinco-tercas",
  tipo: "cena",
  distrito: "rua",
  titulo: "Cinco terças em setembro",
  ideia: "o resto faz o calendário andar",
  conceitos: ["div.resto"],
  passos: [
    {
      id: "cena",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Setembro começa numa terça.",
      instrucao: "Leia a troca e reparta os dias.",
      falas: [
        { quem: "nonio", texto: "Faz de conta: cada carroça é um dia da semana, e cada saca é um dia do mês." },
        {
          quem: "dalia",
          texto: "Este setembro começa numa terça e tem 30 dias. A semana tem 7. Por que há cinco terças e cinco quartas, e só quatro dos outros dias da semana?"
        }
      ],
      botao: "Repartir os dias"
    },
    {
      id: "bancada",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "30 dias entre 7 dias da semana.",
      instrucao: "Reparta 30 sacas entre 7 carroças, todas iguais.",
      maquina: {
        config: { pele: "sacas-carrocas", pecas: { quantidade: 30 }, bicas: { quantidade: 7, ajustavel: false } }
      },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 4 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Olhe o que fica depois das voltas completas." },
        { texto: "Uma volta põe uma saca em cada uma das 7 carroças." },
        { texto: "Com outros números: 17 sacas entre 5 carroças dão 3 em cada e sobram 2." }
      ],
      equivocos: ["parou-cedo", "lote-maior-que-cabe"],
      evidencias: [{ conceito: "div.resto", tipo: "transferencia" }],
      acerto: "As carroças ficaram iguais. Veja o que sobrou."
    },
    {
      id: "previsao",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Quantos dias aparecem cinco vezes?",
      instrucao: "Responda quantos dias da semana aparecem cinco vezes.",
      pergunta: "Quantos dias da semana aparecem cinco vezes?",
      resposta: { tipo: "numero", minimo: 0, maximo: 7, unidade: "dias da semana" },
      medida: "sobra",
      demonstracao: [],
      respostasEquivoco: [{ resposta: "0", equivoco: "resto-jogado-fora" }],
      explicacao: "30 = 7 × 4 + 2. As quatro semanas completas usam 28 dias. Os 2 dias que sobram repetem a terça e a quarta.",
      dicas: [
        { texto: "Depois das semanas completas, o mês ainda continua." },
        { texto: "Compare os 30 dias com os dias usados nas semanas completas." },
        { texto: "Com outros números: um mês de 31 dias deixa 3 depois de quatro semanas de 7." }
      ],
      evidencias: [{ conceito: "div.resto", tipo: "transferencia" }]
    },
    {
      id: "fim",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "O calendário anda com o resto.",
      instrucao: "Leia e volte à Rua.",
      falas: [
        {
          quem: "dalia",
          texto: "Os 2 dias que sobraram são a quinta terça, dia 29, e a quinta quarta, dia 30. O 1º de outubro cai dois dias da semana depois do 1º de setembro: numa quinta."
        },
        {
          quem: "nonio",
          texto: "Analogia: o resto da partilha virou o quanto o calendário anda. Ajuda a enxergar; a conta do calendário tem as manhas dela."
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
        { tipo: "maquina", acao: { tipo: "lote", valor: 4 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "2" },
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
        { tipo: "maquina", acao: { tipo: "lote", valor: 4 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "0" }
      ],
      equivoco: "resto-jogado-fora"
    }
  ],
  categoria: "analogia-conceitual"
};
