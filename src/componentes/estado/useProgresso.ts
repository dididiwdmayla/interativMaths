"use client";

import { useSyncExternalStore } from "react";
import { agoraDoJogo, assinarLoja, atualizarProgresso, lerLoja, lerLojaNoServidor } from "./loja";

export function useProgresso() {
  const estado = useSyncExternalStore(assinarLoja, lerLoja, lerLojaNoServidor);
  return {
    ...estado,
    atualizar: atualizarProgresso,
    agora: () => agoraDoJogo(estado.progresso),
  };
}
