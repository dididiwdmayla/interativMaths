/**
 * Atividades geradas: revisita (três perguntas) e sondagem (uma pergunta).
 * Mesmo motor, mesmos validadores; só os números mudam com a semente.
 */
import type { IdConceito } from "../curriculo/curriculo";
import type { Atividade, Fala } from "../missoes/tipos";
import { gerarQuestao } from "./questoes";

export const ID_REVISITA = "partilha.arco1.revisita";

export interface TextosGerados {
  readonly titulo: string;
  readonly ideia: string;
  readonly abertura: readonly Fala[];
  readonly fecho: readonly Fala[];
}

export function atividadeRevisita(conceitos: readonly IdConceito[], semente: number, textos: TextosGerados): Atividade {
  return {
    id: ID_REVISITA,
    tipo: "revisita",
    distrito: "partilha",
    arco: "partilha.arco1",
    titulo: textos.titulo,
    ideia: textos.ideia,
    conceitos: [...new Set(conceitos)],
    passos: [
      { id: "abertura", tipo: "narrativa", fase: "retencao", pedido: "Um dia depois.", instrucao: "Leia e comece a revisita.", falas: textos.abertura, botao: "Começar" },
      ...conceitos.map((c, i) => gerarQuestao(c, semente + i * 101, "revisita", `pergunta-${i + 1}`)),
      { id: "fecho", tipo: "narrativa", fase: "retencao", pedido: "Revisita feita.", instrucao: "Leia e volte ao distrito.", falas: textos.fecho, botao: "Voltar" },
    ],
    solucoesDeTeste: [],
    sabotagens: [],
  };
}

export function idSondagem(conceito: IdConceito): string {
  return `sondagem.${conceito}`;
}

export function atividadeSondagem(conceito: IdConceito, semente: number, textos: TextosGerados): Atividade {
  return {
    id: idSondagem(conceito),
    tipo: "sondagem",
    distrito: "partilha",
    titulo: textos.titulo,
    ideia: textos.ideia,
    conceitos: [conceito],
    passos: [
      { id: "abertura", tipo: "narrativa", fase: "problema", pedido: "Uma pergunta só.", instrucao: "Leia e responda a pergunta.", falas: textos.abertura, botao: "Responder" },
      gerarQuestao(conceito, semente, "sondagem", "pergunta"),
    ],
    solucoesDeTeste: [],
    sabotagens: [],
  };
}
