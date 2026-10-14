"use client";

/**
 * Tela cheia: a Fullscreen API no documento inteiro, que continua entre as telas (a navegação não
 * recarrega o documento). O botão só existe com `document.fullscreenEnabled`: fora disso (o
 * iPhone, ou o iframe sem `allow="fullscreen"`), some. No iPhone, o Menu ensina a instalar; já
 * instalado (`display-mode: standalone`), não diz nada.
 */
import { useSyncExternalStore } from "react";
import { IconeTelaCheia } from "@/componentes/icones/IconeTelaCheia";

function assinar(avisar: () => void): () => void {
  document.addEventListener("fullscreenchange", avisar);
  return () => document.removeEventListener("fullscreenchange", avisar);
}

const nunca = () => () => {};

export function useTelaCheia() {
  const disponivel = useSyncExternalStore(nunca, () => document.fullscreenEnabled === true, () => false);
  const ativa = useSyncExternalStore(assinar, () => document.fullscreenElement !== null, () => false);
  const alternar = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
  };
  return { disponivel, ativa, alternar };
}

/** iPhone sem a API, aberto no navegador: o caminho é instalar. */
function precisaInstalar(): boolean {
  const ios = /iPhone|iPod/.test(navigator.userAgent);
  const instalado = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !document.fullscreenEnabled && !instalado;
}

export function useAvisoInstalar(): boolean {
  return useSyncExternalStore(nunca, precisaInstalar, () => false);
}

export function BotaoTelaCheia() {
  const { disponivel, ativa, alternar } = useTelaCheia();
  if (!disponivel) return null;
  return (
    <button type="button" className="botao-icone" aria-label={ativa ? "Sair da tela cheia" : "Entrar em tela cheia"} aria-pressed={ativa} onClick={alternar} data-tela-cheia={ativa ? "ativa" : "inativa"}>
      <IconeTelaCheia sair={ativa} />
    </button>
  );
}
