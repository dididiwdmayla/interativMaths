/**
 * "Na máquina", no Manual: a bancada desenhada parada (referência 6 de v04.html). Só o que importa
 * para a página: cada receptor com as peças que recebeu e o número embaixo; o que sobrou numa
 * bandeja, com "resto" a caneta. Quem monta o estado é o núcleo (config + ações); aqui só se
 * desenha, com as mesmas peças e receptores da máquina do jogo.
 */
import type { Pele } from "@/conteudo/peles";
import { bicasEmUso, quantidadeNaBica, sobraNaEsteira } from "@/nucleo/maquinas/bancada/bancada";
import type { EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import { ehZero } from "@/nucleo/racional/racional";
import { NumeroSvg } from "@/componentes/maquinas/cota";
import { comporUnidades, grade } from "@/componentes/maquinas/geometria";
import { Unidade } from "@/componentes/maquinas/pecas";
import { Receptor } from "@/componentes/maquinas/receptores";

const ALTURA = 100;
const TOPO_PECAS = 8;
const Y_RECEPTOR = 48;
const Y_NUMERO = 86;

export function MaquinaParada({ estado, pele, descricao, rotuloResto }: { estado: EstadoBancada; pele: Pele; descricao: string; rotuloResto: string }) {
  const usadas = bicasEmUso(estado);
  const sobra = sobraNaEsteira(estado);
  const temSobra = !ehZero(sobra);
  const largura = 326;
  const passo = Math.min(64, largura / (usadas.length + (temSobra ? 1.4 : 0)));
  const total = passo * usadas.length + (temSobra ? passo * 1.4 : 0);
  const x0 = (largura - total) / 2;
  const saco = pele.peca.forma === "saco";
  const pecas = (pilhas: EstadoBancada["esteira"], caixa: { x: number; y: number; largura: number; altura: number }) => {
    const unidades = comporUnidades(pilhas);
    const g = grade(unidades.length, caixa, { raioMax: saco ? 7.5 : 13, colunasMax: saco ? 3 : 4 });
    return unidades.map((u, i) => <Unidade key={i} forma={pele.peca.forma} x={g.centros[i].x} y={g.centros[i].y} r={g.raio} unidade={u} />);
  };
  // A bandeja do resto, à direita dos receptores.
  const bx = x0 + passo * usadas.length + passo * 0.7;
  const bw = passo * 1.25;
  return (
    <svg viewBox={`0 0 ${largura} ${ALTURA}`} className="block h-auto w-full max-w-[420px]" role="img" aria-label={descricao} data-maquina-manual="">
      {usadas.map((b, i) => {
        const cx = x0 + passo * (i + 0.5);
        const w = passo - 12;
        return (
          <g key={b}>
            {pecas(estado.bicas[b].pecas, { x: cx - w / 2, y: TOPO_PECAS, largura: w, altura: Y_RECEPTOR - TOPO_PECAS - 2 })}
            <Receptor forma={pele.receptor.forma} cx={cx} y={Y_RECEPTOR} largura={passo} />
            <NumeroSvg valor={quantidadeNaBica(estado.bicas[b])} x={cx} y={Y_NUMERO} tamanho={16} />
          </g>
        );
      })}
      {temSobra && (
        <g>
          <text x={bx} y={Y_RECEPTOR - 20} textAnchor="middle" className="font-mao" fontSize={20} fontWeight={700} fill="var(--caneta)">
            {rotuloResto}
          </text>
          <path d={`M ${bx - bw / 2} ${Y_RECEPTOR - 8} H ${bx + bw / 2} L ${bx + bw / 2 - 6} ${Y_RECEPTOR + 8} H ${bx - bw / 2 + 6} Z`} fill="var(--folha)" stroke="var(--grafite)" strokeWidth={2} strokeLinejoin="round" />
          {pecas(estado.esteira, { x: bx - bw / 2 + 8, y: Y_RECEPTOR - 12, largura: bw - 16, altura: 16 })}
          <NumeroSvg valor={sobra} x={bx} y={Y_NUMERO} tamanho={16} />
        </g>
      )}
    </svg>
  );
}
