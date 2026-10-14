/** Ícone mascarável (Android recorta a forma): sangrado, a cúpula dentro da zona segura de 80%. */
import { desenharIcone } from "../../desenhoIcone";

export function GET() {
  return desenharIcone(512, "sangrado", 0.58);
}
