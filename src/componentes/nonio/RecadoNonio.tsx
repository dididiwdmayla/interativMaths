"use client";

/**
 * O recado: a fala curta do Nônio, à esquerda da bolinha, com o canto de baixo à direita
 * apontando para ela. Até 60 caracteres; quando é retorno, o selo vem na frente. Some no primeiro
 * gesto ou depois de uns segundos (quem decide é useNonio). Tocar abre a janelinha.
 * É só desenho: o leitor de tela ouve a fala inteira na região viva da tela.
 */
import type { SeloFala } from "@/nucleo/tutor/fila";
import { Selo } from "@/componentes/missao/Selo";

export function RecadoNonio({ texto, selo, onTocar }: { texto: string; selo: SeloFala | null; onTocar: () => void }) {
  return (
    <button type="button" className="recado-nonio anima-esmaecer" onClick={onTocar} tabIndex={-1} aria-hidden="true" data-recado="" data-selo={selo ?? undefined}>
      {selo && <Selo tipo={selo} />}
      <span>{texto}</span>
    </button>
  );
}
