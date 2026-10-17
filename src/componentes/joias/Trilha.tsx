/**
 * A trilha dos quatro estágios de uma joia (referência 1 de v05.html): bruta, talhada, lapidada,
 * polida; os alcançados a tinta, os que faltam a lápis, o atual com o rótulo em marca-texto.
 */
import type { Joia } from "@/nucleo/joias/contrato";
import { Gema } from "./Gema";

export const NOMES_ESTAGIO = ["bruta", "talhada", "lapidada", "polida"] as const;

export function Trilha({ joia, estagio, encontrada = true, className = "" }: { joia: Joia; estagio: number; encontrada?: boolean; className?: string }) {
  const rotulo = `Estágios: ${NOMES_ESTAGIO.map((n, i) => (encontrada && i === estagio ? `${n} (agora)` : n)).join(", ")}.`;
  return (
    <svg viewBox="0 0 280 68" className={`traco-fixo block w-full max-w-[300px] ${className}`} role="img" aria-label={rotulo} data-trilha={estagio}>
      {NOMES_ESTAGIO.map((nome, i) => {
        const atual = encontrada && estagio === i;
        const feito = encontrada && estagio >= i;
        return (
          <g key={nome} data-estagio-trilha={i} data-feito={feito ? "sim" : "nao"}>
            <Gema x={i * 70 + 35} y={22} r={15} estagio={i as 0 | 1 | 2 | 3} base={joia.cor.base} luz={joia.cor.luz} lapis={!feito} />
            {atual && <rect x={i * 70 + 9} y={47} width={52} height={17} rx={4} fill="var(--marca-texto)" transform={`rotate(-1.5 ${i * 70 + 35} 56)`} />}
            <text x={i * 70 + 35} y={60} textAnchor="middle" fontSize={12} fontWeight={feito ? 700 : 600} fill={atual ? "var(--sobre-marca)" : feito ? "var(--tinta)" : "var(--tinta-suave)"}>
              {nome}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
