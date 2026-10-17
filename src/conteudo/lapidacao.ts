/**
 * A bancada de lapidação e o soroban: parâmetros do treino e todos os textos. SÓ DADOS.
 * Os marcadores ({d}, {m}, {livres}, {haste}...) o núcleo preenche com os números do momento.
 * Uma sessão de conteúdo pode afinar daqui: veja docs/AUTORIA.md.
 */
import type { ParametrosLapidacao } from "@/nucleo/joias/treino";

/** Os nomes das hastes, pela posição (0 = unidades). A quinta haste fica sem rótulo. */
export const NOMES_POSICAO = [
  { rotulo: "unidade", nome: "Unidade", da: "das unidades" },
  { rotulo: "dezena", nome: "Dezena", da: "das dezenas" },
  { rotulo: "centena", nome: "Centena", da: "das centenas" },
  { rotulo: "milhar", nome: "Milhar", da: "do milhar" },
  { rotulo: "", nome: "Dezena de milhar", da: "da dezena de milhar" },
] as const;

/** O que o leitor de tela ouve do soroban. */
export const LEITOR_SOROBAN = {
  rotulo: "Soroban de cinco hastes",
  mostrando: "mostrando",
  haste: "Haste",
  contaDeCima: "Conta de cima",
  encostada: "encostada",
  afastada: "afastada",
  semContas: "as contas não aparecem",
} as const;

/** O nome de cada marca de lance, na conta escrita e no laboratório. */
export const ROTULOS_MARCA = {
  direto: "direto",
  "complemento-5": "complemento de 5",
  "complemento-10": "complemento de 10",
  juntos: "5 e 10 juntos",
  cadeia: "cadeia",
} as const;

/** Os números do treino. Uma sessão de conteúdo pode afinar (e roda as checagens depois). */
export const PARAMETROS_LAPIDACAO: ParametrosLapidacao = {
  operacoesPorRodada: 6,
  limposParaFirmar: 6,
  rodadasParaFirmar: 2,
  limposPorRodada: 2,
  intervaloHoras: 20,
  intercaladas: 2,
};

/* ---------- A bancada: nomes, níveis, verbos ---------- */

export const TEXTOS_BANCADA = {
  /** O nome formal no cabeçalho (área e conteúdo, nunca ano escolar). */
  lugar: "Joia do Ábaco · Aritmética · Soroban",
  tituloAbertura: "Rodada de lapidação",
  tituloRevisao: "Revisão",
  tituloManutencao: "Manutenção",
  voltar: "Relicário",
  tecnicaNova: "Técnica nova",
  aRodada: "A rodada",
  comecar: "Começar",
  continuar: "Continuar",
  proxima: "Próxima",
  terminar: "Terminar a rodada",
  osPares: "Os pares",
  desfazer: "Desfazer",
  zerar: "Zerar",
  conferir: "Conferir",
  apagar: "Apagar",
  verContas: "Ver contas",
  /** Na sombra, o botão que troca o painel das mãos pelo teclado. */
  dizerQuantoFicou: "Dizer quanto ficou",
  voltarAsMaos: "Voltar às mãos no soroban",
  proximoNumero: "Próximo número",
  verCaminhoCurto: "Ver o caminho curto",
  /** A dica do toque, no painel, enquanto o Nônio acompanha. */
  dicaDoToque: "Toque numa conta: ela e as que estão entre ela e a régua andam juntas.",
  /** A nota à mão na primeira sombra. */
  notaSombra: "as contas estão aí; só não aparecem",
  caixaNumero: "Número",
  caixaFicou: "Ficou",
  caixaQuantoDeu: "Quanto deu?",
  etapas: "Operações da rodada",
  operacaoN: "Operação {n}",
  agora: "agora",
  fecharEtapas: "Fechar a lista",
  antes: "Antes, nesta operação:",
} as const;

/** O verbo da etiqueta da faixa, pelo tipo da operação. */
export const VERBOS_OPERACAO = {
  mostrar: "Mostre",
  ler: "Leia",
  somar: "Some",
  subtrair: "Subtraia",
  ditado: "Some",
  feito: "Feito",
} as const;

/** O nome de cada nível de apoio, no título da rodada ("Complemento de 5 · sem os algarismos"). */
export const NOMES_NIVEL = {
  "com-nonio": "com o Nônio",
  sozinho: "sozinho",
  "sem-algarismos": "sem os algarismos",
  sombra: "na sombra",
  "de-cabeca": "de cabeça",
  ditado: "no ditado",
} as const;

/** A linha do gesto, em caneta: o que fazer agora. */
export const GESTOS_SOROBAN = {
  mostrar: "Agora: mostre {n} no soroban.",
  por: "Agora: ponha {d} na haste {haste}.",
  tirar: "Agora: tire {d} da haste {haste}.",
  ler: "Agora: conte o que encosta e digite o número.",
  sombra: "Agora: mostre {a} e faça a operação, sem ver as contas.",
  sombraFim: "Agora: digite quanto ficou e confira.",
  cabeca: "Agora: faça de cabeça e digite o resultado.",
  ditadoOuvir: "Agora: guarde o total e toque em Próximo número.",
  ditadoFim: "Agora: digite quanto deu.",
  junto: "Siga os números: {lista}.",
  limpo: "Caminho curto: cada conta se mexeu uma vez.",
  vaiEVolta: "Chegou, com vai e volta. O caminho curto está na janelinha.",
  leuCerto: "Contou só o que encosta.",
  imaginadoCerto: "A cabeça guardou as contas.",
  aindaNao: "O caminho curto está no soroban.",
} as const;

/** Os passos do caminho, escritos (o degrau 4 e a haste do exemplo). */
export const PASSOS_SOROBAN = {
  desceCinco: "desce o 5",
  sobeCinco: "sobe o 5",
  poeBaixo: "põe {n} de baixo",
  tiraBaixo: "tira {n} de baixo",
  naHaste: "{texto} na {haste}",
  fica: "fica:",
  aDeCima: "a de cima",
  deBaixo: "{n} de baixo",
} as const;

/**
 * Os passos do caminho junto (degrau 4), com o porquê, um modelo por tipo de passo. Marcadores:
 * {d} o que entra ou sai, {resto} = d − 5, {par} o par do 5, {m} = 10 − d, {x} o algarismo da
 * haste, {vizinha} e {seguinte} os nomes das hastes da esquerda (dezena, centena: até 999, a
 * vizinha nunca passa da centena).
 */
export const PASSOS_JUNTO = {
  titulo: "Os pares",
  degrau: "Me ajuda · 4 de 4",
  do10: "do 10",
  do5: "do 5",
  porBaixo: "Põe {d} embaixo.",
  porCinco: "Põe o 5.",
  porCincoEBaixo: "Põe o 5 e {resto} embaixo.",
  tirarBaixo: "Tira {d} embaixo.",
  tirarCinco: "Tira o 5.",
  tirarCincoEBaixo: "Tira o 5 e {resto} embaixo.",
  cincoPor: "Pôr {d} é pôr 5 e tirar {par}: põe o 5…",
  cincoPorBaixo: "…e tira {par} embaixo.",
  cincoTirar: "Tirar {d} sem {d} embaixo: tira o 5…",
  cincoTirarBaixo: "…e devolve {par} embaixo.",
  dezPor: "Pôr {d} é pôr 10 e tirar {m}: põe 1 na {vizinha}.",
  dezTirar: "Tirar {d} é tirar 10 e devolver {m}: tira 1 da {vizinha}.",
  juntosPor: "Tirar {m} do {x} sem {m} embaixo: tira o 5…",
  juntosPorBaixo: "…e devolve {par} embaixo.",
  juntosTirar: "Pôr {m} sem lugar embaixo: põe o 5…",
  juntosTirarBaixo: "…e tira {par} embaixo.",
  vaiUmNoQuatro: "Pôr 1 no 4 da {vizinha}: põe o 5 e tira 4 embaixo.",
  emprestaUmDoCinco: "Tirar 1 do 5 da {vizinha}: tira o 5 e põe 4 embaixo.",
  vaiUmNoNove: "A {vizinha} está cheia: vira 0 e põe 1 na {seguinte}.",
  emprestaUmDoZero: "A {vizinha} está vazia: vira 9 e tira 1 da {seguinte}.",
} as const;

/** O rascunho a lápis: uma linha por lance fechado, com os movimentos que o jogador fez. */
export const RASCUNHO_SOROBAN = {
  rotulo: "Rascunho",
  mostrou: "Mostrou {n}",
  mostrouVaiEVolta: "Mostrou {n}, com vai e volta",
  linhaHaste: "{haste}: {movimentos}",
  separador: " · ",
} as const;

/* ---------- A abertura ---------- */

/**
 * A ficha de cada técnica na abertura. O exemplo é calculado pelo núcleo (a haste desenhada, a conta
 * do exemplo); aqui só os números dele.
 */
export const ABERTURAS = {
  "soroban.ler": {
    frase: "A conta de cima vale 5; cada conta de baixo vale 1.",
    destaque: "Só conta o que encosta na régua.",
    depois: "No soroban de madeira as contas são da mesma cor; aqui, a que conta fica azul.",
    exemplo: { tipo: "ler", valor: 7 },
    pares: "nenhum",
  },
  "soroban.unidades": {
    frase: "Somar é encostar contas na régua; tirar é afastar.",
    destaque: "Um algarismo por vez, da esquerda para a direita.",
    depois: "",
    exemplo: { tipo: "somar", a: 21, b: 13 },
    pares: "nenhum",
  },
  "soroban.complemento-5": {
    frase: "Quando não cabem as contas de baixo, use a de cima.",
    destaque: "Pôr 4 é pôr 5 e tirar 1.",
    depois: "Tirar 3 sem 3 embaixo é tirar 5 e devolver 2.",
    exemplo: { tipo: "somar", a: 3, b: 4 },
    pares: "cinco",
  },
  "soroban.complemento-10": {
    frase: "Quando a haste não comporta, use a vizinha da esquerda.",
    destaque: "Pôr 7 é pôr 10 e tirar 3.",
    depois: "Tirar 7 sem 7 na haste é tirar 10 e devolver 3.",
    exemplo: { tipo: "somar", a: 8, b: 7 },
    pares: "dez",
  },
  "soroban.juntos": {
    frase: "Às vezes o tirar do 10 não cabe embaixo: entra o 5 na mesma haste.",
    destaque: "Pôr 7 no 6: põe 1 na vizinha, tira o 5, devolve 2.",
    depois: "",
    exemplo: { tipo: "somar", a: 6, b: 7 },
    pares: "os-dois",
  },
  "soroban.imaginado": {
    frase: "Agora o soroban some.",
    destaque: "A mão faz o mesmo caminho; a cabeça guarda as contas.",
    depois: "Primeiro na sombra, depois de cabeça, depois no ditado.",
    exemplo: { tipo: "sombra", valor: 7 },
    pares: "nenhum",
  },
} as const;

/** "A rodada", em três linhas, na abertura da técnica nova. */
export const LINHAS_DA_RODADA = {
  padrao: [
    "Seis operações, sem pressa. As duas primeiras com o Nônio mostrando a haste e o par; as outras, só você.",
    "Vale o caminho curto: cada conta se mexe uma vez só. Desfazer e refazer chega lá, mas não firma.",
    "Os pares ficam no botão Os pares. Olhar não é proibido: só não conta para firmar.",
  ],
  ler: [
    "Seis operações, sem pressa: mostrar e ler, alternadas. As duas primeiras com o Nônio; as outras, só você.",
    "Vale o caminho curto: cada conta se mexe uma vez só. Desfazer e refazer chega lá, mas não firma.",
    "Para ler, conte só o que encosta na régua. Ler certo na primeira é o que firma.",
  ],
  imaginado: [
    "Seis operações, sem pressa. Na sombra, as contas estão aí e só não aparecem.",
    "No fim de cada uma, digite quanto ficou. Uma tentativa; o soroban mostra o caminho depois.",
    "Ver as contas não é proibido: só não conta para firmar.",
  ],
} as const;

/** "A rodada", com o caminho curto em destaque (o trecho que vai em negrito). */
export const DESTAQUE_DA_RODADA = "caminho curto";

/** A abertura curta das outras rodadas: uma linha, pelo nível. */
export const LINHA_DO_NIVEL = {
  "com-nonio": "As duas primeiras com o Nônio dizendo o caminho; as outras, só você.",
  sozinho: "Sem o Nônio dizer o caminho. Os pares continuam no botão.",
  "sem-algarismos": "Agora sem os algarismos embaixo: leia as contas.",
  sombra: "As contas estão aí; só não aparecem. No fim, digite quanto ficou.",
  "de-cabeca": "Sem soroban: faça de cabeça e digite o resultado. Depois o soroban mostra o caminho.",
  ditado: "Os números chegam um por vez, no seu ritmo. No fim, digite o total.",
} as const;

export const LINHA_REVISAO = "As técnicas que faltam firmar, misturadas. Cada uma pede uma rodada de outro dia.";
export const LINHA_MANUTENCAO = "Sombra, de cabeça e ditado, misturados. A joia já está polida: isto só mantém a mão.";

/* ---------- O Nônio na bancada (recados de até 60 caracteres) ---------- */

export const RECADOS_LAPIDACAO = {
  /** Com o Nônio: o caminho antes do gesto. */
  comNonio: {
    direto: "Cabe direto: encoste as contas desta haste.",
    diretoTirar: "Tem o bastante: afaste as contas desta haste.",
    mostrar: "Uma haste por vez, da esquerda para a direita.",
    cincoPor: "Embaixo só cabe {livres}. E a de cima?",
    cincoTirar: "Embaixo só tem {uns}. E a de cima?",
    dezPor: "Esta haste não comporta {d}. E a vizinha?",
    dezTirar: "Esta haste não tem {d}. E a vizinha?",
    juntosPor: "Põe 1 na vizinha. Tirar {m} aqui pede o 5.",
    juntosTirar: "Tira 1 da vizinha. Pôr {m} aqui pede o 5.",
    ler: "Conte só o que encosta na régua.",
  },
  limpo: ["Caminho curto.", "Cada conta se mexeu uma vez."],
  vaiEVolta: "Chegou, com vai e volta.",
  fora: "Este algarismo é da haste {haste}.",
  operacaoLimpa: "Pelo caminho curto.",
  operacaoVaiEVolta: "Chegou lá. O caminho curto está na janelinha.",
  operacaoComAjuda: "Chegou junto. A próxima é sua.",
  lerCerto: "Contou só o que encosta.",
  lerAindaNao: "Ainda não. Conte só o que encosta.",
  sombraBateu: "A cabeça e a mão bateram.",
  sombraOutroCaminho: "O número bateu; a mão foi por outro caminho.",
  imaginadoCerto: "A cabeça guardou as contas.",
  imaginadoAindaNao: "Ainda não. Veja o caminho no soroban.",
  semAlgarismos: "Agora sem os algarismos embaixo.",
  junto: "Juntos. A próxima é sua.",
  /** A fala calma de cada operação (não vira recado; fica na janelinha). */
  operacao: "Um algarismo por vez, da esquerda para a direita.",
  operacaoLer: "Só conta o que encosta na régua.",
  operacaoImaginada: "A mão faz o caminho; a cabeça guarda as contas.",
} as const;

/* ---------- Me ajuda: os degraus 1 a 3 (o 4 é sempre o caminho junto) ---------- */

export const AJUDA_LAPIDACAO = {
  direto: {
    olhar: "Quantas contas precisam encostar aqui?",
    olharTirar: "Quantas contas precisam sair daqui?",
    medir: "{d} é 5 e mais {resto}.",
    medirPequeno: "{d} cabe direto: só as de baixo.",
    caso: "Outro algarismo, direto, numa haste ao lado.",
  },
  cincoPor: {
    olhar: "Quantas contas de baixo estão livres nesta haste?",
    medir: "{d} é 5 menos {par}: o par do {d} no 5 é o {par}.",
    caso: "O mesmo caminho, com outros números:",
  },
  cincoTirar: {
    olhar: "Tem {d} contas de baixo encostadas?",
    medir: "Tirar {d} é tirar 5 e devolver {par}.",
    caso: "O mesmo caminho, com outros números:",
  },
  dezPor: {
    olhar: "Cabe {d} nesta haste sem passar de 9?",
    medir: "{d} é 10 menos {m}: põe 1 na vizinha e tira {m} daqui.",
    caso: "O mesmo caminho, com outros números:",
  },
  dezTirar: {
    olhar: "Tem {d} nesta haste?",
    medir: "Tirar {d} é tirar 10 e devolver {m}: tira 1 da vizinha.",
    caso: "O mesmo caminho, com outros números:",
  },
  juntos: {
    olhar: "Depois do par do 10, cabe tirar {m} aqui embaixo?",
    olharTirar: "Depois do par do 10, cabe pôr {m} aqui embaixo?",
    medir: "Tirar {m} sem {m} embaixo: tira o 5 e devolve {par}.",
    medirTirar: "Pôr {m} sem lugar embaixo: põe o 5 e tira {par}.",
    caso: "O mesmo caminho, com outros números:",
  },
  mostrar: {
    olhar: "Só conta o que encosta na régua.",
    medir: "A de cima vale 5; cada de baixo, 1. Haste por haste.",
    caso: "Uma haste, lida em voz alta:",
  },
  ler: {
    olhar: "Só conta o que encosta na régua.",
    medir: "A de cima vale 5; cada de baixo, 1. Some haste por haste.",
    caso: "Uma haste, lida em voz alta:",
    junto: "Juntos: os algarismos, haste por haste, embaixo.",
  },
  imaginado: {
    olhar: "Pense na haste das unidades: o que encosta agora?",
    medir: "Os pares ajudam: o do 5 e o do 10.",
    caso: "Ver as contas. A operação sai da evidência.",
    casoCabeca: "Ver o soroban. A operação sai da evidência.",
    junto: "Juntos: o caminho curto, no soroban.",
  },
  /** O rótulo do botão em cada degrau. */
  botao: ["Me ajuda", "Mais ajuda", "Mais ajuda", "O caminho junto"],
} as const;

/* ---------- Os pares ---------- */

export const PARES = {
  cinco: { titulo: "Os pares do 5", pares: [[1, 4], [2, 3]] },
  dez: { titulo: "Os pares do 10", pares: [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]] },
  junto: "{a} e {b}",
} as const;

/* ---------- A conta passada a caneta ---------- */

export const CONTA_SOROBAN = {
  rotulo: "A conta, passada a caneta",
  nomes: {
    somar: ["parcela", "parcela", "soma"],
    subtrair: ["minuendo", "subtraendo", "diferença"],
    numero: "número",
    ditado: "total",
  },
  direto: "direto",
  vaiEVolta: "com vai e volta",
  comAjuda: "com ajuda",
  cadeia: "em cadeia",
  deBaixo: "{d} de baixo",
  deCima: "a de cima",
  cincoMais: "5 + {resto}",
} as const;

/* ---------- O fim da rodada ---------- */

export const FIM_RODADA = {
  rodadaFeita: "Rodada feita",
  ficou: "A Joia do Ábaco ficou {estagio}",
  maoMudou: "O que mudou na sua mão:",
  firmes: "Técnicas firmes",
  firmeHoje: "Firme hoje",
  firme: "Firme",
  proximo: "Para ficar {estagio}:",
  verNoRelicario: "Ver no Relicário",
  outraRodada: "Outra rodada",
  andamento: "{tecnica}: {limpos} de {alvoLimpos} lances limpos, {rodadas} de {alvoRodadas} rodadas.",
  esperando: "{tecnica}: falta uma rodada, a partir de amanhã.",
  firmou: "{tecnica}: firme.",
  semMudanca: "Cada rodada deixa a mão mais firme.",
  aMao: "{estagio}!",
  operacoes: "As seis operações",
} as const;

/* ---------- O Relicário vivo (referência 1) ---------- */

export const RELICARIO_VIVO = {
  emLapidacao: "em lapidação",
  polida: "polida",
  encontrada: "encontrada",
  aindaNao: "ainda não encontrada",
  paraFicar: "Para ficar {estagio}:",
  lapidar: "Lapidar",
  sorobanLivre: "Soroban livre",
  rodada: "rodada: {tecnica}",
  continuar: "continuar: {n} de {total}",
  revisao: "revisão",
  manutencao: "manutenção",
  firme: "Firme",
  firmando: "firmando",
  esperando: "esperando",
  faltaUmaRodada: "falta uma rodada, a partir de amanhã",
  bancada: "Bancada de lapidação",
  bancadaAberta: "Aberta para a Joia do Ábaco: rodadas curtas no soroban, um algarismo por vez. As outras joias ganham a bancada quando forem encontradas.",
  explicacao: "Relógios usam rubis como mancais, para o mecanismo girar com menos atrito. As joias daqui são isso: habilidades reais que reduzem o atrito do seu raciocínio.",
} as const;

/* ---------- O soroban livre ---------- */

export const SOROBAN_LIVRE = {
  titulo: "Soroban livre",
  linha: "Mexa à vontade: aqui nada conta.",
  mostrando: "O soroban mostra",
  algarismos: "Mostrar os algarismos",
  zerar: "Zerar",
  osPares: "Os pares",
} as const;
