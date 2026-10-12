/**
 * O que o Nônio diz na faixa, por regra, sem IA. SÓ DADOS: modelos com marcadores que o núcleo
 * (`nucleo/tutor/reacoes.ts`) preenche com as medidas da máquina e os nomes da pele.
 *
 * Voz: uma ideia por balão, até 160 caracteres. Adulto, seco e caloroso. Sem exclamação, sem
 * "parabéns", sem diminutivo, nunca a palavra que julga. Acertou diz o que ficou certo, com os
 * números; ainda não diz a consequência e depois uma pergunta ou o próximo gesto, nunca a resposta.
 *
 * Marcadores da pele: {receptor} {receptores} {peca} {pecaPlural} {umaPeca} {osPecas}
 * {osReceptores} {pedaco} {pedacoPlural} {na} (na/no) {aberta} (aberta/aberto) {corta}.
 * Medidas: {lote} {abertas} {pedido} {ha} {falta} {sobra} {cada} {total} e as do validador;
 * por extenso: {cadaNome} ("uma broa e mais um quarto"), {sobraNome}, {totalNome}, {bicasNome}.
 */
import type { MotivoRecusa } from "@/nucleo/maquinas/bancada/tipos";
import type { MotivoValidacao } from "@/nucleo/maquinas/bancada/validadores";
import type { TextosReacao } from "@/nucleo/tutor/reacoes";
import { EQUIVOCOS, type TextoRetorno } from "./equivocos";

/** Quando a partilha não fecha sem equívoco com nome: consequência e pergunta. */
export const MOTIVOS: Readonly<Record<MotivoValidacao, TextoRetorno>> = {
  ok: { consequencia: "Partilha fechada.", pergunta: "" },
  "nenhuma-bica": { consequencia: "Nenhuma {receptor} recebeu nada ainda.", pergunta: "Por onde a carga sai?" },
  desiguais: { consequencia: "As cargas ficaram diferentes: {quantidades}.", pergunta: "Qual {receptor} está com mais, e qual com menos?" },
  "mesma-contagem-quantidades-diferentes": {
    consequencia: "Mesmo número de pedaços, quantidades diferentes: {quantidades}.",
    pergunta: "Olhe a altura dos medidores.",
  },
  "sobra-da-mais-uma-volta": { consequencia: "Ainda há {sobraNome} na esteira para {bicasNome} {receptores}.", pergunta: "Cabe mais uma volta?" },
  "sobra-pode-ser-cortada": { consequencia: "Ainda há {sobraNome} na esteira, e isso pode ser cortado.", pergunta: "Em quantas partes, para todas ficarem iguais?" },
  "sobra-nao-fecha": { consequencia: "Sobrou {sobra}, e esse pedaço não se reparte mais nesta máquina.", pergunta: "Qual corte dá para desfazer?" },
  "carga-diferente": { consequencia: "Cada {receptor} precisa sair com {esperado}. A {receptor} {bica} está com {carga}.", pergunta: "Abra, feche ou desfaça, e olhe os medidores." },
  "sobra-diferente": { consequencia: "Sobrou {sobraNome} na esteira.", pergunta: "Ainda cabe alguma coisa?" },
  "passou-do-teto": { consequencia: "A {receptor} {bica} leva até {teto} e está com {carga}.", pergunta: "Para onde vai o que passou?" },
  "ficou-carga": { consequencia: "{sobraNome} ficaram no pátio.", pergunta: "Onde cabe o que ficou?" },
  "bicas-demais": { consequencia: "Tudo saiu, mas com {bicas} {receptores}.", pergunta: "Dá para levar com menos?" },
  "pedaco-repetido": { consequencia: "Na {receptor} {bica} há {vezes} pedaços de {pedaco}.", pergunta: "À maneira do escriba, cada tamanho uma vez só. Que corte junta esses?" },
  "pedaco-nao-unitario": { consequencia: "O pedaço {pedaco} tem numerador maior que 1.", pergunta: "O escriba usava só numerador 1. Que corte dá isso?" },
  "solucao-repetida": { consequencia: "Essa partilha é igual a uma que você já fez.", pergunta: "Que outro corte deixa os medidores na mesma altura?" },
  "falta-solucao": { consequencia: "Um jeito pronto: {feitas} de {n}. A máquina recomeçou para o próximo.", pergunta: "" },
  "carga-inicial-diferente": { consequencia: "A conta pede {esperado} na esteira; a máquina tem {carga}.", pergunta: "Quanto vai na esteira?" },
  "bicas-diferentes": { consequencia: "A conta divide por {esperado}; há {bicas} bicas em uso.", pergunta: "Quantas bicas abrir?" },
  "voltas-demais": { consequencia: "Foram {voltas} voltas; o pedido era {maximo}.", pergunta: "Que lote faz tudo de uma vez?" },
  "esteira-vazia": { consequencia: "A esteira esvaziou.", pergunta: "Este passo pedia {esperado} em cada {receptor}. Desfaça e ponha à mão." },
  "composicao-diferente": { consequencia: "A {receptor} {bica} pede {pedido}; está com {tem}.", pergunta: "Que pedaço falta ou sobra ali?" },
};

/** O que a máquina recusa: informação, com ponto vermelho, sem selo. */
export const RECUSAS: Readonly<Record<MotivoRecusa, string>> = {
  "sem-pilha": "Escolha uma pilha na esteira.",
  "pilha-vazia": "A esteira está vazia.",
  "sem-bica-aberta": "Nenhuma bica aberta: nada sai.",
  "limite-voltas": "Nesta encomenda, uma volta só. Recomece para tentar outro lote.",
  "sem-fatiador": "Esta máquina não tem fatiador: estas peças não se cortam.",
  "partes-invalidas": "O fatiador não corta nesse número de partes.",
  "pedaco-pequeno-demais": "Pedaço pequeno demais para o fatiador cortar de novo.",
  "carga-travada": "A carga já foi posta. Recomece para mudar.",
  "bicas-travadas": "Nesta máquina as bicas ficam como estão.",
  fechada: "Partilha fechada. Desfaça ou recomece para mexer.",
  "fora-do-limite": "Esse valor não cabe no seletor.",
  "sem-mao-livre": "Neste passo, só a alavanca: o lote e {repartir}.",
  "bica-fechada": "Essa bica está fechada: nada entra nela.",
  "sem-peca": "Essa peça não está ali.",
  "passou-do-teto": "Essa {receptor} já está no teto.",
};

/** A leitura da máquina, em voz de instrumento, depois de cada evento. */
export const EVENTOS = {
  volta: "Volta: {lotePecas} em cada {receptor} {aberta}.",
  /** Depois de uma volta, sobrou menos que uma volta e há fatiador (a pergunta do corte). */
  voltaCortavel: "Sobrou {sobraNome}. {corta}: em quantas partes, para {osBicasNome} ficarem iguais?",
  fatia: "Cortou {cortadas} em {partes}: {pedacos} pedaços de {novo}.",
  colocou: "{umaPecaTamanho} {na} {receptor} {bica}. Agora tem {cargaBica}.",
  devolveu: "{umaPecaTamanho} de volta à esteira.",
  bicaAberta: "Bica {bica} aberta.",
  bicaFechada: "Bica {bica} fechada.",
  carga: "Na esteira: {quantidade}.",
  /** A primeira volta feita à mão (disponível e presente). */
  primeiraVoltaAMao: "Isso é uma volta. {repartir} faz o mesmo, de uma vez.",
} as const;

/** Comentários a mais, só na postura "presente". Somados ao fim da leitura. */
export const COMENTARIOS = {
  fatia: "Pedaços menores, a mesma {peca}.",
  engasgo: "A pilha é o limite.",
  devolveu: "Desfazer à mão também vale.",
} as const;

/** O resumo do que ficou certo, por validador. Vai para a linha verde e, sem fala própria, para a faixa. */
export const ACERTOS: Readonly<Record<string, string>> = {
  "partilha.fechada": "Fechou: {cadaNome} em cada {receptor}.",
  "partilha.fechada.sobra": "Fechou: {cadaNome} em cada {receptor}, e {sobraNome} na bandeja.",
  "partilha.carga-exata": "Fechou: {bicasNome} {receptores}, com {cadaNome} em cada.",
  "transporte.tudo-saiu": "Tudo saiu em {bicasNome} {receptores}, nenhuma acima do teto.",
  "partilha.solucoes-distintas": "Fechou de dois jeitos: {cadaNome} em cada {receptor}, pedaços diferentes.",
  "partilha.unitarias-distintas": "Fechou à maneira do escriba: {cadaNome} em cada {receptor}.",
  "maquina.mostra-divisao": "A máquina mostra a conta: {cadaNome} em cada {receptor}.",
  "partilha.inteiras-por-bica": "{cadaNome} em cada {receptor}, posta à mão.",
  "partilha.composicao": "As {receptores} estão como a aposta pede.",
};

/** A primeira fala de cada tipo de passo, quando o passo não traz uma fala própria do Nônio. */
export const ABERTURAS: Readonly<Record<string, string>> = {
  narrativa: "Leia com calma. Eu fico aqui embaixo, medindo.",
  palpite: "Um palpite antes de ligar. Não vale ponto: fica guardado para comparar com a máquina.",
  operar: "Eu meço o que a máquina faz. O gesto de agora está escrito lá em cima.",
  prever: "Pense antes de girar. Depois a máquina confere.",
  aposta: "Fiz uma aposta. Mostre na máquina se eu tenho razão.",
  frase: "As cotas da máquina parada têm os números da frase.",
  notacao: "As palavras saem, os números ficam, os sinais aparecem.",
  registro: "Passe a limpo. Esta página fica no Caderno.",
};

/** Na aplicação, o Nônio fica quieto até ser chamado. */
export const ABERTURA_APLICACAO = "Agora é com você. Eu só falo se você chamar.";

/** Previsão e aposta. */
export const RESPOSTAS = {
  naoSei: "Não sei ainda também vale. Olhe a máquina conferir.",
  /** Primeira resposta que não bate, sem equívoco com nome. */
  aindaNao: "Essa resposta não bate com o que a máquina faria.",
  aindaNaoPergunta: "{olhar}",
  /** A máquina conferiu depois da segunda resposta. */
  conferiu: "A máquina conferiu. {explicacao}",
  /** Com {resposta} em cada: quanto as bicas levariam (previsão de carga por bica). */
  produto: "Com {resposta} em cada, {abertas} {receptores} levariam {produto}. Na esteira há {total}.",
} as const;

export const FRASE = {
  acertou: "A frase bate com a máquina. Ela vai para o Caderno.",
  umaLacuna: "Uma lacuna não bate com a máquina.",
  variasLacunas: "{quantas} lacunas não batem com a máquina.",
  pergunta: "Olhe as cotas de novo: qual número mede isso?",
} as const;

export const PALPITE = {
  mosca: "Na mosca.",
  /** Somado ao acerto do passo que revela o palpite. */
  moscaFala: "Seu palpite era esse.",
  distancia: "Seu palpite ficou a {distancia} disso.",
} as const;

export const AJUDA = {
  /** Oferta depois de duas tentativas travadas (disponível) ou uma (presente). */
  oferta: "Travou duas vezes. Quer uma medida?",
  ofertaPresente: "Travou. Quer uma medida?",
  sondagem: "A mesma medida escapou duas vezes, em lugares diferentes. Posso conferir uma coisa? Uma pergunta só, depois você volta.",
  /** Antes do primeiro degrau, na aplicação. */
  aplicacao: "Nesta encomenda eu só meço o que você pedir. Uma coisa por vez.",
  /** Degrau 3: a folha com a máquina pequena. */
  caso: "Com outros números, numa máquina pequena:",
  /** Degrau 4. */
  junto: "Vamos passo a passo. Esta não entra na conta; a próxima parecida entra.",
  semDica: "Aqui não há o que medir. Leia e siga quando quiser.",
} as const;

/** Rótulos dos degraus da escada (olhar, medir, caso parecido, resolver junto). */
export const DEGRAUS = ["Olhar", "Medir", "Caso parecido", "Resolver junto"] as const;

/** Tudo junto, no formato que o núcleo das reações espera. */
export const TEXTOS_REACAO: TextosReacao = {
  equivocos: EQUIVOCOS,
  motivos: MOTIVOS,
  recusas: RECUSAS,
  eventos: EVENTOS,
  comentarios: COMENTARIOS,
  acertos: ACERTOS,
  aberturas: ABERTURAS,
  aberturaAplicacao: ABERTURA_APLICACAO,
  respostas: RESPOSTAS,
  frase: FRASE,
  palpite: PALPITE,
  ajuda: AJUDA,
};
