/**
 * Ajuda dos percursos: joga o soroban como um jogador que conhece o método. Lê a operação e o
 * lance da tela (data-operacao, data-lance-indice, data-valor) e calcula o caminho curto com o
 * próprio núcleo; depois toca nas contas, uma a uma.
 */
import { expect, type Page } from "@playwright/test";
import { gestosDosMovimentos } from "../src/nucleo/soroban/jogador";
import { lancesDaOperacao, type Operacao } from "../src/nucleo/soroban/operacao";
import { planoDoLance } from "../src/nucleo/soroban/plano";
import { ler, mostrar, type Gesto } from "../src/nucleo/soroban/soroban";

/** Com Cache Components, telas visitadas ficam escondidas no DOM: só o visível conta. */
export const v = (page: Page, seletor: string) => page.locator(seletor).locator("visible=true").first();

export async function tocar(page: Page, seletor: string) {
  await v(page, seletor).click();
}

export function operacaoDoAtributo(a: string): Operacao {
  const [tipo, x, y] = a.split(":");
  if (tipo === "somar" || tipo === "subtrair") return { tipo, a: Number(x), b: Number(y) };
  if (tipo === "ditado") return { tipo, numeros: x.split(",").map(Number) };
  if (tipo === "ler" || tipo === "mostrar") return { tipo, valor: Number(x) };
  throw new Error(`operação desconhecida: ${a}`);
}

const TELA = "[data-tela=lapidacao][data-fase=operacao]";

export async function tocarGesto(page: Page, g: Gesto) {
  const conta = g.conta === "cima" ? "cima" : `baixo-${g.indice}`;
  await tocar(page, `[data-soroban] [data-haste='${g.haste}'] [data-conta='${conta}']`);
}

/** Os gestos do caminho curto do lance aberto, a partir do soroban de agora. */
export async function gestosDoLance(page: Page): Promise<Gesto[]> {
  const tela = v(page, TELA);
  const op = operacaoDoAtributo((await tela.getAttribute("data-operacao")) ?? "");
  const indice = Number(await tela.getAttribute("data-lance-indice"));
  const valor = Number(await v(page, "[data-soroban]").getAttribute("data-valor"));
  const alvo = lancesDaOperacao(op)[indice].plano.alvo;
  const agora = mostrar(5, valor);
  const plano = planoDoLance(agora, { tipo: "mostrar", valor: ler(alvo) });
  return gestosDosMovimentos(agora, plano?.movimentos ?? []);
}

/** Faz o lance aberto pelo caminho curto. */
export async function lanceCurto(page: Page) {
  for (const g of await gestosDoLance(page)) await tocarGesto(page, g);
}

/** Digita um número no teclado da bancada e confere. */
export async function digitar(page: Page, n: number) {
  for (const d of String(n)) await tocar(page, `[data-teclado] [data-tecla='${d}']`);
  await tocar(page, "[data-teclado] [data-acao=conferir]");
}

/** Faz a operação aberta inteira: os lances pelo caminho curto, ou a leitura certa. */
export async function fazerOperacao(page: Page) {
  const tela = v(page, TELA);
  for (let guarda = 0; guarda < 12; guarda++) {
    if ((await tela.getAttribute("data-situacao")) === "feito") return;
    const modo = await tela.getAttribute("data-modo");
    if (modo === "maos") await lanceCurto(page);
    else if (modo === "leitura") await digitar(page, Number(await v(page, "[data-soroban]").getAttribute("data-valor")));
    else {
      const op = operacaoDoAtributo((await tela.getAttribute("data-operacao")) ?? "");
      if (op.tipo === "ditado") while (await v(page, "[data-acao=proximo-numero]").isVisible().catch(() => false)) await tocar(page, "[data-acao=proximo-numero]");
      const r = op.tipo === "somar" ? op.a + op.b : op.tipo === "subtrair" ? op.a - op.b : op.tipo === "ditado" ? op.numeros.reduce((t, n) => t + n, 0) : op.valor;
      await digitar(page, r);
    }
  }
  await expect(tela).toHaveAttribute("data-situacao", "feito");
}

/** Faz a rodada inteira, operação por operação, até o fim. */
export async function fazerRodada(page: Page) {
  for (let i = 1; i <= 6; i++) {
    await expect(v(page, TELA)).toHaveAttribute("data-passo", String(i));
    await fazerOperacao(page);
    await tocar(page, "[data-acao=proxima]");
  }
  await expect(v(page, "[data-tela=lapidacao][data-fase=fim]")).toBeVisible();
}

/** Toca em "Entendi" se a apresentação do soroban estiver na tela. */
export async function entenderSeVier(page: Page) {
  const ap = page.locator("[data-apresentacao] [data-acao=entendi]").locator("visible=true");
  if (await ap.count()) await ap.first().click();
}
