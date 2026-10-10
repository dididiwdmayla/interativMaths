"use client";

/**
 * A chapa de controles da bancada, na zona do polegar. Só aparece o que a máquina tem:
 * nenhum controle sugere uma ação que não existe.
 */
import type { ReactNode } from "react";
import type { Racional } from "@/nucleo/racional/racional";
import { bicasAbertas, loteMaximo, pilhaDe, totalGeral } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { Numero } from "@/componentes/notacao/Numero";
import { Alavanca } from "@/componentes/ui/Alavanca";
import { Seletor } from "@/componentes/ui/Seletor";

export interface PropsPainel {
  estado: EstadoBancada;
  pele: Pele;
  onAcao: (a: AcaoBancada) => void;
  /** Botão de fechar a partilha (a missão chama o validador). */
  onFechar?: () => void;
  rotuloFechar?: string;
  /** Desabilita tudo (máquina parada para registro). */
  parada?: boolean;
  extra?: ReactNode;
}

function nomeDaPilha(pele: Pele, tamanho: Racional, k: number): ReactNode {
  if (tamanho.n === 1 && tamanho.d === 1) {
    return (
      <>
        <span className="algarismos">{k}</span> {k === 1 ? pele.peca.singular : pele.peca.plural}
      </>
    );
  }
  return (
    <>
      <span className="algarismos">{k}</span> de <Numero valor={tamanho} pequena />
    </>
  );
}

export function PainelBancada({ estado, pele, onAcao, onFechar, rotuloFechar = "Fechar a partilha", parada = false, extra }: PropsPainel) {
  const c = estado.config;
  const fechada = estado.fechada;
  const travado = parada || fechada;
  const pilhaAtual = pilhaDe(estado.esteira, estado.pilha);
  const temVariasPilhas = estado.esteira.length > 1 || c.fatiador !== undefined;
  const abertas = bicasAbertas(estado).length;

  return (
    <div className="flex flex-col gap-2.5" data-painel="bancada">
      {c.carga && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rotulo-chapa">Na esteira</span>
          <Seletor
            rotulo={`${pele.peca.plural} na esteira`}
            valor={totalGeral(estado).n}
            minimo={c.carga.minimo}
            maximo={c.carga.maximo}
            desabilitado={travado || estado.cargaTravada}
            onMudar={(v) => onAcao({ tipo: "carga", quantidade: v })}
            idTeste="carga"
          />
        </div>
      )}

      {temVariasPilhas && estado.esteira.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="rotulo-chapa shrink-0">Pilha</span>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="radiogroup" aria-label="Pilha escolhida">
            {estado.esteira.map((p) => {
              const k = `${p.tamanho.n}/${p.tamanho.d}`;
              const sel = estado.pilha === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  className={`placa placa-pequena shrink-0 normal-case ${sel ? "placa-escolhida" : ""}`}
                  style={{ fontFamily: "var(--fonte-texto)", letterSpacing: 0, fontWeight: 600 }}
                  disabled={travado}
                  onClick={() => onAcao({ tipo: "pilha", tamanho: k })}
                  data-escolher-pilha={k}
                >
                  {nomeDaPilha(pele, p.tamanho, p.quantidade)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {c.fatiador && (
        <div className="flex flex-wrap items-center gap-2" data-painel="fatiador">
          <span className="rotulo-chapa">Cortar em</span>
          <div className="flex gap-1" role="radiogroup" aria-label="Cortar em quantas partes">
            {c.fatiador.partes.map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={estado.partes === p}
                className={`placa placa-pequena min-w-[44px] px-2 ${estado.partes === p ? "placa-escolhida" : ""}`}
                disabled={travado}
                onClick={() => onAcao({ tipo: "partes", valor: p })}
                data-partes={p}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              className="placa placa-pequena"
              disabled={travado || !pilhaAtual}
              onClick={() => onAcao({ tipo: "fatiar", quantidade: 1 })}
              data-acao="cortar-uma"
            >
              Cortar 1
            </button>
            <button
              type="button"
              className="placa placa-pequena"
              disabled={travado || !pilhaAtual || pilhaAtual.quantidade < 2}
              onClick={() => onAcao({ tipo: "fatiar", quantidade: "todas" })}
              data-acao="cortar-todas"
            >
              Cortar todas
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="rotulo-chapa">Lote</span>
          <Seletor
            rotulo="Lote"
            valor={estado.lote}
            minimo={1}
            maximo={loteMaximo(c)}
            desabilitado={travado}
            onMudar={(v) => onAcao({ tipo: "lote", valor: v })}
            idTeste="lote"
          />
        </div>
        {c.bicas.ajustavel && (
          <div className="flex items-center gap-2">
            <span className="rotulo-chapa">Bicas</span>
            <Seletor
              rotulo="Bicas abertas"
              valor={abertas}
              minimo={0}
              maximo={estado.bicas.length}
              desabilitado={travado}
              onMudar={(v) => onAcao({ tipo: "bicas", abertas: v })}
              idTeste="bicas"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Alavanca rotulo={pele.repartir} onPuxar={() => onAcao({ tipo: "repartir" })} desabilitado={travado || !pilhaAtual} idTeste="repartir" />
        {onFechar && (
          <button type="button" className="placa h-[58px] flex-1 text-[1.05rem]" disabled={parada || fechada} onClick={onFechar} data-acao="fechar">
            {rotuloFechar}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="placa placa-pequena placa-discreta" disabled={parada} onClick={() => onAcao({ tipo: "desfazer" })} data-acao="desfazer">
          Desfazer
        </button>
        <button type="button" className="placa placa-pequena placa-discreta" disabled={parada} onClick={() => onAcao({ tipo: "recomecar" })} data-acao="recomecar">
          Recomeçar
        </button>
        {extra}
      </div>
    </div>
  );
}
