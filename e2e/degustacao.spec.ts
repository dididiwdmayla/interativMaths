/**
 * A degustação (/degustacao): jogada do começo ao "Quero continuar" nos três layouts, sozinha; e
 * embutida num iframe, como a recepção do interativAI faz. As origens de fora (interativai.com,
 * matematica.interativai.com, uma origem não permitida) são servidas pelo próprio teste: a do jogo
 * repassa o build local, com os cabeçalhos dele.
 * Espera estado (data-tela, data-passo, data-quantidade), nunca tempo.
 */
import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

type Alvo = { locator(seletor: string): Locator };

const ACESSO = "https://interativai.com/acesso?produto=matematica";
const ORIGEM_JOGO = "https://matematica.interativai.com";

/** Com Cache Components, telas visitadas ficam escondidas no DOM: só o visível conta. */
const v = (alvo: Alvo, seletor: string) => alvo.locator(seletor).locator("visible=true").first();
const tocar = (alvo: Alvo, seletor: string) => v(alvo, seletor).click();
const passo = (alvo: Alvo, id: string) => expect(v(alvo, `[data-tela=missao][data-passo="${id}"]`)).toBeVisible();
const ficha = (alvo: Alvo, n: number) => tocar(alvo, `[data-ficha='${n}']`);

/** A primeira vez com uma ferramenta: a apresentação do Nônio, e "Entendi". */
async function entender(alvo: Alvo, id: string) {
  await expect(v(alvo, `[data-apresentacao="${id}"]`)).toBeVisible();
  await tocar(alvo, "[data-acao=entendi]");
  await expect(alvo.locator(`[data-apresentacao="${id}"]`)).toHaveCount(0);
}

/** Toca na peça da esteira e corta pelo menu que abre sobre ela. */
async function cortar(alvo: Alvo, peca: string, partes: number, todas = false) {
  await tocar(alvo, `[data-peca='${peca}']`);
  await expect(v(alvo, "[data-menu-corte]")).toBeVisible();
  if (todas) await tocar(alvo, "[data-menu-corte] [data-cortar=todas]");
  await tocar(alvo, `[data-menu-corte] [data-cortar-em='${partes}']`);
}

/** A ilhota inteira, do pedido da Dália à tela final, com o Nônio flutuante e a mão livre. */
async function jogar(alvo: Alvo) {
  await passo(alvo, "chegada");
  await entender(alvo, "bolha");
  await tocar(alvo, "[data-acao=seguir]");

  // 5 broas, 4 mesas: uma para cada, e a que sobra, cortada em 4 pelo menu sobre ela.
  await passo(alvo, "cinco-broas");
  await entender(alvo, "mao-livre");
  // O Nônio é uma bolinha no canto da máquina; tocar abre a janelinha com o Me ajuda.
  // A degustação fica fora do catálogo: sem o Pergunte por escrito, com ou sem chave no servidor.
  await tocar(alvo, "[data-bolha-nonio]");
  await expect(v(alvo, "[data-janela-nonio]")).toBeVisible();
  await expect(v(alvo, "[data-janela-nonio] [data-acao=nonio]")).toBeVisible();
  await expect(alvo.locator("[data-conversa=secao]")).toHaveCount(0);
  await tocar(alvo, "[data-acao=fechar-janela]");
  await expect(alvo.locator("[data-janela-nonio]")).toHaveCount(0);
  await tocar(alvo, "[data-acao=repartir]");
  await expect(v(alvo, "[data-bica='0']")).toHaveAttribute("data-quantidade", "1");
  await expect(v(alvo, "[data-gesto]")).toContainText("toque na peça que sobrou");
  // O recado ao lado da bolinha: a primeira frase da fala, curta.
  await expect(v(alvo, "[data-recado]")).toContainText("Sobrou uma broa.");
  await cortar(alvo, "1/1", 4);
  await tocar(alvo, "[data-acao=repartir]");
  await tocar(alvo, "[data-acao=fechar]");
  await expect(v(alvo, "[data-tela=missao][data-situacao=vencido]")).toHaveAttribute("data-retorno", "acertou");
  await tocar(alvo, "[data-acao=seguir]");

  await passo(alvo, "palpite");
  await expect(v(alvo, "[data-gesto]")).toContainText("toque numa das opções");
  await tocar(alvo, "[data-opcao=uma]");

  // 3 broas, 4 mesas: todas em 4, três pedaços para cada.
  await passo(alvo, "tres-broas");
  await entender(alvo, "menu-corte");
  await cortar(alvo, "1/1", 4, true);
  await tocar(alvo, '[data-seletor=lote] button[aria-label$="mais um"]');
  await tocar(alvo, '[data-seletor=lote] button[aria-label$="mais um"]');
  await tocar(alvo, "[data-acao=repartir]");
  await tocar(alvo, "[data-acao=fechar]");
  await expect(v(alvo, "[data-bica='3']")).toHaveAttribute("data-quantidade", "3/4");
  await expect(v(alvo, "[data-tela=missao]")).toHaveAttribute("data-retorno", "acertou");
  await expect(v(alvo, "[data-painel=vencido]")).toContainText("Seu palpite: uma broa");
  await tocar(alvo, "[data-acao=seguir]");

  // Descoberta: 2 broas, 3 mesas; a resposta com fichas, e a máquina confere.
  await passo(alvo, "duas-tres");
  await entender(alvo, "fichas");
  await ficha(alvo, 2);
  await ficha(alvo, 3);
  await tocar(alvo, "[data-acao=responder]");
  await expect(v(alvo, "[data-resultado-previsao=certa]")).toBeVisible();
  await expect(v(alvo, "[data-bica='2']")).toHaveAttribute("data-quantidade", "2/3");
  await tocar(alvo, "[data-acao=seguir]");

  await passo(alvo, "frase");
  for (const [cota, lacuna] of [
    ["4", "a"],
    ["1/4", "b"],
    ["3", "c"],
    ["3/4", "d"],
  ]) {
    await tocar(alvo, `[data-cota='${cota}']`);
    await tocar(alvo, `[data-lacuna='${lacuna}']`);
  }
  await tocar(alvo, "[data-acao=conferir-frase]");
  await tocar(alvo, "[data-acao=seguir]");

  await passo(alvo, "notacao");
  await tocar(alvo, "[data-acao=comprimir]");
  await expect(v(alvo, "[data-compressao=feita]")).toBeVisible();
  await tocar(alvo, "[data-acao=seguir]");

  // Aplicação, sem a máquina: 5 ÷ 8.
  await passo(alvo, "sem-maquina");
  await ficha(alvo, 5);
  await ficha(alvo, 8);
  await tocar(alvo, "[data-acao=responder]");
  await expect(v(alvo, "[data-resultado-previsao=certa]")).toBeVisible();
  await expect(v(alvo, "[data-bica='7']")).toHaveAttribute("data-quantidade", "5/8");
  await tocar(alvo, "[data-acao=seguir]");

  // O fim: comemoração, trailer, Quero continuar.
  await expect(v(alvo, "[data-tela=degustacao-fim]")).toBeVisible();
  await expect(v(alvo, "[data-comemoracao=feita]")).toBeVisible();
  await expect(v(alvo, "[data-descoberta]")).toContainText("3");
  await expect(v(alvo, "[data-trailer]")).toBeVisible();
  await tocar(alvo, "[data-cena-trailer=lapis]");
  await expect(v(alvo, "[data-trailer]")).toHaveAttribute("data-cena", "lapis");
  await expect(v(alvo, "[data-acao=quero-continuar]")).toBeVisible();
}

/** Erros e avisos do console, de todos os quadros da página. */
function ouvirConsole(page: Page): string[] {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  return erros;
}

const LAYOUTS = [
  { nome: "retrato 390×844", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  { nome: "paisagem 844×390", use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true } },
  { nome: "computador 1440×900", use: { viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false } },
] as const;

for (const layout of LAYOUTS) {
  test.describe(`degustação sozinha, ${layout.nome}`, () => {
    test.use(layout.use);

    test("do começo ao Quero continuar, sem erro no console", async ({ page, context }) => {
      const erros = ouvirConsole(page);
      await context.route("https://interativai.com/**", (r) => r.fulfill({ contentType: "text/html", body: "<!doctype html><title>acesso</title><p>acesso</p>" }));
      await page.goto("/degustacao");
      await expect(page.locator("[data-degustacao][data-embutida=nao]")).toBeAttached();
      await expect(v(page, "[data-acao=voltar]")).toBeVisible();
      await jogar(page);
      await tocar(page, "[data-acao=quero-continuar]");
      await expect(page).toHaveURL(ACESSO);
      expect(erros).toEqual([]);
    });
  });
}

test.describe("degustação num aparelho escuro", () => {
  test.use({ colorScheme: "dark" });

  test("segue o aparelho, sem botão, e aceita ?tema= da recepção", async ({ page }) => {
    await page.goto("/degustacao");
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
    await expect(page.locator("[data-botao-tema]")).toHaveCount(0);
    await page.goto("/degustacao?tema=claro");
    await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");
  });
});

/* ---------- Embutida ---------- */

declare global {
  interface Window {
    __mensagens: { origem: string; tipo: string }[];
  }
}

/** Uma página-mãe de teste com o iframe da degustação, que anota toda mensagem recebida. */
const PAGINA_MAE = `<!doctype html><html><head><meta name="viewport" content="width=device-width"><title>mãe</title></head>
<body style="margin:0"><iframe id="ilhota" src="${ORIGEM_JOGO}/degustacao?embed=1" title="Ilhota" style="display:block;width:100vw;height:100vh;border:0"></iframe>
<script>window.__mensagens=[];addEventListener("message",function(e){window.__mensagens.push({origem:e.origin,tipo:e.data&&e.data.fonte==="interativmaths"?e.data.tipo:"outra"})});</script></body></html>`;

/** Serve as origens de fora: as mães de teste, e o jogo (o build local) em matematica.interativai.com. */
async function montarOrigens(context: BrowserContext, baseURL: string, opcoes: { semCsp?: boolean } = {}) {
  for (const mae of ["https://interativai.com", "https://malicioso.example"]) {
    await context.route(`${mae}/**`, (r) => r.fulfill({ contentType: "text/html", body: PAGINA_MAE }));
  }
  await context.route(`${ORIGEM_JOGO}/**`, async (r) => {
    const resposta = await r.fetch({ url: r.request().url().replace(ORIGEM_JOGO, baseURL) });
    const cabecalhos = { ...resposta.headers() };
    if (opcoes.semCsp) delete cabecalhos["content-security-policy"];
    await r.fulfill({ response: resposta, headers: cabecalhos });
  });
}

const mensagens = (page: Page) => page.evaluate(() => window.__mensagens);

test.describe("degustação embutida", () => {
  test("na recepção: pronto, concluiu, quero-continuar e fechar, só para a origem dela, com o armazenamento bloqueado", async ({ page, context, baseURL }) => {
    const erros = ouvirConsole(page);
    await montarOrigens(context, baseURL ?? "");
    // O navegador bloqueia o armazenamento dentro do iframe: a ilhota funciona assim mesmo.
    await context.addInitScript(() => {
      if (window.top === window) return;
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new DOMException("O armazenamento está bloqueado.", "SecurityError");
        },
      });
    });
    await page.goto("https://interativai.com/ilhota-de-teste");
    const ilhota = page.frameLocator("#ilhota");

    await expect.poll(async () => (await mensagens(page)).map((m) => m.tipo)).toContain("pronto");
    await expect(ilhota.locator("[data-degustacao]")).toHaveAttribute("data-embutida", "sim");
    await expect(ilhota.locator("[data-degustacao]")).toHaveAttribute("data-recepcao", "sim");
    await expect(ilhota.locator("[data-acao=voltar]")).toHaveCount(0);
    // Sem allow="fullscreen" no iframe, a tela cheia não existe: o botão não aparece.
    await expect(ilhota.locator("[data-tela-cheia]")).toHaveCount(0);

    await jogar(ilhota);
    await expect.poll(async () => (await mensagens(page)).map((m) => m.tipo)).toContain("concluiu");

    await tocar(ilhota, "[data-acao=quero-continuar]");
    await expect.poll(async () => (await mensagens(page)).map((m) => m.tipo)).toContain("quero-continuar");
    // A recepção é quem leva ao acesso: a ilhota fica onde está.
    await expect(v(ilhota, "[data-tela=degustacao-fim]")).toBeVisible();

    await tocar(ilhota, "[data-acao=fechar-ilhota]");
    await expect.poll(async () => (await mensagens(page)).map((m) => m.tipo)).toContain("fechar");

    const todas = await mensagens(page);
    expect(todas.map((m) => m.tipo)).toEqual(["pronto", "concluiu", "quero-continuar", "fechar"]);
    expect(new Set(todas.map((m) => m.origem))).toEqual(new Set([ORIGEM_JOGO]));
    expect(erros).toEqual([]);
  });

  test("numa origem não permitida, o navegador não deixa embutir", async ({ page, context, baseURL }) => {
    await montarOrigens(context, baseURL ?? "");
    const recusa = page.waitForEvent("console", (m) => m.type() === "error" && m.text().includes("frame-ancestors"));
    await page.goto("https://malicioso.example/ilhota-de-teste");
    await recusa;
    await expect(page.frameLocator("#ilhota").locator("[data-degustacao]")).toHaveCount(0);
    expect(await mensagens(page)).toEqual([]);
  });

  test("numa origem não permitida, mesmo sem o frame-ancestors, nenhuma mensagem sai", async ({ page, context, baseURL }) => {
    await montarOrigens(context, baseURL ?? "", { semCsp: true });
    await page.goto("https://malicioso.example/ilhota-de-teste");
    const ilhota = page.frameLocator("#ilhota");
    await expect(ilhota.locator("[data-degustacao]")).toHaveAttribute("data-recepcao", "nao");
    await expect(ilhota.locator("[data-degustacao]")).toHaveAttribute("data-embutida", "sim");
    await jogar(ilhota);
    expect(await mensagens(page)).toEqual([]);
  });
});
