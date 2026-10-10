"use client";

/**
 * O palco de uma máquina. Celular em pé: máquina em cima, enquadrada sozinha; controles embaixo,
 * na zona do polegar. Deitado ou no computador: máquina de um lado, bancada do outro.
 * Girar o aparelho só muda o CSS: o estado não se perde.
 */
import type { ReactNode } from "react";
import { useAmbiente } from "@/componentes/ui/useAmbiente";

export function Palco({
  topo,
  maquina,
  visor,
  controles,
  sobreposicao,
  atributos,
}: {
  topo?: ReactNode;
  maquina: ReactNode;
  visor?: ReactNode;
  controles: ReactNode;
  /** Algo que cobre a área dos controles (a página do Caderno, pela dobra). */
  sobreposicao?: ReactNode;
  atributos?: Record<string, string>;
}) {
  const ref = useAmbiente<HTMLDivElement>();
  return (
    <div ref={ref} className="palco" {...atributos}>
      <div className="palco-maquina">
        {topo}
        <div className="palco-desenho">{maquina}</div>
        {visor && <div className="area-segura pb-1">{visor}</div>}
      </div>
      <div className="palco-controles">
        <div className="chapa palco-chapa area-segura-base">{controles}</div>
        {sobreposicao}
      </div>
    </div>
  );
}
