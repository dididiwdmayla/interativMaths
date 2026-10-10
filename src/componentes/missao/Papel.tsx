/**
 * A folha de papel do Caderno. Matemática formal: creme, tinta escura, letra da Dália na margem.
 */
import type { ReactNode } from "react";

export function FolhaPapel({ children, titulo, margem, className = "" }: { children: ReactNode; titulo?: string; margem?: ReactNode; className?: string }) {
  return (
    <section className={`papel relative rounded-t-2xl px-4 pb-4 pt-3 shadow-[0_-8px_24px_var(--sombra)] ${className}`}>
      <div className="absolute inset-y-0 left-9 w-px bg-tinta-vermelha opacity-30" aria-hidden="true" />
      {titulo && <h2 className="fonte-sinal m-0 pl-7 text-[1.35rem] font-bold uppercase tracking-wide text-tinta">{titulo}</h2>}
      <div className="pl-7">{children}</div>
      {margem && <div className="mt-3 pl-7">{margem}</div>}
    </section>
  );
}

export function NotaDalia({ children }: { children: ReactNode }) {
  return (
    <p className="letra-dalia m-0 -rotate-1">
      {children}
    </p>
  );
}
