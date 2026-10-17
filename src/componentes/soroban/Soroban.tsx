"use client";

/**
 * O soroban em SVG (referências 3, 4, 5 e 7 de v05.html). Desenhado a partir dos algarismos:
 * cinco hastes a cada 60; contas bicônicas de 52 × 26, passo de 28; acima da régua a conta de cima
 * e o vão dela; abaixo, as quatro contas e um vão. Moldura e régua em madeira, leito em folha,
 * hastes em contorno, os pontos da régua em marca-texto (milhar e unidades).
 *
 * O toque: a largura inteira da haste (60) na altura de cada conta (28); o vão não faz nada. É a
 * exceção consciente à regra dos 44 px: o soroban é instrumento, e a posição é a informação.
 * Teclado: Tab passa de haste em haste; ↑ encosta mais uma de baixo, ↓ afasta uma, Espaço alterna a
 * de cima. Cada haste é um grupo com nome; a conta de cima é um botão com estado; um anúncio a cada
 * gesto. As contas deslizam (transform, 160 ms); com movimento reduzido, mudam sem deslizar.
 * Quem decide o que o gesto faz é o núcleo: aqui só se desenha o estado e se manda o gesto.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { aplicarMovimento, posicaoDaHaste, valorDaHaste, type Gesto, type Haste, type IndiceBaixo, type Movimento, type Soroban as EstadoSoroban } from "@/nucleo/soroban/soroban";
import { LEITOR_SOROBAN, NOMES_POSICAO } from "@/conteudo/lapidacao";

/** Geometria do desenho (unidades do viewBox, que escala com a largura). */
export const GEOMETRIA = {
  largura: 330,
  altura: 304,
  passo: 60,
  x0: 45,
  cimaAfastada: 52,
  cimaEncostada: 84,
  baixoEncostada: 126,
  passoConta: 28,
  regua: 98,
  digito: 294,
} as const;

const PONTOS_CONTA = "-26,0 -15,-13 15,-13 26,0 15,13 -15,13";
const FACETA = "-15,-13 15,-13 20,-6 -20,-6";

export function xDaHaste(i: number): number {
  return GEOMETRIA.x0 + i * GEOMETRIA.passo;
}

function yBaixo(k: number, encostada: boolean): number {
  return GEOMETRIA.baixoEncostada + GEOMETRIA.passoConta * (encostada ? k : k + 1);
}

/** Uma conta que vai se mexer no caminho desenhado (degrau 4): a ordem, a direção, se é a que se toca. */
interface MarcaCaminho {
  readonly ordem: number;
  /** -1: sobe na tela; 1: desce. */
  readonly sentido: -1 | 1;
  readonly tocar: boolean;
}

/** Quais contas cada movimento do caminho mexe, a partir do estado de agora. */
export function contasDoCaminho(estado: EstadoSoroban, movimentos: readonly Movimento[]): Map<string, MarcaCaminho> {
  const saida = new Map<string, MarcaCaminho>();
  let s = estado;
  movimentos.forEach((m, n) => {
    const h = s[m.haste];
    const ordem = n + 1;
    if (m.cinco !== 0) {
      // Encostar a de cima é descer; afastar, subir.
      saida.set(`${m.haste}:cima`, { ordem, sentido: m.cinco > 0 ? 1 : -1, tocar: true });
    } else if (m.uns > 0) {
      for (let k = h.uns; k < h.uns + m.uns; k++) saida.set(`${m.haste}:${k}`, { ordem, sentido: -1, tocar: k === h.uns + m.uns - 1 });
    } else {
      for (let k = h.uns + m.uns; k < h.uns; k++) saida.set(`${m.haste}:${k}`, { ordem, sentido: 1, tocar: k === h.uns + m.uns });
    }
    s = aplicarMovimento(s, m);
  });
  return saida;
}

export interface MarcasSoroban {
  /** A haste da vez: faixa marca-texto pálido e o rótulo em etiqueta marca-texto. */
  readonly daVez?: number | null;
  /** A haste do último lance, no acerto: fundo verde pálido. */
  readonly acerto?: number | null;
  /** Hastes dos lances feitos limpos: visto verde ao lado do algarismo. */
  readonly vistos?: readonly number[];
  /** O caminho junto (degrau 4): as contas que vão se mexer, com borda de caneta, seta e a ordem. */
  readonly caminho?: readonly Movimento[] | null;
}

function nomeDaHaste(hastes: number, i: number) {
  return NOMES_POSICAO[Math.min(NOMES_POSICAO.length - 1, posicaoDaHaste(hastes, i))];
}

/** O que mudou entre dois estados, para o anúncio do leitor de tela. */
function anuncioDe(antes: EstadoSoroban, depois: EstadoSoroban, escondidas: boolean): string {
  const partes: string[] = [];
  depois.forEach((h, i) => {
    const a = antes[i];
    if (!a || (a.cinco === h.cinco && a.uns === h.uns)) return;
    const nome = nomeDaHaste(depois.length, i);
    if (escondidas) {
      const d = valorDaHaste(h) - valorDaHaste(a);
      partes.push(`${nome.nome}: ${d > 0 ? "+" : "−"}${Math.abs(d)}`);
    } else partes.push(`${LEITOR_SOROBAN.haste} ${nome.da}: ${valorDaHaste(h)}`);
  });
  return partes.join(". ");
}

function Conta({ encostada, caminho }: { encostada: boolean; caminho: MarcaCaminho | undefined }) {
  return (
    <>
      <polygon points={PONTOS_CONTA} fill={encostada ? "var(--soroban-conta)" : "var(--soroban-livre)"} stroke="var(--contorno)" strokeWidth={2.4} strokeLinejoin="round" />
      {encostada && <polygon points={FACETA} fill="var(--soroban-conta-luz)" stroke="none" />}
      {caminho && (
        <g data-caminho={caminho.ordem}>
          <polygon points={PONTOS_CONTA} fill="none" stroke="var(--caneta)" strokeWidth={3.4} strokeLinejoin="round" />
          <path d={`M0 ${-6 * caminho.sentido} V${6 * caminho.sentido}`} stroke={encostada ? "var(--sobre-caneta)" : "var(--caneta)"} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <path d={`M-4.5 ${1.5 * caminho.sentido} L0 ${7 * caminho.sentido} L4.5 ${1.5 * caminho.sentido}`} stroke={encostada ? "var(--sobre-caneta)" : "var(--caneta)"} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {caminho.tocar && (
            <g transform="translate(-21 -11)">
              <circle r={8.5} fill="var(--marca-texto)" stroke="var(--contorno)" strokeWidth={1.6} />
              <text y={4.2} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--sobre-marca)">
                {caminho.ordem}
              </text>
            </g>
          )}
        </g>
      )}
    </>
  );
}

function HasteDesenhada({
  h,
  i,
  hastes,
  interativa,
  contasVisiveis,
  caminho,
  onGesto,
}: {
  h: Haste;
  i: number;
  hastes: number;
  interativa: boolean;
  contasVisiveis: boolean;
  caminho: Map<string, MarcaCaminho>;
  onGesto?: (g: Gesto) => void;
}) {
  const cx = xDaHaste(i);
  const nome = nomeDaHaste(hastes, i);
  const tocar = (g: Gesto) => onGesto?.(g);
  const teclado = (ev: KeyboardEvent<SVGGElement>) => {
    if (!interativa) return;
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      if (h.uns < 4) tocar({ haste: i, conta: "baixo", indice: h.uns as IndiceBaixo });
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      if (h.uns > 0) tocar({ haste: i, conta: "baixo", indice: (h.uns - 1) as IndiceBaixo });
    } else if (ev.key === " " || ev.key === "Enter") {
      ev.preventDefault();
      tocar({ haste: i, conta: "cima" });
    }
  };
  const valor = valorDaHaste(h);
  return (
    <g
      data-haste={i}
      data-valor={valor}
      role="group"
      aria-label={contasVisiveis ? `${LEITOR_SOROBAN.haste} ${nome.da}: ${valor}` : `${LEITOR_SOROBAN.haste} ${nome.da}`}
      tabIndex={interativa ? 0 : undefined}
      data-focavel={interativa ? "" : undefined}
      onKeyDown={teclado}
      className="soroban-haste"
    >
      <rect className="anel-foco" x={cx - 31} y={35} width={62} height={221} rx={8} />
      <g className="soroban-contas" style={{ opacity: contasVisiveis ? 1 : 0 }}>
        <g
          className="soroban-conta"
          style={{ transform: `translateY(${h.cinco ? GEOMETRIA.cimaEncostada - GEOMETRIA.cimaAfastada : 0}px)` }}
          data-conta="cima"
          data-encostada={h.cinco ? "sim" : "nao"}
          role="button"
          aria-label={LEITOR_SOROBAN.contaDeCima}
          aria-pressed={contasVisiveis ? h.cinco : undefined}
          onClick={interativa ? () => tocar({ haste: i, conta: "cima" }) : undefined}
        >
          <g transform={`translate(${cx} ${GEOMETRIA.cimaAfastada})`}>
            <Conta encostada={h.cinco} caminho={caminho.get(`${i}:cima`)} />
            {interativa && <rect x={-30} y={-14} width={60} height={28} fill="transparent" />}
          </g>
        </g>
        {([0, 1, 2, 3] as IndiceBaixo[]).map((k) => {
          const enc = k < h.uns;
          return (
            <g
              key={k}
              className="soroban-conta"
              style={{ transform: `translateY(${enc ? -GEOMETRIA.passoConta : 0}px)` }}
              data-conta={`baixo-${k}`}
              data-encostada={enc ? "sim" : "nao"}
              aria-hidden="true"
              onClick={interativa ? () => tocar({ haste: i, conta: "baixo", indice: k }) : undefined}
            >
              <g transform={`translate(${cx} ${yBaixo(k, false)})`}>
                <Conta encostada={enc} caminho={caminho.get(`${i}:${k}`)} />
                {interativa && <rect x={-30} y={-14} width={60} height={28} fill="transparent" />}
              </g>
            </g>
          );
        })}
      </g>
    </g>
  );
}

export function Soroban({
  estado,
  onGesto,
  rotulos = true,
  algarismos = true,
  contas = "visiveis",
  marcas = {},
  rotulo,
  className = "",
}: {
  estado: EstadoSoroban;
  /** Sem ele, o soroban só mostra (a leitura, o caminho curto passando). */
  onGesto?: (g: Gesto) => void;
  rotulos?: boolean;
  algarismos?: boolean;
  /** Na sombra, as contas estão aí (o toque vale) e só não aparecem. */
  contas?: "visiveis" | "escondidas";
  marcas?: MarcasSoroban;
  rotulo?: string;
  className?: string;
}) {
  const hastes = estado.length;
  const visiveis = contas === "visiveis";
  const interativa = onGesto !== undefined;
  const caminho = marcas.caminho ? contasDoCaminho(estado, marcas.caminho) : new Map<string, MarcaCaminho>();
  const vistos = new Set(marcas.vistos ?? []);
  const valor = estado.reduce((t, h) => t * 10 + valorDaHaste(h), 0);
  // Zeros à esquerda ficam em grafite.
  const primeiroNaoZero = estado.findIndex((h) => valorDaHaste(h) > 0);

  // O anúncio do leitor de tela a cada gesto.
  const anterior = useRef(estado);
  const [anuncio, setAnuncio] = useState("");
  useEffect(() => {
    if (anterior.current !== estado) {
      const texto = anuncioDe(anterior.current, estado, !visiveis);
      anterior.current = estado;
      if (texto) setAnuncio(texto);
    }
  }, [estado, visiveis]);

  const { largura, altura, regua } = GEOMETRIA;
  return (
    <div className={`soroban ${className}`} data-soroban="" data-valor={valor} data-contas={contas}>
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="soroban-svg traco-fixo"
        role="group"
        aria-label={visiveis ? `${rotulo ?? LEITOR_SOROBAN.rotulo}, ${LEITOR_SOROBAN.mostrando} ${valor}.` : `${rotulo ?? LEITOR_SOROBAN.rotulo}: ${LEITOR_SOROBAN.semContas}.`}
      >
        <rect x={4} y={26} width={322} height={239} rx={14} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={2.6} />
        <rect x={16} y={38} width={298} height={215} rx={5} fill="var(--folha)" stroke="var(--contorno)" strokeWidth={2} />
        {marcas.daVez !== null && marcas.daVez !== undefined && <rect x={xDaHaste(marcas.daVez) - 29} y={38} width={58} height={215} fill="var(--marca-texto-palido)" data-faixa="vez" />}
        {marcas.acerto !== null && marcas.acerto !== undefined && <rect x={xDaHaste(marcas.acerto) - 29} y={38} width={58} height={215} fill="var(--verde-palido)" data-faixa="acerto" />}
        {estado.map((_, i) => (
          <line key={i} x1={xDaHaste(i)} y1={38} x2={xDaHaste(i)} y2={253} stroke="var(--contorno)" strokeWidth={2.4} />
        ))}
        <rect x={4} y={regua} width={322} height={14} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={2.4} />
        {estado.map((_, i) =>
          posicaoDaHaste(hastes, i) % 3 === 0 ? <circle key={i} cx={xDaHaste(i)} cy={regua + 7} r={3.6} fill="var(--marca-texto)" stroke="var(--contorno)" strokeWidth={1.6} /> : null,
        )}
        {estado.map((h, i) => (
          <HasteDesenhada key={i} h={h} i={i} hastes={hastes} interativa={interativa} contasVisiveis={visiveis} caminho={caminho} onGesto={onGesto} />
        ))}
        {rotulos &&
          estado.map((_, i) => {
            const nome = nomeDaHaste(hastes, i);
            if (!nome.rotulo) return null;
            const vez = marcas.daVez === i;
            return (
              <g key={i} aria-hidden="true">
                {vez && <rect x={xDaHaste(i) - 30} y={3} width={60} height={18} rx={5} fill="var(--marca-texto)" />}
                <text x={xDaHaste(i)} y={16.5} textAnchor="middle" fontSize={12} fontWeight={vez ? 700 : 600} fill={vez ? "var(--sobre-marca)" : "var(--tinta-suave)"}>
                  {nome.rotulo}
                </text>
              </g>
            );
          })}
        {algarismos &&
          estado.map((h, i) => (
            <text key={i} x={xDaHaste(i)} y={GEOMETRIA.digito} textAnchor="middle" fontSize={24} fontWeight={800} fill={primeiroNaoZero === -1 || i < primeiroNaoZero ? "var(--grafite)" : "var(--tinta)"} aria-hidden="true" data-algarismo={i}>
              {valorDaHaste(h)}
            </text>
          ))}
        {[...vistos].map((i) => (
          <g key={i} transform={`translate(${xDaHaste(i) + 19} 279)`} aria-hidden="true" data-visto={i}>
            <circle r={7} fill="var(--verde)" stroke="var(--contorno)" strokeWidth={1.6} />
            <path d="M-3.4 0.2 l2.4 2.4 l4.4 -4.8" fill="none" stroke="var(--sobre-verde)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </svg>
      <p className="so-leitor" aria-live="polite" data-anuncio-soroban="">
        {anuncio}
      </p>
    </div>
  );
}
