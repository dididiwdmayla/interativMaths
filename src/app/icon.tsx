/**
 * Ícone do app: a luz-piloto âmbar sobre a noite. As cores vêm de tokens.css (lidas no build),
 * para que tokens.css continue sendo o único arquivo com cor literal.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

function token(nome: string): string {
  const css = readFileSync(join(process.cwd(), "src", "tema", "tokens.css"), "utf8");
  const m = new RegExp(`--${nome}:\\s*([^;]+);`).exec(css);
  if (!m) throw new Error(`token --${nome} não está em tokens.css`);
  return m[1].trim();
}

export default function Icone() {
  const noite = token("noite");
  const ambar = token("ambar");
  const latao = token("latao");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: noite, borderRadius: 14, border: `4px solid ${latao}` }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: ambar }} />
      </div>
    ),
    size,
  );
}
