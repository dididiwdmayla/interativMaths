/** Ponto vermelho: ainda não, ou a máquina recusou. Forma, além da cor. */
export function IconePonto({ tamanho = 10 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 10 10" width={tamanho} height={tamanho} aria-hidden="true" className="shrink-0">
      <circle cx="5" cy="5" r="4" fill="var(--vermelho)" />
    </svg>
  );
}
