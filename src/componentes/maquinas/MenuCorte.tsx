"use client";

/**
 * O menu "Cortar em", aberto sobre a peça tocada quando a máquina tem fatiador. Só mostra os
 * números de partes que o fatiador aceita para aquela peça. Com mais de uma peça igual na
 * pilha, dá para cortar esta ou todas. Esc fecha.
 */
import { useEffect, useRef, useState } from "react";

export interface PosicaoMenu {
  readonly left: number;
  readonly top: number;
  /** De que lado do menu fica a peça (a setinha aponta para ela). */
  readonly lado: "esquerda" | "direita" | "cima";
  /** Com o menu embaixo da peça: onde fica a setinha, a partir da esquerda. */
  readonly seta?: number;
}

export function MenuCorte({
  posicao,
  partes,
  quantidade,
  nomePeca,
  onCortar,
  onFechar,
}: {
  posicao: PosicaoMenu;
  partes: readonly number[];
  /** Quantas peças iguais há na pilha. */
  quantidade: number;
  nomePeca: string;
  onCortar: (partes: number, todas: boolean) => void;
  onFechar: () => void;
}) {
  const [todas, setTodas] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button[data-cortar-em]")?.focus({ preventScroll: true });
  }, []);
  return (
    <div
      ref={ref}
      className="menu-corte anima-esmaecer"
      style={{ left: posicao.left, top: posicao.top }}
      role="dialog"
      aria-label={`Cortar ${todas ? "todas as peças" : nomePeca} em partes iguais`}
      data-menu-corte=""
      data-lado={posicao.lado}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onFechar();
        }
      }}
    >
      {posicao.lado === "cima" ? (
        <svg className="menu-corte-seta" width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" style={{ left: posicao.seta ?? 16 }}>
          <path d="M1 12 L8 2 L15 12" fill="var(--folha)" stroke="var(--tinta)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="menu-corte-seta" width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
          <path d={posicao.lado === "esquerda" ? "M12 1 L2 8 L12 15" : "M0 1 L10 8 L0 15"} fill="var(--folha)" stroke="var(--tinta)" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      )}
      <p className="menu-corte-rotulo m-0">Cortar em</p>
      <div className="flex gap-1.5">
        {partes.map((p) => (
          <button key={p} type="button" className="menu-corte-botao" onClick={() => onCortar(p, todas)} data-cortar-em={p} aria-label={`Cortar em ${p}`}>
            {p}
          </button>
        ))}
      </div>
      {quantidade > 1 && (
        <div className="mt-1 flex gap-1.5" role="radiogroup" aria-label="Quantas peças cortar">
          <button type="button" role="radio" aria-checked={!todas} className="menu-corte-quantas" onClick={() => setTodas(false)} data-cortar="uma">
            Esta
          </button>
          <button type="button" role="radio" aria-checked={todas} className="menu-corte-quantas" onClick={() => setTodas(true)} data-cortar="todas">
            Todas ({quantidade})
          </button>
        </div>
      )}
    </div>
  );
}
