/**
 * A área de cada distrito, para o nome formal ("Missão 4 · Aritmética · Frações") e para as
 * seções do Manual. Área e conteúdo, como na escola; nunca ano escolar, série ou código. SÓ DADOS.
 */
import type { AreaDistrito } from "@/nucleo/curriculo/formal";

export const AREAS: readonly AreaDistrito[] = [
  { distrito: "partilha", nome: "A Partilha", area: "Aritmética" },
  { distrito: "contrapeso", nome: "O Contrapeso", area: "Álgebra" },
  { distrito: "patio", nome: "Pátio dos Sinais", area: "Lógica" },
  { distrito: "observatorio", nome: "Observatório", area: "Funções" },
  { distrito: "estaleiro", nome: "Estaleiro das Formas", area: "Geometria" },
  { distrito: "feira", nome: "Feira do Acaso", area: "Probabilidade e estatística" },
];
