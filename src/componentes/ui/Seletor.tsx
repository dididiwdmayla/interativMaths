"use client";

/**
 * Seletor numérico: [−] mostrador [+]. Teclado: setas mudam o valor.
 */
import type { KeyboardEvent, ReactNode } from "react";

export function Seletor({
  rotulo,
  valor,
  minimo,
  maximo,
  onMudar,
  desabilitado = false,
  exibicao,
  papel = false,
  idTeste,
}: {
  rotulo: string;
  valor: number;
  minimo: number;
  maximo: number;
  onMudar: (v: number) => void;
  desabilitado?: boolean;
  exibicao?: ReactNode;
  papel?: boolean;
  idTeste?: string;
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
  const classe = `placa placa-pequena${papel ? " placa-papel" : ""}`;
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={rotulo} data-seletor={idTeste}>
      <button type="button" className={classe} aria-label={`${rotulo}: menos um`} disabled={desabilitado || valor <= minimo} onClick={() => mudar(valor - 1)} onKeyDown={teclas}>
        <IconeMenos />
      </button>
      <output
        className="mostrador"
        aria-live="polite"
        aria-label={`${rotulo}: ${valor}`}
        tabIndex={desabilitado ? -1 : 0}
        onKeyDown={teclas}
        data-valor={valor}
      >
        {exibicao ?? valor}
      </output>
      <button type="button" className={classe} aria-label={`${rotulo}: mais um`} disabled={desabilitado || valor >= maximo} onClick={() => mudar(valor + 1)} onKeyDown={teclas}>
        <IconeMais />
      </button>
    </div>
  );
}

function IconeMenos() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect x="2" y="7" width="12" height="2.4" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconeMais() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <rect x="2" y="7" width="12" height="2.4" rx="1" fill="currentColor" />
      <rect x="6.8" y="2.2" width="2.4" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}
