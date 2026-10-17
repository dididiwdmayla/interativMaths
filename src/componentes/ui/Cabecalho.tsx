"use client";

/**
 * Cabeçalho das telas principais: o Nônio pequeno e a marca; à direita, o contador de joias (depois
 * da primeira), a lua ou o sol, a tela cheia (onde o navegador deixa) e o menu. Abaixo, a fila de lugares, a mesma em todas as telas. No computador, a fila sobe para a
 * mesma linha. Lugar ainda fechado fica a lápis e, tocado, diz quando abre.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { concluida } from "@/nucleo/campanha/campanha";
import { existeAtividade } from "@/componentes/estado/catalogo";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeJoia } from "@/componentes/icones/IconeJoia";
import { IconeMenu } from "@/componentes/icones/IconeMenu";
import { IconeVoltar } from "@/componentes/icones/IconeVoltar";
import { Nonio } from "@/componentes/nonio/Nonio";
import { Marca } from "./Marca";
import { BotaoTelaCheia } from "./TelaCheia";
import { BotaoTema } from "./Tema";

export type Lugar = "mapa" | "caderno" | "manual" | "planta" | "relicario" | "museu" | "rua" | "menu";

const M4 = "partilha.arco1.pao-nao-e-saca";

interface ItemFila {
  id: Exclude<Lugar, "menu">;
  rotulo: string;
  href: string;
  /** Quando fechado, o que dizer ao toque. */
  fechado: string | null;
}

function useFila(): ItemFila[] {
  const { progresso } = useProgresso();
  const transferencia = concluida(progresso, M4);
  return [
    { id: "mapa", rotulo: "Mapa", href: "/mapa", fechado: null },
    { id: "caderno", rotulo: "Caderno", href: "/caderno", fechado: null },
    { id: "manual", rotulo: "Manual", href: "/manual", fechado: null },
    { id: "planta", rotulo: "Planta", href: "/planta", fechado: null },
    { id: "relicario", rotulo: "Joias", href: "/relicario", fechado: null },
    { id: "museu", rotulo: "Museu", href: "/museu/paes-de-ahmes", fechado: transferencia && existeAtividade("museu.paes-de-ahmes") ? null : "O Museu abre depois da missão 4." },
    { id: "rua", rotulo: "A Rua", href: "/rua/tres-pizzas", fechado: transferencia && existeAtividade("rua.tres-pizzas") ? null : "A Rua abre depois da missão 4." },
  ];
}

function FilaLugares({ atual, onFechado }: { atual?: Lugar; onFechado: (texto: string) => void }) {
  const itens = useFila();
  return (
    <>
      {itens.map((i) =>
        i.fechado ? (
          <button key={i.id} type="button" className="etiqueta-nav" data-material="lapis" data-nav={i.id} aria-label={`${i.rotulo}: ainda fechado`} onClick={() => onFechado(i.fechado as string)}>
            {i.rotulo}
          </button>
        ) : (
          <Link key={i.id} href={i.href} className="etiqueta-nav" aria-current={i.id === atual ? "page" : undefined} data-nav={i.id}>
            {i.rotulo}
          </Link>
        ),
      )}
    </>
  );
}

export function CabecalhoJogo({ atual }: { atual?: Lugar }) {
  const { progresso } = useProgresso();
  const [bilhete, setBilhete] = useState<string | null>(null);
  useEffect(() => {
    if (!bilhete) return;
    const t = setTimeout(() => setBilhete(null), 2600);
    return () => clearTimeout(t);
  }, [bilhete]);
  const joias = Object.values(progresso.joias).filter((j) => j.encontrada).length;
  return (
    <header className="relative z-30 flex-none">
      <div className="cabecalho area-segura justify-between">
        <Link href="/mapa" className="flex min-h-[44px] items-center gap-2" aria-label="interativMaths: ir para o mapa">
          <Nonio tamanho={40} pes={false} rotulo="" />
          <Marca />
        </Link>
        <nav aria-label="Lugares" className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex">
          <FilaLugares atual={atual} onFechado={setBilhete} />
        </nav>
        <div className="flex items-center gap-2">
          {/* O contador só aparece depois da primeira joia: um "0" a sessão inteira diz "você não tem nada". */}
          {joias > 0 && (
            <Link
              href="/relicario"
              className="flex h-9 items-center gap-1.5 rounded-[10px] border-2 border-contorno bg-folha px-[11px] text-[15px] font-bold"
              aria-label={joias === 1 ? "1 joia encontrada" : `${joias} joias encontradas`}
              data-contador="joias"
            >
              <IconeJoia />
              <span className="algarismos">{joias}</span>
            </Link>
          )}
          <BotaoTema />
          {/* Com o contador de joias, a tela cheia sai do topo em telas estreitas (fica no Menu): senão a linha passa da tela. */}
          <span className={joias > 0 ? "hidden min-[430px]:contents" : "contents"}>
            <BotaoTelaCheia />
          </span>
          <Link href="/menu" className="botao-icone" aria-label="Menu" aria-current={atual === "menu" ? "page" : undefined} data-nav="menu">
            <IconeMenu />
          </Link>
        </div>
      </div>
      <nav aria-label="Lugares" className="fila-lugares area-segura lg:hidden">
        <FilaLugares atual={atual} onFechado={setBilhete} />
      </nav>
      {bilhete && (
        <p role="status" className="absolute right-[14px] top-full z-40 m-0 mt-2 max-w-[260px] rotate-[-1.5deg] rounded-md border-2 border-contorno bg-marca-texto text-sobre-marca px-3 py-2 text-[14px] font-semibold anima-esmaecer" data-bilhete="">
          {bilhete}
        </p>
      )}
    </header>
  );
}

/**
 * A linha de cima do cabeçalho. Quando a versão cheia ("Missão 4 · Aritmética · Frações") não
 * cabe numa linha, entra a curta ("Missão 3 · Divisão com resto"): a área sai primeiro.
 */
function LinhaLugar({ cheia, curta }: { cheia: string; curta: string }) {
  const caixa = useRef<HTMLParagraphElement>(null);
  const medida = useRef<HTMLSpanElement>(null);
  const [cabe, setCabe] = useState(true);
  useEffect(() => {
    const p = caixa.current;
    const m = medida.current;
    if (!p || !m || cheia === curta) return;
    // O observador avisa já na primeira medida, e de novo a cada mudança de largura.
    const ro = new ResizeObserver(() => setCabe(m.offsetWidth <= p.clientWidth));
    ro.observe(p);
    return () => ro.disconnect();
  }, [cheia, curta]);
  return (
    <p ref={caixa} className="relative m-0 truncate text-[12px] font-semibold text-tinta-suave" data-lugar={cabe ? "cheio" : "curto"}>
      <span ref={medida} className="invisible absolute left-0 top-0 whitespace-nowrap" aria-hidden="true">
        {cheia}
      </span>
      {cabe ? cheia : curta}
    </p>
  );
}

/** Dentro de missão, exposição e cena: voltar, o lugar em cima do título e botões à direita. */
export function CabecalhoLugar({
  voltar,
  lugar,
  titulo,
  direita,
}: {
  /** Sem voltar (null): a tela não tem para onde voltar (a degustação embutida). */
  voltar: { href: string; rotulo: string } | null;
  /** Texto, ou a versão cheia e a curta (a curta entra quando a cheia não cabe). */
  lugar: string | { readonly cheia: string; readonly curta: string };
  titulo: string;
  direita?: ReactNode;
}) {
  const linha = typeof lugar === "string" ? { cheia: lugar, curta: lugar } : lugar;
  return (
    <header className="cabecalho area-segura relative z-20">
      {voltar && (
        <Link href={voltar.href} className="botao-icone" aria-label={`Voltar para ${voltar.rotulo}`} data-acao="voltar">
          <IconeVoltar />
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <LinhaLugar cheia={linha.cheia} curta={linha.curta} />
        <h1 className="m-0 truncate text-[17px] font-extrabold leading-[1.15]">{titulo}</h1>
      </div>
      {direita}
    </header>
  );
}
