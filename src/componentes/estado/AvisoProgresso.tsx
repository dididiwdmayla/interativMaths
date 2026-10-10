"use client";

/**
 * Estados de falha do progresso, ditos com clareza e sem susto.
 */
import { dispensarAviso } from "./loja";
import { useProgresso } from "./useProgresso";

const TEXTOS = {
  "sem-armazenamento": "Este navegador não está deixando guardar o progresso (modo privado ou sem espaço). Dá para jogar, mas nada fica salvo ao fechar.",
  ilegivel: "O progresso salvo estava ilegível. Começamos do zero; o original ficou guardado à parte, sem ser apagado.",
  "versao-futura": "Este progresso foi salvo por uma versão mais nova do jogo. Algumas coisas podem não aparecer aqui.",
} as const;

export function AvisoProgresso() {
  const { pronto, aviso } = useProgresso();
  if (!pronto || aviso === null) return null;
  return (
    <div role="alert" className="fixed inset-x-2 top-2 z-50 flex items-start gap-3 rounded-lg border-2 border-vermelhao bg-noite-funda p-3 text-[0.95rem] shadow-lg area-segura-topo" data-aviso={aviso}>
      <p className="m-0 flex-1">{TEXTOS[aviso]}</p>
      <button type="button" className="placa placa-pequena" onClick={dispensarAviso}>
        Entendi
      </button>
    </div>
  );
}
