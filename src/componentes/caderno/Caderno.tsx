"use client";

/**
 * O Caderno: as páginas que o jogador passou a limpo, em folha pautada. É a referência dele;
 * substitui explicações longas. Título de cada página à mão, notação em Rubik, as notas da Dália
 * na margem, a máquina de cada página num desenho pequeno numa ficha quadriculada.
 */
import Link from "next/link";
import { useState } from "react";
import { ehEstadoBancada } from "@/nucleo/maquinas/bancada/bancada";
import type { PaginaCaderno } from "@/nucleo/progresso";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { PELES } from "@/conteudo/peles";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { BlocoNotacao, LinhaNotacao } from "@/componentes/notacao/Notacao";
import { FolhaPautada, NotaDalia } from "@/componentes/missao/Papel";
import { rotaDe } from "@/componentes/estado/catalogo";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";

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
    <main data-pronto="sim" data-tela="caderno" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="caderno" />
      <div className="area-segura mx-auto flex w-full max-w-[880px] flex-col gap-6 pt-5">
        <header className="flex items-end justify-between gap-3">
          <div>
            <p className="m-0 text-[13px] font-semibold text-tinta-suave">O que você passou a limpo</p>
            <h1 className="m-0 text-[24px] font-extrabold leading-tight">Caderno</h1>
          </div>
          <p className="m-0 pb-1 text-[14px] font-bold">
            <span className="marca-texto">{paginas.length === 1 ? "1 página" : `${paginas.length} páginas`}</span>
          </p>
        </header>

        {paginas.length === 0 && (
          <FolhaPautada titulo="Em branco" className="rounded-[16px] shadow-[0_4px_0_var(--sombra)]">
            <p className="m-0 mt-[14px] text-[16px] font-medium leading-[28px]">As páginas aparecem aqui quando você passa a limpo o que a máquina fez, no fim de cada missão.</p>
            <div className="mt-[14px]">
              <NotaDalia>Comecei este caderno trinta anos atrás e ele continua em branco. Fica com você.</NotaDalia>
            </div>
          </FolhaPautada>
        )}
        {paginas.map((p) => (
          <Pagina key={p.id} p={p} onRever={() => setRevendo(p)} />
        ))}
        {semRegistro.map((m) => (
          <section key={m.id} className="ficha-lapis flex flex-col items-start gap-3 px-5 py-4">
            <h2 className="letra-mao m-0 text-[28px] text-tinta-suave">{m.titulo}</h2>
            <p className="m-0 text-[15px] font-medium text-tinta-suave">Missão vencida pela prova direta. A página ainda está a lápis.</p>
            <Link href={`${rotaDe(m)}?modo=registro`} className="botao-secundario">
              Passar a limpo
            </Link>
          </section>
        ))}
      </div>

      {revendo && <ReverNaMaquina p={revendo} onFechar={() => setRevendo(null)} />}
    </main>
  );
}

function Pagina({ p, onRever }: { p: PaginaCaderno; onRever: () => void }) {
  const maquina = ehEstadoBancada(p.maquina) ? p.maquina : null;
  return (
    <article data-pagina={p.id} className="anima-subir">
      <FolhaPautada titulo={p.titulo} className="rounded-[16px] shadow-[0_4px_0_var(--sombra)]">
        <div className="flex flex-col gap-[14px] pt-[14px] md:flex-row md:items-start md:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-[14px]">
            {p.frase && <p className="m-0 text-[16px] font-medium leading-[28px]">{p.frase}</p>}
            <BlocoNotacao linhas={p.notacao} />
            {p.volta && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="letra-mao text-[22px]">caminho de volta</span>
                <LinhaNotacao texto={p.volta} tamanho="pequena" rotulos={false} />
              </div>
            )}
            {p.notas.length > 0 && (
              <div className="flex flex-col">
                {p.notas.map((n) => (
                  <NotaDalia key={n}>{n}</NotaDalia>
                ))}
              </div>
            )}
          </div>
          {maquina && (
            <div className="flex w-full flex-col gap-2.5 md:w-[250px]">
              <div className="ficha-quadriculada overflow-hidden p-1 shadow-none" style={{ aspectRatio: "1 / 0.8" }}>
                <Bancada estado={maquina} pele={PELES[maquina.config.pele]} cotas={false} proporcao={0.8} rotulo={`Miniatura da máquina: ${p.titulo}`} />
              </div>
              <button type="button" className="botao-secundario w-full" onClick={onRever} data-acao="rever">
                Rever na máquina
              </button>
            </div>
          )}
        </div>
      </FolhaPautada>
    </article>
  );
}

function ReverNaMaquina({ p, onFechar }: { p: PaginaCaderno; onFechar: () => void }) {
  const maquina = ehEstadoBancada(p.maquina) ? p.maquina : null;
  if (!maquina) return null;
  return (
    <div className="quadriculado fixed inset-0 z-40 flex flex-col anima-esmaecer" role="dialog" aria-modal="true" aria-label={`Rever na máquina: ${p.titulo}`}>
      <div className="cabecalho area-segura">
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="m-0 text-[12px] font-semibold text-tinta-suave">Caderno · Rever na máquina</p>
          <h2 className="m-0 truncate text-[17px] font-extrabold">{p.titulo}</h2>
        </div>
        <button type="button" className="botao-icone" onClick={onFechar} autoFocus aria-label="Fechar">
          <IconeFechar />
        </button>
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col gap-3 px-[14px] pb-5 pt-3">
        <div className="ficha-quadriculada min-h-0 flex-1 p-1.5">
          <Bancada estado={maquina} pele={PELES[maquina.config.pele]} cotas rotulo={`Máquina: ${p.titulo}`} />
        </div>
        <div className="quadro-notacao self-start">
          <LinhaNotacao texto={p.notacao[0] ?? ""} tamanho="media" rotulos={false} />
        </div>
      </div>
    </div>
  );
}
