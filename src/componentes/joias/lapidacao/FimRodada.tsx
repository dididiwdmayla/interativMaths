"use client";

/**
 * O fim da rodada. Se a joia mudou de estágio, a folha da lapidação sobe sobre o véu: a gema
 * anterior esmaece e encolhe, a nova se desenha faceta por faceta (só opacidade e transform;
 * com movimento reduzido, troca com esmaecer), o que mudou na mão, as técnicas firmes, a trilha
 * e o próximo estágio. Se não mudou: "Rodada feita", as seis operações em fichas pequenas e o
 * andamento de cada técnica. Sem nota, sem porcentagem, sem sequência de dias.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Joia } from "@/nucleo/joias/contrato";
import { andamentoDaTecnica, treinoDe, type FimDeRodada } from "@/nucleo/joias/treino";
import { preencher } from "@/nucleo/soroban/textos";
import { FIM_RODADA, PARAMETROS_LAPIDACAO } from "@/conteudo/lapidacao";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { Gema } from "@/componentes/joias/Gema";
import { NOMES_ESTAGIO, Trilha } from "@/componentes/joias/Trilha";

function ContaMarca({ cheia }: { cheia: boolean }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true" className="flex-none">
      <polygon
        points="2,7 6,2 16,2 20,7 16,12 6,12"
        fill={cheia ? "var(--soroban-conta)" : "var(--folha)"}
        stroke={cheia ? "var(--contorno)" : "var(--grafite)"}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeDasharray={cheia ? undefined : "3 2"}
      />
    </svg>
  );
}

function SeloFirme({ hoje }: { hoje: boolean }) {
  return (
    <span className="selo" data-selo="acertou">
      <IconeVisto />
      {hoje ? FIM_RODADA.firmeHoje : FIM_RODADA.firme}
    </span>
  );
}

function Botoes({ onOutra }: { onOutra: () => void }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <button type="button" className="botao-principal w-full" onClick={onOutra} data-acao="outra-rodada">
        {FIM_RODADA.outraRodada}
      </button>
      <Link href="/relicario" className="botao-secundario w-full" data-acao="ver-relicario">
        {FIM_RODADA.verNoRelicario}
      </Link>
    </div>
  );
}

export function FimRodada({ joia, fim, onOutra }: { joia: Joia; fim: FimDeRodada; onOutra: () => void }) {
  const { agora } = useProgresso();
  const t = agora();
  const subiu = fim.estagioDepois > fim.estagioAntes;
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setAberta(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const estado = fim.estado;

  if (subiu) {
    const novo = NOMES_ESTAGIO[fim.estagioDepois];
    const firmes = joia.tecnicas.filter((x) => x.estagio <= fim.estagioDepois && treinoDe(estado, x.id).firmeEm !== null);
    const proximo = fim.estagioDepois < 3 ? joia.estagios[fim.estagioDepois + 1] : null;
    return (
      <main data-pronto="sim" data-tela="lapidacao" data-fase="fim" data-passo="fim" data-lapidacao={novo} className="relative min-h-dvh">
        <div className="fixed inset-0 z-30 bg-veu anima-esmaecer" aria-hidden="true" />
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
          <section
            className="folha-sobe painel-sobe area-segura area-segura-base flex max-h-[92dvh] w-full max-w-[560px] flex-col items-center gap-3 overflow-y-auto pb-6 pt-3 text-center"
            data-aberta={aberta ? "sim" : "nao"}
            role="dialog"
            aria-modal="true"
            aria-label={preencher(FIM_RODADA.ficou, { estagio: novo })}
          >
            <div className="alca-folha" aria-hidden="true" />
            <div className="relative flex items-center justify-center gap-3">
              <svg viewBox="0 0 60 60" width={60} height={60} aria-hidden="true" className="traco-fixo">
                <g className="gema-antes">
                  <Gema x={30} y={30} r={22} estagio={fim.estagioAntes} base={joia.cor.base} luz={joia.cor.luz} />
                </g>
              </svg>
              <svg viewBox="0 0 40 20" width={40} height={20} aria-hidden="true">
                <path d="M4 10 H32 M26 4 L33 10 L26 16" fill="none" stroke="var(--caneta)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg viewBox="0 0 120 120" width={120} height={120} aria-hidden="true" className="traco-fixo gema-nova">
                <Gema x={60} y={60} r={48} estagio={fim.estagioDepois} base={joia.cor.base} luz={joia.cor.luz} />
              </svg>
              <p className="letra-mao absolute -right-4 -top-1 m-0 rotate-[-6deg] text-[30px] text-verde-escuro" aria-hidden="true">
                {preencher(FIM_RODADA.aMao, { estagio: novo })}
              </p>
            </div>
            <h1 className="m-0 text-[23px] font-extrabold leading-tight">
              <span className="marca-texto" data-cresce="">
                {preencher(FIM_RODADA.ficou, { estagio: novo })}
              </span>
            </h1>
            <p className="m-0 max-w-[420px] text-[16px] font-medium leading-[1.4]">
              <span className="text-tinta-suave">{FIM_RODADA.maoMudou}</span> {joia.estagios[fim.estagioDepois].criterio}
            </p>
            <div className="flex w-full max-w-[420px] flex-col text-left" data-firmes="">
              {firmes.map((x) => (
                <div key={x.id} className="flex min-h-[32px] items-center justify-between gap-2 border-b-[1.5px] border-dashed border-pauta py-0.5" data-tecnica={x.id} data-tecnica-estado="firme">
                  <span className="text-[14.5px] font-bold">{x.nome}</span>
                  <SeloFirme hoje={fim.firmaram.includes(x.id)} />
                </div>
              ))}
            </div>
            <Trilha joia={joia} estagio={fim.estagioDepois} className="mx-auto" />
            {proximo && (
              <p className="m-0 max-w-[420px] text-[14px] font-semibold leading-[1.35]">
                <span className="text-tinta-suave">{preencher(FIM_RODADA.proximo, { estagio: proximo.nome })}</span> {proximo.criterio}
              </p>
            )}
            <Botoes onOutra={onOutra} />
          </section>
        </div>
      </main>
    );
  }

  // As técnicas desta rodada: as que tiveram evidência e a do foco.
  const ids = new Set<string>(fim.foco ? [fim.foco] : []);
  for (const f of fim.feitos) for (const ev of f.evidencias) ids.add(ev.tecnica);
  const tecnicas = joia.tecnicas.filter((x) => ids.has(x.id));
  return (
    <main data-pronto="sim" data-tela="lapidacao" data-fase="fim" data-passo="fim" data-lapidacao="rodada" className="flex min-h-dvh flex-col items-center justify-center area-segura py-8">
      <section className="ficha flex w-full max-w-[460px] flex-col gap-3.5 p-5">
        <h1 className="m-0 text-[24px] font-extrabold leading-tight">
          <span className="marca-texto" data-cresce="">
            {FIM_RODADA.rodadaFeita}
          </span>
        </h1>
        <ol className="m-0 grid grid-cols-2 gap-2 p-0" aria-label={FIM_RODADA.operacoes}>
          {fim.feitos.map((f, i) => (
            <li key={i} className="ficha-operacao list-none algarismos" data-marca={f.marca}>
              <ContaMarca cheia={f.marca === "limpo"} />
              <span className="min-w-0 truncate">{f.resumo}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-1.5" data-andamento="">
          {tecnicas.map((x) => {
            const a = andamentoDaTecnica(x, treinoDe(fim.estado, x.id), PARAMETROS_LAPIDACAO, t);
            const texto =
              a.situacao === "firme"
                ? preencher(FIM_RODADA.firmou, { tecnica: x.nome })
                : a.situacao === "esperando"
                  ? preencher(FIM_RODADA.esperando, { tecnica: x.nome })
                  : preencher(FIM_RODADA.andamento, { tecnica: x.nome, limpos: a.limpos, alvoLimpos: a.limposAlvo, rodadas: a.rodadas, alvoRodadas: a.rodadasAlvo });
            return (
              <p key={x.id} className="m-0 flex items-center justify-between gap-2 text-[14.5px] font-semibold leading-[1.35]" data-tecnica={x.id} data-tecnica-estado={a.situacao}>
                <span>{texto}</span>
                {fim.firmaram.includes(x.id) && <SeloFirme hoje />}
              </p>
            );
          })}
          {tecnicas.length === 0 && <p className="m-0 text-[14.5px] font-semibold text-tinta-suave">{FIM_RODADA.semMudanca}</p>}
        </div>
        <Trilha joia={joia} estagio={estado.estagio} />
        <Botoes onOutra={onOutra} />
      </section>
    </main>
  );
}
