"use client";

/**
 * Entradas de resposta: número (seletor), fração (fichas) e opções. "Não sei ainda" sempre vale.
 */
import { useState } from "react";
import type { TipoResposta } from "@/nucleo/missoes/tipos";
import { Fracao } from "@/componentes/notacao/Numero";
import { Seletor } from "@/componentes/ui/Seletor";

export function EntradaResposta({
  tipo,
  onResponder,
  rotuloConferir = "Conferir na máquina",
  rotuloNaoSei = "Não sei ainda",
  desabilitado = false,
}: {
  tipo: TipoResposta;
  onResponder: (valor: string | null) => void;
  rotuloConferir?: string;
  rotuloNaoSei?: string;
  desabilitado?: boolean;
}) {
  if (tipo.tipo === "numero") return <RespostaNumero tipo={tipo} onResponder={onResponder} rotuloConferir={rotuloConferir} rotuloNaoSei={rotuloNaoSei} desabilitado={desabilitado} />;
  if (tipo.tipo === "fracao") return <RespostaFracao maximo={tipo.maximo} onResponder={onResponder} rotuloConferir={rotuloConferir} rotuloNaoSei={rotuloNaoSei} desabilitado={desabilitado} />;
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Escolha uma resposta">
      {tipo.opcoes.map((o) => (
        <button key={o.id} type="button" className="placa w-full normal-case" style={{ fontFamily: "var(--fonte-texto)", letterSpacing: 0, fontWeight: 600 }} disabled={desabilitado} onClick={() => onResponder(o.id)} data-opcao={o.id}>
          {o.texto}
        </button>
      ))}
      <button type="button" className="placa placa-discreta w-full" disabled={desabilitado} onClick={() => onResponder(null)} data-acao="nao-sei">
        {rotuloNaoSei}
      </button>
    </div>
  );
}

function RespostaNumero({
  tipo,
  onResponder,
  rotuloConferir,
  rotuloNaoSei,
  desabilitado,
}: {
  tipo: Extract<TipoResposta, { tipo: "numero" }>;
  onResponder: (valor: string | null) => void;
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
}) {
  const [valor, setValor] = useState(Math.max(tipo.minimo, Math.min(tipo.maximo, 1)));
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-center gap-2">
        <Seletor rotulo={tipo.unidade ? `Resposta, em ${tipo.unidade}` : "Resposta"} valor={valor} minimo={tipo.minimo} maximo={tipo.maximo} onMudar={setValor} desabilitado={desabilitado} idTeste="resposta" />
        {tipo.unidade && <span className="text-texto-mundo-suave">{tipo.unidade}</span>}
      </div>
      <div className="flex gap-2">
        <button type="button" className="placa placa-cheia flex-1" disabled={desabilitado} onClick={() => onResponder(String(valor))} data-acao="responder">
          {rotuloConferir}
        </button>
        <button type="button" className="placa placa-discreta" disabled={desabilitado} onClick={() => onResponder(null)} data-acao="nao-sei">
          {rotuloNaoSei}
        </button>
      </div>
    </div>
  );
}

function RespostaFracao({
  maximo,
  onResponder,
  rotuloConferir,
  rotuloNaoSei,
  desabilitado,
}: {
  maximo: number;
  onResponder: (valor: string | null) => void;
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
}) {
  const [n, setN] = useState<number | null>(null);
  const [d, setD] = useState<number | null>(null);
  const [ativa, setAtiva] = useState<"n" | "d">("n");
  const colocar = (k: number) => {
    if (ativa === "n") {
      setN(k);
      setAtiva("d");
    } else {
      setD(k);
    }
  };
  const valor = n === null ? null : d === null || d === 1 ? String(n) : `${n}/${d}`;
  const ficha = (k: number) => (
    <button key={k} type="button" className="placa placa-pequena min-w-[44px] px-0 text-[1.25rem]" disabled={desabilitado} onClick={() => colocar(k)} data-ficha={k}>
      {k}
    </button>
  );
  return (
    <div className="flex flex-col gap-3" data-fichas="">
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center" role="group" aria-label="Fração montada">
          <button type="button" className={`h-12 w-14 rounded-md border-2 text-2xl font-bold ${ativa === "n" ? "border-turquesa" : "border-noite-borda"}`} onClick={() => setAtiva("n")} aria-label={`Numerador: ${n ?? "vazio"}`} data-casa="n">
            {n ?? ""}
          </button>
          <span className="my-1 block h-[3px] w-16 rounded bg-texto-mundo" aria-hidden="true" />
          <button type="button" className={`h-12 w-14 rounded-md border-2 text-2xl font-bold ${ativa === "d" ? "border-turquesa" : "border-noite-borda"}`} onClick={() => setAtiva("d")} aria-label={`Denominador: ${d ?? "vazio"}`} data-casa="d">
            {d ?? ""}
          </button>
        </div>
        <div className="text-texto-mundo-suave">
          {valor ? (
            <span className="text-3xl">
              {d && d !== 1 && n !== null ? <Fracao n={n} d={d} /> : valor}
            </span>
          ) : (
            <span className="text-sm">Toque numa ficha para a casa marcada.</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Fichas">
        {Array.from({ length: maximo }, (_, i) => ficha(i + 1))}
      </div>
      <div className="flex gap-2">
        <button type="button" className="placa placa-cheia flex-1" disabled={desabilitado || valor === null} onClick={() => onResponder(valor)} data-acao="responder">
          {rotuloConferir}
        </button>
        <button
          type="button"
          className="placa placa-discreta"
          disabled={desabilitado}
          onClick={() => {
            setN(null);
            setD(null);
            setAtiva("n");
          }}
        >
          Limpar
        </button>
        <button type="button" className="placa placa-discreta" disabled={desabilitado} onClick={() => onResponder(null)} data-acao="nao-sei">
          {rotuloNaoSei}
        </button>
      </div>
    </div>
  );
}
