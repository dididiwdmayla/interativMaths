/** Ícone da tela de início do iPhone: sangrado, porque o sistema arredonda os cantos. */
import { desenharIcone } from "./desenhoIcone";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function IconeApple() {
  return desenharIcone(180, "sangrado", 0.7);
}
