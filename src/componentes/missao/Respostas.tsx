"use client";

/**
 * Entradas de resposta: número (passo a passo de valor), fração (fichas) e opções.
 * "Não sei ainda" sempre vale: é um botão secundário do mesmo tamanho do principal.
 * A resposta que não bateu fica com borda vermelha e névoa até o primeiro toque seguinte.
 */
import { useState } from "react";
import type { TipoResposta } from "@/nucleo/missoes/tipos";
import { Fracao } from "@/componentes/notacao/Numero";
import { Seletor } from "@/componentes/ui/Seletor";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";

export interface MarcaResposta {
  /** A resposta que não bateu (passageiro: some no primeiro toque). */
  readonly valor: string | null;
  readonly onRascunho: () => void;
  /** Depois de um "ainda não": o Me ajuda vem para perto do conferir. */
  readonly ajuda?: { readonly rotulo: string; readonly onPedir: () => void } | null;
}

export function EntradaResposta({
  tipo,
  onResponder,
  rotuloConferir = "Conferir",
  rotuloNaoSei = "Não sei ainda",
  desabilitado = false,
  marca,
}: {
  tipo: TipoResposta;
  onResponder: (valor: string | null) => void;
  rotuloConferir?: string;
  rotuloNaoSei?: string;
  desabilitado?: boolean;
  marca?: MarcaResposta;
}) {
  if (tipo.tipo === "numero") return <RespostaNumero tipo={tipo} onResponder={onResponder} rotuloConferir={rotuloConferir} rotuloNaoSei={rotuloNaoSei} desabilitado={desabilitado} marca={marca} />;
  if (tipo.tipo === "fracao") return <RespostaFracao tipo={tipo} onResponder={onResponder} rotuloConferir={rotuloConferir} rotuloNaoSei={rotuloNaoSei} desabilitado={desabilitado} marca={marca} />;
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Escolha uma resposta">
      {tipo.opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`opcao opcao-texto ${marca?.valor === o.id ? "caixa-ainda-nao" : ""}`}
          disabled={desabilitado}
          onClick={() => onResponder(o.id)}
          data-opcao={o.id}
          data-ainda-nao={marca?.valor === o.id ? "" : undefined}
        >
          {o.texto}
        </button>
      ))}
      <button type="button" className="botao-secundario mt-1 w-full" disabled={desabilitado} onClick={() => onResponder(null)} data-acao="nao-sei">
        {rotuloNaoSei}
      </button>
    </div>
  );
}

function Botoes({
  rotuloConferir,
  rotuloNaoSei,
  desabilitado,
  podeConferir = true,
  onConferir,
  onNaoSei,
  marca,
}: {
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
  podeConferir?: boolean;
  onConferir: () => void;
  onNaoSei: () => void;
  marca?: MarcaResposta;
}) {
  // Depois de um "ainda não": conferir de novo e o Me ajuda lado a lado; "não sei" continua valendo.
  if (marca?.ajuda) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button type="button" className="botao-principal min-w-0 flex-1 px-2" disabled={desabilitado || !podeConferir} onClick={onConferir} data-acao="responder">
            {rotuloConferir}
          </button>
          <button type="button" className="botao-secundario shrink-0" onClick={marca.ajuda.onPedir} data-acao="nonio">
            {marca.ajuda.rotulo}
          </button>
        </div>
        <button type="button" className="botao-discreto self-center" disabled={desabilitado} onClick={onNaoSei} data-acao="nao-sei">
          {rotuloNaoSei}
        </button>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" className="botao-principal px-2" disabled={desabilitado || !podeConferir} onClick={onConferir} data-acao="responder">
        {rotuloConferir}
      </button>
      <button type="button" className="botao-secundario min-h-[50px] px-2" disabled={desabilitado} onClick={onNaoSei} data-acao="nao-sei">
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
  marca,
}: {
  tipo: Extract<TipoResposta, { tipo: "numero" }>;
  onResponder: (valor: string | null) => void;
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
  marca?: MarcaResposta;
}) {
  const [valor, setValor] = useState(Math.max(tipo.minimo, Math.min(tipo.maximo, 1)));
  const marcado = marca?.valor !== null && marca?.valor !== undefined && marca.valor === String(valor);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-3">
        <Seletor
          rotulo={tipo.unidade ? `Resposta, em ${tipo.unidade}` : "Resposta"}
          valor={valor}
          minimo={tipo.minimo}
          maximo={tipo.maximo}
          onMudar={(v) => {
            setValor(v);
            marca?.onRascunho();
          }}
          desabilitado={desabilitado}
          idTeste="resposta"
          marcado={marcado}
        />
        {tipo.unidade && <span className="text-[15px] font-semibold text-tinta-suave">{tipo.unidade}</span>}
      </div>
      <Botoes
        rotuloConferir={rotuloConferir}
        rotuloNaoSei={rotuloNaoSei}
        desabilitado={desabilitado}
        onConferir={() => onResponder(String(valor))}
        onNaoSei={() => onResponder(null)}
        marca={marca}
      />
    </div>
  );
}

function RespostaFracao({
  tipo,
  onResponder,
  rotuloConferir,
  rotuloNaoSei,
  desabilitado,
  marca,
}: {
  tipo: Extract<TipoResposta, { tipo: "fracao" }>;
  onResponder: (valor: string | null) => void;
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
  marca?: MarcaResposta;
}) {
  const [n, setN] = useState<number | null>(null);
  const [d, setD] = useState<number | null>(null);
  const [ativa, setAtiva] = useState<"n" | "d">("n");
  const fichas = tipo.fichas ?? Array.from({ length: tipo.maximo }, (_, i) => i + 1);
  const colocar = (k: number) => {
    marca?.onRascunho();
    if (ativa === "n") {
      setN(k);
      setAtiva("d");
    } else {
      setD(k);
    }
  };
  const valor = n === null ? null : d === null || d === 1 ? String(n) : `${n}/${d}`;
  const marcada = marca?.valor !== null && marca?.valor !== undefined && marca.valor === valor;
  const casa = (qual: "n" | "d", v: number | null, rotulo: string) => (
    <button
      type="button"
      className={`passo-valor-quadro h-11 w-[52px] ${marcada ? "caixa-ainda-nao" : ativa === qual ? "outline outline-[3px] outline-offset-2 outline-caneta" : ""}`}
      onClick={() => setAtiva(qual)}
      aria-label={`${rotulo}: ${v ?? "vazio"}`}
      aria-pressed={ativa === qual}
      data-casa={qual}
    >
      {v ?? ""}
    </button>
  );
  return (
    <div className="flex flex-col gap-3" data-fichas="">
      <div className="flex items-center justify-center gap-3">
        {tipo.moldura && <span className="text-[15px] font-semibold">{tipo.moldura.antes}</span>}
        <div className="flex flex-col items-center gap-1" role="group" aria-label="Fração montada">
          {casa("n", n, "Numerador")}
          <span className="block h-[3px] w-[58px] rounded bg-tinta" aria-hidden="true" />
          {casa("d", d, "Denominador")}
        </div>
        {tipo.moldura ? (
          <span className="text-[15px] font-semibold">{tipo.moldura.depois}</span>
        ) : (
          <div className="min-w-[96px] text-tinta">
            {valor ? (
              <span className="text-[30px] font-extrabold">{d && d !== 1 && n !== null ? <Fracao n={n} d={d} /> : valor}</span>
            ) : (
              <span className="text-[14px] font-semibold text-tinta-suave">Toque numa ficha para a casa marcada.</span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Fichas">
        {fichas.map((k) => (
          <button key={k} type="button" className="ficha-numero" disabled={desabilitado} onClick={() => colocar(k)} data-ficha={k}>
            {k}
          </button>
        ))}
        <button
          type="button"
          className="botao-discreto ml-auto px-1"
          disabled={desabilitado || (n === null && d === null)}
          onClick={() => {
            marca?.onRascunho();
            setN(null);
            setD(null);
            setAtiva("n");
          }}
          data-acao="limpar"
        >
          <IconeDesfazer />
          Limpar
        </button>
      </div>
      <Botoes
        rotuloConferir={rotuloConferir}
        rotuloNaoSei={rotuloNaoSei}
        desabilitado={desabilitado}
        podeConferir={valor !== null}
        onConferir={() => onResponder(valor)}
        onNaoSei={() => onResponder(null)}
        marca={marca}
      />
    </div>
  );
}
