/**
 * O próximo gesto: a próxima ação física, escrita em caneta logo abaixo da instrução, com o ícone
 * da mão. Nunca um valor que é a resposta. SÓ DADOS: o núcleo (`nucleo/missoes/gesto.ts`) escolhe
 * o modelo pelo estado da máquina e preenche os marcadores (os mesmos das falas do Nônio).
 */
import type { TextosGesto } from "@/nucleo/missoes/gesto";

export const GESTOS: TextosGesto = {
  narrativa: "Agora: toque em {botao} quando quiser.",
  palpite: "Agora: escolha um número e toque em Ligar a máquina.",
  palpiteOpcoes: "Agora: toque numa das opções. É só um palpite.",
  operar: {
    inicioComMao: "Agora: ponha {umaPeca} em cada {receptor}, ou use {repartir}.",
    inicioAlavanca: "Agora: escolha o lote e toque em {repartir}.",
    maoUmaEmCada: "Agora: toque numa {peca}, depois numa {receptor}.",
    maoDevolver: "Agora: devolva o que passou na {receptor} {bica}: toque na peça.",
    maisVoltas: "Agora: toque em {repartir}, ou ponha mais uma em cada {receptor}.",
    maisVoltasAlavanca: "Agora: toque em {repartir} de novo.",
    cortar: "Agora: toque na peça que sobrou e escolha em quantas partes cortar.",
    cortarAntes: "Agora: toque numa peça e escolha em quantas partes cortar.",
    cortarPedaco: "Agora: toque no pedaço e escolha em quantas partes cortar.",
    repartirPedacos: "Agora: ponha os pedaços nas {receptores}, ou use {repartir}.",
    fechar: "Agora: feche a partilha.",
    engasgo: "Agora: diminua o lote. A volta pede {pedido}; há {ha}.",
    corteNaoFecha: "Esse corte não fecha. Desfaça e tente outro.",
    abrirBicas: "Agora: toque numa bica para abrir ou fechar; depois reparta.",
    nenhumaAberta: "Agora: abra uma bica, tocando nela.",
    teto: "Agora: abra outra bica para o que ficou na esteira.",
    carga: "Agora: ponha na esteira o primeiro número da conta.",
    bicasDaConta: "Agora: deixe abertas as bicas que a conta pede.",
    desafio: "Agora: escolha o lote e reparta numa volta só.",
    junto: "Agora: siga a barra de fazer junto.",
    tentarDesiguais: "Agora: devolva ou ponha peças até os medidores pararem juntos.",
    tentarSobra: "Agora: reparta o que ainda está na esteira.",
    tentarCorte: "Agora: corte o que sobrou e reparta.",
    tentarCarga: "Agora: abra, feche ou desfaça, e olhe os medidores.",
    tentar: "Agora: mexa na máquina e feche de novo.",
    segundoJeito: "Agora: corte de outro jeito e feche de novo.",
  },
  prever: {
    numero: "Agora: ajuste o número e toque em Conferir.",
    fracao: "Agora: monte a fração com as fichas e toque em Conferir.",
    opcoes: "Agora: escolha a resposta.",
    deNovoNumero: "Agora: mude o número e confira de novo.",
    deNovoFracao: "Agora: troque as fichas e confira de novo.",
    deNovoOpcoes: "Agora: escolha outra resposta.",
    conferindo: "Agora: veja a máquina conferir e toque em Continuar.",
  },
  aposta: {
    tirarProva: "Agora: monte na máquina o que o bilhete diz.",
    responder: "Agora: escolha a resposta e toque em Mostrar ao Nônio.",
    deNovo: "Agora: olhe a máquina e escolha outra resposta.",
    feito: "Agora: toque em Continuar.",
  },
  frase: {
    lacuna: "Agora: leve um número da máquina para a primeira lacuna vazia.",
    conferir: "Agora: toque em Conferir com a máquina.",
    trocar: "Agora: troque a lacuna marcada por outra cota.",
  },
  notacao: "Agora: toque em Comprimir em notação.",
  registro: "Agora: guarde a página no Caderno.",
  vencido: "Agora: toque em Continuar.",
  resumos: {
    prever: "Bateu com a máquina.",
    naoSei: "A máquina mostrou. Não sei ainda também vale.",
    conferiu: "A máquina conferiu e mostrou o que dá.",
    apostaPerdida: "Prova tirada: o Nônio perdeu a aposta.",
    apostaGanha: "Prova tirada: o Nônio tinha razão.",
    frase: "A frase bate com a máquina.",
  },
};
