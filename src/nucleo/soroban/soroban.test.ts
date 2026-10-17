import { describe, expect, it } from "vitest";
import {
  aplicarGesto,
  aplicarMovimento,
  custo,
  distancia,
  gestoDoMovimento,
  inverso,
  ler,
  mostrar,
  sorobanVazio,
  type Gesto,
  type IndiceBaixo,
} from "./soroban";
import { planoDoLance, planoEhCurto, type Lance, type Marca } from "./plano";

describe("o soroban: mostrar, ler, tocar", () => {
  it("mostra e lê todo número de 0 a 99999", () => {
    for (let n = 0; n < 100000; n += 7) expect(ler(mostrar(5, n))).toBe(n);
    expect(ler(mostrar(5, 99999))).toBe(99999);
  });

  it("tocar numa conta de baixo afastada encosta ela e as de entre ela e a régua", () => {
    const s = mostrar(5, 1); // unidade: 1 de baixo
    const r = aplicarGesto(s, { haste: 4, conta: "baixo", indice: 3 });
    expect(ler(r.soroban)).toBe(4);
    expect(r.movimento).toEqual({ haste: 4, cinco: 0, uns: 3 });
  });

  it("tocar numa encostada afasta ela e as de entre ela e a moldura", () => {
    const s = mostrar(5, 4);
    const r = aplicarGesto(s, { haste: 4, conta: "baixo", indice: 1 });
    expect(ler(r.soroban)).toBe(1);
    expect(r.movimento).toEqual({ haste: 4, cinco: 0, uns: -3 });
  });

  it("a conta de cima alterna", () => {
    const um = aplicarGesto(sorobanVazio(), { haste: 3, conta: "cima" });
    expect(ler(um.soroban)).toBe(50);
    expect(ler(aplicarGesto(um.soroban, { haste: 3, conta: "cima" }).soroban)).toBe(0);
  });

  it("todo gesto mexe pelo menos uma conta, e o movimento devolve o gesto", () => {
    for (let n = 0; n < 1000; n++) {
      const s = mostrar(5, n);
      const gestos: Gesto[] = [{ haste: 4, conta: "cima" }, ...([0, 1, 2, 3] as IndiceBaixo[]).map((indice): Gesto => ({ haste: 4, conta: "baixo", indice }))];
      for (const g of gestos) {
        const r = aplicarGesto(s, g);
        expect(custo([r.movimento])).toBeGreaterThan(0);
        expect(distancia(s, r.soroban)).toBe(custo([r.movimento]));
        expect(aplicarGesto(s, gestoDoMovimento(s, r.movimento)).soroban).toEqual(r.soroban);
        expect(aplicarMovimento(r.soroban, inverso(r.movimento))).toEqual(s);
      }
    }
  });
});

describe("o plano do lance: a propriedade, à exaustão", () => {
  it("todo estado de três hastes e todo lance que cabe: o alvo vale certo e o custo do plano é a distância", () => {
    let conferidos = 0;
    for (let n = 0; n <= 999; n++) {
      const s = mostrar(5, n);
      for (const haste of [2, 3, 4]) {
        const p = 10 ** (4 - haste);
        for (let d = 1; d <= 9; d++) {
          for (const tipo of ["por", "tirar"] as const) {
            const esperado = tipo === "por" ? n + d * p : n - d * p;
            const plano = planoDoLance(s, { tipo, haste, d });
            if (esperado < 0 || esperado > 999) {
              // Fora do intervalo: ou não cabe, ou cabe e passa de 999 (vai para o milhar); nunca negativo.
              if (esperado < 0) expect(plano).toBeNull();
              continue;
            }
            expect(plano, `${n} ${tipo} ${d} na haste ${haste}`).not.toBeNull();
            if (!plano) continue;
            expect(ler(plano.alvo)).toBe(esperado);
            expect(custo(plano.movimentos)).toBe(distancia(s, plano.alvo));
            expect(planoEhCurto(s, plano)).toBe(true);
            // Cada movimento é um gesto só, e o caminho, feito gesto a gesto, chega ao alvo.
            let x = s;
            for (const m of plano.movimentos) {
              expect(m.cinco === 0 || m.uns === 0).toBe(true);
              x = aplicarGesto(x, gestoDoMovimento(x, m)).soroban;
            }
            expect(x).toEqual(plano.alvo);
            expect(plano.marcas.length).toBeGreaterThan(0);
            conferidos++;
          }
        }
      }
    }
    expect(conferidos).toBeGreaterThan(40000);
  });

  it("mostrar qualquer número a partir de qualquer estado também é o caminho curto", () => {
    for (let a = 0; a <= 999; a += 13) {
      for (let b = 0; b <= 999; b += 17) {
        const s = mostrar(5, a);
        const p = planoDoLance(s, { tipo: "mostrar", valor: b });
        expect(p && ler(p.alvo)).toBe(b);
        if (p) expect(custo(p.movimentos)).toBe(distancia(s, p.alvo));
      }
    }
  });
});

describe("casos conhecidos (lance na haste das unidades)", () => {
  const casos: [string, number, "por" | "tirar", number, Marca[]][] = [
    ["2 + 2", 2, "por", 2, ["direto"]],
    ["1 + 5", 1, "por", 5, ["direto"]],
    ["6 + 2", 6, "por", 2, ["direto"]],
    ["3 + 4", 3, "por", 4, ["complemento-5"]],
    ["4 + 1", 4, "por", 1, ["complemento-5"]],
    ["7 − 3", 7, "tirar", 3, ["complemento-5"]],
    ["5 − 1", 5, "tirar", 1, ["complemento-5"]],
    ["8 + 5", 8, "por", 5, ["complemento-10"]],
    ["9 + 3", 9, "por", 3, ["complemento-10"]],
    ["15 − 7", 15, "tirar", 7, ["complemento-10"]],
    ["6 + 7", 6, "por", 7, ["juntos"]],
    ["5 + 6", 5, "por", 6, ["juntos"]],
    ["12 − 7", 12, "tirar", 7, ["juntos"]],
    ["11 − 6", 11, "tirar", 6, ["juntos"]],
    ["45 + 7", 45, "por", 7, ["complemento-5", "juntos"]],
    ["99 + 1", 99, "por", 1, ["complemento-10", "cadeia"]],
    ["100 − 1", 100, "tirar", 1, ["complemento-10", "cadeia"]],
  ];
  for (const [nome, n, tipo, d, marcas] of casos) {
    it(`${nome}: ${marcas.join(" e ")}`, () => {
      const lance: Lance = { tipo, haste: 4, d };
      const p = planoDoLance(mostrar(5, n), lance);
      expect(p?.marcas).toEqual(marcas);
      expect(ler(p?.alvo ?? [])).toBe(tipo === "por" ? n + d : n - d);
    });
  }

  it("a decomposição da conta escrita", () => {
    const dec = (n: number, tipo: "por" | "tirar", d: number) => planoDoLance(mostrar(5, n), { tipo, haste: 4, d })?.decomposicao;
    expect(dec(3, "por", 4)).toEqual([5, -1]);
    expect(dec(7, "tirar", 3)).toEqual([-5, 2]);
    expect(dec(8, "por", 7)).toEqual([10, -3]);
    expect(dec(6, "por", 7)).toEqual([10, -5, 2]);
    expect(dec(12, "tirar", 7)).toEqual([-10, 5, -2]);
    expect(dec(15, "tirar", 7)).toEqual([-10, 3]);
    expect(dec(2, "por", 2)).toEqual([2]);
  });

  it("6 + 7 se ensina com a vizinha primeiro: 1 na dezena; o 5 e o 2 na unidade", () => {
    const p = planoDoLance(mostrar(5, 26), { tipo: "por", haste: 4, d: 7 });
    expect(p?.movimentos).toEqual([
      { haste: 3, cinco: 0, uns: 1 },
      { haste: 4, cinco: -1, uns: 0 },
      { haste: 4, cinco: 0, uns: 2 },
    ]);
  });

  it("3 + 4 se ensina descendo o 5 e tirando 1 de baixo", () => {
    expect(planoDoLance(mostrar(5, 3), { tipo: "por", haste: 4, d: 4 })?.movimentos).toEqual([
      { haste: 4, cinco: 1, uns: 0 },
      { haste: 4, cinco: 0, uns: -1 },
    ]);
  });
});
