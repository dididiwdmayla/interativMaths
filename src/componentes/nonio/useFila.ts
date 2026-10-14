"use client";

/**
 * A fila de falas da faixa, viva na tela. O tempo é o relógio do jogo (o do progresso), para os
 * testes poderem adiantá-lo; o núcleo decide o que entra, aqui só se marca o relógio.
 */
import { useCallback, useEffect, useState } from "react";
import { atualizarFila, filaVazia, oferecer, proximaMudanca, type FalaFaixa, type FilaFalas } from "@/nucleo/tutor/fila";
import type { Postura } from "@/nucleo/progresso/tipos";
import { agoraDoJogo, lerLoja } from "@/componentes/estado/loja";

function agora(): number {
  return agoraDoJogo(lerLoja().progresso);
}

export function useFilaNonio(postura: Postura): { fila: FilaFalas; oferecerFala: (f: FalaFaixa) => void } {
  const [fila, setFila] = useState<FilaFalas>(filaVazia);
  useEffect(() => {
    const quando = proximaMudanca(fila);
    if (quando === null) return;
    const t = setTimeout(() => setFila((f) => atualizarFila(f, agora())), Math.max(0, quando - agora()) + 20);
    return () => clearTimeout(t);
  }, [fila]);
  const oferecerFala = useCallback((f: FalaFaixa) => setFila((atual) => oferecer(atual, f, agora(), postura)), [postura]);
  return { fila, oferecerFala };
}

/**
 * Oferece uma fala automática quando a faixa fica calma: depois do mínimo na tela e de mais um
 * respiro. Se outra fala entrar antes, o relógio recomeça.
 */
export function useFalaQuandoCalmo(fala: FalaFaixa | null, fila: FilaFalas, oferecerFala: (f: FalaFaixa) => void, respiroMs: number): void {
  const id = fala?.id ?? null;
  useEffect(() => {
    if (!fala) return;
    const espera = Math.max(0, fila.desde + respiroMs - agora());
    const t = setTimeout(() => oferecerFala(fala), espera);
    return () => clearTimeout(t);
    // A fala é recriada a cada pintura; o que importa é o id e o momento da fala atual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fila.desde, respiroMs, oferecerFala]);
}
