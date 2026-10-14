/**
 * Um desenho pequeno do que se reparte em cada missão do Arco 1, a traço de tinta.
 * Usado nas paradas do distrito e no cartão de continuar. A lápis quando a missão está por vir.
 */
const T = { stroke: "var(--contorno)", strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Sacas({ pontos }: { pontos: [number, number][] }) {
  return (
    <>
      {pontos.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M ${x - 4} ${y - 3} Q ${x - 6} ${y + 5} ${x} ${y + 5} Q ${x + 6} ${y + 5} ${x + 4} ${y - 3} Q ${x} ${y - 6} ${x - 4} ${y - 3} Z`} fill="var(--saca)" {...T} strokeWidth={1.8} />
      ))}
    </>
  );
}

export function MiniaturaMissao({ numero, tamanho = 36, lapis = false }: { numero: number; tamanho?: number; lapis?: boolean }) {
  let corpo: React.ReactNode;
  switch (numero) {
    case 1:
      corpo = (
        <>
          <Sacas pontos={[[10, 13], [18, 9], [26, 13]]} />
          <rect x={5} y={19} width={26} height={7} rx={2} fill="var(--madeira)" {...T} />
          <circle cx={11} cy={29} r={3} fill="var(--folha)" {...T} strokeWidth={1.8} />
          <circle cx={25} cy={29} r={3} fill="var(--folha)" {...T} strokeWidth={1.8} />
        </>
      );
      break;
    case 2:
      corpo = (
        <>
          <Sacas pontos={[[9, 25], [18, 25], [27, 25], [13, 17], [22, 17]]} />
          <text x={18} y={10} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--caneta)" stroke="none">
            ?
          </text>
        </>
      );
      break;
    case 3:
      corpo = (
        <>
          <rect x={4} y={24} width={20} height={6} rx={2} fill="var(--madeira)" {...T} />
          <Sacas pontos={[[9, 18], [19, 18]]} />
          <Sacas pontos={[[29, 21]]} />
          <path d="M 29 13 C 36 13, 36 28, 29 28 C 23 28, 23 15, 30 14" fill="none" stroke="var(--vermelho)" strokeWidth={2} strokeLinecap="round" />
        </>
      );
      break;
    case 4:
      corpo = (
        <>
          <circle cx={18} cy={18} r={14} fill="var(--folha)" {...T} />
          <path d="M18 18 V4 A14 14 0 1 1 4 18 Z" fill="var(--pao)" {...T} />
          <path d="M18 4 V32 M4 18 H32" fill="none" {...T} />
        </>
      );
      break;
    default:
      corpo = (
        <>
          <rect x={6} y={12} width={24} height={18} rx={2} fill="var(--saca)" {...T} />
          <path d="M6 18 H30 M18 12 V30" fill="none" {...T} />
          <path d="M18 12 C 14 6, 9 8, 12 11 M18 12 C 22 6, 27 8, 24 11" fill="none" {...T} strokeWidth={1.8} />
        </>
      );
  }
  return (
    <svg viewBox="0 0 36 36" width={tamanho} height={tamanho} aria-hidden="true" className="shrink-0">
      <g className={lapis ? "a-lapis" : undefined}>{corpo}</g>
    </svg>
  );
}
