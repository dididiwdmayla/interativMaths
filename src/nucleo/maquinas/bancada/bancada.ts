/**
 * Regras da bancada de partilha. A tela desenha o estado e anima a transição; não decide nada.
 * Invariante: a soma exata de esteira + bicas + bandeja é constante em qualquer sequência de ações.
 */
import {
  chave,
  comoRacional,
  compara,
  deChave,
  divide,
  igual,
  inteiro,
  soma,
  somaTodos,
  vezes,
  ZERO,
  type Racional,
} from "../../racional/racional";
import type { AcaoBancada, Bancada, Bica, ConfigBancada, EstadoBancada, Evento, Pilha } from "./tipos";

export const LOTE_MAXIMO_PADRAO = 12;
export const TETO_HISTORICO = 80;

/* ---------- Pilhas ---------- */

export function ordenarPilhas(pilhas: readonly Pilha[]): Pilha[] {
  return [...pilhas].filter((p) => p.quantidade > 0).sort((a, b) => compara(b.tamanho, a.tamanho));
}

export function adicionarPecas(pilhas: readonly Pilha[], tamanho: Racional, k: number): Pilha[] {
  if (k <= 0) return ordenarPilhas(pilhas);
  const existe = pilhas.some((p) => igual(p.tamanho, tamanho));
  const novas = existe
    ? pilhas.map((p) => (igual(p.tamanho, tamanho) ? { ...p, quantidade: p.quantidade + k } : p))
    : [...pilhas, { tamanho, quantidade: k }];
  return ordenarPilhas(novas);
}

export function removerPecas(pilhas: readonly Pilha[], tamanho: Racional, k: number): Pilha[] {
  return ordenarPilhas(
    pilhas.map((p) => (igual(p.tamanho, tamanho) ? { ...p, quantidade: p.quantidade - k } : p)),
  );
}

export function quantidadeDe(pilhas: readonly Pilha[]): Racional {
  return somaTodos(pilhas.map((p) => vezes(p.tamanho, p.quantidade)));
}

export function contarPecas(pilhas: readonly Pilha[]): number {
  return pilhas.reduce((acc, p) => acc + p.quantidade, 0);
}

export function pilhaDe(pilhas: readonly Pilha[], chaveTamanho: string | null): Pilha | null {
  if (chaveTamanho === null) return null;
  return pilhas.find((p) => chave(p.tamanho) === chaveTamanho) ?? null;
}

/* ---------- Bicas ---------- */

export function quantidadeNaBica(b: Bica): Racional {
  return quantidadeDe(b.pecas);
}

/** Bicas em uso: abertas ou com carga. É o que conta como "carroça chamada". */
export function bicasEmUso(e: EstadoBancada): number[] {
  return e.bicas.flatMap((b, i) => (b.aberta || b.pecas.length > 0 ? [i] : []));
}

export function bicasAbertas(e: EstadoBancada): number[] {
  return e.bicas.flatMap((b, i) => (b.aberta ? [i] : []));
}

export function sobraNaEsteira(e: EstadoBancada): Racional {
  return quantidadeDe(e.esteira);
}

export function totalGeral(e: EstadoBancada): Racional {
  return soma(
    soma(quantidadeDe(e.esteira), quantidadeDe(e.bandeja)),
    somaTodos(e.bicas.map(quantidadeNaBica)),
  );
}

export function cargaInicial(config: ConfigBancada): Racional {
  const t = comoRacional(config.pecas.tamanho ?? "1");
  const extras = (config.pecas.pilhas ?? []).map((p) => vezes(comoRacional(p.tamanho), p.quantidade));
  return somaTodos([vezes(t, config.pecas.quantidade), ...extras]);
}

export function podeCortar(e: EstadoBancada): boolean {
  return e.config.fatiador !== undefined;
}

/* ---------- Criação ---------- */

function pilhasIniciais(config: ConfigBancada, quantidade: number): Pilha[] {
  let pilhas: Pilha[] = [];
  pilhas = adicionarPecas(pilhas, comoRacional(config.pecas.tamanho ?? "1"), quantidade);
  for (const p of config.pecas.pilhas ?? []) pilhas = adicionarPecas(pilhas, comoRacional(p.tamanho), p.quantidade);
  return pilhas;
}

export function criarEstado(config: ConfigBancada): EstadoBancada {
  const vagas = Math.max(config.bicas.vagas ?? config.bicas.quantidade, config.bicas.quantidade);
  const esteira = pilhasIniciais(config, config.pecas.quantidade);
  return {
    config,
    esteira,
    bicas: Array.from({ length: vagas }, (_, i) => ({ aberta: i < config.bicas.quantidade, pecas: [] })),
    bandeja: [],
    lote: 1,
    pilha: esteira[0] ? chave(esteira[0].tamanho) : null,
    partes: config.fatiador?.partes[0] ?? 2,
    voltas: 0,
    cargaTravada: false,
    fechada: false,
    evento: null,
    seq: 0,
  };
}

export function criarBancada(config: ConfigBancada): Bancada {
  return { atual: criarEstado(config), passado: [] };
}

/* ---------- Ações ---------- */

function comEvento(e: EstadoBancada, evento: Evento, mudancas: Partial<EstadoBancada> = {}): EstadoBancada {
  return { ...e, ...mudancas, evento, seq: e.seq + 1 };
}

function recusa(e: EstadoBancada, motivo: Extract<Evento, { tipo: "recusa" }>["motivo"]): EstadoBancada {
  return comEvento(e, { tipo: "recusa", motivo });
}

export function loteMaximo(config: ConfigBancada): number {
  return config.lote?.maximo ?? LOTE_MAXIMO_PADRAO;
}

/** Aplica uma ação (sem desfazer/recomeçar). Sempre devolve um estado; recusas viram evento. */
export function aplicar(e: EstadoBancada, acao: AcaoBancada): EstadoBancada {
  if (e.fechada && acao.tipo !== "desfazer" && acao.tipo !== "recomecar") return recusa(e, "fechada");
  switch (acao.tipo) {
    case "lote": {
      const v = Math.round(acao.valor);
      if (v < 1 || v > loteMaximo(e.config)) return recusa(e, "fora-do-limite");
      return comEvento(e, { tipo: "ajuste" }, { lote: v });
    }
    case "pilha": {
      if (!pilhaDe(e.esteira, acao.tamanho)) return recusa(e, "sem-pilha");
      return comEvento(e, { tipo: "ajuste" }, { pilha: acao.tamanho });
    }
    case "partes": {
      if (!e.config.fatiador) return recusa(e, "sem-fatiador");
      if (!e.config.fatiador.partes.includes(acao.valor)) return recusa(e, "partes-invalidas");
      return comEvento(e, { tipo: "ajuste" }, { partes: acao.valor });
    }
    case "bica": {
      if (!e.config.bicas.ajustavel) return recusa(e, "bicas-travadas");
      const b = e.bicas[acao.indice];
      if (!b) return recusa(e, "fora-do-limite");
      const bicas = e.bicas.map((x, i) => (i === acao.indice ? { ...x, aberta: !x.aberta } : x));
      return comEvento(e, { tipo: "bica", indice: acao.indice, aberta: !b.aberta }, { bicas });
    }
    case "bicas": {
      if (!e.config.bicas.ajustavel) return recusa(e, "bicas-travadas");
      const k = Math.round(acao.abertas);
      if (k < 0 || k > e.bicas.length) return recusa(e, "fora-do-limite");
      const bicas = e.bicas.map((x, i) => ({ ...x, aberta: i < k }));
      return comEvento(e, { tipo: "ajuste" }, { bicas });
    }
    case "carga": {
      const faixa = e.config.carga;
      if (!faixa) return recusa(e, "carga-travada");
      if (e.cargaTravada) return recusa(e, "carga-travada");
      const q = Math.round(acao.quantidade);
      if (q < faixa.minimo || q > faixa.maximo) return recusa(e, "fora-do-limite");
      const esteira = pilhasIniciais(e.config, q);
      return comEvento(e, { tipo: "carga", quantidade: q }, {
        esteira,
        pilha: esteira[0] ? chave(esteira[0].tamanho) : null,
      });
    }
    case "repartir": {
      const p = pilhaDe(e.esteira, e.pilha);
      if (!p) return recusa(e, e.esteira.length === 0 ? "pilha-vazia" : "sem-pilha");
      const abertas = bicasAbertas(e);
      if (abertas.length === 0) return recusa(e, "sem-bica-aberta");
      if (e.config.voltasMax !== undefined && e.voltas >= e.config.voltasMax) return recusa(e, "limite-voltas");
      const pedido = e.lote * abertas.length;
      if (p.quantidade < pedido) {
        return comEvento(e, {
          tipo: "engasgo",
          tamanho: chave(p.tamanho),
          lote: e.lote,
          abertas: abertas.length,
          pedido,
          ha: p.quantidade,
        });
      }
      const esteira = removerPecas(e.esteira, p.tamanho, pedido);
      const bicas = e.bicas.map((b) => (b.aberta ? { ...b, pecas: adicionarPecas(b.pecas, p.tamanho, e.lote) } : b));
      const aindaHa = pilhaDe(esteira, e.pilha);
      return comEvento(
        e,
        { tipo: "volta", tamanho: chave(p.tamanho), lote: e.lote, bicas: abertas },
        {
          esteira,
          bicas,
          voltas: e.voltas + 1,
          cargaTravada: true,
          pilha: aindaHa ? e.pilha : esteira[0] ? chave(esteira[0].tamanho) : null,
        },
      );
    }
    case "fatiar": {
      const f = e.config.fatiador;
      if (!f) return recusa(e, "sem-fatiador");
      if (!f.partes.includes(e.partes)) return recusa(e, "partes-invalidas");
      const p = pilhaDe(e.esteira, e.pilha);
      if (!p) return recusa(e, e.esteira.length === 0 ? "pilha-vazia" : "sem-pilha");
      const novo = divide(p.tamanho, inteiro(e.partes));
      if (novo.d > f.denominadorMaximo) return recusa(e, "pedaco-pequeno-demais");
      const q = acao.quantidade === "todas" ? p.quantidade : Math.min(Math.max(1, Math.round(acao.quantidade)), p.quantidade);
      const esteira = adicionarPecas(removerPecas(e.esteira, p.tamanho, q), novo, q * e.partes);
      return comEvento(
        e,
        { tipo: "fatia", tamanho: chave(p.tamanho), partes: e.partes, quantidade: q, novo: chave(novo) },
        { esteira, pilha: chave(novo), cargaTravada: true },
      );
    }
    case "fechar": {
      const sobra = e.esteira;
      let bandeja = [...e.bandeja];
      for (const p of sobra) bandeja = adicionarPecas(bandeja, p.tamanho, p.quantidade);
      return comEvento(e, { tipo: "fechou", sobra }, { esteira: [], bandeja, fechada: true, pilha: null });
    }
    case "desfazer":
    case "recomecar":
      return e;
  }
}

/** Ações que mudam o material da máquina entram no histórico; ajustes e recusas não. */
function mudouMaterial(antes: EstadoBancada, depois: EstadoBancada): boolean {
  return (
    antes.esteira !== depois.esteira ||
    antes.bicas !== depois.bicas ||
    antes.bandeja !== depois.bandeja ||
    antes.fechada !== depois.fechada
  );
}

/** Opera a bancada com histórico: desfazer e recomeçar sempre existem. */
export function operar(b: Bancada, acao: AcaoBancada): Bancada {
  if (acao.tipo === "desfazer") {
    const anterior = b.passado[b.passado.length - 1];
    if (!anterior) return b;
    return {
      atual: { ...anterior, evento: { tipo: "ajuste" }, seq: b.atual.seq + 1 },
      passado: b.passado.slice(0, -1),
    };
  }
  if (acao.tipo === "recomecar") {
    const novo = criarEstado(b.atual.config);
    return { atual: { ...novo, evento: { tipo: "ajuste" }, seq: b.atual.seq + 1 }, passado: [] };
  }
  const depois = aplicar(b.atual, acao);
  if (!mudouMaterial(b.atual, depois)) return { atual: depois, passado: b.passado };
  return { atual: depois, passado: [...b.passado, b.atual].slice(-TETO_HISTORICO) };
}

export function operarVarias(b: Bancada, acoes: readonly AcaoBancada[]): Bancada {
  return acoes.reduce(operar, b);
}

/* ---------- Leituras para a tela e para os validadores ---------- */

export function quantidadesPorBica(e: EstadoBancada, indices: readonly number[] = bicasEmUso(e)): Racional[] {
  return indices.map((i) => quantidadeNaBica(e.bicas[i]));
}

export function todasIguais(valores: readonly Racional[]): boolean {
  return valores.every((v) => igual(v, valores[0]));
}

export function pecasNaEsteiraComoInteiros(e: EstadoBancada): number {
  return contarPecas(e.esteira);
}

export { deChave, ZERO };

/** Confere se um valor salvo parece um estado de bancada (para miniaturas do Caderno). */
export function ehEstadoBancada(x: unknown): x is EstadoBancada {
  if (typeof x !== "object" || x === null) return false;
  const e = x as Partial<EstadoBancada>;
  return (
    typeof e.config === "object" &&
    e.config !== null &&
    typeof e.config.pele === "string" &&
    Array.isArray(e.esteira) &&
    Array.isArray(e.bicas) &&
    Array.isArray(e.bandeja)
  );
}
