/**
 * Equívocos com nome. Cada um tem resposta própria, por regra, sem IA: a consequência visível
 * na máquina mais uma medida. SÓ DADOS. Marcadores {x} vêm das medidas do motor.
 */
export interface Equivoco {
  readonly id: string;
  /** Nome neutro, de mecanismo: nunca um juízo sobre a pessoa. */
  readonly nome: string;
  /** Para onde vai a suspeita quando ele aparece (o pré-requisito, quando for o caso). */
  readonly conceito: string;
  /** O que o Nônio diz: a medida que explica a consequência. */
  readonly resposta: string;
}

export const EQUIVOCOS: readonly Equivoco[] = [
  {
    id: "lote-maior-que-cabe",
    nome: "Lote maior que a pilha",
    conceito: "div.partilha",
    resposta: "Uma volta de {lote} em {abertas} bicas pede {pedido}. Havia {ha}: faltaram {falta}.",
  },
  {
    id: "parou-cedo",
    nome: "Parou antes da hora",
    conceito: "div.partilha",
    resposta: "Ainda há {pecasSobra} na esteira para {bicas} bicas: cabe mais uma volta.",
  },
  {
    id: "corte-que-nao-fecha",
    nome: "Corte que não fecha",
    conceito: "fra.parte",
    resposta: "Esse corte não se reparte entre {bicas}: o pedaço não divide de novo nesta máquina. Desfaça o corte e tente outro número de partes.",
  },
  {
    id: "conta-pedacos",
    nome: "Contou pedaços, não tamanho",
    conceito: "fra.parte",
    resposta: "Mesmo número de pedaços não é mesma quantidade. Olhe os medidores: a altura é o que conta.",
  },
  {
    id: "resto-jogado-fora",
    nome: "Resto deixado de lado",
    conceito: "div.resto",
    resposta: "Ainda há {sobra} na esteira, e aqui isso conta. Pão pode ser cortado: ninguém fica sem a parte dele.",
  },
  {
    id: "arredondou-para-baixo",
    nome: "Carga deixada para trás",
    conceito: "div.resto",
    resposta: "{sobra} ficaram no pátio. Hoje tudo precisa sair: falta carroça.",
  },
  {
    id: "fracao-invertida",
    nome: "Fração de cabeça para baixo",
    conceito: "fra.quociente",
    resposta: "{resposta} daria mais de uma broa inteira para cada mesa. A máquina deu {certa}: em cima o que se reparte, embaixo entre quantos.",
  },
];

/**
 * O que a máquina diz quando a partilha não fecha sem equívoco nomeado.
 * {receptor} e {receptores} vêm da pele.
 */
export const MOTIVOS: Readonly<Record<string, string>> = {
  ok: "Partilha fechada.",
  "nenhuma-bica": "Nenhuma bica em uso: nada foi repartido.",
  desiguais: "As cargas não estão iguais: {quantidades}.",
  "mesma-contagem-quantidades-diferentes": "Mesmo número de pedaços, quantidades diferentes: {quantidades}.",
  "sobra-da-mais-uma-volta": "Ainda cabe mais uma volta.",
  "sobra-pode-ser-cortada": "Ainda há {sobra} na esteira, e isso pode ser cortado.",
  "sobra-nao-fecha": "Sobrou {sobra}, e esse pedaço não se reparte mais nesta máquina. Desfaça um corte.",
  "carga-diferente": "Cada {receptor} precisa sair com {esperado}. A bica {bica} está com {carga}.",
  "sobra-diferente": "Sobraram {sobra} na esteira.",
  "passou-do-teto": "A bica {bica} leva até {teto} e está com {carga}.",
  "ficou-carga": "{sobra} ficaram no pátio.",
  "bicas-demais": "Tudo saiu, mas com {bicas} {receptores}. Dá para levar com {minimo}.",
  "pedaco-repetido": "No {receptor} {bica} há {vezes} pedaços de {pedaco}. À maneira do escriba, cada tamanho aparece uma vez só.",
  "pedaco-nao-unitario": "O pedaço {pedaco} tem numerador maior que 1. O escriba usava só pedaços de numerador 1.",
  "solucao-repetida": "Essa partilha é igual a uma que você já fez. Procure outro jeito de cortar.",
  "falta-solucao": "Um jeito pronto ({feitas} de {n}). A máquina recomeçou para o próximo.",
  "carga-inicial-diferente": "A conta pede {esperado} na esteira; a máquina tem {carga}.",
  "bicas-diferentes": "A conta divide por {esperado}; há {bicas} bicas em uso.",
  "voltas-demais": "Foram {voltas} voltas; o pedido era {maximo}.",
};
