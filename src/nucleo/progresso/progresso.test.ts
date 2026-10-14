import { describe, expect, it } from "vitest";
import {
  adiantarRelogio,
  armazenamentoEmMemoria,
  CHAVE_PROGRESSO,
  CHAVE_RESERVA,
  carregarProgresso,
  concluirAtividade,
  migrar,
  normalizar,
  progressoNovo,
  registrarEvidencias,
  relogioDoJogo,
  salvarExecucao,
  salvarProgresso,
  UM_DIA_MS,
  VERSAO_PROGRESSO,
  type Migracao,
} from "./index";

const AGORA = 1_700_000_000_000;

describe("carregar e salvar", () => {
  it("sem nada salvo, começa do zero", () => {
    const arm = armazenamentoEmMemoria();
    const c = carregarProgresso(arm, AGORA);
    expect(c.aviso).toBeNull();
    expect(c.progresso).toEqual(progressoNovo(AGORA));
  });

  it("ida e volta preserva tudo", () => {
    const arm = armazenamentoEmMemoria();
    let p = progressoNovo(AGORA);
    p = registrarEvidencias(
      p,
      [{ conceito: "div.partilha", tipo: "experimento", resultado: "sucesso", ajuda: 0, contexto: "m1", momento: AGORA }],
      AGORA,
    );
    p = salvarExecucao(p, "m1", { passo: "repartir", maquina: { lote: 3 } }, AGORA);
    p = concluirAtividade(p, "m0", "prova", AGORA);
    salvarProgresso(arm, p);
    expect(carregarProgresso(arm, AGORA + 5).progresso).toEqual(p);
  });

  it("texto ilegível vira começo novo e o original fica guardado", () => {
    const arm = armazenamentoEmMemoria({ [CHAVE_PROGRESSO]: "{quebrado" });
    const c = carregarProgresso(arm, AGORA);
    expect(c.aviso).toBe("ilegivel");
    expect(c.progresso.evidencias).toEqual([]);
    expect(arm.dados[CHAVE_RESERVA]).toBe("{quebrado");
  });

  it("armazenamento que lança não derruba o jogo", () => {
    const arm = {
      ler: () => {
        throw new Error("bloqueado");
      },
      gravar: () => {
        throw new Error("cheio");
      },
      apagar: () => undefined,
    };
    expect(carregarProgresso(arm, AGORA).aviso).toBe("sem-armazenamento");
    expect(salvarProgresso(arm, progressoNovo(AGORA))).toBe(false);
  });
});

describe("normalização", () => {
  it("descarta lixo e completa o que falta", () => {
    const p = normalizar(
      {
        versao: 1,
        preferencias: { postura: "gritando", cotas: "escondidas" },
        evidencias: [
          { conceito: "x", tipo: "aplicacao", resultado: "sucesso", ajuda: 0, contexto: "c", momento: 1 },
          { conceito: "x", tipo: "inventado", resultado: "sucesso", ajuda: 0, contexto: "c", momento: 1 },
          "lixo",
        ],
        caderno: [{ id: "a", atividade: "m1" }, { id: "a", atividade: "m1" }, { sem: "id" }],
        joias: { abaco: { encontrada: true, estagio: 9 } },
        relogio: { deslocamentoMs: -5 },
      },
      AGORA,
    );
    expect(p.preferencias).toEqual({ postura: "disponivel", cotas: "escondidas", animacoes: "completas", conversa: "ligada" });
    expect(p.evidencias).toHaveLength(1);
    expect(p.caderno).toHaveLength(1);
    expect(p.joias.abaco.estagio).toBe(3);
    expect(p.relogio.deslocamentoMs).toBe(0);
  });
});

describe("migrações", () => {
  it("documento sem versão migra para a atual", () => {
    const arm = armazenamentoEmMemoria({
      [CHAVE_PROGRESSO]: JSON.stringify({ prefs: { postura: "quieto" }, aberturaVista: true }),
    });
    const c = carregarProgresso(arm, AGORA);
    expect(c.progresso.versao).toBe(VERSAO_PROGRESSO);
    expect(c.progresso.preferencias.postura).toBe("quieto");
    expect(c.progresso.aberturaVista).toBe(true);
  });

  it("a cadeia aplica cada passo em ordem", () => {
    const cadeia: Migracao[] = [
      { de: 0, descricao: "", migrar: (d) => ({ ...d, a: 1 }) },
      { de: 1, descricao: "", migrar: (d) => ({ ...d, b: (d.a as number) + 1 }) },
      { de: 2, descricao: "", migrar: (d) => ({ ...d, c: (d.b as number) + 1 }) },
    ];
    const r = migrar({}, cadeia, 3);
    expect(r.caminho).toEqual([0, 1, 2, 3]);
    expect(r.doc).toMatchObject({ a: 1, b: 2, c: 3, versao: 3 });
  });

  it("começa do meio da cadeia", () => {
    const cadeia: Migracao[] = [
      { de: 0, descricao: "", migrar: () => ({ errado: true }) },
      { de: 1, descricao: "", migrar: (d) => ({ ...d, ok: true }) },
    ];
    expect(migrar({ versao: 1 }, cadeia, 2).doc).toEqual({ versao: 2, ok: true });
  });

  it("falta de passo é erro explícito e não apaga o progresso salvo", () => {
    expect(() => migrar({ versao: 0 }, [], 1)).toThrow(/falta migração/);
  });

  it("versão futura é reconhecida", () => {
    const r = migrar({ versao: 99 });
    expect(r.futura).toBe(true);
  });
});

describe("relógio", () => {
  it("o laboratório adianta um dia", () => {
    let p = progressoNovo(AGORA);
    p = adiantarRelogio(p, UM_DIA_MS, AGORA);
    const r = relogioDoJogo(p.relogio.deslocamentoMs, () => AGORA);
    expect(r.agora() - AGORA).toBe(UM_DIA_MS);
  });
});
