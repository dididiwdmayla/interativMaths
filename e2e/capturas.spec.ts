/**
 * As capturas da v0.5 em docs/capturas/v0.5/ (no máximo oito). Não roda no percurso de sempre:
 * `CAPTURAS=1 npx playwright test e2e/capturas.spec.ts` (contra o build de produção).
 * Os estados vêm dos saltos do /lab/progresso, montados rodando o motor como um jogador.
 */
import { expect, test, type Page } from "@playwright/test";
import { fazerRodada, lanceCurto, tocar, v } from "./soroban";

const PASTA = "docs/capturas/v0.5";
const OPERACAO = "[data-tela=lapidacao][data-fase=operacao]";

test.skip(!process.env.CAPTURAS, "só com CAPTURAS=1");
test.use({ deviceScaleFactor: 2 });

async function saltar(page: Page, acao: string) {
  await page.goto("/lab/progresso");
  await tocar(page, `[data-acao=${acao}]`);
  await expect(v(page, "[data-lab-joia=abaco]")).toBeVisible();
}

async function entender(page: Page) {
  await expect(v(page, "[data-apresentacao]")).toBeVisible();
  await tocar(page, "[data-apresentacao] [data-acao=entendi]");
  await expect(page.locator("[data-apresentacao]")).toHaveCount(0);
}

/** Espera o recado entrar e as transições assentarem. */
async function assentar(page: Page, ms = 900) {
  await page.waitForTimeout(ms);
}

test("o Relicário vivo, a abertura, o lance guiado, o acerto e o caminho junto", async ({ page }) => {
  await saltar(page, "abaco-cinco-firmando");
  await page.goto("/relicario");
  await expect(v(page, "[data-relicario=vivo]")).toBeVisible();
  await assentar(page);
  await page.screenshot({ path: `${PASTA}/01-relicario-vivo.png` });

  await saltar(page, "abaco-talhado");
  await page.goto("/relicario/abaco");
  await expect(v(page, "[data-tela=lapidacao][data-fase=abertura]")).toHaveAttribute("data-nova", "sim");
  await assentar(page);
  await page.screenshot({ path: `${PASTA}/02-abertura-tecnica-nova.png` });

  await tocar(page, "[data-acao=comecar]");
  await entender(page);
  await lanceCurto(page);
  // O retorno do lance, e depois o caminho do próximo na voz do Nônio.
  await assentar(page, 3400);
  await page.screenshot({ path: `${PASTA}/03-lance-guiado.png` });

  await lanceCurto(page);
  await expect(v(page, OPERACAO)).toHaveAttribute("data-situacao", "feito");
  await assentar(page);
  await page.screenshot({ path: `${PASTA}/04-acerto-com-a-conta.png` });

  await tocar(page, "[data-acao=proxima]");
  await lanceCurto(page);
  await tocar(page, "[data-bolha-nonio]");
  for (let i = 0; i < 3; i++) await tocar(page, "[data-janela-nonio] [data-acao=nonio]");
  await tocar(page, "[data-janela-nonio] [data-acao=junto]");
  await expect(v(page, OPERACAO)).toHaveAttribute("data-ajuda", "4");
  await assentar(page);
  await page.screenshot({ path: `${PASTA}/05-caminho-junto.png` });
});

test("a lapidação e a sombra", async ({ page }) => {
  await saltar(page, "abaco-quase-lapidado");
  await page.goto("/relicario/abaco");
  await tocar(page, "[data-acao=comecar]");
  const apresentacao = page.locator("[data-apresentacao] [data-acao=entendi]").locator("visible=true");
  if (await apresentacao.count()) await apresentacao.first().click();
  await fazerRodada(page);
  await expect(v(page, "[data-tela=lapidacao][data-fase=fim]")).toHaveAttribute("data-lapidacao", "lapidada");
  await assentar(page, 1600);
  await page.screenshot({ path: `${PASTA}/06-lapidacao.png` });

  await saltar(page, "abaco-lapidado");
  await page.goto("/relicario/abaco");
  await tocar(page, "[data-acao=comecar]");
  await expect(v(page, OPERACAO)).toHaveAttribute("data-modo", "sombra");
  // A primeira sombra, no momento "dizer": o teclado no lugar do painel, o número na caixa "Ficou".
  const tela = v(page, OPERACAO);
  await tocar(page, "[data-acao=dizer]");
  const op = ((await tela.getAttribute("data-operacao")) ?? "").split(":");
  const r = op[0] === "somar" ? Number(op[1]) + Number(op[2]) : Number(op[1]) - Number(op[2]);
  for (const d of String(r)) await tocar(page, `[data-teclado] [data-tecla='${d}']`);
  await assentar(page);
  await page.screenshot({ path: `${PASTA}/07-sombra.png` });
});

test.describe("computador", () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
  test("a bancada em 1440 × 900", async ({ page }) => {
    await saltar(page, "abaco-talhado");
    await page.goto("/relicario/abaco");
    await tocar(page, "[data-acao=comecar]");
    await entender(page);
    await lanceCurto(page);
    await assentar(page, 3400);
    await page.screenshot({ path: `${PASTA}/08-computador.png` });
  });
});
