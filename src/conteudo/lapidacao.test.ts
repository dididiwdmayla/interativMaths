/**
 * Checagens dos textos e dos exemplos da lapidação: cada técnica tem abertura com o exemplo da
 * própria técnica; o caso parecido de todo lance existe, é da mesma técnica e tem outros números;
 * todo recado do Nônio, com os números de qualquer lance de qualquer rodada, cabe em 60.
 */
import { describe, expect, it } from "vitest";
import { gerarRodada, type PedidoRodada } from "@/nucleo/soroban/gerador";
import { lancesDaOperacao } from "@/nucleo/soroban/operacao";
import { marcasDeTecnica } from "@/nucleo/soroban/plano";
import { ORDEM_TECNICAS_SOROBAN, MARCA_DA_TECNICA, type TecnicaSoroban } from "@/nucleo/soroban/tecnicas";
import { casoParecido, exemploDaOperacao, medidasDoLance, preencher, tipoDoLance } from "@/nucleo/soroban/textos";
import { LIMITE_RECADO } from "@/nucleo/tutor/recado";
import { JOIAS } from "./joias";
import { ABERTURAS, AJUDA_LAPIDACAO, NOMES_POSICAO, PARAMETROS_LAPIDACAO, RECADOS_LAPIDACAO } from "./lapidacao";

const ABACO = JOIAS.find((j) => j.id === "abaco") ?? JOIAS[0];
const ESTAGIOS = Object.fromEntries(ABACO.tecnicas.map((t) => [t.id, t.estagio])) as PedidoRodada["estagios"];

/** Todos os lances de mão de várias rodadas de cada técnica. */
function lancesDeRodadas() {
  const saida = [];
  for (const foco of ORDEM_TECNICAS_SOROBAN) {
    const vistas = ORDEM_TECNICAS_SOROBAN.slice(0, ORDEM_TECNICAS_SOROBAN.indexOf(foco) + 1);
    for (let semente = 1; semente < 400; semente += 13) {
      for (const rodadas of [0, 1]) {
        const itens = gerarRodada({ semente, tipo: "tecnica", foco, faltam: [], vistas, rodadas: { [foco]: rodadas }, estagios: ESTAGIOS, operacoes: 6, intercaladas: 2 });
        for (const it of itens) for (const l of lancesDaOperacao(it.operacao)) saida.push(l);
      }
    }
  }
  return saida;
}

describe("a lapidação: textos e exemplos", () => {
  const lances = lancesDeRodadas();

  it("os parâmetros do treino fazem sentido", () => {
    const p = PARAMETROS_LAPIDACAO;
    for (const v of Object.values(p)) expect(Number.isInteger(v)).toBe(true);
    // As duas primeiras com o Nônio não contam: sobra pelo menos uma operação que conta.
    expect(p.operacoesPorRodada).toBeGreaterThanOrEqual(3);
    expect(p.operacoesPorRodada).toBeLessThanOrEqual(10);
    expect(p.intercaladas).toBeLessThanOrEqual(Math.floor((p.operacoesPorRodada - 2) / 2));
    expect(p.limposPorRodada).toBeGreaterThanOrEqual(1);
    expect(p.limposPorRodada).toBeLessThanOrEqual(p.limposParaFirmar);
    expect(p.rodadasParaFirmar).toBeGreaterThanOrEqual(1);
    expect(p.intervaloHoras).toBeGreaterThanOrEqual(0);
  });

  it("toda técnica da joia tem abertura, e o exemplo é da própria técnica", () => {
    expect(Object.keys(ABERTURAS)).toEqual(ABACO.tecnicas.map((t) => t.id));
    for (const id of ORDEM_TECNICAS_SOROBAN) {
      const ex = ABERTURAS[id].exemplo;
      const marca = MARCA_DA_TECNICA[id as TecnicaSoroban];
      if (ex.tipo !== "somar" || !marca) continue;
      const desenho = exemploDaOperacao({ tipo: "somar", a: ex.a, b: ex.b });
      expect(desenho, id).not.toBeNull();
      const marcas = lancesDaOperacao({ tipo: "somar", a: ex.a, b: ex.b }).flatMap((l) => (l.lance.tipo === "mostrar" ? [] : l.plano.marcas));
      expect(marcas, id).toContain(marca);
    }
    expect(exemploDaOperacao({ tipo: "somar", a: 3, b: 4 })?.conta).toBe("3 + 4 = 3 + 5 − 1 = 7");
    expect(exemploDaOperacao({ tipo: "somar", a: 6, b: 7 })?.conta).toBe("6 + 7 = 6 + 10 − 5 + 2 = 13");
  });

  it("todo lance tem caso parecido: mesma técnica, outros números", () => {
    let conferidos = 0;
    for (const l of lances) {
      if (l.lance.tipo === "mostrar") continue;
      const caso = casoParecido(l);
      expect(caso, JSON.stringify(l.lance)).not.toBeNull();
      if (!caso || (caso.tipo !== "somar" && caso.tipo !== "subtrair")) continue;
      const doCaso = lancesDaOperacao(caso, 2).filter((x) => x.lance.tipo !== "mostrar");
      expect(doCaso).toHaveLength(1);
      expect(marcasDeTecnica(doCaso[0].plano.marcas)).toEqual(marcasDeTecnica(l.plano.marcas));
      const x = l.inicio[l.lance.haste];
      expect(caso.a % 10 === (x.cinco ? 5 : 0) + x.uns && caso.b === l.lance.d).toBe(false);
      conferidos++;
    }
    expect(conferidos).toBeGreaterThan(500);
  });

  it("todo recado do Nônio cabe em 60, com os números de cada lance", () => {
    const modelos: Record<string, string> = {
      mostrar: RECADOS_LAPIDACAO.comNonio.mostrar,
      direto: RECADOS_LAPIDACAO.comNonio.direto,
      diretoTirar: RECADOS_LAPIDACAO.comNonio.diretoTirar,
      cincoPor: RECADOS_LAPIDACAO.comNonio.cincoPor,
      cincoTirar: RECADOS_LAPIDACAO.comNonio.cincoTirar,
      dezPor: RECADOS_LAPIDACAO.comNonio.dezPor,
      dezTirar: RECADOS_LAPIDACAO.comNonio.dezTirar,
      juntosPor: RECADOS_LAPIDACAO.comNonio.juntosPor,
      juntosTirar: RECADOS_LAPIDACAO.comNonio.juntosTirar,
    };
    for (const l of lances) {
      const m = medidasDoLance(l, NOMES_POSICAO);
      const recado = preencher(modelos[tipoDoLance(l)], m);
      expect(recado.length, recado).toBeLessThanOrEqual(LIMITE_RECADO);
      expect(recado).not.toMatch(/\{\w+\}/);
      if (l.lance.tipo !== "mostrar") expect(preencher(RECADOS_LAPIDACAO.fora, m).length).toBeLessThanOrEqual(LIMITE_RECADO);
    }
  });

  it("a ajuda nunca diz o resultado da operação nem o algarismo do alvo", () => {
    for (const l of lances) {
      if (l.lance.tipo === "mostrar") continue;
      const m = medidasDoLance(l, NOMES_POSICAO);
      const alvo = l.plano.alvo[l.lance.haste];
      const algarismoAlvo = String((alvo.cinco ? 5 : 0) + alvo.uns);
      for (const grupo of Object.values(AJUDA_LAPIDACAO)) {
        if (Array.isArray(grupo)) continue;
        for (const modelo of Object.values(grupo as Record<string, string>)) {
          // O medir de "direto" diz "d é 5 e mais d−5": não é o alvo da haste (o alvo soma o que já havia).
          const texto = preencher(modelo, m);
          expect(texto).not.toMatch(/\{\w+\}/);
          if (algarismoAlvo !== m.d && algarismoAlvo !== m.m && algarismoAlvo !== m.par && algarismoAlvo !== m.livres && algarismoAlvo !== m.uns && algarismoAlvo !== m.resto) {
            expect(texto.includes(` ${algarismoAlvo} `) && /fica|dá|resulta/.test(texto), texto).toBe(false);
          }
        }
      }
    }
  });
});
