/**
 * Kit de peças do Engenho, em SVG. Geometria simples, duas tonalidades por forma (luz e sombra).
 * Todas as cenas são compostas com estas peças: é o que dá unidade e barateia a próxima região.
 */
import type { ReactNode } from "react";

export function Rebite({ x, y, r = 2.2 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--latao-sombra)" />
      <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.55} fill="var(--latao-claro)" />
    </g>
  );
}

/** Viga de latão com rebites nas pontas. */
export function Viga({
  x,
  y,
  largura,
  altura = 8,
  rebites = 2,
}: {
  x: number;
  y: number;
  largura: number;
  altura?: number;
  rebites?: number;
}) {
  const passos = Math.max(rebites, 2);
  return (
    <g>
      <rect x={x} y={y} width={largura} height={altura} rx={1.5} fill="var(--latao)" />
      <rect x={x} y={y + altura * 0.62} width={largura} height={altura * 0.38} rx={1.5} fill="var(--latao-sombra)" />
      {Array.from({ length: passos }, (_, i) => (
        <Rebite key={i} x={x + 5 + ((largura - 10) * i) / (passos - 1)} y={y + altura * 0.4} r={1.5} />
      ))}
    </g>
  );
}

/** Placa esmaltada com texto (sinalização). */
export function Placa({
  x,
  y,
  largura,
  altura = 18,
  children,
  tom = "esmalte",
}: {
  x: number;
  y: number;
  largura: number;
  altura?: number;
  children: ReactNode;
  tom?: "esmalte" | "latao";
}) {
  const fundo = tom === "esmalte" ? "var(--esmalte)" : "var(--latao)";
  const sombra = tom === "esmalte" ? "var(--esmalte-sombra)" : "var(--latao-sombra)";
  const texto = tom === "esmalte" ? "var(--texto-mundo)" : "var(--tinta)";
  return (
    <g>
      <rect x={x} y={y + 1.5} width={largura} height={altura} rx={3} fill={sombra} />
      <rect x={x} y={y} width={largura} height={altura} rx={3} fill={fundo} stroke="var(--latao)" strokeWidth={1} />
      <Rebite x={x + 4} y={y + altura / 2} r={1.3} />
      <Rebite x={x + largura - 4} y={y + altura / 2} r={1.3} />
      <text
        x={x + largura / 2}
        y={y + altura / 2 + 0.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={texto}
        className="fonte-sinal"
        fontSize={altura * 0.58}
        fontWeight={700}
        style={{ textTransform: "uppercase" }}
      >
        {children}
      </text>
    </g>
  );
}

/** Lâmpada: apagada, piloto (pulsa baixo) ou acesa em âmbar com halo. */
export function Lampada({
  x,
  y,
  r = 4,
  estado,
}: {
  x: number;
  y: number;
  r?: number;
  estado: "apagada" | "piloto" | "acesa" | "atencao";
}) {
  const acesa = estado === "acesa";
  const atencao = estado === "atencao";
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r * 2.4}
        fill={atencao ? "var(--vermelhao-halo)" : "var(--ambar-halo)"}
        style={{
          opacity: acesa || atencao ? 1 : 0,
          transition: "opacity var(--t-luz) var(--curva-firme)",
        }}
      />
      <circle cx={x} cy={y + 0.6} r={r} fill="var(--latao-sombra)" />
      <circle
        cx={x}
        cy={y}
        r={r * 0.78}
        fill={acesa ? "var(--ambar)" : atencao ? "var(--vermelhao)" : estado === "piloto" ? "var(--ambar-sombra)" : "var(--janela-apagada)"}
        className={estado === "piloto" ? "piloto" : atencao ? "luz-oscilante" : undefined}
        style={{ transition: "fill var(--t-luz) var(--curva-firme)" }}
      />
      <circle cx={x - r * 0.28} cy={y - r * 0.3} r={r * 0.22} fill="var(--texto-mundo)" opacity={acesa ? 0.8 : 0.25} />
    </g>
  );
}

/** Volante (registro de uma bica). Turquesa quando o jogador pode girar. */
export function Volante({
  x,
  y,
  r = 6,
  mexivel,
  aberto,
}: {
  x: number;
  y: number;
  r?: number;
  mexivel: boolean;
  aberto: boolean;
}) {
  const cor = mexivel ? "var(--turquesa)" : "var(--aco)";
  const sombra = mexivel ? "var(--turquesa-sombra)" : "var(--aco-sombra)";
  return (
    <g style={{ transform: `rotate(${aberto ? 0 : 45}deg)`, transformOrigin: `${x}px ${y}px`, transformBox: "view-box", transition: "transform var(--t-assentar) var(--curva-mecanica)" }}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={sombra} strokeWidth={2.6} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={cor} strokeWidth={1.8} />
      <line x1={x - r} y1={y} x2={x + r} y2={y} stroke={cor} strokeWidth={1.6} />
      <line x1={x} y1={y - r} x2={x} y2={y + r} stroke={cor} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={r * 0.32} fill={sombra} />
    </g>
  );
}

/** Rolo da esteira. */
export function Rolo({ x, y, r = 8, girando = true }: { x: number; y: number; r?: number; girando?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="var(--latao-sombra)" />
      <circle cx={x} cy={y} r={r * 0.82} fill="var(--latao)" />
      <g className={girando ? "ambiente-girar" : undefined}>
        <line x1={x - r * 0.6} y1={y} x2={x + r * 0.6} y2={y} stroke="var(--latao-sombra)" strokeWidth={1.4} />
        <line x1={x} y1={y - r * 0.6} x2={x} y2={y + r * 0.6} stroke="var(--latao-sombra)" strokeWidth={1.4} />
      </g>
      <circle cx={x} cy={y} r={r * 0.22} fill="var(--latao-claro)" />
    </g>
  );
}

/** Cano vertical com flange. */
export function Cano({ x, y1, y2, largura = 5, apagado = false }: { x: number; y1: number; y2: number; largura?: number; apagado?: boolean }) {
  return (
    <g opacity={apagado ? 0.55 : 1} style={{ transition: "opacity var(--t-assentar)" }}>
      <rect x={x - largura / 2} y={y1} width={largura} height={y2 - y1} fill="var(--aco)" />
      <rect x={x + largura * 0.1} y={y1} width={largura * 0.4} height={y2 - y1} fill="var(--aco-sombra)" />
      <rect x={x - largura * 0.8} y={y2 - 2} width={largura * 1.6} height={3} rx={1} fill="var(--latao)" />
    </g>
  );
}

/** Engrenagem decorativa (gira em modo ambiente). */
export function Engrenagem({ x, y, r, dentes = 8, girando = false, cor = "var(--latao-sombra)" }: { x: number; y: number; r: number; dentes?: number; girando?: boolean; cor?: string }) {
  const pontos: string[] = [];
  for (let i = 0; i < dentes * 2; i++) {
    const ang = (Math.PI * i) / dentes;
    const raio = i % 2 === 0 ? r : r * 0.78;
    const a1 = ang - Math.PI / dentes / 2.2;
    const a2 = ang + Math.PI / dentes / 2.2;
    pontos.push(`${x + raio * Math.cos(a1)},${y + raio * Math.sin(a1)}`);
    pontos.push(`${x + raio * Math.cos(a2)},${y + raio * Math.sin(a2)}`);
  }
  return (
    <g className={girando ? "ambiente-girar" : undefined}>
      <polygon points={pontos.join(" ")} fill={cor} />
      <circle cx={x} cy={y} r={r * 0.32} fill="var(--noite)" />
    </g>
  );
}
