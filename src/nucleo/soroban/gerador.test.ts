import { describe, expect, it } from "vitest";
import { algarismosDe, operacaoValida, parciaisDoDitado, resultadoDe } from "./operacao";
import { gerarRodada, marcasDaOperacao, posicoesIntercaladas, problemasDaOperacao, type PedidoRodada } from "./gerador";
import { ORDEM_TECNICAS_SOROBAN, TECNICAS_SOROBAN as T, type TecnicaSoroban } from "./tecnicas";

const ESTAGIOS: PedidoRodada["estagios"] = {
  [T.ler]: 1,
  [T.diretas]: 1,
  [T.complemento5]: 2,
  [T.complemento10]: 2,
  [T.juntos]: 2,
  [T.imaginado]: 3,
};

/** O pedido da rodada de uma técnica, com as anteriores já vistas. */
function pedido(foco: TecnicaSoroban, semente: number, rodadas: Partial<Record<TecnicaSoroban, number>> = {}): PedidoRodada {
  const vistas = ORDEM_TECNICAS_SOROBAN.slice(0, ORDEM_TECNICAS_SOROBAN.indexOf(foco) + 1);
  return { semente, tipo: "tecnica", foco, faltam: [], vistas, rodadas, estagios: ESTAGIOS, operacoes: 6, intercaladas: 2 };
}

const SEMENTES = Array.from({ length: 200 }, (_, i) => 1 + i * 7919);

describe("o gerador de rodadas, 200 sementes por foco", () => {
  for (const foco of ORDEM_TECNICAS_SOROBAN) {
    for (const primeira of [true, false]) {
      it(`${foco}, ${primeira ? "primeira rodada" : "rodadas seguintes"}`, () => {
        for (const semente of SEMENTES) {
          const rodadas = primeira ? {} : { [foco]: foco === T.imaginado ? (semente % 4) : 1 };
          const p = pedido(foco, semente, rodadas);
          const itens = gerarRodada(p);
          expect(itens).toHaveLength(6);
          // Mesma semente, mesma rodada.
          expect(gerarRodada(p)).toEqual(itens);
          const vistos = new Set<string>();
          for (const it of itens) {
            const op = it.operacao;
            expect(operacaoValida(op), JSON.stringify(op)).toBe(true);
            expect(resultadoDe(op)).toBeGreaterThanOrEqual(0);
            expect(resultadoDe(op)).toBeLessThanOrEqual(999);
            expect(problemasDaOperacao(op, it.tecnica as TecnicaSoroban, p.vistas), `${semente}: ${JSON.stringify(op)} (${it.tecnica})`).toEqual([]);
            vistos.add(JSON.stringify(op));
          }
          expect(vistos.size).toBe(6);
          const doFoco = itens.filter((x) => x.tecnica === foco);
          if (foco === T.ler) {
            // Mostrar e ler, alternadas; até 99 na primeira rodada.
            const tipos = doFoco.map((x) => x.operacao.tipo);
            expect(tipos).toEqual(["mostrar", "ler", "mostrar", "ler", "mostrar", "ler"]);
            if (primeira) for (const x of doFoco) expect(resultadoDe(x.operacao)).toBeLessThanOrEqual(99);
          } else if (foco === T.imaginado) {
            const nivel = itens[0].nivel;
            expect(itens.every((x) => x.nivel === nivel)).toBe(true);
            for (const x of itens) {
              const op = x.operacao;
              if (nivel === "ditado") {
                expect(op.tipo).toBe("ditado");
                if (op.tipo === "ditado") {
                  expect(op.numeros.length === 3 || op.numeros.length === 4).toBe(true);
                  expect(parciaisDoDitado(op.numeros).every((t) => t >= 0)).toBe(true);
                  expect(op.numeros.some((n) => n < 0) && op.numeros.slice(1).some((n) => n > 0)).toBe(true);
                }
              } else {
                expect(op.tipo === "somar" || op.tipo === "subtrair").toBe(true);
                if (op.tipo === "somar" || op.tipo === "subtrair") {
                  expect(algarismosDe(op.a)).toHaveLength(2);
                  expect(algarismosDe(op.b)).toHaveLength(2);
                }
              }
            }
          } else {
            // Somas e subtrações, metade de cada; números do tamanho da rodada.
            const subtracoes = doFoco.filter((x) => x.operacao.tipo === "subtrair").length;
            expect(Math.abs(subtracoes - (doFoco.length - subtracoes))).toBeLessThanOrEqual(1);
            for (const x of doFoco) {
              const op = x.operacao;
              if (op.tipo !== "somar" && op.tipo !== "subtrair") throw new Error("operação inesperada");
              if (foco === T.diretas) {
                expect(resultadoDe(op)).toBeLessThanOrEqual(99);
                expect([...marcasDaOperacao(op)]).toEqual(["direto"]);
              } else if (primeira) {
                expect(algarismosDe(op.b)).toHaveLength(1);
                expect(op.a).toBeLessThanOrEqual(99);
              } else {
                expect(algarismosDe(op.a)).toHaveLength(2);
                expect(algarismosDe(op.b)).toHaveLength(2);
              }
              if (foco === T.complemento10) {
                expect(marcasDaOperacao(op).has("juntos")).toBe(false);
                expect(marcasDaOperacao(op).has("cadeia")).toBe(false);
              }
            }
          }
          // A partir da segunda técnica vista, duas intercaladas, de técnicas já vistas.
          const intercaladas = itens.filter((x) => x.tecnica !== foco);
          if (foco === T.ler || foco === T.imaginado) expect(intercaladas).toHaveLength(0);
          else {
            expect(intercaladas).toHaveLength(2);
            for (const x of intercaladas) expect(p.vistas).toContain(x.tecnica);
          }
          // Os níveis: na primeira, duas com o Nônio; depois, sozinho ou sem os algarismos.
          if (foco !== T.imaginado) {
            const niveis = itens.map((x) => x.nivel);
            if (primeira) expect(niveis).toEqual(["com-nonio", "com-nonio", "sozinho", "sozinho", "sozinho", "sozinho"]);
            else expect(new Set(niveis)).toEqual(new Set([ESTAGIOS[foco] === 1 ? "sozinho" : "sem-algarismos"]));
          }
        }
      });
    }
  }

  it("o imaginado anda por rodada: sombra, de cabeça, ditado de um algarismo, ditado de dois", () => {
    const nivel = (n: number) => gerarRodada(pedido(T.imaginado, 5, { [T.imaginado]: n }))[0];
    expect(nivel(0).nivel).toBe("sombra");
    expect(nivel(1).nivel).toBe("de-cabeca");
    expect(nivel(2).nivel).toBe("ditado");
    const d1 = nivel(2).operacao;
    const d2 = nivel(3).operacao;
    if (d1.tipo !== "ditado" || d2.tipo !== "ditado") throw new Error("ditado esperado");
    expect(d1.numeros.every((n) => Math.abs(n) <= 9)).toBe(true);
    expect(d2.numeros.every((n) => Math.abs(n) >= 10)).toBe(true);
  });

  it("revisão: as técnicas que faltam, pelo menos duas operações de cada; manutenção: sombra, de cabeça e ditado", () => {
    for (const semente of SEMENTES.slice(0, 50)) {
      const r = gerarRodada({ ...pedido(T.juntos, semente, { [T.complemento5]: 2, [T.complemento10]: 2 }), tipo: "revisao", foco: null, faltam: [T.complemento5, T.complemento10] });
      expect(r.filter((x) => x.tecnica === T.complemento5).length).toBeGreaterThanOrEqual(2);
      expect(r.filter((x) => x.tecnica === T.complemento10).length).toBeGreaterThanOrEqual(2);
      for (const x of r) expect(problemasDaOperacao(x.operacao, x.tecnica as TecnicaSoroban, ORDEM_TECNICAS_SOROBAN)).toEqual([]);
      const m = gerarRodada({ ...pedido(T.imaginado, semente), tipo: "manutencao", foco: null });
      expect(m.map((x) => x.nivel)).toEqual(["sombra", "de-cabeca", "ditado", "sombra", "de-cabeca", "ditado"]);
    }
  });

  it("as intercaladas ficam na quarta e na sexta", () => {
    expect(posicoesIntercaladas(6, 2)).toEqual([3, 5]);
    expect(posicoesIntercaladas(6, 0)).toEqual([]);
  });
});
