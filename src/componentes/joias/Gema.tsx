/**
 * Uma joia num dos quatro estágios de lapidação: bruta, talhada, lapidada, polida.
 * Contorno de tinta e facetas chapadas; mais facetas a cada estágio. Ainda não encontrada: a lápis.
 */
export function Gema({
  x,
  y,
  r,
  estagio,
  base,
  luz,
  lapis = false,
}: {
  x: number;
  y: number;
  r: number;
  estagio: 0 | 1 | 2 | 3;
  base: string;
  luz: string;
  lapis?: boolean;
}) {
  const p = (pts: [number, number][]) => pts.map(([a, c]) => `${x + a * r},${y + c * r}`).join(" ");
  const contorno = { stroke: "var(--tinta)", strokeWidth: Math.max(1.6, Math.min(2.4, r * 0.11)), strokeLinejoin: "round" as const };
  const faceta = { stroke: "var(--tinta)", strokeWidth: Math.max(1.2, Math.min(1.8, r * 0.08)), strokeLinejoin: "round" as const };
  let corpo: React.ReactNode;
  if (estagio === 0) {
    corpo = (
      <>
        <polygon points={p([[-0.8, 0.2], [-0.5, -0.7], [0.2, -0.85], [0.85, -0.25], [0.7, 0.6], [-0.1, 0.85]])} fill={base} {...contorno} />
        <polygon points={p([[-0.5, -0.7], [0.2, -0.85], [0.1, -0.1], [-0.4, 0]])} fill={luz} {...faceta} />
      </>
    );
  } else if (estagio === 1) {
    corpo = (
      <>
        <polygon points={p([[-0.85, 0], [-0.45, -0.75], [0.45, -0.75], [0.85, 0], [0.45, 0.75], [-0.45, 0.75]])} fill={base} {...contorno} />
        <polygon points={p([[-0.45, -0.75], [0.45, -0.75], [0.3, -0.25], [-0.3, -0.25]])} fill={luz} {...faceta} />
        <polygon points={p([[-0.85, 0], [-0.45, -0.75], [-0.3, -0.25]])} fill={luz} {...faceta} />
      </>
    );
  } else if (estagio === 2) {
    corpo = (
      <>
        <polygon points={p([[-0.9, -0.3], [-0.4, -0.85], [0.4, -0.85], [0.9, -0.3], [0, 0.95]])} fill={base} {...contorno} />
        <polygon points={p([[-0.4, -0.85], [0.4, -0.85], [0.25, -0.35], [-0.25, -0.35]])} fill={luz} {...faceta} />
        <polygon points={p([[-0.9, -0.3], [-0.4, -0.85], [-0.25, -0.35]])} fill={luz} {...faceta} />
        <polygon points={p([[-0.25, -0.35], [0.25, -0.35], [0, 0.95]])} fill={luz} {...faceta} />
        <path d={`M ${x + 0.9 * r} ${y - 0.3 * r} L ${x + 0.25 * r} ${y - 0.35 * r}`} fill="none" {...faceta} />
      </>
    );
  } else {
    corpo = (
      <>
        <polygon points={p([[-0.95, -0.25], [-0.5, -0.85], [0.5, -0.85], [0.95, -0.25], [0, 1]])} fill={base} {...contorno} />
        <polygon points={p([[-0.5, -0.85], [0.5, -0.85], [0.3, -0.4], [-0.3, -0.4]])} fill={luz} {...faceta} />
        <polygon points={p([[-0.95, -0.25], [-0.5, -0.85], [-0.3, -0.4]])} fill={luz} {...faceta} />
        <polygon points={p([[-0.3, -0.4], [0, -0.25], [-0.55, 0.2]])} fill={luz} {...faceta} />
        <polygon points={p([[0.3, -0.4], [0, -0.25], [0.55, 0.2]])} fill={base} {...faceta} />
        <polygon points={p([[-0.55, 0.2], [0, -0.25], [0.55, 0.2], [0, 1]])} fill={luz} {...faceta} />
        <path d={`M ${x - 0.95 * r} ${y - 0.25 * r} H ${x + 0.95 * r} M ${x + 0.5 * r} ${y - 0.85 * r} L ${x + 0.3 * r} ${y - 0.4 * r} L ${x + 0.95 * r} ${y - 0.25 * r}`} fill="none" {...faceta} />
      </>
    );
  }
  return <g className={lapis ? "a-lapis" : undefined}>{corpo}</g>;
}
