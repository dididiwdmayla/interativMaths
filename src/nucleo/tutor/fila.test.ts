import { describe, expect, it } from "vitest";
import { atualizarFila, falaDoPasso, filaVazia, oferecer, PERMANENCIA_MINIMA_MS, posturaAceita, proximaMudanca, type FalaFaixa } from "./fila";

const fala = (id: string, prioridade: FalaFaixa["prioridade"], categoria: FalaFaixa["categoria"] = "evento", passo = "p1"): FalaFaixa => ({
  id,
  texto: `texto ${id}`,
  expressao: "neutro",
  prioridade,
  categoria,
  passo,
});

describe("fila de falas", () => {
  it("importante entra na hora, por cima de qualquer outra", () => {
    let f = oferecer(filaVazia(), fala("a", "importante"), 0, "disponivel");
    f = oferecer(f, fala("b", "importante"), 100, "disponivel");
    expect(f.atual?.id).toBe("b");
    expect(f.desde).toBe(100);
  });

  it("pedida espera uma importante cumprir o mínimo, e só ela", () => {
    let f = oferecer(filaVazia(), fala("retorno", "importante", "retorno"), 0, "disponivel");
    f = oferecer(f, fala("ajuda", "pedida", "ajuda"), 1000, "disponivel");
    expect(f.atual?.id).toBe("retorno");
    expect(f.pendente?.id).toBe("ajuda");
    expect(proximaMudanca(f)).toBe(PERMANENCIA_MINIMA_MS);
    expect(atualizarFila(f, 2000).atual?.id).toBe("retorno");
    const depois = atualizarFila(f, PERMANENCIA_MINIMA_MS);
    expect(depois.atual?.id).toBe("ajuda");
    expect(depois.pendente).toBeNull();
    expect(proximaMudanca(depois)).toBeNull();
  });

  it("pedida não espera uma automática", () => {
    let f = oferecer(filaVazia(), fala("oferta", "automatica", "oferta"), 0, "disponivel");
    f = oferecer(f, fala("ajuda", "pedida", "ajuda"), 100, "disponivel");
    expect(f.atual?.id).toBe("ajuda");
  });

  it("automática é descartada se outra fala está na tela há menos do mínimo", () => {
    let f = oferecer(filaVazia(), fala("leitura", "importante"), 0, "presente");
    f = oferecer(f, fala("lembrete", "automatica", "lembrete"), 1000, "presente");
    expect(f.atual?.id).toBe("leitura");
    expect(f.pendente).toBeNull();
    f = oferecer(f, fala("lembrete", "automatica", "lembrete"), PERMANENCIA_MINIMA_MS + 1, "presente");
    expect(f.atual?.id).toBe("lembrete");
  });

  it("a postura decide quais automáticas entram", () => {
    expect(posturaAceita("oferta", "quieto")).toBe(false);
    expect(posturaAceita("lembrete", "quieto")).toBe(false);
    expect(posturaAceita("oferta", "disponivel")).toBe(true);
    expect(posturaAceita("lembrete", "disponivel")).toBe(true);
    expect(posturaAceita("comentario", "disponivel")).toBe(false);
    expect(posturaAceita("comentario", "presente")).toBe(true);
    const quieta = oferecer(filaVazia(), fala("oferta", "automatica", "oferta"), 0, "quieto");
    expect(quieta.atual).toBeNull();
    const pedidaQuieta = oferecer(filaVazia(), fala("ajuda", "pedida", "ajuda"), 0, "quieto");
    expect(pedidaQuieta.atual?.id).toBe("ajuda");
  });

  it("a mesma fala não se repete em seguida", () => {
    const f = oferecer(filaVazia(), fala("a", "importante"), 0, "disponivel");
    expect(oferecer(f, fala("a", "importante"), 5000, "disponivel")).toBe(f);
  });

  it("fala de outro passo não aparece", () => {
    const f = oferecer(filaVazia(), fala("a", "importante", "evento", "p1"), 0, "disponivel");
    expect(falaDoPasso(f, "p1")?.id).toBe("a");
    expect(falaDoPasso(f, "p2")).toBeNull();
  });
});
