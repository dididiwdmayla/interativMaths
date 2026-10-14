/**
 * Normalização: transforma qualquer coisa lida do armazenamento num Progresso válido.
 * Campo estranho cai fora; campo faltando volta ao padrão. Nunca lança.
 */
import { ehEvidenciaValida, TETO_EVIDENCIAS, type Evidencia } from "../dominio/evidencias";
import {
  PREFERENCIAS_PADRAO,
  progressoNovo,
  VERSAO_PROGRESSO,
  type CalibragemSalva,
  type Campanha,
  type Desvio,
  type EstadoAtividade,
  type EstadoJoia,
  type EstagioJoia,
  type PaginaCaderno,
  type Palpite,
  type Preferencias,
  type Progresso,
  type RespostaCalibragem,
} from "./tipos";

type Obj = Record<string, unknown>;

export function ehObjeto(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, padrao: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : padrao;
}

function numOuNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function texto(v: unknown, padrao: string): string {
  return typeof v === "string" ? v : padrao;
}

function textoOuNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function lista<T>(v: unknown, item: (x: unknown) => T | null, teto = Infinity): T[] {
  if (!Array.isArray(v)) return [];
  const saida: T[] = [];
  for (const x of v) {
    const r = item(x);
    if (r !== null) saida.push(r);
  }
  return saida.length > teto ? saida.slice(saida.length - teto) : saida;
}

function umDe<T extends string>(v: unknown, opcoes: readonly T[], padrao: T): T {
  return typeof v === "string" && (opcoes as readonly string[]).includes(v) ? (v as T) : padrao;
}

function normalizarPreferencias(v: unknown): Preferencias {
  const o = ehObjeto(v) ? v : {};
  return {
    postura: umDe(o.postura, ["quieto", "disponivel", "presente"] as const, PREFERENCIAS_PADRAO.postura),
    cotas: umDe(o.cotas, ["visiveis", "escondidas"] as const, PREFERENCIAS_PADRAO.cotas),
    animacoes: umDe(o.animacoes, ["completas", "leves"] as const, PREFERENCIAS_PADRAO.animacoes),
    conversa: umDe(o.conversa, ["ligada", "desligada"] as const, PREFERENCIAS_PADRAO.conversa),
    aparencia: umDe(o.aparencia, ["automatico", "claro", "escuro"] as const, PREFERENCIAS_PADRAO.aparencia),
  };
}

function normalizarCalibragem(v: unknown): CalibragemSalva | null {
  if (!ehObjeto(v)) return null;
  const respostas = lista<RespostaCalibragem>(v.respostas, (x) => {
    if (!ehObjeto(x)) return null;
    const degrau = num(x.degrau, -1);
    const resultado = umDe(x.resultado, ["sucesso", "falha", "nao_sei"] as const, "nao_sei");
    return degrau >= 1 && degrau <= 6 ? { degrau, resultado } : null;
  });
  return {
    feitaEm: num(v.feitaEm, 0),
    pulada: v.pulada === true,
    respostas,
    maiorDegrau: Math.max(0, Math.min(6, Math.floor(num(v.maiorDegrau, 0)))),
    provaveis: lista(v.provaveis, (x) => (typeof x === "string" ? x : null)),
    recomendacao: textoOuNull(v.recomendacao),
  };
}

function normalizarAtividade(v: unknown): EstadoAtividade | null {
  if (!ehObjeto(v)) return null;
  const status = umDe(v.status, ["em_andamento", "concluida"] as const, "em_andamento");
  const via = v.via === "guiada" || v.via === "prova" ? v.via : null;
  return {
    status,
    via: status === "concluida" ? (via ?? "guiada") : via,
    iniciadaEm: num(v.iniciadaEm, 0),
    concluidaEm: numOuNull(v.concluidaEm),
    conclusoes: Math.max(0, Math.floor(num(v.conclusoes, status === "concluida" ? 1 : 0))),
  };
}

function registro<T>(v: unknown, item: (x: unknown) => T | null): Record<string, T> {
  const saida: Record<string, T> = {};
  if (!ehObjeto(v)) return saida;
  for (const [k, x] of Object.entries(v)) {
    const r = item(x);
    if (r !== null) saida[k] = r;
  }
  return saida;
}

function normalizarDesvio(v: unknown): Desvio | null {
  if (!ehObjeto(v)) return null;
  const origem = textoOuNull(v.origem);
  const destino = textoOuNull(v.destino);
  if (!origem || !destino) return null;
  return { origem, destino, conceito: texto(v.conceito, ""), criadoEm: num(v.criadoEm, 0) };
}

function normalizarPalpite(v: unknown): Palpite | null {
  if (!ehObjeto(v)) return null;
  const atividade = textoOuNull(v.atividade);
  const passo = textoOuNull(v.passo);
  if (!atividade || !passo) return null;
  return {
    atividade,
    passo,
    valor: textoOuNull(v.valor),
    certo: textoOuNull(v.certo),
    momento: num(v.momento, 0),
  };
}

export const TETO_PALPITES = 300;
export const TETO_CONCLUIDAS = 300;

function normalizarCampanha(v: unknown): Campanha {
  const o = ehObjeto(v) ? v : {};
  return {
    atividades: registro(o.atividades, normalizarAtividade),
    execucoes: registro(o.execucoes, (x) => (ehObjeto(x) ? x : null)),
    desvio: normalizarDesvio(o.desvio),
    concluidas: lista(
      o.concluidas,
      (x) => {
        if (!ehObjeto(x)) return null;
        const atividade = textoOuNull(x.atividade);
        return atividade ? { atividade, momento: num(x.momento, 0) } : null;
      },
      TETO_CONCLUIDAS,
    ),
    marcas: [...new Set(lista(o.marcas, (x) => (typeof x === "string" ? x : null)))],
    palpites: lista(o.palpites, normalizarPalpite, TETO_PALPITES),
  };
}

function normalizarPagina(v: unknown): PaginaCaderno | null {
  if (!ehObjeto(v)) return null;
  const id = textoOuNull(v.id);
  const atividade = textoOuNull(v.atividade);
  if (!id || !atividade) return null;
  return {
    id,
    atividade,
    titulo: texto(v.titulo, ""),
    frase: texto(v.frase, ""),
    notacao: lista(v.notacao, (x) => (typeof x === "string" ? x : null)),
    volta: textoOuNull(v.volta),
    notas: lista(v.notas, (x) => (typeof x === "string" ? x : null)),
    maquina: v.maquina ?? null,
    registradaEm: num(v.registradaEm, 0),
  };
}

function normalizarJoia(v: unknown): EstadoJoia | null {
  if (!ehObjeto(v)) return null;
  const estagio = Math.max(0, Math.min(3, Math.floor(num(v.estagio, 0)))) as EstagioJoia;
  return {
    encontrada: v.encontrada === true,
    encontradaEm: numOuNull(v.encontradaEm),
    estagio,
    treinos: Math.max(0, Math.floor(num(v.treinos, 0))),
    tecnicas: lista(v.tecnicas, (x) => (typeof x === "string" ? x : null)),
  };
}

/** Documento já na versão atual (depois das migrações) → Progresso válido. */
export function normalizar(v: unknown, agora: number): Progresso {
  const base = progressoNovo(agora);
  if (!ehObjeto(v)) return base;
  const evidencias = lista<Evidencia>(v.evidencias, (x) => (ehEvidenciaValida(x) ? x : null), TETO_EVIDENCIAS);
  const ids = new Set<string>();
  const caderno = lista(v.caderno, normalizarPagina).filter((p) => {
    if (ids.has(p.id)) return false;
    ids.add(p.id);
    return true;
  });
  const relogio = ehObjeto(v.relogio) ? v.relogio : {};
  const revisitas = ehObjeto(v.revisitas) ? v.revisitas : {};
  return {
    versao: VERSAO_PROGRESSO,
    criadoEm: num(v.criadoEm, agora),
    atualizadoEm: num(v.atualizadoEm, agora),
    preferencias: normalizarPreferencias(v.preferencias),
    aberturaVista: v.aberturaVista === true,
    calibragem: normalizarCalibragem(v.calibragem),
    campanha: normalizarCampanha(v.campanha),
    evidencias,
    caderno,
    joias: registro(v.joias, normalizarJoia),
    museu: registro(v.museu, (x) => numOuNull(x)),
    cenas: registro(v.cenas, (x) => numOuNull(x)),
    revisitas: {
      geradas: Math.max(0, Math.floor(num(revisitas.geradas, 0))),
      atual: ehObjeto(revisitas.atual)
        ? {
            semente: Math.floor(num(revisitas.atual.semente, 1)),
            conceitos: lista(revisitas.atual.conceitos, (x) => (typeof x === "string" ? x : null)),
          }
        : null,
    },
    relogio: { deslocamentoMs: Math.max(0, num(relogio.deslocamentoMs, 0)) },
    apresentacoes: registro(v.apresentacoes, (x) => numOuNull(x)),
  };
}
