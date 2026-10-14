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

/** A primeira vez com uma ferramenta: a apresentação, e "Entendi". */
async function entender(page: Page, id: string) {
  await expect(v(page, `[data-apresentacao="${id}"]`)).toBeVisible();
  await tocar(page, "[data-acao=entendi]");
  await expect(page.locator(`[data-apresentacao="${id}"]`)).toHaveCount(0);
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

  // Missão 1. A bolinha do Nônio se apresenta na primeira vez.
  await passo(page, "pedido");
  await entender(page, "bolha");
  // O nome formal no cabeçalho, e o livro abre a referência da missão.
  await expect(v(page, "[data-lugar]")).toContainText("Missão 1");
  await expect(v(page, "[data-lugar]")).toContainText("Divisão exata");
  await tocar(page, "[data-referencia-missao=botao]");
  await expect(v(page, "[data-referencia-missao=folha]")).toContainText("Dividendo");
  await expect(v(page, "[data-referencia-missao=folha] [data-pagina-manual='div.partilha']")).toHaveAttribute("data-restaurada", "nao");
  await tocar(page, "[data-referencia-missao=folha] button[aria-label='Fechar a referência']");
  await tocar(page, "[data-acao=seguir]");
  await passo(page, "palpite");
  await mais(page, "resposta", 4);
  await tocar(page, "[data-acao=responder]");

  // A mão: tocar numa saca e depois numa carroça, quatro vezes.
  await passo(page, "a-mao");
  await entender(page, "mao-livre");
  for (const bica of ["0", "1", "2", "3"]) {
    await tocar(page, "[data-peca='1/1']");
    await tocar(page, `[data-receptor='${bica}']`);
  }
  await expect(v(page, "[data-tela=missao][data-situacao=vencido]")).toBeVisible();
  await expect(v(page, "[data-tela=missao]")).toHaveAttribute("data-retorno", "acertou");
  // O rascunho a lápis: a rodada feita à mão vira uma linha só. O passo da mão não tem conta.
  await expect(v(page, "[data-rascunho]")).toContainText("À mão: 1 saca em cada carroça · 4 × 1 = 4");
  await expect(page.locator("[data-conta]")).toHaveCount(0);
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "repartir");
  // A bolinha no lugar da faixa. Sem chave no servidor, a janelinha abre sem o Pergunte por escrito.
  await expect(page.locator("[data-faixa-nonio]")).toHaveCount(0);
  await tocar(page, "[data-bolha-nonio]");
  await expect(v(page, "[data-janela-nonio] [data-acao=nonio]")).toBeVisible();
  await expect(page.locator("[data-conversa=secao]")).toHaveCount(0);
  await tocar(page, "[data-acao=fechar-janela]");
  await expect(page.locator("[data-janela-nonio]")).toHaveCount(0);

  // Um fechamento desigual: "ainda não", passageiro; o gesto seguinte volta a neutro.
  const tela = v(page, "[data-tela=missao]");
  await tocar(page, "[data-peca='1/1']");
  await tocar(page, "[data-receptor='0']");
  await expect(v(page, "[data-bica='0']")).toHaveAttribute("data-quantidade", "2");
  await tocar(page, "[data-acao=fechar]");
  await expect(tela).toHaveAttribute("data-retorno", "ainda-nao");
  await tocar(page, "[data-receptor='0']");
  await expect(v(page, "[data-bica='0']")).toHaveAttribute("data-quantidade", "1");
  await expect(tela).toHaveAttribute("data-retorno", "neutro");

  await mais(page, "lote", 7);
  await tocar(page, "[data-acao=repartir]");
  await expect(v(page, "[data-visor]")).toContainText("uma volta de 8 em 4 bicas pede 32");
  for (let i = 0; i < 3; i++) await tocar(page, '[data-seletor=lote] button[aria-label$="menos um"]');
  await tocar(page, "[data-acao=repartir]");
  await expect(v(page, "[data-bica='0']")).toHaveAttribute("data-quantidade", "6");
  // Depois de Repartir, a linha da volta no rascunho (a última linha é a leitura da máquina).
  await expect(v(page, "[data-visor]")).toContainText("Volta 1: 5 em cada · 4 × 5 = 20");

  // Fechar e reabrir no meio da missão: mesmo passo, máquina no mesmo estado.
  await page.reload();
  await passo(page, "repartir");
  await expect(v(page, "[data-bica='3']")).toHaveAttribute("data-quantidade", "6");

  await tocar(page, "[data-acao=fechar]");
  await expect(v(page, "[data-tela=missao][data-situacao=vencido]")).toBeVisible();
  await expect(v(page, "[data-tela=missao]")).toHaveAttribute("data-retorno", "acertou");
  // No acerto, a conta passada a caneta, com o nome dos termos.
  await expect(v(page, "[data-conta]")).toHaveAttribute("data-conta", "24 ÷ 4 = 6");
  await expect(v(page, "[data-conta]")).toContainText("dividendo");
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
  await entender(page, "bicas");
  await mais(page, "carga", 8);
  await tocar(page, '[data-seletor=bicas] button[aria-label$="menos um"]');
  await mais(page, "lote", 5);
  await tocar(page, "[data-acao=repartir]");
  await tocar(page, "[data-acao=fechar]");
  await tocar(page, "[data-acao=seguir]");

  await passo(page, "registro");
  await tocar(page, "[data-acao=guardar-pagina]");
  await expect(v(page, "[data-tela=fim]")).toBeVisible();

  // Uma página do Manual voltou: a da divisão exata. No Manual, ela está restaurada.
  await expect(v(page, "[data-manual-voltou]")).toHaveAttribute("data-manual-voltou", "div.partilha");
  await page.goto("/manual");
  await expect(v(page, "[data-manual] [data-pagina-manual='div.partilha']")).toHaveAttribute("data-restaurada", "sim");
  await expect(v(page, "[data-manual] [data-pagina-manual='div.resto']")).toHaveAttribute("data-restaurada", "nao");

  // O Caderno guarda a página, e ela volta depois de recarregar.
  await page.goto("/caderno");
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toBeVisible();
  await page.reload();
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toBeVisible();
  await expect(v(page, "[data-pagina='partilha.arco1.carga-igual']")).toContainText("24 sacas repartidas entre 4 carroças dão 6 em cada.");
});
