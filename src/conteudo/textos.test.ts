/**
 * A checagem de textos que vale para TODO conteúdo: percorre cada arquivo de src/conteudo, cada
 * valor exportado, até o fundo, e confere cada texto. Conteúdo novo é checado sem ninguém lembrar
 * de acrescentar teste.
 *
 * - nenhum emoji;
 * - nenhuma palavra proibida, como palavra inteira: "errado" e variações, "série", "ano escolar",
 *   "ranking", "cronômetro" ("nota" fica de fora: há "notação" e as notas da Dália; a regra
 *   "nunca nota de prova" está em docs/AUTORIA.md);
 * - recado (campo "recado", ou dentro de um RECADOS_*) com até 60 caracteres, com os números do
 *   momento no pior caso;
 * - instrução (campo "instrucao") com verbo no imperativo primeiro, até 80, terminando em ponto.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { problemasDaInstrucao } from "@/nucleo/missoes/instrucao";
import { LIMITE_RECADO } from "@/nucleo/tutor/recado";

interface Texto {
  readonly caminho: string;
  readonly texto: string;
  /** Chaves do caminho, da exportação até o texto. */
  readonly chaves: readonly string[];
}

function arquivos(dir: string): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho));
    else if (nome.endsWith(".ts") && !nome.endsWith(".test.ts")) saida.push(caminho);
  }
  return saida;
}

function percorrer(valor: unknown, chaves: string[], caminho: string, saida: Texto[], vistos: Set<unknown>): void {
  if (typeof valor === "string") {
    saida.push({ caminho, texto: valor, chaves });
    return;
  }
  if (typeof valor !== "object" || valor === null || vistos.has(valor)) return;
  vistos.add(valor);
  if (Array.isArray(valor)) {
    valor.forEach((x, i) => percorrer(x, [...chaves, String(i)], `${caminho}[${i}]`, saida, vistos));
    return;
  }
  for (const [k, x] of Object.entries(valor)) percorrer(x, [...chaves, k], `${caminho}.${k}`, saida, vistos);
}

async function todosOsTextos(): Promise<Texto[]> {
  const saida: Texto[] = [];
  for (const arquivo of arquivos(__dirname)) {
    const modulo: Record<string, unknown> = await import(arquivo);
    for (const [nome, valor] of Object.entries(modulo)) percorrer(valor, [nome], `${relative(__dirname, arquivo)}:${nome}`, saida, new Set());
  }
  return saida;
}

const PALAVRAS_PROIBIDAS = /(?<![\p{L}\p{N}])(errad[oa]s?|série|séries|ano escolar|anos escolares|ranking|cronômetro|cronometro)(?![\p{L}\p{N}])/iu;

/** O recado com os números do momento no pior caso: a haste mais longa, números de dois algarismos. */
function piorCaso(modelo: string): string {
  return modelo.replace(/\{haste\}/g, "das centenas").replace(/\{(\w+)\}/g, "99");
}

function ehRecado(t: Texto): boolean {
  return t.chaves.some((k) => /^recado$/i.test(k) || /^RECADOS_/.test(k));
}

describe("textos de todo o conteúdo", async () => {
  const textos = await todosOsTextos();

  it("percorre o conteúdo inteiro (e acha o que importa)", () => {
    expect(textos.length).toBeGreaterThan(500);
    expect(textos.some((t) => t.chaves.includes("instrucao"))).toBe(true);
    expect(textos.some(ehRecado)).toBe(true);
  });

  it("nenhum emoji", () => {
    const comEmoji = textos.filter((t) => /\p{Extended_Pictographic}/u.test(t.texto)).map((t) => t.caminho);
    expect(comEmoji).toEqual([]);
  });

  it("nenhuma palavra proibida (errado, série, ano escolar, ranking, cronômetro)", () => {
    const proibidas = textos.filter((t) => PALAVRAS_PROIBIDAS.test(t.texto)).map((t) => `${t.caminho}: "${t.texto}"`);
    expect(proibidas).toEqual([]);
  });

  it(`recado com até ${LIMITE_RECADO} caracteres, com os números do momento`, () => {
    const longos = textos.filter((t) => ehRecado(t) && piorCaso(t.texto).length > LIMITE_RECADO).map((t) => `${t.caminho}: "${t.texto}"`);
    expect(longos).toEqual([]);
  });

  it("toda instrução começa com verbo, cabe em 80 e termina em ponto", () => {
    const ruins = textos
      .filter((t) => t.chaves[t.chaves.length - 1] === "instrucao")
      .map((t) => ({ t, p: problemasDaInstrucao(t.texto) }))
      .filter((x) => x.p.length > 0)
      .map((x) => `${x.t.caminho}: "${x.t.texto}" (${x.p.join("; ")})`);
    expect(ruins).toEqual([]);
  });

  it("sem exclamação nas falas do Nônio e nos textos da bancada", () => {
    const exclamam = textos.filter((t) => /!/.test(t.texto) && !/^(FIM_RODADA)$/.test(t.chaves[0]) && t.chaves[0] !== "INSTRUCAO_SISTEMA").map((t) => `${t.caminho}: "${t.texto}"`);
    // "lapidada!" é a letra de mão da lapidação (FIM_RODADA.aMao): o único lugar com exclamação.
    expect(exclamam).toEqual([]);
  });
});
