/**
 * O documento de progresso: um só, versionado, em localStorage. Sem dado pessoal.
 * É um documento único com registro só de acréscimo (evidências), o que deixa viável
 * uma sincronização futura. Nada de conta nem banco agora.
 */
import type { IdConceito } from "../curriculo/curriculo";
import type { Evidencia, ResultadoEvidencia } from "../dominio/evidencias";

export const VERSAO_PROGRESSO = 1;

export type Postura = "quieto" | "disponivel" | "presente";
export type Cotas = "visiveis" | "escondidas";
export type Animacoes = "completas" | "leves";

export interface Preferencias {
  /** quieto: só quando chamado; disponível: oferece depois de duas tentativas travadas; presente: comenta. */
  readonly postura: Postura;
  readonly cotas: Cotas;
  readonly animacoes: Animacoes;
}

export interface RespostaCalibragem {
  readonly degrau: number;
  readonly resultado: ResultadoEvidencia;
}

export interface CalibragemSalva {
  readonly feitaEm: number;
  /** true quando o jogador escolheu começar do começo sem calibrar. */
  readonly pulada: boolean;
  readonly respostas: readonly RespostaCalibragem[];
  /** Maior degrau vencido (0 se nenhum). */
  readonly maiorDegrau: number;
  readonly provaveis: readonly IdConceito[];
  /** Atividade recomendada como ponto de partida. */
  readonly recomendacao: string | null;
}

export type StatusAtividade = "em_andamento" | "concluida";
export type ViaConclusao = "guiada" | "prova";

export interface EstadoAtividade {
  readonly status: StatusAtividade;
  readonly via: ViaConclusao | null;
  readonly iniciadaEm: number;
  readonly concluidaEm: number | null;
  /** Quantas vezes foi concluída. */
  readonly conclusoes: number;
}

export interface Desvio {
  /** Atividade de onde o jogador saiu; a execução dela fica preservada. */
  readonly origem: string;
  readonly destino: string;
  readonly conceito: IdConceito;
  readonly criadoEm: number;
}

export interface Palpite {
  readonly atividade: string;
  readonly passo: string;
  /** null = "não faço ideia". Guardado para a futura Joia da Estimativa. */
  readonly valor: string | null;
  readonly certo: string | null;
  readonly momento: number;
}

export interface Campanha {
  readonly atividades: Readonly<Record<string, EstadoAtividade>>;
  /** Execuções em andamento (passo, estado da máquina, histórico). Validadas pelo motor de missão. */
  readonly execucoes: Readonly<Record<string, unknown>>;
  readonly desvio: Desvio | null;
  /** Ordem das conclusões, para o eco saber quantas atividades vieram depois. */
  readonly concluidas: readonly { readonly atividade: string; readonly momento: number }[];
  /** Marcas de descoberta (ex.: repartiu só com pedaços de numerador 1). */
  readonly marcas: readonly string[];
  readonly palpites: readonly Palpite[];
}

export interface PaginaCaderno {
  readonly id: string;
  readonly atividade: string;
  readonly titulo: string;
  /** A frase como o jogador completou. */
  readonly frase: string;
  /** Linhas de notação ("24 ÷ 4 = 6", "4 × 6 = 24"). */
  readonly notacao: readonly string[];
  /** O caminho de volta: a conta nova que o jogador montou na máquina. */
  readonly volta: string | null;
  /** Ids das notas da Dália na margem (texto vem do conteúdo). */
  readonly notas: readonly string[];
  /** Instantâneo da máquina no estado final, para a miniatura e o "rever na máquina". */
  readonly maquina: unknown;
  readonly registradaEm: number;
}

export type EstagioJoia = 0 | 1 | 2 | 3;

export interface EstadoJoia {
  readonly encontrada: boolean;
  readonly encontradaEm: number | null;
  /** 0 bruta, 1 talhada, 2 lapidada, 3 polida. */
  readonly estagio: EstagioJoia;
  /** Sessões de treino feitas (treino ainda em projeto). */
  readonly treinos: number;
  readonly tecnicas: readonly string[];
}

export interface Progresso {
  readonly versao: typeof VERSAO_PROGRESSO;
  readonly criadoEm: number;
  readonly atualizadoEm: number;
  readonly preferencias: Preferencias;
  readonly aberturaVista: boolean;
  readonly calibragem: CalibragemSalva | null;
  readonly campanha: Campanha;
  readonly evidencias: readonly Evidencia[];
  readonly caderno: readonly PaginaCaderno[];
  readonly joias: Readonly<Record<string, EstadoJoia>>;
  /** Exposições do museu visitadas até o fim (id → momento). */
  readonly museu: Readonly<Record<string, number>>;
  /** Cenas da Rua feitas até o fim (id → momento). */
  readonly cenas: Readonly<Record<string, number>>;
  /** Semente das revisitas: muda a cada revisita gerada, para os números serem novos. */
  readonly revisitas: { readonly geradas: number };
  /** Deslocamento do relógio (o laboratório adianta um dia). */
  readonly relogio: { readonly deslocamentoMs: number };
}

export const PREFERENCIAS_PADRAO: Preferencias = {
  postura: "disponivel",
  cotas: "visiveis",
  animacoes: "completas",
};

export function progressoNovo(agora: number): Progresso {
  return {
    versao: VERSAO_PROGRESSO,
    criadoEm: agora,
    atualizadoEm: agora,
    preferencias: PREFERENCIAS_PADRAO,
    aberturaVista: false,
    calibragem: null,
    campanha: {
      atividades: {},
      execucoes: {},
      desvio: null,
      concluidas: [],
      marcas: [],
      palpites: [],
    },
    evidencias: [],
    caderno: [],
    joias: {},
    museu: {},
    cenas: {},
    revisitas: { geradas: 0 },
    relogio: { deslocamentoMs: 0 },
  };
}
