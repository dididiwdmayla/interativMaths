/**
 * Missão 2 — Quantas carroças? (dividir como "quantos cabem"). SÓ DADOS.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CONFERIR, FECHAR, LOTE_4, LOTE_6, LOTE_8, MAQUINA_MONTAR_SACAS, REPARTIR, SEGUIR } from "./comum";

const MAQUINA: ConfigBancada = {
  pele: "sacas-carrocas",
  pecas: { quantidade: 30 },
  bicas: { quantidade: 4, ajustavel: true, vagas: 8 },
};

const ABERTURA: Entrada[] = [SEGUIR, { tipo: "responder", valor: "4" }];

const REGISTRO: Entrada[] = [
  { tipo: "lacuna", lacuna: "a", valor: "30" },
  { tipo: "lacuna", lacuna: "b", valor: "6" },
  { tipo: "lacuna", lacuna: "c", valor: "5" },
  CONFERIR,
  SEGUIR,
  SEGUIR,
  { tipo: "maquina", acao: { tipo: "carga", quantidade: 28 } },
  { tipo: "maquina", acao: { tipo: "bicas", abertas: 7 } },
  LOTE_4,
  REPARTIR,
  FECHAR,
  SEGUIR,
  SEGUIR,
];

const FORMALIZACAO: Entrada[] = [{ tipo: "responder", valor: "5" }, SEGUIR, ...REGISTRO];

export const MISSAO_2: Atividade = {
  id: "partilha.arco1.quantas-carrocas",
  tipo: "missao",
  distrito: "partilha",
  arco: "partilha.arco1",
  numero: 2,
  titulo: "Quantas carroças?",
  ideia: "dividir como quantos cabem",
  conceitos: ["div.medida"],
  passos: [
    {
      id: "pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Leia o pedido da Dália.",
      instrucao: "Leia o pedido da Dália e aceite o serviço.",
      falas: [
        { quem: "dalia", texto: "Agora é o contrário. Trinta sacas, e cada carroça sai com seis: nem uma a mais, nem uma a menos. A ponte velha não aguenta outra coisa." },
        { quem: "dalia", texto: "Você abre e fecha as bicas. Eu preciso saber quantas carroças chamar." },
      ],
      manual: {
        titulo: "Carroças — tabela de chamada",
        linhas: ["Sacas por carroça: 6.", "Para 30 sacas, chamar", "(ver tabela na página seguinte)"],
      },
      botao: "Aceitar o serviço",
    },
    {
      id: "palpite",
      tipo: "palpite",
      fase: "palpite",
      pedido: "Antes de ligar, um palpite.",
      instrucao: "Diga quantas carroças você acha que vão sair.",
      maquina: { config: MAQUINA },
      pergunta: "Quantas carroças você acha que vão sair?",
      resposta: { tipo: "numero", minimo: 0, maximo: 12, unidade: "carroças" },
      certo: "5",
    },
    {
      id: "chamar",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "Exatamente 6 por carroça. Quantas?",
      instrucao: "Abra quantas carroças precisar: 6 sacas em cada, nenhuma sobrando.",
      maquina: { config: MAQUINA },
      objetivo: { validador: "partilha.carga-exata", params: { carga: 6 } },
      resolucao: [{ tipo: "bicas", abertas: 5 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "As bicas azuis abrem e fecham com um toque. Cada medidor precisa parar no 6, e a esteira precisa esvaziar.", alvo: "bicas" },
        {
          texto: "Com {abertas} bicas abertas, uma volta de {lote} pede {pedido}. Na esteira há {ha}.",
          cota: { alvo: "bicas", texto: "{abertas} bicas · lote {lote} · pede {pedido} · há {ha}" },
        },
        {
          texto: "Com outros números: 12 sacas, 3 em cada carroça. Quatro bicas abertas, lote 3, uma volta.",
          caso: {
            maquina: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 2, ajustavel: true, vagas: 6 } },
            acoes: [{ tipo: "bicas", abertas: 4 }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["lote-maior-que-cabe"],
      evidencias: [{ conceito: "div.medida", tipo: "experimento" }],
      aoConcluir: [{ quem: "dalia", texto: "Cinco carroças de seis. Nenhuma saca no pátio, nenhuma carroça a mais." }],
    },
    {
      id: "familia",
      tipo: "prever",
      fase: "descoberta",
      pedido: "Os mesmos três números, outra pergunta.",
      instrucao: "Responda quantas sacas vão em cada uma das 6 carroças.",
      falas: [{ quem: "nonio", texto: "Trinta, cinco e seis. São os números do fim da missão anterior: lá, trinta entre cinco carroças deu seis em cada." }],
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 30 }, bicas: { quantidade: 6, ajustavel: false } } },
      pergunta: "E se as 30 sacas forem repartidas entre 6 carroças, quantas em cada?",
      resposta: { tipo: "numero", minimo: 0, maximo: 30, unidade: "sacas" },
      medida: "carga-por-bica",
      demonstracao: [{ tipo: "lote", valor: 5 }, { tipo: "repartir" }],
      explicacao: "Trinta entre cinco dá seis; trinta entre seis dá cinco. Repartir e contar grupos são a mesma família de contas.",
      dicas: [
        { texto: "Agora são seis bicas abertas.", alvo: "bicas" },
        { texto: "Uma volta de 1 em cada usa 6 sacas. São 30 na esteira." },
        {
          texto: "Com outros números: 12 sacas em grupos de 3 dão 4 carroças; entre 4 carroças dão 3 em cada.",
          caso: {
            maquina: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 4, ajustavel: false } },
            acoes: [{ tipo: "lote", valor: 3 }, { tipo: "repartir" }],
          },
        },
      ],
      evidencias: [{ conceito: "div.medida", tipo: "descoberta" }],
    },
    {
      id: "frase",
      tipo: "frase",
      fase: "formalizacao",
      pedido: "Toque numa cota, depois na lacuna.",
      instrucao: "Complete a frase com os números da máquina parada.",
      maquina: { config: MAQUINA, acoes: [{ tipo: "bicas", abertas: 5 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }] },
      frase: "{a} sacas em grupos de {b} dão {c} carroças.",
      lacunas: [
        { id: "a", medida: "carga-total" },
        { id: "b", medida: "carga-por-bica" },
        { id: "c", medida: "bicas-em-uso" },
      ],
      fichas: ["carga-total", "carga-por-bica", "bicas-em-uso", "sobra"],
      dicas: [
        { texto: "As cotas da máquina parada mostram o total, a carga de cada carroça e quantas carroças saíram.", alvo: "bicas" },
        { texto: "O total foi {total}; cada carroça saiu com {cada}." },
        { texto: "Com outros números: 12 sacas em grupos de 3 dão 4 carroças." },
      ],
    },
    {
      id: "notacao",
      tipo: "notacao",
      fase: "formalizacao",
      pedido: "Comprima a frase em notação.",
      instrucao: "Comprima a frase em notação.",
      linhas: ["30 ÷ 6 = 5", "30 ÷ 5 = 6", "5 × 6 = 30"],
      falas: [{ quem: "nonio", texto: "Uma família de três contas. Quem conhece uma, conhece as outras duas." }],
    },
    {
      id: "volta",
      tipo: "operar",
      fase: "formalizacao",
      pedido: "Caminho de volta: monte 28 ÷ 7.",
      instrucao: "Monte a conta 28 ÷ 7 na máquina.",
      conta: "28 ÷ 7",
      maquina: { config: MAQUINA_MONTAR_SACAS },
      objetivo: { validador: "maquina.mostra-divisao", params: { dividendo: 28, divisor: 7, aceitaMedida: true } },
      resolucao: [{ tipo: "carga", quantidade: 28 }, { tipo: "bicas", abertas: 7 }, { tipo: "lote", valor: 4 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Vale dos dois jeitos: 7 carroças repartindo, ou carroças de 7 em 7.", alvo: "esteira" },
        { texto: "Na esteira há {total}; abertas, {abertas} bicas." },
        { texto: "Com outros números: 12 ÷ 3 é 12 sacas com 3 bicas, ou 12 sacas em carroças de 3." },
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
        id: "partilha.arco1.quantas-carrocas",
        titulo: "Quantos cabem",
        notacao: ["30 ÷ 6 = 5", "30 ÷ 5 = 6", "5 × 6 = 30"],
        volta: "28 ÷ 7 = 4",
        notas: ["A tabela que faltava era isto: três contas da mesma família.", "Dividir também pergunta quantos grupos cabem."],
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
      falas: [{ quem: "dalia", texto: "Quarenta e duas sacas, seis em cada carroça. Quantas eu chamo? Mostre na máquina." }],
      botao: "Aceitar",
    },
    {
      id: "prova-operar",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "42 sacas, exatamente 6 em cada carroça.",
      instrucao: "Chame carroças para 42 sacas, exatamente 6 em cada.",
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 42 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } } },
      objetivo: { validador: "partilha.carga-exata", params: { carga: 6 } },
      resolucao: [{ tipo: "bicas", abertas: 7 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Cada medidor no 6 e a esteira vazia.", alvo: "bicas" },
        { texto: "Com {abertas} bicas, uma volta de {lote} pede {pedido}; há {ha}." },
        { texto: "Com outros números: 20 sacas de 5 em 5 pedem 4 carroças." },
      ],
      equivocos: ["lote-maior-que-cabe"],
      evidencias: [{ conceito: "div.medida", tipo: "aplicacao" }],
      aoConcluir: [{ quem: "dalia", texto: "Sete carroças. A missão fica marcada como feita." }],
    },
  ],
  solucoesDeTeste: [
    { nome: "abrindo a quinta bica", modo: "guiada", entradas: [...ABERTURA, { tipo: "maquina", acao: { tipo: "bica", indice: 4 } }, LOTE_6, REPARTIR, FECHAR, SEGUIR, ...FORMALIZACAO] },
    {
      nome: "quatro primeiro, depois a quinta sozinha",
      modo: "guiada",
      entradas: [
        ...ABERTURA,
        LOTE_6,
        REPARTIR,
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 0 } },
        { tipo: "maquina", acao: { tipo: "bica", indice: 4 } },
        REPARTIR,
        FECHAR,
        SEGUIR,
        ...FORMALIZACAO,
      ],
    },
    { nome: "prova direta", modo: "prova", entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "bicas", abertas: 7 } }, LOTE_6, REPARTIR, FECHAR, SEGUIR] },
    { nome: "só o registro", modo: "registro", entradas: REGISTRO },
  ],
  sabotagens: [
    { nome: "lote 8 com 4 bicas pede 32", modo: "guiada", entradas: [...ABERTURA, LOTE_8, REPARTIR], equivoco: "lote-maior-que-cabe" },
  ],
};
