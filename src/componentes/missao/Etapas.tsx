"use client";

/**
 * As etapas da missão: o botão "2/9" do cabeçalho abre uma folha com os passos, só leitura.
 * Feitos com visto verde, o atual a caneta, os seguintes a lápis, cada um com o rótulo curto.
 */
import { useState } from "react";
import type { Passo } from "@/nucleo/missoes/tipos";
import { IconeEtapas } from "@/componentes/icones/IconeEtapas";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { IconeVisto } from "@/componentes/icones/IconeVisto";

export function BotaoEtapas({ passos, atual }: { passos: readonly Passo[]; atual: number }) {
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <button
        type="button"
        className="botao-pequeno"
        aria-label={`Etapas da missão: ${atual + 1} de ${passos.length}`}
        aria-haspopup="dialog"
        onClick={() => setAberta(true)}
        data-etapas="botao"
      >
        <IconeEtapas />
        <span className="algarismos">
          {atual + 1}/{passos.length}
        </span>
      </button>
      {aberta && <FolhaEtapas passos={passos} atual={atual} onFechar={() => setAberta(false)} />}
    </>
  );
}

export function FolhaEtapas({ passos, atual, onFechar }: { passos: readonly Passo[]; atual: number; onFechar: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label="Etapas da missão">
      <button type="button" className="absolute inset-0 bg-veu" aria-label="Fechar as etapas" onClick={onFechar} />
      <div className="painel-sobe relative max-h-[80dvh] w-full overflow-y-auto px-4 pb-5 pt-3 area-segura-base anima-subir lg:max-w-[460px]" data-etapas="folha">
        <div className="alca-folha" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <h2 className="m-0 flex-1 text-[18px] font-extrabold">Etapas</h2>
          <button type="button" className="botao-icone" aria-label="Fechar as etapas" onClick={onFechar}>
            <IconeFechar />
          </button>
        </div>
        <ol className="m-0 mt-3 flex flex-col gap-1.5 p-0">
          {passos.map((p, i) => {
            const estado = i < atual ? "feito" : i === atual ? "atual" : "depois";
            return (
              <li key={p.id} className="etapa" data-estado={estado} aria-current={estado === "atual" ? "step" : undefined}>
                <span className="etapa-marca" aria-hidden="true">
                  {estado === "feito" ? <IconeVisto /> : <span className="algarismos">{i + 1}</span>}
                </span>
                <span className="min-w-0 flex-1">{p.pedido}</span>
                {estado === "feito" && <span className="so-leitor">feito</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
