"use client";

/**
 * Estados de falha do progresso, ditos com clareza e sem susto.
 */
import { usePathname } from "next/navigation";
import { dispensarAviso } from "./loja";
import { useProgresso } from "./useProgresso";

const TEXTOS = {
  "sem-armazenamento": "Este navegador não está deixando guardar o progresso (modo privado ou sem espaço). Dá para jogar, mas nada fica salvo ao fechar.",
  ilegivel: "O progresso salvo estava ilegível. Começamos do zero; o original ficou guardado à parte, sem ser apagado.",
  "versao-futura": "Este progresso foi salvo por uma versão mais nova do jogo. Algumas coisas podem não aparecer aqui.",
} as const;

export function AvisoProgresso() {
  const { pronto, aviso } = useProgresso();
  // A degustação não usa o progresso do jogo: o aviso dele não diz nada lá (nem dentro de um
  // iframe que bloqueia o armazenamento).
  const degustacao = usePathname()?.startsWith("/degustacao") ?? false;
  if (!pronto || aviso === null || degustacao) return null;
  return (
    <div role="alert" className="ficha fixed inset-x-[14px] top-3 z-50 flex items-start gap-3 p-3 area-segura-topo lg:left-auto lg:right-7 lg:w-[440px]" data-aviso={aviso}>
      <p className="m-0 flex-1 text-[15px] font-medium">{TEXTOS[aviso]}</p>
      <button type="button" className="botao-secundario shrink-0" onClick={dispensarAviso}>
        Entendi
      </button>
    </div>
  );
}
