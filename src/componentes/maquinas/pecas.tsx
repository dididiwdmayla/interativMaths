/**
 * Desenho das peças por forma, a traço de tinta e cor chapada. Inteira mostra as marcas da casca;
 * pedaço cortado é um setor do tamanho exato. O lugar vazio de uma unidade fica a lápis.
 */
import type { FormaPeca } from "@/conteudo/peles";
import { setor, type UnidadeDesenho } from "./geometria";

export type Tom = "normal" | "fantasma";

/** Traço proporcional ao tamanho da peça: peça miúda não vira só contorno. */
export function tracoDaPeca(r: number): number {
  return Math.min(2.4, Math.max(1.4, r * 0.24));
}

export function Saco({ x, y, r, tom = "normal" }: { x: number; y: number; r: number; tom?: Tom }) {
  const w = r * 1.7;
  const h = r * 1.9;
  const topo = y - h / 2;
  const corpo = `M ${x - w * 0.4} ${topo + h * 0.3}
    Q ${x - w * 0.56} ${y + h * 0.44} ${x - w * 0.18} ${y + h * 0.5}
    L ${x + w * 0.18} ${y + h * 0.5}
    Q ${x + w * 0.56} ${y + h * 0.44} ${x + w * 0.4} ${topo + h * 0.3}
    Q ${x} ${topo + h * 0.18} ${x - w * 0.4} ${topo + h * 0.3} Z`;
  const t = tracoDaPeca(r);
  if (tom === "fantasma") return <path d={corpo} fill="var(--folha)" stroke="var(--grafite)" strokeWidth={t} strokeLinejoin="round" />;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d={`M ${x - w * 0.18} ${topo + h * 0.26} L ${x - w * 0.08} ${topo} L ${x + w * 0.08} ${topo} L ${x + w * 0.18} ${topo + h * 0.26} Z`} fill="var(--saca)" stroke="var(--contorno)" strokeWidth={t} />
      <path d={corpo} fill="var(--saca)" stroke="var(--contorno)" strokeWidth={t} />
      <path d={`M ${x - w * 0.22} ${topo + h * 0.27} L ${x + w * 0.22} ${topo + h * 0.27}`} fill="none" stroke="var(--contorno)" strokeWidth={t} />
    </g>
  );
}

/** Marcas da casca de uma peça inteira. */
function Casca({ forma, x, y, r, t }: { forma: "broa" | "pao" | "pizza"; x: number; y: number; r: number; t: number }) {
  if (forma === "pizza") {
    return (
      <g>
        <circle cx={x} cy={y} r={r * 0.72} fill="var(--vermelho-claro)" stroke="var(--contorno)" strokeWidth={t * 0.75} />
        {[
          [-0.3, -0.25],
          [0.28, -0.1],
          [-0.05, 0.32],
        ].map(([a, b], i) => (
          <circle key={i} cx={x + a * r} cy={y + b * r} r={r * 0.1} fill="var(--pao-miolo)" stroke="none" />
        ))}
      </g>
    );
  }
  if (forma === "pao") {
    return (
      <path
        d={`M ${x - r * 0.45} ${y + r * 0.1} l ${r * 0.3} ${-r * 0.4} M ${x - r * 0.12} ${y + r * 0.32} l ${r * 0.34} ${-r * 0.46} M ${x + r * 0.2} ${y + r * 0.48} l ${r * 0.28} ${-r * 0.38}`}
        fill="none"
        stroke="var(--contorno)"
        strokeWidth={t * 0.75}
        strokeLinecap="round"
      />
    );
  }
  return (
    <path
      d={`M ${x - r * 0.42} ${y - r * 0.12} Q ${x} ${y - r * 0.42} ${x + r * 0.42} ${y - r * 0.12} M ${x - r * 0.36} ${y + r * 0.22} Q ${x} ${y - r * 0.02} ${x + r * 0.36} ${y + r * 0.22}`}
      fill="none"
      stroke="var(--contorno)"
      strokeWidth={t * 0.75}
      strokeLinecap="round"
    />
  );
}

/** Uma unidade (o lugar de uma peça inteira) com os pedaços que estão nela. */
export function Unidade({
  forma,
  x,
  y,
  r,
  unidade,
  tom = "normal",
  contorno = true,
}: {
  forma: FormaPeca;
  x: number;
  y: number;
  r: number;
  unidade: UnidadeDesenho;
  tom?: Tom;
  contorno?: boolean;
}) {
  if (forma === "saco") return <Saco x={x} y={y} r={r} tom={tom} />;
  if (forma === "tonel") return <Tonel x={x} y={y} r={r} unidade={unidade} tom={tom} contorno={contorno} />;
  const t = tracoDaPeca(r);
  return (
    <g strokeLinejoin="round">
      {contorno && !unidade.inteira && <circle cx={x} cy={y} r={r} fill="var(--folha)" stroke="var(--grafite)" strokeWidth={Math.max(1.4, t - 0.4)} />}
      {unidade.fatias.map((f) => {
        if (tom === "fantasma") {
          return <path key={f.chave} d={setor(x, y, r, f.inicio, f.fim)} fill="var(--folha)" stroke="var(--grafite)" strokeWidth={t} />;
        }
        if (unidade.inteira) {
          return (
            <g key={f.chave}>
              <circle cx={x} cy={y} r={r} fill="var(--pao)" stroke="var(--contorno)" strokeWidth={t} />
              <Casca forma={forma} x={x} y={y} r={r} t={t} />
            </g>
          );
        }
        return (
          <g key={f.chave}>
            <path d={setor(x, y, r, f.inicio, f.fim)} fill="var(--pao)" stroke="var(--contorno)" strokeWidth={t} />
            {forma === "pizza" && <path d={setor(x, y, r * 0.72, f.inicio, f.fim)} fill="var(--vermelho-claro)" stroke="none" />}
          </g>
        );
      })}
    </g>
  );
}

function Tonel({
  x,
  y,
  r,
  unidade,
  tom,
  contorno,
}: {
  x: number;
  y: number;
  r: number;
  unidade: UnidadeDesenho;
  tom: Tom;
  contorno: boolean;
}) {
  const w = r * 1.5;
  const h = r * 1.9;
  const base = y + h / 2;
  const topo = y - h / 2;
  const t = tracoDaPeca(r);
  const raio = w * 0.22;
  return (
    <g strokeLinejoin="round">
      {(contorno || unidade.inteira) && <rect x={x - w / 2} y={topo} width={w} height={h} rx={raio} fill="var(--folha)" stroke={unidade.inteira ? "var(--contorno)" : "var(--grafite)"} strokeWidth={t} />}
      {tom !== "fantasma" &&
        unidade.fatias.map((f) => {
          const y1 = base - h * f.fim;
          const alt = h * (f.fim - f.inicio);
          return <rect key={f.chave} x={x - w / 2} y={y1} width={w} height={alt} rx={Math.min(raio, alt / 2)} fill="var(--agua)" stroke="var(--contorno)" strokeWidth={t} />;
        })}
      {unidade.inteira && (
        <path d={`M ${x - w / 2} ${topo + h * 0.25} H ${x + w / 2} M ${x - w / 2} ${topo + h * 0.75} H ${x + w / 2}`} fill="none" stroke="var(--contorno)" strokeWidth={t * 0.8} />
      )}
    </g>
  );
}
