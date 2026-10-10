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

  it("nenhum emoji no código, no conteúdo ou na interface", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    const infratores = todos
      .filter((f) => emoji.test(readFileSync(f, "utf8")))
      .map((f) => relative(RAIZ, f));
    expect(infratores).toEqual([]);
  });
});
