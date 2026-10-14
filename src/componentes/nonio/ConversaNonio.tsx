"use client";

/**
 * Pergunte ao Nônio (referência 4): uma folha sobre a missão, com véu. No computador, um painel na
 * coluna da direita. O jogador à direita em caneta-pálida; o Nônio à esquerda, em folha.
 * É ajuda, não autoridade: quem diz se está certo é a máquina.
 */
import { useEffect, useRef, useState } from "react";
import { LIMITES_TUTOR } from "@/nucleo/tutor/contrato";
import { TEXTOS_CONVERSA } from "@/conteudo/tutor";
import { IconeEnviar } from "@/componentes/icones/IconeEnviar";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { Nonio } from "./Nonio";
import type { MensagemTela } from "./useConversa";

export function ConversaNonio({
  mensagens,
  esperando,
  sugestoes,
  fechada,
  aviso,
  onEntendi,
  onEnviar,
  onFechar,
}: {
  mensagens: readonly MensagemTela[];
  esperando: boolean;
  sugestoes: readonly string[];
  /** Chegou ao limite de perguntas desta execução: o campo fecha. */
  fechada: boolean;
  /** Primeiro uso: o aviso de privacidade antes da primeira pergunta. */
  aviso: boolean;
  onEntendi: () => void;
  onEnviar: (texto: string) => void;
  onFechar: () => void;
}) {
  const [texto, setTexto] = useState("");
  const campo = useRef<HTMLInputElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const bloqueada = aviso || fechada || esperando;

  useEffect(() => {
    if (!aviso) campo.current?.focus({ preventScroll: true });
  }, [aviso]);
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensagens.length, esperando]);

  const enviar = (t: string) => {
    const limpo = t.trim().slice(0, LIMITES_TUTOR.pergunta);
    if (!limpo || bloqueada) return;
    onEnviar(limpo);
    setTexto("");
  };
  const feitas = new Set(mensagens.filter((m) => m.autor === "jogador").map((m) => m.texto));
  const restantes = sugestoes.filter((s) => !feitas.has(s));

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col justify-end lg:items-end lg:justify-stretch"
      role="dialog"
      aria-modal="true"
      aria-label={TEXTOS_CONVERSA.titulo}
      data-conversa="folha"
      onKeyDown={(e) => {
        if (e.key === "Escape") onFechar();
      }}
    >
      <button type="button" className="absolute inset-0 bg-veu" aria-label={TEXTOS_CONVERSA.fechar} onClick={onFechar} tabIndex={-1} />
      <section className="painel-sobe conversa-folha relative flex w-full flex-col gap-3 px-3.5 pb-4 pt-2.5 area-segura-base anima-subir">
        <div className="alca-folha lg:hidden" aria-hidden="true" />
        <header className="flex items-center gap-2.5">
          <Nonio expressao={esperando ? "medindo" : "neutro"} tamanho={50} rotulo="" />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="m-0 text-[18px] font-extrabold">{TEXTOS_CONVERSA.titulo}</h2>
            <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{TEXTOS_CONVERSA.subtitulo}</p>
          </div>
          <button type="button" className="botao-icone" aria-label={TEXTOS_CONVERSA.fechar} onClick={onFechar} data-acao="fechar-conversa">
            <IconeFechar />
          </button>
        </header>

        <div ref={lista} className="conversa-lista" aria-live="polite" data-conversa="lista">
          {aviso ? (
            <div className="conversa-ele flex flex-col items-start" data-conversa="aviso">
              <span className="balao-nonio-nome block">Nônio</span>
              <p className="m-0">{TEXTOS_CONVERSA.aviso}</p>
              <button type="button" className="botao-pequeno mt-2.5" onClick={onEntendi} data-acao="entendi-conversa">
                {TEXTOS_CONVERSA.entendi}
              </button>
            </div>
          ) : (
            mensagens.length === 0 && (
              <div className="conversa-ele" data-conversa="nonio">
                <span className="balao-nonio-nome block">Nônio</span>
                {TEXTOS_CONVERSA.abertura}
              </div>
            )
          )}
          {mensagens.map((m, i) =>
            m.autor === "jogador" ? (
              <div key={m.id} className="conversa-eu" data-conversa="jogador">
                {m.texto}
              </div>
            ) : (
              <div key={m.id} className="conversa-ele" data-conversa="nonio" data-aviso={m.aviso ? "sim" : undefined}>
                {(i === 0 || mensagens[i - 1].autor === "jogador") && <span className="balao-nonio-nome block">Nônio</span>}
                {m.texto}
              </div>
            ),
          )}
          {esperando && (
            <div className="conversa-ele" data-conversa="esperando" aria-label="O Nônio está pensando">
              <span className="conversa-reticencias" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
        </div>

        {!fechada && restantes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{TEXTOS_CONVERSA.sugestoes}</p>
            <div className="conversa-sugestoes">
              {restantes.slice(0, 3).map((s) => (
                <button key={s} type="button" className="chip-pergunta" disabled={bloqueada} onClick={() => enviar(s)} data-sugestao="">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="m-0 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <label className="so-leitor" htmlFor="pergunta-nonio">
            {TEXTOS_CONVERSA.rotuloCampo}
          </label>
          <input
            ref={campo}
            id="pergunta-nonio"
            type="text"
            className="campo-pergunta"
            placeholder={TEXTOS_CONVERSA.campo}
            value={texto}
            maxLength={LIMITES_TUTOR.pergunta}
            disabled={aviso || fechada}
            onChange={(e) => setTexto(e.target.value)}
            autoComplete="off"
            data-conversa="campo"
          />
          <button type="submit" className="botao-enviar" aria-label={TEXTOS_CONVERSA.enviar} disabled={bloqueada || texto.trim().length === 0} data-acao="enviar-pergunta">
            <IconeEnviar />
          </button>
        </form>
        <p className="m-0 text-center text-[12px] font-medium text-tinta-suave">{TEXTOS_CONVERSA.rodape}</p>
      </section>
    </div>
  );
}
