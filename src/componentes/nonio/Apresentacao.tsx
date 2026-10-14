"use client";

/**
 * Uma apresentação: véu sobre o resto, a ferramenta em destaque, uma frase do Nônio e "Entendi".
 * O destaque sobe a ferramenta acima do véu (data-apresentando); o cartão fica do lado oposto a ela.
 */
import { useEffect, useRef } from "react";
import { APRESENTACOES, TEXTO_ENTENDI } from "@/conteudo/apresentacoes";
import type { IdApresentacao } from "@/nucleo/tutor/apresentacoes";
import { Nonio } from "./Nonio";

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
      const centro = alvo.getBoundingClientRect();
      // O cartão vai para o lado com mais espaço livre, para não cobrir a ferramenta.
      if (cartao.current) cartao.current.dataset.lado = centro.top + centro.height / 2 > window.innerHeight / 2 ? "cima" : "baixo";
    }
    botao.current?.focus({ preventScroll: true });
    return () => alvo?.removeAttribute("data-apresentando");
  }, [dado.alvo]);

  return (
    <div className="fixed inset-0 z-40" data-apresentacao={id}>
      <div className="absolute inset-0 bg-veu anima-esmaecer" aria-hidden="true" />
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
