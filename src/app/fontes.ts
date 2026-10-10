import { Caveat, Rubik } from "next/font/google";

/** A letra da interface inteira: arredondada e pesada, em caixa normal, algarismos tabulares. */
export const fonteInterface = Rubik({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
  variable: "--fonte-interface",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

/** A letra de mão: anotações curtas, títulos à mão, nunca número que precisa ser lido com precisão. */
export const fonteMao = Caveat({
  subsets: ["latin", "latin-ext"],
  weight: ["700"],
  variable: "--fonte-mao",
  display: "swap",
  fallback: ["cursive"],
});
