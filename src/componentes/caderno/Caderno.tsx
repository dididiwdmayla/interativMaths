"use client";

/**
 * O Caderno: as páginas que o jogador registrou. É a referência dele; substitui explicações longas.
 */
import Link from "next/link";
import { useState } from "react";
import { ehEstadoBancada } from "@/nucleo/maquinas/bancada/bancada";
import type { PaginaCaderno } from "@/nucleo/progresso";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { PELES } from "@/conteudo/peles";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { BlocoNotacao, LinhaNotacao } from "@/componentes/notacao/Notacao";
import { FolhaPapel, NotaDalia } from "@/componentes/missao/Papel";
import { rotaDe } from "@/componentes/estado/catalogo";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";

export function Caderno() {
  const { pronto, progresso } = useProgresso();
  const [revendo, setRevendo] = useState<PaginaCaderno | null>(null);
  if (!pronto) return <Carregando />;
  const ordem = (p: PaginaCaderno) => {
    const i = MISSOES_ARCO_1.findIndex((m) => m.id === p.atividade);
    return i < 0 ? 99 : i;
  };
  const paginas = [...progresso.caderno].sort((a, b) => ordem(a) - ordem(b) || a.registradaEm - b.registradaEm);
  const semRegistro = MISSOES_ARCO_1.filter(
    (m) => progresso.campanha.atividades[m.id]?.status === "concluida" && !progresso.caderno.some((p) => p.atividade === m.id),
  );
  return (
    <main data-pronto="sim" data-tela="caderno" className="min-h-dvh pb-28">
      <header className="area-segura area-segura-topo flex items-end justify-between pb-3 pt-4">
        <div>
          <p className="rotulo-chapa m-0">O que você registrou</p>
          <h1 className="fonte-sinal m-0 text-[2.2rem] font-extrabold uppercase leading-none text-papel">Caderno</h1>
        </div>
        <p className="m-0 text-texto-mundo-suave">{paginas.length === 1 ? "1 página" : `${paginas.length} páginas`}</p>
      </header>

      <div className="area-segura mx-auto flex max-w-2xl flex-col gap-6">
        {paginas.length === 0 && (
          <FolhaPapel titulo="Em branco">
            <p className="text-tinta">As páginas aparecem aqui quando você registra o que a máquina fez, no fim de cada missão.</p>
            <NotaDalia>Comecei este caderno trinta anos atrás e ele continua em branco. Fica com você.</NotaDalia>
          </FolhaPapel>
        )}
        {paginas.map((p) => (
          <Pagina key={p.id} p={p} onRever={() => setRevendo(p)} />
        ))}
        {semRegistro.map((m) => (
          <FolhaPapel key={m.id} titulo={m.titulo} className="opacity-90">
            <p className="text-tinta">Missão vencida pela prova direta. A página ainda está em branco.</p>
            <Link href={`${rotaDe(m)}?modo=registro`} className="placa placa-papel placa-pequena mb-1 inline-flex">
              Fazer o registro
            </Link>
          </FolhaPapel>
        ))}
      </div>

      {revendo && <ReverNaMaquina p={revendo} onFechar={() => setRevendo(null)} />}
      <NavJogo atual="caderno" />
    </main>
  );
}

function Pagina({ p, onRever }: { p: PaginaCaderno; onRever: () => void }) {
  const maquina = ehEstadoBancada(p.maquina) ? p.maquina : null;
  return (
    <article data-pagina={p.id}>
      <FolhaPapel
        titulo={p.titulo}
        className="rounded-2xl"
        margem={
          <div className="flex flex-col gap-1">
            {p.notas.map((n) => (
              <NotaDalia key={n}>{n}</NotaDalia>
            ))}
          </div>
        }
      >
        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-3">
            {p.frase && <p className="m-0 text-[1.05rem] text-tinta">{p.frase}</p>}
            <BlocoNotacao linhas={p.notacao} />
            {p.volta && (
              <div className="flex flex-wrap items-center gap-2 text-tinta-suave">
                <span className="text-[0.82rem] uppercase tracking-wide">caminho de volta</span>
                <LinhaNotacao texto={p.volta} tamanho="pequena" rotulos={false} />
              </div>
            )}
          </div>
          {maquina && (
            <div className="flex w-full flex-col items-center gap-1 sm:w-48">
              <div className="w-full overflow-hidden rounded-lg bg-noite" style={{ aspectRatio: "1 / 0.72" }}>
                <Bancada estado={maquina} pele={PELES[maquina.config.pele]} cotas={false} proporcao={0.72} rotulo={`Miniatura da máquina: ${p.titulo}`} />
              </div>
              <button type="button" className="placa placa-papel placa-pequena w-full" onClick={onRever} data-acao="rever">
                Rever na máquina
              </button>
            </div>
          )}
        </div>
      </FolhaPapel>
    </article>
  );
}

function ReverNaMaquina({ p, onFechar }: { p: PaginaCaderno; onFechar: () => void }) {
  const maquina = ehEstadoBancada(p.maquina) ? p.maquina : null;
  if (!maquina) return null;
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-noite anima-esmaecer" role="dialog" aria-modal="true" aria-label={`Rever na máquina: ${p.titulo}`}>
      <div className="area-segura area-segura-topo flex items-center justify-between py-2">
        <h2 className="fonte-sinal m-0 text-[1.4rem] font-bold uppercase">{p.titulo}</h2>
        <button type="button" className="placa placa-pequena" onClick={onFechar} autoFocus>
          Fechar
        </button>
      </div>
      <div className="min-h-0 flex-1 px-2 pb-4">
        <Bancada estado={maquina} pele={PELES[maquina.config.pele]} cotas rotulo={`Máquina: ${p.titulo}`} />
      </div>
      <div className="area-segura area-segura-base pb-3">
        <div className="papel-liso inline-block rounded-lg px-3 py-2">
          <LinhaNotacao texto={p.notacao[0] ?? ""} tamanho="media" rotulos={false} />
        </div>
      </div>
    </div>
  );
}
