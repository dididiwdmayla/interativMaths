/**
 * Kit de desenho do caderno, em SVG. Contorno de tinta, preenchimento chapado, sem degradê e sem
 * sombra. O mesmo desenho a lápis é só o grupo `a-lapis` por fora (traço grafite, preenchimento
 * grafite-claro). Todas as cenas são compostas com estas peças: é o que dá unidade ao jogo.
 */
import type { ReactNode } from "react";

/** Contorno de tinta, em px de tela (os desenhos grandes usam `traco-fixo`). */
export const TRACO = 2.4;

/** Um desenho a lápis: ainda não foi feito ou entendido. */
export function ALapis({ children, lapis = true }: { children: ReactNode; lapis?: boolean }) {
  return <g className={lapis ? "a-lapis" : undefined}>{children}</g>;
}

/**
 * Passar a caneta: o mesmo desenho em duas camadas; a de lápis esmaece e a de tinta aparece.
 * Só para desenho puro (sem ids, papéis nem atributos de teste dentro).
 */
export function PassarACaneta({ feito, children }: { feito: boolean; children: ReactNode }) {
  return (
    <g aria-hidden="true">
      <g className="a-lapis camada" style={{ opacity: feito ? 0 : 1 }}>
        {children}
      </g>
      <g className="camada" style={{ opacity: feito ? 1 : 0 }}>
        {children}
      </g>
    </g>
  );
}

/** Engrenagem com dentes, amarela, de contorno de tinta. */
export function Engrenagem({
  x,
  y,
  r,
  dentes = 9,
  girando = false,
  cor = "var(--marca-texto)",
}: {
  x: number;
  y: number;
  r: number;
  dentes?: number;
  girando?: boolean;
  cor?: string;
}) {
  const pontos: string[] = [];
  for (let i = 0; i < dentes; i++) {
    const base = (Math.PI * 2 * i) / dentes;
    const passo = (Math.PI * 2) / dentes;
    const fora = r;
    const dentro = r * 0.78;
    pontos.push(`${x + dentro * Math.cos(base)},${y + dentro * Math.sin(base)}`);
    pontos.push(`${x + fora * Math.cos(base + passo * 0.18)},${y + fora * Math.sin(base + passo * 0.18)}`);
    pontos.push(`${x + fora * Math.cos(base + passo * 0.5)},${y + fora * Math.sin(base + passo * 0.5)}`);
    pontos.push(`${x + dentro * Math.cos(base + passo * 0.68)},${y + dentro * Math.sin(base + passo * 0.68)}`);
  }
  return (
    <g className={girando ? "ambiente-girar" : undefined}>
      <polygon points={pontos.join(" ")} fill={cor} stroke="var(--contorno)" strokeWidth={TRACO} strokeLinejoin="round" />
      <circle cx={x} cy={y} r={r * 0.24} fill="var(--contorno)" stroke="var(--contorno)" strokeWidth={1} />
    </g>
  );
}

/** Esteira: faixa branca de tinta com os roletes em ponto; os traços de dentro andam. */
export function Esteira({ id, x0, x1, y, altura = 14, andando = true }: { id: string; x0: number; x1: number; y: number; altura?: number; andando?: boolean }) {
  const largura = x1 - x0;
  const roletes = Math.max(2, Math.round(largura / 62) + 1);
  return (
    <g aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <rect x={x0 + altura / 2} y={y} width={Math.max(0, largura - altura)} height={altura} />
        </clipPath>
      </defs>
      <rect x={x0} y={y} width={largura} height={altura} rx={altura / 2} fill="var(--folha)" stroke="var(--contorno)" strokeWidth={TRACO} />
      {andando && (
        <g clipPath={`url(#${id})`}>
          <g className="ambiente-esteira">
            {Array.from({ length: Math.ceil(largura / 20) + 2 }, (_, i) => (
              <line key={i} x1={x0 + i * 20 + 6} x2={x0 + i * 20 + 12} y1={y + altura / 2} y2={y + altura / 2} stroke="var(--grade)" strokeWidth={2} strokeLinecap="round" />
            ))}
          </g>
        </g>
      )}
      {Array.from({ length: roletes }, (_, i) => (
        <circle key={i} cx={x0 + altura / 2 + ((largura - altura) * i) / (roletes - 1)} cy={y + altura / 2} r={1.7} fill="var(--contorno)" stroke="none" />
      ))}
    </g>
  );
}

/** Trilho das bicas: faixa clara de contorno de tinta. */
export function Trilho({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  return <rect x={x0} y={y} width={x1 - x0} height={8} rx={4} fill="var(--grade)" stroke="var(--contorno)" strokeWidth={TRACO} />;
}

/** Bica: caixa azul presa ao trilho e o bico claro por baixo. */
export function Bica({ cx, y }: { cx: number; y: number }) {
  return (
    <g>
      <rect x={cx - 4} y={y + 13} width={8} height={7} fill="var(--caneta-clara)" stroke="var(--contorno)" strokeWidth={TRACO} strokeLinejoin="round" />
      <rect x={cx - 8} y={y} width={16} height={15} rx={3} fill="var(--caneta)" stroke="var(--contorno)" strokeWidth={TRACO} />
    </g>
  );
}

/** Medidor de nível: barra branca de tinta com o nível em marca-texto, que sobe por scaleY. */
export function Medidor({
  x,
  y,
  largura,
  altura,
  fracao,
  marcas = [],
  teto,
}: {
  x: number;
  y: number;
  largura: number;
  altura: number;
  /** 0 a 1. */
  fracao: number;
  marcas?: readonly number[];
  /** 0 a 1: a marca do limite, tracejada. */
  teto?: number;
}) {
  const r = largura / 2;
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={largura} height={altura} rx={r} fill="var(--folha)" stroke="none" />
      <rect
        x={x}
        y={y}
        width={largura}
        height={altura}
        rx={r}
        fill="var(--marca-texto)"
        stroke="none"
        style={{
          transform: `scaleY(${Math.max(0, Math.min(1, fracao))})`,
          transformOrigin: `${x}px ${y + altura}px`,
          transformBox: "view-box",
          transition: "transform 480ms var(--curva-saida)",
        }}
      />
      {marcas.slice(1, -1).map((m, k) => (
        <line key={k} x1={x + largura * 0.55} x2={x + largura} y1={y + altura * (1 - m)} y2={y + altura * (1 - m)} stroke="var(--tinta-suave)" strokeWidth={1.2} />
      ))}
      {teto !== undefined && (
        <line x1={x - 4} x2={x + largura + 4} y1={y + altura * (1 - teto)} y2={y + altura * (1 - teto)} stroke="var(--contorno)" strokeWidth={2} strokeDasharray="3 3" />
      )}
      <rect x={x} y={y} width={largura} height={altura} rx={r} fill="none" stroke="var(--contorno)" strokeWidth={TRACO} />
    </g>
  );
}

/** Faixa de marca-texto, um pouco inclinada, que cresce da esquerda. */
export function FaixaMarcaTexto({
  x,
  y,
  largura,
  altura = 14,
  inclinacao = -1.5,
  cresce = false,
}: {
  x: number;
  y: number;
  largura: number;
  altura?: number;
  inclinacao?: number;
  cresce?: boolean;
}) {
  return (
    <g transform={`rotate(${inclinacao} ${x + largura / 2} ${y + altura / 2})`} aria-hidden="true">
      <rect x={x} y={y} width={largura} height={altura} rx={4} fill="var(--marca-texto)" stroke="none" className={cresce ? "anima-marca-texto" : undefined} />
    </g>
  );
}

/** Elipse de marca-texto por trás de um desenho. */
export function ElipseMarcaTexto({ cx, cy, rx, ry, inclinacao = -2 }: { cx: number; cy: number; rx: number; ry: number; inclinacao?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--marca-texto)" stroke="none" transform={`rotate(${inclinacao} ${cx} ${cy})`} aria-hidden="true" />;
}

/** Anotação a caneta: palavras em letra de mão azul. Números vão dentro de <NumeroAnotado>. */
export function Anotacao({
  x,
  y,
  children,
  ancora = "start",
  tamanho = 22,
  inclinacao = -2,
  cor = "var(--caneta)",
}: {
  x: number;
  y: number;
  children: ReactNode;
  ancora?: "start" | "middle" | "end";
  tamanho?: number;
  inclinacao?: number;
  cor?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={ancora}
      fontFamily="var(--fonte-mao), cursive"
      fontWeight={700}
      fontSize={tamanho}
      fill={cor}
      stroke="none"
      transform={`rotate(${inclinacao} ${x} ${y})`}
    >
      {children}
    </text>
  );
}

/** Número dentro de uma anotação: sempre Rubik, que se lê com precisão. */
export function NumeroAnotado({ children, tamanho }: { children: ReactNode; tamanho?: number }) {
  return (
    <tspan fontFamily="var(--fonte-interface), sans-serif" fontWeight={700} fontSize={tamanho} className="algarismos">
      {children}
    </tspan>
  );
}

/** Setinha curva a caneta, de um ponto a outro. */
export function SetaCurva({ de, para, curva = 0.35, cor = "var(--caneta)" }: { de: [number, number]; para: [number, number]; curva?: number; cor?: string }) {
  const [x1, y1] = de;
  const [x2, y2] = para;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * curva;
  const cy = my + dx * curva;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const ponta = 6;
  const a1 = ang + Math.PI * 0.8;
  const a2 = ang - Math.PI * 0.8;
  return (
    <g fill="none" stroke={cor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} />
      <path d={`M ${x2 + ponta * Math.cos(a1)} ${y2 + ponta * Math.sin(a1)} L ${x2} ${y2} L ${x2 + ponta * Math.cos(a2)} ${y2 + ponta * Math.sin(a2)}`} />
    </g>
  );
}

/** Chave a caneta sobre uma medida, com a ponta para cima. */
export function Chave({ x1, x2, y, cor = "var(--caneta)" }: { x1: number; x2: number; y: number; cor?: string }) {
  const m = (x1 + x2) / 2;
  const r = Math.min(5, (x2 - x1) / 4);
  return (
    <path
      d={`M ${x1} ${y} q 0 ${-r} ${r} ${-r} H ${m - r} q ${r} 0 ${r} ${-r} q 0 ${r} ${r} ${r} H ${x2 - r} q ${r} 0 ${r} ${r}`}
      fill="none"
      stroke={cor}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    />
  );
}

/** Pseudoaleatório determinístico, para o traço à mão sair sempre igual. */
function variacao(semente: number, i: number): number {
  const s = Math.sin(semente * 12.9898 + i * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Círculo a lápis vermelho: traço irregular que não fecha certinho, como feito à mão.
 * Só chama o olhar. Nunca risca nem corrige.
 */
export function CirculoVermelho({
  cx,
  cy,
  rx,
  ry,
  semente = 1,
  className,
  cor = "var(--vermelho)",
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  semente?: number;
  className?: string;
  /** O mesmo traço a lápis azul é o Nônio apontando. */
  cor?: string;
}) {
  const n = 12;
  const inicio = -Math.PI * 0.62 + variacao(semente, 0) * 0.3;
  const voltas = Math.PI * 2 + 0.5;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = inicio + voltas * t;
    const k = 1.05 - 0.1 * t + (variacao(semente, i + 1) - 0.5) * 0.06;
    return [cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)] as const;
  });
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return <path d={d} fill="none" stroke={cor} strokeWidth={2.6} strokeLinecap="round" className={className} aria-hidden="true" style={{ pointerEvents: "none" }} />;
}

/** Rabisco de margem em grafite. Tempero: no máximo três por tela, nunca sobre conteúdo. */
export function Rabisco({ tipo, x, y }: { tipo: "mais" | "dividir" | "triangulo"; x: number; y: number }) {
  return (
    <g fill="none" stroke="var(--grafite)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {tipo === "mais" && <path d={`M ${x - 7} ${y} h 14 M ${x} ${y - 7} v 14`} />}
      {tipo === "dividir" && (
        <>
          <path d={`M ${x - 8} ${y} h 16`} />
          <circle cx={x} cy={y - 7} r={1.4} fill="var(--grafite)" />
          <circle cx={x} cy={y + 7} r={1.4} fill="var(--grafite)" />
        </>
      )}
      {tipo === "triangulo" && <path d={`M ${x - 8} ${y + 7} l 8 -14 l 8 14 Z`} />}
    </g>
  );
}
