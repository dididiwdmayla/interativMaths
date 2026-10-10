/**
 * Enquanto o progresso não foi lido (primeira pintura): uma luz-piloto, sem texto que pisque.
 */
export function Carregando() {
  return (
    <main data-pronto="nao" className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <svg viewBox="0 0 40 40" width="40" height="40" role="img" aria-label="Carregando">
        <circle cx="20" cy="20" r="16" fill="var(--ambar-halo)" className="piloto" />
        <circle cx="20" cy="20" r="6" fill="var(--ambar-sombra)" />
      </svg>
    </main>
  );
}
