"use client";

/**
 * /lab/vitrine: tokens, kit de peças, expressões do Nônio, estágios das joias, notação.
 */
import Link from "next/link";
import { useState } from "react";
import { racional } from "@/nucleo/racional/racional";
import { JOIAS } from "@/conteudo/joias";
import { Cano, Engrenagem, Lampada, Placa, Rebite, Rolo, Viga, Volante } from "@/componentes/mundo/kit";
import { Unidade, Saco } from "@/componentes/maquinas/pecas";
import { comporUnidades } from "@/componentes/maquinas/geometria";
import { Receptor } from "@/componentes/maquinas/receptores";
import { CotaH, NumeroSvg } from "@/componentes/maquinas/cota";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";
import { Gema } from "@/componentes/joias/Gema";
import { LinhaNotacao, BlocoNotacao } from "@/componentes/notacao/Notacao";
import { Numero, Fracao } from "@/componentes/notacao/Numero";
import { Seletor } from "@/componentes/ui/Seletor";
import { Alavanca } from "@/componentes/ui/Alavanca";
import { FolhaPapel, NotaDalia } from "@/componentes/missao/Papel";

const TOKENS: { grupo: string; nomes: string[] }[] = [
  { grupo: "Mundo", nomes: ["noite", "noite-clara", "noite-funda", "noite-borda", "texto-mundo", "texto-mundo-suave"] },
  { grupo: "Significado", nomes: ["turquesa", "turquesa-clara", "ambar", "vermelhao", "latao", "mostarda"] },
  { grupo: "Papel", nomes: ["papel", "papel-sombra", "tinta", "tinta-suave", "tinta-dalia", "turquesa-tinta"] },
  { grupo: "Materiais", nomes: ["saca", "broa", "miolo", "pizza", "agua", "madeira", "aco"] },
  { grupo: "Joias", nomes: ["granada", "safira", "ametista", "turmalina"] },
];

const EXPRESSOES: ExpressaoNonio[] = ["neutro", "atento", "medindo", "duvida", "satisfeito", "quieto"];

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="chapa flex flex-col gap-3 p-4">
      <h2 className="rotulo-chapa m-0">{titulo}</h2>
      {children}
    </section>
  );
}

export function Vitrine() {
  const [lote, setLote] = useState(3);
  return (
    <main data-pronto="sim" data-tela="lab-vitrine" className="area-segura area-segura-topo mx-auto flex max-w-3xl flex-col gap-5 pb-16 pt-4">
      <header className="flex items-center gap-3">
        <Link href="/lab" className="placa placa-pequena placa-discreta">
          Lab
        </Link>
        <h1 className="fonte-sinal m-0 text-[1.9rem] font-extrabold uppercase">Vitrine</h1>
      </header>

      <Secao titulo="Tokens de cor (tokens.css)">
        {TOKENS.map((g) => (
          <div key={g.grupo}>
            <p className="m-0 mb-1 text-[0.85rem] text-texto-mundo-suave">{g.grupo}</p>
            <div className="flex flex-wrap gap-2">
              {g.nomes.map((n) => (
                <div key={n} className="flex w-[92px] flex-col items-center gap-1">
                  <span className="block h-10 w-full rounded-md border border-noite-borda" style={{ background: `var(--${n})` }} />
                  <span className="text-[0.75rem] text-texto-mundo-suave">{n}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Secao>

      <Secao titulo="Tipografia">
        <p className="fonte-sinal m-0 text-[2rem] font-extrabold uppercase text-latao-claro">Big Shoulders: placas e números</p>
        <p className="m-0 text-[1.1rem]">Atkinson Hyperlegible Next: texto e algarismos 0123456789 Il1 O0</p>
        <p className="letra-dalia m-0">Caveat: a letra da Dália, só nas margens.</p>
      </Secao>

      <Secao titulo="Kit de peças">
        <svg viewBox="0 0 400 130" className="w-full" aria-label="Kit de peças" role="img">
          <Rebite x={20} y={20} r={4} />
          <Viga x={40} y={14} largura={120} altura={10} rebites={4} />
          <Placa x={180} y={10} largura={120} altura={20}>
            Placa
          </Placa>
          <Lampada x={330} y={20} r={6} estado="apagada" />
          <Lampada x={360} y={20} r={6} estado="piloto" />
          <Lampada x={390} y={20} r={6} estado="acesa" />
          <Volante x={30} y={70} r={10} mexivel aberto />
          <Volante x={60} y={70} r={10} mexivel={false} aberto={false} />
          <Rolo x={100} y={70} r={12} />
          <Cano x={140} y1={50} y2={100} />
          <Engrenagem x={190} y={72} r={20} dentes={10} girando cor="var(--latao)" />
          <Lampada x={240} y={70} r={6} estado="atencao" />
          <CotaH x1={270} x2={380} y={80} tom="normal" rotuloY={70}>
            <NumeroSvg valor={racional(5, 4)} x={0} y={0} />
          </CotaH>
        </svg>
      </Secao>

      <Secao titulo="Peças e receptores">
        <svg viewBox="0 0 400 120" className="w-full" aria-label="Peças" role="img">
          <Saco x={24} y={40} r={14} />
          <Unidade forma="broa" x={70} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1), quantidade: 1 }])[0]} />
          <Unidade forma="broa" x={120} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1, 4), quantidade: 3 }])[0]} />
          <Unidade forma="pizza" x={170} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1, 8), quantidade: 6 }])[0]} />
          <Unidade forma="pao" x={220} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1, 2), quantidade: 1 }, { tamanho: racional(1, 10), quantidade: 1 }])[0]} />
          <Unidade forma="tonel" x={270} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1, 5), quantidade: 3 }])[0]} />
          <Unidade forma="broa" x={320} y={40} r={18} unidade={comporUnidades([{ tamanho: racional(1, 3), quantidade: 2 }])[0]} tom="sobra" />
          {(["carroca", "mesa", "cesto", "casa", "prato"] as const).map((f, i) => (
            <Receptor key={f} forma={f} cx={40 + i * 76} y={86} largura={70} />
          ))}
        </svg>
      </Secao>

      <Secao titulo="Nônio">
        <div className="flex flex-wrap gap-4">
          {EXPRESSOES.map((e) => (
            <div key={e} className="flex flex-col items-center gap-1">
              <Nonio expressao={e} tamanho={64} />
              <span className="text-[0.8rem] text-texto-mundo-suave">{e}</span>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Joias e estágios">
        <svg viewBox="0 0 300 300" className="w-full max-w-md" aria-label="Quatro joias em quatro estágios" role="img">
          {JOIAS.map((j, l) =>
            [0, 1, 2, 3].map((e) => <Gema key={`${j.id}-${e}`} x={40 + e * 72} y={40 + l * 72} r={24} estagio={e as 0 | 1 | 2 | 3} base={j.cor.base} luz={j.cor.luz} />),
          )}
        </svg>
      </Secao>

      <Secao titulo="Controles">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="placa">
            Placa
          </button>
          <button type="button" className="placa placa-cheia">
            Cheia
          </button>
          <button type="button" className="placa placa-discreta">
            Discreta
          </button>
          <button type="button" className="placa" disabled>
            Desligada
          </button>
          <Seletor rotulo="Lote" valor={lote} minimo={1} maximo={12} onMudar={setLote} />
          <Alavanca rotulo="Repartir" onPuxar={() => undefined} />
        </div>
      </Secao>

      <FolhaPapel titulo="Notação" margem={<NotaDalia>Nota da Dália na margem.</NotaDalia>}>
        <div className="flex flex-col gap-3 pt-2">
          <BlocoNotacao linhas={["26 ÷ 4 = 6, resto 2", "26 = 4 × 6 + 2"]} />
          <LinhaNotacao texto="5 ÷ 4 = 1 1/4 = 5/4" tamanho="media" />
          <p className="m-0 text-[1.4rem] text-tinta">
            <Fracao n={3} d={4} /> · <Numero valor={racional(5, 4)} /> · <Numero valor={racional(6)} />
          </p>
        </div>
      </FolhaPapel>
    </main>
  );
}
