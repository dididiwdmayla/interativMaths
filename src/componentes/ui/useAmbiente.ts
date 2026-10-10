"use client";

/**
 * Animação ambiente pausada fora da tela e durante a rolagem.
 * Marca `data-ambiente="pausado"` no elemento; o CSS para as animações ambiente.
 */
import { useEffect, useRef } from "react";

export function useAmbiente<T extends HTMLElement | SVGElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visivel = true;
    let rolando = false;
    let espera: ReturnType<typeof setTimeout> | null = null;
    const aplicar = () => el.setAttribute("data-ambiente", visivel && !rolando ? "ativo" : "pausado");
    const obs = new IntersectionObserver((entradas) => {
      visivel = entradas.some((e) => e.isIntersecting);
      aplicar();
    });
    obs.observe(el);
    const aoRolar = () => {
      rolando = true;
      aplicar();
      if (espera) clearTimeout(espera);
      espera = setTimeout(() => {
        rolando = false;
        aplicar();
      }, 160);
    };
    window.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    aplicar();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", aoRolar, { capture: true });
      if (espera) clearTimeout(espera);
    };
  }, []);
  return ref;
}
