/**
 * O selo do retorno, no começo do balão do Nônio. A cor nunca é o único sinal: o selo tem
 * sempre a palavra ("Acertou", "Ainda não") e uma forma (visto, ponto).
 *   acertou: fundo verde-pálido, texto e visto em verde-tinta;
 *   ainda não: fundo de folha, borda vermelha, ponto vermelho, texto em tinta. Nunca texto vermelho.
 */
import { IconePonto } from "@/componentes/icones/IconePonto";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import type { SeloFala } from "@/nucleo/tutor/fila";

export function Selo({ tipo }: { tipo: SeloFala }) {
  if (tipo === "acertou") {
    return (
      <span className="selo" data-selo="acertou">
        <IconeVisto />
        Acertou
      </span>
    );
  }
  return (
    <span className="selo" data-selo="ainda-nao">
      <IconePonto />
      Ainda não
    </span>
  );
}
