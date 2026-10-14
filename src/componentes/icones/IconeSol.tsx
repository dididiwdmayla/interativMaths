/** Sol: mudar para o modo claro. */
export function IconeSol({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="9" r="3.4" />
      <path d="M9 1.6v1.8M9 14.6v1.8M1.6 9h1.8M14.6 9h1.8M3.8 3.8l1.3 1.3M12.9 12.9l1.3 1.3M3.8 14.2l1.3-1.3M12.9 5.1l1.3-1.3" />
    </svg>
  );
}
