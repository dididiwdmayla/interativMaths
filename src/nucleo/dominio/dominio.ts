/**
 * Modelo de domínio v1: evidências + relógio → estado de cada conceito. Função pura.
 * Constantes num só lugar (MODELO_DOMINIO). A interface nunca mostra estes nomes como rótulo de pessoa.
 */
import type { IdConceito } from "../curriculo/curriculo";
import type { Evidencia, TipoEvidencia } from "./evidencias";

export type EstadoConceito =
  | "nao_avaliado"
  | "em_aprendizagem"
  | "dominado"
  | "consolidado"
  | "pede_ajuste";

const HORA = 60 * 60 * 1000;

export const MODELO_DOMINIO = {
  versao: 1,
  /** Sucesso com ajuda até este degrau conta para domínio. */
  ajudaMaximaValida: 1,
  /** Sucessos válidos, em contextos diferentes, para dominar. */
  contextosParaDominar: 2,
  /** Ao menos um dos sucessos tem de ser de um destes tipos. */
  tiposFortes: ["aplicacao", "transferencia", "revisita"] as readonly TipoEvidencia[],
  /** Tipos que nunca contam como sucesso de domínio. */
  tiposQueNaoContam: ["calibragem", "sondagem"] as readonly TipoEvidencia[],
  /** Falhas com o mesmo equívoco, em contextos diferentes, que disparam sondagem. */
  falhasParaSondagem: 2,
  /** Sucessos novos para sair de "pede ajuste". */
  sucessosParaSairDoAjuste: 2,
  /** Espera mínima entre o primeiro sucesso e a revisita. */
  esperaRevisitaMs: 20 * HORA,
} as const;

export interface SituacaoConceito {
  readonly conceito: IdConceito;
  readonly estado: EstadoConceito;
  /** Calibragem indicou que o jogador provavelmente já sabe: abre a prova direta. */
  readonly provavel: boolean;
  /** Duas falhas com o mesmo equívoco esperam uma sondagem. */
  readonly sondagemPendente: { readonly equivoco: string } | null;
  readonly sucessosValidos: number;
  readonly contextosComSucesso: number;
  readonly falhas: number;
  readonly primeiroSucessoEm: number | null;
  /** Quando a revisita fica disponível; null se não há revisita a fazer. */
  readonly revisitaEm: number | null;
}

export function ehSucessoValido(e: Evidencia): boolean {
  return (
    e.resultado === "sucesso" &&
    e.ajuda <= MODELO_DOMINIO.ajudaMaximaValida &&
    !MODELO_DOMINIO.tiposQueNaoContam.includes(e.tipo)
  );
}

function ehForte(e: Evidencia): boolean {
  return MODELO_DOMINIO.tiposFortes.includes(e.tipo);
}

/** Dois sucessos válidos em contextos diferentes, ao menos um deles forte. */
export function cumpreDominio(sucessos: readonly Evidencia[]): boolean {
  for (let i = 0; i < sucessos.length; i++) {
    for (let j = i + 1; j < sucessos.length; j++) {
      const a = sucessos[i];
      const b = sucessos[j];
      if (a.contexto !== b.contexto && (ehForte(a) || ehForte(b))) return true;
    }
  }
  return false;
}

interface Varredura {
  ajuste: boolean;
  sucessosDesdeAjuste: number;
  falhasPorEquivoco: Map<string, Set<string>>;
  sondagemPendente: string | null;
}

/** Percorre as evidências em ordem e decide ajuste e sondagem. Um erro sozinho nunca muda estado. */
function varrer(evs: readonly Evidencia[]): Varredura {
  const v: Varredura = {
    ajuste: false,
    sucessosDesdeAjuste: 0,
    falhasPorEquivoco: new Map(),
    sondagemPendente: null,
  };
  for (const e of evs) {
    if (e.tipo === "sondagem") {
      if (e.resultado === "sucesso") {
        v.falhasPorEquivoco.clear();
        v.sondagemPendente = null;
      } else {
        v.ajuste = true;
        v.sucessosDesdeAjuste = 0;
        v.falhasPorEquivoco.clear();
        v.sondagemPendente = null;
      }
      continue;
    }
    if (ehSucessoValido(e)) {
      if (v.ajuste) {
        v.sucessosDesdeAjuste += 1;
        if (v.sucessosDesdeAjuste >= MODELO_DOMINIO.sucessosParaSairDoAjuste) {
          v.ajuste = false;
          v.sucessosDesdeAjuste = 0;
        }
      }
      continue;
    }
    if (e.resultado === "falha" && e.equivoco && !v.ajuste) {
      const contextos = v.falhasPorEquivoco.get(e.equivoco) ?? new Set<string>();
      contextos.add(e.contexto);
      v.falhasPorEquivoco.set(e.equivoco, contextos);
      if (contextos.size >= MODELO_DOMINIO.falhasParaSondagem) v.sondagemPendente = e.equivoco;
    }
  }
  return v;
}

function ordenar(evs: readonly Evidencia[]): Evidencia[] {
  return [...evs].sort((a, b) => a.momento - b.momento);
}

export function situacaoConceito(
  conceito: IdConceito,
  evidencias: readonly Evidencia[],
  _agora: number,
  provaveis: readonly IdConceito[] = [],
): SituacaoConceito {
  const evs = ordenar(evidencias.filter((e) => e.conceito === conceito));
  const sucessos = evs.filter(ehSucessoValido);
  const contextos = new Set(sucessos.map((e) => e.contexto));
  const falhas = evs.filter((e) => e.resultado === "falha").length;
  const provavel =
    provaveis.includes(conceito) ||
    evs.some((e) => e.tipo === "calibragem" && e.resultado === "sucesso");

  const v = varrer(evs);
  const dominado = cumpreDominio(sucessos);
  const revisitaOk = sucessos.some((e) => e.tipo === "revisita");

  let estado: EstadoConceito;
  if (evs.length === 0) estado = "nao_avaliado";
  else if (v.ajuste) estado = "pede_ajuste";
  else if (dominado && revisitaOk) estado = "consolidado";
  else if (dominado) estado = "dominado";
  else estado = "em_aprendizagem";

  const primeiroSucessoEm = sucessos.length > 0 ? sucessos[0].momento : null;
  const revisitas = evs.filter((e) => e.tipo === "revisita");
  let revisitaEm: number | null = null;
  if (primeiroSucessoEm !== null && !revisitaOk) {
    const ultima = revisitas[revisitas.length - 1];
    const base = ultima ? ultima.momento : primeiroSucessoEm;
    revisitaEm = base + MODELO_DOMINIO.esperaRevisitaMs;
  }

  return {
    conceito,
    estado,
    provavel,
    sondagemPendente: v.ajuste || !v.sondagemPendente ? null : { equivoco: v.sondagemPendente },
    sucessosValidos: sucessos.length,
    contextosComSucesso: contextos.size,
    falhas,
    primeiroSucessoEm,
    revisitaEm,
  };
}

export function situacaoDeTodos(
  conceitos: readonly IdConceito[],
  evidencias: readonly Evidencia[],
  agora: number,
  provaveis: readonly IdConceito[] = [],
): Record<IdConceito, SituacaoConceito> {
  const saida: Record<IdConceito, SituacaoConceito> = {};
  for (const c of conceitos) saida[c] = situacaoConceito(c, evidencias, agora, provaveis);
  return saida;
}

/** Conceitos com revisita disponível agora, da mais antiga para a mais nova. */
export function revisitasDevidas(
  conceitos: readonly IdConceito[],
  evidencias: readonly Evidencia[],
  agora: number,
): { conceito: IdConceito; desde: number }[] {
  return conceitos
    .map((c) => situacaoConceito(c, evidencias, agora))
    .filter((s) => s.revisitaEm !== null && s.revisitaEm <= agora)
    .map((s) => ({ conceito: s.conceito, desde: s.revisitaEm as number }))
    .sort((a, b) => a.desde - b.desde);
}

/** A próxima revisita que vai abrir (para o laboratório mostrar). */
export function proximaRevisita(
  conceitos: readonly IdConceito[],
  evidencias: readonly Evidencia[],
  agora: number,
): number | null {
  const futuras = conceitos
    .map((c) => situacaoConceito(c, evidencias, agora).revisitaEm)
    .filter((t): t is number => t !== null && t > agora);
  return futuras.length > 0 ? Math.min(...futuras) : null;
}
