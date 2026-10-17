/**
 * Um jogador de mentira, para os testes e para montar os cenários do laboratório rodando o motor
 * como um jogador faria: segue o caminho curto gesto a gesto, ou digita a resposta certa.
 */
import { aplicarEntradaItem, lanceAtual, modoDoItem, type EntradaItem, type EstadoItem } from "./item";
import { resultadoDe } from "./operacao";
import { aplicarMovimento, gestoDoMovimento, type Gesto, type Movimento, type Soroban } from "./soroban";
import { planoDoLance } from "./plano";

/** Os gestos que fazem uma lista de movimentos, um a um, a partir de um soroban. */
export function gestosDosMovimentos(inicio: Soroban, movimentos: readonly Movimento[]): Gesto[] {
  const saida: Gesto[] = [];
  let s = inicio;
  for (const m of movimentos) {
    saida.push(gestoDoMovimento(s, m));
    s = aplicarMovimento(s, m);
  }
  return saida;
}

/** As entradas que levam o lance aberto ao alvo pelo caminho curto. */
export function entradasDoCaminhoCurto(e: EstadoItem): EntradaItem[] {
  const atual = lanceAtual(e);
  if (!atual) return [];
  return gestosDosMovimentos(e.soroban, atual.lance.plano.movimentos).map((gesto) => ({ tipo: "gesto", gesto }));
}

export interface ModoDeJogar {
  /** Faz este lance com vai e volta: um toque a mais e o Desfazer. */
  readonly vaiEVolta?: (indice: number) => boolean;
  /** Pede o Me ajuda até este degrau antes do lance. */
  readonly ajuda?: (indice: number) => number;
  /** Erra a resposta digitada (no imaginado, uma tentativa só). */
  readonly errar?: boolean;
}

function aplicar(e: EstadoItem, entradas: readonly EntradaItem[]): EstadoItem {
  return entradas.reduce((x, ent) => aplicarEntradaItem(x, ent).estado, e);
}

/** Faz o item inteiro: o caminho curto em cada lance, ou a resposta certa. */
export function jogarItem(e: EstadoItem, modo: ModoDeJogar = {}): EstadoItem {
  let x = e;
  const m = modoDoItem(x.item);
  if (m === "maos") {
    for (let guarda = 0; guarda < 20 && !x.terminado; guarda++) {
      const atual = lanceAtual(x);
      if (!atual) break;
      const ajuda = modo.ajuda?.(atual.indice) ?? 0;
      for (let d = 0; d < ajuda; d++) x = aplicarEntradaItem(x, { tipo: "ajuda" }).estado;
      if (modo.vaiEVolta?.(atual.indice)) {
        // Um toque na haste da esquerda (que nenhum lance até 999 mexe), e o Desfazer.
        x = aplicar(x, [{ tipo: "gesto", gesto: { haste: 0, conta: "cima" } }, { tipo: "desfazer" }]);
      }
      x = aplicar(x, entradasDoCaminhoCurto(x));
    }
    return x;
  }
  if (m === "sombra") {
    // Sem ver as contas, a mão deixa o resultado no soroban (o motor anda igual).
    const plano = planoDoLance(x.soroban, { tipo: "mostrar", valor: resultadoDe(x.item.operacao) });
    if (plano) x = aplicar(x, gestosDosMovimentos(x.soroban, plano.movimentos).map((gesto) => ({ tipo: "gesto" as const, gesto })));
  }
  const op = x.item.operacao;
  if (op.tipo === "ditado") while (x.mostrados < op.numeros.length) x = aplicarEntradaItem(x, { tipo: "proximo-numero" }).estado;
  const ajuda = modo.ajuda?.(0) ?? 0;
  for (let d = 0; d < ajuda; d++) x = aplicarEntradaItem(x, { tipo: "ajuda" }).estado;
  const certo = resultadoDe(x.item.operacao);
  return aplicarEntradaItem(x, { tipo: "responder", valor: modo.errar ? certo + 1 : certo }).estado;
}
