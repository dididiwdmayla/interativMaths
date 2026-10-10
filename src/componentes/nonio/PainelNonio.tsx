"use client";

/**
 * A escada de dicas do Nônio, sempre a pedido: olhar, medir, caso parecido, resolver junto.
 * Nunca a resposta do caso atual: o caso parecido usa outros números.
 */
import { useEffect, useState } from "react";
import type { RespostaTutor } from "@/nucleo/tutor/contrato";
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
  return <PainelAberto {...{ onFechar, dicas, ajuda, medidas, onPedir, onJunto, podeJunto, aplicacao }} />;
}

/** A conversa livre só aparece se a rota do tutor disser que está disponível. */
function useTutorDisponivel(): boolean {
  const [disponivel, setDisponivel] = useState(false);
  useEffect(() => {
    let vivo = true;
    fetch("/api/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tipo: "disponibilidade" }) })
      .then((r) => (r.ok ? (r.json() as Promise<RespostaTutor>) : null))
      .then((r) => {
        if (vivo && r) setDisponivel(r.disponivel);
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);
  return disponivel;
}

function PainelAberto({
  onFechar,
  dicas,
  ajuda,
  medidas,
  onPedir,
  onJunto,
  podeJunto,
  aplicacao,
}: {
  onFechar: () => void;
  dicas: EscadaDicas | undefined;
  ajuda: number;
  medidas: Readonly<Record<string, string>>;
  onPedir: () => void;
  onJunto: () => void;
  podeJunto: boolean;
  aplicacao: boolean;
}) {
  const conversa = useTutorDisponivel();
  const mostradas = dicas ? dicas.slice(0, Math.min(ajuda, 3)) : [];
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label="Nônio">
      <button type="button" className="absolute inset-0 bg-[var(--veu)]" aria-label="Fechar o Nônio" onClick={onFechar} />
      <div className="painel-sobe relative max-h-[78dvh] w-full overflow-y-auto px-4 pb-5 pt-4 area-segura-base anima-subir lg:max-w-[520px]" data-painel="nonio">
        <div className="flex items-end gap-3">
          <Nonio expressao={ajuda >= 2 ? "medindo" : "atento"} tamanho={64} />
          <div className="balao-nonio min-w-0 flex-1">
            <p className="balao-nonio-nome m-0">Nônio</p>
            <p className="m-0 text-[15px] font-medium leading-[1.35]">
              {ajuda === 0
                ? aplicacao
                  ? "Nesta encomenda eu fico quieto, a não ser que você peça. Peço uma coisa por vez."
                  : "Eu meço. Uma coisa por vez, do mais leve ao mais pesado."
                : "Medidas até aqui:"}
            </p>
          </div>
        </div>

        <ol className="mt-4 flex flex-col gap-3 p-0" aria-label="Escada de dicas">
          {mostradas.map((d, i) => (
            <li key={i} className="list-none" data-degrau={i + 1}>
              <p className="m-0 flex items-center gap-2 text-[13px] font-bold text-tinta-suave">
                <span className="contador-passo">{i + 1}</span>
                {DEGRAUS[i]}
              </p>
              <p className="m-0 mt-1 text-[16px] font-medium leading-[1.4]">{preencher(d.texto, medidas)}</p>
              {i === 2 && d.caso && <CasoParecido dica={d} />}
            </li>
          ))}
          {ajuda >= 4 && (
            <li className="list-none" data-degrau={4}>
              <p className="m-0 flex items-center gap-2 text-[13px] font-bold text-tinta-suave">
                <span className="contador-passo">4</span>
                Resolver junto
              </p>
              <p className="m-0 mt-1 text-[16px] font-medium">Vamos passo a passo. Esta não entra na conta; a próxima parecida entra.</p>
            </li>
          )}
        </ol>

        <div className="mt-5 flex flex-wrap gap-2">
          {dicas && ajuda < 3 && (
            <button type="button" className="botao-principal flex-1" onClick={onPedir} data-acao="pedir-dica">
              {ajuda === 0 ? "Pedir uma medida" : "Mais uma"}
            </button>
          )}
          {ajuda === 3 && podeJunto && (
            <button type="button" className="botao-principal flex-1" onClick={onJunto} data-acao="junto">
              Resolver junto
            </button>
          )}
          <button type="button" className="botao-secundario flex-1" onClick={onFechar}>
            Voltar à máquina
          </button>
        </div>
        {conversa && (
          <label className="mt-4 flex flex-col gap-1 text-[14px] font-semibold text-tinta-suave" data-conversa="">
            Pergunte com suas palavras
            <input className="caixa min-h-[44px] p-2 text-tinta" maxLength={500} />
          </label>
        )}
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
    <div className="ficha-quadriculada mt-2 h-[210px] p-1 shadow-none" aria-label="Caso parecido, com outros números" role="img">
      <Bancada estado={b.atual} pele={PELES[caso.maquina.pele]} cotas proporcao={0.62} rotulo="Caso parecido" />
    </div>
  );
}
