/**
 * Imagem de compartilhamento (1200 × 630): uma folha quadriculada com o Nônio, a marca e a
 * descoberta da degustação. As cores vêm de tokens.css, lidas no build.
 */
import { ImageResponse } from "next/og";
import { lerToken as token } from "@/tema/lerToken";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "interativMaths: uma aventura de matemática. Três broas, quatro mesas: o traço da fração é uma divisão.";

export default function ImagemDeCompartilhamento() {
  const papel = token("papel");
  const grade = token("grade");
  const tinta = token("tinta");
  const suave = token("tinta-suave");
  const caneta = token("caneta");
  const clara = token("caneta-clara");
  const folha = token("folha");
  const marca = token("marca-texto");
  const palido = token("marca-texto-palido");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 90px",
          background: papel,
          backgroundImage: `linear-gradient(${grade} 2px, transparent 2px), linear-gradient(90deg, ${grade} 2px, transparent 2px)`,
          backgroundSize: "40px 40px",
          color: tinta,
        }}
      >
        <svg width="300" height="280" viewBox="-8 -48 72 64">
          <line x1="28" y1="-28" x2="34" y2="-37" stroke={tinta} strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="35" cy="-39" r="4.4" fill={marca} stroke={tinta} strokeWidth="2.4" />
          <rect x="15" y="6" width="5" height="9" rx="2.5" fill={clara} stroke={tinta} strokeWidth="2.4" />
          <rect x="36" y="6" width="5" height="9" rx="2.5" fill={clara} stroke={tinta} strokeWidth="2.4" />
          <path d="M0 0 A28 28 0 0 1 56 0 Z" fill={caneta} stroke={tinta} strokeWidth="2.6" strokeLinejoin="round" />
          <path d="M10 0 A18 18 0 0 1 46 0 Z" fill={folha} stroke={tinta} strokeWidth="2.4" strokeLinejoin="round" />
          <rect x="-3" y="0" width="62" height="8" rx="4" fill={clara} stroke={tinta} strokeWidth="2.6" />
          <path d="M19 -9 Q22 -12 25 -9 M31 -9 Q34 -12 37 -9" fill="none" stroke={tinta} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M24 -5 Q28 -1 32 -5 Z" fill={tinta} stroke={tinta} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>
            <span>interativ</span>
            <span style={{ background: marca, borderRadius: 10, padding: "0 12px" }}>Maths</span>
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 600, color: suave, lineHeight: 1.25 }}>
            Três broas, quatro mesas. Quanto vai em cada uma?
          </div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                fontSize: 52,
                fontWeight: 800,
                padding: "10px 28px",
                border: `4px solid ${tinta}`,
                borderRadius: 18,
                background: palido,
              }}
            >
              3 ÷ 4 = 3/4
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
