/**
 * Contrato de conteúdo de uma atividade (missão, prova direta, eco, revisita, exposição, cena).
 * Tudo aqui é DADO: o conteúdo declara, o motor executa.
 */
import type { IdConceito } from "../curriculo/curriculo";
import type { NivelAjuda, TipoEvidencia } from "../dominio/evidencias";
import type { NomeMedida } from "../maquinas/bancada/medidas";
import type { AcaoBancada, ConfigBancada } from "../maquinas/bancada/tipos";
import type { NomeValidadorBancada, Parametros } from "../maquinas/bancada/validadores";

export type Fase =
  | "problema"
  | "palpite"
  | "experimentacao"
  | "descoberta"
  | "formalizacao"
  | "aplicacao"
  | "retencao";

export type Quem = "dalia" | "nonio";

export interface Fala {
  readonly quem: Quem;
  readonly texto: string;
}

/** Parte da máquina para onde o Nônio aponta ou onde ele põe uma cota. */
export type AlvoMaquina = "esteira" | "pilha" | "bicas" | "bandeja" | "fatiador" | `bica:${number}`;

/**
 * Um degrau da escada de dicas. Textos podem ter marcadores com medidas vivas da máquina:
 * {lote} {abertas} {emUso} {pedido} {ha} {falta} {sobra} {cada} {total} {pecas}.
 */
export interface Dica {
  readonly texto: string;
  /** Degrau 1 (olhar): a parte que o Nônio aponta. */
  readonly alvo?: AlvoMaquina;
  /** Degrau 2 (medir): a cota que ele mostra. */
  readonly cota?: { readonly alvo: AlvoMaquina; readonly texto: string };
  /** Degrau 3 (caso parecido): uma máquina pequena, com OUTROS números. Nunca a resposta atual. */
  readonly caso?: { readonly maquina: ConfigBancada; readonly acoes: readonly AcaoBancada[] };
}

/** Olhar, medir, caso parecido. O degrau 4 (resolver junto) vem da resolução do passo. */
export type EscadaDicas = readonly [Dica, Dica, Dica];

export interface EvidenciaDeclarada {
  readonly conceito: IdConceito;
  readonly tipo: TipoEvidencia;
}

export interface Objetivo {
  readonly validador: NomeValidadorBancada;
  readonly params?: Parametros;
}

export type TipoResposta =
  | { readonly tipo: "numero"; readonly minimo: number; readonly maximo: number; readonly unidade?: string }
  | { readonly tipo: "fracao"; readonly maximo: number }
  | { readonly tipo: "opcoes"; readonly opcoes: readonly { readonly id: string; readonly texto: string }[] };

/** Resposta típica que denuncia um equívoco: "4/3" → fracao-invertida. */
export interface RespostaEquivoco {
  readonly resposta: string;
  readonly equivoco: string;
}

/** Máquina de um passo: nova configuração, ou estado montado aplicando ações a ela. */
export interface MaquinaDoPasso {
  readonly config: ConfigBancada;
  readonly acoes?: readonly AcaoBancada[];
}

interface PassoBase {
  readonly id: string;
  readonly fase: Fase;
  /** O pedido atual, que cabe numa linha. */
  readonly pedido: string;
  readonly falas?: readonly Fala[];
  /** Nova máquina. Sem ela, o passo continua a máquina do passo anterior. */
  readonly maquina?: MaquinaDoPasso;
  readonly dicas?: EscadaDicas;
  readonly equivocos?: readonly string[];
  readonly evidencias?: readonly EvidenciaDeclarada[];
  /** Fala depois de vencido o passo. */
  readonly aoConcluir?: readonly Fala[];
  /** Falas extras quando o progresso tem uma marca (ex.: o jogador já chegou a um estilo sozinho). */
  readonly falasSeMarca?: { readonly marca: string; readonly falas: readonly Fala[] };
}

/** Texto de exposição em três faixas rotuladas: a separação é parte do produto. */
export interface FaixasExposicao {
  readonly sabe: readonly string[];
  readonly interpretacao: readonly string[];
  readonly simplificamos: readonly string[];
  readonly fontes: readonly string[];
}

export interface PassoNarrativa extends PassoBase {
  readonly tipo: "narrativa";
  /** A página do manual, rasgada onde falta o porquê. */
  readonly manual?: { readonly titulo: string; readonly linhas: readonly string[] };
  /** Texto da exposição do museu. */
  readonly faixas?: FaixasExposicao;
  readonly botao?: string;
}

export interface PassoPalpite extends PassoBase {
  readonly tipo: "palpite";
  readonly pergunta: string;
  readonly resposta: TipoResposta;
  /** O valor que a máquina vai dar (guardado junto, para a futura Joia da Estimativa). */
  readonly certo: string;
}

export interface PassoOperar extends PassoBase {
  readonly tipo: "operar";
  readonly objetivo: Objetivo;
  /** Ações que resolvem a partir do começo do passo (degrau 4: resolver junto). */
  readonly resolucao: readonly AcaoBancada[];
  /** Outras resoluções (quando o passo pede soluções distintas). */
  readonly alternativas?: readonly (readonly AcaoBancada[])[];
  /** Conta a mostrar (caminho de volta). */
  readonly conta?: string;
  readonly rotuloFechar?: string;
  /** Se a partilha aceita usar só pedaços de numerador 1 sem repetir, guarda esta marca. */
  readonly marcaUnitaria?: string;
  /** false: só a alavanca neste passo (sem pôr e tirar peças à mão). */
  readonly maoLivre?: false;
  /** Convite opcional depois de vencido (ex.: "dá para fazer numa volta só?"). */
  readonly convite?: { readonly texto: string; readonly objetivo: Objetivo; readonly evidencias?: readonly EvidenciaDeclarada[] };
}

export interface PassoPrever extends PassoBase {
  readonly tipo: "prever";
  readonly pergunta: string;
  readonly resposta: TipoResposta;
  /** O que a máquina mede depois de conferir, ou o valor esperado fixo. */
  readonly medida?: NomeMedida;
  readonly esperado?: string;
  readonly aceitaEquivalente?: boolean;
  /** A máquina confere: ações aplicadas à máquina do passo, mostradas uma a uma. */
  readonly demonstracao: readonly AcaoBancada[];
  readonly respostasEquivoco?: readonly RespostaEquivoco[];
  /** Explicação curta mostrada depois que a máquina confere. */
  readonly explicacao?: string;
}

export interface LacunaFrase {
  readonly id: string;
  readonly medida: NomeMedida | "tamanho-do-pedaco" | "partes";
}

export interface PassoFrase extends PassoBase {
  readonly tipo: "frase";
  /** Frase com lacunas {id}: "{a} sacas repartidas entre {b} carroças dão {c} em cada". */
  readonly frase: string;
  readonly lacunas: readonly LacunaFrase[];
  /** Cotas que o jogador pode tocar (as medidas da máquina parada). */
  readonly fichas: readonly LacunaFrase["medida"][];
}

export interface PassoNotacao extends PassoBase {
  readonly tipo: "notacao";
  /** A frase comprime nisto. A primeira linha é a principal. */
  readonly linhas: readonly string[];
}

export interface PassoRegistro extends PassoBase {
  readonly tipo: "registro";
  readonly pagina: {
    readonly id: string;
    readonly titulo: string;
    readonly notacao: readonly string[];
    readonly volta?: string;
    /** Notas da Dália na margem (texto). */
    readonly notas: readonly string[];
    /** Frase fixa, quando o passo não tem frase para completar. */
    readonly frase?: string;
  };
}

export type Passo =
  | PassoNarrativa
  | PassoPalpite
  | PassoOperar
  | PassoPrever
  | PassoFrase
  | PassoNotacao
  | PassoRegistro;

export type TipoPasso = Passo["tipo"];

export type TipoAtividade = "missao" | "eco" | "revisita" | "exposicao" | "cena" | "sondagem";

export type ModoExecucao = "guiada" | "prova" | "registro";

/** Entrada de jogador, para soluções de teste e para a tela. */
export type Entrada =
  | { readonly tipo: "seguir" }
  | { readonly tipo: "maquina"; readonly acao: AcaoBancada }
  | { readonly tipo: "fechar" }
  | { readonly tipo: "responder"; readonly valor: string | null }
  | { readonly tipo: "lacuna"; readonly lacuna: string; readonly valor: string }
  | { readonly tipo: "conferir" }
  | { readonly tipo: "dica" }
  | { readonly tipo: "junto" }
  | { readonly tipo: "convite"; readonly aceitar: boolean };

export interface SolucaoDeTeste {
  readonly nome: string;
  readonly modo: ModoExecucao;
  readonly entradas: readonly Entrada[];
}

export interface Sabotagem {
  readonly nome: string;
  readonly modo: ModoExecucao;
  readonly entradas: readonly Entrada[];
  /** O equívoco que a sabotagem precisa provocar. */
  readonly equivoco: string;
}

export interface Atividade {
  readonly id: string;
  readonly tipo: TipoAtividade;
  readonly distrito: string;
  readonly arco?: string;
  /** Posição no arco (missões). */
  readonly numero?: number;
  readonly titulo: string;
  /** Rótulo curto do que ensina ("dividir repartindo"). */
  readonly ideia: string;
  readonly conceitos: readonly IdConceito[];
  readonly passos: readonly Passo[];
  /** Desafio de aplicação para quem a calibragem liberou. */
  readonly prova?: readonly Passo[];
  /** Ao concluir, encontra esta joia. */
  readonly joia?: string;
  /** Categoria da cena da Rua. */
  readonly categoria?: "aplicacao-direta" | "analogia-conceitual" | "transferencia-com-treino";
  readonly solucoesDeTeste: readonly SolucaoDeTeste[];
  readonly sabotagens: readonly Sabotagem[];
}

export type { NivelAjuda };
