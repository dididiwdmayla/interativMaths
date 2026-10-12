"use client";

/**
 * A faixa do Nônio: ele está sempre na tela da missão, entre a máquina e a bancada (no
 * computador, na coluna da direita). Uma voz só: a leitura da máquina, o retorno de uma
 * conferência, a ajuda pedida. O texto é anunciado ao leitor de tela (role="status").
 */
import type { ReactNode } from "react";
import type { FalaFaixa, SeloFala } from "@/nucleo/tutor/fila";
import { IconeAjuda } from "@/componentes/icones/IconeAjuda";
import { IconePerguntar } from "@/componentes/icones/IconePerguntar";
import { IconePonto } from "@/componentes/icones/IconePonto";
import { Selo } from "@/componentes/missao/Selo";
import { Nonio, type ExpressaoNonio } from "./Nonio";

export type RetornoFaixa = "acertou" | "ainda-nao" | "neutro";

export interface AcaoAjuda {
  readonly rotulo: string;
  readonly onPedir: () => void;
  /** O Nônio ofereceu: o botão ganha a bolinha amarela. */
  readonly oferta: boolean;
}

export function FaixaNonio({
  fala,
  selo,
  retorno,
  expressao,
  ajuda,
  onPerguntar,
  extra,
  compacta = false,
  apontando = false,
}: {
  fala: Pick<FalaFaixa, "id" | "texto" | "categoria" | "atencao">;
  selo: SeloFala | null;
  retorno: RetornoFaixa;
  expressao: ExpressaoNonio;
  ajuda?: AcaoAjuda | null;
  onPerguntar?: (() => void) | null;
  /** Um convite que mora na faixa (a sondagem). */
  extra?: ReactNode;
  compacta?: boolean;
  /** A fala aponta para uma parte da máquina: a antena vira para ela. */
  apontando?: boolean;
}) {
  const temAcoes = Boolean(ajuda) || Boolean(onPerguntar);
  return (
    <section className="faixa-nonio" data-faixa-nonio="" data-retorno={retorno} data-compacta={compacta ? "sim" : "nao"} aria-label="Nônio">
      <div className="faixa-rosto" data-apontando={apontando ? "sim" : "nao"}>
        <Nonio expressao={expressao} tamanho={compacta ? 42 : 58} rotulo="" />
      </div>
      <div className="balao-nonio faixa-balao min-w-0 flex-1" data-oferta-nonio={fala.categoria === "oferta" ? "" : undefined}>
        {selo ? <Selo tipo={selo} /> : <p className="balao-nonio-nome m-0">Nônio</p>}
        <p className="faixa-fala" role="status" aria-live="polite" data-visor="" data-fala-nonio={fala.id} data-selo={selo ?? undefined}>
          {selo && <span className="so-leitor">{selo === "acertou" ? "Acertou. " : "Ainda não. "}</span>}
          {fala.atencao && (
            <span className="faixa-ponto">
              <IconePonto />
            </span>
          )}
          {fala.texto}
        </p>
        {extra}
        {temAcoes && (
          <div className="faixa-acoes">
            {ajuda && (
              <button type="button" className="botao-pequeno relative" onClick={ajuda.onPedir} data-acao="nonio">
                <IconeAjuda />
                {ajuda.rotulo}
                {ajuda.oferta && <span className="anima-oferta absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-tinta bg-marca-texto" aria-hidden="true" />}
              </button>
            )}
            {onPerguntar && (
              <button type="button" className="botao-pequeno" onClick={onPerguntar} data-acao="perguntar">
                <IconePerguntar />
                Perguntar
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
