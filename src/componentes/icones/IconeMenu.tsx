/** Três alavancas de ajuste. */
export function IconeMenu() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      {[6, 12, 18].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="3" x2={x} y2="21" stroke="currentColor" strokeWidth="1.5" />
          <rect x={x - 2.6} y={[7, 13, 9][i]} width="5.2" height="3.6" rx="1" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}
