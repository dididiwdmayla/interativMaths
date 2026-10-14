/** Ícone do app instalado, 512 px (manifest.ts). */
import { desenharIcone } from "../../desenhoIcone";

export function GET() {
  return desenharIcone(512, "moldura");
}
