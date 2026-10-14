/**
 * O Manual da Partilha: uma página por conceito que uma missão ensina, e uma linha a lápis para
 * os que ainda não têm missão. SÓ DADOS. A ordem aqui é a ordem das páginas.
 *
 * A página restaurada repete os números da missão onde o jogador a fez (o 26 ÷ 4 da Missão 3):
 * ela só abre depois da descoberta, e os mesmos números ajudam a lembrar.
 */
import type { ConceitoALapis, PaginaManual } from "@/nucleo/manual/manual";

const SACAS = "sacas-carrocas" as const;
const BROAS = "broas-mesas" as const;
const FATIADOR = { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 } as const;

const DIVIDENDO = { termo: "Dividendo", significado: "O que se reparte." };
const DIVISOR = { termo: "Divisor", significado: "Entre quantos se reparte." };
const QUOCIENTE = { termo: "Quociente", significado: "Quanto cada um recebe." };

export const PAGINAS_MANUAL: readonly PaginaManual[] = [
  {
    conceito: "div.partilha",
    slug: "divisao-exata",
    frase: "Repartir uma quantidade em partes iguais: cada parte recebe o mesmo, e não sobra nada.",
    escrita: {
      exemplo: "24 ÷ 4 = 6",
      forma: "4 × 6 = 24",
      termos: [
        { valor: "24", nome: "dividendo" },
        { valor: "4", nome: "divisor" },
        { valor: "6", nome: "quociente", marca: true },
      ],
    },
    maquina: {
      config: { pele: SACAS, pecas: { quantidade: 24 }, bicas: { quantidade: 4, ajustavel: false } },
      acoes: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      descricao: "Quatro carroças com 6 sacas cada, e a esteira vazia.",
      mostra: { cada: "6", emUso: "4", sobra: "0" },
    },
    valeSempre: [
      "Divisor vezes quociente dá o dividendo: 4 × 6 = 24.",
      "Dividir por 1 não muda nada; um número dividido por ele mesmo dá 1.",
      "Não se divide por zero: não há entre quem repartir.",
    ],
    cuidado: ["lote-maior-que-cabe", "parou-cedo"],
    nomes: [DIVIDENDO, DIVISOR, QUOCIENTE],
  },
  {
    conceito: "div.medida",
    slug: "quantas-vezes-cabe",
    frase: "Dividir também é medir: quantas vezes um grupo de certo tamanho cabe numa quantidade.",
    escrita: {
      exemplo: "30 ÷ 6 = 5",
      forma: "5 × 6 = 30",
      termos: [
        { valor: "30", nome: "dividendo" },
        { valor: "6", nome: "divisor" },
        { valor: "5", nome: "quociente", marca: true },
      ],
    },
    maquina: {
      config: { pele: SACAS, pecas: { quantidade: 30 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } },
      acoes: [{ tipo: "bicas", abertas: 5 }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      descricao: "Cinco carroças de 6 sacas cada, e a esteira vazia.",
      mostra: { cada: "6", emUso: "5", sobra: "0" },
    },
    valeSempre: [
      "A mesma conta responde duas perguntas: 30 ÷ 6 diz quantos grupos de 6 cabem em 30, e também quanto vai em cada um de 6 grupos.",
      "Quociente vezes divisor dá o dividendo: 5 × 6 = 30.",
    ],
    cuidado: ["lote-maior-que-cabe"],
    nomes: [
      { termo: "Dividendo", significado: "A quantidade toda." },
      { termo: "Divisor", significado: "Aqui, o tamanho de cada grupo." },
      { termo: "Quociente", significado: "Aqui, quantos grupos cabem." },
    ],
  },
  {
    conceito: "div.resto",
    slug: "divisao-com-resto",
    frase: "Repartir igualmente quando a conta não fecha: cada parte recebe o mesmo, e o que não dá mais uma volta inteira fica de resto.",
    escrita: {
      exemplo: "26 ÷ 4 = 6, resto 2",
      forma: "26 = 4 × 6 + 2",
      termos: [
        { valor: "26", nome: "dividendo" },
        { valor: "4", nome: "divisor" },
        { valor: "6", nome: "quociente" },
        { valor: "2", nome: "resto", marca: true },
      ],
    },
    maquina: {
      config: { pele: SACAS, pecas: { quantidade: 26 }, bicas: { quantidade: 4, ajustavel: false } },
      acoes: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      descricao: "Quatro carroças com 6 sacas cada, e 2 sacas na esteira: o resto.",
      mostra: { cada: "6", emUso: "4", sobra: "2" },
    },
    valeSempre: [
      "O resto é sempre menor que o divisor. Com 4 carroças, sobram no máximo 3 sacas.",
      "Dividendo = divisor × quociente + resto.",
    ],
    cuidado: ["parou-cedo", "resto-jogado-fora", "arredondou-para-baixo"],
    nomes: [DIVIDENDO, DIVISOR, QUOCIENTE, { termo: "Resto", significado: "O que sobra quando não dá mais uma volta inteira." }],
  },
  {
    conceito: "fra.parte",
    slug: "fracao-como-parte",
    frase: "Cortar um inteiro em partes iguais dá nome a cada pedaço: em 4 partes, cada uma é 1/4.",
    escrita: {
      exemplo: "4 × 1/4 = 1",
      forma: "3/4 = 3 × 1/4",
      termos: [
        { valor: "1", nome: "numerador" },
        { valor: "4", nome: "denominador" },
        { valor: "1/4", nome: "fração", marca: true },
      ],
    },
    maquina: {
      config: { pele: BROAS, pecas: { quantidade: 1 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: FATIADOR },
      acoes: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 1 }, { tipo: "repartir" }],
      descricao: "Uma broa cortada em 4 pedaços iguais, um em cada mesa.",
      mostra: { cada: "1/4", emUso: "4", sobra: "0" },
    },
    valeSempre: [
      "As partes precisam ser iguais; senão, o pedaço não tem nome de fração.",
      "Quanto mais partes, menor cada pedaço: 1/8 de broa é menos que 1/4.",
      "Juntando todas as partes, o inteiro volta: 4 × 1/4 = 1.",
    ],
    cuidado: ["corte-que-nao-fecha", "conta-pedacos"],
    nomes: [
      { termo: "Fração", significado: "Um número que diz quantos pedaços de um inteiro cortado em partes iguais." },
      { termo: "Denominador", significado: "Embaixo do traço: em quantas partes iguais o inteiro foi cortado." },
      { termo: "Numerador", significado: "Em cima do traço: quantos desses pedaços." },
    ],
  },
  {
    conceito: "fra.quociente",
    slug: "fracao-como-divisao",
    frase: "O traço da fração é uma divisão: 3 broas repartidas entre 4 mesas dão 3/4 de broa para cada.",
    escrita: {
      exemplo: "3 ÷ 4 = 3/4",
      forma: "4 × 3/4 = 3",
      termos: [
        { valor: "3", nome: "dividendo" },
        { valor: "4", nome: "divisor" },
        { valor: "3/4", nome: "quociente", marca: true },
      ],
    },
    maquina: {
      config: { pele: BROAS, pecas: { quantidade: 3 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: FATIADOR },
      acoes: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      descricao: "Três broas cortadas em quartos: cada uma das 4 mesas recebe 3 pedaços de 1/4.",
      mostra: { cada: "3/4", emUso: "4", sobra: "0" },
    },
    valeSempre: [
      "O que se reparte vai em cima; entre quantos, embaixo: 3 ÷ 4 = 3/4.",
      "Quando o de cima é maior, cada um ganha mais de um inteiro: 5 ÷ 4 = 5/4 = 1 1/4.",
      "Divisor vezes a fração dá o dividendo: 4 × 3/4 = 3.",
    ],
    cuidado: ["fracao-invertida"],
    nomes: [
      { termo: "Traço", significado: "O traço da fração também é um sinal de dividir: 3/4 é 3 ÷ 4." },
      { termo: "Número misto", significado: "Inteiros e uma fração juntos: 1 1/4." },
    ],
  },
];

/** Os conceitos sem missão nesta versão, com o arco em que devem chegar. */
export const CONCEITOS_A_LAPIS: readonly ConceitoALapis[] = [
  { conceito: "mul.grupos", arco: "a calibragem mede" },
  { conceito: "fra.equivalencia", arco: "próximo arco" },
  { conceito: "fra.comparacao", arco: "próximo arco" },
  { conceito: "fra.de-quantidade", arco: "próximo arco" },
  { conceito: "raz.razao", arco: "próximo arco" },
  { conceito: "pro.proporcao", arco: "próximo arco" },
  { conceito: "est.plausibilidade", arco: "ainda sem arco" },
];

export const TEXTOS_MANUAL = {
  sobretitulo: "O que o Engenho sabe, passado a limpo",
  titulo: "O Manual",
  explicacao: "Cada página volta a ficar inteira quando você descobre o porquê na máquina. Os nomes dos termos ficam sempre à mão.",
  restaurada: "Restaurada",
  /** A caneta sobre a bandeja do desenho "Na máquina". */
  resto: "resto",
  restaureNa: "Restaure na Missão {n}",
  restauradaNa: "Restaurada na Missão {n}",
  restauraNesta: "Você restaura nesta missão",
  aLapis: "Ainda a lápis: {arco}",
  areaALapis: "{distrito}, ainda a lápis",
  rasgada: "O resto desta página se rasgou. Ele volta quando você descobrir o porquê na máquina.",
  secoes: {
    frase: "Em uma frase",
    escrita: "Como se escreve",
    maquina: "Na máquina",
    valeSempre: "Vale sempre",
    cuidado: "Cuidado com",
    nomes: "Os nomes",
    ondeViu: "Onde você viu",
  },
  voltou: { uma: "Uma página do Manual voltou:", varias: "Páginas do Manual voltaram:" },
  referencia: {
    titulo: "Referência desta missão",
    subtitulo: "Com os nomes de escola",
    ajudam: "Páginas do Manual que ajudam aqui",
    abrirTudo: "Abrir o Manual inteiro",
    fechar: "Fechar a referência",
    voltar: "Voltar à referência",
  },
} as const;
