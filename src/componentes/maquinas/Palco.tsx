"use client";

/**
 * O palco de uma máquina. Celular em pé: o pedido numa linha, a máquina numa ficha quadriculada,
 * a tira da mensagem, o balão do Nônio e a bancada de controles embaixo, na zona do polegar.
 * No computador: a máquina numa ficha à esquerda; à direita, o pedido, o Nônio e a bancada.
 * Girar o aparelho só muda o CSS: o estado não se perde.
 */
import type { ReactNode } from "react";
import { useAmbiente } from "@/componentes/ui/useAmbiente";

export function Palco({
  cabecalho,
  pedido,
  maquina,
  tira,
  nonio,
  controles,
  sobreposicao,
  atributos,
}: {
  cabecalho?: ReactNode;
  pedido?: ReactNode;
  maquina: ReactNode;
  tira?: ReactNode;
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
        <section className="palco-maquina ficha-quadriculada" aria-label="Máquina">
          {maquina}
        </section>
        {tira && <div className="palco-tira">{tira}</div>}
        {nonio && <div className="palco-nonio">{nonio}</div>}
        {sobreposicao ? (
          <div className="palco-folha">{sobreposicao}</div>
        ) : (
          controles && <div className="palco-controles bancada-controles">{controles}</div>
        )}
      </div>
    </div>
  );
}
