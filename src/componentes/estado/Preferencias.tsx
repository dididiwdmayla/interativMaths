"use client";

/**
 * Aplica as preferências que mudam o documento inteiro (animações leves).
 */
import { useEffect } from "react";
import { useProgresso } from "./useProgresso";

export function AplicarPreferencias() {
  const { pronto, progresso } = useProgresso();
  const animacoes = progresso.preferencias.animacoes;
  useEffect(() => {
    if (!pronto) return;
    document.documentElement.dataset.animacoes = animacoes;
  }, [pronto, animacoes]);
  return null;
}
