/**
 * Lê uma cor de tokens.css no build, para as imagens geradas (ícone, imagem de compartilhamento):
 * tokens.css continua sendo o único arquivo com cor literal. Só no servidor.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function lerToken(nome: string): string {
  const css = readFileSync(join(process.cwd(), "src", "tema", "tokens.css"), "utf8");
  const m = new RegExp(`--${nome}:\\s*([^;]+);`).exec(css);
  if (!m) throw new Error(`token --${nome} não está em tokens.css`);
  return m[1].trim();
}
