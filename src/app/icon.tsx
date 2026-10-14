/**
 * Ícone do app: a cúpula do Nônio em caneta azul sobre papel, com a bolinha amarela da antena.
 * As cores vêm de tokens.css (lidas no build), para que tokens.css continue sendo o único arquivo
 * com cor literal.
 */
import { ImageResponse } from "next/og";
import { lerToken as token } from "@/tema/lerToken";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icone() {
  const papel = token("papel");
  const tinta = token("tinta");
  const caneta = token("caneta");
  const clara = token("caneta-clara");
  const folha = token("folha");
  const marca = token("marca-texto");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: papel, borderRadius: 14, border: `3px solid ${tinta}` }}>
        <svg width="52" height="46" viewBox="-6 -44 68 56">
          <line x1="28" y1="-28" x2="34" y2="-37" stroke={tinta} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="35" cy="-39" r="5" fill={marca} stroke={tinta} strokeWidth="3" />
          <path d="M0 0 A28 28 0 0 1 56 0 Z" fill={caneta} stroke={tinta} strokeWidth="3.4" strokeLinejoin="round" />
          <path d="M10 0 A18 18 0 0 1 46 0 Z" fill={folha} stroke={tinta} strokeWidth="3" strokeLinejoin="round" />
          <rect x="-3" y="0" width="62" height="9" rx="4.5" fill={clara} stroke={tinta} strokeWidth="3.4" />
          <circle cx="22" cy="-8" r="2.4" fill={tinta} />
          <circle cx="34" cy="-8" r="2.4" fill={tinta} />
        </svg>
      </div>
    ),
    size,
  );
}
