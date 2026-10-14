"use client";

/**
 * A luz do caderno: o hook da escolha, o botão de lua ou sol do topo e quem aplica o tema no
 * documento. Automático segue o aparelho; claro e escuro fixam. A degustação segue o aparelho,
 * sem botão, e aceita `?tema=` para a recepção do interativAI combinar.
 */
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { definirPreferencias, type Aparencia } from "@/nucleo/progresso";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeLua } from "@/componentes/icones/IconeLua";
import { IconeSol } from "@/componentes/icones/IconeSol";
import { CHAVE_APARENCIA, CONSULTA_ESCURO, temaDoEndereco, type Tema } from "./tema";

function assinarAparelho(avisar: () => void): () => void {
  const m = window.matchMedia(CONSULTA_ESCURO);
  m.addEventListener("change", avisar);
  return () => m.removeEventListener("change", avisar);
}

/** O aparelho pede escuro? */
export function useAparelhoEscuro(): boolean {
  return useSyncExternalStore(
    assinarAparelho,
    () => window.matchMedia(CONSULTA_ESCURO).matches,
    () => false,
  );
}

export function temaDe(aparencia: Aparencia, aparelhoEscuro: boolean): Tema {
  if (aparencia === "automatico") return aparelhoEscuro ? "escuro" : "claro";
  return aparencia;
}

export function useTema() {
  const { pronto, progresso, atualizar } = useProgresso();
  const aparelhoEscuro = useAparelhoEscuro();
  const aparencia = progresso.preferencias.aparencia;
  return {
    pronto,
    aparencia,
    tema: temaDe(aparencia, aparelhoEscuro),
    escolher: (a: Aparencia) => atualizar((p, agora) => definirPreferencias(p, { aparencia: a }, agora)),
  };
}

/** Põe o tema no <html>, guarda o espelho da escolha e acerta a cor da barra do navegador. */
export function AplicarTema() {
  const { pronto, aparencia } = useTema();
  const aparelhoEscuro = useAparelhoEscuro();
  const caminho = usePathname();
  useEffect(() => {
    if (!pronto) return;
    const degustacao = caminho.startsWith("/degustacao");
    const tema = temaDoEndereco(window.location.search) ?? temaDe(degustacao ? "automatico" : aparencia, aparelhoEscuro);
    const html = document.documentElement;
    html.dataset.tema = tema;
    if (!degustacao) {
      try {
        window.localStorage.setItem(CHAVE_APARENCIA, aparencia);
      } catch {
        // Armazenamento bloqueado: o tema vale só nesta visita.
      }
    }
    const papel = getComputedStyle(html).getPropertyValue("--papel").trim();
    if (papel) document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", papel));
  }, [pronto, aparencia, aparelhoEscuro, caminho]);
  return null;
}

/** Lua no claro, sol no escuro: alterna entre os dois e sai do automático. */
export function BotaoTema() {
  const { tema, escolher } = useTema();
  const escuro = tema === "escuro";
  return (
    <button type="button" className="botao-icone" aria-label={escuro ? "Mudar para o modo claro" : "Mudar para o modo escuro"} onClick={() => escolher(escuro ? "claro" : "escuro")} data-botao-tema={tema}>
      {escuro ? <IconeSol /> : <IconeLua />}
    </button>
  );
}
