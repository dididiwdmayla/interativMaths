/**
 * A faixa do objetivo, logo abaixo do cabeçalho: a etiqueta do tipo de passo (Objetivo,
 * Pergunta, Palpite, Aposta do Nônio, Desafio, Registro; Feito depois do acerto), a instrução
 * com verbo e, em caneta com o ícone da mão, o próximo gesto. Depois do acerto, o gesto vira o
 * resumo em verde; depois do "ainda não", diz o que tentar.
 */
import type { Gesto } from "@/nucleo/missoes/gesto";
import { IconeMao } from "@/componentes/icones/IconeMao";
import { IconeVisto } from "@/componentes/icones/IconeVisto";

export type Etiqueta = "Objetivo" | "Pergunta" | "Palpite" | "Aposta do Nônio" | "Desafio" | "Registro" | "Medida" | "Feito";

export function Objetivo({ etiqueta, instrucao, gesto, lembrete = 0 }: { etiqueta: Etiqueta; instrucao: string; gesto: Gesto | null; lembrete?: number }) {
  const feito = etiqueta === "Feito";
  return (
    <div className="objetivo" data-objetivo="">
      <p className="objetivo-linha m-0">
        <span className="objetivo-etiqueta" data-etiqueta={etiqueta}>
          {feito && <IconeVisto />}
          {etiqueta}
        </span>
        <span data-instrucao="">{instrucao}</span>
      </p>
      {gesto && (
        <p
          key={lembrete}
          className={`objetivo-gesto m-0 ${lembrete > 0 ? "anima-lembrete" : ""}`}
          data-gesto={gesto.tom}
          data-tom={gesto.tom}
        >
          {gesto.tom !== "resumo" && <IconeMao />}
          <span>{gesto.texto}</span>
        </p>
      )}
    </div>
  );
}
