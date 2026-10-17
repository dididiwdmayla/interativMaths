"use client";

/**
 * A janelinha do Nônio (referência 2 de v04.html). No celular, uma folha que sobe de baixo com
 * uns 60% da altura: o topo da máquina continua à vista para ele apontar. No computador, um
 * painel de 400 px ancorado acima da bolinha. Deitado, a metade direita da tela.
 *
 * Dentro: a fala atual, grande; até três falas anteriores do passo; o Me ajuda com os quatro
 * degraus (olhar, medir, caso parecido, fazer junto), o caso parecido aberto aqui mesmo, com
 * voltar; e o Pergunte por escrito (as regras da conversa da v0.3 não mudam). Fecha no X, tocando
 * fora, arrastando a folha para baixo ou com Esc.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { FalaFaixa, SeloFala } from "@/nucleo/tutor/fila";
import { LIMITES_TUTOR } from "@/nucleo/tutor/contrato";
import { TEXTOS_CONVERSA, TEXTOS_JANELA } from "@/conteudo/tutor";
import { IconeAjuda } from "@/componentes/icones/IconeAjuda";
import { IconeEnviar } from "@/componentes/icones/IconeEnviar";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { Selo } from "@/componentes/missao/Selo";
import { Nonio, type ExpressaoNonio } from "./Nonio";
import type { MensagemTela } from "./useConversa";

export interface AjudaJanela {
  readonly rotulo: string;
  readonly onPedir: () => void;
  /** Degrau mais alto já usado (0 a 4). */
  readonly nivel: number;
  /** O Nônio ofereceu: o botão ganha a bolinha amarela. */
  readonly oferta: boolean;
}

export interface ConversaJanela {
  readonly mensagens: readonly MensagemTela[];
  readonly esperando: boolean;
  readonly sugestoes: readonly string[];
  /** Chegou ao limite de perguntas desta execução: o campo fecha. */
  readonly fechada: boolean;
  /** Primeiro uso: o aviso de privacidade antes da primeira pergunta. */
  readonly aviso: boolean;
  readonly onEntendi: () => void;
  readonly onEnviar: (texto: string) => void;
}

/** Com Cache Components, telas visitadas ficam escondidas no DOM: só a bolinha visível conta. */
function bolhaVisivel(): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>("[data-bolha-nonio]")) {
    if (el.getClientRects().length > 0) return el;
  }
  return null;
}

/** Arrastar a folha para baixo mais que isso fecha. */
const ARRASTE_FECHA = 90;

export function JanelaNonio({
  fala,
  selo,
  expressao,
  apontando,
  antes,
  ajuda,
  caso,
  extra,
  conversa,
  onFechar,
  rotuloAntes = TEXTOS_JANELA.antes,
}: {
  fala: Pick<FalaFaixa, "id" | "texto">;
  selo: SeloFala | null;
  expressao: ExpressaoNonio;
  /** "Apontando a broa na esteira", ou null. */
  apontando: string | null;
  antes: readonly Pick<FalaFaixa, "id" | "texto">[];
  ajuda: AjudaJanela | null;
  /** O caso parecido (degrau 3), aberto dentro da janelinha. */
  caso: { readonly conteudo: ReactNode; readonly onVoltar: () => void } | null;
  /** Um convite que mora com o Nônio (a sondagem). */
  extra?: ReactNode;
  /** null: sem a conversa (sem chave no servidor, sondagem, preferência desligada). */
  conversa: ConversaJanela | null;
  onFechar: () => void;
  /** "Antes, neste passo:" na missão; "Antes, nesta operação:" na bancada. */
  rotuloAntes?: string;
}) {
  const painel = useRef<HTMLElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const [arraste, setArraste] = useState<{ inicio: number; dy: number } | null>(null);

  // No computador, o painel fica ancorado acima da bolinha.
  useLayoutEffect(() => {
    const el = painel.current;
    if (!el) return;
    const ancorar = () => {
      const b = bolhaVisivel();
      if (!b) return;
      const r = b.getBoundingClientRect();
      el.style.setProperty("--janela-direita", `${Math.max(12, window.innerWidth - r.right)}px`);
      el.style.setProperty("--janela-base", `${Math.max(12, window.innerHeight - r.top + 12)}px`);
      el.style.setProperty("--janela-altura", `${Math.max(320, r.top - 24)}px`);
    };
    ancorar();
    window.addEventListener("resize", ancorar);
    return () => window.removeEventListener("resize", ancorar);
  }, []);

  useEffect(() => {
    fechar.current?.focus({ preventScroll: true });
  }, []);

  const soltar = () => {
    if (arraste && arraste.dy > ARRASTE_FECHA) onFechar();
    setArraste(null);
  };

  return (
    <>
      {/* O véu e a folha são irmãos: a máquina pode subir entre os dois quando ele aponta. */}
      <button type="button" className="janela-nonio-veu" aria-label={TEXTOS_JANELA.fechar} onClick={onFechar} tabIndex={-1} />
      <section
        ref={painel}
        className="janela-nonio anima-subir"
        role="dialog"
        aria-modal="true"
        aria-label={TEXTOS_JANELA.nome}
        data-janela-nonio=""
        onKeyDown={(e) => {
          if (e.key === "Escape") onFechar();
        }}
        style={arraste && arraste.dy > 0 ? { transform: `translateY(${arraste.dy}px)` } : undefined}
        data-arrastando={arraste ? "sim" : undefined}
      >
        <div
          className="janela-nonio-pega"
          onPointerDown={(e) => {
            // O X continua sendo um botão: arrastar começa fora dele.
            if ((e.target as HTMLElement).closest("button")) return;
            setArraste({ inicio: e.clientY, dy: 0 });
            e.currentTarget.setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (arraste) setArraste({ ...arraste, dy: Math.max(0, e.clientY - arraste.inicio) });
          }}
          onPointerUp={soltar}
          onPointerCancel={() => setArraste(null)}
        >
          <div className="alca-folha" aria-hidden="true" />
          <header className="flex items-center gap-2.5">
            <Nonio expressao={expressao} tamanho={50} rotulo="" />
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="m-0 text-[18px] font-extrabold leading-tight">{TEXTOS_JANELA.nome}</h2>
              <p className="m-0 truncate text-[12.5px] font-semibold text-tinta-suave" data-apontando={apontando ? "sim" : "nao"}>
                {apontando ?? TEXTOS_JANELA.semAlvo}
              </p>
            </div>
            <button ref={fechar} type="button" className="botao-icone" aria-label={TEXTOS_JANELA.fechar} onClick={onFechar} data-acao="fechar-janela">
              <IconeFechar />
            </button>
          </header>
        </div>

        <div className="janela-nonio-corpo">
          {caso ? (
            <div className="flex flex-col gap-3" data-janela="caso">
              {caso.conteudo}
              <button type="button" className="botao-secundario w-full" onClick={caso.onVoltar} data-acao="voltar-do-caso">
                {TEXTOS_JANELA.voltarDoCaso}
              </button>
            </div>
          ) : (
            <>
              <div className="janela-balao" data-fala-janela={fala.id}>
                {selo && (
                  <span className="mb-1.5 flex">
                    <Selo tipo={selo} />
                  </span>
                )}
                {fala.texto}
              </div>
              {antes.length > 0 && (
                <p className="janela-antes m-0" data-antes={antes.length}>
                  {rotuloAntes}{" "}
                  {antes.map((f) => (
                    <span key={f.id}>“{f.texto}” </span>
                  ))}
                </p>
              )}
              {extra}
              {ajuda && <Escada ajuda={ajuda} />}
              {conversa && (
                <>
                  <div className="janela-separador" aria-hidden="true" />
                  <PerguntaEscrita c={conversa} />
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** O Me ajuda e a barrinha dos quatro degraus. */
function Escada({ ajuda }: { ajuda: AjudaJanela }) {
  return (
    <div className="flex items-center gap-2.5" data-escada={ajuda.nivel}>
      <button type="button" className="botao-secundario relative shrink-0" onClick={ajuda.onPedir} data-acao="nonio">
        <IconeAjuda />
        {ajuda.rotulo}
        {ajuda.oferta && <span className="anima-oferta absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-contorno bg-marca-texto" aria-hidden="true" />}
      </button>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex gap-[5px]" aria-hidden="true">
          {[1, 2, 3, 4].map((d) => (
            <span key={d} className="janela-degrau" data-feito={ajuda.nivel >= d ? "sim" : "nao"} />
          ))}
        </div>
        <p className="m-0 text-[12px] font-semibold leading-tight text-tinta-suave">
          <span className="so-leitor">{ajuda.nivel > 0 ? `Degrau ${ajuda.nivel} de 4. ` : "Quatro degraus: "}</span>
          {TEXTOS_JANELA.degraus}
        </p>
      </div>
    </div>
  );
}

/** Pergunte por escrito: as sugestões, a conversa, o campo e a nota da IA. */
function PerguntaEscrita({ c }: { c: ConversaJanela }) {
  const [texto, setTexto] = useState("");
  const lista = useRef<HTMLDivElement>(null);
  const bloqueada = c.aviso || c.fechada || c.esperando;
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [c.mensagens.length, c.esperando]);
  const enviar = (t: string) => {
    const limpo = t.trim().slice(0, LIMITES_TUTOR.pergunta);
    if (!limpo || bloqueada) return;
    c.onEnviar(limpo);
    setTexto("");
  };
  const feitas = new Set(c.mensagens.filter((m) => m.autor === "jogador").map((m) => m.texto));
  const restantes = c.sugestoes.filter((s) => !feitas.has(s));
  return (
    <section className="flex flex-col gap-2" aria-label={TEXTOS_CONVERSA.titulo} data-conversa="secao">
      <p className="m-0 text-[12.5px] font-bold text-tinta-suave">{TEXTOS_CONVERSA.titulo}</p>
      {c.aviso && (
        <div className="conversa-ele flex flex-col items-start" data-conversa="aviso">
          <p className="m-0">{TEXTOS_CONVERSA.aviso}</p>
          <button type="button" className="botao-pequeno mt-2.5" onClick={c.onEntendi} data-acao="entendi-conversa">
            {TEXTOS_CONVERSA.entendi}
          </button>
        </div>
      )}
      {c.mensagens.length > 0 && (
        <div className="flex flex-col gap-2" aria-live="polite" data-conversa="lista">
          {c.mensagens.map((m) =>
            m.autor === "jogador" ? (
              <div key={m.id} className="conversa-eu" data-conversa="jogador">
                {m.texto}
              </div>
            ) : (
              <div key={m.id} className="conversa-ele" data-conversa="nonio" data-aviso={m.aviso ? "sim" : undefined}>
                {m.texto}
              </div>
            ),
          )}
          {c.esperando && (
            <div className="conversa-ele" data-conversa="esperando" aria-label="O Nônio está pensando">
              <span className="conversa-reticencias" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          <div ref={lista} />
        </div>
      )}
      {!c.fechada && restantes.length > 0 && (
        <div className="conversa-sugestoes">
          {restantes.slice(0, 3).map((s) => (
            <button key={s} type="button" className="chip-pergunta" disabled={bloqueada} onClick={() => enviar(s)} data-sugestao="">
              {s}
            </button>
          ))}
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
          id="pergunta-nonio"
          type="text"
          className="campo-pergunta"
          placeholder={TEXTOS_CONVERSA.campo}
          value={texto}
          maxLength={LIMITES_TUTOR.pergunta}
          disabled={c.aviso || c.fechada}
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
  );
}
