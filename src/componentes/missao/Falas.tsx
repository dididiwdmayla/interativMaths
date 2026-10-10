/**
 * Falas da Dália e do Nônio. A Dália não é desenhada: existe pela voz e pela letra.
 */
import type { Fala } from "@/nucleo/missoes/tipos";
import { Nonio } from "@/componentes/nonio/Nonio";

export function Falas({ falas, compacta = false }: { falas: readonly Fala[]; compacta?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      {falas.map((f, i) =>
        f.quem === "dalia" ? (
          <figure key={i} className="m-0 border-l-2 border-latao pl-3">
            <figcaption className="fonte-mao text-[1.15rem] leading-none text-latao-claro">Dália</figcaption>
            <blockquote className={`m-0 mt-1 text-texto-mundo ${compacta ? "text-[0.98rem]" : "text-[1.06rem]"}`}>{f.texto}</blockquote>
          </figure>
        ) : (
          <figure key={i} className="m-0 flex items-start gap-2">
            <span className="shrink-0" aria-hidden="true">
              <Nonio tamanho={30} expressao="atento" />
            </span>
            <div>
              <figcaption className="rotulo-chapa text-[0.78rem]">Nônio</figcaption>
              <blockquote className={`m-0 text-texto-mundo-suave ${compacta ? "text-[0.95rem]" : "text-[1.02rem]"}`}>{f.texto}</blockquote>
            </div>
          </figure>
        ),
      )}
    </div>
  );
}
