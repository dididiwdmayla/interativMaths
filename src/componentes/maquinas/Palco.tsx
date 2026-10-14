"use client";

/**
 * O palco de uma máquina. Celular em pé: a linha do objetivo, a máquina numa ficha
 * quadriculada (a protagonista, com o Nônio em bolinha no canto de baixo à direita) e a bancada
 * de controles embaixo, na zona do polegar. No computador: a máquina numa ficha à esquerda; à
 * direita, o objetivo, a nota e a bancada. Girar o aparelho só muda o CSS: o estado não se perde.
 */
import type { ReactNode } from "react";
import { useAmbiente } from "@/componentes/ui/useAmbiente";

export function Palco({
  cabecalho,
  pedido,
  nota,
  maquina,
  nonio,
  controles,
  sobreposicao,
  atributos,
}: {
  cabecalho?: ReactNode;
  pedido?: ReactNode;
  /** Acima da máquina: o bilhete da aposta, a fala da Dália quando a máquina muda, o desvio. */
  nota?: ReactNode;
  maquina: ReactNode;
  /** O Nônio flutuante (bolinha e recado), por cima do canto inferior direito da máquina. */
  nonio?: ReactNode;
  controles?: ReactNode;
  /** Algo que ocupa o lugar dos controles (a folha pautada do Caderno, que sobe). */
  sobreposicao?: ReactNode;
  atributos?: Record<string, string>;
}) {
  const ref = useAmbiente<HTMLDivElement>();
  return (
    <div ref={ref} className="palco" {...atributos}>
      {cabecalho}
      <div className="palco-grade" data-folha-aberta={sobreposicao ? "sim" : "nao"}>
        {pedido && <div className="palco-pedido">{pedido}</div>}
        {nota && !sobreposicao && <div className="palco-nota">{nota}</div>}
        <section className="palco-maquina ficha-quadriculada" aria-label="Máquina">
          {maquina}
          {nonio}
        </section>
        {sobreposicao ? (
          <div className="palco-folha">{sobreposicao}</div>
        ) : (
          controles && <div className="palco-controles bancada-controles">{controles}</div>
        )}
      </div>
    </div>
  );
}
