/**
 * Nônio, o tutor: um medidor em forma de cúpula. Semicírculo azul com contorno de tinta, uma
 * janela branca com o rosto, base azul-clara, dois pezinhos e uma antena com bolinha amarela,
 * que é o ponteiro. As seis expressões mudam o rosto e a postura; toda transição é só
 * transform e opacity (os rostos se cruzam por opacidade).
 */
import type { ExpressaoTutor } from "@/nucleo/tutor/expressoes";

export type ExpressaoNonio = ExpressaoTutor;

const EXPRESSOES: readonly ExpressaoNonio[] = ["neutro", "atento", "medindo", "duvida", "satisfeito", "quieto"];

/** Inclinação da antena, em graus, a partir da vertical. */
const ANTENA: Record<ExpressaoNonio, number> = {
  neutro: 33,
  atento: 0,
  medindo: -43,
  duvida: 33,
  satisfeito: 33,
  quieto: 33,
};

function Rosto({ expressao, traco }: { expressao: ExpressaoNonio; traco: number }) {
  switch (expressao) {
    case "neutro":
      return (
        <>
          <circle cx={22} cy={-8} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <circle cx={34} cy={-8} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <path d="M25 -4.5 Q28 -2 31 -4.5" fill="none" strokeWidth={traco * 0.75} />
        </>
      );
    case "atento":
      return (
        <>
          <circle cx={22} cy={-8.5} r={2.3} fill="var(--nonio-olho)" stroke="none" />
          <circle cx={34} cy={-8.5} r={2.3} fill="var(--nonio-olho)" stroke="none" />
        </>
      );
    case "medindo":
      return (
        <>
          <circle cx={19.5} cy={-8} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <circle cx={31.5} cy={-8} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <circle cx={25.5} cy={-4} r={1.3} fill="var(--nonio-olho)" stroke="none" />
        </>
      );
    case "duvida":
      return (
        <>
          <circle cx={24} cy={-10.5} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <circle cx={36} cy={-10.5} r={1.6} fill="var(--nonio-olho)" stroke="none" />
          <path d="M26.5 -4.5 H32.5" fill="none" strokeWidth={traco * 0.8} />
        </>
      );
    case "satisfeito":
      return (
        <>
          <path d="M19 -8 q2.5 -3.2 5 0" fill="none" strokeWidth={traco * 0.7} />
          <path d="M32 -8 q2.5 -3.2 5 0" fill="none" strokeWidth={traco * 0.7} />
          <path d="M24.5 -5.5 Q28 -1 31.5 -5.5 Z" fill="var(--nonio-olho)" strokeWidth={traco * 0.5} />
        </>
      );
    case "quieto":
      return (
        <>
          <path d="M19.5 -8.5 q2.5 2.4 5 0" fill="none" strokeWidth={traco * 0.8} />
          <path d="M31.5 -8.5 q2.5 2.4 5 0" fill="none" strokeWidth={traco * 0.8} />
        </>
      );
  }
}

export function Nonio({
  expressao = "neutro",
  tamanho = 64,
  rotulo = "Nônio",
  pes = true,
}: {
  expressao?: ExpressaoNonio;
  /** Largura em px. */
  tamanho?: number;
  rotulo?: string;
  /** Sem os pezinhos (o Nônio do cabeçalho). */
  pes?: boolean;
}) {
  // Desenho pequeno pede traço mais grosso para continuar legível.
  const traco = tamanho <= 40 ? 2.8 : tamanho <= 80 ? 2.4 : 2.1;
  const altura = (tamanho * 66) / 80;
  const transicao = "transform var(--t-assentar) var(--curva-firme)";
  return (
    <svg
      viewBox="-12 -50 80 66"
      width={tamanho}
      height={altura}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo || undefined}
      aria-hidden={rotulo ? undefined : true}
      data-expressao={expressao}
      stroke="var(--nonio-traco)"
      strokeWidth={traco}
      strokeLinejoin="round"
      strokeLinecap="round"
      className="shrink-0"
    >
      {/* Dois sinais de mais, quando satisfeito */}
      <g fill="none" stroke="var(--caneta)" strokeWidth={traco * 0.85} className="camada" style={{ opacity: expressao === "satisfeito" ? 1 : 0 }}>
        <path d="M-6 -36 v8 M-10 -32 h8" />
        <path d="M60 -24 v7 M56.5 -20.5 h7" />
      </g>
      <g style={{ transform: `rotate(${expressao === "duvida" ? -6 : 0}deg)`, transformOrigin: "28px 8px", transition: transicao }}>
        {/* Antena com a bolinha-ponteiro */}
        <g style={{ transform: `rotate(${ANTENA[expressao]}deg)`, transformOrigin: "28px -28px", transition: transicao }}>
          <line x1={28} y1={-28} x2={28} y2={-38.5} />
          <circle cx={28} cy={-41} r={4} fill="var(--marca-texto)" />
          <circle cx={28} cy={-41} r={4} fill="var(--nonio-rosto)" className="camada" style={{ opacity: expressao === "quieto" ? 1 : 0 }} />
        </g>
        {pes && (
          <>
            <rect x={15} y={6} width={5} height={9} rx={2.5} fill="var(--nonio-aba)" />
            <rect x={36} y={6} width={5} height={9} rx={2.5} fill="var(--nonio-aba)" />
          </>
        )}
        <path d="M0 0 A28 28 0 0 1 56 0 Z" fill="var(--nonio-cupula)" />
        <path d="M10 0 A18 18 0 0 1 46 0 Z" fill="var(--nonio-rosto)" />
        <rect x={-3} y={0} width={62} height={8} rx={4} fill="var(--nonio-aba)" />
        {EXPRESSOES.map((e) => (
          <g key={e} className="camada" stroke="var(--nonio-olho)" style={{ opacity: e === expressao ? 1 : 0 }} data-rosto={e === expressao ? e : undefined}>
            <Rosto expressao={e} traco={traco} />
          </g>
        ))}
      </g>
    </svg>
  );
}
