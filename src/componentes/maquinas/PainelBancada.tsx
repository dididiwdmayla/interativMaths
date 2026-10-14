"use client";

/**
 * A bancada de controles, na zona do polegar, enxuta: só o que o passo usa. A carga e as bicas
 * (quando ajustáveis), o lote com Repartir (o botão principal), Fechar a partilha e Desfazer.
 * Escolher a peça e cortar acontecem na máquina: tocar a peça abre o menu de corte.
 */
import type { ReactNode } from "react";
import { bicasAbertas, loteMaximo, pilhaDe, totalGeral } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";
import { IconeRecomecar } from "@/componentes/icones/IconeRecomecar";
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
  /** Só a alavanca (carga, bicas, lote e Repartir): a aposta tem os próprios botões. */
  soAlavanca?: boolean;
}

export function PainelBancada({ estado, pele, onAcao, onFechar, rotuloFechar = "Fechar a partilha", parada = false, extra, soAlavanca = false }: PropsPainel) {
  const c = estado.config;
  const fechada = estado.fechada;
  const travado = parada || fechada;
  const pilhaAtual = pilhaDe(estado.esteira, estado.pilha);
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
        <button
          type="button"
          className="botao-principal ml-1 min-w-0 flex-1 flex-col gap-0 px-2 leading-[1.1]"
          disabled={travado || !pilhaAtual}
          onClick={() => onAcao({ tipo: "repartir" })}
          data-acao="repartir"
        >
          {pele.repartir}
          <span className="text-[12.5px] font-semibold">
            {estado.lote} para cada {pele.receptor.singular}
          </span>
        </button>
      </div>

      {!soAlavanca && (
      <div className="flex items-center gap-2">
        {onFechar ? (
          <button type="button" className="botao-secundario min-w-0 flex-1" disabled={parada || fechada} onClick={onFechar} data-acao="fechar">
            {rotuloFechar}
          </button>
        ) : (
          <span className="flex-1" />
        )}
        <button type="button" className="botao-discreto shrink-0 px-2.5" disabled={parada} onClick={() => onAcao({ tipo: "desfazer" })} data-acao="desfazer">
          <IconeDesfazer />
          Desfazer
        </button>
        <button type="button" className="botao-discreto shrink-0 px-2" disabled={parada} onClick={() => onAcao({ tipo: "recomecar" })} data-acao="recomecar" aria-label="Recomeçar do início">
          <IconeRecomecar />
        </button>
      </div>
      )}
      {extra}
    </div>
  );
}
