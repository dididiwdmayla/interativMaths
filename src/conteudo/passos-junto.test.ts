/**
 * Os passos do caminho junto (degrau 4): o texto exato nos casos conferidos à mão e, em todo lance
 * de 200 sementes por foco, nenhum marcador sobrando e cada movimento do plano num passo só.
 */
import { describe, expect, it } from "vitest";
import { gerarRodada, type PedidoRodada } from "@/nucleo/soroban/gerador";
import { lancesDaOperacao, type Operacao } from "@/nucleo/soroban/operacao";
import { ORDEM_TECNICAS_SOROBAN, type TecnicaSoroban } from "@/nucleo/soroban/tecnicas";
import { ordensDosPassos, passosDoLance } from "@/nucleo/soroban/textos";
import { JOIAS } from "./joias";
import { NOMES_POSICAO, PASSOS_JUNTO } from "./lapidacao";

const ABACO = JOIAS.find((j) => j.id === "abaco") ?? JOIAS[0];
const ESTAGIOS = Object.fromEntries(ABACO.tecnicas.map((t) => [t.id, t.estagio])) as PedidoRodada["estagios"];

/** Os textos dos passos do último lance (o algarismo das unidades) de uma operação. */
function textos(op: Operacao): string[] {
  const lances = lancesDaOperacao(op);
  const passos = passosDoLance(lances[lances.length - 1], PASSOS_JUNTO, NOMES_POSICAO);
  return (passos ?? []).map((p) => p.texto);
}

describe("os passos do caminho junto", () => {
  it("26 + 7: os três passos da referência", () => {
    expect(textos({ tipo: "somar", a: 26, b: 7 })).toEqual(["Pôr 7 é pôr 10 e tirar 3: põe 1 na dezena.", "Tirar 3 do 6 sem 3 embaixo: tira o 5…", "…e devolve 2 embaixo."]);
  });
  it("9 + 3: o complemento de 10 e o tirar direto", () => {
    expect(textos({ tipo: "somar", a: 9, b: 3 })).toEqual(["Pôr 3 é pôr 10 e tirar 7: põe 1 na dezena.", "Tira o 5 e 2 embaixo."]);
  });
  it("12 − 7: 5 e 10 juntos, tirando", () => {
    expect(textos({ tipo: "subtrair", a: 12, b: 7 })).toEqual(["Tirar 7 é tirar 10 e devolver 3: tira 1 da dezena.", "Pôr 3 sem lugar embaixo: põe o 5…", "…e tira 2 embaixo."]);
  });
  it("45 + 7: o vai-um num 4 depois do primeiro", () => {
    const t = textos({ tipo: "somar", a: 45, b: 7 });
    expect(t[0]).toBe("Pôr 7 é pôr 10 e tirar 3: põe 1 na dezena.");
    expect(t[1]).toBe("Pôr 1 no 4 da dezena: põe o 5 e tira 4 embaixo.");
    expect(t).toHaveLength(4);
  });
  it("os diretos e o complemento de 5", () => {
    expect(textos({ tipo: "somar", a: 1, b: 2 })).toEqual(["Põe 2 embaixo."]);
    expect(textos({ tipo: "somar", a: 2, b: 5 })).toEqual(["Põe o 5."]);
    expect(textos({ tipo: "somar", a: 1, b: 7 })).toEqual(["Põe o 5 e 2 embaixo."]);
    expect(textos({ tipo: "somar", a: 3, b: 4 })).toEqual(["Pôr 4 é pôr 5 e tirar 1: põe o 5…", "…e tira 1 embaixo."]);
    expect(textos({ tipo: "subtrair", a: 6, b: 3 })).toEqual(["Tirar 3 sem 3 embaixo: tira o 5…", "…e devolve 2 embaixo."]);
  });
  it("a cadeia: cheia e vazia", () => {
    expect(textos({ tipo: "somar", a: 95, b: 7 })).toEqual(["Pôr 7 é pôr 10 e tirar 3: põe 1 na dezena.", "A dezena está cheia: vira 0 e põe 1 na centena.", "Tirar 3 do 5 sem 3 embaixo: tira o 5…", "…e devolve 2 embaixo."]);
    expect(textos({ tipo: "subtrair", a: 103, b: 5 })[1]).toBe("A dezena está vazia: vira 9 e tira 1 da centena.");
  });

  const SEMENTES = Array.from({ length: 200 }, (_, i) => 1 + i * 7919);
  for (const foco of ORDEM_TECNICAS_SOROBAN) {
    it(`todo lance de ${foco}, 200 sementes: sem marcador, um passo para cada grupo de contas`, () => {
      const vistas = ORDEM_TECNICAS_SOROBAN.slice(0, ORDEM_TECNICAS_SOROBAN.indexOf(foco) + 1);
      for (const semente of SEMENTES) {
        for (const rodadas of [0, 1]) {
          const itens = gerarRodada({ semente, tipo: "tecnica", foco, faltam: [], vistas, rodadas: { [foco as TecnicaSoroban]: rodadas }, estagios: ESTAGIOS, operacoes: 6, intercaladas: 2 });
          for (const it of itens) {
            for (const ld of lancesDaOperacao(it.operacao)) {
              const passos = passosDoLance(ld, PASSOS_JUNTO, NOMES_POSICAO);
              if (ld.lance.tipo === "mostrar") {
                expect(passos).toBeNull();
                continue;
              }
              expect(passos).not.toBeNull();
              const lista = passos ?? [];
              for (const p of lista) {
                expect(p.texto, p.texto).not.toMatch(/[{}]/);
                expect(p.texto.length).toBeLessThanOrEqual(80);
              }
              // Cada movimento do plano é de um passo só; só o raciocínio pode não mexer nada.
              const todos = lista.flatMap((p) => p.movimentos).sort((a, b) => a - b);
              expect(todos).toEqual(ld.plano.movimentos.map((_, k) => k));
              lista.slice(1).forEach((p) => expect(p.movimentos.length).toBeGreaterThan(0));
              expect(ordensDosPassos(lista, ld.plano.movimentos.length).every((n) => n > 0)).toBe(true);
            }
          }
        }
      }
    });
  }
});
