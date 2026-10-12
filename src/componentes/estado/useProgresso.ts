"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import type { Progresso } from "@/nucleo/progresso";
import { agoraDoJogo, assinarLoja, atualizarProgresso, lerLoja, lerLojaNoServidor, type EstadoLoja } from "./loja";

/** De onde as telas leem o progresso. Por padrão, a loja do jogo; a degustação usa uma loja à parte. */
export interface FonteProgresso {
  readonly assinar: (f: () => void) => () => void;
  readonly ler: () => EstadoLoja;
  readonly lerNoServidor: () => EstadoLoja;
  readonly atualizar: (f: (p: Progresso, agora: number) => Progresso) => void;
}

const LOJA_DO_JOGO: FonteProgresso = {
  assinar: assinarLoja,
  ler: lerLoja,
  lerNoServidor: lerLojaNoServidor,
  atualizar: atualizarProgresso,
};

export const ContextoProgresso = createContext<FonteProgresso>(LOJA_DO_JOGO);

export function useProgresso() {
  const fonte = useContext(ContextoProgresso);
  const estado = useSyncExternalStore(fonte.assinar, fonte.ler, fonte.lerNoServidor);
  return {
    ...estado,
    atualizar: fonte.atualizar,
    agora: () => agoraDoJogo(estado.progresso),
  };
}
