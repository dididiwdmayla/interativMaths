/**
 * Missão 1 — Carga igual (dividir repartindo). SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CONFERIR, FECHAR, LOTE_5, LOTE_6, LOTE_7, MAQUINA_MONTAR_SACAS, REPARTIR, SEGUIR, UMA_EM_CADA_4 } from "./comum";

const MAQUINA: ConfigBancada = {
  pele: "sacas-carrocas",
  pecas: { quantidade: 24 },
  bicas: { quantidade: 4, ajustavel: false },
};

/** Do começo até a partilha da experimentação (parte comum às soluções). */
const ABERTURA: Entrada[] = [SEGUIR, { tipo: "responder", valor: "5" }];

/** Uma saca em cada carroça, com a mão: o passo vence sozinho no quarto toque. */
const A_MAO: readonly Entrada[] = UMA_EM_CADA_4;

/** As outras vinte sacas, à mão: cinco voltas de quatro toques. */
const TUDO_A_MAO: readonly Entrada[] = [...A_MAO, ...A_MAO, ...A_MAO, ...A_MAO, ...A_MAO];

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
      instrucao: "Leia o pedido da Dália e aceite o serviço.",
      falas: [
        { quem: "dalia", texto: "Vinte e quatro sacas de farinha, quatro carroças. Todas saem com a mesma carga, senão a balança da ponte trava." },
        { quem: "dalia", texto: "O manual manda ajustar o lote. A página com o número rasgou faz tempo." },
      ],
      manual: {
        titulo: "Repartidor — operação",
        linhas: ["1. Pôr as sacas na esteira.", "2. Ajustar o lote até o", "3. Apertar Repartir."],
      },
      botao: "Aceitar o serviço",
    },
    {
      id: "palpite",
      tipo: "palpite",
      fase: "palpite",
      pedido: "Antes de ligar, um palpite.",
      instrucao: "Diga quantas sacas você acha que cada carroça vai levar.",
      maquina: { config: MAQUINA },
      pergunta: "Quantas sacas você acha que cada carroça vai levar?",
      resposta: { tipo: "numero", minimo: 0, maximo: 24, unidade: "sacas" },
      certo: "6",
    },
    {
      id: "a-mao",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "Uma saca em cada carroça, à mão.",
      instrucao: "Ponha uma saca em cada carroça, com a mão.",
      nonio: "Antes da alavanca, a mão: toque numa saca na esteira e depois numa carroça.",
      recados: { abertura: "Antes da alavanca, a mão: uma saca de cada vez." },
      acerto: "Uma saca em cada carroça, posta à mão. Na esteira ainda há {sobraNome}.",
      maquina: { config: MAQUINA },
      objetivo: { validador: "partilha.inteiras-por-bica", params: { n: 1 } },
      automatico: true,
      resolucao: [
        { tipo: "colocar", tamanho: "1/1", bica: 0 },
        { tipo: "colocar", tamanho: "1/1", bica: 1 },
        { tipo: "colocar", tamanho: "1/1", bica: 2 },
        { tipo: "colocar", tamanho: "1/1", bica: 3 },
      ],
      dicas: [
        { texto: "Toque numa saca na esteira: ela fica escolhida, com um anel azul. Depois toque numa carroça.", alvo: "esteira" },
        { texto: "São {abertas} carroças: {abertas} toques numa carroça, uma saca de cada vez.", cota: { alvo: "bicas", texto: "{abertas} carroças · 1 em cada" } },
        {
          texto: "Com outros números: 6 sacas, 3 carroças. Uma saca na primeira, uma na segunda, uma na terceira.",
          caso: {
            maquina: { pele: "sacas-carrocas", pecas: { quantidade: 6 }, bicas: { quantidade: 3, ajustavel: false } },
            acoes: [
              { tipo: "colocar", tamanho: "1/1", bica: 0 },
              { tipo: "colocar", tamanho: "1/1", bica: 1 },
              { tipo: "colocar", tamanho: "1/1", bica: 2 },
            ],
          },
        },
      ],
      equivocos: ["lote-maior-que-cabe"],
    },
    {
      id: "repartir",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "24 sacas, 4 carroças, todas iguais.",
      instrucao: "Termine com Repartir: carroças iguais, esteira vazia.",
      nonio: "Agora a alavanca. O lote diz quantas sacas cada carroça recebe a cada volta.",
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 5 }, { tipo: "repartir" }],
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
        texto: "fechar numa volta só",
        instrucao: "Feche numa volta só: um lote que esvazie a esteira de uma vez.",
        objetivo: { validador: "partilha.fechada", params: { voltasMax: 1 } },
      },
    },
    {
      id: "trinta",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Chegaram 30 sacas e abriu mais uma bica.",
      instrucao: "Responda quantas sacas vão em cada carroça, antes de girar.",
      chegada: {
        fala: "Chegaram mais seis sacas, e a quinta bica voltou a abrir. Cinco carroças agora.",
        texto: "Mais sacas e mais uma carroça. A conta muda; o jeito de repartir, não. Pense antes de girar.",
      },
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
      instrucao: "Complete a frase com os números da máquina parada.",
      falas: [{ quem: "dalia", texto: "Escreve no Caderno. Quero entender o que eu fazia de cor." }],
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
      instrucao: "Comprima a frase em notação.",
      linhas: ["24 ÷ 4 = 6", "4 × 6 = 24"],
      falas: [{ quem: "nonio", texto: "As palavras saem, os números ficam, os sinais aparecem. E a volta: quatro carroças de seis dão vinte e quatro." }],
    },
    {
      id: "volta",
      tipo: "operar",
      fase: "formalizacao",
      pedido: "Caminho de volta: monte 18 ÷ 3.",
      instrucao: "Monte a conta 18 ÷ 3 na máquina.",
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
      instrucao: "Guarde a página no Caderno.",
      pagina: {
        id: "partilha.arco1.carga-igual",
        titulo: "Repartir igualmente",
        notacao: ["24 ÷ 4 = 6", "4 × 6 = 24"],
        volta: "18 ÷ 3 = 6",
        notas: ["Então o número rasgado era 6. Trinta anos fazendo de cor.", "Dividir reparte. Multiplicar junta de volta."],
      },
    },
  ],
  prova: [
    {
      id: "prova-pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Prova direta: uma encomenda sem manual.",
      instrucao: "Leia a encomenda e aceite.",
      falas: [{ quem: "dalia", texto: "Pelo que o Nônio mediu, você já reparte. Então: 35 sacas, 7 carroças, numa volta só." }],
      botao: "Aceitar",
    },
    {
      id: "prova-operar",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "35 sacas, 7 carroças, numa volta só.",
      instrucao: "Reparta 35 sacas entre 7 carroças, numa volta só.",
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
    { nome: "à mão, depois de 1 em 1", modo: "guiada", entradas: [...ABERTURA, ...A_MAO, SEGUIR, REPARTIR, REPARTIR, REPARTIR, REPARTIR, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    { nome: "à mão, depois lote 5", modo: "guiada", entradas: [...ABERTURA, ...A_MAO, SEGUIR, LOTE_5, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    { nome: "tudo à mão", modo: "guiada", entradas: [...ABERTURA, ...A_MAO, SEGUIR, ...TUDO_A_MAO, FECHAR, SEGUIR, ...FORMALIZACAO] },
    { nome: "a primeira volta com a alavanca", modo: "guiada", entradas: [...ABERTURA, REPARTIR, SEGUIR, LOTE_5, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    {
      nome: "lote 5, aceitando o desafio",
      modo: "guiada",
      entradas: [...ABERTURA, ...A_MAO, SEGUIR, LOTE_5, REPARTIR, FECHAR, { tipo: "convite", aceitar: true }, LOTE_5, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO],
    },
    { nome: "prova direta", modo: "prova", entradas: [SEGUIR, LOTE_5, REPARTIR, FECHAR, SEGUIR] },
    {
      nome: "só o registro",
      modo: "registro",
      entradas: REGISTRO,
    },
  ],
  sabotagens: [
    { nome: "no passo da mão, lote 7 pede 28", modo: "guiada", entradas: [...ABERTURA, LOTE_7, REPARTIR], equivoco: "lote-maior-que-cabe" },
    { nome: "depois da mão, lote 6 pede 24", modo: "guiada", entradas: [...ABERTURA, ...A_MAO, SEGUIR, LOTE_6, REPARTIR], equivoco: "lote-maior-que-cabe" },
    { nome: "fecha com 4 na esteira", modo: "guiada", entradas: [...ABERTURA, ...A_MAO, SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 4 } }, REPARTIR, FECHAR], equivoco: "parou-cedo" },
    { nome: "prova com lote 6", modo: "prova", entradas: [SEGUIR, LOTE_6, REPARTIR], equivoco: "lote-maior-que-cabe" },
  ],
};
