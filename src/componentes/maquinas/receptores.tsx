/**
 * Receptores: o que fica debaixo de cada bica, conforme a pele. Contorno de tinta, cor chapada.
 */
import type { FormaReceptor } from "@/conteudo/peles";
import { TRACO } from "@/componentes/mundo/kit";

/** Altura que o receptor ocupa abaixo de `y`. */
export const ALTURA_RECEPTOR = 22;

export function Receptor({ forma, cx, y, largura }: { forma: FormaReceptor; cx: number; y: number; largura: number }) {
  const w = Math.max(24, Math.min(largura - 12, 72));
  const x0 = cx - w / 2;
  const traco = { stroke: "var(--tinta)", strokeWidth: TRACO, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (forma) {
    case "carroca":
      return (
        <g {...traco}>
          <path d={`M ${x0 - 6} ${y + 2} L ${x0} ${y + 4}`} fill="none" />
          <rect x={x0} y={y} width={w} height={10} rx={2} fill="var(--madeira)" />
          {[x0 + w * 0.24, x0 + w * 0.76].map((rx) => (
            <g key={rx}>
              <circle cx={rx} cy={y + 15} r={5.5} fill="var(--folha)" />
              <circle cx={rx} cy={y + 15} r={1.4} fill="var(--tinta)" stroke="none" />
            </g>
          ))}
        </g>
      );
    case "mesa":
      return (
        <g {...traco}>
          <path d={`M ${x0 + 7} ${y + 9} V ${y + 22} M ${x0 + w - 7} ${y + 9} V ${y + 22}`} fill="none" />
          <rect x={x0} y={y} width={w} height={9} rx={3} fill="var(--caneta-clara)" />
        </g>
      );
    case "cesto":
      return (
        <g {...traco}>
          <path d={`M ${x0} ${y} L ${x0 + w} ${y} L ${x0 + w - 6} ${y + 18} L ${x0 + 6} ${y + 18} Z`} fill="var(--palha)" />
          <path d={`M ${x0 + 3} ${y + 6} H ${x0 + w - 3} M ${x0 + 5} ${y + 12} H ${x0 + w - 5}`} fill="none" strokeWidth={1.6} />
        </g>
      );
    case "casa": {
      const hw = Math.min(w, 40);
      const hx = cx - hw / 2;
      return (
        <g {...traco}>
          <rect x={hx} y={y + 6} width={hw} height={16} rx={1.5} fill="var(--folha)" />
          <path d={`M ${hx - 3} ${y + 7} L ${cx} ${y - 4} L ${hx + hw + 3} ${y + 7} Z`} fill="var(--vermelho-claro)" />
          <rect x={hx + hw * 0.16} y={y + 10} width={hw * 0.26} height={6} rx={1} fill="var(--marca-texto)" strokeWidth={1.6} />
          <rect x={hx + hw * 0.58} y={y + 12} width={hw * 0.22} height={10} rx={1} fill="var(--caneta-clara)" strokeWidth={1.6} />
        </g>
      );
    }
    case "prato":
      return (
        <g {...traco}>
          <ellipse cx={cx} cy={y + 6} rx={w / 2} ry={6} fill="var(--folha)" />
          <ellipse cx={cx} cy={y + 5} rx={w / 2 - 9} ry={2.6} fill="none" stroke="var(--grafite)" strokeWidth={1.6} />
        </g>
      );
  }
}
