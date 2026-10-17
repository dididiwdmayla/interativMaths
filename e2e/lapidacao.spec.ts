/**
 * A bancada de lapidação, pelos atributos: do Relicário à primeira rodada inteira (Ler e mostrar);
 * depois, com a joia talhada, o complemento de 5: um lance pelo caminho curto, outro com vai e
 * volta, e recarregar no meio de um lance volta na mesma operação, com o mesmo soroban.
 * O jogador de mentira (./soroban.ts) calcula o caminho curto com o próprio núcleo.
 */
import { expect, test, type Page } from "@playwright/test";
import { gestosDosMovimentos } from "../src/nucleo/soroban/jogador";
import { planoDoLance } from "../src/nucleo/soroban/plano";
import { mostrar } from "../src/nucleo/soroban/soroban";
import { digitar, fazerOperacao, fazerRodada, gestosDoLance, lanceCurto, operacaoDoAtributo, tocar, tocarGesto, v } from "./soroban";

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

/**
 * O alvo de toque: a caixa de uma conta de baixo (60 × 28 no desenho) no tamanho em que a tela a
 * mostra. O soroban nunca encolhe para caber; o que cede é o painel.
 */
async function caixaDaConta(page: Page): Promise<{ w: number; h: number }> {
  return v(page, "[data-soroban] svg").evaluate((svg) => {
    const r = svg.getBoundingClientRect();
    const escala = Math.min(r.width / 330, r.height / 304);
    return { w: 60 * escala, h: 28 * escala };
  });
}

for (const tamanho of [
  { width: 390, height: 844 },
  { width: 360, height: 780 },
]) {
  test.describe(`alvo de toque em ${tamanho.width} × ${tamanho.height}`, () => {
    test.use({ viewport: tamanho });
    const minimo = { w: (58 * tamanho.width) / 390, h: (27 * tamanho.width) / 390 };

    test("sozinho e os dois momentos da sombra", async ({ page }) => {
      await saltar(page, "abaco-talhado");
      await page.goto("/relicario/abaco");
      await tocar(page, "[data-acao=comecar]");
      await entenderSoroban(page);
      const tela = v(page, OPERACAO);
      for (let guarda = 0; guarda < 6 && (await tela.getAttribute("data-nivel")) !== "sozinho"; guarda++) {
        await fazerOperacao(page);
        await tocar(page, "[data-acao=proxima]");
      }
      await expect(tela).toHaveAttribute("data-nivel", "sozinho");
      const sozinho = await caixaDaConta(page);
      expect(sozinho.w).toBeGreaterThanOrEqual(minimo.w);
      expect(sozinho.h).toBeGreaterThanOrEqual(minimo.h);
      const alvo = await v(page, "[data-soroban] [data-haste='4'] [data-conta='baixo-3'] rect").boundingBox();
      expect(alvo?.width ?? 0).toBeGreaterThanOrEqual(minimo.w);
      expect(alvo?.height ?? 0).toBeGreaterThanOrEqual(minimo.h);

      // A sombra: mãos, dizer, conferir.
      await saltar(page, "abaco-lapidado");
      await page.goto("/relicario/abaco");
      await tocar(page, "[data-acao=comecar]");
      await expect(tela).toHaveAttribute("data-modo", "sombra");
      await expect(tela).toHaveAttribute("data-sombra", "maos");
      const maos = await caixaDaConta(page);
      expect(maos.w).toBeGreaterThanOrEqual(minimo.w);
      expect(maos.h).toBeGreaterThanOrEqual(minimo.h);
      const op = operacaoDoAtributo((await tela.getAttribute("data-operacao")) ?? "");
      const r = op.tipo === "somar" ? op.a + op.b : op.tipo === "subtrair" ? op.a - op.b : 0;
      const agora = mostrar(5, Number(await v(page, "[data-soroban]").getAttribute("data-valor")));
      const plano = planoDoLance(agora, { tipo: "mostrar", valor: r });
      for (const g of gestosDosMovimentos(agora, plano?.movimentos ?? [])) await tocarGesto(page, g);
      await expect(v(page, "[data-soroban]")).toHaveAttribute("data-valor", String(r));

      await tocar(page, "[data-acao=dizer]");
      await expect(tela).toHaveAttribute("data-sombra", "dizer");
      const dizer = await caixaDaConta(page);
      expect(dizer.w).toBeGreaterThanOrEqual(minimo.w);
      expect(dizer.h).toBeGreaterThanOrEqual(minimo.h);
      // O teclado inteiro na tela, sem rolar.
      const conferir = await v(page, "[data-teclado] [data-acao=conferir]").boundingBox();
      const extra = await v(page, "[data-teclado] [data-tecla=extra]").boundingBox();
      expect((extra?.y ?? 0) + (extra?.height ?? 0)).toBeLessThanOrEqual(tamanho.height);
      expect(conferir).not.toBeNull();

      // Tocar no soroban volta às mãos; o número digitado fica guardado.
      await tocar(page, "[data-teclado] [data-tecla='1']");
      await tocar(page, "[data-acao=voltar-as-maos]");
      await expect(tela).toHaveAttribute("data-sombra", "maos");
      await tocar(page, "[data-acao=dizer]");
      await expect(v(page, "[data-teclado] [data-valor-digitado]")).toHaveAttribute("data-valor-digitado", "1");
      await tocar(page, "[data-teclado] [data-tecla=apagar]");
      await digitar(page, r);
      await expect(tela).toHaveAttribute("data-situacao", "feito");
      await expect(tela).toHaveAttribute("data-retorno", "acertou");
    });
  });
}
