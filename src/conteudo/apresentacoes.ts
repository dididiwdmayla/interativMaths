/**
 * Apresentações: uma frase do Nônio na primeira vez que o jogador encontra cada ferramenta.
 * SÓ DADOS. Até 160 caracteres, sem exclamação. O "Perguntar" se apresenta dentro da conversa.
 */
export const APRESENTACOES = {
  bolha: {
    texto: "Eu fico aqui no canto. Toque em mim para ajuda ou perguntas.",
    alvo: "[data-bolha-nonio]",
  },
  "mao-livre": {
    texto: "A máquina responde ao toque: toque numa peça e depois num lugar. Tocar numa peça já posta devolve ela à esteira.",
    alvo: ".palco-maquina",
  },
  aposta: {
    texto: "Às vezes eu aposto. Mostre na máquina se tenho razão; quem perde a aposta sou eu, nunca você.",
    alvo: "[data-aposta=bilhete]",
  },
  "menu-corte": {
    texto: "Pão a gente corta. Toque na peça: o menu pergunta em quantas partes iguais. Se ela só ficar escolhida, toque de novo.",
    alvo: ".palco-maquina",
  },
  bicas: {
    texto: "Aqui as bicas abrem e fecham. Cada bica aberta é mais um lugar para repartir.",
    alvo: "[data-seletor=bicas]",
  },
  fichas: {
    texto: "Monte a resposta com as fichas: toque na casa de cima ou de baixo e depois numa ficha. Limpar começa de novo.",
    alvo: "[data-fichas]",
  },
} as const;

export const TEXTO_ENTENDI = "Entendi";
