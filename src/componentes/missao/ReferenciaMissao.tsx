"use client";

/**
 * A referência da missão (referência 7 de v04.html): o livro no cabeçalho abre uma folha com as
 * etiquetas (missão, área, conteúdo formal), os nomes dos conceitos da atividade e as páginas do
 * Manual que ajudam ali. As dos pré-requisitos restauradas abrem dentro da folha; as da própria
 * missão ficam rasgadas até a descoberta. Na degustação, só os nomes.
 */
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { IdConceito } from "@/nucleo/curriculo/curriculo";
import type { Atividade } from "@/nucleo/missoes/tipos";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { IconeLivro } from "@/componentes/icones/IconeLivro";
import { IconePagina } from "@/componentes/icones/IconePagina";
import { IconeVoltar } from "@/componentes/icones/IconeVoltar";
import { CorpoPagina, OsNomes } from "@/componentes/manual/PaginaManual";
import {
  TEXTOS_MANUAL,
  conceitoPorId,
  missaoDaPagina,
  nomeFormalDe,
  nomesDosConceitos,
  ondeRestaura,
  paginaDoConceito,
  preencherManual,
  prefixoDe,
  restauradasDe,
  tituloDaPagina,
} from "@/componentes/manual/dados";

const T = TEXTOS_MANUAL.referencia;

/** Os pré-requisitos diretos da atividade que têm página, sem os conceitos dela mesma. */
function preRequisitos(a: Atividade): IdConceito[] {
  const saida: IdConceito[] = [];
  for (const id of a.conceitos) {
    for (const dep of conceitoPorId(id)?.dependeDe ?? []) {
      if (!a.conceitos.includes(dep) && !saida.includes(dep) && paginaDoConceito(dep)) saida.push(dep);
    }
  }
  return saida;
}

/** Uma página na folha: restaurada abre ali mesmo; rasgada diz onde se restaura. */
function LinhaPagina({ id, restaurada, nestaMissao = false, onAbrir }: { id: IdConceito; restaurada: boolean; nestaMissao?: boolean; onAbrir: () => void }) {
  const p = paginaDoConceito(id);
  if (!p) return null;
  const sub = restaurada
    ? preencherManual(TEXTOS_MANUAL.restauradaNa, { n: missaoDaPagina(id)?.numero ?? "" })
    : nestaMissao
      ? TEXTOS_MANUAL.restauraNesta
      : ondeRestaura(id);
  const corpo = (
    <>
      <IconePagina rasgada={!restaurada} tamanho={22} />
      <span className="min-w-0 flex-1">
        <span className="manual-pag-t">{tituloDaPagina(p)}</span>
        <span className="manual-pag-s">{sub}</span>
      </span>
    </>
  );
  return restaurada ? (
    <button type="button" className="manual-pag text-left" onClick={onAbrir} data-pagina-manual={id} data-restaurada="sim">
      {corpo}
    </button>
  ) : (
    <div className="manual-pag" data-rasgada="" data-pagina-manual={id} data-restaurada="nao">
      {corpo}
    </div>
  );
}

export function BotaoReferencia({ a }: { a: Atividade }) {
  const [aberta, setAberta] = useState(false);
  return (
    <>
      <button type="button" className="botao-icone" aria-label={T.titulo} aria-haspopup="dialog" onClick={() => setAberta(true)} data-referencia-missao="botao">
        <IconeLivro />
      </button>
      {/* No corpo do documento: dentro do cabeçalho, a folha ficaria presa à camada dele. */}
      {aberta && createPortal(<FolhaReferencia a={a} onFechar={() => setAberta(false)} />, document.body)}
    </>
  );
}

function FolhaReferencia({ a, onFechar }: { a: Atividade; onFechar: () => void }) {
  const { progresso } = useProgresso();
  const [aberta, setAberta] = useState<IdConceito | null>(null);
  const restauradas = restauradasDe(progresso);
  const degustacao = a.tipo === "degustacao";
  const formal = nomeFormalDe(a);
  const pagina = aberta ? paginaDoConceito(aberta) : null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label={T.titulo}>
      <button type="button" className="absolute inset-0 bg-veu" aria-label={T.fechar} onClick={onFechar} />
      <div className="painel-sobe relative flex max-h-[86dvh] w-full flex-col gap-3 overflow-y-auto px-4 pb-5 pt-3 area-segura-base anima-subir lg:max-w-[520px]" data-referencia-missao="folha">
        <div className="alca-folha" aria-hidden="true" />
        {pagina ? (
          <>
            <div className="flex items-center gap-2.5">
              <button type="button" className="botao-icone" aria-label={T.voltar} onClick={() => setAberta(null)} data-acao="voltar-referencia">
                <IconeVoltar />
              </button>
              <h2 className="m-0 min-w-0 flex-1 text-[17px] font-extrabold leading-tight">{tituloDaPagina(pagina)}</h2>
              <button type="button" className="botao-icone" aria-label={T.fechar} onClick={onFechar}>
                <IconeFechar />
              </button>
            </div>
            <CorpoPagina pagina={pagina} restaurada progresso={progresso} dentroDaReferencia />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <span className="flex-none text-caneta">
                <IconeLivro tamanho={30} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-[18px] font-extrabold">{T.titulo}</h2>
                <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{T.subtitulo}</p>
              </div>
              <button type="button" className="botao-icone" aria-label={T.fechar} onClick={onFechar}>
                <IconeFechar />
              </button>
            </div>
            {!degustacao && (
              <div className="flex flex-wrap gap-1.5" data-etiquetas-formais="">
                <span className="manual-tag">{prefixoDe(a, "guiada")}</span>
                {formal.area && <span className="manual-tag">{formal.area}</span>}
                <span className="manual-tag" data-conteudo="">
                  {formal.etiqueta}
                </span>
              </div>
            )}
            <section className="flex flex-col gap-2" aria-label={TEXTOS_MANUAL.secoes.nomes}>
              <h3 className="manual-rot">{TEXTOS_MANUAL.secoes.nomes}</h3>
              <OsNomes nomes={nomesDosConceitos(a.conceitos)} />
            </section>
            {!degustacao && (
              <section className="flex flex-col gap-2" aria-label={T.ajudam}>
                <h3 className="manual-rot">{T.ajudam}</h3>
                {preRequisitos(a).map((id) => (
                  <LinhaPagina key={id} id={id} restaurada={restauradas.has(id)} onAbrir={() => setAberta(id)} />
                ))}
                {a.conceitos.map((id) => (
                  <LinhaPagina key={id} id={id} restaurada={restauradas.has(id)} nestaMissao={missaoDaPagina(id)?.id === a.id} onAbrir={() => setAberta(id)} />
                ))}
              </section>
            )}
            {!degustacao && (
              <Link href="/manual" className="botao-secundario w-full" data-acao="abrir-manual">
                {T.abrirTudo}
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
