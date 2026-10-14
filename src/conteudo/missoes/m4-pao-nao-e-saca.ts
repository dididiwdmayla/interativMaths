/**
 * Missão 4 — O pão não é saca (fração como parte e como divisão). SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CONFERIR, CORTAR_TODAS, CORTAR_UMA, FATIADOR_PADARIA, FECHAR, LOTE_2, LOTE_3, LOTE_6, MAQUINA_MONTAR_BROAS, REPARTIR, SEGUIR, UMA_EM_CADA_4 } from "./comum";

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
const PILHA_MEIO: Entrada = { tipo: "maquina", acao: { tipo: "pilha", tamanho: "1/2" } };

const CINCO_OK: Entrada[] = [SEGUIR, REPARTIR, PARTES_4, CORTAR_UMA, REPARTIR, FECHAR, SEGUIR];

/** Cinco broas só com a mão e o menu de corte: a referência 1. */
const CINCO_A_MAO: Entrada[] = [
  SEGUIR,
  ...UMA_EM_CADA_4,
  { tipo: "maquina", acao: { tipo: "cortar", tamanho: "1/1", partes: 4 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/4", bica: 0 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/4", bica: 1 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/4", bica: 2 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/4", bica: 3 } },
  FECHAR,
  SEGUIR,
];

/** A aposta: corta uma broa em 8 e outra em 4, põe 2 oitavos na A e 1 quarto na B; empate. */
const PROVA_DA_APOSTA: Entrada[] = [
  { tipo: "maquina", acao: { tipo: "cortar", tamanho: "1/1", partes: 8 } },
  { tipo: "maquina", acao: { tipo: "cortar", tamanho: "1/1", partes: 4 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/8", bica: 0 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/8", bica: 0 } },
  { tipo: "maquina", acao: { tipo: "colocar", tamanho: "1/4", bica: 1 } },
];
const COMPARAR: Entrada[] = [...PROVA_DA_APOSTA, { tipo: "responder", valor: "empate" }, SEGUIR];
const DESCOBERTA: Entrada[] = [...COMPARAR, { tipo: "responder", valor: "2/3" }, SEGUIR];

const REGISTRO: Entrada[] = [
  { tipo: "lacuna", lacuna: "a", valor: "4" },
  { tipo: "lacuna", lacuna: "b", valor: "1/4" },
  { tipo: "lacuna", lacuna: "c", valor: "3" },
  { tipo: "lacuna", lacuna: "d", valor: "3/4" },
  CONFERIR,
  SEGUIR,
  SEGUIR,
  { tipo: "maquina", acao: { tipo: "carga", quantidade: 2 } },
  { tipo: "maquina", acao: { tipo: "bicas", abertas: 5 } },
  { tipo: "maquina", acao: { tipo: "partes", valor: 5 } },
  CORTAR_TODAS,
  LOTE_2,
  REPARTIR,
  FECHAR,
  SEGUIR,
  SEGUIR,
];

export const MISSAO_4: Atividade = {
  id: "partilha.arco1.pao-nao-e-saca",
  tipo: "missao",
  distrito: "partilha",
  arco: "partilha.arco1",
  numero: 4,
  titulo: "O pão não é saca",
  ideia: "fração como parte e como divisão",
  conceitos: ["fra.parte", "fra.quociente"],
  passos: [
    {
      id: "pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Leia o pedido da Dália.",
      instrucao: "Leia o pedido da Dália e aceite o serviço.",
      falas: [
        { quem: "dalia", texto: "Padaria do Engenho. Cinco broas, quatro mesas. O manual das sacas não serve aqui: pão se corta." },
        { quem: "dalia", texto: "O fatiador está ali. Ninguém mexe nele desde que o seu Odilo se aposentou." },
      ],
      manual: {
        titulo: "Padaria — fatiador",
        linhas: ["Cortar a broa em partes iguais.", "Cada mesa recebe", "(o resto da página molhou)"],
      },
      botao: "Aceitar o serviço",
    },
    {
      id: "cinco-broas",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "5 broas, 4 mesas, partes iguais.",
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
      nonio: "Pão não é saca: o que sobra dá para cortar. Comece como com as sacas.",
      acerto: "Uma broa e mais um quarto em cada mesa. A broa que sobrou virou pedaço, e nada ficou na esteira.",
      equivocos: ["resto-jogado-fora", "corte-que-nao-fecha", "parou-cedo"],
      evidencias: [
        { conceito: "fra.parte", tipo: "experimento" },
        { conceito: "div.resto", tipo: "aplicacao" },
      ],
      aoConcluir: [{ quem: "dalia", texto: "Uma broa e um quarto para cada mesa. Ninguém reclamou, o que na padaria é raro." }],
    },
    {
      id: "tres-broas",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "Agora 3 broas e 4 mesas.",
      instrucao: "Reparta 3 broas entre as 4 mesas, sem sobrar nada.",
      maquina: { config: TRES },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Repare nos medidores: o que importa é a altura, não o número de pedaços.", alvo: "bicas" },
        { texto: "Há {total} de broa para 4 mesas. Uma volta de inteiras pediria 4.", cota: { alvo: "pilha", texto: "há {total} · 4 mesas" } },
        {
          texto: "Com outros números: 1 broa, 2 mesas. Corte em 2, meia para cada.",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [{ tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "repartir" }],
          },
        },
      ],
      nonio: "Três broas, quatro mesas: nenhuma volta de inteiras cabe. Olhe a altura dos medidores.",
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      evidencias: [{ conceito: "fra.quociente", tipo: "experimento" }],
      aoConcluir: [{ quem: "nonio", texto: "Os medidores pararam na mesma altura. Seja qual for o corte, três quartos de broa em cada mesa." }],
    },
    {
      id: "comparar",
      tipo: "aposta",
      fase: "descoberta",
      pedido: "Uma aposta sobre dois pedaços.",
      instrucao: "Mostre na máquina se ele tem razão.",
      aposta: "Aposto que 2/8 é mais que 1/4. Afinal, dois é mais que um.",
      gesto: "Corte uma broa em 8 e outra em 4. Arraste 2 oitavos para a mesa A e 1 quarto para a mesa B.",
      maquina: {
        config: { pele: "broas-mesas", pecas: { quantidade: 2 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA, nomesBicas: ["A", "B"] },
      },
      objetivo: { validador: "partilha.composicao", params: { bica1: "2x1/8", bica2: "1x1/4" } },
      resolucao: [
        { tipo: "cortar", tamanho: "1/1", partes: 8 },
        { tipo: "cortar", tamanho: "1/1", partes: 4 },
        { tipo: "colocar", tamanho: "1/8", bica: 0 },
        { tipo: "colocar", tamanho: "1/8", bica: 0 },
        { tipo: "colocar", tamanho: "1/4", bica: 1 },
      ],
      alavanca: false,
      pergunta: "Depois de repartir: quem ficou com mais pão?",
      resposta: {
        tipo: "opcoes",
        opcoes: [
          { id: "mesa-a", texto: "Mesa A" },
          { id: "empate", texto: "Empate" },
          { id: "mesa-b", texto: "Mesa B" },
        ],
      },
      esperado: "empate",
      respostasEquivoco: [{ resposta: "mesa-a", equivoco: "conta-pedacos" }],
      nonioTemRazao: false,
      explicacao: "Perdi a aposta. Dois oitavos e um quarto enchem a mesa até a mesma altura.",
      dicas: [
        { texto: "Olhe os medidores das mesas, não o número de pedaços.", alvo: "bicas" },
        { texto: "Um quarto cortado em 2 dá dois pedaços. De que tamanho é cada um?", cota: { alvo: "fatiador", texto: "1/4 em 2 partes" } },
        {
          texto: "Com outros números: 2 pedaços de 1/4 e 1 pedaço de 1/2 enchem o medidor até a mesma altura.",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 2 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [
              { tipo: "cortar", tamanho: "1/1", partes: 4 },
              { tipo: "cortar", tamanho: "1/1", partes: 2 },
              { tipo: "colocar", tamanho: "1/4", bica: 0 },
              { tipo: "colocar", tamanho: "1/4", bica: 0 },
              { tipo: "colocar", tamanho: "1/2", bica: 1 },
            ],
          },
        },
      ],
      equivocos: ["conta-pedacos"],
      evidencias: [{ conceito: "fra.parte", tipo: "descoberta" }],
    },
    {
      id: "duas-tres",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Monte a resposta com fichas.",
      instrucao: "Monte com as fichas o pedaço que cada mesa recebe: 2 broas, 3 mesas.",
      maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 2 }, bicas: { quantidade: 3, ajustavel: false }, fatiador: FATIADOR_PADARIA } },
      pergunta: "2 broas, 3 mesas. Que pedaço cada mesa recebe?",
      nonio: "Duas broas, três mesas. A resposta vem antes; a máquina confere depois.",
      resposta: { tipo: "fracao", maximo: 12, fichas: [1, 2, 3, 4, 6], moldura: { antes: "Cada mesa recebe", depois: "de broa" } },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [{ tipo: "partes", valor: 3 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 2 }, { tipo: "repartir" }],
      respostasEquivoco: [{ resposta: "2", equivoco: "conta-pedacos" }],
      explicacao: "Cada broa cortada em 3: seis terços, dois para cada mesa. Dois terços.",
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
      evidencias: [{ conceito: "fra.quociente", tipo: "descoberta" }],
    },
    {
      id: "frase",
      tipo: "frase",
      fase: "formalizacao",
      pedido: "Toque numa cota, depois na lacuna.",
      instrucao: "Complete a frase com os números da máquina parada.",
      falas: [{ quem: "nonio", texto: "Para o registro, a máquina mostra a partilha em quartos." }],
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
      linhas: ["3 ÷ 4 = 3/4", "5 ÷ 4 = 1 1/4 = 5/4"],
      falas: [
        { quem: "nonio", texto: "O denominador diz em quantas partes iguais o inteiro foi cortado. O numerador, quantos pedaços." },
        { quem: "nonio", texto: "E o traço da fração é uma divisão: três broas divididas por quatro mesas." },
      ],
    },
    {
      id: "volta",
      tipo: "operar",
      fase: "formalizacao",
      pedido: "Caminho de volta: monte 2 ÷ 5.",
      instrucao: "Monte a conta 2 ÷ 5 na máquina.",
      conta: "2 ÷ 5",
      maquina: { config: MAQUINA_MONTAR_BROAS },
      objetivo: { validador: "maquina.mostra-divisao", params: { dividendo: 2, divisor: 5 } },
      resolucao: [
        { tipo: "carga", quantidade: 2 },
        { tipo: "bicas", abertas: 5 },
        { tipo: "partes", valor: 5 },
        { tipo: "fatiar", quantidade: "todas" },
        { tipo: "lote", valor: 2 },
        { tipo: "repartir" },
      ],
      dicas: [
        { texto: "Broas na esteira, mesas nas bicas, e o fatiador faz o resto.", alvo: "esteira" },
        { texto: "Na esteira há {total}; abertas, {abertas}." },
        { texto: "Com outros números: 1 ÷ 3 é uma broa, três mesas, cortes em 3." },
      ],
      rotuloFechar: "Conferir",
    },
    {
      id: "registro",
      tipo: "registro",
      fase: "formalizacao",
      pedido: "Guarde a página no Caderno.",
      instrucao: "Guarde a página no Caderno.",
      pagina: {
        id: "partilha.arco1.pao-nao-e-saca",
        titulo: "O traço é uma divisão",
        notacao: ["3 ÷ 4 = 3/4", "5 ÷ 4 = 1 1/4 = 5/4"],
        volta: "2 ÷ 5 = 2/5",
        notas: ["Denominador: em quantas partes iguais. Numerador: quantos pedaços.", "O seu Odilo dizia três quartos e eu achava que era o nome de um pão."],
      },
    },
  ],
  prova: [
    {
      id: "prova-pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Prova direta: resposta antes da máquina.",
      instrucao: "Leia a encomenda e aceite.",
      falas: [{ quem: "dalia", texto: "Cinco broas, oito mesas. Me diga quanto vai em cada mesa antes de ligar. Depois a máquina confere." }],
      botao: "Aceitar",
    },
    {
      id: "prova-prever",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Responda em notação.",
      instrucao: "Responda quanto de broa cada mesa recebe: 5 broas, 8 mesas.",
      maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 5 }, bicas: { quantidade: 8, ajustavel: false }, fatiador: FATIADOR_PADARIA } },
      pergunta: "5 broas, 8 mesas. Quanto de broa cada mesa recebe?",
      resposta: { tipo: "fracao", maximo: 12 },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [{ tipo: "partes", valor: 8 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 5 }, { tipo: "repartir" }],
      explicacao: "Cada broa em 8: quarenta oitavos, cinco para cada mesa. 5 ÷ 8 = 5/8.",
      dicas: [
        { texto: "O traço da fração é uma divisão.", alvo: "fatiador" },
        { texto: "Em cima, o que se reparte; embaixo, entre quantos." },
        { texto: "Com outros números: 3 broas para 4 mesas dão 3/4." },
      ],
      evidencias: [{ conceito: "fra.quociente", tipo: "aplicacao" }],
    },
  ],
  solucoesDeTeste: [
    {
      nome: "à mão, com o menu de corte",
      modo: "guiada",
      entradas: [...CINCO_A_MAO, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, ...DESCOBERTA, ...REGISTRO],
    },
    {
      nome: "tudo em quartos",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, ...DESCOBERTA, ...REGISTRO],
    },
    {
      nome: "metades e depois quartos",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_2, CORTAR_TODAS, REPARTIR, PILHA_MEIO, PARTES_2, CORTAR_TODAS, REPARTIR, FECHAR, SEGUIR, ...DESCOBERTA, ...REGISTRO],
    },
    {
      nome: "oitavos",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_8, CORTAR_TODAS, LOTE_6, REPARTIR, FECHAR, SEGUIR, ...DESCOBERTA, ...REGISTRO],
    },
    {
      nome: "cinco broas cortando tudo antes (5/4 de uma vez)",
      modo: "guiada",
      entradas: [
        SEGUIR,
        PARTES_4,
        CORTAR_TODAS,
        { tipo: "maquina", acao: { tipo: "lote", valor: 5 } },
        REPARTIR,
        FECHAR,
        SEGUIR,
        PARTES_4,
        CORTAR_TODAS,
        LOTE_3,
        REPARTIR,
        FECHAR,
        SEGUIR,
        ...DESCOBERTA,
        ...REGISTRO,
      ],
    },
    { nome: "prova direta", modo: "prova", entradas: [SEGUIR, { tipo: "responder", valor: "5/8" }, SEGUIR] },
    { nome: "só o registro", modo: "registro", entradas: REGISTRO },
  ],
  sabotagens: [
    { nome: "fecha com uma broa inteira na esteira", modo: "guiada", entradas: [SEGUIR, REPARTIR, FECHAR], equivoco: "resto-jogado-fora" },
    { nome: "corta a broa que sobrou em 3 para 4 mesas", modo: "guiada", entradas: [SEGUIR, REPARTIR, PARTES_3, CORTAR_UMA], equivoco: "corte-que-nao-fecha" },
    {
      nome: "na aposta, responde como o bilhete: dois pedaços parecem mais",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, ...PROVA_DA_APOSTA, { tipo: "responder", valor: "mesa-a" }],
      equivoco: "conta-pedacos",
    },
    {
      nome: "2 broas para 3 mesas escrito 3/2",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, ...COMPARAR, { tipo: "responder", valor: "3/2" }],
      equivoco: "fracao-invertida",
    },
  ],
};
