"use client";

/**
 * Loja do progresso no navegador. Um documento só em localStorage, lido na primeira leitura do
 * cliente (depois da montagem): no servidor e na hidratação o estado é "carregando", então o
 * servidor e o navegador nunca discordam na primeira pintura.
 */
import {
  carregarProgresso,
  progressoNovo,
  relogioDoJogo,
  salvarProgresso,
  type Armazenamento,
  type AvisoCarga,
  type Progresso,
} from "@/nucleo/progresso";

export interface EstadoLoja {
  readonly pronto: boolean;
  readonly progresso: Progresso;
  readonly aviso: AvisoCarga;
}

const SERVIDOR: EstadoLoja = { pronto: false, progresso: progressoNovo(0), aviso: null };

let atual: EstadoLoja | null = null;
const ouvintes = new Set<() => void>();

function armazenamentoNavegador(): Armazenamento | null {
  try {
    const ls = window.localStorage;
    return {
      ler: (c) => ls.getItem(c),
      gravar: (c, v) => ls.setItem(c, v),
      apagar: (c) => ls.removeItem(c),
    };
  } catch {
    return null;
  }
}

function carregar(): EstadoLoja {
  if (atual === null) {
    const c = carregarProgresso(armazenamentoNavegador(), Date.now());
    atual = { pronto: true, progresso: c.progresso, aviso: c.aviso };
  }
  return atual;
}

export function lerLoja(): EstadoLoja {
  return carregar();
}

export function lerLojaNoServidor(): EstadoLoja {
  return SERVIDOR;
}

export function assinarLoja(f: () => void): () => void {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

export function agoraDoJogo(p: Progresso): number {
  return relogioDoJogo(p.relogio.deslocamentoMs).agora();
}

/** Aplica uma mudança pura ao progresso, grava e avisa quem escuta. */
export function atualizarProgresso(f: (p: Progresso, agora: number) => Progresso): void {
  const a = carregar();
  const novo = f(a.progresso, agoraDoJogo(a.progresso));
  if (novo === a.progresso) return;
  const salvo = salvarProgresso(armazenamentoNavegador(), novo);
  atual = { ...a, progresso: novo, aviso: salvo ? a.aviso : "sem-armazenamento" };
  for (const o of ouvintes) o();
}

/** O jogador leu o aviso. */
export function dispensarAviso(): void {
  const a = carregar();
  if (a.aviso === null) return;
  atual = { ...a, aviso: null };
  for (const o of ouvintes) o();
}

/** Troca o progresso inteiro (laboratório, apagar). */
export function substituirProgresso(p: Progresso): void {
  const a = carregar();
  atual = { ...a, progresso: p, aviso: null };
  salvarProgresso(armazenamentoNavegador(), p);
  for (const o of ouvintes) o();
}
