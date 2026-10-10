/**
 * Desenho das peças por forma. Inteira mostra a casca; pedaço cortado mostra o miolo.
 * Duas tonalidades por forma, sem degradê.
 */
import type { FormaPeca } from "@/conteudo/peles";
import { setor, type UnidadeDesenho } from "./geometria";

export type Tom = "normal" | "sobra" | "fantasma";

const CORES: Record<Exclude<FormaPeca, "saco" | "tonel">, { casca: string; sombra: string; miolo: string }> = {
  broa: { casca: "var(--broa)", sombra: "var(--broa-sombra)", miolo: "var(--miolo)" },
  pizza: { casca: "var(--pizza)", sombra: "var(--pizza-sombra)", miolo: "var(--molho)" },
  pao: { casca: "var(--pao)", sombra: "var(--pao-sombra)", miolo: "var(--miolo)" },
};

export function Saco({ x, y, r, tom = "normal" }: { x: number; y: number; r: number; tom?: Tom }) {
  const w = r * 1.7;
  const h = r * 1.9;
  const topo = y - h / 2;
  const corpo = `M ${x - w * 0.42} ${topo + h * 0.28}
    Q ${x - w * 0.55} ${y + h * 0.42} ${x - w * 0.2} ${y + h * 0.5}
    L ${x + w * 0.2} ${y + h * 0.5}
    Q ${x + w * 0.55} ${y + h * 0.42} ${x + w * 0.42} ${topo + h * 0.28}
    Q ${x} ${topo + h * 0.12} ${x - w * 0.42} ${topo + h * 0.28} Z`;
  if (tom === "fantasma") return <path d={corpo} fill="none" stroke="var(--texto-mundo-apagado)" strokeDasharray="2 2" strokeWidth={0.8} />;
  return (
    <g>
      <path d={corpo} fill="var(--saca)" stroke={tom === "sobra" ? "var(--vermelhao)" : "var(--saca-sombra)"} strokeWidth={tom === "sobra" ? 1.6 : 0.8} />
      <path d={`M ${x + w * 0.05} ${topo + h * 0.3} Q ${x + w * 0.45} ${y + h * 0.3} ${x + w * 0.16} ${y + h * 0.48} L ${x + w * 0.2} ${y + h * 0.5} Q ${x + w * 0.55} ${y + h * 0.42} ${x + w * 0.42} ${topo + h * 0.28} Z`} fill="var(--saca-sombra)" opacity={0.55} />
      <path d={`M ${x - w * 0.16} ${topo + h * 0.22} L ${x} ${topo} L ${x + w * 0.16} ${topo + h * 0.22}`} fill="var(--saca)" stroke="var(--saca-sombra)" strokeWidth={0.8} />
      <rect x={x - w * 0.2} y={topo + h * 0.18} width={w * 0.4} height={h * 0.07} rx={1} fill="var(--madeira)" />
    </g>
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
  const c = CORES[forma];
  const traco = tom === "sobra" ? "var(--vermelhao)" : c.sombra;
  return (
    <g>
      {contorno && !unidade.inteira && (
        <circle cx={x} cy={y} r={r} fill="none" stroke="var(--texto-mundo-apagado)" strokeWidth={0.7} strokeDasharray="1.6 1.6" />
      )}
      {unidade.fatias.map((f) => {
        if (tom === "fantasma") {
          return <path key={f.chave} d={setor(x, y, r, f.inicio, f.fim)} fill="none" stroke="var(--texto-mundo-apagado)" strokeWidth={0.8} />;
        }
        if (unidade.inteira) {
          return (
            <g key={f.chave}>
              <circle cx={x} cy={y} r={r} fill={c.casca} stroke={traco} strokeWidth={tom === "sobra" ? 1.6 : 0.9} />
              {forma === "pizza" ? (
                <circle cx={x} cy={y} r={r * 0.78} fill={c.miolo} />
              ) : (
                <path
                  d={`M ${x - r * 0.45} ${y - r * 0.2} Q ${x} ${y - r * 0.45} ${x + r * 0.45} ${y - r * 0.2} M ${x - r * 0.4} ${y + r * 0.18} Q ${x} ${y - r * 0.05} ${x + r * 0.4} ${y + r * 0.18}`}
                  stroke={c.sombra}
                  strokeWidth={0.9}
                  fill="none"
                />
              )}
            </g>
          );
        }
        return (
          <g key={f.chave}>
            <path d={setor(x, y, r, f.inicio, f.fim)} fill={c.casca} stroke={traco} strokeWidth={tom === "sobra" ? 1.4 : 0.8} strokeLinejoin="round" />
            <path d={setor(x, y, r * 0.74, f.inicio, f.fim)} fill={c.miolo} opacity={forma === "pizza" ? 1 : 0.9} />
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
  return (
    <g>
      {(contorno || unidade.inteira) && (
        <rect x={x - w / 2} y={topo} width={w} height={h} rx={w * 0.22} fill="none" stroke={tom === "sobra" ? "var(--vermelhao)" : "var(--madeira-sombra)"} strokeWidth={1} strokeDasharray={unidade.inteira ? undefined : "1.6 1.6"} />
      )}
      {tom !== "fantasma" &&
        unidade.fatias.map((f) => (
          <rect
            key={f.chave}
            x={x - w / 2 + 1}
            y={base - h * f.fim}
            width={w - 2}
            height={h * (f.fim - f.inicio)}
            fill="var(--agua)"
            stroke="var(--agua-sombra)"
            strokeWidth={0.7}
          />
        ))}
      <rect x={x - w / 2} y={topo + h * 0.22} width={w} height={1.4} fill="var(--madeira)" opacity={0.9} />
      <rect x={x - w / 2} y={topo + h * 0.74} width={w} height={1.4} fill="var(--madeira)" opacity={0.9} />
    </g>
  );
}
