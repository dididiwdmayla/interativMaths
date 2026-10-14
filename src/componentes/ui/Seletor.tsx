"use client";

/**
 * Passo a passo de valor: [−] quadro [+]. Teclado: setas mudam o valor.
 */
import type { KeyboardEvent, ReactNode } from "react";
import { IconeMais } from "@/componentes/icones/IconeMais";
import { IconeMenos } from "@/componentes/icones/IconeMenos";

export function Seletor({
  rotulo,
  valor,
  minimo,
  maximo,
  onMudar,
  desabilitado = false,
  exibicao,
  idTeste,
  marcado = false,
}: {
  rotulo: string;
  valor: number;
  minimo: number;
  maximo: number;
  onMudar: (v: number) => void;
  desabilitado?: boolean;
  exibicao?: ReactNode;
  idTeste?: string;
  /** O valor não bateu com a máquina: borda vermelha e névoa (passageiro). */
  marcado?: boolean;
}) {
  const mudar = (v: number) => {
    if (desabilitado) return;
    onMudar(Math.min(maximo, Math.max(minimo, v)));
  };
  const teclas = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      mudar(valor + 1);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      mudar(valor - 1);
    }
  };
  return (
    <div className="passo-valor" role="group" aria-label={rotulo} data-seletor={idTeste} data-desabilitado={desabilitado ? "sim" : "nao"}>
      <button type="button" className="passo-valor-botao" aria-label={`${rotulo}: menos um`} disabled={desabilitado || valor <= minimo} onClick={() => mudar(valor - 1)} onKeyDown={teclas}>
        <IconeMenos />
      </button>
      <output
        className={`passo-valor-quadro ${marcado ? "caixa-ainda-nao" : ""}`}
        aria-live="polite"
        aria-label={`${rotulo}: ${valor}`}
        tabIndex={desabilitado ? -1 : 0}
        onKeyDown={teclas}
        data-valor={valor}
      >
        {exibicao ?? valor}
      </output>
      <button type="button" className="passo-valor-botao" aria-label={`${rotulo}: mais um`} disabled={desabilitado || valor >= maximo} onClick={() => mudar(valor + 1)} onKeyDown={teclas}>
        <IconeMais />
      </button>
    </div>
  );
}
