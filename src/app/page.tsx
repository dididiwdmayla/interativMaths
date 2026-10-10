export default function Inicio() {
  return (
    <main className="area-segura flex min-h-dvh flex-col items-center justify-center gap-6 text-center">
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="var(--ambar-halo)" className="piloto" />
        <circle cx="20" cy="20" r="6" fill="var(--ambar)" />
      </svg>
      <h1 className="fonte-sinal text-5xl font-extrabold uppercase text-latao-claro">interativMaths</h1>
      <p className="max-w-sm text-texto-mundo-suave">O Engenho está parando. Em construção.</p>
    </main>
  );
}
