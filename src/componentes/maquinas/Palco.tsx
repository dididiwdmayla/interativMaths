"use client";

/**
 * O palco de uma máquina. Celular em pé: a linha do objetivo, a máquina numa ficha
 * quadriculada, a faixa do Nônio e a bancada de controles embaixo, na zona do polegar.
 * No computador: a máquina numa ficha à esquerda; à direita, o objetivo, o Nônio e a bancada.
 * Girar o aparelho só muda o CSS: o estado não se perde.
 */
import type { ReactNode } from "react";
import { useAmbiente } from "@/componentes/ui/useAmbiente";

export function Palco({
  cabecalho,
  pedido,
  maquina,
  faixa,
  controles,
  sobreposicao,
  atributos,
}: {
  cabecalho?: ReactNode;
  pedido?: ReactNode;
  maquina: ReactNode;
  /** A faixa do Nônio (e o que mora com ela: desvio, categoria da Rua). */
  faixa?: ReactNode;
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
        {faixa && !sobreposicao && <div className="palco-faixa">{faixa}</div>}
        {sobreposicao ? (
          <div className="palco-folha">{sobreposicao}</div>
        ) : (
          controles && <div className="palco-controles bancada-controles">{controles}</div>
        )}
      </div>
    </div>
  );
}
