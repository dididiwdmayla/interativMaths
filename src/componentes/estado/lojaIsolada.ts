"use client";

/**
 * Uma loja de progresso à parte, para a degustação: não lê nem grava o progresso do jogo, então
 * jogar a ilhota não muda nada no Engenho de ninguém. Guarda o que der numa chave própria; se o
 * navegador não deixar (modo privado, armazenamento bloqueado dentro de um iframe), segue só na
 * memória, sem aviso e sem erro.
 */
import { CHAVE_PROGRESSO, CHAVE_RESERVA, carregarProgresso, progressoNovo, salvarProgresso, type Armazenamento, type Progresso } from "@/nucleo/progresso";
import { agoraDoJogo, type EstadoLoja } from "./loja";
import type { FonteProgresso } from "./useProgresso";

/** Troca as chaves do jogo pelas da loja à parte. */
function armazenamentoProprio(prefixo: string): Armazenamento | null {
  const chave = (c: string) => (c === CHAVE_PROGRESSO ? prefixo : c === CHAVE_RESERVA ? `${prefixo}:ilegivel` : `${prefixo}:${c}`);
  try {
    const ls = window.localStorage;
    return {
      ler: (c) => ls.getItem(chave(c)),
      gravar: (c, v) => ls.setItem(chave(c), v),
      apagar: (c) => ls.removeItem(chave(c)),
    };
  } catch {
    return null;
  }
}

export function criarLojaIsolada(prefixo: string): FonteProgresso {
  const servidor: EstadoLoja = { pronto: false, progresso: progressoNovo(0), aviso: null };
  let atual: EstadoLoja | null = null;
  const ouvintes = new Set<() => void>();

  const ler = (): EstadoLoja => {
    if (atual === null) {
      const c = carregarProgresso(armazenamentoProprio(prefixo), Date.now());
      atual = { pronto: true, progresso: c.progresso, aviso: null };
    }
    return atual;
  };

  return {
    assinar: (f) => {
      ouvintes.add(f);
      return () => {
        ouvintes.delete(f);
      };
    },
    ler,
    lerNoServidor: () => servidor,
    atualizar: (f: (p: Progresso, agora: number) => Progresso) => {
      const a = ler();
      const novo = f(a.progresso, agoraDoJogo(a.progresso));
      if (novo === a.progresso) return;
      salvarProgresso(armazenamentoProprio(prefixo), novo);
      atual = { ...a, progresso: novo };
      for (const o of ouvintes) o();
    },
  };
}
