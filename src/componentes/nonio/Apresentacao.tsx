"use client";

/**
 * Uma apresentação: véu sobre o resto, a ferramenta em destaque, uma frase do Nônio e "Entendi".
 * O destaque sobe a ferramenta acima do véu (data-apresentando). O cartão é irmão do véu, não filho:
 * dentro do véu fixo ele ficaria preso abaixo da ferramenta, e no computador (onde a máquina é
 * mais alta que o espaço livre) a máquina cobriria o "Entendi". Com espaço ao lado da ferramenta,
 * o cartão vai para o lado; senão, para cima ou para baixo, onde houver mais espaço.
 */
import { useEffect, useRef } from "react";
import { APRESENTACOES, TEXTO_ENTENDI } from "@/conteudo/apresentacoes";
import type { IdApresentacao } from "@/nucleo/tutor/apresentacoes";
import { Nonio } from "./Nonio";

/** Largura do cartão quando ele vai para o lado da ferramenta, e a folga até ela. */
const LARGURA_AO_LADO = 360;
const FOLGA = 20;

/** Com Cache Components, telas visitadas ficam escondidas no DOM: só a visível conta. */
function visivel(seletor: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(seletor)) {
    if (el.offsetParent !== null || el.getClientRects().length > 0) return el;
  }
  return null;
}

export function Apresentacao({ id, onEntendi }: { id: IdApresentacao; onEntendi: () => void }) {
  const dado = APRESENTACOES[id];
  const botao = useRef<HTMLButtonElement>(null);
  const cartao = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = visivel(dado.alvo) ?? visivel(".palco-maquina");
    if (alvo) {
      alvo.setAttribute("data-apresentando", "");
      const r = alvo.getBoundingClientRect();
      if (r.bottom > window.innerHeight * 0.92) alvo.scrollIntoView({ block: "center" });
      const c = alvo.getBoundingClientRect();
      const el = cartao.current;
      if (el) {
        // O cartão vai para onde há espaço livre, para não cobrir a ferramenta.
        const direita = window.innerWidth - c.right;
        const esquerda = c.left;
        const cabe = LARGURA_AO_LADO + 2 * FOLGA;
        if (Math.max(direita, esquerda) >= cabe) {
          el.dataset.lado = direita >= esquerda ? "direita" : "esquerda";
          el.style.left = `${direita >= esquerda ? c.right + FOLGA : c.left - FOLGA - LARGURA_AO_LADO}px`;
          el.style.width = `${LARGURA_AO_LADO}px`;
          el.style.top = `${Math.max(FOLGA, Math.min(c.top + c.height / 2 - el.offsetHeight / 2, window.innerHeight - el.offsetHeight - FOLGA))}px`;
        } else {
          el.dataset.lado = c.top + c.height / 2 > window.innerHeight / 2 ? "cima" : "baixo";
        }
      }
    }
    botao.current?.focus({ preventScroll: true });
    return () => alvo?.removeAttribute("data-apresentando");
  }, [dado.alvo]);

  return (
    <div className="contents" data-apresentacao={id}>
      <div className="fixed inset-0 z-40 bg-veu anima-esmaecer" aria-hidden="true" />
      <div
        ref={cartao}
        className="apresentacao-cartao anima-esmaecer"
        data-lado="baixo"
        role="dialog"
        aria-modal="true"
        aria-label="Uma ferramenta nova"
      >
        <Nonio expressao="atento" tamanho={50} rotulo="" />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
          <p className="m-0 text-[15.5px] font-medium leading-[1.4]">{dado.texto}</p>
          <button ref={botao} type="button" className="botao-principal min-h-[44px] px-5 text-[16px]" onClick={onEntendi} data-acao="entendi">
            {TEXTO_ENTENDI}
          </button>
        </div>
      </div>
    </div>
  );
}
