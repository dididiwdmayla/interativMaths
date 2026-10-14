/**
 * A leitura da máquina fora das missões (calibragem, laboratório): uma linha numa ficha, acima da
 * máquina, com o que ela mostra ou recusou. O ponto vermelho marca recusa e engasgo: informação,
 * nunca "ainda não". O Nônio fica de fora: a calibragem mede, não ensina.
 */
import { IconePonto } from "@/componentes/icones/IconePonto";

export function LeituraMaquina({ texto, atencao = false }: { texto: string; atencao?: boolean }) {
  return (
    <p className="ficha m-0 flex items-start gap-2 px-4 py-2.5 text-[15px] font-medium leading-[1.35]" role="status" aria-live="polite" data-leitura="" data-atencao={atencao ? "sim" : undefined}>
      {atencao && (
        <span className="mt-[3px] flex shrink-0">
          <IconePonto />
        </span>
      )}
      <span>{texto}</span>
    </p>
  );
}
