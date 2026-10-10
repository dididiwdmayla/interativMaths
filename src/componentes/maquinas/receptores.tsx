/**
 * Receptores: o que fica debaixo de cada bica, conforme a pele.
 */
import type { FormaReceptor } from "@/conteudo/peles";

export function Receptor({ forma, cx, y, largura }: { forma: FormaReceptor; cx: number; y: number; largura: number }) {
  const w = Math.min(largura - 10, 70);
  const x0 = cx - w / 2 - 3;
  switch (forma) {
    case "carroca":
      return (
        <g>
          <rect x={x0} y={y} width={w} height={8} rx={1.5} fill="var(--madeira)" />
          <rect x={x0} y={y + 5} width={w} height={3} fill="var(--madeira-sombra)" />
          <line x1={x0 - 6} y1={y + 3} x2={x0} y2={y + 4} stroke="var(--madeira-sombra)" strokeWidth={2} strokeLinecap="round" />
          {[x0 + w * 0.22, x0 + w * 0.78].map((rx) => (
            <g key={rx}>
              <circle cx={rx} cy={y + 12} r={5} fill="var(--aco-sombra)" />
              <circle cx={rx} cy={y + 12} r={3.4} fill="var(--aco)" />
              <circle cx={rx} cy={y + 12} r={1.1} fill="var(--latao)" />
            </g>
          ))}
        </g>
      );
    case "mesa":
      return (
        <g>
          <rect x={x0} y={y + 1} width={w} height={4} rx={1} fill="var(--madeira)" />
          <rect x={x0} y={y + 4} width={w} height={1.6} fill="var(--madeira-sombra)" />
          <rect x={x0 + 3} y={y + 5} width={2.6} height={11} fill="var(--madeira-sombra)" />
          <rect x={x0 + w - 5.6} y={y + 5} width={2.6} height={11} fill="var(--madeira-sombra)" />
        </g>
      );
    case "cesto":
      return (
        <g>
          <path d={`M ${x0} ${y} L ${x0 + w} ${y} L ${x0 + w - 5} ${y + 13} L ${x0 + 5} ${y + 13} Z`} fill="var(--saca)" />
          <path d={`M ${x0 + w * 0.5} ${y} L ${x0 + w} ${y} L ${x0 + w - 5} ${y + 13} L ${x0 + w * 0.5} ${y + 13} Z`} fill="var(--saca-sombra)" opacity={0.5} />
          {[3.5, 7, 10.5].map((dy) => (
            <line key={dy} x1={x0 + 2 + dy * 0.35} x2={x0 + w - 2 - dy * 0.35} y1={y + dy} y2={y + dy} stroke="var(--saca-sombra)" strokeWidth={0.8} />
          ))}
        </g>
      );
    case "casa": {
      const hw = Math.min(w, 34);
      const hx = cx - hw / 2 - 3;
      return (
        <g>
          <path d={`M ${hx - 2} ${y + 5} L ${hx + hw / 2} ${y - 2} L ${hx + hw + 2} ${y + 5} Z`} fill="var(--vermelhao-sombra)" />
          <rect x={hx} y={y + 5} width={hw} height={12} fill="var(--aco)" />
          <rect x={hx + hw / 2} y={y + 5} width={hw / 2} height={12} fill="var(--aco-sombra)" />
          <rect x={hx + hw * 0.2} y={y + 8} width={hw * 0.22} height={5} fill="var(--janela)" />
          <rect x={hx + hw * 0.6} y={y + 9} width={hw * 0.18} height={8} fill="var(--madeira-sombra)" />
        </g>
      );
    }
    case "prato":
      return (
        <g>
          <ellipse cx={cx - 3} cy={y + 4} rx={w / 2} ry={4} fill="var(--aco-sombra)" />
          <ellipse cx={cx - 3} cy={y + 2.6} rx={w / 2 - 1} ry={3.2} fill="var(--aco-claro)" />
          <ellipse cx={cx - 3} cy={y + 2.6} rx={w / 2 - 6} ry={1.8} fill="var(--aco)" opacity={0.6} />
        </g>
      );
  }
}
