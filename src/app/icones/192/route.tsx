/** Ícone do app instalado, 192 px (manifest.ts). */
import { desenharIcone } from "../../desenhoIcone";

export function GET() {
  return desenharIcone(192, "moldura");
}
