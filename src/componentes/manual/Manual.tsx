"use client";

/**
 * O Manual (referência 5 de v04.html): o que o Engenho sabe, passado a limpo. Uma seção por
 * área; em cada uma, as páginas na ordem do Manual. Restaurada abre inteira; rasgada abre só com
 * os nomes; a lápis ainda não tem missão. As outras áreas são uma linha a lápis.
 */
import Link from "next/link";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconePagina, IconePaginaLapis } from "@/componentes/icones/IconePagina";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import {
  AREAS,
  CONCEITOS_A_LAPIS,
  PAGINAS_MANUAL,
  TEXTOS_MANUAL,
  conceitoPorId,
  missaoDaPagina,
  ondeRestaura,
  preencherManual,
  restauradasDe,
  tituloDaPagina,
} from "./dados";

export function Manual() {
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  const restauradas = restauradasDe(progresso);
  const feitas = PAGINAS_MANUAL.filter((p) => restauradas.has(p.conceito)).length;
  const comPaginas = AREAS.filter((a) => PAGINAS_MANUAL.some((p) => conceitoPorId(p.conceito)?.distrito === a.distrito));
  const outras = AREAS.filter((a) => !comPaginas.includes(a));
  return (
    <main data-pronto="sim" data-tela="manual" data-manual="" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="manual" />
      <div className="area-segura mx-auto flex w-full max-w-[640px] flex-col gap-2.5 pt-4">
        <div className="flex items-end justify-between gap-2.5">
          <div className="min-w-0">
            <p className="m-0 text-[12.5px] font-semibold text-tinta-suave">{TEXTOS_MANUAL.sobretitulo}</p>
            <h1 className="m-0 mt-0.5 text-[26px] font-extrabold leading-[1.1]">{TEXTOS_MANUAL.titulo}</h1>
          </div>
          <span className="manual-contagem" data-contagem={`${feitas}/${PAGINAS_MANUAL.length}`}>
            {feitas} de {PAGINAS_MANUAL.length} páginas
          </span>
        </div>
        <p className="m-0 text-[14px] font-medium leading-[1.4] text-tinta-suave">{TEXTOS_MANUAL.explicacao}</p>

        {comPaginas.map((area) => (
          <section key={area.distrito} className="flex flex-col gap-2.5" aria-label={area.area}>
            <h2 className="manual-secao">
              <span className="manual-secao-t">{area.area}</span>
              <span className="manual-secao-s">{area.nome}</span>
            </h2>
            {PAGINAS_MANUAL.filter((p) => conceitoPorId(p.conceito)?.distrito === area.distrito).map((p) => {
              const restaurada = restauradas.has(p.conceito);
              const m = missaoDaPagina(p.conceito);
              return (
                <Link key={p.slug} href={`/manual/${p.slug}`} className="manual-pag" data-rasgada={restaurada ? undefined : ""} data-pagina-manual={p.conceito} data-restaurada={restaurada ? "sim" : "nao"}>
                  <IconePagina rasgada={!restaurada} />
                  <span className="min-w-0 flex-1">
                    <span className="manual-pag-t">{tituloDaPagina(p)}</span>
                    <span className="manual-pag-s">{restaurada ? `Missão ${m?.numero} · ${m?.titulo}` : ondeRestaura(p.conceito)}</span>
                  </span>
                  {restaurada && <span className="manual-selo">{TEXTOS_MANUAL.restaurada}</span>}
                  <span className="so-leitor">{restaurada ? "" : ", rasgada"}</span>
                </Link>
              );
            })}
            {CONCEITOS_A_LAPIS.filter((l) => conceitoPorId(l.conceito)?.distrito === area.distrito).map((l) => (
              <div key={l.conceito} className="manual-pag" data-lapis="" data-pagina-manual={l.conceito}>
                <IconePaginaLapis />
                <span className="min-w-0 flex-1">
                  <span className="manual-pag-t">{conceitoPorId(l.conceito)?.formal}</span>
                  <span className="manual-pag-s">{preencherManual(TEXTOS_MANUAL.aLapis, { arco: l.arco })}</span>
                </span>
              </div>
            ))}
          </section>
        ))}

        {outras.map((area) => (
          <h2 key={area.distrito} className="manual-secao" data-lapis="">
            <span className="manual-secao-t">{area.area}</span>
            <span className="manual-secao-s">{preencherManual(TEXTOS_MANUAL.areaALapis, { distrito: area.nome })}</span>
          </h2>
        ))}
      </div>
    </main>
  );
}
