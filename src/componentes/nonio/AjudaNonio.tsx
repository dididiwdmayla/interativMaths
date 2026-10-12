"use client";

/**
 * A escada de ajuda dentro da faixa: os degraus 1 e 2 aparecem no balão (apontando e mostrando a
 * cota na máquina); o degrau 3 abre esta folha com a máquina pequena, com OUTROS números; o 4 é a
 * barra de fazer junto. Nunca a resposta do caso atual.
 */
import { useEffect, useState } from "react";
import { criarBancada, operar } from "@/nucleo/maquinas/bancada/bancada";
import type { Bancada as EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Dica } from "@/nucleo/missoes/tipos";
import { preencher } from "@/nucleo/missoes/motor";
import { PELES } from "@/conteudo/peles";
import { AJUDA, DEGRAUS } from "@/conteudo/reacoes";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { Nonio } from "./Nonio";

export function FolhaCasoParecido({
  dica,
  medidas,
  podeJunto,
  onJunto,
  onFechar,
}: {
  dica: Dica;
  medidas: Readonly<Record<string, string>>;
  podeJunto: boolean;
  onJunto: () => void;
  onFechar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label="Caso parecido">
      <button type="button" className="absolute inset-0 bg-veu" aria-label="Voltar à máquina" onClick={onFechar} />
      <div className="painel-sobe relative max-h-[86dvh] w-full overflow-y-auto px-4 pb-5 pt-3 area-segura-base anima-subir lg:max-w-[520px]" data-painel="ajuda">
        <div className="alca-folha" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <Nonio expressao="medindo" tamanho={50} rotulo="" />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="m-0 text-[18px] font-extrabold">{DEGRAUS[2]}</p>
            <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{AJUDA.caso}</p>
          </div>
          <button type="button" className="botao-icone" aria-label="Fechar o caso parecido" onClick={onFechar}>
            <IconeFechar />
          </button>
        </div>
        <p className="m-0 mt-3 text-[16px] font-medium leading-[1.4]" data-degrau={3}>
          {preencher(dica.texto, medidas)}
        </p>
        {dica.caso && <CasoParecido dica={dica} />}
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="botao-principal w-full" onClick={onFechar} data-acao="voltar-maquina">
            Voltar à máquina
          </button>
          {podeJunto && (
            <button type="button" className="botao-secundario w-full" onClick={onJunto} data-acao="junto">
              {DEGRAUS[3]}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Uma máquina pequena com outros números, rodando sozinha. */
export function CasoParecido({ dica }: { dica: Dica }) {
  const caso = dica.caso;
  const [b, setB] = useState<EstadoBancada | null>(() => (caso ? criarBancada(caso.maquina) : null));
  useEffect(() => {
    if (!caso) return;
    let i = 0;
    let atual = criarBancada(caso.maquina);
    const passo = () => {
      if (i >= caso.acoes.length) {
        i = 0;
        atual = criarBancada(caso.maquina);
        setB(atual);
        return;
      }
      atual = operar(atual, caso.acoes[i]);
      i += 1;
      setB(atual);
    };
    const t = setInterval(passo, 1100);
    return () => clearInterval(t);
  }, [caso]);
  if (!caso || !b) return null;
  return (
    <div className="ficha-quadriculada mt-3 h-[210px] p-1 shadow-none" aria-label="Caso parecido, com outros números" role="img">
      <Bancada estado={b.atual} pele={PELES[caso.maquina.pele]} cotas proporcao={0.62} rotulo="Caso parecido" />
    </div>
  );
}

/** Degrau 4: resolver junto, ação por ação. */
export function BarraJunto({ texto, onFazer }: { texto: string; onFazer: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-caneta bg-caneta-palida px-3 py-2" data-junto="">
      <span className="letra-mao shrink-0 text-[22px]">juntos</span>
      <span className="min-w-0 flex-1 text-[15px] font-semibold">{texto}</span>
      <button type="button" className="botao-secundario shrink-0" onClick={onFazer} data-acao="fazer-junto">
        Fazer
      </button>
    </div>
  );
}
