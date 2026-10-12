import { describe, expect, it } from "vitest";
import config, { FRAME_ANCESTORS_DEGUSTACAO } from "../../../next.config";
import { ORIGENS_DA_RECEPCAO, origemPermitida } from "./recepcao";

const PROPRIA = "https://matematica.interativai.com";

describe("quem pode embutir e ouvir a degustação", () => {
  it("a recepção, com e sem www, e a própria origem", () => {
    expect(origemPermitida("https://interativai.com", PROPRIA)).toBe(true);
    expect(origemPermitida("https://www.interativai.com", PROPRIA)).toBe(true);
    expect(origemPermitida(PROPRIA, PROPRIA)).toBe(true);
  });

  it("as prévias da Vercel", () => {
    expect(origemPermitida("https://interativai-git-ilhota-will.vercel.app", PROPRIA)).toBe(true);
    expect(origemPermitida("https://interativmaths.vercel.app", PROPRIA)).toBe(true);
  });

  it("ninguém mais", () => {
    for (const origem of [
      "https://malicioso.example",
      "http://interativai.com",
      "https://interativai.com.malicioso.example",
      "https://fakeinterativai.com",
      "https://vercel.app.malicioso.example",
      "https://vercel.app",
      "http://previa.vercel.app",
      "null",
      "",
    ]) {
      expect(origemPermitida(origem, PROPRIA), origem).toBe(false);
    }
  });

  it("o frame-ancestors de /degustacao tem a mesma lista", async () => {
    const regras = (await config.headers?.()) ?? [];
    const regra = regras.find((r) => r.source === "/degustacao");
    expect(regra?.headers).toEqual([{ key: "Content-Security-Policy", value: FRAME_ANCESTORS_DEGUSTACAO }]);
    const fontes = FRAME_ANCESTORS_DEGUSTACAO.split(" ").slice(1);
    expect(fontes).toEqual(["'self'", ...ORIGENS_DA_RECEPCAO, "https://*.vercel.app"]);
    expect(regras.flatMap((r) => r.headers.map((h) => h.key.toLowerCase()))).not.toContain("x-frame-options");
  });
});
