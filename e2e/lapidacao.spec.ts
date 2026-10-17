/**
 * A bancada de lapidação, pelos atributos: do Relicário à primeira rodada inteira (Ler e mostrar);
 * depois, com a joia talhada, o complemento de 5: um lance pelo caminho curto, outro com vai e
 * volta, e recarregar no meio de um lance volta na mesma operação, com o mesmo soroban.
 * O jogador de mentira (./soroban.ts) calcula o caminho curto com o próprio núcleo.
 */
import { expect, test, type Page } from "@playwright/test";
import { fazerRodada, gestosDoLance, lanceCurto, tocar, tocarGesto, v } from "./soroban";

const OPERACAO = "[data-tela=lapidacao][data-fase=operacao]";

async function entenderSoroban(page: Page) {
  await expect(v(page, "[data-apresentacao=soroban]")).toBeVisible();
  await tocar(page, "[data-apresentacao=soroban] [data-acao=entendi]");
  await expect(page.locator("[data-apresentacao]")).toHaveCount(0);
}

async function saltar(page: Page, acao: string) {
  await page.goto("/lab/progresso");
  await tocar(page, `[data-acao=${acao}]`);
  await expect(v(page, "[data-lab-joia=abaco]")).toBeVisible();
}

test("Ábaco encontrado: Relicário, Lapidar e a primeira rodada inteira", async ({ page }) => {
  await saltar(page, "abaco-encontrado");
  await page.goto("/relicario");
  const ficha = v(page, "[data-relicario=vivo] [data-joia=abaco]");
  await expect(ficha).toHaveAttribute("data-estagio", "0");
  await expect(v(page, "[data-tecnica='soroban.ler']")).toHaveAttribute("data-tecnica-estado", "lapis");
  await expect(v(page, "[data-rodada-sub]")).toContainText("ler e mostrar");
  await tocar(page, "[data-acao=lapidar]");

  // A abertura da técnica nova.
  const abertura = v(page, "[data-tela=lapidacao][data-fase=abertura]");
  await expect(abertura).toHaveAttribute("data-foco", "soroban.ler");
  await expect(abertura).toHaveAttribute("data-nova", "sim");
  await expect(v(page, "[data-ficha-tecnica]")).toContainText("Só conta o que encosta na régua.");
  await tocar(page, "[data-acao=comecar]");
  await entenderSoroban(page);
  await expect(v(page, OPERACAO)).toHaveAttribute("data-nivel", "com-nonio");

  await fazerRodada(page);
  await expect(v(page, "[data-tela=lapidacao][data-fase=fim]")).toHaveAttribute("data-lapidacao", "rodada");
  await expect(v(page, "[data-andamento] [data-tecnica='soroban.ler']")).toHaveAttribute("data-tecnica-estado", "firmando");

  // No Relicário, a técnica está firmando e o Lapidar continua nela.
  await tocar(page, "[data-acao=ver-relicario]");
  await expect(v(page, "[data-tecnica='soroban.ler']")).toHaveAttribute("data-tecnica-estado", "firmando");
});

test("talhada: o complemento de 5 pelo caminho curto, com vai e volta, e a volta depois de recarregar", async ({ page }) => {
  await saltar(page, "abaco-talhado");
  await page.goto("/relicario");
  await expect(v(page, "[data-relicario=vivo] [data-joia=abaco]")).toHaveAttribute("data-estagio", "1");
  await tocar(page, "[data-acao=lapidar]");
  await expect(v(page, "[data-tela=lapidacao][data-fase=abertura]")).toHaveAttribute("data-foco", "soroban.complemento-5");
  await tocar(page, "[data-acao=comecar]");
  await entenderSoroban(page);
  const tela = v(page, OPERACAO);

  // Operação 1: mostrar o primeiro número e pôr o algarismo pelo caminho curto.
  await expect(tela).toHaveAttribute("data-passo", "1");
  await lanceCurto(page);
  await expect(tela).toHaveAttribute("data-lance", "limpo");
  await lanceCurto(page);
  await expect(tela).toHaveAttribute("data-lance", "limpo");
  await expect(tela).toHaveAttribute("data-tecnicas", /complemento-5/);
  await expect(tela).toHaveAttribute("data-situacao", "feito");
  await expect(v(page, "[data-tipo-conta]")).toContainText("complemento de 5");
  await tocar(page, "[data-acao=proxima]");

  // Operação 2: um toque a mais e Desfazer, depois o caminho: vai e volta.
  await expect(tela).toHaveAttribute("data-passo", "2");
  await lanceCurto(page);
  await tocar(page, "[data-soroban] [data-haste='1'] [data-conta='cima']");
  await tocar(page, "[data-acao=desfazer]");
  await lanceCurto(page);
  await expect(tela).toHaveAttribute("data-lance", "vai-e-volta");
  await expect(tela).toHaveAttribute("data-retorno", "acertou");
  // O caminho curto está na janelinha.
  await tocar(page, "[data-bolha-nonio]");
  await tocar(page, "[data-acao=ver-caminho-curto]");
  await expect(tela).toHaveAttribute("data-caminho-passando", "sim");
  await expect(tela).toHaveAttribute("data-caminho-passando", "nao", { timeout: 15_000 });
  await tocar(page, "[data-acao=proxima]");

  // Operação 3: o primeiro número e um gesto do lance; recarregar volta no mesmo lance.
  await expect(tela).toHaveAttribute("data-passo", "3");
  await lanceCurto(page);
  const [primeiro] = await gestosDoLance(page);
  await tocarGesto(page, primeiro);
  await expect(tela).toHaveAttribute("data-lance", "aberto");
  const valor = await v(page, "[data-soroban]").getAttribute("data-valor");
  const operacao = await tela.getAttribute("data-operacao");
  await page.reload();
  await expect(v(page, OPERACAO)).toHaveAttribute("data-passo", "3");
  await expect(v(page, OPERACAO)).toHaveAttribute("data-operacao", operacao ?? "");
  await expect(v(page, "[data-soroban]")).toHaveAttribute("data-valor", valor ?? "");
  await expect(v(page, OPERACAO)).toHaveAttribute("data-lance-indice", "1");
  await lanceCurto(page);
  await expect(v(page, OPERACAO)).toHaveAttribute("data-lance", "limpo");
});
