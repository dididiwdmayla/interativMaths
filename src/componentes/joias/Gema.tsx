/**
 * Uma joia num dos quatro estágios de lapidação: bruta, talhada, lapidada, polida.
 * Cada estágio tem mais facetas e mais luz. Duas tonalidades por face; sem degradê.
 */
export function Gema({
  x,
  y,
  r,
  estagio,
  base,
  luz,
  apagada = false,
}: {
  x: number;
  y: number;
  r: number;
  estagio: 0 | 1 | 2 | 3;
  base: string;
  luz: string;
  apagada?: boolean;
}) {
  const b = apagada ? "var(--noite-traco)" : base;
  const l = apagada ? "var(--noite-borda)" : luz;
  const p = (pts: [number, number][]) => pts.map(([a, c]) => `${x + a * r},${y + c * r}`).join(" ");
  if (estagio === 0) {
    return (
      <g>
        <polygon points={p([[-0.8, 0.2], [-0.5, -0.7], [0.2, -0.85], [0.85, -0.25], [0.7, 0.6], [-0.1, 0.85]])} fill={b} />
        <polygon points={p([[-0.5, -0.7], [0.2, -0.85], [0.1, -0.1], [-0.4, 0]])} fill={l} opacity={0.55} />
      </g>
    );
  }
  if (estagio === 1) {
    return (
      <g>
        <polygon points={p([[-0.85, 0], [-0.45, -0.75], [0.45, -0.75], [0.85, 0], [0.45, 0.75], [-0.45, 0.75]])} fill={b} />
        <polygon points={p([[-0.45, -0.75], [0.45, -0.75], [0.3, -0.25], [-0.3, -0.25]])} fill={l} />
        <polygon points={p([[-0.85, 0], [-0.45, -0.75], [-0.3, -0.25]])} fill={l} opacity={0.6} />
      </g>
    );
  }
  if (estagio === 2) {
    return (
      <g>
        <polygon points={p([[-0.9, -0.3], [-0.4, -0.85], [0.4, -0.85], [0.9, -0.3], [0, 0.95]])} fill={b} />
        <polygon points={p([[-0.4, -0.85], [0.4, -0.85], [0.25, -0.35], [-0.25, -0.35]])} fill={l} />
        <polygon points={p([[-0.9, -0.3], [-0.4, -0.85], [-0.25, -0.35]])} fill={l} opacity={0.7} />
        <polygon points={p([[0.9, -0.3], [0.4, -0.85], [0.25, -0.35]])} fill={l} opacity={0.45} />
        <polygon points={p([[-0.25, -0.35], [0.25, -0.35], [0, 0.95]])} fill={l} opacity={0.35} />
      </g>
    );
  }
  return (
    <g>
      {!apagada && <circle cx={x} cy={y} r={r * 1.35} fill={l} opacity={0.25} />}
      <polygon points={p([[-0.95, -0.25], [-0.5, -0.85], [0.5, -0.85], [0.95, -0.25], [0, 1]])} fill={b} />
      <polygon points={p([[-0.5, -0.85], [0.5, -0.85], [0.3, -0.4], [-0.3, -0.4]])} fill={l} />
      <polygon points={p([[-0.95, -0.25], [-0.5, -0.85], [-0.3, -0.4]])} fill={l} opacity={0.8} />
      <polygon points={p([[0.95, -0.25], [0.5, -0.85], [0.3, -0.4]])} fill={l} opacity={0.55} />
      <polygon points={p([[-0.3, -0.4], [0, -0.25], [-0.55, 0.2]])} fill={l} opacity={0.5} />
      <polygon points={p([[0.3, -0.4], [0, -0.25], [0.55, 0.2]])} fill={l} opacity={0.35} />
      <polygon points={p([[-0.55, 0.2], [0, -0.25], [0.55, 0.2], [0, 1]])} fill={b} opacity={0.6} />
      {!apagada && <circle cx={x - r * 0.35} cy={y - r * 0.62} r={r * 0.09} fill="var(--texto-mundo)" />}
    </g>
  );
}
