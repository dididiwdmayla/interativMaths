/**
 * O mecanismo do Relicário: um relógio aberto com a engrenagem no meio e quatro engastes. Joia
 * encontrada fica no engaste, no estágio dela; engaste vazio, a lápis.
 */
import type { EstadoJoia } from "@/nucleo/progresso";
import { JOIAS } from "@/conteudo/joias";
import { Engrenagem } from "@/componentes/mundo/kit";
import { Gema } from "./Gema";

const ENGASTES: [number, number][] = [
  [150, 74],
  [226, 150],
  [150, 226],
  [74, 150],
];

export function Mecanismo({ joias }: { joias: Readonly<Record<string, EstadoJoia>> }) {
  const achadas = JOIAS.filter((j) => joias[j.id]?.encontrada).length;
  return (
    <svg viewBox="0 0 300 300" className="traco-fixo mx-auto block w-full max-w-[300px]" role="img" aria-label={`Relicário com quatro engastes; ${achadas === 1 ? "1 joia encontrada" : `${achadas} joias encontradas`}.`}>
      <circle cx={150} cy={150} r={124} fill="var(--folha)" stroke="var(--contorno)" strokeWidth={2.6} />
      <circle cx={150} cy={150} r={108} fill="none" stroke="var(--contorno)" strokeWidth={1.6} strokeDasharray="2 7" />
      <rect x={138} y={14} width={24} height={14} rx={4} fill="var(--caneta-clara)" stroke="var(--contorno)" strokeWidth={2.4} />
      <Engrenagem x={150} y={150} r={34} dentes={12} girando />
      {JOIAS.map((j) => {
        const [x, y] = ENGASTES[j.engaste];
        const e = joias[j.id];
        return (
          <g key={j.id} data-engaste={j.id}>
            <circle cx={x} cy={y} r={27} fill={e?.encontrada ? "var(--marca-texto-palido)" : "var(--folha)"} stroke={e?.encontrada ? "var(--contorno)" : "var(--grafite)"} strokeWidth={2.4} strokeDasharray={e?.encontrada ? undefined : "5 5"} />
            {e?.encontrada && <Gema x={x} y={y} r={18} estagio={e.estagio} base={j.cor.base} luz={j.cor.luz} />}
          </g>
        );
      })}
    </svg>
  );
}
