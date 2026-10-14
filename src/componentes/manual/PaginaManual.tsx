"use client";

/**
 * Uma página do Manual (referência 6 de v04.html). Papel impresso: folha branca, Rubik, sem pauta
 * e sem letra de mão. Restaurada, mostra a frase, a escrita, a máquina parada, o que vale sempre,
 * os cuidados, os nomes e onde o jogador viu. Rasgada, só o título, a área, os nomes e onde
 * restaurar: o resto é a descoberta.
 */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { EQUIVOCOS } from "@/conteudo/equivocos";
import { PELES } from "@/conteudo/peles";
import { ATIVIDADES } from "@/conteudo/atividades";
import { criarBancada, operarVarias } from "@/nucleo/maquinas/bancada/bancada";
import type { PaginaManual as Pagina } from "@/nucleo/manual/manual";
import { lerExpressao } from "@/nucleo/racional/notacao";
import type { Progresso } from "@/nucleo/progresso/tipos";
import { concluida } from "@/nucleo/campanha/campanha";
import { rotaDe } from "@/componentes/estado/catalogo";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconePagina } from "@/componentes/icones/IconePagina";
import { IconeVoltar } from "@/componentes/icones/IconeVoltar";
import { Fracao } from "@/componentes/notacao/Numero";
import { Carregando } from "@/componentes/ui/Carregando";
import { MaquinaParada } from "./MaquinaParada";
import { TEXTOS_MANUAL, areaDoConceito, missaoDaPagina, numeroDaPagina, ondeRestaura, paginaPorSlug, restauradasDe, tituloDaPagina } from "./dados";

const S = TEXTOS_MANUAL.secoes;

/** Uma expressão impressa: números em Rubik 800, frações empilhadas, espaços de texto. */
export function Impressa({ texto }: { texto: string }) {
  return (
    <span>
      {lerExpressao(texto).map((tk, i) => {
        const espaco = i > 0 && tk.t !== "virgula" ? " " : "";
        if (tk.t === "op") return <Fragment key={i}>{espaco}{tk.op}</Fragment>;
        if (tk.t === "virgula") return <Fragment key={i}>,</Fragment>;
        if (tk.t === "palavra") return <Fragment key={i}>{espaco}{tk.texto}</Fragment>;
        if (tk.forma === "inteiro") return <Fragment key={i}>{espaco}{tk.inteiro}</Fragment>;
        return (
          <Fragment key={i}>
            {espaco}
            <span className="inline-flex items-center align-middle">
              {tk.forma === "misto" && <span className="mr-[0.08em]">{tk.inteiro}</span>}
              <Fracao n={tk.n ?? 0} d={tk.d ?? 1} />
            </span>
          </Fragment>
        );
      })}
    </span>
  );
}

function Secao({ rotulo, children, icone }: { rotulo: string; children: ReactNode; icone?: ReactNode }) {
  return (
    <section className="flex flex-col gap-1" aria-label={rotulo}>
      <h3 className="manual-rot">
        {icone}
        {rotulo}
      </h3>
      {children}
    </section>
  );
}

/** O círculo de cuidado, a caneta vermelha (como nas notas da Dália, mas impresso). */
function IconeCuidado() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="var(--vermelho)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 7.5C2.6 3.8 6 1.6 9.2 2.2c3.6.7 5.3 4 3.8 7-1.5 3-6 3.6-8.6 2" />
    </svg>
  );
}

export function OsNomes({ nomes }: { nomes: Pagina["nomes"] }) {
  return (
    <dl className="m-0 flex flex-col gap-1.5" data-nomes-manual="">
      {nomes.map((n) => (
        <div key={n.termo} className="manual-termo">
          <dt>{n.termo}</dt>
          <dd className="m-0">{n.significado}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Onde o jogador viu o conceito: atividades concluídas e as páginas do Caderno delas. */
function ondeViu(p: Pagina, progresso: Progresso): { rotulo: string; href: string }[] {
  const saida: { rotulo: string; href: string }[] = [];
  for (const a of ATIVIDADES) {
    if (!a.conceitos.includes(p.conceito) || !concluida(progresso, a.id)) continue;
    saida.push({ rotulo: a.tipo === "missao" ? `Missão ${a.numero} · ${a.titulo}` : a.titulo, href: rotaDe(a) });
  }
  for (const pc of progresso.caderno) {
    const a = ATIVIDADES.find((x) => x.id === pc.atividade);
    if (a?.conceitos.includes(p.conceito)) saida.push({ rotulo: `Caderno: ${pc.titulo}`, href: "/caderno" });
  }
  return saida;
}

/** O corpo da página, inteira ou rasgada. Serve à rota e à referência da missão. */
export function CorpoPagina({ pagina: p, restaurada, progresso, dentroDaReferencia = false }: { pagina: Pagina; restaurada: boolean; progresso: Progresso; dentroDaReferencia?: boolean }) {
  if (!restaurada) {
    const m = missaoDaPagina(p.conceito);
    return (
      <article className="folha-manual" data-pagina-manual={p.conceito} data-restaurada="nao">
        <Secao rotulo={S.nomes}>
          <OsNomes nomes={p.nomes} />
        </Secao>
        <div className="manual-rasgado">
          <IconePagina rasgada tamanho={30} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="m-0 text-[15.5px] font-bold">{ondeRestaura(p.conceito)}</p>
            <p className="m-0 text-[14px] font-medium leading-[1.4]">{TEXTOS_MANUAL.rasgada}</p>
            {m && !dentroDaReferencia && (
              <Link href={rotaDe(m)} className="botao-secundario mt-1.5 self-start">
                Missão {m.numero}: {m.titulo}
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }
  const maquina = operarVarias(criarBancada(p.maquina.config), p.maquina.acoes).atual;
  const viu = ondeViu(p, progresso);
  return (
    <article className="folha-manual" data-pagina-manual={p.conceito} data-restaurada="sim">
      <Secao rotulo={S.frase}>
        <p className="manual-txt">{p.frase}</p>
      </Secao>
      <section className="manual-forma" aria-label={S.escrita}>
        <h3 className="manual-rot">{S.escrita}</h3>
        <p className="so-leitor">{p.escrita.exemplo}</p>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1" aria-hidden="true">
          <span className="text-[22px] font-extrabold leading-tight" data-exemplo-manual={p.escrita.exemplo}>
            <Impressa texto={p.escrita.exemplo} />
          </span>
          <span className="text-[15px] font-bold text-tinta-suave">
            <Impressa texto={p.escrita.forma} />
          </span>
        </div>
        <dl className="manual-termos" style={{ gridTemplateColumns: `repeat(${p.escrita.termos.length}, minmax(0, 1fr))` }}>
          {p.escrita.termos.map((t) => (
            <div key={t.nome}>
              <dd className="manual-termo-n m-0">
                <span className={t.marca ? "manual-marca" : undefined}>
                  <Impressa texto={t.valor} />
                </span>
              </dd>
              <dt className="manual-termo-t">{t.nome}</dt>
            </div>
          ))}
        </dl>
      </section>
      <Secao rotulo={S.maquina}>
        <MaquinaParada estado={maquina} pele={PELES[maquina.config.pele]} descricao={p.maquina.descricao} rotuloResto={TEXTOS_MANUAL.resto} />
      </Secao>
      <Secao rotulo={S.valeSempre}>
        <ul className="manual-lista">
          {p.valeSempre.map((v) => (
            <li key={v}>
              <span aria-hidden="true" className="font-extrabold text-caneta">
                ·
              </span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </Secao>
      {p.cuidado.length > 0 && (
        <Secao rotulo={S.cuidado} icone={<IconeCuidado />}>
          {p.cuidado.map((id) => {
            const e = EQUIVOCOS.find((x) => x.id === id);
            return e ? (
              <p key={id} className="manual-txt text-[14.5px]" data-cuidado={id}>
                <b>{e.nome}.</b> {e.manual}
              </p>
            ) : null;
          })}
        </Secao>
      )}
      <Secao rotulo={S.nomes}>
        <OsNomes nomes={p.nomes} />
      </Secao>
      {viu.length > 0 && !dentroDaReferencia && (
        <Secao rotulo={S.ondeViu}>
          <div className="mt-1 flex flex-wrap gap-2">
            {viu.map((v) => (
              <Link key={v.rotulo} href={v.href} className="manual-chip">
                {v.rotulo}
              </Link>
            ))}
          </div>
        </Secao>
      )}
    </article>
  );
}

/** A rota de uma página: cabeçalho com voltar ao Manual e o corpo. */
export function TelaPaginaManual({ slug }: { slug: string }) {
  const { pronto, progresso } = useProgresso();
  const p = paginaPorSlug(slug);
  if (!pronto || !p) return <Carregando />;
  const restaurada = restauradasDe(progresso).has(p.conceito);
  return (
    <main data-pronto="sim" data-tela="pagina-manual" className="flex min-h-dvh flex-col">
      <header className="cabecalho area-segura relative z-20">
        <Link href="/manual" className="botao-icone" aria-label="Voltar ao Manual" data-acao="voltar">
          <IconeVoltar />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="m-0 truncate text-[12px] font-semibold text-tinta-suave">
            O Manual · {areaDoConceito(p.conceito)} · página {numeroDaPagina(p)}
          </p>
          <h1 className="m-0 text-[17px] font-extrabold leading-[1.15]">{tituloDaPagina(p)}</h1>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-3.5 pt-3.5">
        <CorpoPagina pagina={p} restaurada={restaurada} progresso={progresso} />
      </div>
    </main>
  );
}
