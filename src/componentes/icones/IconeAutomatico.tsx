/** Meio claro, meio escuro: a aparência segue o aparelho. */
export function IconeAutomatico({ tamanho = 20 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 3a7 7 0 0 1 0 14Z" fill="currentColor" />
    </svg>
  );
}
