/**
 * Os exemplos mínimos do docs/AUTORIA.md. SÓ DADOS. Fora do catálogo do jogo; as checagens de
 * conteúdo rodam neles como em qualquer atividade, para o exemplo nunca envelhecer.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";
import { CENA_MINIMA } from "./cena-minima";
import { MISSAO_MINIMA } from "./missao-minima";

export const EXEMPLOS_DE_AUTORIA: readonly Atividade[] = [MISSAO_MINIMA, CENA_MINIMA];
