"use client";

/**
 * A página de A Partilha: um caminho desenhado. Uma linha tracejada desce a folha em curvas, com as
 * cinco missões como paradas. Feita: desenho a caneta e "feita!" à mão. Atual: circulada a lápis
 * vermelho, com o botão principal. Por vir: a lápis. Os chamados são bilhetes amarelos na margem.
 */
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { concluida, ecoDisponivel, revisitaDisponivel, situacaoMissoes, sondagensPendentes, type SituacaoMissao } from "@/nucleo/campanha/campanha";
import { REGRAS_CALIBRAGEM } from "@/conteudo/calibragem";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { ATIVIDADES } from "@/conteudo/atividades";
import { rotaDe, SONDAGEM_ATIVA } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeVoltar } from "@/componentes/icones/IconeVoltar";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { CirculoVermelho } from "./kit";
import { MiniaturaMissao } from "./Miniaturas";

const M4 = "partilha.arco1.pao-nao-e-saca";

interface Chamado {
  id: string;
  titulo: string;
  linha: string;
  href: string;
}

export function Distrito() {
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const estacoes = situacaoMissoes(progresso, MISSOES_ARCO_1, REGRAS_CALIBRAGEM);
  const atual =
    estacoes.find((s) => s.status === "em_andamento") ?? estacoes.find((s) => s.recomendada && s.status !== "concluida") ?? estacoes.find((s) => s.status === "disponivel") ?? null;
  const chamados: Chamado[] = [];
  const devidas = revisitaDisponivel(progresso, CONCEITOS_DO_ARCO_1, agora);
  if (devidas.length > 0 || progresso.revisitas.atual) {
    chamados.push({ id: "revisita", titulo: "Revisita do Nônio", linha: "Três perguntas rápidas, um dia depois.", href: "/partilha/revisita" });
  }
  const sondagens = SONDAGEM_ATIVA ? sondagensPendentes(progresso, CONCEITOS_DO_ARCO_1, agora) : [];
  for (const s of sondagens) {
    const c = CONCEITOS.find((x) => x.id === s.conceito);
    chamados.push({ id: `sondagem-${s.conceito}`, titulo: "Uma medida rápida", linha: `Sobre ${c?.nome.toLowerCase() ?? s.conceito}.`, href: `/partilha/sondagem?conceito=${encodeURIComponent(s.conceito)}` });
  }
  const eco = ATIVIDADES.find((a) => a.id === "partilha.arco1.eco");
  if (eco && ecoDisponivel(progresso, M4, eco.id)) {
    chamados.push({ id: "eco", titulo: "Eco: tonéis e casas", linha: "A mesma ideia com outra roupa.", href: rotaDe(eco) });
  }
  if (concluida(progresso, M4)) {
    for (const id of ["museu.paes-de-ahmes", "rua.tres-pizzas"]) {
      const a = ATIVIDADES.find((x) => x.id === id);
      if (a && !concluida(progresso, a.id)) chamados.push({ id, titulo: a.titulo, linha: a.tipo === "exposicao" ? "O Museu abriu." : "A Rua abriu.", href: rotaDe(a) });
    }
  }

  return (
    <main data-pronto="sim" data-tela="distrito" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="mapa" />
      <div className="area-segura mx-auto w-full max-w-[880px]">
        <header className="flex items-center gap-3 pb-2 pt-5">
          <Link href="/mapa" className="botao-icone" aria-label="Voltar ao mapa" data-acao="voltar">
            <IconeVoltar />
          </Link>
          <div className="min-w-0">
            <p className="m-0 truncate text-[13px] font-semibold text-tinta-suave">Arco 1 · O resto que ninguém repartia</p>
            <h1 className="m-0 font-mao text-[38px] font-bold leading-none">A Partilha</h1>
          </div>
        </header>

        {chamados.length > 0 && (
          <ul className="m-0 flex flex-wrap justify-end gap-3 p-0 pb-1 pt-2" aria-label="Chamados" data-quadro="">
            {chamados.map((c, i) => (
              <li key={c.id} className="list-none">
                <Link
                  href={c.href}
                  className="block max-w-[230px] rounded-md border-2 border-contorno bg-marca-texto text-sobre-marca px-3 py-2 anima-subir"
                  style={{ transform: `rotate(${i % 2 === 0 ? -2 : 1.5}deg)` }}
                  data-chamado={c.id}
                >
                  <span className="block text-[15px] font-extrabold leading-tight">{c.titulo}</span>
                  <span className="block text-[13px] font-medium">{c.linha}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Caminho estacoes={estacoes} atual={atual?.missao.id ?? null} />
      </div>
    </main>
  );
}

/** As paradas em zigue-zague, ligadas por uma linha tracejada medida depois de desenhar. */
function Caminho({ estacoes, atual }: { estacoes: SituacaoMissao[]; atual: string | null }) {
  const caixa = useRef<HTMLOListElement>(null);
  const [pontos, setPontos] = useState<{ x: number; y: number }[]>([]);
  const [tamanho, setTamanho] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => {
      const base = el.getBoundingClientRect();
      const nos = Array.from(el.querySelectorAll<HTMLElement>("[data-no]"));
      setPontos(
        nos.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
        }),
      );
      setTamanho({ w: base.width, h: base.height });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    return () => obs.disconnect();
  }, [estacoes.length]);
  const indiceAtual = estacoes.findIndex((s) => s.missao.id === atual);
  const ultimoFeito = estacoes.reduce((k, s, i) => (s.status === "concluida" ? i : k), -1);
  const percorrido = Math.max(indiceAtual, ultimoFeito);
  const trecho = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const meio = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${a.x} ${meio}, ${b.x} ${meio}, ${b.x} ${b.y}`;
  };
  return (
    <div className="relative mt-4">
      <svg className="pointer-events-none absolute left-0 top-0" width={tamanho.w} height={tamanho.h} aria-hidden="true">
        {pontos.slice(1).map((p, i) => (
          <path key={i} d={trecho(pontos[i], p)} fill="none" stroke={i < percorrido ? "var(--caneta)" : "var(--grafite)"} strokeWidth={i < percorrido ? 2.6 : 2.4} strokeDasharray="7 7" strokeLinecap="round" />
        ))}
      </svg>
      <ol ref={caixa} className="relative m-0 flex flex-col gap-9 px-1 py-0" aria-label="Paradas do caminho">
        {estacoes.map((s, i) => (
          <Parada key={s.missao.id} s={s} lado={i % 2 === 0 ? "esquerda" : "direita"} atual={s.missao.id === atual} />
        ))}
      </ol>
    </div>
  );
}

function Parada({ s, lado, atual }: { s: SituacaoMissao; lado: "esquerda" | "direita"; atual: boolean }) {
  const m = s.missao;
  const rota = rotaDe(m);
  const feita = s.status === "concluida";
  const porVir = s.status === "bloqueada";
  const estado = feita
    ? s.via === "prova"
      ? "Feita pela prova direta."
      : "A página está no Caderno."
    : s.status === "em_andamento"
      ? "A máquina está como você deixou."
      : porVir
        ? `Abre depois da missão ${(m.numero ?? 1) - 1}.`
        : atual
          ? "Próxima parada."
          : "Aberta.";
  return (
    <li className={`flex w-full list-none items-center gap-3 lg:w-[640px] ${lado === "direita" ? "flex-row-reverse lg:self-end" : "lg:self-start"}`} data-estacao={m.id} data-status={s.status}>
      <div className="relative shrink-0" data-no="">
        <div className={`relative z-[1] flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-2 bg-folha ${porVir ? "border-dashed border-grafite" : "border-contorno bg-marca-texto-palido"}`}>
          <MiniaturaMissao numero={m.numero ?? 1} tamanho={46} lapis={porVir} />
        </div>
        {atual && (
          <svg className="pointer-events-none absolute -left-3 -top-3 z-[2]" width={96} height={96} viewBox="0 0 96 96" aria-hidden="true">
            <CirculoVermelho cx={48} cy={48} rx={43} ry={42} semente={m.numero ?? 1} />
          </svg>
        )}
      </div>
      <div className={`relative min-w-0 flex-1 px-3.5 pb-3 pt-2.5 ${porVir ? "ficha-lapis" : "ficha"}`}>
        <p className={`m-0 text-[12px] font-semibold ${porVir ? "text-tinta-suave" : "text-tinta-suave"}`}>
          Missão {m.numero} · {m.ideia}
        </p>
        <h2 className={`m-0 text-[17px] font-extrabold leading-tight ${porVir ? "text-tinta-suave" : ""}`}>{m.titulo}</h2>
        <p className="m-0 mt-0.5 text-[14px] font-medium text-tinta-suave">{estado}</p>
        {feita && (
          <span className="absolute bottom-3 right-4 rotate-[-6deg] font-mao text-[26px] font-bold leading-none text-verde-escuro" aria-hidden="true">
            feita!
          </span>
        )}
        {!porVir && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            <Link href={rota} className={atual ? "botao-principal" : "botao-secundario"} data-acao="entrar">
              {feita ? "Refazer" : s.status === "em_andamento" ? "Continuar" : "Entrar"}
            </Link>
            {s.provaLiberada && (
              <Link href={`${rota}?modo=prova`} className="botao-secundario" data-acao="prova">
                Prova direta
              </Link>
            )}
            {feita && !s.temPagina && m.passos.some((p) => p.fase === "formalizacao") && (
              <Link href={`${rota}?modo=registro`} className="botao-secundario" data-acao="registro">
                Passar a limpo
              </Link>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
