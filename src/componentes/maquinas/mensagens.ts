/**
 * A leitura da máquina fora da missão (calibragem, laboratório): a mesma voz de instrumento
 * que a faixa do Nônio usa na missão, vinda do núcleo e dos textos do conteúdo.
 */
import type { EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import { leituraDoEvento } from "@/nucleo/tutor/reacoes";
import type { Pele } from "@/conteudo/peles";
import { TEXTOS_REACAO } from "@/conteudo/reacoes";

/** normal; atenção (sobra, engasgo, recusa: ganha um ponto vermelho); feito (partilha fechada). */
export type TomTira = "normal" | "atencao" | "feito";

export function mensagemDoEvento(e: EstadoBancada, pele: Pele): { texto: string; tom: TomTira } | null {
  if (e.evento?.tipo === "fechou") return { texto: "Partilha fechada.", tom: "feito" };
  const l = leituraDoEvento(e, pele, TEXTOS_REACAO, { postura: "quieto" });
  return l ? { texto: l.texto, tom: l.atencao ? "atencao" : "normal" } : null;
}
