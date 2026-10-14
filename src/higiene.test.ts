/**
 * Regras de higiene que valem para todo o código: cor literal só em tokens.css; zero emoji.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = join(__dirname);

function arquivos(dir: string): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho));
    else if (/\.(ts|tsx|css|md|json)$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

const todos = arquivos(RAIZ).filter((f) => !f.endsWith("higiene.test.ts"));

describe("higiene", () => {
  it("cor literal só em src/tema/tokens.css", () => {
    const corLiteral = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|\b(rgb|rgba|hsl|hsla|oklch)\(/;
    const infratores = todos
      .filter((f) => !f.endsWith(join("tema", "tokens.css")))
      .filter((f) => corLiteral.test(readFileSync(f, "utf8")))
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });

  it("borda, traço e sombra não usam --tinta: são --contorno e --sombra (a tinta é só texto)", () => {
    const papelErrado = [
      /box-shadow:[^;]*var\(--tinta\)/,
      /^\s*border(-[a-z]+)*:[^;]*var\(--tinta\)/m,
      /\bstroke(=|:\s*|=\{)["'`]?var\(--tinta\)/,
      /\bborder-tinta\b/,
      /shadow-\[[^\]]*--tinta[^\]]*\]/,
      /\boutline:[^;]*var\(--tinta\)/,
    ];
    const infratores = todos
      .filter((f) => /\.(ts|tsx|css)$/.test(f))
      .filter((f) => {
        const texto = readFileSync(f, "utf8");
        return papelErrado.some((r) => r.test(texto));
      })
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });

  it("nenhum emoji no código, no conteúdo ou na interface", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    const infratores = todos
      .filter((f) => emoji.test(readFileSync(f, "utf8")))
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });

  it("nenhuma variável NEXT_PUBLIC_: segredo nenhum vai para o navegador", () => {
    const infratores = todos.filter((f) => /NEXT_PUBLIC_/.test(readFileSync(f, "utf8"))).map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });

  it("o código de servidor nunca é importado por componente de cliente", () => {
    const infratores = todos
      .filter((f) => /\.(ts|tsx)$/.test(f) && !relative(RAIZ, f).startsWith("servidor"))
      .filter((f) => {
        const texto = readFileSync(f, "utf8");
        const cliente = /^["']use client["']/m.test(texto) || relative(RAIZ, f).split(/[\\/]/)[0] === "componentes";
        return cliente && /from ["']@\/servidor/.test(texto);
      })
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });

  it("conteúdo é só dado: nada de função nem JSX em src/conteudo", () => {
    const infratores = todos
      .filter((f) => relative(RAIZ, f).split(/[\\/]/)[0] === "conteudo")
      .filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))
      .filter((f) => /=>|\bfunction\b|<[A-Z][A-Za-z]*[\s/>]/.test(readFileSync(f, "utf8")))
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });
});
