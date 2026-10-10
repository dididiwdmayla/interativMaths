"use client";

/**
 * A escada de dicas do Nônio, sempre a pedido: olhar, medir, caso parecido, resolver junto.
 * Nunca a resposta do caso atual: o caso parecido usa outros números.
 */
import { useEffect, useState } from "react";
import { criarBancada, operar } from "@/nucleo/maquinas/bancada/bancada";
import type { Bancada as EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Dica, EscadaDicas } from "@/nucleo/missoes/tipos";
import { preencher } from "@/nucleo/missoes/motor";
import { PELES } from "@/conteudo/peles";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { Nonio } from "./Nonio";

const DEGRAUS = ["Olhar", "Medir", "Caso parecido", "Resolver junto"] as const;

export function PainelNonio({
  aberto,
  onFechar,
  dicas,
  ajuda,
  medidas,
  onPedir,
  onJunto,
  podeJunto,
  aplicacao,
}: {
  aberto: boolean;
  onFechar: () => void;
  dicas: EscadaDicas | undefined;
  ajuda: number;
  medidas: Readonly<Record<string, string>>;
  onPedir: () => void;
  onJunto: () => void;
  podeJunto: boolean;
  aplicacao: boolean;
}) {
  if (!aberto) return null;
  const mostradas = dicas ? dicas.slice(0, Math.min(ajuda, 3)) : [];
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Nônio">
      <button type="button" className="absolute inset-0 bg-[var(--veu)]" aria-label="Fechar o Nônio" onClick={onFechar} />
      <div className="chapa relative mx-2 mb-2 max-h-[72dvh] overflow-y-auto p-4 area-segura-base anima-esmaecer" data-painel="nonio">
        <div className="flex items-start gap-3">
          <Nonio expressao={ajuda >= 2 ? "medindo" : "atento"} tamanho={52} />
          <div className="flex-1">
            <p className="rotulo-chapa m-0">Nônio</p>
            <p className="m-0 text-texto-mundo-suave">
              {ajuda === 0
                ? aplicacao
                  ? "Nesta encomenda eu fico quieto, a não ser que você peça. Peço uma coisa por vez."
                  : "Eu meço. Uma coisa por vez, do mais leve ao mais pesado."
                : "Medidas até aqui:"}
            </p>
          </div>
        </div>

        <ol className="mt-3 flex flex-col gap-3 p-0" aria-label="Escada de dicas">
          {mostradas.map((d, i) => (
            <li key={i} className="list-none" data-degrau={i + 1}>
              <p className="rotulo-chapa m-0 text-[0.78rem]">{DEGRAUS[i]}</p>
              <p className="m-0 text-texto-mundo">{preencher(d.texto, medidas)}</p>
              {i === 2 && d.caso && <CasoParecido dica={d} />}
            </li>
          ))}
          {ajuda >= 4 && (
            <li className="list-none" data-degrau={4}>
              <p className="rotulo-chapa m-0 text-[0.78rem]">Resolver junto</p>
              <p className="m-0 text-texto-mundo">Vamos passo a passo. Esta não entra na conta; a próxima parecida entra.</p>
            </li>
          )}
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          {dicas && ajuda < 3 && (
            <button type="button" className="placa placa-cheia" onClick={onPedir} data-acao="pedir-dica">
              {ajuda === 0 ? "Pedir uma medida" : "Mais uma"}
            </button>
          )}
          {ajuda === 3 && podeJunto && (
            <button type="button" className="placa" onClick={onJunto} data-acao="junto">
              Resolver junto
            </button>
          )}
          <button type="button" className="placa placa-discreta" onClick={onFechar}>
            Voltar à máquina
          </button>
        </div>
      </div>
    </div>
  );
}

/** Uma máquina pequena com outros números, rodando sozinha. */
function CasoParecido({ dica }: { dica: Dica }) {
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
    <div className="mt-2 h-[190px] rounded-lg border border-noite-borda" aria-label="Caso parecido, com outros números" role="img">
      <Bancada estado={b.atual} pele={PELES[caso.maquina.pele]} cotas proporcao={0.62} rotulo="Caso parecido" />
    </div>
  );
}
