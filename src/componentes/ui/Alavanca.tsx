"use client";

/**
 * Alavanca: o controle que faz a máquina andar. Ao tocar, o braço desce e volta.
 */
import { useState } from "react";

export function Alavanca({
  rotulo,
  onPuxar,
  desabilitado = false,
  idTeste,
}: {
  rotulo: string;
  onPuxar: () => void;
  desabilitado?: boolean;
  idTeste?: string;
}) {
  const [puxadas, setPuxadas] = useState(0);
  return (
    <button
      type="button"
      className="placa placa-cheia relative h-[58px] min-w-[150px] justify-start pl-2 pr-4 text-[1.3rem]"
      disabled={desabilitado}
      data-acao={idTeste}
      onClick={() => {
        setPuxadas((p) => p + 1);
        onPuxar();
      }}
    >
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" className="shrink-0">
        <rect x="6" y="28" width="28" height="8" rx="2" fill="var(--latao)" />
        <rect x="6" y="32" width="28" height="4" rx="1" fill="var(--latao-sombra)" />
        <g key={puxadas} className={puxadas > 0 ? "anima-alavanca" : undefined} style={{ transformOrigin: "20px 30px", transform: "rotate(-24deg)" }}>
          <rect x="18.5" y="8" width="3" height="22" rx="1.4" fill="var(--esmalte)" />
          <circle cx="20" cy="8" r="5" fill="var(--esmalte)" />
          <circle cx="18.8" cy="6.8" r="1.6" fill="var(--turquesa-clara)" />
        </g>
        <circle cx="20" cy="30" r="3" fill="var(--latao-claro)" />
      </svg>
      <span>{rotulo}</span>
    </button>
  );
}
