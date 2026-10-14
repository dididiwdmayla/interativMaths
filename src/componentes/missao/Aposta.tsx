"use client";

/**
 * A aposta do Nônio: o bilhete amarelo, inclinado, com a aposta à mão; e a bancada com a pergunta,
 * as opções e "Mostrar ao Nônio". A pergunta destrava quando a máquina mostra o que o bilhete diz.
 * Quem perde a aposta é sempre o Nônio, nunca o jogador.
 */
import { useState, type ReactNode } from "react";
import type { Execucao } from "@/nucleo/missoes/motor";
import type { PassoAposta } from "@/nucleo/missoes/tipos";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";
import { comAlgarismos } from "./Papel";

export function Bilhete({ texto }: { texto: string }) {
  return (
    <figure className="bilhete m-0" data-aposta="bilhete" aria-label="A aposta do Nônio">
      <blockquote className="bilhete-texto m-0">{comAlgarismos(texto)}</blockquote>
      <figcaption className="bilhete-assinatura">— Nônio</figcaption>
    </figure>
  );
}

export function PainelAposta({
  passo,
  exec,
  alavanca,
  junto,
  marca,
  onRascunho,
  onResponder,
  onDesfazer,
  onSeguir,
  rascunho,
  conta,
}: {
  /** O rascunho a lápis da máquina, em cima. */
  rascunho?: ReactNode;
  /** A conta passada a caneta, depois do acerto. */
  conta?: ReactNode;
  passo: PassoAposta;
  exec: Execucao;
  /** O lote e Repartir, quando a prova pede a alavanca. */
  alavanca: ReactNode;
  junto: ReactNode;
  /** A resposta que não bateu (passageiro). */
  marca: string | null;
  onRascunho: () => void;
  onResponder: (v: string | null) => void;
  onDesfazer: () => void;
  onSeguir: () => void;
}) {
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const vencido = exec.passo.situacao === "vencido";
  const cumprido = exec.passo.cumprido;
  const opcoes = passo.resposta.tipo === "opcoes" ? passo.resposta.opcoes : [];
  return (
    <div className="flex flex-col gap-3" data-painel="aposta" data-aposta="painel" data-cumprido={cumprido ? "sim" : "nao"}>
      {rascunho}
      {junto}
      {!vencido && alavanca}
      <p className="m-0 text-[14px] font-semibold text-tinta-suave">{passo.pergunta}</p>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(opcoes.length, 3)}, minmax(0, 1fr))` }} role="group" aria-label="Escolha uma resposta">
        {opcoes.map((o) => {
          const naoBateu = marca === o.id;
          const certa = vencido && exec.passo.resposta === o.id;
          return (
            <button
              key={o.id}
              type="button"
              className={`opcao text-[15px] ${naoBateu ? "caixa-ainda-nao" : ""}`}
              aria-pressed={vencido ? certa : escolhida === o.id}
              disabled={!cumprido || vencido}
              onClick={() => {
                setEscolhida(o.id);
                onRascunho();
              }}
              data-opcao={o.id}
              data-ainda-nao={naoBateu ? "" : undefined}
            >
              {o.texto}
            </button>
          );
        })}
      </div>
      {vencido ? (
        <>
          {conta}
          <button type="button" className="botao-principal w-full" onClick={onSeguir} data-acao="seguir">
            Continuar
          </button>
        </>
      ) : (
        <>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="botao-principal min-w-0 flex-1"
            disabled={!cumprido || escolhida === null || escolhida === marca}
            onClick={() => onResponder(escolhida)}
            data-acao="responder"
          >
            Mostrar ao Nônio
          </button>
          <button type="button" className="botao-discreto shrink-0 px-2.5" onClick={onDesfazer} data-acao="desfazer">
            <IconeDesfazer />
            Desfazer
          </button>
        </div>
        {cumprido && (
          <button type="button" className="botao-discreto self-center" onClick={() => onResponder(null)} data-acao="nao-sei">
            Não sei ainda
          </button>
        )}
        </>
      )}
    </div>
  );
}
