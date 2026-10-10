/**
 * A página do manual, rasgada onde falta o porquê. Papel velho; a última linha some no rasgo.
 */
export function ManualRasgado({ titulo, linhas }: { titulo: string; linhas: readonly string[] }) {
  return (
    <div className="relative mx-auto w-full max-w-[340px] -rotate-1" aria-label={`Página do manual: ${titulo}. ${linhas.join(" ")} O resto está rasgado.`} role="img">
      <svg viewBox="0 0 300 150" className="block w-full" aria-hidden="true">
        <path
          d="M 4 4 L 296 4 L 296 108 L 282 116 L 270 104 L 255 122 L 240 110 L 222 126 L 205 112 L 190 130 L 170 114 L 150 132 L 130 116 L 112 134 L 92 118 L 74 132 L 56 116 L 38 130 L 20 118 L 4 126 Z"
          fill="var(--papel)"
          stroke="var(--papel-linha)"
        />
        <text x={16} y={28} fontSize={13} fontWeight={700} fill="var(--tinta)" className="fonte-sinal" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
          {titulo}
        </text>
        <line x1={16} x2={284} y1={36} y2={36} stroke="var(--tinta-suave)" strokeWidth={0.6} />
        {linhas.map((l, i) => (
          <text key={i} x={16} y={58 + i * 20} fontSize={12.5} fill="var(--tinta-suave)">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
