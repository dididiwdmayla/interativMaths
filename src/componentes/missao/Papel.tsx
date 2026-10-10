/**
 * A folha pautada: o passado a limpo. Linhas a cada 28 px, a margem vertical à esquerda, o título
 * de cada página à mão. É onde a matemática formal fica registrada.
 */
import type { ReactNode } from "react";

export function FolhaPautada({
  children,
  titulo,
  margem,
  className = "",
}: {
  children: ReactNode;
  titulo?: string;
  /** As notas da Dália. */
  margem?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`folha-pautada relative border-2 border-tinta ${className}`}>
      <div className="pb-5 pl-[50px] pr-4 pt-[14px]">
        {titulo && <h2 className="letra-mao m-0 text-[30px] leading-[28px] text-tinta">{titulo}</h2>}
        {children}
        {margem && <div className="mt-[14px]">{margem}</div>}
      </div>
    </section>
  );
}

/** Algarismos no meio da letra de mão saem em Rubik, que se lê com precisão. */
function comAlgarismos(texto: string): ReactNode {
  return texto.split(/(\d+(?:\/\d+)?)/).map((p, i) =>
    /^\d/.test(p) ? (
      <span key={i} className="font-interface text-[0.78em] font-bold">
        {p}
      </span>
    ) : (
      p
    ),
  );
}

/** Nota da Dália: letra de mão azul, frase curta. */
export function NotaDalia({ children }: { children: ReactNode }) {
  return <p className="letra-mao m-0 -rotate-1 text-[22px] leading-[28px]">{typeof children === "string" ? comAlgarismos(children) : children}</p>;
}
