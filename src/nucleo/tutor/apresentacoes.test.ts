import { describe, expect, it } from "vitest";
import { MISSAO_1 } from "@/conteudo/missoes/m1-carga-igual";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { EQUIVOCOS } from "@/conteudo/equivocos";
import { passosDoModo } from "../missoes/motor";
import { execucaoDeReferencia } from "../missoes/referencia";
import type { Atividade } from "../missoes/tipos";
import { ferramentasDoPasso, proximaApresentacao } from "./apresentacoes";

const ctx = { agora: 0, conceitoDoEquivoco: (id: string) => EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null };

function no(a: Atividade, id: string) {
  const e = execucaoDeReferencia(a, "guiada", id, ctx);
  const p = passosDoModo(a, "guiada").find((x) => x.id === id);
  if (!e || !p) throw new Error(`passo ${id}`);
  return { e, p };
}

const livre = { jaNestePasso: false, retornoVisivel: false };

describe("apresentações", () => {
  it("a bolinha vem primeiro, na abertura da missão", () => {
    const { e, p } = no(MISSAO_1, "pedido");
    expect(proximaApresentacao(MISSAO_1, p, e, {}, livre)).toBe("bolha");
    expect(proximaApresentacao(MISSAO_1, p, e, { bolha: 1 }, livre)).toBeNull();
    // Quem viu a faixa da v0.3 vê a bolinha uma vez: o Nônio mudou de lugar.
    expect(proximaApresentacao(MISSAO_1, p, e, { faixa: 1 }, livre)).toBe("bolha");
  });

  it("a mão livre se apresenta no primeiro passo de mão", () => {
    const { e, p } = no(MISSAO_1, "a-mao");
    expect(ferramentasDoPasso(p, e)).toEqual(["bolha", "mao-livre"]);
    expect(proximaApresentacao(MISSAO_1, p, e, { bolha: 1 }, livre)).toBe("mao-livre");
  });

  it("aposta, menu de corte, bicas e fichas aparecem onde existem", () => {
    const comparar = no(MISSAO_4, "comparar");
    expect(ferramentasDoPasso(comparar.p, comparar.e)).toEqual(["bolha", "mao-livre", "aposta", "menu-corte"]);
    const volta = no(MISSAO_1, "volta");
    expect(ferramentasDoPasso(volta.p, volta.e)).toContain("bicas");
    const fracao = no(MISSAO_4, "duas-tres");
    expect(ferramentasDoPasso(fracao.p, fracao.e)).toContain("fichas");
  });

  it("no máximo uma por passo, nunca em cima de um retorno, nunca na sondagem", () => {
    const { e, p } = no(MISSAO_1, "a-mao");
    expect(proximaApresentacao(MISSAO_1, p, e, {}, { jaNestePasso: true, retornoVisivel: false })).toBeNull();
    expect(proximaApresentacao(MISSAO_1, p, e, {}, { jaNestePasso: false, retornoVisivel: true })).toBeNull();
    expect(proximaApresentacao({ ...MISSAO_1, tipo: "sondagem" }, p, e, {}, livre)).toBeNull();
  });
});
