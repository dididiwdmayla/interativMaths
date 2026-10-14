"use client";

/**
 * A bolinha do Nônio: o Nônio inteiro num círculo de 58 px (44 no celular deitado), sobre o canto
 * inferior direito da máquina. A antena balança devagar de vez em quando; o ponto marca-texto no
 * canto de cima diz que há fala que o jogador não viu. Tocar abre a janelinha.
 */
import { TEXTOS_JANELA } from "@/conteudo/tutor";
import { Nonio, type ExpressaoNonio } from "./Nonio";

export function BolhaNonio({
  expressao,
  novidade,
  onAbrir,
  aberta = false,
}: {
  expressao: ExpressaoNonio;
  novidade: boolean;
  onAbrir: () => void;
  aberta?: boolean;
}) {
  return (
    <button
      type="button"
      className="bolha-nonio"
      onClick={onAbrir}
      aria-label={novidade ? TEXTOS_JANELA.abrirNovidade : TEXTOS_JANELA.abrir}
      aria-haspopup="dialog"
      aria-expanded={aberta}
      data-bolha-nonio=""
      data-novidade={novidade ? "sim" : "nao"}
      data-expressao={expressao}
    >
      <Nonio expressao={expressao} tamanho={46} rotulo="" vivo />
      {novidade && <span className="bolha-ponto" aria-hidden="true" />}
    </button>
  );
}
