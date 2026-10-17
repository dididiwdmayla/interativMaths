import { describe, expect, it } from "vitest";
import { aplicarEntradaItem, iniciarItem, itemFeito, lanceAtual, maoBateu, marcaDoItem, restaurarItem, type EntradaItem, type EstadoItem, type EventoItem, type ItemRodada } from "./item";
import { entradasDoCaminhoCurto, gestosDosMovimentos, jogarItem } from "./jogador";
import { ler, mostrar, type Gesto } from "./soroban";
import { planoDoLance } from "./plano";
import { TECNICAS_SOROBAN } from "./tecnicas";

function rodar(e: EstadoItem, entradas: readonly EntradaItem[]): { estado: EstadoItem; eventos: EventoItem[] } {
  const eventos: EventoItem[] = [];
  let x = e;
  for (const ent of entradas) {
    const r = aplicarEntradaItem(x, ent);
    x = r.estado;
    eventos.push(...r.eventos);
  }
  return { estado: x, eventos };
}

const g = (gesto: Gesto): EntradaItem => ({ tipo: "gesto", gesto });

/** Mostra o primeiro número pelo caminho curto. */
function mostrarPrimeiro(e: EstadoItem): EstadoItem {
  return rodar(e, entradasDoCaminhoCurto(e)).estado;
}

const soma = (a: number, b: number, nivel: ItemRodada["nivel"] = "sozinho"): ItemRodada => ({ operacao: { tipo: "somar", a, b }, nivel, tecnica: TECNICAS_SOROBAN.juntos });

describe("o reconhecimento do lance", () => {
  it("o plano tocado gesto a gesto fecha limpo", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(23, 14)));
    expect(e.fechados).toHaveLength(1);
    expect(e.fechados[0].limpo).toBe(true);
    const r = rodar(e, entradasDoCaminhoCurto(e));
    e = r.estado;
    expect(r.eventos).toContainEqual({ tipo: "lance-fechou", indice: 1, limpo: true });
    e = rodar(e, entradasDoCaminhoCurto(e)).estado;
    expect(e.terminado).toBe(true);
    expect(ler(e.soroban)).toBe(37);
    expect(marcaDoItem(e)).toBe("limpo");
  });

  it("em 6 + 7, a ordem trocada (a unidade antes da dezena) fecha limpo", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(6, 7)));
    const atual = lanceAtual(e);
    expect(atual?.lance.plano.marcas).toEqual(["juntos"]);
    const [dezena, ...unidade] = atual?.lance.plano.movimentos ?? [];
    const gestos = gestosDosMovimentos(e.soroban, [...unidade, dezena]);
    const r = rodar(e, gestos.map(g));
    e = r.estado;
    expect(r.eventos).toContainEqual({ tipo: "lance-fechou", indice: 1, limpo: true });
    expect(ler(e.soroban)).toBe(13);
  });

  it("um toque a mais e o Desfazer fecham com vai e volta", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(3, 4)));
    e = rodar(e, [g({ haste: 4, conta: "baixo", indice: 3 }), { tipo: "desfazer" }]).estado;
    const r = rodar(e, entradasDoCaminhoCurto(e));
    expect(r.eventos).toContainEqual({ tipo: "lance-fechou", indice: 1, limpo: false });
    expect(marcaDoItem(r.estado)).toBe("vai-e-volta");
    const feito = itemFeito(r.estado);
    expect(feito.evidencias).toEqual([{ tecnica: TECNICAS_SOROBAN.complemento5, conta: false }]);
  });

  it("zerar a haste e montar o resultado fecha com vai e volta", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(6, 7)));
    // Afasta tudo da unidade (a de cima e a de baixo), põe 1 na dezena e monta o 3.
    e = rodar(e, [g({ haste: 4, conta: "cima" }), g({ haste: 4, conta: "baixo", indice: 0 }), g({ haste: 3, conta: "baixo", indice: 0 }), g({ haste: 4, conta: "baixo", indice: 2 })]).estado;
    expect(ler(e.soroban)).toBe(13);
    expect(e.terminado).toBe(true);
    expect(e.fechados[1].limpo).toBe(false);
  });

  it("um gesto numa haste que o plano não toca avisa uma vez por lance", () => {
    const e = mostrarPrimeiro(iniciarItem(soma(23, 14)));
    const r = rodar(e, [g({ haste: 1, conta: "cima" }), { tipo: "desfazer" }, g({ haste: 1, conta: "cima" }), { tipo: "desfazer" }]);
    expect(r.eventos.filter((x) => x.tipo === "fora")).toEqual([{ tipo: "fora", haste: 1 }]);
    const depois = rodar(r.estado, entradasDoCaminhoCurto(r.estado));
    expect(depois.eventos).toContainEqual({ tipo: "lance-fechou", indice: 1, limpo: false });
    // No lance seguinte, o aviso volta a valer.
    const outro = rodar(depois.estado, [g({ haste: 1, conta: "cima" })]);
    expect(outro.eventos.filter((x) => x.tipo === "fora")).toHaveLength(1);
  });

  it("Zerar recomeça a operação: o primeiro número de novo, e nada dela conta até terminar", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(23, 14)));
    e = rodar(e, [{ tipo: "zerar" }]).estado;
    expect(ler(e.soroban)).toBe(0);
    expect(e.fechados).toEqual([]);
    expect(lanceAtual(e)?.lance.lance).toEqual({ tipo: "mostrar", valor: 23 });
    e = jogarItem(e);
    expect(e.terminado).toBe(true);
    expect(marcaDoItem(e)).toBe("limpo");
  });

  it("ajuda do degrau 2 e os pares abertos tiram só aquele lance da evidência", () => {
    const e = jogarItem(iniciarItem(soma(23, 14)), { ajuda: (i) => (i === 1 ? 2 : 0) });
    expect(itemFeito(e).evidencias).toEqual([
      { tecnica: TECNICAS_SOROBAN.diretas, conta: false },
      { tecnica: TECNICAS_SOROBAN.complemento5, conta: true },
    ]);
    let f = mostrarPrimeiro(iniciarItem(soma(23, 14)));
    f = rodar(f, [...entradasDoCaminhoCurto(f)]).estado;
    f = rodar(f, [{ tipo: "pares" }, ...entradasDoCaminhoCurto(f)]).estado;
    expect(itemFeito(f).evidencias.map((x) => x.conta)).toEqual([true, false]);
    expect(marcaDoItem(f)).toBe("com-ajuda");
  });

  it("o degrau 1 não tira o lance; com o Nônio, nada conta", () => {
    const e = jogarItem(iniciarItem(soma(3, 4)), { ajuda: () => 1 });
    expect(itemFeito(e).evidencias).toEqual([{ tecnica: TECNICAS_SOROBAN.complemento5, conta: true }]);
    const guiado = jogarItem(iniciarItem(soma(3, 4, "com-nonio")));
    expect(itemFeito(guiado).evidencias).toEqual([{ tecnica: TECNICAS_SOROBAN.complemento5, conta: false }]);
  });

  it("o mostrar é evidência de Ler e mostrar só quando é o item inteiro", () => {
    const m = jogarItem(iniciarItem({ operacao: { tipo: "mostrar", valor: 305 }, nivel: "sozinho", tecnica: TECNICAS_SOROBAN.ler }));
    expect(ler(m.soroban)).toBe(305);
    expect(itemFeito(m)).toMatchObject({ resumo: "mostrar 305", marca: "limpo", evidencias: [{ tecnica: TECNICAS_SOROBAN.ler, conta: true }] });
  });
});

describe("ler e o soroban imaginado", () => {
  it("ler: tenta até bater; só conta se acertar na primeira", () => {
    const item: ItemRodada = { operacao: { tipo: "ler", valor: 47 }, nivel: "sozinho", tecnica: TECNICAS_SOROBAN.ler };
    const e = iniciarItem(item);
    expect(ler(e.soroban)).toBe(47);
    const r = rodar(e, [{ tipo: "responder", valor: 42 }]);
    expect(r.estado.terminado).toBe(false);
    expect(r.estado.resposta.ultima).toBe(42);
    expect(r.eventos).toContainEqual({ tipo: "resposta", certa: false });
    const certo = rodar(r.estado, [{ tipo: "responder", valor: 47 }]).estado;
    expect(certo.terminado).toBe(true);
    expect(itemFeito(certo)).toMatchObject({ marca: "vai-e-volta", evidencias: [{ tecnica: TECNICAS_SOROBAN.ler, conta: false }] });
    const primeira = rodar(e, [{ tipo: "responder", valor: 47 }]).estado;
    expect(itemFeito(primeira)).toMatchObject({ marca: "limpo", evidencias: [{ conta: true }] });
  });

  it("sombra: a cabeça e a mão bateram; o número bateu e a mão foi por outro caminho; não bateu", () => {
    const item: ItemRodada = { operacao: { tipo: "somar", a: 48, b: 25 }, nivel: "sombra", tecnica: TECNICAS_SOROBAN.imaginado };
    const bateu = jogarItem(iniciarItem(item));
    expect(bateu.terminado && bateu.resposta.certa).toBe(true);
    expect(maoBateu(bateu)).toBe(true);
    expect(itemFeito(bateu).evidencias).toEqual([{ tecnica: TECNICAS_SOROBAN.imaginado, conta: true }]);

    const outro = rodar(iniciarItem(item), [g({ haste: 4, conta: "cima" }), { tipo: "responder", valor: 73 }]).estado;
    expect(outro.resposta.certa).toBe(true);
    expect(maoBateu(outro)).toBe(false);
    expect(itemFeito(outro).evidencias[0].conta).toBe(true);

    const errou = jogarItem(iniciarItem(item), { errar: true });
    expect(errou.terminado).toBe(true);
    expect(marcaDoItem(errou)).toBe("ainda-nao");
    expect(itemFeito(errou).evidencias[0].conta).toBe(false);
  });

  it("ver as contas tira a operação da evidência", () => {
    const item: ItemRodada = { operacao: { tipo: "subtrair", a: 52, b: 17 }, nivel: "sombra", tecnica: TECNICAS_SOROBAN.imaginado };
    const e = rodar(iniciarItem(item), [{ tipo: "ver-contas" }, { tipo: "responder", valor: 35 }]).estado;
    expect(itemFeito(e)).toMatchObject({ marca: "com-ajuda", evidencias: [{ conta: false }] });
  });

  it("ditado: um número por vez, e só depois do último dá para responder", () => {
    const item: ItemRodada = { operacao: { tipo: "ditado", numeros: [7, -3, 5] }, nivel: "ditado", tecnica: TECNICAS_SOROBAN.imaginado };
    let e = iniciarItem(item);
    expect(e.mostrados).toBe(1);
    expect(rodar(e, [{ tipo: "responder", valor: 9 }]).estado.terminado).toBe(false);
    e = rodar(e, [{ tipo: "proximo-numero" }, { tipo: "proximo-numero" }, { tipo: "proximo-numero" }]).estado;
    expect(e.mostrados).toBe(3);
    e = rodar(e, [{ tipo: "responder", valor: 9 }]).estado;
    expect(itemFeito(e)).toMatchObject({ resumo: "7 − 3 + 5", marca: "limpo", evidencias: [{ conta: true }] });
  });
});

describe("restaurar o item salvo", () => {
  it("volta igual, no mesmo lance, com os mesmos gestos", () => {
    let e = mostrarPrimeiro(iniciarItem(soma(26, 7)));
    e = rodar(e, [g({ haste: 3, conta: "baixo", indice: 0 })]).estado;
    const salvo = JSON.parse(JSON.stringify(e));
    const r = restaurarItem(salvo, e.item);
    expect(r).toEqual(e);
    expect(r && lanceAtual(r)?.indice).toBe(1);
  });

  it("soroban que não confere com os gestos, ou item diferente, recomeça", () => {
    const e = mostrarPrimeiro(iniciarItem(soma(26, 7)));
    const salvo = JSON.parse(JSON.stringify(e));
    expect(restaurarItem({ ...salvo, soroban: mostrar(5, 27) }, e.item)).toBeNull();
    expect(restaurarItem(salvo, soma(26, 8))).toBeNull();
    expect(restaurarItem({ ...salvo, versao: 99 }, e.item)).toBeNull();
    expect(restaurarItem("nada", e.item)).toBeNull();
  });

  it("o caminho curto pelo plano não depende de quem toca", () => {
    const p = planoDoLance(mostrar(5, 45), { tipo: "por", haste: 4, d: 7 });
    expect(p?.marcas).toEqual(["complemento-5", "juntos"]);
  });
});
