"use client";

/**
 * A bancada de controles, na zona do polegar. Só aparece o que a máquina tem: nenhum controle
 * sugere uma ação que não existe. Um botão principal só: o de repartir.
 */
import type { ReactNode } from "react";
import type { Racional } from "@/nucleo/racional/racional";
import { bicasAbertas, loteMaximo, pilhaDe, totalGeral } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";
import { IconeRecomecar } from "@/componentes/icones/IconeRecomecar";
import { Numero } from "@/componentes/notacao/Numero";
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
  /** Mais um controle, numa linha própria (a calibragem põe "Não sei ainda"). */
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
  // Com uma pilha só não há o que escolher: a linha não aparece.
  const temVariasPilhas = estado.esteira.length > 1;
  const abertas = bicasAbertas(estado).length;

  return (
    <div className="flex flex-col gap-3" data-painel="bancada">
      {c.carga && (
        <div className="flex items-center gap-2.5">
          <span className="rotulo w-[76px] shrink-0">Na esteira</span>
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

      {temVariasPilhas && (
        <div className="flex items-center gap-2.5">
          <span className="rotulo w-[76px] shrink-0">Pilha</span>
          <div className="-my-1 flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" role="radiogroup" aria-label="Pilha escolhida">
            {estado.esteira.map((p) => {
              const k = `${p.tamanho.n}/${p.tamanho.d}`;
              const sel = estado.pilha === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  className="opcao shrink-0 text-[15px]"
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
        <div className="flex flex-col gap-2" data-painel="fatiador">
          <div className="flex items-center gap-2.5">
            <span className="rotulo w-[76px] shrink-0">Cortar em</span>
            <div className="opcoes min-w-0 flex-1" role="radiogroup" aria-label="Cortar em quantas partes">
              {c.fatiador.partes.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={estado.partes === p}
                  className="opcao"
                  disabled={travado}
                  onClick={() => onAcao({ tipo: "partes", valor: p })}
                  data-partes={p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pl-[86px]">
            <button type="button" className="botao-secundario flex-1" disabled={travado || !pilhaAtual} onClick={() => onAcao({ tipo: "fatiar", quantidade: 1 })} data-acao="cortar-uma">
              Cortar 1
            </button>
            <button
              type="button"
              className="botao-secundario flex-1"
              disabled={travado || !pilhaAtual || pilhaAtual.quantidade < 2}
              onClick={() => onAcao({ tipo: "fatiar", quantidade: "todas" })}
              data-acao="cortar-todas"
            >
              Cortar todas
            </button>
          </div>
        </div>
      )}

      {c.bicas.ajustavel && (
        <div className="flex items-center gap-2.5">
          <span className="rotulo w-[76px] shrink-0">Bicas</span>
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

      <div className="flex items-center gap-2">
        <span className={`rotulo shrink-0 ${c.bicas.ajustavel || c.carga ? "w-[76px]" : "w-[38px]"}`}>Lote</span>
        <Seletor
          rotulo="Lote"
          valor={estado.lote}
          minimo={1}
          maximo={loteMaximo(c)}
          desabilitado={travado}
          onMudar={(v) => onAcao({ tipo: "lote", valor: v })}
          idTeste="lote"
        />
        <button type="button" className="botao-principal ml-1 min-w-0 flex-1 px-2" disabled={travado || !pilhaAtual} onClick={() => onAcao({ tipo: "repartir" })} data-acao="repartir">
          {pele.repartir}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onFechar && (
          <button type="button" className="botao-secundario min-w-0 flex-1" disabled={parada || fechada} onClick={onFechar} data-acao="fechar">
            {rotuloFechar}
          </button>
        )}
        <button type="button" className="botao-discreto shrink-0" disabled={parada} onClick={() => onAcao({ tipo: "desfazer" })} data-acao="desfazer">
          <IconeDesfazer />
          Desfazer
        </button>
      </div>
      <div className="-mt-2 flex justify-end">
        <button type="button" className="botao-discreto" disabled={parada} onClick={() => onAcao({ tipo: "recomecar" })} data-acao="recomecar">
          <IconeRecomecar />
          Recomeçar do início
        </button>
      </div>
      {extra}
    </div>
  );
}
