"use client";

/**
 * As operações da rodada: o botão "2/6" do cabeçalho abre a lista, com a marca de cada uma. As
 * feitas mostram a expressão (visto verde quando limpa; tracejada com vai e volta, com ajuda ou
 * ainda não); a de agora a caneta; as seguintes a lápis, sem os números.
 */
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ItemFeito } from "@/nucleo/progresso/tipos";
import { preencher } from "@/nucleo/soroban/textos";
import { TEXTOS_BANCADA } from "@/conteudo/lapidacao";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { IconePonto } from "@/componentes/icones/IconePonto";

export function BotaoOperacoes({ total, feitos, atual }: { total: number; feitos: readonly ItemFeito[]; atual: string }) {
  const [aberta, setAberta] = useState(false);
  const n = Math.min(total, feitos.length + 1);
  return (
    <>
      <button
        type="button"
        className="botao-pequeno botao-etapas"
        aria-label={`Operação ${n} de ${total}`}
        aria-haspopup="dialog"
        onClick={() => setAberta(true)}
        data-etapas="botao"
      >
        <span className="algarismos">
          {n}/{total}
        </span>
      </button>
      {aberta &&
        createPortal(
          <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label={TEXTOS_BANCADA.etapas}>
            <button type="button" className="absolute inset-0 bg-veu" aria-label={TEXTOS_BANCADA.fecharEtapas} onClick={() => setAberta(false)} />
            <div className="painel-sobe relative max-h-[80dvh] w-full overflow-y-auto px-4 pb-5 pt-3 area-segura-base anima-subir lg:max-w-[460px]" data-etapas="folha">
              <div className="alca-folha" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <h2 className="m-0 flex-1 text-[18px] font-extrabold">{TEXTOS_BANCADA.etapas}</h2>
                <button type="button" className="botao-icone" aria-label={TEXTOS_BANCADA.fecharEtapas} onClick={() => setAberta(false)}>
                  <IconeFechar />
                </button>
              </div>
              <ol className="m-0 mt-3 flex flex-col gap-1.5 p-0">
                {Array.from({ length: total }, (_, i) => {
                  const f = feitos[i];
                  const estado = f ? "feito" : i === feitos.length ? "atual" : "depois";
                  return (
                    <li key={i} className="etapa" data-estado={estado} data-marca={f?.marca} aria-current={estado === "atual" ? "step" : undefined}>
                      <span className="etapa-marca" aria-hidden="true">
                        {f ? f.marca === "limpo" ? <IconeVisto /> : f.marca === "ainda-nao" ? <IconePonto /> : <span className="algarismos">{i + 1}</span> : <span className="algarismos">{i + 1}</span>}
                      </span>
                      <span className="algarismos min-w-0 flex-1">{f ? f.resumo : estado === "atual" ? atual : preencher(TEXTOS_BANCADA.operacaoN, { n: i + 1 })}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
