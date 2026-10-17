/**
 * A faixa da operação (referências 3, 4 e 5 de v05.html): a etiqueta do verbo (Mostre, Leia, Some,
 * Subtraia; Feito em verde depois do acerto), a operação grande com o algarismo da vez em
 * marca-texto e os já feitos sublinhados em verde, e a linha do gesto em caneta.
 */
import type { EstadoItem } from "@/nucleo/soroban/item";
import { lanceAtual, modoDoItem } from "@/nucleo/soroban/item";
import { algarismosDe, resultadoDe } from "@/nucleo/soroban/operacao";
import { IconeMao } from "@/componentes/icones/IconeMao";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { IconePonto } from "@/componentes/icones/IconePonto";
import { VERBOS_OPERACAO } from "@/conteudo/lapidacao";

type EstadoAlgarismo = "agora" | "feito" | "";

/** O estado de cada algarismo do segundo número: o da vez, os já feitos. */
function estadosDoSegundo(e: EstadoItem, b: number): EstadoAlgarismo[] {
  const digitos = algarismosDe(b);
  const atual = lanceAtual(e);
  const fechados = e.terminado ? Infinity : e.fechados.length;
  let lance = 0;
  return digitos.map((d) => {
    if (d === 0) return fechados > lance ? "feito" : "";
    lance += 1;
    if (fechados > lance) return "feito";
    if (atual && atual.indice === lance) return "agora";
    return "";
  });
}

export function FaixaOperacao({ e, gesto, tom }: { e: EstadoItem; gesto: string | null; tom: "gesto" | "acertou" | "ainda-nao" }) {
  const op = e.item.operacao;
  const modo = modoDoItem(e.item);
  const feito = e.terminado && tom !== "ainda-nao";
  const verbo = feito ? VERBOS_OPERACAO.feito : VERBOS_OPERACAO[op.tipo];
  const atual = lanceAtual(e);
  const mostrandoPrimeiro = atual !== null && atual.indice === 0 && (op.tipo === "somar" || op.tipo === "subtrair");
  const visivelDigitos = modo === "maos";
  let operacao: React.ReactNode;
  if (op.tipo === "somar" || op.tipo === "subtrair") {
    const estados = visivelDigitos ? estadosDoSegundo(e, op.b) : algarismosDe(op.b).map((): EstadoAlgarismo => "");
    operacao = (
      <>
        <span className={`alg ${mostrandoPrimeiro ? "alg-agora" : ""}`}>{op.a}</span>
        <span className="faixa-sinal">{op.tipo === "somar" ? "+" : "−"}</span>
        <span>
          {algarismosDe(op.b).map((d, i) => (
            <span key={i} className={`alg ${estados[i] === "agora" ? "alg-agora" : estados[i] === "feito" ? "alg-feito" : ""}`} data-algarismo-op={estados[i] || "depois"}>
              {d}
            </span>
          ))}
        </span>
        <span className="faixa-sinal">=</span>
        {e.terminado ? <span>{resultadoDe(op)}</span> : <span className="faixa-q">?</span>}
      </>
    );
  } else if (op.tipo === "mostrar") {
    operacao = <span className={`alg ${e.terminado ? "alg-feito" : ""}`}>{op.valor}</span>;
  } else if (op.tipo === "ler") {
    operacao = e.terminado ? <span className="alg alg-feito">{op.valor}</span> : <span className="faixa-q">?</span>;
  } else {
    // O ditado: um número por vez; no fim, a sequência inteira.
    const n = op.numeros;
    if (e.terminado) {
      operacao = (
        <span className="faixa-ditado">
          {n.map((x, i) => (i === 0 ? String(x) : `${x > 0 ? "+" : "−"} ${Math.abs(x)}`)).join(" ")} <span className="faixa-sinal">=</span> {resultadoDe(op)}
        </span>
      );
    } else {
      const i = Math.min(e.mostrados, n.length) - 1;
      const x = n[i];
      operacao = (
        <>
          <span className="alg alg-agora" key={i} data-numero-ditado={i}>
            {i === 0 ? String(x) : `${x > 0 ? "+" : "−"} ${Math.abs(x)}`}
          </span>
          <span className="faixa-contador">
            {i + 1}/{n.length}
          </span>
        </>
      );
    }
  }
  return (
    <div className="faixa-operacao" data-faixa-operacao="">
      <div className="faixa-linha">
        <span className="objetivo-etiqueta" data-etiqueta={feito ? "Feito" : verbo}>
          {feito && <IconeVisto />}
          {verbo}
        </span>
        <p className="faixa-op m-0 algarismos" aria-live="polite">
          {operacao}
        </p>
      </div>
      {gesto && (
        <p className="objetivo-gesto m-0" data-gesto={tom} data-tom={tom === "acertou" ? "resumo" : undefined}>
          {tom === "gesto" && <IconeMao />}
          {tom === "ainda-nao" && <IconePonto />}
          <span>{gesto}</span>
        </p>
      )}
    </div>
  );
}
