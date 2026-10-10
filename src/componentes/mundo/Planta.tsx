"use client";

/**
 * A Planta: a planta baixa do Engenho, em papel. Cada conceito é um componente; cada dependência,
 * um cano. O estado é do mecanismo, nunca um rótulo de pessoa. Sem porcentagem.
 */
import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import type { Conceito } from "@/nucleo/curriculo/curriculo";
import { evidenciasEmPalavras, situacaoConceito, type EstadoConceito, type SituacaoConceito } from "@/nucleo/dominio";
import type { Progresso } from "@/nucleo/progresso";
import { CONCEITOS } from "@/conteudo/conceitos";
import { ATIVIDADES } from "@/conteudo/atividades";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { rotaDe } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";

const W = 400;
const X = (x: number) => 52 + x * 59;
const Y = (y: number) => 62 + y * 70;
const LARG = 96;
const ALT = 46;

const DESCRICAO: Record<EstadoConceito, string> = {
  nao_avaliado: "Ainda sem medida: traço fino.",
  em_aprendizagem: "Montado, com luz-piloto: em uso, ainda não firme.",
  dominado: "Aceso: funcionou em situações diferentes.",
  consolidado: "Aceso, com anel de latão: continuou funcionando um dia depois.",
  pede_ajuste: "Pede ajuste: a luz oscila. Uma peça de baixo precisa de revisão.",
};

export function Planta() {
  const { pronto, progresso } = useProgresso();
  const [aberto, setAberto] = useState<string | null>(null);
  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const provaveis = progresso.calibragem?.provaveis ?? [];
  const situacoes = new Map(CONCEITOS.map((c) => [c.id, situacaoConceito(c.id, progresso.evidencias, agora, provaveis)]));
  const selecionado = CONCEITOS.find((c) => c.id === aberto) ?? null;
  const altura = Y(7) + ALT + 30;

  return (
    <main data-pronto="sim" data-tela="planta" className="min-h-dvh pb-28">
      <header className="area-segura area-segura-topo pb-3 pt-4">
        <p className="rotulo-chapa m-0">Mapa do que você sabe</p>
        <h1 className="fonte-sinal m-0 text-[2.2rem] font-extrabold uppercase leading-none text-papel">A Planta</h1>
      </header>
      <div className="area-segura mx-auto max-w-xl">
        <div className="papel overflow-hidden rounded-2xl shadow-[0_8px_24px_var(--sombra)]">
          <svg viewBox={`0 0 ${W} ${altura}`} className="block h-auto w-full" role="group" aria-label="Planta dos conceitos">
            <text x={14} y={22} fontSize={11} className="fonte-sinal" fill="var(--tinta-suave)" style={{ letterSpacing: 1.5 }}>
              ENGENHO · DISTRITO A PARTILHA · PLANTA BAIXA
            </text>
            {/* canos: de cada conceito para os que ele depende */}
            {CONCEITOS.flatMap((c) =>
              c.dependeDe.map((d) => {
                const dep = CONCEITOS.find((x) => x.id === d);
                if (!dep) return null;
                const x1 = X(c.planta.x);
                const y1 = Y(c.planta.y) + ALT / 2;
                const x2 = X(dep.planta.x);
                const y2 = Y(dep.planta.y) - ALT / 2;
                const meio = (y1 + y2) / 2 + (y2 > y1 ? 0 : 0);
                const caminho = `M ${x1} ${y1 + (y2 > y1 ? 0 : 0)} L ${x1} ${meio} L ${x2} ${meio} L ${x2} ${y2}`;
                const viva = (situacoes.get(d)?.estado ?? "nao_avaliado") === "dominado" || situacoes.get(d)?.estado === "consolidado";
                return (
                  <g key={`${c.id}-${d}`} aria-hidden="true">
                    <path d={caminho} fill="none" stroke="var(--tinta-suave)" strokeWidth={4} strokeLinejoin="round" opacity={0.75} />
                    <path d={caminho} fill="none" stroke={viva ? "var(--ambar)" : "var(--papel)"} strokeWidth={1.6} strokeLinejoin="round" />
                  </g>
                );
              }),
            )}
            {CONCEITOS.map((c) => (
              <Componente key={c.id} c={c} s={situacoes.get(c.id) as SituacaoConceito} selecionado={aberto === c.id} onAbrir={() => setAberto(c.id)} />
            ))}
          </svg>
        </div>
        <Legenda />
      </div>
      {selecionado && (
        <Detalhe c={selecionado} s={situacoes.get(selecionado.id) as SituacaoConceito} progresso={progresso} onFechar={() => setAberto(null)} />
      )}
      <NavJogo atual="planta" />
    </main>
  );
}

function linhasDoNome(nome: string): string[] {
  const palavras = nome.split(" ");
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    if ((atual + " " + p).trim().length > 14 && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = (atual + " " + p).trim();
    }
  }
  if (atual) linhas.push(atual);
  return linhas.slice(0, 3);
}

function Componente({ c, s, selecionado, onAbrir }: { c: Conceito; s: SituacaoConceito; selecionado: boolean; onAbrir: () => void }) {
  const x = X(c.planta.x) - LARG / 2;
  const y = Y(c.planta.y) - ALT / 2;
  const emProjeto = c.situacao === "em_projeto";
  const aceso = s.estado === "dominado" || s.estado === "consolidado";
  const tracejado = emProjeto || s.estado === "nao_avaliado";
  const teclado = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAbrir();
    }
  };
  const linhas = linhasDoNome(c.nome);
  return (
    <g role="button" tabIndex={0} aria-label={`${c.nome}${emProjeto ? ", em projeto" : ""}. ${DESCRICAO[s.estado]}`} onClick={onAbrir} onKeyDown={teclado} style={{ cursor: "pointer" }} data-focavel="" data-conceito={c.id} data-estado={emProjeto ? "em_projeto" : s.estado}>
      {aceso && <rect x={x - 6} y={y - 6} width={LARG + 12} height={ALT + 12} rx={12} fill="var(--ambar-halo)" />}
      {s.estado === "consolidado" && <rect x={x - 4} y={y - 4} width={LARG + 8} height={ALT + 8} rx={10} fill="none" stroke="var(--latao)" strokeWidth={3} />}
      <rect
        x={x}
        y={y}
        width={LARG}
        height={ALT}
        rx={7}
        fill={aceso ? "var(--ambar)" : "var(--papel)"}
        stroke={selecionado ? "var(--turquesa-tinta)" : "var(--tinta)"}
        strokeWidth={selecionado ? 2.6 : tracejado ? 1 : 1.8}
        strokeDasharray={emProjeto ? "2 3" : s.estado === "nao_avaliado" ? "5 3" : undefined}
      />
      {linhas.map((l, i) => (
        <text key={i} x={x + LARG / 2} y={y + ALT / 2 + (i - (linhas.length - 1) / 2) * 12 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10.5} fontWeight={600} fill={emProjeto ? "var(--tinta-suave)" : "var(--tinta)"}>
          {l}
        </text>
      ))}
      {s.estado === "em_aprendizagem" && <circle cx={x + LARG - 7} cy={y + 7} r={3.4} fill="var(--ambar-sombra)" className="piloto" />}
      {s.estado === "pede_ajuste" && (
        <g>
          <circle cx={x + LARG - 7} cy={y + 7} r={3.6} fill="var(--vermelhao)" className="luz-oscilante" />
          <path d={`M ${x + LARG - 22} ${y + ALT - 2} l 18 0 l 4 8 l -22 0 Z`} fill="var(--papel-sombra)" stroke="var(--tinta-vermelha)" strokeWidth={0.8} />
          <text x={x + LARG - 13} y={y + ALT + 4} textAnchor="middle" fontSize={6} fill="var(--tinta-vermelha)" fontWeight={700}>
            AJUSTE
          </text>
        </g>
      )}
      {s.provavel && !aceso && !emProjeto && (
        <text x={x + 5} y={y + 9} fontSize={7} fill="var(--turquesa-tinta)" fontWeight={700}>
          CALIBRAGEM
        </text>
      )}
      {emProjeto && (
        <text x={x + LARG / 2} y={y + ALT + 9} textAnchor="middle" fontSize={7.5} fill="var(--tinta-suave)" className="fonte-sinal" style={{ letterSpacing: 1 }}>
          EM PROJETO
        </text>
      )}
      <rect className="anel-foco" x={x - 3} y={y - 3} width={LARG + 6} height={ALT + 6} rx={9} />
    </g>
  );
}

function Legenda() {
  const itens: { estado: EstadoConceito | "em_projeto"; texto: string }[] = [
    { estado: "nao_avaliado", texto: "traço fino: ainda sem medida" },
    { estado: "em_aprendizagem", texto: "luz-piloto: em uso" },
    { estado: "dominado", texto: "aceso: firme" },
    { estado: "consolidado", texto: "anel de latão: durou um dia" },
    { estado: "pede_ajuste", texto: "luz oscilando: pede ajuste" },
    { estado: "em_projeto", texto: "pontilhado: em projeto" },
  ];
  return (
    <ul className="m-0 mt-3 grid grid-cols-2 gap-x-3 gap-y-1 p-0 text-[0.86rem] text-texto-mundo-suave" aria-label="Legenda">
      {itens.map((i) => (
        <li key={i.estado} className="flex list-none items-center gap-2">
          <svg viewBox="0 0 24 14" width="24" height="14" aria-hidden="true">
            <rect x="1" y="1" width="22" height="12" rx="3" fill={i.estado === "dominado" || i.estado === "consolidado" ? "var(--ambar)" : "var(--papel)"} stroke={i.estado === "consolidado" ? "var(--latao)" : "var(--tinta)"} strokeWidth={i.estado === "consolidado" ? 2.4 : 1} strokeDasharray={i.estado === "nao_avaliado" ? "3 2" : i.estado === "em_projeto" ? "1.5 2" : undefined} />
            {i.estado === "em_aprendizagem" && <circle cx="19" cy="5" r="2" fill="var(--ambar-sombra)" />}
            {i.estado === "pede_ajuste" && <circle cx="19" cy="5" r="2" fill="var(--vermelhao)" />}
          </svg>
          {i.texto}
        </li>
      ))}
    </ul>
  );
}

function proximoPasso(c: Conceito, s: SituacaoConceito, p: Progresso, agora: number): { rotulo: string; href: string } | null {
  if (c.situacao === "em_projeto") return null;
  const ensina = MISSOES_ARCO_1.filter((m) => m.conceitos.includes(c.id));
  if (s.estado === "pede_ajuste" && ensina[0]) return { rotulo: `Revisar na missão ${ensina[0].numero}`, href: rotaDe(ensina[0]) };
  if (s.revisitaEm !== null && s.revisitaEm <= agora) {
    const r = ATIVIDADES.find((a) => a.id === "partilha.arco1.revisita");
    if (r) return { rotulo: "Fazer a revisita", href: rotaDe(r) };
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

function Detalhe({ c, s, progresso, onFechar }: { c: Conceito; s: SituacaoConceito; progresso: Progresso; onFechar: () => void }) {
  const agora = agoraDoJogo(progresso);
  const evs = progresso.evidencias.filter((e) => e.conceito === c.id);
  const deps = c.dependeDe.map((d) => CONCEITOS.find((x) => x.id === d)?.nome ?? d);
  const passo = proximoPasso(c, s, progresso, agora);
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={c.nome}>
      <button type="button" className="absolute inset-0 bg-[var(--veu)]" aria-label="Fechar" onClick={onFechar} />
      <section className="papel relative mx-2 mb-2 max-h-[78dvh] overflow-y-auto rounded-2xl p-4 pb-6 anima-esmaecer" data-detalhe={c.id}>
        <p className="m-0 text-[0.8rem] uppercase tracking-wide text-tinta-suave">{c.situacao === "em_projeto" ? "Em projeto" : "Componente"}</p>
        <h2 className="fonte-sinal m-0 text-[1.7rem] font-bold uppercase text-tinta">{c.nome}</h2>
        <p className="m-0 mt-1 text-[1.02rem] text-tinta">{c.linha}</p>
        {c.situacao !== "em_projeto" && (
          <>
            <p className="m-0 mt-3 text-[0.95rem] font-semibold text-tinta">{DESCRICAO[s.estado]}</p>
            <ul className="m-0 mt-1 flex flex-col gap-1 p-0">
              {evidenciasEmPalavras(c.verbo, evs).map((l) => (
                <li key={l} className="list-none text-[0.95rem] text-tinta-suave">
                  {l}
                </li>
              ))}
            </ul>
          </>
        )}
        {c.situacao === "em_projeto" && <p className="m-0 mt-3 text-tinta-suave">Este componente ainda não foi construído nesta versão do jogo.</p>}
        {deps.length > 0 && <p className="m-0 mt-3 text-[0.92rem] text-tinta-suave">Depende de: {deps.join(", ")}.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {passo && (
            <Link href={passo.href} className="placa placa-papel placa-cheia" data-acao="proximo-passo">
              {passo.rotulo}
            </Link>
          )}
          <button type="button" className="placa placa-papel" onClick={onFechar} autoFocus>
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
