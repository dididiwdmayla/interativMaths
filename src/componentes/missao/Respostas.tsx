"use client";

/**
 * Entradas de resposta: número (passo a passo de valor), fração (fichas) e opções.
 * "Não sei ainda" sempre vale: é um botão secundário do mesmo tamanho do principal.
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
        <button key={o.id} type="button" className="opcao opcao-texto" disabled={desabilitado} onClick={() => onResponder(o.id)} data-opcao={o.id}>
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
}: {
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
  podeConferir?: boolean;
  onConferir: () => void;
  onNaoSei: () => void;
}) {
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
}: {
  tipo: Extract<TipoResposta, { tipo: "numero" }>;
  onResponder: (valor: string | null) => void;
  rotuloConferir: string;
  rotuloNaoSei: string;
  desabilitado: boolean;
}) {
  const [valor, setValor] = useState(Math.max(tipo.minimo, Math.min(tipo.maximo, 1)));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-3">
        <Seletor rotulo={tipo.unidade ? `Resposta, em ${tipo.unidade}` : "Resposta"} valor={valor} minimo={tipo.minimo} maximo={tipo.maximo} onMudar={setValor} desabilitado={desabilitado} idTeste="resposta" />
        {tipo.unidade && <span className="text-[15px] font-semibold text-tinta-suave">{tipo.unidade}</span>}
      </div>
      <Botoes
        rotuloConferir={rotuloConferir}
        rotuloNaoSei={rotuloNaoSei}
        desabilitado={desabilitado}
        onConferir={() => onResponder(String(valor))}
        onNaoSei={() => onResponder(null)}
      />
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
  const casa = (qual: "n" | "d", v: number | null, rotulo: string) => (
    <button
      type="button"
      className={`passo-valor-quadro h-12 w-14 ${ativa === qual ? "outline outline-[3px] outline-offset-2 outline-caneta" : ""}`}
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
      <div className="flex items-center justify-center gap-5">
        <div className="flex flex-col items-center gap-1.5" role="group" aria-label="Fração montada">
          {casa("n", n, "Numerador")}
          <span className="block h-[3px] w-16 rounded bg-tinta" aria-hidden="true" />
          {casa("d", d, "Denominador")}
        </div>
        <div className="min-w-[96px] text-tinta">
          {valor ? (
            <span className="text-[30px] font-extrabold">{d && d !== 1 && n !== null ? <Fracao n={n} d={d} /> : valor}</span>
          ) : (
            <span className="text-[14px] font-semibold text-tinta-suave">Toque numa ficha para a casa marcada.</span>
          )}
        </div>
      </div>
      <div className="opcoes" role="group" aria-label="Fichas" style={{ gridTemplateColumns: `repeat(${Math.min(maximo, 6)}, minmax(0, 1fr))` }}>
        {Array.from({ length: maximo }, (_, i) => i + 1).map((k) => (
          <button key={k} type="button" className="opcao" disabled={desabilitado} onClick={() => colocar(k)} data-ficha={k}>
            {k}
          </button>
        ))}
      </div>
      <Botoes
        rotuloConferir={rotuloConferir}
        rotuloNaoSei={rotuloNaoSei}
        desabilitado={desabilitado}
        podeConferir={valor !== null}
        onConferir={() => onResponder(valor)}
        onNaoSei={() => onResponder(null)}
      />
      <button
        type="button"
        className="botao-discreto self-center"
        disabled={desabilitado || (n === null && d === null)}
        onClick={() => {
          setN(null);
          setD(null);
          setAtiva("n");
        }}
      >
        Limpar a fração
      </button>
    </div>
  );
}
