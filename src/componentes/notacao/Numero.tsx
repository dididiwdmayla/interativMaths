/**
 * Números escritos em HTML: inteiro, fração empilhada (traço horizontal) ou misto.
 * Sempre com leitura por extenso para leitor de tela.
 */
import { parteInteira, subtrai, inteiro, type Racional } from "@/nucleo/racional/racional";
import { fracaoPorExtenso, racionalPorExtenso } from "@/nucleo/racional/extenso";

export function Fracao({ n, d, pequena = false }: { n: number | string; d: number | string; pequena?: boolean }) {
  const leitura = typeof n === "number" && typeof d === "number" ? fracaoPorExtenso(n, d) : `${n} sobre ${d}`;
  return (
    <span className={`fracao${pequena ? " fracao-pequena" : ""}`} role="img" aria-label={leitura}>
      <span aria-hidden="true">{n}</span>
      <span aria-hidden="true">{d}</span>
    </span>
  );
}

/** Racional exato: 6, 3/4 empilhado, ou 1 1/4 misto. */
export function Numero({ valor, misto = true, pequena = false }: { valor: Racional; misto?: boolean; pequena?: boolean }) {
  if (valor.d === 1) return <span className="algarismos">{valor.n}</span>;
  if (misto && valor.n > valor.d) {
    const k = parteInteira(valor);
    const f = subtrai(valor, inteiro(k));
    return (
      <span role="img" aria-label={racionalPorExtenso(valor, { misto: true })} className="algarismos whitespace-nowrap">
        <span aria-hidden="true">{k}</span>
        <span aria-hidden="true">
          <Fracao n={f.n} d={f.d} pequena={pequena} />
        </span>
      </span>
    );
  }
  return <Fracao n={valor.n} d={valor.d} pequena={pequena} />;
}
