import { Atkinson_Hyperlegible_Next, Big_Shoulders, Caveat } from "next/font/google";

/** Placas e números grandes: condensada de sinalização industrial. */
export const fonteSinal = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  variable: "--fonte-sinal",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});

/** Texto e algarismos: caracteres parecidos não se confundem. */
export const fonteTexto = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  variable: "--fonte-texto",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

/** Manuscrita: só nas margens do Caderno (a letra da Dália). */
export const fonteMao = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--fonte-mao",
  display: "swap",
});
