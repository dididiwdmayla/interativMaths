/**
 * Ícone da aba: a cúpula do Nônio com moldura. O desenho mora em desenhoIcone.tsx, com os ícones
 * do app instalado.
 */
import { desenharIcone } from "./desenhoIcone";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icone() {
  return desenharIcone(64, "moldura");
}
