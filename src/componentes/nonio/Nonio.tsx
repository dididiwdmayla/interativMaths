/**
 * Nônio, o tutor: um pequeno paquímetro de latão que anda. Corpo de latão, duas hastes que abrem
 * e fecham, uma lente no lugar do olho. A expressão vem da abertura das hastes e da lente.
 * Sem rosto, sem emoji.
 */
export type ExpressaoNonio = "neutro" | "atento" | "medindo" | "duvida" | "satisfeito" | "quieto";

const ABERTURA: Record<ExpressaoNonio, number> = {
  neutro: 7,
  atento: 11,
  medindo: 18,
  duvida: 3,
  satisfeito: 9,
  quieto: 0,
};

export function Nonio({
  expressao = "neutro",
  tamanho = 64,
  rotulo = "Nônio",
}: {
  expressao?: ExpressaoNonio;
  tamanho?: number;
  rotulo?: string;
}) {
  const abertura = ABERTURA[expressao];
  const inclinacao = expressao === "duvida" ? -9 : expressao === "satisfeito" ? 4 : 0;
  const lente =
    expressao === "satisfeito" || expressao === "medindo"
      ? "var(--ambar)"
      : expressao === "quieto"
        ? "var(--janela-apagada)"
        : "var(--turquesa-clara)";
  return (
    <svg viewBox="0 0 64 80" width={tamanho} height={(tamanho * 80) / 64} role="img" aria-label={rotulo} data-expressao={expressao}>
      <g
        style={{
          transform: `rotate(${inclinacao}deg)`,
          transformOrigin: "34px 74px",
          transition: "transform var(--t-assentar) var(--curva-mecanica)",
        }}
      >
        {/* pés */}
        <path d="M 31 66 L 26 76 L 22 76" stroke="var(--latao-sombra)" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M 37 66 L 42 76 L 46 76" stroke="var(--latao-sombra)" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* régua (corpo) */}
        <rect x={30} y={6} width={9} height={62} rx={2} fill="var(--latao)" />
        <rect x={35.5} y={6} width={3.5} height={62} rx={1.5} fill="var(--latao-sombra)" />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={30} x2={i % 2 === 0 ? 34 : 32.5} y1={30 + i * 3.4} y2={30 + i * 3.4} stroke="var(--latao-sombra)" strokeWidth={0.8} />
        ))}
        {/* haste fixa (no topo) */}
        <path d="M 30 6 L 12 6 L 9 12 L 30 12 Z" fill="var(--latao)" />
        <path d="M 30 10 L 10.5 10 L 9 12 L 30 12 Z" fill="var(--latao-sombra)" />
        {/* cursor com a haste móvel e a lente: desce conforme abre */}
        <g
          style={{
            transform: `translateY(${abertura}px)`,
            transition: "transform var(--t-assentar) var(--curva-mecanica)",
          }}
        >
          <path d="M 28 13 L 12 13 L 9 18 L 28 18 Z" fill="var(--latao)" />
          <path d="M 28 16.5 L 10 16.5 L 9 18 L 28 18 Z" fill="var(--latao-sombra)" />
          <rect x={27} y={12} width={16} height={18} rx={3} fill="var(--latao-claro)" />
          <rect x={27} y={24} width={16} height={6} rx={2} fill="var(--latao)" />
          <circle cx={35} cy={20} r={6.4} fill="var(--latao-sombra)" />
          <circle cx={35} cy={20} r={5} fill="var(--noite-funda)" />
          <circle
            cx={35}
            cy={20}
            r={3.4}
            fill={lente}
            style={{ transition: "fill var(--t-luz) var(--curva-firme)" }}
            opacity={expressao === "quieto" ? 0.6 : 1}
          />
          <circle cx={33.6} cy={18.6} r={1.2} fill="var(--texto-mundo)" opacity={expressao === "quieto" ? 0.2 : 0.85} />
          {expressao === "quieto" && <rect x={29.5} y={14} width={11} height={6} fill="var(--latao-claro)" />}
        </g>
        {/* cota entre as hastes quando mede */}
        {expressao === "medindo" && (
          <g stroke="var(--ambar)" strokeWidth={0.9}>
            <line x1={6} x2={6} y1={12} y2={13 + abertura} />
            <line x1={4} x2={8} y1={12} y2={12} />
            <line x1={4} x2={8} y1={13 + abertura} y2={13 + abertura} />
          </g>
        )}
      </g>
    </svg>
  );
}
