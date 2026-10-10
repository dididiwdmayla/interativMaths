/**
 * Cotas vivas: linhas de cota de desenho técnico presas às máquinas, com quantidades reais.
 * Funcionais: podem ser escondidas; pedir uma medida ao Nônio é pedir uma cota.
 */
import type { ReactNode } from "react";
import { parteInteira, subtrai, inteiro, type Racional } from "@/nucleo/racional/racional";

export type TomCota = "normal" | "destaque" | "atencao" | "ambar";

const COR: Record<TomCota, string> = {
  normal: "var(--texto-mundo-suave)",
  destaque: "var(--turquesa-clara)",
  atencao: "var(--vermelhao-claro)",
  ambar: "var(--ambar)",
};

/** Número exato em SVG: inteiro, ou misto com fração empilhada de traço horizontal. */
export function NumeroSvg({
  valor,
  x,
  y,
  tamanho = 11,
  cor = "var(--texto-mundo)",
  ancora = "middle",
  peso = 600,
}: {
  valor: Racional;
  x: number;
  y: number;
  tamanho?: number;
  cor?: string;
  ancora?: "start" | "middle" | "end";
  peso?: number;
}) {
  if (valor.d === 1) {
    return (
      <text x={x} y={y} textAnchor={ancora} dominantBaseline="middle" fontSize={tamanho} fill={cor} fontWeight={peso} className="algarismos">
        {valor.n}
      </text>
    );
  }
  const k = parteInteira(valor);
  const frac = subtrai(valor, inteiro(k));
  const fs = tamanho * 0.72;
  const largFrac = Math.max(String(frac.n).length, String(frac.d).length) * fs * 0.62 + 2;
  const largInt = k > 0 ? String(k).length * tamanho * 0.6 + 1.5 : 0;
  const total = largInt + largFrac;
  const x0 = ancora === "middle" ? x - total / 2 : ancora === "end" ? x - total : x;
  const xf = x0 + largInt + largFrac / 2;
  return (
    <g fill={cor} fontWeight={peso} className="algarismos">
      {k > 0 && (
        <text x={x0} y={y} dominantBaseline="middle" fontSize={tamanho}>
          {k}
        </text>
      )}
      <text x={xf} y={y - fs * 0.52} textAnchor="middle" dominantBaseline="middle" fontSize={fs}>
        {frac.n}
      </text>
      <line x1={xf - largFrac / 2 + 0.5} x2={xf + largFrac / 2 - 0.5} y1={y} y2={y} stroke={cor} strokeWidth={0.9} />
      <text x={xf} y={y + fs * 0.62} textAnchor="middle" dominantBaseline="middle" fontSize={fs}>
        {frac.d}
      </text>
    </g>
  );
}

/** Cota horizontal: traço fino, marcas nas pontas, rótulo acima. */
export function CotaH({
  x1,
  x2,
  y,
  tom = "normal",
  children,
  rotuloY,
}: {
  x1: number;
  x2: number;
  y: number;
  tom?: TomCota;
  children?: ReactNode;
  rotuloY?: number;
}) {
  const cor = COR[tom];
  return (
    <g stroke={cor} fill={cor}>
      <line x1={x1} x2={x2} y1={y} y2={y} strokeWidth={0.7} />
      <line x1={x1} x2={x1} y1={y - 3} y2={y + 3} strokeWidth={0.7} />
      <line x1={x2} x2={x2} y1={y - 3} y2={y + 3} strokeWidth={0.7} />
      <path d={`M ${x1} ${y} l 3 -1.6 l 0 3.2 Z M ${x2} ${y} l -3 -1.6 l 0 3.2 Z`} stroke="none" />
      {children !== undefined && (
        <g stroke="none" transform={`translate(${(x1 + x2) / 2} ${rotuloY ?? y - 6})`}>
          {children}
        </g>
      )}
    </g>
  );
}

/** Cota vertical (para o medidor de nível). */
export function CotaV({ x, y1, y2, tom = "normal" }: { x: number; y1: number; y2: number; tom?: TomCota }) {
  const cor = COR[tom];
  return (
    <g stroke={cor} fill={cor}>
      <line x1={x} x2={x} y1={y1} y2={y2} strokeWidth={0.7} />
      <line x1={x - 2.5} x2={x + 2.5} y1={y1} y2={y1} strokeWidth={0.7} />
      <line x1={x - 2.5} x2={x + 2.5} y1={y2} y2={y2} strokeWidth={0.7} />
    </g>
  );
}

export function corDaCota(tom: TomCota): string {
  return COR[tom];
}
