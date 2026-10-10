"use client";

/**
 * O Relicário: as joias do jogador, desenhadas a tinta com facetas chapadas; mais facetas a cada
 * estágio. Joia ainda não encontrada fica a lápis. A bancada de lapidação está em projeto: também
 * a lápis, e sem botão de treino nesta versão.
 */
import { JOIAS } from "@/conteudo/joias";
import type { EstadoJoia } from "@/nucleo/progresso";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Engrenagem } from "@/componentes/mundo/kit";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { Gema } from "./Gema";

const NOMES_ESTAGIO = ["bruta", "talhada", "lapidada", "polida"] as const;
const ENGASTES: [number, number][] = [
  [150, 74],
  [226, 150],
  [150, 226],
  [74, 150],
];

export function Relicario() {
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  const estado = (id: string): EstadoJoia | undefined => progresso.joias[id];
  const achadas = JOIAS.filter((j) => estado(j.id)?.encontrada).length;
  return (
    <main data-pronto="sim" data-tela="relicario" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="relicario" />
      <div className="area-segura mx-auto flex w-full max-w-[880px] flex-col gap-5 pt-5">
        <header>
          <p className="m-0 text-[13px] font-semibold text-tinta-suave">Habilidades suas, não poderes</p>
          <h1 className="m-0 text-[24px] font-extrabold leading-tight">Relicário</h1>
        </header>
        <p className="m-0 max-w-[640px] text-[16px] font-medium leading-[1.45]">
          Relógios usam rubis como mancais, para o mecanismo girar com menos atrito. As joias daqui são isso: habilidades reais que reduzem o atrito do seu raciocínio.
        </p>

        <section className="ficha-quadriculada mx-auto w-full max-w-[360px] p-3">
          <svg viewBox="0 0 300 300" className="traco-fixo mx-auto block w-full max-w-[300px]" role="img" aria-label={`Relicário com quatro engastes; ${achadas === 1 ? "1 joia encontrada" : `${achadas} joias encontradas`}.`}>
            <circle cx={150} cy={150} r={124} fill="var(--folha)" stroke="var(--tinta)" strokeWidth={2.6} />
            <circle cx={150} cy={150} r={108} fill="none" stroke="var(--tinta)" strokeWidth={1.6} strokeDasharray="2 7" />
            <rect x={138} y={14} width={24} height={14} rx={4} fill="var(--caneta-clara)" stroke="var(--tinta)" strokeWidth={2.4} />
            <Engrenagem x={150} y={150} r={34} dentes={12} girando />
            {JOIAS.map((j) => {
              const [x, y] = ENGASTES[j.engaste];
              const e = estado(j.id);
              return (
                <g key={j.id} data-engaste={j.id}>
                  <circle cx={x} cy={y} r={27} fill={e?.encontrada ? "var(--marca-texto-palido)" : "var(--folha)"} stroke={e?.encontrada ? "var(--tinta)" : "var(--grafite)"} strokeWidth={2.4} strokeDasharray={e?.encontrada ? undefined : "5 5"} />
                  {e?.encontrada && <Gema x={x} y={y} r={18} estagio={e.estagio} base={j.cor.base} luz={j.cor.luz} />}
                </g>
              );
            })}
          </svg>
        </section>

        <ul className="m-0 grid grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {JOIAS.map((j) => {
            const e = estado(j.id);
            const achada = e?.encontrada === true;
            const estagio = e?.estagio ?? 0;
            return (
              <li key={j.id} className={`list-none p-4 ${achada ? "ficha" : "ficha-lapis"}`} data-joia={j.id} data-encontrada={achada ? "sim" : "nao"}>
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden="true" className="traco-fixo shrink-0">
                    <Gema x={24} y={24} r={19} estagio={achada ? estagio : 0} base={j.cor.base} luz={j.cor.luz} lapis={!achada} />
                  </svg>
                  <div className="min-w-0">
                    <p className="m-0 text-[12px] font-semibold text-tinta-suave">
                      {j.mineral} · {achada ? `encontrada, ${NOMES_ESTAGIO[estagio]}` : j.requisito.tipo === "em_projeto" ? "ainda não encontrada" : "no fim do Arco 1"}
                    </p>
                    <h2 className={`m-0 text-[18px] font-extrabold leading-tight ${achada ? "" : "text-tinta-suave"}`}>{j.nome}</h2>
                  </div>
                </div>
                <p className="m-0 mt-2 text-[15px] font-medium">{j.habilidade}</p>
                <svg viewBox="0 0 280 70" className="traco-fixo mt-2 block w-full max-w-[300px]" role="img" aria-label={`Estágios de lapidação: ${NOMES_ESTAGIO.join(", ")}.`}>
                  {NOMES_ESTAGIO.map((nome, i) => {
                    const atual = achada && estagio === i;
                    const feito = achada && estagio >= i;
                    return (
                      <g key={nome}>
                        <Gema x={i * 70 + 35} y={24} r={16} estagio={i as 0 | 1 | 2 | 3} base={j.cor.base} luz={j.cor.luz} lapis={!feito} />
                        {atual && <rect x={i * 70 + 10} y={50} width={50} height={17} rx={4} fill="var(--marca-texto)" transform={`rotate(-1.5 ${i * 70 + 35} 58)`} />}
                        <text x={i * 70 + 35} y={63} textAnchor="middle" fontSize={12} fontWeight={feito ? 700 : 600} fill={feito ? "var(--tinta)" : "var(--tinta-suave)"}>
                          {nome}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="m-0 mt-1 text-[14px] font-medium text-tinta-suave">
                  {j.treino[0]} {j.treino[1]}
                </p>
              </li>
            );
          })}
        </ul>

        <section className="ficha-lapis flex items-center gap-4 p-4" data-bancada-lapidacao="em-projeto">
          <svg viewBox="0 0 64 48" width={64} height={48} aria-hidden="true" className="a-lapis shrink-0">
            <rect x={6} y={30} width={52} height={10} rx={3} fill="var(--folha)" stroke="var(--tinta)" />
            <path d="M14 40 V46 M50 40 V46" fill="none" stroke="var(--tinta)" />
            <circle cx={32} cy={20} r={12} fill="var(--folha)" stroke="var(--tinta)" />
            <path d="M32 8 V2 M20 20 H14" fill="none" stroke="var(--tinta)" />
          </svg>
          <div className="min-w-0">
            <h2 className="m-0 text-[17px] font-extrabold text-tinta-suave">Bancada de lapidação</h2>
            <p className="m-0 text-[14px] font-medium text-tinta-suave">Ainda a lápis. O treino das joias chega numa próxima versão; o que você já encontrou fica guardado.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
