/**
 * Museu das Descobertas: "Os pães de Ahmes". A mesma bancada, com a pele de pães e cestos.
 * O texto vem em três faixas: o que se sabe, o que é interpretação, o que simplificamos. SÓ DADOS.
 * Fatos conferidos em: Wikipedia (Rhind Mathematical Papyrus), Encyclopaedia Britannica
 * (Mathematics in ancient Egypt), Brooklyn Museum (Fragments of Rhind Mathematical Papyrus).
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";

const PAES: ConfigBancada = {
  pele: "paes-cestos",
  pecas: { quantidade: 6 },
  bicas: { quantidade: 10, ajustavel: false },
  fatiador: { partes: [2, 3, 4, 5, 10], denominadorMaximo: 10 },
};

const SEGUIR: Entrada = { tipo: "seguir" };
const FECHAR: Entrada = { tipo: "fechar" };
const REPARTIR: Entrada = { tipo: "maquina", acao: { tipo: "repartir" } };

const ESCRIBA: Entrada[] = [
  { tipo: "maquina", acao: { tipo: "partes", valor: 2 } },
  { tipo: "maquina", acao: { tipo: "fatiar", quantidade: 5 } },
  { tipo: "maquina", acao: { tipo: "pilha", tamanho: "1/2" } },
  REPARTIR,
  { tipo: "maquina", acao: { tipo: "pilha", tamanho: "1/1" } },
  { tipo: "maquina", acao: { tipo: "partes", valor: 10 } },
  { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
  REPARTIR,
  FECHAR,
];

const DO_MEU_JEITO: Entrada[] = [
  { tipo: "maquina", acao: { tipo: "partes", valor: 5 } },
  { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
  { tipo: "maquina", acao: { tipo: "lote", valor: 3 } },
  REPARTIR,
  FECHAR,
];

export const EXPOSICAO_AHMES: Atividade = {
  id: "museu.paes-de-ahmes",
  tipo: "exposicao",
  distrito: "museu",
  titulo: "Os pães de Ahmes",
  ideia: "repartir à maneira de um escriba",
  conceitos: ["fra.quociente", "fra.parte"],
  passos: [
    {
      id: "vitrine",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Museu das Descobertas.",
      falas: [
        { quem: "nonio", texto: "Esta sala guarda um problema de mais de três mil anos: repartir seis pães entre dez trabalhadores." },
        { quem: "dalia", texto: "Dez cestos, seis pães. Primeiro do seu jeito." },
      ],
      botao: "Ir à bancada",
    },
    {
      id: "seu-jeito",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "6 pães, 10 cestos, do seu jeito.",
      maquina: { config: PAES },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "partes", valor: 5 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Dez cestos: o fatiador corta em 10, em 5, em 2.", alvo: "fatiador" },
        { texto: "Há {total} pães para 10 cestos." },
        {
          texto: "Com outros números: 2 pães para 4 cestos, cada pão em 2: meio pão para cada.",
          caso: {
            maquina: { pele: "paes-cestos", pecas: { quantidade: 2 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: { partes: [2, 4], denominadorMaximo: 4 } },
            acoes: [{ tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      evidencias: [{ conceito: "fra.quociente", tipo: "transferencia" }],
      aoConcluir: [{ quem: "nonio", texto: "Três quintos de pão para cada um. Agora veja como um escriba escreveria isso." }],
    },
    {
      id: "escriba",
      tipo: "narrativa",
      fase: "problema",
      pedido: "À maneira de um escriba.",
      falas: [
        { quem: "nonio", texto: "Os escribas do Egito escreviam frações como soma de pedaços de numerador 1, todos diferentes: nada de três quintos, nada de repetir um tamanho." },
        { quem: "dalia", texto: "Então cada cesto só pode ter pedaços de numerador 1, e nenhum tamanho duas vezes." },
      ],
      falasSeMarca: {
        marca: "unitarias-sem-repetir",
        falas: [{ quem: "nonio", texto: "Você já fez isso sozinho, na encomenda sem manual: metade mais um quarto. É o mesmo estilo." }],
      },
      botao: "Tentar",
    },
    {
      id: "a-maneira-do-escriba",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "Só pedaços de numerador 1, sem repetir.",
      maquina: { config: PAES },
      objetivo: { validador: "partilha.unitarias-distintas" },
      resolucao: [
        { tipo: "partes", valor: 2 },
        { tipo: "fatiar", quantidade: 5 },
        { tipo: "pilha", tamanho: "1/2" },
        { tipo: "repartir" },
        { tipo: "pilha", tamanho: "1/1" },
        { tipo: "partes", valor: 10 },
        { tipo: "fatiar", quantidade: "todas" },
        { tipo: "repartir" },
      ],
      dicas: [
        { texto: "Um pedaço grande para cada um primeiro; depois o que sobrar, em pedaços menores.", alvo: "fatiador" },
        { texto: "Meio pão para cada um dos 10 usa 5 pães. Sobra {sobra}." },
        {
          texto: "Com outros números: 3 pães para 4 cestos à maneira do escriba: metade mais um quarto.",
          caso: {
            maquina: { pele: "paes-cestos", pecas: { quantidade: 3 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: { partes: [2, 4], denominadorMaximo: 4 } },
            acoes: [{ tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "repartir" }, { tipo: "pilha", tamanho: "1/2" }, { tipo: "partes", valor: 2 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora"],
      evidencias: [{ conceito: "fra.parte", tipo: "transferencia" }],
      aoConcluir: [{ quem: "nonio", texto: "Meio pão mais um décimo para cada um: 1/2 + 1/10. É a resposta escrita no papiro." }],
    },
    {
      id: "placa",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A legenda da exposição.",
      faixas: {
        sabe: [
          "O Papiro de Rhind foi copiado por volta de 1550 a.C. pelo escriba Ahmes, a partir de um texto mais antigo. As datas variam um pouco conforme a fonte.",
          "A maior parte dele está no Museu Britânico, em Londres; alguns fragmentos estão no Museu do Brooklyn.",
          "Os seis primeiros problemas repartem 1, 2, 6, 7, 8 e 9 pães entre 10 homens. No terceiro, 6 pães entre 10: cada um recebe 1/2 + 1/10.",
          "Os egípcios escreviam frações como somas de frações de numerador 1, todas diferentes, com 2/3 como exceção.",
        ],
        interpretacao: ["Por que preferiam esse sistema é assunto debatido."],
        simplificamos: ["Cortar pães como nesta bancada é um jeito de enxergar a decomposição; não é registro de como eles faziam."],
        fontes: ["Encyclopaedia Britannica, Mathematics in ancient Egypt", "Museu do Brooklyn, Fragments of Rhind Mathematical Papyrus", "Wikipedia, Rhind Mathematical Papyrus"],
      },
      botao: "Sair do museu",
    },
  ],
  solucoesDeTeste: [
    { nome: "em quintos, depois à maneira do escriba", modo: "guiada", entradas: [SEGUIR, ...DO_MEU_JEITO, SEGUIR, SEGUIR, ...ESCRIBA, SEGUIR, SEGUIR] },
    { nome: "escriba nas duas vezes", modo: "guiada", entradas: [SEGUIR, ...ESCRIBA, SEGUIR, SEGUIR, ...ESCRIBA, SEGUIR, SEGUIR] },
  ],
  sabotagens: [
    {
      nome: "seis pães em 3 para dez cestos",
      modo: "guiada",
      entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "partes", valor: 3 } }, { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } }],
      equivoco: "corte-que-nao-fecha",
    },
  ],
};
