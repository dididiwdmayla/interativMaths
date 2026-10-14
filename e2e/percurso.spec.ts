/**
 * O percurso: abertura, calibragem, mapa, missão 1 até o registro no Caderno; no meio, recarregar
 * a página e conferir que a máquina voltou igual; no fim, recarregar e conferir o Caderno.
 * Espera estado (data-pronto, data-passo), nunca tempo.
 */
import { expect, test, type Page } from "@playwright/test";

/** Com Cache Components, telas visitadas ficam escondidas no DOM: só o visível conta. */
const v = (page: Page, seletor: string) => page.locator(seletor).locator("visible=true").first();

async function tocar(page: Page, seletor: string) {
  await v(page, seletor).click();
}

async function passo(page: Page, id: string) {
  await expect(v(page, `[data-tela=missao][data-passo="${id}"]`)).toBeVisible();
}

async function mais(page: Page, seletor: string, vezes: number) {
  for (let i = 0; i < vezes; i++) await tocar(page, `[data-seletor=${seletor}] button[aria-label$="mais um"]`);
}

test("abertura, calibragem, mapa e missão 1 até o Caderno, com o progresso voltando", async ({ page }) => {
  await page.goto("/");
  await expect(v(page, "[data-tela=abertura]")).toBeVisible();
  await tocar(page, "[data-acao=pular]");

  // Calibragem: D3 vencido, D4 com "não sei ainda".
  await expect(v(page, "[data-tela=calibragem][data-fase=convite]")).toBeVisible();
  await tocar(page, "[data-acao=comecar-calibragem]");
  await expect(v(page, "[data-tela=calibragem][data-degrau='3']")).toBeVisible();
  await mais(page, "lote", 2);
  await tocar(page, "[data-acao=repartir]");
  await tocar(page, "[data-acao=fechar]");
  await expect(v(page, "[data-anotado=sucesso]")).toBeVisible();
  await tocar(page, "[data-acao=seguir]");
  await expect(v(page, "[data-tela=calibragem][data-degrau='4']")).toBeVisible();
  await tocar(page, "[data-acao=nao-sei]");
  await tocar(page, "[data-acao=seguir]");
  await expect(v(page, "[data-tela=calibragem][data-fase=resultado]")).toHaveAttribute("data-maior-degrau", "3");

  // Mapa: A Partilha desperta.
  await tocar(page, "[data-acao=ver-mapa]");
  await expect(v(page, "[data-tela=mapa]")).toBeVisible();
  await tocar(page, "[data-destino=andar-partilha]");
  await expect(v(page, "[data-tela=distrito]")).toBeVisible();
  await expect(v(page, "[data-estacao='partilha.arco1.carga-igual']")).toHaveAttribute("data-status", "disponivel");
  await tocar(page, "[data-estacao='partilha.arco1.carga-igual'] [data-acao=entrar]");

  // Missão 1.
  await passo(page, "pedido");
  await tocar(page, "[data-acao=seguir]");
  await passo(page, "palpite");
  await mais(page, "resposta", 4);
  await tocar(page, "[data-acao=responder]");

  // A mão: tocar numa saca e depois numa carroça, quatro vezes.
  await passo(page, "a-mao");
  for (const bica of ["0", "1", "2", "3"]) {
    await tocar(page, "[data-peca='1/1']");
    await tocar(page, `[data-receptor='${bica}']`);
  }
  await expect(v(page, "[data-tela=missao][data-situacao=vencido]")).toBeVisible();
  await expect(v(page, "[data-tela=missao]")).toHaveAttribute("data-retorno", "acertou");
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "repartir");
  await mais(page, "lote", 7);
  await tocar(page, "[data-acao=repartir]");
  await expect(v(page, "[data-visor]")).toContainText("Uma volta de 8 em 4 bicas pede 32");
  for (let i = 0; i < 3; i++) await tocar(page, '[data-seletor=lote] button[aria-label$="menos um"]');
  await tocar(page, "[data-acao=repartir]");
  await expect(v(page, "[data-bica='0']")).toHaveAttribute("data-quantidade", "6");

  // Fechar e reabrir no meio da missão: mesmo passo, máquina no mesmo estado.
  await page.reload();
  await passo(page, "repartir");
  await expect(v(page, "[data-bica='3']")).toHaveAttribute("data-quantidade", "6");

  await tocar(page, "[data-acao=fechar]");
  await expect(v(page, "[data-tela=missao][data-situacao=vencido]")).toBeVisible();
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "trinta");
  await mais(page, "resposta", 5);
  await tocar(page, "[data-acao=responder]");
  await expect(v(page, "[data-resultado-previsao=certa]")).toBeVisible();
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "frase");
  for (const [cota, lacuna] of [
    ["24", "a"],
    ["4", "b"],
    ["6", "c"],
  ]) {
    await tocar(page, `[data-cota='${cota}']`);
    await tocar(page, `[data-lacuna='${lacuna}']`);
  }
  await tocar(page, "[data-acao=conferir-frase]");
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "notacao");
  await tocar(page, "[data-acao=comprimir]");
  await expect(v(page, "[data-compressao=feita]")).toBeVisible();
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "volta");
  await mais(page, "carga", 8);
  await tocar(page, '[data-seletor=bicas] button[aria-label$="menos um"]');
  await mais(page, "lote", 5);
  await tocar(page, "[data-acao=repartir]");
  await tocar(page, "[data-acao=fechar]");
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "registro");
  await tocar(page, "[data-acao=guardar-pagina]");
  await expect(v(page, "[data-tela=fim]")).toBeVisible();

  // O Caderno guarda a página, e ela volta depois de recarregar.
  await page.goto("/caderno");
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toBeVisible();
  await page.reload();
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toBeVisible();
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toContainText("24 sacas repartidas entre 4 carroças dão 6 em cada.");
});
