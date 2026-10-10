/**
 * Falas da Dália e do Nônio. A Dália não é desenhada: existe pela voz e pela letra, numa ficha.
 * O Nônio fala num balão, ao lado do desenho dele.
 */
import type { Fala } from "@/nucleo/missoes/tipos";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";

export function FalaDalia({ texto, compacta = false }: { texto: string | readonly string[]; compacta?: boolean }) {
  const linhas = typeof texto === "string" ? [texto] : texto;
  return (
    <figure className={`m-0 ${compacta ? "" : "ficha px-4 pb-4 pt-3"}`} data-fala="dalia">
      <figcaption className="letra-mao text-[22px] text-tinta">Dália</figcaption>
      <blockquote className={`m-0 mt-1 flex flex-col gap-2 font-medium leading-[1.4] ${compacta ? "text-[15px]" : "text-[16px]"}`}>
        {linhas.map((l) => (
          <p key={l} className="m-0">
            {l}
          </p>
        ))}
      </blockquote>
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

/** Falas seguidas da mesma pessoa ficam juntas: uma ficha da Dália, um balão do Nônio. */
export function Falas({ falas, compacta = false }: { falas: readonly Fala[]; compacta?: boolean }) {
  const grupos: { quem: Fala["quem"]; textos: string[] }[] = [];
  for (const f of falas) {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.quem === f.quem) ultimo.textos.push(f.texto);
    else grupos.push({ quem: f.quem, textos: [f.texto] });
  }
  return (
    <div className="flex flex-col gap-3">
      {grupos.map((g, i) => (g.quem === "dalia" ? <FalaDalia key={i} texto={g.textos} compacta={compacta} /> : <BalaoNonio key={i} texto={g.textos.join(" ")} compacta={compacta} />))}
    </div>
  );
}
