/**
 * A página do manual, rasgada onde falta o porquê. Uma folha pautada de borda irregular; a última
 * linha some no rasgo.
 */
export function ManualRasgado({ titulo, linhas }: { titulo: string; linhas: readonly string[] }) {
  const rasgo =
    "M 4 4 L 296 4 L 296 112 L 284 120 L 271 108 L 257 124 L 241 112 L 224 128 L 207 114 L 191 131 L 172 116 L 152 133 L 133 118 L 114 134 L 95 119 L 76 132 L 58 117 L 40 130 L 22 118 L 4 127 Z";
  return (
    <div className="relative mx-auto w-full max-w-[340px] -rotate-1" aria-label={`Página do manual: ${titulo}. ${linhas.join(" ")} O resto está rasgado.`} role="img">
      <svg viewBox="0 0 300 140" className="block w-full" aria-hidden="true">
        <defs>
          <clipPath id="rasgo-manual">
            <path d={rasgo} />
          </clipPath>
        </defs>
        <path d={rasgo} fill="var(--folha)" stroke="none" />
        <g clipPath="url(#rasgo-manual)">
          {[38, 60, 82, 104, 126].map((y) => (
            <line key={y} x1={0} x2={300} y1={y} y2={y} stroke="var(--pauta)" strokeWidth={1} />
          ))}
          <line x1={26} x2={26} y1={0} y2={140} stroke="var(--margem)" strokeWidth={1.6} />
        </g>
        <path d={rasgo} fill="none" stroke="var(--contorno)" strokeWidth={2} strokeLinejoin="round" />
        <text x={34} y={30} fontSize={14} fontWeight={800} fill="var(--tinta)">
          {titulo}
        </text>
        {linhas.map((l, i) => (
          <text key={i} x={34} y={55 + i * 22} fontSize={12.5} fontWeight={500} fill="var(--tinta-suave)">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}
