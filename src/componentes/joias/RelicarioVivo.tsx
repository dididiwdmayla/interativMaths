"use client";

/**
 * O Relicário vivo (referência 1 de v05.html), depois de encontrada a Joia do Ábaco. A ficha da
 * joia em lapidação na frente: a gema no estágio atual, o nome formal, a trilha dos estágios, o
 * critério do próximo, as técnicas (firme com visto; firmando com a fila de seis contas, cheias as
 * dos lances limpos; esperando; a lápis com quando chega), o andamento da técnica do foco,
 * Lapidar (com a rodada embaixo) e Soroban livre. Depois, o mecanismo com os engastes, as outras
 * joias (a lápis enquanto não encontradas) e a bancada, agora a caneta para o Ábaco.
 */
import Link from "next/link";
import type { Joia, TecnicaJoia } from "@/nucleo/joias/contrato";
import { andamentoDaTecnica, decidirRodada, treinoDe, type Andamento } from "@/nucleo/joias/treino";
import type { EstadoJoia } from "@/nucleo/progresso";
import { preencher } from "@/nucleo/soroban/textos";
import { JOIAS } from "@/conteudo/joias";
import { FIM_RODADA, PARAMETROS_LAPIDACAO, RELICARIO_VIVO } from "@/conteudo/lapidacao";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { Gema } from "./Gema";
import { Mecanismo } from "./Mecanismo";
import { NOMES_ESTAGIO, Trilha } from "./Trilha";

/** A fila de seis contas do "firmando": cheias as dos lances limpos. */
function FilaDeContas({ cheias, total }: { cheias: number; total: number }) {
  return (
    <svg width={total * 15 + 2} height={14} viewBox={`0 0 ${total * 15 + 2} 14`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const x = 1 + i * 15;
        const cheia = i < cheias;
        return (
          <polygon
            key={i}
            points={`${x},7 ${x + 3},2 ${x + 11},2 ${x + 14},7 ${x + 11},12 ${x + 3},12`}
            fill={cheia ? "var(--soroban-conta)" : "var(--folha)"}
            stroke={cheia ? "var(--contorno)" : "var(--grafite)"}
            strokeWidth={1.6}
            strokeLinejoin="round"
            strokeDasharray={cheia ? undefined : "2.5 2"}
          />
        );
      })}
    </svg>
  );
}

function LinhaTecnica({ t, a }: { t: TecnicaJoia; a: Andamento }) {
  const tinta = a.situacao !== "lapis";
  return (
    <div className="tecnica-linha" data-tecnica={t.id} data-tecnica-estado={a.situacao}>
      <div className="flex min-w-0 flex-col">
        <span className={`text-[14.5px] ${tinta ? "font-bold" : "font-semibold text-tinta-suave"}`}>{t.nome}</span>
        {a.situacao === "esperando" && <span className="text-[12.5px] font-semibold text-tinta-suave">{RELICARIO_VIVO.faltaUmaRodada}</span>}
      </div>
      {a.situacao === "firme" ? (
        <span className="selo" data-selo="acertou">
          <IconeVisto />
          {RELICARIO_VIVO.firme}
        </span>
      ) : a.situacao === "lapis" ? (
        <span className="selo-lapis">{t.aLapis}</span>
      ) : (
        <span className="selo-caneta" aria-label={`${a.limpos} de ${a.limposAlvo} lances limpos`}>
          <FilaDeContas cheias={a.limpos} total={a.limposAlvo} />
          {a.situacao === "esperando" ? RELICARIO_VIVO.esperando : RELICARIO_VIVO.firmando}
        </span>
      )}
    </div>
  );
}

function FichaEmLapidacao({ joia, estado }: { joia: Joia; estado: EstadoJoia }) {
  const { agora } = useProgresso();
  const t = agora();
  const p = PARAMETROS_LAPIDACAO;
  const polida = estado.estagio >= 3;
  const proximo = !polida ? joia.estagios[estado.estagio + 1] : null;
  const decisao = decidirRodada(joia, estado, p, t);
  const rodada = estado.rodada;
  const emCurso = rodada !== null && rodada.feitos.length < rodada.itens.length;
  const sub = emCurso
    ? preencher(RELICARIO_VIVO.continuar, { n: rodada.feitos.length + 1, total: rodada.itens.length })
    : decisao.tipo === "tecnica"
      ? preencher(RELICARIO_VIVO.rodada, { tecnica: decisao.foco.nome.toLocaleLowerCase("pt-BR") })
      : decisao.tipo === "revisao"
        ? RELICARIO_VIVO.revisao
        : RELICARIO_VIVO.manutencao;
  // O andamento da técnica do foco (ou da primeira que falta).
  const foco = decisao.tipo === "tecnica" ? decisao.foco : decisao.tipo === "revisao" ? decisao.faltam[0] : null;
  const af = foco ? andamentoDaTecnica(foco, treinoDe(estado, foco.id), p, t) : null;
  const linhaFoco =
    foco && af && af.situacao !== "lapis"
      ? af.situacao === "esperando"
        ? preencher(FIM_RODADA.esperando, { tecnica: foco.nome })
        : preencher(FIM_RODADA.andamento, { tecnica: foco.nome, limpos: af.limpos, alvoLimpos: af.limposAlvo, rodadas: af.rodadas, alvoRodadas: af.rodadasAlvo })
      : null;
  return (
    <section className="ficha flex flex-col gap-2.5 p-3.5" aria-labelledby="t-joia-viva" data-joia={joia.id} data-estagio={estado.estagio} data-encontrada="sim">
      <div className="flex items-center gap-3">
        <svg viewBox="-28 -28 56 56" width={56} height={56} aria-hidden="true" className="traco-fixo flex-none">
          <Gema x={0} y={0} r={24} estagio={estado.estagio} base={joia.cor.base} luz={joia.cor.luz} />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">
            {joia.mineral} · {polida ? RELICARIO_VIVO.polida : RELICARIO_VIVO.emLapidacao}
          </p>
          <h2 id="t-joia-viva" className="m-0 text-[20px] font-extrabold leading-[1.15]">
            {joia.nome}
          </h2>
          {joia.formal && <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{joia.formal}</p>}
        </div>
      </div>
      <Trilha joia={joia} estagio={estado.estagio} />
      {proximo && (
        <p className="m-0 text-[14px] font-semibold leading-[1.35]">
          <span className="text-tinta-suave">{preencher(RELICARIO_VIVO.paraFicar, { estagio: proximo.nome })}</span> {proximo.criterio.charAt(0).toLocaleLowerCase("pt-BR") + proximo.criterio.slice(1)}
        </p>
      )}
      <div className="flex flex-col" data-tecnicas-joia="">
        {joia.tecnicas.map((x) => (
          <LinhaTecnica key={x.id} t={x} a={andamentoDaTecnica(x, treinoDe(estado, x.id), p, t)} />
        ))}
      </div>
      {linhaFoco && (
        <p className="-mt-0.5 m-0 text-[12.5px] font-semibold text-tinta-suave" data-andamento-foco="">
          {linhaFoco}
        </p>
      )}
      <div className="flex items-stretch gap-2">
        <Link href="/relicario/abaco" className="botao-principal flex-1 flex-col gap-0 px-3 leading-[1.1]" data-acao="lapidar">
          {RELICARIO_VIVO.lapidar}
          <span className="whitespace-nowrap text-[12px] font-semibold" data-rodada-sub="">
            {sub}
          </span>
        </Link>
        <Link href="/relicario/abaco/livre" className="botao-secundario min-h-[50px] px-3" data-acao="soroban-livre">
          {RELICARIO_VIVO.sorobanLivre}
        </Link>
      </div>
    </section>
  );
}

function OutraJoia({ joia, estado }: { joia: Joia; estado: EstadoJoia | undefined }) {
  const achada = estado?.encontrada === true;
  return (
    <section className={`flex items-center gap-3 px-3.5 py-3 ${achada ? "ficha" : "ficha-lapis bg-grafite-claro"}`} data-joia={joia.id} data-encontrada={achada ? "sim" : "nao"}>
      <svg viewBox="-20 -20 40 40" width={40} height={40} aria-hidden="true" className="traco-fixo flex-none">
        <Gema x={0} y={0} r={17} estagio={achada ? (estado?.estagio ?? 0) : 0} base={joia.cor.base} luz={joia.cor.luz} lapis={!achada} />
      </svg>
      <div className="min-w-0">
        <h2 className={`m-0 text-[16px] font-extrabold leading-tight ${achada ? "" : "text-tinta-suave"}`}>{joia.nome}</h2>
        <p className="m-0 text-[13px] font-semibold text-tinta-suave">
          {joia.mineral} · {achada ? `${RELICARIO_VIVO.encontrada}, ${NOMES_ESTAGIO[estado?.estagio ?? 0]}` : RELICARIO_VIVO.aindaNao}
        </p>
      </div>
    </section>
  );
}

export function RelicarioVivo() {
  const { progresso } = useProgresso();
  const abaco = JOIAS.find((j) => j.id === "abaco");
  const estado = progresso.joias.abaco;
  if (!abaco || !estado) return null;
  return (
    <main data-pronto="sim" data-tela="relicario" data-relicario="vivo" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="relicario" />
      <div className="area-segura mx-auto flex w-full max-w-[560px] flex-col gap-3 pt-3.5">
        <header>
          <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">Habilidades suas, não poderes</p>
          <h1 className="m-0 mt-0.5 text-[26px] font-extrabold leading-[1.1]">Relicário</h1>
        </header>
        <FichaEmLapidacao joia={abaco} estado={estado} />
        {JOIAS.filter((j) => j.id !== abaco.id).map((j) => (
          <OutraJoia key={j.id} joia={j} estado={progresso.joias[j.id]} />
        ))}
        <section className="ficha-quadriculada mt-2 p-3">
          <Mecanismo joias={progresso.joias} />
        </section>
        <p className="m-0 text-[15px] font-medium leading-[1.45]">{RELICARIO_VIVO.explicacao}</p>
        <section className="ficha flex items-center gap-4 p-4" data-bancada-lapidacao="aberta">
          <svg viewBox="0 0 64 48" width={64} height={48} aria-hidden="true" className="flex-none">
            <rect x={4} y={6} width={56} height={36} rx={6} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={2.4} />
            <rect x={9} y={11} width={46} height={26} rx={2} fill="var(--folha)" stroke="var(--contorno)" strokeWidth={1.6} />
            <rect x={4} y={19} width={56} height={5} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={1.6} />
            {[18, 32, 46].map((x) => (
              <g key={x}>
                <line x1={x} y1={11} x2={x} y2={37} stroke="var(--contorno)" strokeWidth={1.6} />
                <polygon points={`${x - 6},29 ${x - 3},26 ${x + 3},26 ${x + 6},29 ${x + 3},32 ${x - 3},32`} fill="var(--soroban-conta)" stroke="var(--contorno)" strokeWidth={1.4} />
              </g>
            ))}
          </svg>
          <div className="min-w-0">
            <h2 className="m-0 text-[17px] font-extrabold">{RELICARIO_VIVO.bancada}</h2>
            <p className="m-0 text-[14px] font-medium text-tinta-suave">{RELICARIO_VIVO.bancadaAberta}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
