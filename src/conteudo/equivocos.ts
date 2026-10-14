/**
 * Equívocos com nome. Cada um tem a fala própria do Nônio, por regra, sem IA: a consequência
 * visível na máquina e, fora da aplicação, uma pergunta que encaminha. Nunca a resposta. SÓ DADOS.
 *
 * Marcadores {x} vêm das medidas do motor e da pele da máquina: {receptor} {receptores} {peca}
 * {pecaPlural} {umaPeca} {osPecas} {osReceptores}, e números por extenso como {totalNome}.
 * `previsao` é a versão para quando a resposta veio antes da máquina (previsão, aposta).
 */
export interface TextoRetorno {
  /** O que a máquina mostra (ou mostraria): a consequência visível. */
  readonly consequencia: string;
  /** Uma pergunta ou o próximo gesto. Sai na aplicação, onde o Nônio só diz a consequência. */
  readonly pergunta: string;
}

export interface Equivoco extends TextoRetorno {
  readonly id: string;
  /** Nome neutro, de mecanismo: nunca um juízo sobre a pessoa. */
  readonly nome: string;
  /** Para onde vai a suspeita quando ele aparece (o pré-requisito, quando for o caso). */
  readonly conceito: string;
  /** Quando a resposta veio antes de a máquina girar. */
  readonly previsao?: TextoRetorno;
}

export const EQUIVOCOS: readonly Equivoco[] = [
  {
    id: "lote-maior-que-cabe",
    nome: "Lote maior que a pilha",
    conceito: "div.partilha",
    consequencia: "Uma volta de {lote} em {abertas} bicas pede {pedido}. Havia {ha}: faltaram {falta}.",
    pergunta: "Que lote cabe na pilha?",
  },
  {
    id: "parou-cedo",
    nome: "Parou antes da hora",
    conceito: "div.partilha",
    consequencia: "Ainda há {sobraNome} na esteira para {bicasNome} {receptores}.",
    pergunta: "Cabe mais uma volta?",
  },
  {
    id: "corte-que-nao-fecha",
    nome: "Corte que não fecha",
    conceito: "fra.parte",
    consequencia: "Em {partes}, saíram {pedacos} pedaços para {bicas} {receptores}, e eles não se repartem por igual nesta máquina.",
    pergunta: "Desfaça o corte e tente outro número de partes.",
  },
  {
    id: "conta-pedacos",
    nome: "Contou pedaços, não tamanho",
    conceito: "fra.parte",
    consequencia: "Contar pedaços não diz quanto de {peca} é.",
    pergunta: "Olhe a altura dos medidores: qual parou mais alto?",
    previsao: {
      consequencia: "Contar pedaços não diz quanto de {peca} é.",
      pergunta: "De que tamanho é cada pedaço?",
    },
  },
  {
    id: "resto-jogado-fora",
    nome: "Resto deixado de lado",
    conceito: "div.resto",
    consequencia: "Ainda há {sobraNome} na esteira, e aqui isso conta.",
    pergunta: "Dá para cortar o que sobrou?",
    previsao: {
      consequencia: "Assim alguma {peca} ficaria de fora.",
      pergunta: "O que as voltas inteiras não levam, para onde vai?",
    },
  },
  {
    id: "arredondou-para-baixo",
    nome: "Carga deixada para trás",
    conceito: "div.resto",
    consequencia: "{sobraNome} ficaram no pátio, e hoje tudo precisa sair.",
    pergunta: "Onde cabe o que ficou?",
  },
  {
    id: "fracao-invertida",
    nome: "Fração de cabeça para baixo",
    conceito: "fra.quociente",
    consequencia: "Assim cada {receptor} ganharia mais de {umaPeca}, e só há {totalNome} para {abertasNome}.",
    pergunta: "Quem vai em cima: {osPecas} ou {osReceptores}?",
  },
];
