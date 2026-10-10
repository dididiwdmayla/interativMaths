/**
 * Textos das atividades geradas (revisita e sondagem). SÓ DADOS.
 */
import type { Fala } from "@/nucleo/missoes/tipos";

export const TEXTOS_REVISITA = {
  titulo: "Revisita do Nônio",
  ideia: "três perguntas, um dia depois",
  abertura: [
    { quem: "nonio", texto: "Passou um dia. Três perguntas rápidas com números novos: é assim que se vê se uma peça ficou firme." },
    { quem: "nonio", texto: "Erro aqui não apaga nada. Só me diz onde apertar." },
  ] as readonly Fala[],
  fecho: [{ quem: "nonio", texto: "Medidas anotadas. A Planta já mostra o que ficou firme." }] as readonly Fala[],
};

export const TEXTOS_SONDAGEM = {
  titulo: "Uma medida rápida",
  ideia: "uma pergunta só",
  abertura: [
    { quem: "nonio", texto: "Duas vezes a mesma medida escapou, em lugares diferentes. Uma pergunta curta para eu saber onde está a folga." },
  ] as readonly Fala[],
  fecho: [{ quem: "nonio", texto: "Anotado." }] as readonly Fala[],
};
