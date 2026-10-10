/**
 * Falas da Dália e do Nônio. A Dália não é desenhada: existe pela voz e pela letra, numa ficha.
 * O Nônio fala num balão, ao lado do desenho dele.
 */
import type { Fala } from "@/nucleo/missoes/tipos";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";

export function FalaDalia({ texto, compacta = false }: { texto: string; compacta?: boolean }) {
  return (
    <figure className={`m-0 ${compacta ? "" : "ficha px-4 pb-4 pt-3"}`} data-fala="dalia">
      <figcaption className="letra-mao text-[22px] text-tinta">Dália</figcaption>
      <blockquote className={`m-0 mt-1 font-medium leading-[1.4] ${compacta ? "text-[15px]" : "text-[16px]"}`}>{texto}</blockquote>
    </figure>
  );
}

export function BalaoNonio({ texto, expressao = "neutro", compacta = false }: { texto: string; expressao?: ExpressaoNonio; compacta?: boolean }) {
  return (
    <figure className="m-0 flex items-end gap-2.5" data-fala="nonio">
      <Nonio expressao={expressao} tamanho={compacta ? 48 : 60} rotulo="" />
      <div className="balao-nonio min-w-0 flex-1">
        <figcaption className="balao-nonio-nome">Nônio</figcaption>
        <blockquote className="m-0 text-[15px] font-medium leading-[1.35]">{texto}</blockquote>
      </div>
    </figure>
  );
}

export function Falas({ falas, compacta = false }: { falas: readonly Fala[]; compacta?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {falas.map((f, i) => (f.quem === "dalia" ? <FalaDalia key={i} texto={f.texto} compacta={compacta} /> : <BalaoNonio key={i} texto={f.texto} compacta={compacta} />))}
    </div>
  );
}
