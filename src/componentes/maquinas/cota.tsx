/**
 * Cotas como anotações a caneta: uma chave azul sobre a medida e o número exato em Rubik.
 * Funcionais: podem ser escondidas; pedir uma medida ao Nônio mostra uma anotação.
 */
import type { ReactNode } from "react";
import { parteInteira, subtrai, inteiro, type Racional } from "@/nucleo/racional/racional";
import { Chave } from "@/componentes/mundo/kit";

/**
 * Número exato em SVG: inteiro, ou misto com fração empilhada de traço horizontal.
 * `y` é a linha do meio (o traço da fração). `escalaFracao` é o tamanho de cada termo da fração
 * em relação a `tamanho`.
 */
export function NumeroSvg({
  valor,
  x,
  y,
  tamanho = 18,
  cor = "var(--tinta)",
  ancora = "middle",
  peso = 800,
  escalaFracao = 0.78,
}: {
  valor: Racional;
  x: number;
  y: number;
  tamanho?: number;
  cor?: string;
  ancora?: "start" | "middle" | "end";
  peso?: number;
  escalaFracao?: number;
}) {
  if (valor.d === 1) {
    return (
      <text x={x} y={y} textAnchor={ancora} dominantBaseline="central" fontSize={tamanho} fill={cor} stroke="none" fontWeight={peso} className="algarismos">
        {valor.n}
      </text>
    );
  }
  const k = parteInteira(valor);
  const frac = subtrai(valor, inteiro(k));
  const fs = tamanho * escalaFracao;
  const largFrac = Math.max(String(frac.n).length, String(frac.d).length) * fs * 0.62 + 4;
  const largInt = k > 0 ? String(k).length * tamanho * 0.62 + 2 : 0;
  const total = largInt + largFrac;
  const x0 = ancora === "middle" ? x - total / 2 : ancora === "end" ? x - total : x;
  const xf = x0 + largInt + largFrac / 2;
  const barra = Math.max(1.6, fs * 0.13);
  return (
    <g fill={cor} stroke="none" fontWeight={peso} className="algarismos">
      {k > 0 && (
        <text x={x0} y={y} dominantBaseline="central" fontSize={tamanho}>
          {k}
        </text>
      )}
      <text x={xf} y={y - barra / 2 - fs * 0.08} textAnchor="middle" fontSize={fs}>
        {frac.n}
      </text>
      <rect x={xf - largFrac / 2 + 1} y={y - barra / 2} width={largFrac - 2} height={barra} rx={barra / 2} />
      <text x={xf} y={y + barra / 2 + fs * 0.08} textAnchor="middle" dominantBaseline="hanging" fontSize={fs}>
        {frac.d}
      </text>
    </g>
  );
}

/** Cota a caneta: chave azul sobre a medida, o rótulo em cima. */
export function CotaCaneta({ x1, x2, y, children, rotuloY }: { x1: number; x2: number; y: number; children?: ReactNode; rotuloY?: number }) {
  return (
    <g aria-hidden="true">
      <Chave x1={x1} x2={x2} y={y} />
      {children !== undefined && <g transform={`translate(${(x1 + x2) / 2} ${rotuloY ?? y - 16})`}>{children}</g>}
    </g>
  );
}
