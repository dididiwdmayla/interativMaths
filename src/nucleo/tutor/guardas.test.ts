import { describe, expect, it } from "vitest";
import { comoRacional } from "../racional/racional";
import type { Segredo } from "../missoes/segredos";
import { afirmacoesDeConta, contaFalsa, segredoEntregue, valoresEscritos } from "./guardas";

const quantidade = (v: string): Segredo => ({ tipo: "quantidade", valor: comoRacional(v), origem: "teste" });
const partes = (k: number): Segredo => ({ tipo: "partes", valor: comoRacional(k), origem: "teste" });
const opcao = (texto: string): Segredo => ({ tipo: "opcao", valor: comoRacional(0), texto, origem: "teste" });

describe("não entregar", () => {
  it("acha o segredo em algarismo, fração, misto e por extenso", () => {
    expect(segredoEntregue("Cada mesa fica com 3/4.", [quantidade("3/4")])).not.toBeNull();
    expect(segredoEntregue("Cada mesa fica com 3 / 4.", [quantidade("3/4")])).not.toBeNull();
    expect(segredoEntregue("São seis oitavos para cada uma.", [quantidade("3/4")])).not.toBeNull();
    expect(segredoEntregue("Dá três quartos de broa.", [quantidade("3/4")])).not.toBeNull();
    expect(segredoEntregue("Fica 1 1/4 em cada.", [quantidade("5/4")])).not.toBeNull();
    expect(segredoEntregue("Fica 1 e 1/4 em cada.", [quantidade("5/4")])).not.toBeNull();
    expect(segredoEntregue("Uma broa e um quarto em cada mesa.", [quantidade("5/4")])).not.toBeNull();
    expect(segredoEntregue("Uma broa e mais um quarto.", [quantidade("5/4")])).not.toBeNull();
    expect(segredoEntregue("São cinco quartos.", [quantidade("5/4")])).not.toBeNull();
    expect(segredoEntregue("Vão seis sacas.", [quantidade("6")])).not.toBeNull();
    expect(segredoEntregue("Vão 6 sacas.", [quantidade("6")])).not.toBeNull();
  });

  it("acha o corte", () => {
    for (const t of ["Corte em 4.", "Corte em quatro.", "Em 4 partes iguais.", "Quatro partes.", "Corte em quartos."]) {
      expect(segredoEntregue(t, [partes(4)]), t).not.toBeNull();
    }
  });

  it("acha a opção", () => {
    expect(segredoEntregue("Vai dar empate.", [opcao("Empate")])).not.toBeNull();
  });

  it("deixa passar o que não entrega", () => {
    const lista = [quantidade("5/4"), partes(4)];
    expect(segredoEntregue("Em quantas partes, para as mesas ficarem iguais? Teste na máquina.", lista)).toBeNull();
    expect(segredoEntregue("Sobrou uma broa. Pão a gente corta.", lista)).toBeNull();
    expect(segredoEntregue("Olhe os medidores.", [quantidade("6")])).toBeNull();
    expect(segredoEntregue("Pense em 1/2 de uma broa.", [quantidade("3/4")])).toBeNull();
  });

  it("lê números escritos", () => {
    expect(valoresEscritos("1 1/4 e 3/8, e 12")).toEqual([comoRacional("5/4"), comoRacional("1/4"), comoRacional("3/8"), comoRacional(12)]);
  });
});

describe("conta certa", () => {
  it("confere contas e comparações", () => {
    expect(contaFalsa("24 ÷ 4 = 6, como na máquina.")).toBeNull();
    expect(contaFalsa("5 ÷ 4 = 1.")).not.toBeNull();
    expect(contaFalsa("5 ÷ 4 = 1, resto 1.")).toBeNull();
    expect(contaFalsa("26 ÷ 4 = 6 resto 3.")).not.toBeNull();
    expect(contaFalsa("2/8 é mais que 1/4.")).not.toBeNull();
    expect(contaFalsa("2/8 é igual a 1/4.")).toBeNull();
    expect(contaFalsa("1/2 é maior que 1/3.")).toBeNull();
    expect(contaFalsa("3 dividido por 4 dá 3/4.")).toBeNull();
    expect(contaFalsa("3 dividido por 4 dá 4/3.")).not.toBeNull();
    expect(contaFalsa("1/4 + 1/4 = 1/2.")).toBeNull();
    expect(contaFalsa("1/4 + 1/4 = 2/8.")).not.toBeNull();
    expect(contaFalsa("4 × 6 = 24.")).toBeNull();
    expect(contaFalsa("6 - 2 = 3.")).not.toBeNull();
  });

  it("texto sem conta não tem afirmação", () => {
    expect(afirmacoesDeConta("Olhe os medidores: qual parou mais alto?")).toEqual([]);
  });
});
