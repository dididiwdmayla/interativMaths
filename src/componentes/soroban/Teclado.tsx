"use client";

/**
 * O teclado da leitura e do soroban imaginado (referência 7 de v05.html): 1 a 9 em três colunas,
 * Apagar, 0 e a terceira tecla da última linha (Ver contas na sombra; vazia nos outros), teclas de
 * 46 px. Acima, a caixa com o número digitado ("Número", "Ficou", "Quanto deu?") e Conferir.
 * O teclado físico também digita; Enter confere. A caixa que não bateu fica "ainda não"
 * (borda vermelha e névoa) até a próxima tecla.
 */
import { useEffect } from "react";
import { TEXTOS_BANCADA } from "@/conteudo/lapidacao";

export const TETO_DIGITOS = 3;

export function Teclado({
  valor,
  onValor,
  onConferir,
  rotulo,
  aindaNao,
  extra,
  desabilitado = false,
}: {
  valor: string;
  onValor: (v: string) => void;
  onConferir: () => void;
  /** "Número", "Ficou", "Quanto deu?" */
  rotulo: string;
  aindaNao: boolean;
  /** A terceira tecla da última linha (Ver contas), ou null. */
  extra: { readonly rotulo: string; readonly onTocar: () => void } | null;
  desabilitado?: boolean;
}) {
  const digitar = (d: string) => {
    if (desabilitado) return;
    onValor((valor === "0" ? d : valor + d).slice(0, TETO_DIGITOS));
  };
  const apagar = () => !desabilitado && onValor(valor.slice(0, -1));

  // O teclado físico também digita.
  useEffect(() => {
    const ouvir = (ev: KeyboardEvent) => {
      if (desabilitado || ev.target instanceof HTMLInputElement) return;
      if (/^[0-9]$/.test(ev.key)) {
        ev.preventDefault();
        onValor((valor === "0" ? ev.key : valor + ev.key).slice(0, TETO_DIGITOS));
      } else if (ev.key === "Backspace") {
        ev.preventDefault();
        onValor(valor.slice(0, -1));
      } else if (ev.key === "Enter" && valor.length > 0) {
        ev.preventDefault();
        onConferir();
      }
    };
    window.addEventListener("keydown", ouvir);
    return () => window.removeEventListener("keydown", ouvir);
  }, [valor, onValor, onConferir, desabilitado]);

  return (
    <div className="flex flex-col gap-2.5" data-teclado="">
      <div className="flex items-stretch gap-2">
        <div className={`teclado-caixa ${aindaNao ? "caixa-ainda-nao" : ""}`} data-caixa={aindaNao ? "ainda-nao" : "neutra"} aria-live="polite">
          <span className="teclado-rotulo">{rotulo}</span>
          <span className="teclado-valor algarismos" data-valor-digitado={valor}>
            {valor || " "}
          </span>
        </div>
        <button type="button" className="botao-principal min-w-[120px]" onClick={onConferir} disabled={desabilitado || valor.length === 0} data-acao="conferir">
          {TEXTOS_BANCADA.conferir}
        </button>
      </div>
      <div className="teclado-grade" role="group" aria-label={rotulo}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="tecla" onClick={() => digitar(d)} disabled={desabilitado} data-tecla={d}>
            {d}
          </button>
        ))}
        <button type="button" className="tecla tecla-texto" onClick={apagar} disabled={desabilitado} data-tecla="apagar">
          {TEXTOS_BANCADA.apagar}
        </button>
        <button type="button" className="tecla" onClick={() => digitar("0")} disabled={desabilitado} data-tecla="0">
          0
        </button>
        {extra ? (
          <button type="button" className="tecla tecla-texto" onClick={extra.onTocar} disabled={desabilitado} data-tecla="extra">
            {extra.rotulo}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
