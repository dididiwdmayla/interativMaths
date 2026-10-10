/**
 * Missão 1 — Carga igual (dividir repartindo). SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CONFERIR, FECHAR, LOTE_2, LOTE_5, LOTE_6, LOTE_7, MAQUINA_MONTAR_SACAS, REPARTIR, SEGUIR } from "./comum";

const MAQUINA: ConfigBancada = {
  pele: "sacas-carrocas",
  pecas: { quantidade: 24 },
  bicas: { quantidade: 4, ajustavel: false },
};

/** Do começo até a partilha da experimentação (parte comum às soluções). */
const ABERTURA: Entrada[] = [SEGUIR, { tipo: "responder", valor: "5" }];

/** Só os passos de formalização (o que o modo registro roda). */
const REGISTRO: Entrada[] = [
  { tipo: "lacuna", lacuna: "a", valor: "24" },
  { tipo: "lacuna", lacuna: "b", valor: "4" },
  { tipo: "lacuna", lacuna: "c", valor: "6" },
  CONFERIR,
  SEGUIR,
  SEGUIR,
  { tipo: "maquina", acao: { tipo: "carga", quantidade: 18 } },
  { tipo: "maquina", acao: { tipo: "bicas", abertas: 3 } },
  LOTE_6,
  REPARTIR,
  FECHAR,
  SEGUIR,
  SEGUIR,
];

const FORMALIZACAO: Entrada[] = [{ tipo: "responder", valor: "6" }, SEGUIR, ...REGISTRO];

export const MISSAO_1: Atividade = {
  id: "partilha.arco1.carga-igual",
  tipo: "missao",
  distrito: "partilha",
  arco: "partilha.arco1",
  numero: 1,
  titulo: "Carga igual",
  ideia: "dividir repartindo",
  conceitos: ["div.partilha"],
  passos: [
    {
      id: "pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Leia o pedido da Dália.",
      falas: [
        { quem: "dalia", texto: "Vinte e quatro sacas de farinha, quatro carroças. Todas saem com a mesma carga, senão a balança da ponte trava." },
        { quem: "dalia", texto: "O manual manda girar o seletor de lote. A página com o número rasgou faz tempo." },
      ],
      manual: {
        titulo: "Repartidor — operação",
        linhas: ["1. Pôr as sacas na esteira.", "2. Girar o seletor de lote até o", "3. Puxar a alavanca."],
      },
      botao: "Aceitar o serviço",
    },
    {
      id: "palpite",
      tipo: "palpite",
      fase: "palpite",
      pedido: "Antes de ligar, um palpite.",
      maquina: { config: MAQUINA },
      pergunta: "Quantas sacas você acha que cada carroça vai levar?",
      resposta: { tipo: "numero", minimo: 0, maximo: 24, unidade: "sacas" },
      certo: "6",
    },
    {
      id: "repartir",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "24 sacas, 4 carroças, todas iguais.",
      maquina: { config: MAQUINA },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Repare nos medidores das carroças: todos precisam parar na mesma altura, e a esteira precisa ficar vazia.", alvo: "bicas" },
        {
          texto: "Cada volta tira {pedido} sacas da pilha: {lote} para cada uma das {abertas} carroças. Na pilha há {ha}.",
          cota: { alvo: "pilha", texto: "volta de {lote}: pede {pedido} · há {ha}" },
        },
        {
          texto: "Numa máquina pequena, com outros números: 10 sacas, 2 carroças. Uma saca para cada, de novo, de novo, até a esteira esvaziar.",
          caso: {
            maquina: { pele: "sacas-carrocas", pecas: { quantidade: 10 }, bicas: { quantidade: 2, ajustavel: false } },
            acoes: [{ tipo: "repartir" }, { tipo: "repartir" }, { tipo: "repartir" }, { tipo: "repartir" }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["lote-maior-que-cabe", "parou-cedo"],
      evidencias: [{ conceito: "div.partilha", tipo: "experimento" }],
      aoConcluir: [{ quem: "dalia", texto: "Seis em cada. A balança da ponte nem piscou." }],
      convite: {
        texto: "Dá para fazer numa volta só?",
        objetivo: { validador: "partilha.fechada", params: { voltasMax: 1 } },
      },
    },
    {
      id: "trinta",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Chegaram 30 sacas e abriu mais uma bica.",
      falas: [{ quem: "dalia", texto: "Chegaram trinta sacas, e a quinta bica voltou a abrir. Cinco carroças." }],
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 30 }, bicas: { quantidade: 5, ajustavel: false } } },
      pergunta: "Antes de girar: quantas sacas vão em cada carroça?",
      resposta: { tipo: "numero", minimo: 0, maximo: 30, unidade: "sacas" },
      medida: "carga-por-bica",
      demonstracao: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      explicacao: "Trinta sacas em cinco carroças: seis em cada.",
      dicas: [
        { texto: "Conte as bicas abertas: agora são cinco.", alvo: "bicas" },
        { texto: "Uma saca para cada carroça usa 5 sacas por volta. São 30 na esteira.", cota: { alvo: "pilha", texto: "volta de 1: pede 5 · há 30" } },
        {
          texto: "Com outros números: 12 sacas e 3 carroças dão 4 em cada.",
          caso: {
            maquina: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 3, ajustavel: false } },
            acoes: [{ tipo: "lote", valor: 4 }, { tipo: "repartir" }],
          },
        },
      ],
      evidencias: [{ conceito: "div.partilha", tipo: "descoberta" }],
    },
    {
      id: "frase",
      tipo: "frase",
      fase: "formalizacao",
      pedido: "Toque numa cota, depois na lacuna.",
      falas: [{ quem: "dalia", texto: "Escreve no Caderno. Quero entender o que eu fazia no escuro." }],
      maquina: { config: MAQUINA, acoes: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }] },
      frase: "{a} sacas repartidas entre {b} carroças dão {c} em cada.",
      lacunas: [
        { id: "a", medida: "carga-total" },
        { id: "b", medida: "bicas-em-uso" },
        { id: "c", medida: "carga-por-bica" },
      ],
      fichas: ["carga-total", "bicas-em-uso", "carga-por-bica", "sobra"],
      dicas: [
        { texto: "As cotas da máquina parada têm os números: o total, as carroças, a carga de cada uma.", alvo: "bicas" },
        { texto: "O total que entrou na esteira foi {total}." },
        { texto: "Com outros números: 10 sacas repartidas entre 2 carroças dão 5 em cada." },
      ],
    },
    {
      id: "notacao",
      tipo: "notacao",
      fase: "formalizacao",
      pedido: "Comprima a frase em notação.",
      linhas: ["24 ÷ 4 = 6", "4 × 6 = 24"],
      falas: [{ quem: "nonio", texto: "As palavras saem, os números ficam, os sinais aparecem. E a volta: quatro carroças de seis dão vinte e quatro." }],
    },
    {
      id: "volta",
      tipo: "operar",
      fase: "formalizacao",
      pedido: "Caminho de volta: monte 18 ÷ 3.",
      conta: "18 ÷ 3",
      maquina: { config: MAQUINA_MONTAR_SACAS },
      objetivo: { validador: "maquina.mostra-divisao", params: { dividendo: 18, divisor: 3 } },
      resolucao: [{ tipo: "carga", quantidade: 18 }, { tipo: "bicas", abertas: 3 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "O primeiro número vai para a esteira; o segundo diz quantas bicas abrir.", alvo: "esteira" },
        { texto: "Na esteira há {total}; abertas, {abertas} bicas." },
        { texto: "Com outros números: 8 ÷ 2 é 8 sacas na esteira e 2 bicas abertas." },
      ],
      rotuloFechar: "Conferir",
    },
    {
      id: "registro",
      tipo: "registro",
      fase: "formalizacao",
      pedido: "Guarde a página no Caderno.",
      pagina: {
        id: "partilha.arco1.carga-igual",
        titulo: "Repartir igualmente",
        notacao: ["24 ÷ 4 = 6", "4 × 6 = 24"],
        volta: "18 ÷ 3 = 6",
        notas: ["Então o número rasgado era 6. Trinta anos girando no escuro.", "Dividir reparte. Multiplicar junta de volta."],
      },
    },
  ],
  prova: [
    {
      id: "prova-pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Prova direta: uma encomenda sem manual.",
      falas: [{ quem: "dalia", texto: "Pelo que o Nônio mediu, você já reparte. Então: 35 sacas, 7 carroças, numa volta só." }],
      botao: "Aceitar",
    },
    {
      id: "prova-operar",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "35 sacas, 7 carroças, numa volta só.",
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 35 }, bicas: { quantidade: 7, ajustavel: false }, voltasMax: 1 } },
      objetivo: { validador: "partilha.fechada", params: { voltasMax: 1 } },
      resolucao: [{ tipo: "lote", valor: 5 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Uma volta só: o lote precisa esvaziar a esteira de uma vez.", alvo: "pilha" },
        { texto: "Uma volta de {lote} em {abertas} carroças pede {pedido}; há {ha}." },
        { texto: "Com outros números: 12 sacas, 4 carroças, numa volta: lote 3." },
      ],
      equivocos: ["lote-maior-que-cabe", "parou-cedo"],
      evidencias: [{ conceito: "div.partilha", tipo: "aplicacao" }],
      aoConcluir: [{ quem: "dalia", texto: "Cinco em cada, numa volta. A missão fica marcada como feita." }],
    },
  ],
  solucoesDeTeste: [
    { nome: "de 1 em 1 (seis voltas)", modo: "guiada", entradas: [...ABERTURA, REPARTIR, REPARTIR, REPARTIR, REPARTIR, REPARTIR, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    { nome: "de 2 em 2 (três voltas)", modo: "guiada", entradas: [...ABERTURA, LOTE_2, REPARTIR, REPARTIR, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    {
      nome: "de 6 em 6, aceitando o convite",
      modo: "guiada",
      entradas: [...ABERTURA, LOTE_6, REPARTIR, FECHAR, { tipo: "convite", aceitar: true }, LOTE_6, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO],
    },
    { nome: "prova direta", modo: "prova", entradas: [SEGUIR, LOTE_5, REPARTIR, FECHAR, SEGUIR] },
    {
      nome: "só o registro",
      modo: "registro",
      entradas: REGISTRO,
    },
  ],
  sabotagens: [
    { nome: "lote 7 pede 28", modo: "guiada", entradas: [...ABERTURA, LOTE_7, REPARTIR], equivoco: "lote-maior-que-cabe" },
    { nome: "fecha com 4 na esteira", modo: "guiada", entradas: [...ABERTURA, LOTE_5, REPARTIR, FECHAR], equivoco: "parou-cedo" },
    { nome: "prova com lote 6", modo: "prova", entradas: [SEGUIR, LOTE_6, REPARTIR], equivoco: "lote-maior-que-cabe" },
  ],
};
