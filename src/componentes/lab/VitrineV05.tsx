"use client";

/**
 * A parte da vitrine que chegou na v0.5: o soroban em cada nível de apoio, os estados da conta
 * (encostada, afastada, da vez, que vai se mexer), o soroban pequeno do exemplo, os pares, o
 * teclado, a conta passada a caneta, a ficha do Relicário vivo e a lapidação. Tudo montado pelo
 * núcleo, como um jogador faria.
 */
import { useMemo, useState, type ReactNode } from "react";
import { JOIAS } from "@/conteudo/joias";
import { CONTA_SOROBAN, NOMES_POSICAO } from "@/conteudo/lapidacao";
import { iniciarItem, aplicarEntradaItem, type EstadoItem } from "@/nucleo/soroban/item";
import { entradasDoCaminhoCurto, jogarItem } from "@/nucleo/soroban/jogador";
import { mostrar } from "@/nucleo/soroban/soroban";
import { contaDoItem, exemploDaOperacao } from "@/nucleo/soroban/textos";
import { planoDoLance } from "@/nucleo/soroban/plano";
import { Soroban } from "@/componentes/soroban/Soroban";
import { SorobanPequeno } from "@/componentes/soroban/SorobanPequeno";
import { Pares } from "@/componentes/soroban/Pares";
import { Teclado } from "@/componentes/soroban/Teclado";
import { ContaSoroban } from "@/componentes/soroban/ContaSoroban";
import { FichaEmLapidacao } from "@/componentes/joias/RelicarioVivo";
import { Gema } from "@/componentes/joias/Gema";
import { Trilha } from "@/componentes/joias/Trilha";
import { progressoAbacoCincoFirmando } from "./cenarios";

const ABACO = JOIAS[0];
/** Um instante fixo: a vitrine monta a ficha jogando rodadas no motor, sempre igual. */
const INSTANTE_DA_VITRINE = 1_760_000_000_000;

function Quadro({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div className="ficha-quadriculada h-[250px] p-2 shadow-none">{children}</div>
      <figcaption className="text-[13px] font-semibold text-tinta-suave">{rotulo}</figcaption>
    </figure>
  );
}

/** 23 + 14, feito pelo caminho curto (a conta e o acerto da referência 4). */
function feito(): EstadoItem {
  return jogarItem(iniciarItem({ operacao: { tipo: "somar", a: 23, b: 14 }, nivel: "sozinho", tecnica: "soroban.complemento-5" }));
}

export function VitrineV05({ Secao }: { Secao: (p: { titulo: string; children: ReactNode }) => ReactNode }) {
  const [valor, setValor] = useState("37");
  const exemplo = exemploDaOperacao({ tipo: "somar", a: 3, b: 4 });
  const conta = useMemo(() => contaDoItem(feito(), NOMES_POSICAO, CONTA_SOROBAN.nomes), []);
  // 26 + 7: o primeiro número mostrado, e o caminho junto desenhado nas contas.
  const junto = useMemo(() => {
    let e = iniciarItem({ operacao: { tipo: "somar", a: 26, b: 7 }, nivel: "sozinho", tecnica: "soroban.juntos" });
    for (const ent of entradasDoCaminhoCurto(e)) e = aplicarEntradaItem(e, ent).estado;
    return e;
  }, []);
  const caminho = planoDoLance(junto.soroban, { tipo: "por", haste: 4, d: 7 })?.movimentos ?? [];
  const estadoRelicario = useMemo(() => progressoAbacoCincoFirmando(INSTANTE_DA_VITRINE).joias.abaco, []);
  return (
    <>
      <Secao titulo="O soroban, nível por nível">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-vitrine="soroban">
          <Quadro rotulo="Com o Nônio e sozinho: a haste da vez, os rótulos e os algarismos">
            <Soroban estado={mostrar(5, 33)} marcas={{ daVez: 4, vistos: [3] }} />
          </Quadro>
          <Quadro rotulo="Sem os algarismos: nem algarismos, nem a haste da vez">
            <Soroban estado={mostrar(5, 33)} algarismos={false} />
          </Quadro>
          <Quadro rotulo="Sombra: as contas estão aí; só não aparecem">
            <Soroban estado={mostrar(5, 48)} algarismos={false} contas="escondidas" />
          </Quadro>
          <Quadro rotulo="De cabeça e ditado: o soroban a lápis, até o caminho aparecer">
            <div className="a-lapis h-full">
              <Soroban estado={mostrar(5, 0)} algarismos={false} rotulos={false} contas="escondidas" />
            </div>
          </Quadro>
        </div>
      </Secao>

      <Secao titulo="Estados da conta">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Quadro rotulo="O caminho junto: as contas que vão se mexer, com a ordem (26 + 7)">
            <Soroban estado={junto.soroban} marcas={{ daVez: 4, caminho }} />
          </Quadro>
          <Quadro rotulo="Acertou: a haste do último lance em verde pálido, os vistos">
            <Soroban estado={mostrar(5, 37)} marcas={{ acerto: 4, vistos: [3, 4] }} />
          </Quadro>
        </div>
      </Secao>

      <Secao titulo="O exemplo, os pares, o teclado, a conta">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="ficha flex flex-col gap-3 p-3">
            {exemplo && <SorobanPequeno inicio={exemplo.inicio} movimentos={exemplo.movimentos} rotulo={exemplo.conta} />}
            <Pares destaque={{ cinco: [2, 3], dez: [3, 7] }} />
          </div>
          <div className="ficha flex flex-col gap-3 p-3">
            <Teclado valor={valor} onValor={setValor} onConferir={() => undefined} rotulo="Ficou" aindaNao={valor === "36"} extra={{ rotulo: "Ver contas", onTocar: () => undefined }} />
            <ContaSoroban conta={conta} />
          </div>
        </div>
      </Secao>

      <Secao titulo="O Relicário vivo e a lapidação">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {estadoRelicario && <FichaEmLapidacao joia={ABACO} estado={estadoRelicario} agora={INSTANTE_DA_VITRINE + 2 * 86_400_000} />}
          <div className="ficha flex flex-col items-center gap-3 p-4">
            <svg viewBox="0 0 220 120" className="traco-fixo block w-full max-w-[260px]" role="img" aria-label="A joia passa de talhada a lapidada">
              <g className="gema-antes">
                <Gema x={40} y={60} r={24} estagio={1} base={ABACO.cor.base} luz={ABACO.cor.luz} />
              </g>
              <path d="M80 60 H112 M106 54 L113 60 L106 66" fill="none" stroke="var(--caneta)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
              <g className="gema-nova">
                <Gema x={165} y={60} r={48} estagio={2} base={ABACO.cor.base} luz={ABACO.cor.luz} />
              </g>
            </svg>
            <p className="letra-mao m-0 text-[30px] text-verde-escuro">lapidada!</p>
            <Trilha joia={ABACO} estagio={2} />
          </div>
        </div>
      </Secao>
    </>
  );
}
