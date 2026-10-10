/**
 * Relógio injetável. O jogo usa o relógio do sistema mais um deslocamento que o laboratório
 * pode adiantar (para ver a revisita sem esperar 20 horas).
 */
export interface Relogio {
  agora(): number;
}

export const UM_DIA_MS = 24 * 60 * 60 * 1000;

export function relogioDoJogo(deslocamentoMs: number, base: () => number = Date.now): Relogio {
  return { agora: () => base() + deslocamentoMs };
}

export function relogioFixo(instante: number): Relogio & { avancar(ms: number): void } {
  let t = instante;
  return {
    agora: () => t,
    avancar: (ms) => {
      t += ms;
    },
  };
}
