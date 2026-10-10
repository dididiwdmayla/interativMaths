"use client";

/**
 * O Relicário: o mecanismo de bolso do jogador, com os engastes das joias.
 * Nesta versão nenhuma joia é treinável: a bancada de lapidação aparece como em projeto.
 */
import { JOIAS } from "@/conteudo/joias";
import type { EstadoJoia } from "@/nucleo/progresso";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Engrenagem, Placa, Rebite } from "@/componentes/mundo/kit";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";
import { Gema } from "./Gema";

const NOMES_ESTAGIO = ["bruta", "talhada", "lapidada", "polida"] as const;
const ENGASTES: [number, number][] = [
  [150, 92],
  [208, 150],
  [150, 208],
  [92, 150],
];

export function Relicario() {
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  const estado = (id: string): EstadoJoia | undefined => progresso.joias[id];
  return (
    <main data-pronto="sim" data-tela="relicario" className="min-h-dvh pb-28">
      <header className="area-segura area-segura-topo pb-2 pt-4">
        <p className="rotulo-chapa m-0">Habilidades suas, não poderes</p>
        <h1 className="fonte-sinal m-0 text-[2.2rem] font-extrabold uppercase leading-none text-latao-claro">Relicário</h1>
      </header>
      <div className="area-segura mx-auto flex max-w-xl flex-col gap-5">
        <p className="m-0 text-texto-mundo-suave">
          Relógios usam rubis como mancais, para o mecanismo girar com menos atrito. As joias daqui são isso: habilidades reais que reduzem o atrito do seu raciocínio.
        </p>
        <svg viewBox="0 0 300 300" className="mx-auto block w-full max-w-[320px]" role="img" aria-label={`Mecanismo de bolso com quatro engastes; ${JOIAS.filter((j) => estado(j.id)?.encontrada).length} joia encontrada.`}>
          <circle cx={150} cy={150} r={140} fill="var(--latao-sombra)" />
          <circle cx={150} cy={150} r={132} fill="var(--latao)" />
          <circle cx={150} cy={150} r={118} fill="none" stroke="var(--latao-sombra)" strokeWidth={2} />
          <Engrenagem x={150} y={150} r={40} dentes={14} cor="var(--latao-claro)" girando />
          <Engrenagem x={104} y={104} r={20} dentes={9} cor="var(--latao-sombra)" />
          <Engrenagem x={196} y={196} r={22} dentes={10} cor="var(--latao-sombra)" />
          <circle cx={150} cy={150} r={10} fill="var(--latao-sombra)" />
          {[0, 90, 180, 270].map((a) => (
            <Rebite key={a} x={150 + 124 * Math.cos((a * Math.PI) / 180 + 0.6)} y={150 + 124 * Math.sin((a * Math.PI) / 180 + 0.6)} r={3} />
          ))}
          {JOIAS.map((j) => {
            const [x, y] = ENGASTES[j.engaste];
            const e = estado(j.id);
            return (
              <g key={j.id} data-engaste={j.id}>
                <circle cx={x} cy={y} r={22} fill="var(--latao-sombra)" />
                <circle cx={x} cy={y} r={18} fill="var(--noite-funda)" />
                {e?.encontrada ? <Gema x={x} y={y} r={14} estagio={e.estagio} base={j.cor.base} luz={j.cor.luz} /> : <circle cx={x} cy={y} r={6} fill="var(--noite)" />}
              </g>
            );
          })}
        </svg>

        <ul className="m-0 flex flex-col gap-4 p-0">
          {JOIAS.map((j) => {
            const e = estado(j.id);
            const achada = e?.encontrada === true;
            return (
              <li key={j.id} className="list-none border-l-2 pl-3" style={{ borderColor: achada ? j.cor.luz : "var(--noite-borda)" }} data-joia={j.id} data-encontrada={achada ? "sim" : "nao"}>
                <p className="rotulo-chapa m-0 text-[0.78rem]">
                  {j.mineral} · {achada ? `encontrada, ${NOMES_ESTAGIO[e?.estagio ?? 0]}` : j.requisito.tipo === "em_projeto" ? "ainda não encontrada" : "no fim do Arco 1"}
                </p>
                <h2 className="fonte-sinal m-0 text-[1.45rem] font-bold uppercase leading-tight">{j.nome}</h2>
                <p className="m-0 text-texto-mundo">{j.habilidade}</p>
                <svg viewBox="0 0 280 66" className="mt-2 block w-full max-w-[300px]" role="img" aria-label={`Estágios de lapidação: ${NOMES_ESTAGIO.join(", ")}.`}>
                  {NOMES_ESTAGIO.map((nome, i) => {
                    const atual = achada && (e?.estagio ?? 0) === i;
                    return (
                      <g key={nome}>
                        {atual && <rect x={i * 70 + 6} y={2} width={58} height={62} rx={8} fill="none" stroke="var(--turquesa)" strokeWidth={1.5} />}
                        <Gema x={i * 70 + 35} y={26} r={15} estagio={i as 0 | 1 | 2 | 3} base={j.cor.base} luz={j.cor.luz} apagada={!achada || (e?.estagio ?? 0) < i} />
                        <text x={i * 70 + 35} y={58} textAnchor="middle" fontSize={10} fill={achada && (e?.estagio ?? 0) >= i ? "var(--texto-mundo)" : "var(--texto-mundo-apagado)"}>
                          {nome}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="m-0 mt-1 text-[0.92rem] text-texto-mundo-suave">
                  {j.treino[0]} {j.treino[1]}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="chapa flex flex-col items-center gap-2 p-4 text-center" data-bancada-lapidacao="em-projeto">
          <svg viewBox="0 0 220 34" className="w-full max-w-[240px]" aria-hidden="true">
            <Placa x={10} y={6} largura={200} altura={22}>
              Bancada de lapidação
            </Placa>
          </svg>
          <p className="m-0 text-texto-mundo-suave">Em projeto. O treino das joias chega numa próxima versão; o que você já encontrou fica guardado.</p>
        </div>
      </div>
      <NavJogo atual="relicario" />
    </main>
  );
}
