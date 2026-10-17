/**
 * O treino das joias, genérico: rodada, evidência por técnica, a regra de firmar, o foco e o
 * estágio da joia. Não sabe o que é soroban: cada joia se pluga pelo registro (gerar os itens da
 * rodada, avaliar um item). Puro e determinístico; o tempo entra como número.
 *
 * Uma técnica é firme quando cumpre os três: lances limpos que contam (6), rodadas que contaram
 * (2; uma rodada conta quando teve pelo menos 2 lances limpos dela) e, nas de estágio 2 e 3, um
 * intervalo mínimo (20 horas) entre a primeira e a última rodada que contaram. Antes disso ela está
 * firmando (já apresentada) ou a lápis (ainda não). Quando falta só o intervalo, está esperando.
 * A joia passa a talhada com as de estágio 1 firmes, lapidada com as de 2, polida com as de 3, e o
 * estágio nunca volta.
 */
import type { EstadoJoia, EstagioJoia, ItemFeito, RodadaQueContou, RodadaSalva, TipoRodada, TreinoTecnica } from "../progresso/tipos";
import { TETO_RODADAS_TECNICA } from "../progresso/normalizar";
import type { Joia, TecnicaJoia } from "./contrato";

export interface ParametrosLapidacao {
  readonly operacoesPorRodada: number;
  readonly limposParaFirmar: number;
  readonly rodadasParaFirmar: number;
  /** Uma rodada conta para a técnica quando teve pelo menos isto de lances limpos dela. */
  readonly limposPorRodada: number;
  /** Técnicas de estágio 2 e 3: horas entre a primeira e a última rodada que contaram. */
  readonly intervaloHoras: number;
  readonly intercaladas: number;
}

const HORA_MS = 60 * 60 * 1000;

export type SituacaoTecnica = "firme" | "firmando" | "esperando" | "lapis";

export const TREINO_VAZIO: TreinoTecnica = { limpos: 0, apresentadaEm: null, rodadas: [], firmeEm: null };

export function treinoDe(estado: EstadoJoia, tecnica: string): TreinoTecnica {
  return estado.treino[tecnica] ?? TREINO_VAZIO;
}

/** Já passou o intervalo mínimo desde a primeira rodada que contou? */
function intervaloCumprido(t: TecnicaJoia, treino: TreinoTecnica, p: ParametrosLapidacao, agora: number): boolean {
  if (t.estagio === 1) return true;
  const primeira = treino.rodadas[0];
  return primeira !== undefined && agora - primeira.momento >= p.intervaloHoras * HORA_MS;
}

export function situacaoDaTecnica(t: TecnicaJoia, treino: TreinoTecnica, p: ParametrosLapidacao, agora: number): SituacaoTecnica {
  if (treino.firmeEm !== null) return "firme";
  if (treino.apresentadaEm === null) return "lapis";
  // Falta só o intervalo: os lances já bastam, e uma rodada agora não firmaria.
  if (t.estagio >= 2 && treino.limpos >= p.limposParaFirmar && treino.rodadas.length >= 1 && !intervaloCumprido(t, treino, p, agora)) return "esperando";
  return "firmando";
}

/** O andamento de uma técnica, para as linhas do Relicário e do fim da rodada. */
export interface Andamento {
  readonly situacao: SituacaoTecnica;
  readonly limpos: number;
  readonly limposAlvo: number;
  readonly rodadas: number;
  readonly rodadasAlvo: number;
  /** Quando o intervalo se cumpre (esperando), ou null. */
  readonly liberaEm: number | null;
}

export function andamentoDaTecnica(t: TecnicaJoia, treino: TreinoTecnica, p: ParametrosLapidacao, agora: number): Andamento {
  const situacao = situacaoDaTecnica(t, treino, p, agora);
  const primeira = treino.rodadas[0];
  return {
    situacao,
    limpos: Math.min(treino.limpos, p.limposParaFirmar),
    limposAlvo: p.limposParaFirmar,
    rodadas: Math.min(treino.rodadas.length, p.rodadasParaFirmar),
    rodadasAlvo: p.rodadasParaFirmar,
    liberaEm: situacao === "esperando" && primeira ? primeira.momento + p.intervaloHoras * HORA_MS : null,
  };
}

/** O estágio que as técnicas firmes garantem (0 a 3). */
export function estagioDasTecnicas(joia: Joia, estado: EstadoJoia): EstagioJoia {
  let estagio: EstagioJoia = 0;
  for (const k of [1, 2, 3] as const) {
    const doEstagio = joia.tecnicas.filter((t) => t.estagio <= k);
    if (doEstagio.every((t) => treinoDe(estado, t.id).firmeEm !== null)) estagio = k;
    else break;
  }
  return estagio;
}

export type DecisaoRodada =
  | { readonly tipo: "tecnica"; readonly foco: TecnicaJoia; readonly nova: boolean }
  | { readonly tipo: "revisao"; readonly faltam: readonly TecnicaJoia[] }
  | { readonly tipo: "manutencao" };

/** As técnicas do próximo estágio, em ordem, que ainda não estão firmes. */
export function tecnicasQueFaltam(joia: Joia, estado: EstadoJoia): TecnicaJoia[] {
  for (const k of [1, 2, 3] as const) {
    const faltam = joia.tecnicas.filter((t) => t.estagio === k && treinoDe(estado, t.id).firmeEm === null);
    if (faltam.length > 0) return faltam;
  }
  return [];
}

/**
 * O foco da rodada: a primeira técnica do próximo estágio que não está firme nem esperando. Se
 * todas as que faltam estão esperando, revisão; depois de polida, manutenção.
 */
export function decidirRodada(joia: Joia, estado: EstadoJoia, p: ParametrosLapidacao, agora: number): DecisaoRodada {
  const faltam = tecnicasQueFaltam(joia, estado);
  if (faltam.length === 0) return { tipo: "manutencao" };
  const foco = faltam.find((t) => situacaoDaTecnica(t, treinoDe(estado, t.id), p, agora) !== "esperando");
  if (!foco) return { tipo: "revisao", faltam };
  return { tipo: "tecnica", foco, nova: treinoDe(estado, foco.id).apresentadaEm === null };
}

/** A semente da próxima rodada: muda a cada rodada feita. */
export function sementeDaRodada(estado: EstadoJoia, joia: Joia): number {
  let h = 7919 * (estado.treinos + 1);
  for (const c of joia.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h || 1;
}

/** Começa a rodada (no Começar): a técnica nova fica apresentada e a rodada fica guardada. */
export function iniciarRodada(estado: EstadoJoia, decisao: DecisaoRodada, itens: readonly unknown[], semente: number, agora: number): EstadoJoia {
  let treino = estado.treino;
  if (decisao.tipo === "tecnica" && treinoDe(estado, decisao.foco.id).apresentadaEm === null) {
    treino = { ...treino, [decisao.foco.id]: { ...treinoDe(estado, decisao.foco.id), apresentadaEm: agora } };
  }
  const tipo: TipoRodada = decisao.tipo;
  const rodada: RodadaSalva = {
    semente,
    tipo,
    foco: decisao.tipo === "tecnica" ? decisao.foco.id : null,
    nova: decisao.tipo === "tecnica" && decisao.nova,
    iniciadaEm: agora,
    itens,
    feitos: [],
    aberto: null,
  };
  return { ...estado, treino, rodada };
}

/** Guarda o item em curso (a cada gesto), para voltar no mesmo lance. */
export function guardarAberto(estado: EstadoJoia, aberto: unknown): EstadoJoia {
  if (!estado.rodada) return estado;
  return { ...estado, rodada: { ...estado.rodada, aberto } };
}

/** Um item terminou: a evidência dele entra (lances limpos que contam) e a rodada anda. */
export function registrarItem(estado: EstadoJoia, feito: ItemFeito): EstadoJoia {
  if (!estado.rodada || estado.rodada.feitos.length >= estado.rodada.itens.length) return estado;
  const treino = { ...estado.treino };
  for (const ev of feito.evidencias) {
    if (!ev.conta) continue;
    const t = treino[ev.tecnica] ?? TREINO_VAZIO;
    treino[ev.tecnica] = { ...t, limpos: t.limpos + 1 };
  }
  return { ...estado, treino, rodada: { ...estado.rodada, feitos: [...estado.rodada.feitos, feito], aberto: null } };
}

/** As rodadas que contaram: a primeira fica sempre; das outras, as mais recentes. */
function acrescentarRodada(rodadas: readonly RodadaQueContou[], nova: RodadaQueContou): RodadaQueContou[] {
  const todas = [...rodadas, nova];
  return todas.length > TETO_RODADAS_TECNICA ? [todas[0], ...todas.slice(todas.length - TETO_RODADAS_TECNICA + 1)] : todas;
}

function firma(t: TecnicaJoia, treino: TreinoTecnica, p: ParametrosLapidacao): boolean {
  if (treino.firmeEm !== null || treino.apresentadaEm === null) return false;
  if (treino.limpos < p.limposParaFirmar || treino.rodadas.length < p.rodadasParaFirmar) return false;
  const ultima = treino.rodadas[treino.rodadas.length - 1];
  if (t.fechaCom && !t.fechaCom.includes(ultima.nivel)) return false;
  if (t.estagio === 1) return true;
  return ultima.momento - treino.rodadas[0].momento >= p.intervaloHoras * HORA_MS;
}

/** O que a rodada mudou, para a tela do fim. */
export interface FimDeRodada {
  readonly estado: EstadoJoia;
  readonly feitos: readonly ItemFeito[];
  /** As técnicas que firmaram nesta rodada. */
  readonly firmaram: readonly string[];
  /** As técnicas para as quais esta rodada contou. */
  readonly contaram: readonly string[];
  readonly estagioAntes: EstagioJoia;
  readonly estagioDepois: EstagioJoia;
  readonly tipo: TipoRodada;
  readonly foco: string | null;
}

/** Encerra a rodada: conta as rodadas por técnica, firma o que cumpriu, sobe o estágio (nunca desce). */
export function encerrarRodada(joia: Joia, estado: EstadoJoia, p: ParametrosLapidacao, agora: number): FimDeRodada | null {
  const rodada = estado.rodada;
  if (!rodada || rodada.feitos.length < rodada.itens.length) return null;
  const treino: Record<string, TreinoTecnica> = { ...estado.treino };
  const contaram: string[] = [];
  const firmaram: string[] = [];
  for (const t of joia.tecnicas) {
    const deste = rodada.feitos.filter((f) => f.evidencias.some((e) => e.tecnica === t.id && e.conta));
    const limpos = rodada.feitos.reduce((n, f) => n + f.evidencias.filter((e) => e.tecnica === t.id && e.conta).length, 0);
    const atual = treino[t.id] ?? TREINO_VAZIO;
    if (limpos >= p.limposPorRodada && atual.firmeEm === null) {
      const nivel = deste[deste.length - 1]?.nivel ?? "";
      treino[t.id] = { ...atual, rodadas: acrescentarRodada(atual.rodadas, { momento: agora, nivel }) };
      contaram.push(t.id);
    }
    const depois = treino[t.id] ?? TREINO_VAZIO;
    if (firma(t, depois, p)) {
      treino[t.id] = { ...depois, firmeEm: agora };
      firmaram.push(t.id);
    }
  }
  const tecnicas = [...estado.tecnicas, ...firmaram.filter((id) => !estado.tecnicas.includes(id))];
  const intermediario: EstadoJoia = { ...estado, treino, tecnicas, treinos: estado.treinos + 1, rodada: null };
  const calculado = estagioDasTecnicas(joia, intermediario);
  const estagioDepois = Math.max(estado.estagio, calculado) as EstagioJoia;
  return {
    estado: { ...intermediario, estagio: estagioDepois },
    feitos: rodada.feitos,
    firmaram,
    contaram,
    estagioAntes: estado.estagio,
    estagioDepois,
    tipo: rodada.tipo,
    foco: rodada.foco,
  };
}

/** Quantos lances limpos que contam esta rodada já deu a uma técnica (para o andamento ao vivo). */
export function limposNaRodada(rodada: RodadaSalva | null, tecnica: string): number {
  if (!rodada) return 0;
  return rodada.feitos.reduce((n, f) => n + f.evidencias.filter((e) => e.tecnica === tecnica && e.conta).length, 0);
}
