/**
 * Missão 4 — O pão não é saca (fração como parte e como divisão). SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CONFERIR, CORTAR_TODAS, CORTAR_UMA, FATIADOR_PADARIA, FECHAR, LOTE_2, LOTE_3, LOTE_6, MAQUINA_MONTAR_BROAS, REPARTIR, SEGUIR } from "./comum";

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

const COMPARAR: Entrada[] = [{ tipo: "responder", valor: "mesmo" }, SEGUIR];
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
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      evidencias: [{ conceito: "fra.quociente", tipo: "experimento" }],
      aoConcluir: [{ quem: "nonio", texto: "Os medidores pararam na mesma altura. Seja qual for o corte, três quartos de broa em cada mesa." }],
    },
    {
      id: "comparar",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Uma mesa reclama da outra.",
      falas: [{ quem: "dalia", texto: "Uma mesa ganhou dois pedaços pequenos; a outra, um pedaço só. A dos dois diz que comeu mais." }],
      maquina: {
        config: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 2, ajustavel: true }, fatiador: FATIADOR_PADARIA },
        acoes: [
          { tipo: "partes", valor: 2 },
          { tipo: "fatiar", quantidade: 1 },
          { tipo: "partes", valor: 2 },
          { tipo: "fatiar", quantidade: 1 },
          { tipo: "pilha", tamanho: "1/4" },
          { tipo: "bica", indice: 1 },
          { tipo: "repartir" },
        ],
      },
      pergunta: "2 pedaços de 1/8 ou 1 pedaço de 1/4: qual é mais pão?",
      resposta: {
        tipo: "opcoes",
        opcoes: [
          { id: "dois-oitavos", texto: "2 pedaços de 1/8" },
          { id: "um-quarto", texto: "1 pedaço de 1/4" },
          { id: "mesmo", texto: "É o mesmo" },
        ],
      },
      esperado: "mesmo",
      respostasEquivoco: [{ resposta: "dois-oitavos", equivoco: "conta-pedacos" }],
      demonstracao: [
        { tipo: "bica", indice: 1 },
        { tipo: "bica", indice: 0 },
        { tipo: "pilha", tamanho: "1/4" },
        { tipo: "partes", valor: 2 },
        { tipo: "fatiar", quantidade: 1 },
        { tipo: "pilha", tamanho: "1/8" },
        { tipo: "lote", valor: 2 },
        { tipo: "repartir" },
      ],
      explicacao: "Os dois medidores param na mesma altura: dois oitavos e um quarto são a mesma quantidade de pão.",
      dicas: [
        { texto: "Olhe os medidores, não os pedaços.", alvo: "bicas" },
        { texto: "Um quarto cortado em 2 dá dois oitavos." },
        { texto: "Com outros números: 2 pedaços de 1/4 e 1 pedaço de 1/2 enchem o medidor até a mesma altura." },
      ],
      evidencias: [{ conceito: "fra.parte", tipo: "descoberta" }],
    },
    {
      id: "duas-tres",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Monte a resposta com fichas.",
      maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 2 }, bicas: { quantidade: 3, ajustavel: false }, fatiador: FATIADOR_PADARIA } },
      pergunta: "2 broas, 3 mesas. Que pedaço cada mesa recebe?",
      resposta: { tipo: "fracao", maximo: 12 },
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
      falas: [{ quem: "dalia", texto: "Cinco broas, oito mesas. Me diga quanto vai em cada mesa antes de ligar. Depois a máquina confere." }],
      botao: "Aceitar",
    },
    {
      id: "prova-prever",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Responda em notação.",
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
    { nome: "dois pedaços pequenos parecem mais", modo: "guiada", entradas: [...CINCO_OK, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, { tipo: "responder", valor: "dois-oitavos" }], equivoco: "conta-pedacos" },
    {
      nome: "2 broas para 3 mesas escrito 3/2",
      modo: "guiada",
      entradas: [...CINCO_OK, PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR, SEGUIR, ...COMPARAR, { tipo: "responder", valor: "3/2" }],
      equivoco: "fracao-invertida",
    },
  ],
};
