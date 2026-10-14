"use client";

/**
 * A Planta: uma planta desenhada no quadriculado. Cada conceito é uma etiqueta; cada dependência,
 * uma linha. A regra do lápis e da caneta: não avaliado e em projeto ficam a lápis; o que já está
 * em uso passa a tinta. Pede ajuste é manutenção, nunca reprovação. Sem porcentagem.
 */
import Link from "next/link";
import { useState } from "react";
import type { Conceito } from "@/nucleo/curriculo/curriculo";
import { evidenciasEmPalavras, situacaoConceito, type EstadoConceito, type SituacaoConceito } from "@/nucleo/dominio";
import type { Progresso } from "@/nucleo/progresso";
import { CONCEITOS } from "@/conteudo/conceitos";
import { ATIVIDADES } from "@/conteudo/atividades";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { rotaDe } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeChave } from "@/componentes/icones/IconeChave";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";

const W = 400;
const X = (x: number) => 52 + x * 59;
const Y = (y: number) => 40 + y * 72;
const LARG = 100;
const ALT = 48;
const ALTURA = Y(7) + ALT / 2 + 20;

type EstadoPlanta = EstadoConceito | "em_projeto";

const NOME_ESTADO: Record<EstadoPlanta, string> = {
  nao_avaliado: "Não avaliado",
  em_aprendizagem: "Aprendendo",
  dominado: "Dominado",
  consolidado: "Consolidado",
  pede_ajuste: "Pede ajuste",
  em_projeto: "Em projeto",
};

const DESCRICAO: Record<EstadoConceito, string> = {
  nao_avaliado: "A lápis: ainda sem medida.",
  em_aprendizagem: "Aprendendo: em uso, ainda não firme.",
  dominado: "Dominado: funcionou em situações diferentes.",
  consolidado: "Consolidado: continuou funcionando um dia depois.",
  pede_ajuste: "Pede ajuste: uma peça de baixo merece outra volta. É manutenção, não reprovação.",
};

function estadoNaPlanta(c: Conceito, s: SituacaoConceito): EstadoPlanta {
  return c.situacao === "em_projeto" ? "em_projeto" : s.estado;
}

/** Ao menos em aprendizagem: a peça já está em uso. */
function emUso(e: EstadoPlanta): boolean {
  return e === "em_aprendizagem" || e === "dominado" || e === "consolidado" || e === "pede_ajuste";
}

/** As linhas de dependência, em curva, da base de um conceito ao topo do que ele depende. */
function ligacoes(estados: Map<string, EstadoPlanta>): { chave: string; d: string; tinta: boolean }[] {
  return CONCEITOS.flatMap((c) =>
    c.dependeDe.flatMap((d) => {
      const dep = CONCEITOS.find((x) => x.id === d);
      if (!dep) return [];
      const x1 = X(c.planta.x);
      const y1 = Y(c.planta.y) + ALT / 2;
      const x2 = X(dep.planta.x);
      const y2 = Y(dep.planta.y) - ALT / 2;
      const meio = (y2 - y1) / 2;
      const tinta = emUso(estados.get(c.id) ?? "nao_avaliado") && emUso(estados.get(d) ?? "nao_avaliado");
      return [{ chave: `${c.id}-${d}`, d: `M ${x1} ${y1} C ${x1} ${y1 + meio}, ${x2} ${y2 - meio}, ${x2} ${y2}`, tinta }];
    }),
  );
}

export function Planta() {
  const { pronto, progresso } = useProgresso();
  const [aberto, setAberto] = useState<string | null>(null);
  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const provaveis = progresso.calibragem?.provaveis ?? [];
  const situacoes = new Map(CONCEITOS.map((c) => [c.id, situacaoConceito(c.id, progresso.evidencias, agora, provaveis)]));
  const estados = new Map(CONCEITOS.map((c) => [c.id, estadoNaPlanta(c, situacoes.get(c.id) as SituacaoConceito)]));
  const selecionado = CONCEITOS.find((c) => c.id === aberto) ?? null;

  return (
    <main data-pronto="sim" data-tela="planta" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="planta" />
      <div className="area-segura mx-auto w-full max-w-[880px] pt-5">
        <header>
          <p className="m-0 text-[13px] font-semibold text-tinta-suave">O que você sabe, peça por peça</p>
          <h1 className="m-0 text-[24px] font-extrabold leading-tight">A Planta</h1>
        </header>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative mx-auto w-full max-w-[520px] lg:mx-0" style={{ aspectRatio: `${W} / ${ALTURA}` }}>
          <svg viewBox={`0 0 ${W} ${ALTURA}`} className="traco-fixo absolute inset-0 h-full w-full" aria-hidden="true">
            {ligacoes(estados)
              .sort((x, y) => Number(x.tinta) - Number(y.tinta))
              .map((l) => (
                <path
                  key={l.chave}
                  d={l.d}
                  fill="none"
                  stroke={l.tinta ? "var(--contorno)" : "var(--grafite)"}
                  strokeWidth={l.tinta ? 2.4 : 2.2}
                  strokeDasharray={l.tinta ? undefined : "6 6"}
                  strokeLinecap="round"
                />
              ))}
          </svg>
          {CONCEITOS.map((c) => (
            <Componente key={c.id} c={c} s={situacoes.get(c.id) as SituacaoConceito} estado={estados.get(c.id) ?? "nao_avaliado"} selecionado={aberto === c.id} onAbrir={() => setAberto(c.id)} />
          ))}
        </div>
        <Legenda />
        </div>
      </div>
      {selecionado && (
        <Detalhe c={selecionado} s={situacoes.get(selecionado.id) as SituacaoConceito} estado={estados.get(selecionado.id) ?? "nao_avaliado"} progresso={progresso} onFechar={() => setAberto(null)} />
      )}
    </main>
  );
}

function Componente({ c, s, estado, selecionado, onAbrir }: { c: Conceito; s: SituacaoConceito; estado: EstadoPlanta; selecionado: boolean; onAbrir: () => void }) {
  const esquerda = ((X(c.planta.x) - LARG / 2) / W) * 100;
  const topo = ((Y(c.planta.y) - ALT / 2) / ALTURA) * 100;
  const descricao = estado === "em_projeto" ? "em projeto" : DESCRICAO[estado];
  return (
    <div className="absolute flex flex-col items-center" style={{ left: `${esquerda}%`, top: `${topo}%`, width: `${(LARG / W) * 100}%`, height: `${(ALT / ALTURA) * 100}%` }}>
      <button
        type="button"
        className={`etiqueta-planta h-full min-h-[44px] w-full ${selecionado ? "outline outline-[3px] outline-offset-2 outline-caneta" : ""}`}
        onClick={onAbrir}
        aria-label={`${c.nome}. ${descricao}`}
        data-conceito={c.id}
        data-estado={estado}
      >
        {s.provavel && estado === "nao_avaliado" && <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-contorno bg-caneta" aria-hidden="true" />}
        {(estado === "dominado" || estado === "consolidado") && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-contorno bg-verde-palido text-verde-escuro" aria-hidden="true">
            <IconeVisto />
          </span>
        )}
        {estado === "pede_ajuste" && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-contorno bg-marca-texto-palido" aria-hidden="true">
            <IconeChave />
          </span>
        )}
        <span className={estado === "consolidado" ? "grifo" : undefined}>{c.nome}</span>
      </button>
      {estado === "em_projeto" && (
        <span className="pointer-events-none mt-1 whitespace-nowrap rounded bg-papel px-1 font-mao text-[19px] font-bold leading-none text-tinta-suave" aria-hidden="true">
          ainda a lápis
        </span>
      )}
    </div>
  );
}

function Legenda() {
  const itens: { estado: EstadoPlanta; texto: string }[] = [
    { estado: "nao_avaliado", texto: "ainda sem medida" },
    { estado: "em_aprendizagem", texto: "em uso" },
    { estado: "dominado", texto: "firme" },
    { estado: "consolidado", texto: "durou um dia" },
    { estado: "pede_ajuste", texto: "merece outra volta" },
    { estado: "em_projeto", texto: "ainda não construído" },
  ];
  return (
    <section className="ficha w-full p-4 lg:w-[300px]" aria-label="Legenda">
      <h2 className="letra-mao m-0 text-[26px] text-tinta">Estados</h2>
      <ul className="m-0 mt-2 grid grid-cols-1 gap-x-4 gap-y-2.5 p-0 sm:grid-cols-2 lg:grid-cols-1">
        {itens.map((i) => (
          <li key={i.estado} className="flex list-none items-center gap-2.5 text-[14px] font-medium text-tinta-suave">
            <EtiquetaEstado estado={i.estado} />
            {i.texto}
          </li>
        ))}
        <li className="flex list-none items-center gap-2.5 text-[14px] font-medium text-tinta-suave">
          <span className="ml-1 h-3 w-3 shrink-0 rounded-full border-2 border-contorno bg-caneta" aria-hidden="true" />
          ponto azul: a calibragem acha provável
        </li>
      </ul>
    </section>
  );
}

export function EtiquetaEstado({ estado }: { estado: EstadoPlanta }) {
  return (
    <span className="etiqueta-estado" data-estado={estado}>
      {(estado === "dominado" || estado === "consolidado") && <IconeVisto />}
      {estado === "pede_ajuste" && <IconeChave />}
      <span className={estado === "consolidado" ? "grifo" : undefined}>{NOME_ESTADO[estado]}</span>
    </span>
  );
}

function proximoPasso(c: Conceito, s: SituacaoConceito, p: Progresso, agora: number): { rotulo: string; href: string } | null {
  if (c.situacao === "em_projeto") return null;
  const ensina = MISSOES_ARCO_1.filter((m) => m.conceitos.includes(c.id));
  if (s.estado === "pede_ajuste" && ensina[0]) return { rotulo: `Revisar na missão ${ensina[0].numero}`, href: rotaDe(ensina[0]) };
  if (s.revisitaEm !== null && s.revisitaEm <= agora) {
    return { rotulo: "Fazer a revisita", href: "/partilha/revisita" };
  }
  const pendente = ensina.find((m) => p.campanha.atividades[m.id]?.status !== "concluida");
  if (pendente) return { rotulo: `Missão ${pendente.numero}: ${pendente.titulo}`, href: rotaDe(pendente) };
  if (s.estado === "em_aprendizagem" || s.estado === "nao_avaliado") {
    const outra = ATIVIDADES.find((a) => (a.tipo === "exposicao" || a.tipo === "cena" || a.tipo === "eco") && a.conceitos.includes(c.id) && p.campanha.atividades[a.id]?.status !== "concluida");
    if (outra) return { rotulo: outra.titulo, href: rotaDe(outra) };
  }
  if (c.situacao === "pre_requisito") return { rotulo: "Medido na calibragem", href: "/calibragem" };
  return null;
}

function Detalhe({ c, s, estado, progresso, onFechar }: { c: Conceito; s: SituacaoConceito; estado: EstadoPlanta; progresso: Progresso; onFechar: () => void }) {
  const agora = agoraDoJogo(progresso);
  const evs = progresso.evidencias.filter((e) => e.conceito === c.id);
  const deps = c.dependeDe.map((d) => CONCEITOS.find((x) => x.id === d)?.nome ?? d);
  const passo = proximoPasso(c, s, progresso, agora);
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end lg:items-center lg:justify-center" role="dialog" aria-modal="true" aria-label={c.nome}>
      <button type="button" className="absolute inset-0 bg-[var(--veu)]" aria-label="Fechar" onClick={onFechar} />
      <section className="painel-sobe relative max-h-[80dvh] w-full overflow-y-auto px-5 pb-6 pt-5 area-segura-base anima-subir lg:max-w-[520px]" data-detalhe={c.id}>
        <EtiquetaEstado estado={estado} />
        <h2 className="m-0 mt-2.5 text-[22px] font-extrabold leading-tight">{c.nome}</h2>
        <p className="m-0 mt-1 text-[16px] font-medium">{c.linha}</p>
        {c.situacao !== "em_projeto" && (
          <>
            <p className="m-0 mt-3 text-[15px] font-bold">{DESCRICAO[s.estado]}</p>
            <ul className="m-0 mt-1 flex flex-col gap-1 p-0">
              {evidenciasEmPalavras(c.verbo, evs).map((l) => (
                <li key={l} className="list-none text-[15px] font-medium text-tinta-suave">
                  {l}
                </li>
              ))}
            </ul>
          </>
        )}
        {c.situacao === "em_projeto" && <p className="m-0 mt-3 text-[15px] font-medium text-tinta-suave">Esta peça ainda está a lápis: não foi construída nesta versão do jogo.</p>}
        {deps.length > 0 && <p className="m-0 mt-3 text-[14px] font-medium text-tinta-suave">Depende de: {deps.join(", ")}.</p>}
        <div className="mt-5 flex flex-col gap-2.5">
          {passo && (
            <Link href={passo.href} className="botao-principal w-full" data-acao="proximo-passo">
              {passo.rotulo}
            </Link>
          )}
          <button type="button" className="botao-secundario w-full" onClick={onFechar} autoFocus>
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
