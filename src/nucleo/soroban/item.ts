/**
 * Um item da rodada em andamento: a operação num nível de apoio, o soroban, os gestos do lance
 * aberto e os lances já fechados. Estado → entrada → novo estado e eventos; a tela só desenha.
 *
 * O jogador mexe como quiser. O lance fecha sozinho na primeira vez que o soroban fica igual ao
 * alvo: limpo quando o custo dos gestos é igual à distância (cada conta andou uma vez só, em
 * qualquer ordem); senão, com vai e volta (o Desfazer conta como movimento). As técnicas do lance
 * vêm do plano: dependem do estado e do algarismo, não do jogador.
 *
 * Modos, pelo tipo e pelo nível: "maos" (mostrar, somar e subtrair vendo as contas), "leitura"
 * (o soroban mostra; o jogador digita), "sombra" (as contas não aparecem; no fim, digita quanto
 * ficou), "cabeca" (sem soroban; digita o resultado) e "ditado" (números um por vez).
 */
import type { ItemFeito, MarcaItem } from "../progresso/tipos";
import { lancesDaOperacao, operacaoValida, resultadoDe, resumoDaOperacao, type LanceDaOperacao, type Operacao } from "./operacao";
import { hastesDoPlano } from "./plano";
import {
  aplicarGesto,
  aplicarMovimento,
  custo,
  distancia,
  HASTES_PADRAO,
  iguais,
  inverso,
  ler,
  sorobanVazio,
  type Gesto,
  type Movimento,
  type Soroban,
  type Uns,
} from "./soroban";
import { TECNICAS_SOROBAN, tecnicasDasMarcas } from "./tecnicas";

export type Nivel = "com-nonio" | "sozinho" | "sem-algarismos" | "sombra" | "de-cabeca" | "ditado";

export const NIVEIS: readonly Nivel[] = ["com-nonio", "sozinho", "sem-algarismos", "sombra", "de-cabeca", "ditado"];

/** O nível com o Nônio dizendo o caminho não conta para firmar. */
export function nivelConta(n: Nivel): boolean {
  return n !== "com-nonio";
}

export interface ItemRodada {
  readonly operacao: Operacao;
  readonly nivel: Nivel;
  /** A técnica que trouxe o item: o foco da rodada, ou a intercalada. */
  readonly tecnica: string;
}

export type ModoItem = "maos" | "leitura" | "sombra" | "cabeca" | "ditado";

export function modoDoItem(item: ItemRodada): ModoItem {
  const t = item.operacao.tipo;
  if (t === "ler") return "leitura";
  if (t === "ditado") return "ditado";
  if (item.nivel === "sombra") return "sombra";
  if (item.nivel === "de-cabeca") return "cabeca";
  return "maos";
}

/** Os gestos do lance aberto (e, na sombra, de toda a operação). */
export interface LanceEmCurso {
  /** Tudo o que andou, gesto a gesto (o Desfazer entra como o movimento inverso). */
  readonly movimentos: readonly Movimento[];
  /** Os gestos que o Desfazer ainda pode desfazer. */
  readonly pilha: readonly Movimento[];
  /** Degrau mais alto do Me ajuda neste lance (0 a 4). */
  readonly ajuda: number;
  /** Os pares foram abertos durante o lance. */
  readonly pares: boolean;
  /** O aviso de gesto fora do lance já foi dado. */
  readonly fora: boolean;
}

export interface LanceFechado {
  readonly limpo: boolean;
  readonly ajuda: number;
  readonly pares: boolean;
  readonly movimentos: readonly Movimento[];
}

export interface Resposta {
  readonly tentativas: number;
  /** A última resposta que não bateu (o "ainda não" da caixa), ou null. */
  readonly ultima: number | null;
  readonly certa: boolean | null;
}

export const VERSAO_ITEM = 1;

export interface EstadoItem {
  readonly versao: typeof VERSAO_ITEM;
  readonly item: ItemRodada;
  readonly hastes: number;
  readonly soroban: Soroban;
  readonly fechados: readonly LanceFechado[];
  readonly aberto: LanceEmCurso;
  readonly resposta: Resposta;
  /** Na sombra: o jogador pediu para ver as contas (a operação sai da evidência). */
  readonly verContas: boolean;
  /** No ditado: quantos números já apareceram. */
  readonly mostrados: number;
  readonly terminado: boolean;
}

export type EntradaItem =
  | { readonly tipo: "gesto"; readonly gesto: Gesto }
  | { readonly tipo: "desfazer" }
  | { readonly tipo: "zerar" }
  | { readonly tipo: "pares" }
  | { readonly tipo: "ajuda" }
  | { readonly tipo: "responder"; readonly valor: number }
  | { readonly tipo: "ver-contas" }
  | { readonly tipo: "proximo-numero" };

export type EventoItem =
  | { readonly tipo: "gesto"; readonly movimento: Movimento }
  | { readonly tipo: "fora"; readonly haste: number }
  | { readonly tipo: "lance-fechou"; readonly indice: number; readonly limpo: boolean }
  | { readonly tipo: "resposta"; readonly certa: boolean }
  | { readonly tipo: "ajuda"; readonly degrau: number }
  | { readonly tipo: "terminou" };

const LANCE_NOVO: LanceEmCurso = { movimentos: [], pilha: [], ajuda: 0, pares: false, fora: false };
const SEM_RESPOSTA: Resposta = { tentativas: 0, ultima: null, certa: null };

/** O soroban com que o item começa: a leitura já mostra o número; o resto começa zerado. */
function sorobanInicial(item: ItemRodada, hastes: number): Soroban {
  if (item.operacao.tipo === "ler") {
    const lances = lancesDaOperacao({ tipo: "mostrar", valor: item.operacao.valor }, hastes);
    return lances[0].plano.alvo;
  }
  return sorobanVazio(hastes);
}

export function iniciarItem(item: ItemRodada, hastes: number = HASTES_PADRAO): EstadoItem {
  return {
    versao: VERSAO_ITEM,
    item,
    hastes,
    soroban: sorobanInicial(item, hastes),
    fechados: [],
    aberto: LANCE_NOVO,
    resposta: SEM_RESPOSTA,
    verContas: false,
    mostrados: item.operacao.tipo === "ditado" ? 1 : 0,
    terminado: false,
  };
}

const CACHE_LANCES = new Map<string, LanceDaOperacao[]>();

/** Os lances da operação (calculados uma vez por operação). */
export function lancesDoItem(e: Pick<EstadoItem, "item" | "hastes">): LanceDaOperacao[] {
  const chave = `${e.hastes}:${JSON.stringify(e.item.operacao)}`;
  let l = CACHE_LANCES.get(chave);
  if (!l) {
    l = lancesDaOperacao(e.item.operacao, e.hastes);
    if (CACHE_LANCES.size > 500) CACHE_LANCES.clear();
    CACHE_LANCES.set(chave, l);
  }
  return l;
}

/** O lance aberto (índice e dados), ou null quando não há lance a fazer. */
export function lanceAtual(e: EstadoItem): { readonly indice: number; readonly lance: LanceDaOperacao } | null {
  if (modoDoItem(e.item) !== "maos" || e.terminado) return null;
  const lances = lancesDoItem(e);
  const i = e.fechados.length;
  return i < lances.length ? { indice: i, lance: lances[i] } : null;
}

function fecharLance(e: EstadoItem, limpo: boolean, eventos: EventoItem[]): EstadoItem {
  const indice = e.fechados.length;
  const fechado: LanceFechado = { limpo, ajuda: e.aberto.ajuda, pares: e.aberto.pares, movimentos: e.aberto.movimentos };
  const fechados = [...e.fechados, fechado];
  eventos.push({ tipo: "lance-fechou", indice, limpo });
  const terminado = fechados.length >= lancesDoItem(e).length;
  if (terminado) eventos.push({ tipo: "terminou" });
  return { ...e, fechados, aberto: LANCE_NOVO, terminado };
}

/** Depois de um movimento: o lance fecha se o soroban chegou ao alvo. */
function conferirLance(e: EstadoItem, eventos: EventoItem[]): EstadoItem {
  const atual = lanceAtual(e);
  if (!atual || !iguais(e.soroban, atual.lance.plano.alvo)) return e;
  const limpo = custo(e.aberto.movimentos) === distancia(atual.lance.inicio, atual.lance.plano.alvo);
  return fecharLance(e, limpo, eventos);
}

function podeMexer(e: EstadoItem): boolean {
  const m = modoDoItem(e.item);
  return !e.terminado && (m === "maos" || m === "sombra");
}

/** Aplica uma entrada. Entrada que não cabe no momento devolve o mesmo estado, sem eventos. */
export function aplicarEntradaItem(e: EstadoItem, entrada: EntradaItem): { readonly estado: EstadoItem; readonly eventos: readonly EventoItem[] } {
  const eventos: EventoItem[] = [];
  const modo = modoDoItem(e.item);
  switch (entrada.tipo) {
    case "gesto": {
      if (!podeMexer(e) || !e.soroban[entrada.gesto.haste]) return { estado: e, eventos };
      const r = aplicarGesto(e.soroban, entrada.gesto);
      eventos.push({ tipo: "gesto", movimento: r.movimento });
      let aberto: LanceEmCurso = { ...e.aberto, movimentos: [...e.aberto.movimentos, r.movimento], pilha: [...e.aberto.pilha, r.movimento] };
      const atual = lanceAtual(e);
      if (atual && !e.aberto.fora && !hastesDoPlano(atual.lance.plano).includes(entrada.gesto.haste)) {
        eventos.push({ tipo: "fora", haste: entrada.gesto.haste });
        aberto = { ...aberto, fora: true };
      }
      return { estado: conferirLance({ ...e, soroban: r.soroban, aberto }, eventos), eventos };
    }
    case "desfazer": {
      if (!podeMexer(e) || e.aberto.pilha.length === 0) return { estado: e, eventos };
      const ultimo = e.aberto.pilha[e.aberto.pilha.length - 1];
      const volta = inverso(ultimo);
      const aberto: LanceEmCurso = { ...e.aberto, movimentos: [...e.aberto.movimentos, volta], pilha: e.aberto.pilha.slice(0, -1) };
      eventos.push({ tipo: "gesto", movimento: volta });
      return { estado: conferirLance({ ...e, soroban: aplicarMovimento(e.soroban, volta), aberto }, eventos), eventos };
    }
    case "zerar": {
      if (!podeMexer(e)) return { estado: e, eventos };
      // A operação recomeça: nada dela conta até ela terminar.
      return { estado: { ...e, soroban: sorobanVazio(e.hastes), fechados: [], aberto: { ...LANCE_NOVO, ajuda: e.aberto.ajuda, pares: e.aberto.pares } }, eventos };
    }
    case "pares": {
      if (e.terminado || e.aberto.pares) return { estado: e, eventos };
      return { estado: { ...e, aberto: { ...e.aberto, pares: true } }, eventos };
    }
    case "ajuda": {
      if (e.terminado || e.aberto.ajuda >= 4) return { estado: e, eventos };
      const degrau = e.aberto.ajuda + 1;
      eventos.push({ tipo: "ajuda", degrau });
      // No soroban imaginado, o degrau 3 mostra as contas (a operação sai da evidência).
      const verContas = e.verContas || (modo === "sombra" && degrau >= 3);
      return { estado: { ...e, verContas, aberto: { ...e.aberto, ajuda: degrau } }, eventos };
    }
    case "ver-contas": {
      if (modo !== "sombra" || e.terminado || e.verContas) return { estado: e, eventos };
      return { estado: { ...e, verContas: true }, eventos };
    }
    case "proximo-numero": {
      if (modo !== "ditado" || e.terminado || e.item.operacao.tipo !== "ditado") return { estado: e, eventos };
      if (e.mostrados >= e.item.operacao.numeros.length) return { estado: e, eventos };
      return { estado: { ...e, mostrados: e.mostrados + 1 }, eventos };
    }
    case "responder": {
      if (e.terminado || modo === "maos" || !Number.isInteger(entrada.valor) || entrada.valor < 0) return { estado: e, eventos };
      if (modo === "ditado" && e.item.operacao.tipo === "ditado" && e.mostrados < e.item.operacao.numeros.length) return { estado: e, eventos };
      const certa = entrada.valor === resultadoDe(e.item.operacao);
      const tentativas = e.resposta.tentativas + 1;
      eventos.push({ tipo: "resposta", certa });
      // Na leitura, tenta de novo até bater; no imaginado, uma tentativa só.
      const terminado = certa || modo !== "leitura";
      if (terminado) eventos.push({ tipo: "terminou" });
      return {
        estado: { ...e, terminado, resposta: { tentativas, ultima: certa ? null : entrada.valor, certa: terminado ? certa : null } },
        eventos,
      };
    }
  }
}

/* ---------- O que o item terminado deixa ---------- */

/** Um lance conta para firmar: limpo, sem ajuda do degrau 2 em diante, sem os pares. */
export function lanceConta(l: LanceFechado, nivel: Nivel): boolean {
  return l.limpo && l.ajuda < 2 && !l.pares && nivelConta(nivel);
}

export function marcaDoItem(e: EstadoItem): MarcaItem {
  const modo = modoDoItem(e.item);
  if (modo === "maos") {
    if (e.fechados.some((l) => l.ajuda >= 2 || l.pares)) return "com-ajuda";
    if (e.fechados.some((l) => !l.limpo)) return "vai-e-volta";
    return "limpo";
  }
  const ajudou = e.aberto.ajuda >= 2 || e.aberto.pares || e.verContas;
  if (modo === "leitura") return ajudou ? "com-ajuda" : e.resposta.tentativas > 1 ? "vai-e-volta" : "limpo";
  if (e.resposta.certa !== true) return "ainda-nao";
  return ajudou ? "com-ajuda" : "limpo";
}

/** A evidência do item, que só entra quando ele termina. */
export function itemFeito(e: EstadoItem): ItemFeito {
  const modo = modoDoItem(e.item);
  const nivel = e.item.nivel;
  const evidencias: { tecnica: string; conta: boolean }[] = [];
  if (modo === "maos") {
    const lances = lancesDoItem(e);
    e.fechados.forEach((l, i) => {
      const ld = lances[i];
      if (!ld) return;
      if (ld.lance.tipo === "mostrar") {
        // Mostrar só é evidência quando é o item inteiro (ler e mostrar).
        if (e.item.operacao.tipo === "mostrar") evidencias.push({ tecnica: TECNICAS_SOROBAN.ler, conta: lanceConta(l, nivel) });
        return;
      }
      for (const t of tecnicasDasMarcas(ld.plano.marcas)) evidencias.push({ tecnica: t, conta: lanceConta(l, nivel) });
    });
  } else {
    const ajudou = e.aberto.ajuda >= 2 || e.aberto.pares || e.verContas;
    const certaNaPrimeira = e.resposta.certa === true && e.resposta.tentativas === 1;
    const tecnica = modo === "leitura" ? TECNICAS_SOROBAN.ler : TECNICAS_SOROBAN.imaginado;
    evidencias.push({ tecnica, conta: certaNaPrimeira && !ajudou && nivelConta(nivel) });
  }
  return { resumo: resumoDaOperacao(e.item.operacao), marca: marcaDoItem(e), nivel, evidencias };
}

/** Na sombra: a mão chegou ao resultado (as contas mostram o número certo)? */
export function maoBateu(e: EstadoItem): boolean {
  return ler(e.soroban) === resultadoDe(e.item.operacao);
}

/* ---------- Restaurar o item salvo ---------- */

function ehNumero(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function lerMovimento(v: unknown): Movimento | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  if (!ehNumero(o.haste) || !ehNumero(o.uns) || (o.cinco !== -1 && o.cinco !== 0 && o.cinco !== 1)) return null;
  return { haste: o.haste, cinco: o.cinco, uns: o.uns };
}

function lerMovimentos(v: unknown): Movimento[] | null {
  if (!Array.isArray(v)) return null;
  const saida: Movimento[] = [];
  for (const x of v) {
    const m = lerMovimento(x);
    if (!m) return null;
    saida.push(m);
  }
  return saida;
}

export function lerOperacao(v: unknown): Operacao | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  let op: Operacao | null = null;
  if ((o.tipo === "mostrar" || o.tipo === "ler") && ehNumero(o.valor)) op = { tipo: o.tipo, valor: o.valor };
  else if ((o.tipo === "somar" || o.tipo === "subtrair") && ehNumero(o.a) && ehNumero(o.b)) op = { tipo: o.tipo, a: o.a, b: o.b };
  else if (o.tipo === "ditado" && Array.isArray(o.numeros) && o.numeros.every(ehNumero)) op = { tipo: "ditado", numeros: o.numeros };
  return op && operacaoValida(op) ? op : null;
}

export function lerItemRodada(v: unknown): ItemRodada | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const operacao = lerOperacao(o.operacao);
  const nivel = NIVEIS.find((n) => n === o.nivel);
  if (!operacao || !nivel || typeof o.tecnica !== "string") return null;
  return { operacao, nivel, tecnica: o.tecnica };
}

function lerSoroban(v: unknown, hastes: number): Soroban | null {
  if (!Array.isArray(v) || v.length !== hastes) return null;
  const saida = [];
  for (const h of v) {
    if (typeof h !== "object" || h === null) return null;
    const x = h as Record<string, unknown>;
    if (typeof x.cinco !== "boolean" || !ehNumero(x.uns) || !Number.isInteger(x.uns) || x.uns < 0 || x.uns > 4) return null;
    saida.push({ cinco: x.cinco, uns: x.uns as Uns });
  }
  return saida;
}

/**
 * O item salvo, conferido: a operação e o nível valem, e o soroban é exatamente o começo do
 * lance aberto mais os gestos guardados (senão, null, e o item recomeça).
 */
export function restaurarItem(v: unknown, esperado: ItemRodada): EstadoItem | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  if (o.versao !== VERSAO_ITEM) return null;
  const item = lerItemRodada(o.item);
  if (!item || JSON.stringify(item) !== JSON.stringify(esperado)) return null;
  const hastes = ehNumero(o.hastes) ? o.hastes : HASTES_PADRAO;
  const soroban = lerSoroban(o.soroban, hastes);
  const aberto = typeof o.aberto === "object" && o.aberto !== null ? (o.aberto as Record<string, unknown>) : null;
  const movimentos = aberto ? lerMovimentos(aberto.movimentos) : null;
  const pilha = aberto ? lerMovimentos(aberto.pilha) : null;
  if (!soroban || !aberto || !movimentos || !pilha || !Array.isArray(o.fechados)) return null;
  const fechados: LanceFechado[] = [];
  for (const f of o.fechados) {
    if (typeof f !== "object" || f === null) return null;
    const x = f as Record<string, unknown>;
    const mv = lerMovimentos(x.movimentos);
    if (!mv || typeof x.limpo !== "boolean" || !ehNumero(x.ajuda)) return null;
    fechados.push({ limpo: x.limpo, ajuda: x.ajuda, pares: x.pares === true, movimentos: mv });
  }
  const resposta = typeof o.resposta === "object" && o.resposta !== null ? (o.resposta as Record<string, unknown>) : {};
  const estado: EstadoItem = {
    versao: VERSAO_ITEM,
    item,
    hastes,
    soroban,
    fechados,
    aberto: {
      movimentos,
      pilha,
      ajuda: ehNumero(aberto.ajuda) ? Math.max(0, Math.min(4, Math.floor(aberto.ajuda))) : 0,
      pares: aberto.pares === true,
      fora: aberto.fora === true,
    },
    resposta: {
      tentativas: ehNumero(resposta.tentativas) ? Math.max(0, Math.floor(resposta.tentativas)) : 0,
      ultima: ehNumero(resposta.ultima) ? resposta.ultima : null,
      certa: typeof resposta.certa === "boolean" ? resposta.certa : null,
    },
    verContas: o.verContas === true,
    mostrados: ehNumero(o.mostrados) ? Math.max(0, Math.floor(o.mostrados)) : 0,
    terminado: o.terminado === true,
  };
  // A conferência: refazer os gestos do lance aberto a partir do começo dele dá o soroban salvo.
  const modo = modoDoItem(item);
  try {
    if (modo === "maos") {
      const lances = lancesDoItem(estado);
      if (fechados.length > lances.length) return null;
      const inicio = fechados.length < lances.length ? lances[fechados.length].inicio : lances[lances.length - 1].plano.alvo;
      if (!iguais(movimentos.reduce(aplicarMovimento, inicio), soroban)) return null;
      if (estado.terminado !== (fechados.length === lances.length)) return null;
    } else if (modo === "sombra") {
      if (!iguais(movimentos.reduce(aplicarMovimento, sorobanVazio(hastes)), soroban)) return null;
    } else if (!iguais(soroban, sorobanInicial(item, hastes))) return null;
  } catch {
    return null;
  }
  return estado;
}
