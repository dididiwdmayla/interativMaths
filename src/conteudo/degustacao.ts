/**
 * A degustação: uma ilhota de cinco a dez minutos para quem nunca viu o jogo, aberta em
 * /degustacao (sozinha ou dentro da recepção do interativAI). SÓ DADOS.
 *
 * É a Missão 4 da Partilha ("O pão não é saca") encurtada para o primeiro contato: a mesma
 * bancada da padaria, sem pré-requisito (o primeiro passo ensina a repartir e a cortar a sobra).
 * O ciclo inteiro em miniatura: problema, palpite, experimentação, descoberta, formalização e
 * aplicação. A ideia só ganha nome depois de descoberta: o traço da fração é uma divisão.
 * Roda numa loja de progresso à parte: nada aqui entra no progresso do jogo.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CORTAR_TODAS, CORTAR_UMA, FATIADOR_PADARIA, FECHAR, LOTE_2, LOTE_3, REPARTIR, SEGUIR } from "./missoes/comum";

const CINCO: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 5 },
  bicas: { quantidade: 4, ajustavel: false },
  fatiador: FATIADOR_PADARIA,
};

const TRES: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 3 },
  bicas: { quantidade: 4, ajustavel: false },
  fatiador: FATIADOR_PADARIA,
};

const PARTES_2: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 2 } };
const PARTES_3: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 3 } };
const PARTES_4: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 4 } };
const PARTES_8: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 8 } };
const LOTE_6: Entrada = { tipo: "maquina", acao: { tipo: "lote", valor: 6 } };

const CINCO_OK: Entrada[] = [SEGUIR, REPARTIR, PARTES_4, CORTAR_UMA, REPARTIR, FECHAR, SEGUIR];
const PALPITE: Entrada = { tipo: "responder", valor: "uma" };
const TRES_OK: Entrada[] = [PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR];
const FRASE: Entrada[] = [
  { tipo: "lacuna", lacuna: "a", valor: "4" },
  { tipo: "lacuna", lacuna: "b", valor: "1/4" },
  { tipo: "lacuna", lacuna: "c", valor: "3" },
  { tipo: "lacuna", lacuna: "d", valor: "3/4" },
  { tipo: "conferir" },
  SEGUIR,
];

export const DEGUSTACAO: Atividade = {
  id: "degustacao.tres-broas",
  tipo: "degustacao",
  distrito: "partilha",
  titulo: "Três broas, quatro mesas",
  ideia: "o traço da fração é uma divisão",
  conceitos: ["fra.parte", "fra.quociente"],
  passos: [
    {
      id: "chegada",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Um pedido da Dália, na padaria.",
      instrucao: "Leia o pedido da Dália e aceite o serviço.",
      falas: [
        { quem: "dalia", texto: "Padaria do Engenho. Broas para repartir entre as mesas, e toda mesa quer a mesma quantidade de pão." },
        { quem: "dalia", texto: "A máquina reparte sozinha. O manual diz como ligar; a página do porquê rasgou." },
        { quem: "nonio", texto: "Eu sou o Nônio. Meço, não julgo. Na máquina, comece tocando em Repartir: tudo aqui se desfaz com um toque." },
      ],
      manual: {
        titulo: "Padaria: repartidor",
        linhas: ["Pôr as broas na esteira.", "Repartir entre as mesas.", "Se sobrar, (a página rasgou)"],
      },
      botao: "Aceitar o serviço",
    },
    {
      id: "cinco-broas",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "5 broas, 4 mesas, todas iguais.",
      instrucao: "Reparta as 5 broas entre as 4 mesas, sem sobrar nada.",
      maquina: { config: CINCO },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "repartir" }, { tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Repare no fatiador: a broa que sobrar pode ser cortada em partes iguais.", alvo: "fatiador" },
        { texto: "Na esteira há {sobra} de broa para 4 mesas.", cota: { alvo: "esteira", texto: "sobra {sobra} · mesas 4" } },
        {
          texto: "Com outros números: 3 broas, 2 mesas. Uma para cada, e a que sobra, cortada em 2.",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 3 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [{ tipo: "repartir" }, { tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["resto-jogado-fora", "corte-que-nao-fecha", "parou-cedo"],
      aoConcluir: [{ quem: "dalia", texto: "Uma broa e mais um pedaço para cada mesa. A sobra não foi para o lixo: foi cortada." }],
    },
    {
      id: "palpite",
      tipo: "palpite",
      fase: "palpite",
      pedido: "Agora 3 broas. Antes, um palpite.",
      instrucao: "Diga quanto de broa você acha que vai em cada mesa.",
      maquina: { config: TRES },
      pergunta: "Três broas para quatro mesas. Quanto vai em cada mesa?",
      resposta: {
        tipo: "opcoes",
        opcoes: [
          { id: "menos", texto: "menos de uma broa" },
          { id: "uma", texto: "uma broa" },
          { id: "mais", texto: "mais de uma broa" },
        ],
      },
      certo: "menos",
    },
    {
      id: "tres-broas",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "3 broas, 4 mesas, todas iguais.",
      instrucao: "Reparta 3 broas entre as 4 mesas, sem sobrar nada.",
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Não dá uma broa inteira para cada mesa. O fatiador corta todas de uma vez.", alvo: "fatiador" },
        { texto: "Há {total} de broa para 4 mesas. Uma volta de inteiras pediria 4.", cota: { alvo: "pilha", texto: "há {total} · 4 mesas" } },
        {
          texto: "Com outros números: 1 broa, 2 mesas. Corte em 2, meia para cada.",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [{ tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      aoConcluir: [{ quem: "nonio", texto: "Nenhuma mesa ganhou broa inteira, e todas ganharam igual: três pedaços de um quarto. Três quartos de broa." }],
    },
    {
      id: "duas-tres",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Preveja antes da máquina.",
      instrucao: "Monte com as fichas o pedaço que cada mesa recebe: 2 broas, 3 mesas.",
      maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 2 }, bicas: { quantidade: 3, ajustavel: false }, fatiador: FATIADOR_PADARIA } },
      pergunta: "2 broas, 3 mesas. Que pedaço vai em cada mesa? Monte com as fichas.",
      resposta: { tipo: "fracao", maximo: 12 },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [{ tipo: "partes", valor: 3 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 2 }, { tipo: "repartir" }],
      respostasEquivoco: [{ resposta: "2", equivoco: "conta-pedacos" }],
      explicacao: "Cada broa cortada em 3: seis terços, dois para cada mesa. Dois terços de broa.",
      dicas: [
        { texto: "Pense no que a máquina faria: em quantas partes cortar para 3 mesas?", alvo: "fatiador" },
        { texto: "Cortando cada broa em 3, saem 6 pedaços para 3 mesas." },
        {
          texto: "Com outros números: 1 broa, 4 mesas. Cortada em 4, cada mesa recebe 1/4.",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "repartir" }],
          },
        },
      ],
    },
    {
      id: "frase",
      tipo: "frase",
      fase: "formalizacao",
      pedido: "Toque numa cota, depois na lacuna.",
      instrucao: "Complete a frase com os números da máquina parada.",
      falas: [{ quem: "nonio", texto: "Hora de passar a limpo. A máquina mostra de novo as três broas em quartos." }],
      maquina: { config: TRES, acoes: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }] },
      frase: "Cada broa foi cortada em {a} partes iguais, e cada pedaço é {b} de broa. Cada mesa recebeu {c} pedaços: {d} de broa.",
      lacunas: [
        { id: "a", medida: "partes" },
        { id: "b", medida: "tamanho-do-pedaco" },
        { id: "c", medida: "pedacos-por-bica" },
        { id: "d", medida: "carga-por-bica" },
      ],
      fichas: ["partes", "tamanho-do-pedaco", "pedacos-por-bica", "carga-por-bica", "carga-total"],
      dicas: [
        { texto: "Olhe uma mesa: quantos pedaços, e de que tamanho.", alvo: "bica:0" },
        { texto: "Cada mesa tem {cada} de broa." },
        { texto: "Com outros números: uma broa cortada em 2 partes; cada pedaço é 1/2." },
      ],
    },
    {
      id: "notacao",
      tipo: "notacao",
      fase: "formalizacao",
      pedido: "Comprima a frase em notação.",
      instrucao: "Comprima a frase em notação.",
      linhas: ["3 ÷ 4 = 3/4", "2 ÷ 3 = 2/3"],
      falas: [
        { quem: "nonio", texto: "O número de baixo diz em quantas partes iguais a broa foi cortada. O de cima, quantos pedaços." },
        { quem: "nonio", texto: "E o traço da fração é uma divisão: três broas divididas por quatro mesas. Sempre foi." },
      ],
    },
    {
      id: "sem-maquina",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Agora sem ligar a máquina.",
      instrucao: "Responda quanto de broa cada mesa recebe: 5 broas, 8 mesas.",
      maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 5 }, bicas: { quantidade: 8, ajustavel: false }, fatiador: FATIADOR_PADARIA } },
      pergunta: "5 broas, 8 mesas. Quanto de broa vai em cada mesa?",
      resposta: { tipo: "fracao", maximo: 12 },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [{ tipo: "partes", valor: 8 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 5 }, { tipo: "repartir" }],
      respostasEquivoco: [{ resposta: "5", equivoco: "conta-pedacos" }],
      explicacao: "Cada broa em 8 partes: quarenta oitavos, cinco para cada mesa. 5 ÷ 8 = 5/8.",
      dicas: [
        { texto: "O traço da fração é uma divisão.", alvo: "fatiador" },
        { texto: "Em cima, o que se reparte; embaixo, entre quantos." },
        { texto: "Com outros números: 3 broas para 4 mesas dão 3/4." },
      ],
    },
  ],
  solucoesDeTeste: [
    {
      nome: "quartos, depois terços e oitavos",
      modo: "guiada",
      entradas: [...CINCO_OK, PALPITE, ...TRES_OK, { tipo: "responder", valor: "2/3" }, SEGUIR, ...FRASE, SEGUIR, { tipo: "responder", valor: "5/8" }, SEGUIR],
    },
    {
      nome: "metades e depois quartos, não sei no palpite e no fim",
      modo: "guiada",
      entradas: [
        ...CINCO_OK,
        { tipo: "responder", valor: null },
        PARTES_2,
        CORTAR_TODAS,
        REPARTIR,
        { tipo: "maquina", acao: { tipo: "pilha", tamanho: "1/2" } },
        PARTES_2,
        CORTAR_TODAS,
        REPARTIR,
        FECHAR,
        SEGUIR,
        { tipo: "responder", valor: "4/6" },
        SEGUIR,
        ...FRASE,
        SEGUIR,
        { tipo: "responder", valor: null },
        SEGUIR,
      ],
    },
    {
      nome: "oitavos, de dois em dois",
      modo: "guiada",
      entradas: [...CINCO_OK, PALPITE, PARTES_8, CORTAR_TODAS, LOTE_2, REPARTIR, REPARTIR, REPARTIR, FECHAR, SEGUIR, { tipo: "responder", valor: null }, SEGUIR, ...FRASE, SEGUIR, { tipo: "responder", valor: "5/8" }, SEGUIR],
    },
    {
      nome: "oitavos, seis de uma vez",
      modo: "guiada",
      entradas: [...CINCO_OK, PALPITE, PARTES_8, CORTAR_TODAS, LOTE_6, REPARTIR, FECHAR, SEGUIR, { tipo: "responder", valor: "2/3" }, SEGUIR, ...FRASE, SEGUIR, { tipo: "responder", valor: "5/8" }, SEGUIR],
    },
  ],
  sabotagens: [
    { nome: "fecha com uma broa inteira na esteira", modo: "guiada", entradas: [SEGUIR, REPARTIR, FECHAR], equivoco: "resto-jogado-fora" },
    { nome: "corta a broa que sobrou em 3 para 4 mesas", modo: "guiada", entradas: [SEGUIR, REPARTIR, PARTES_3, CORTAR_UMA], equivoco: "corte-que-nao-fecha" },
    { nome: "2 broas para 3 mesas escrito 3/2", modo: "guiada", entradas: [...CINCO_OK, PALPITE, ...TRES_OK, { tipo: "responder", valor: "3/2" }], equivoco: "fracao-invertida" },
    { nome: "conta os pedaços em vez do pão", modo: "guiada", entradas: [...CINCO_OK, PALPITE, ...TRES_OK, { tipo: "responder", valor: "2" }], equivoco: "conta-pedacos" },
  ],
};

/**
 * O trailer do fim: o que mais existe no Engenho. Cada cena é um lugar; `existe` diz se ele já
 * está a caneta (jogável) ou ainda a lápis (em projeto). Nada é prometido além do que existe.
 */
export const TRAILER = [
  {
    id: "partilha",
    lugar: "A Partilha",
    existe: true,
    texto: "Cinco missões: repartir, quantos cabem, o que fazer com o que sobra, e o pão que não é saca.",
  },
  {
    id: "museu",
    lugar: "Museu das Descobertas",
    existe: true,
    texto: "Os pães de Ahmes: como um escriba egípcio repartia pão há quase quatro mil anos.",
  },
  {
    id: "rua",
    lugar: "A Rua",
    existe: true,
    texto: "Três pizzas, quatro amigos. A mesma conta, numa sexta à noite.",
  },
  {
    id: "caderno",
    lugar: "O Caderno e a Planta",
    existe: true,
    texto: "Cada descoberta passada a limpo, com a sua letra e a da Dália. A Planta mostra o que você já domina.",
  },
  {
    id: "lapis",
    lugar: "Ainda a lápis",
    existe: false,
    texto: "O Contrapeso, o Pátio dos Sinais, o Observatório, o Estaleiro das Formas e a Feira do Acaso esperam alguém que os passe a caneta.",
  },
] as const;

export type CenaTrailer = (typeof TRAILER)[number];
