/**
 * Registro de evidências. O progresso guarda evidências; o estado de cada conceito é CALCULADO.
 * Assim a regra de domínio pode mudar sem migrar o progresso de ninguém.
 */
import type { IdConceito } from "../curriculo/curriculo";

export type TipoEvidencia =
  | "calibragem"
  | "experimento"
  | "descoberta"
  | "aplicacao"
  | "transferencia"
  | "sondagem"
  | "revisita";

export type ResultadoEvidencia = "sucesso" | "falha" | "nao_sei";

/** 0 sem dica; 1 a 4 conforme o degrau mais alto da escada do Nônio. */
export type NivelAjuda = 0 | 1 | 2 | 3 | 4;

export interface Evidencia {
  readonly conceito: IdConceito;
  readonly tipo: TipoEvidencia;
  readonly resultado: ResultadoEvidencia;
  readonly ajuda: NivelAjuda;
  /** Id da missão, cena ou exposição. */
  readonly contexto: string;
  readonly equivoco?: string;
  /** Milissegundos desde a época (relógio do jogo). */
  readonly momento: number;
}

export const TIPOS_EVIDENCIA: readonly TipoEvidencia[] = [
  "calibragem",
  "experimento",
  "descoberta",
  "aplicacao",
  "transferencia",
  "sondagem",
  "revisita",
];

export const RESULTADOS: readonly ResultadoEvidencia[] = ["sucesso", "falha", "nao_sei"];

/** Teto do registro. Ao passar, as mais antigas saem (mantendo as de calibragem). */
export const TETO_EVIDENCIAS = 1500;

export function acrescentarEvidencias(
  registro: readonly Evidencia[],
  novas: readonly Evidencia[],
  teto: number = TETO_EVIDENCIAS,
): Evidencia[] {
  const todas = [...registro, ...novas];
  if (todas.length <= teto) return todas;
  const excesso = todas.length - teto;
  let removidas = 0;
  return todas.filter((e) => {
    if (removidas < excesso && e.tipo !== "calibragem") {
      removidas += 1;
      return false;
    }
    return true;
  });
}

export function ehEvidenciaValida(e: unknown): e is Evidencia {
  if (typeof e !== "object" || e === null) return false;
  const x = e as Record<string, unknown>;
  return (
    typeof x.conceito === "string" &&
    typeof x.tipo === "string" &&
    (TIPOS_EVIDENCIA as readonly string[]).includes(x.tipo) &&
    typeof x.resultado === "string" &&
    (RESULTADOS as readonly string[]).includes(x.resultado) &&
    typeof x.ajuda === "number" &&
    [0, 1, 2, 3, 4].includes(x.ajuda) &&
    typeof x.contexto === "string" &&
    typeof x.momento === "number" &&
    Number.isFinite(x.momento) &&
    (x.equivoco === undefined || typeof x.equivoco === "string")
  );
}
