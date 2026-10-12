/**
 * Validadores conferem PROPRIEDADES DO ESTADO FINAL, nunca o caminho.
 * É isso que aceita toda solução correta por construção.
 */
import {
  chave,
  comoRacional,
  divide,
  ehZero,
  formatar,
  igual,
  inteiro,
  maiorQue,
  parteInteira,
  somaTodos,
  type Racional,
} from "../../racional/racional";
import {
  bicasEmUso,
  contarPecas,
  quantidadeDe,
  quantidadeNaBica,
  quantidadesPorBica,
  todasIguais,
  totalGeral,
} from "./bancada";
import type { EstadoBancada } from "./tipos";
import { aindaFecha } from "./viabilidade";

export type NomeValidadorBancada =
  | "partilha.fechada"
  | "partilha.carga-exata"
  | "transporte.tudo-saiu"
  | "partilha.solucoes-distintas"
  | "partilha.unitarias-distintas"
  | "maquina.mostra-divisao"
  | "partilha.inteiras-por-bica"
  | "partilha.composicao";

export const VALIDADORES_BANCADA: readonly NomeValidadorBancada[] = [
  "partilha.fechada",
  "partilha.carga-exata",
  "transporte.tudo-saiu",
  "partilha.solucoes-distintas",
  "partilha.unitarias-distintas",
  "maquina.mostra-divisao",
  "partilha.inteiras-por-bica",
  "partilha.composicao",
];

export type Parametros = Readonly<Record<string, string | number | boolean>>;

export type MotivoValidacao =
  | "ok"
  | "nenhuma-bica"
  | "desiguais"
  | "mesma-contagem-quantidades-diferentes"
  | "sobra-da-mais-uma-volta"
  | "sobra-pode-ser-cortada"
  | "sobra-nao-fecha"
  | "carga-diferente"
  | "sobra-diferente"
  | "passou-do-teto"
  | "ficou-carga"
  | "bicas-demais"
  | "pedaco-repetido"
  | "pedaco-nao-unitario"
  | "solucao-repetida"
  | "falta-solucao"
  | "carga-inicial-diferente"
  | "bicas-diferentes"
  | "voltas-demais"
  | "esteira-vazia"
  | "composicao-diferente";

export const MOTIVOS_VALIDACAO: readonly MotivoValidacao[] = [
  "ok",
  "nenhuma-bica",
  "desiguais",
  "mesma-contagem-quantidades-diferentes",
  "sobra-da-mais-uma-volta",
  "sobra-pode-ser-cortada",
  "sobra-nao-fecha",
  "carga-diferente",
  "sobra-diferente",
  "passou-do-teto",
  "ficou-carga",
  "bicas-demais",
  "pedaco-repetido",
  "pedaco-nao-unitario",
  "solucao-repetida",
  "falta-solucao",
  "carga-inicial-diferente",
  "bicas-diferentes",
  "voltas-demais",
  "esteira-vazia",
  "composicao-diferente",
];

export interface ResultadoValidacao {
  readonly ok: boolean;
  readonly motivo: MotivoValidacao;
  readonly equivoco: string | null;
  /** Valores para a resposta da máquina ("uma volta de {lote} pede {pedido}"). */
  readonly medidas: Readonly<Record<string, string>>;
  /** Solução aceita que não basta sozinha (soluções distintas: falta outra). */
  readonly parcial?: boolean;
  /** Assinatura da partilha, para reconhecer soluções repetidas. */
  readonly assinatura?: string;
}

export interface ContextoValidacao {
  /** Assinaturas das partilhas já aceitas neste passo. */
  readonly solucoes?: readonly string[];
}

export function texto(r: Racional): string {
  return formatar(r, { misto: true });
}

function resultado(
  ok: boolean,
  motivo: MotivoValidacao,
  medidas: Record<string, string> = {},
  equivoco: string | null = null,
): ResultadoValidacao {
  return { ok, motivo, equivoco, medidas };
}

const OK = resultado(true, "ok");

/** Assinatura de uma partilha: os pedaços de cada bica, sem importar a ordem das bicas. */
export function assinaturaPartilha(e: EstadoBancada): string {
  return bicasEmUso(e)
    .map((i) =>
      e.bicas[i].pecas
        .map((p) => `${chave(p.tamanho)}x${p.quantidade}`)
        .sort()
        .join("+"),
    )
    .sort()
    .join("|");
}

/** Bicas iguais + regra da sobra. Base dos outros validadores. */
function conferirFechada(e: EstadoBancada): ResultadoValidacao {
  const uso = bicasEmUso(e);
  if (uso.length === 0) return resultado(false, "nenhuma-bica");
  const qs = quantidadesPorBica(e, uso);
  if (!todasIguais(qs)) {
    const contagens = uso.map((i) => contarPecas(e.bicas[i].pecas));
    const medidas = {
      quantidades: qs.map(texto).join(", "),
      pedacos: String(contagens[0]),
      maior: texto(qs.reduce((a, b) => (maiorQue(b, a) ? b : a))),
      menor: texto(qs.reduce((a, b) => (maiorQue(a, b) ? b : a))),
    };
    if (contagens.every((c) => c === contagens[0])) {
      return resultado(false, "mesma-contagem-quantidades-diferentes", medidas, "conta-pedacos");
    }
    return resultado(false, "desiguais", medidas);
  }
  const B = uso.length;
  const sobra = quantidadeDe(e.esteira);
  const medidas = { sobra: texto(sobra), bicas: String(B), cada: texto(qs[0]), pecasSobra: String(contarPecas(e.esteira)) };
  const daMaisUmaVolta = e.esteira.some((p) => p.quantidade >= B);
  if (e.config.fatiador) {
    if (ehZero(sobra)) return resultado(true, "ok", medidas);
    if (daMaisUmaVolta) return resultado(false, "sobra-da-mais-uma-volta", medidas, "parou-cedo");
    if (aindaFecha(e) === false) return resultado(false, "sobra-nao-fecha", medidas);
    return resultado(false, "sobra-pode-ser-cortada", medidas, "resto-jogado-fora");
  }
  if (daMaisUmaVolta) return resultado(false, "sobra-da-mais-uma-volta", medidas, "parou-cedo");
  return resultado(true, "ok", medidas);
}

function conferirCargaExata(e: EstadoBancada, p: Parametros): ResultadoValidacao {
  const carga = comoRacional(String(p.carga));
  const sobraEsperada = comoRacional(String(p.sobra ?? "0"));
  const uso = bicasEmUso(e);
  if (uso.length === 0) return resultado(false, "nenhuma-bica", { esperado: texto(carga) });
  for (const i of uso) {
    const q = quantidadeNaBica(e.bicas[i]);
    if (!igual(q, carga)) {
      return resultado(false, "carga-diferente", {
        esperado: texto(carga),
        carga: texto(q),
        bica: String(i + 1),
        bicas: String(uso.length),
        sobra: texto(quantidadeDe(e.esteira)),
      });
    }
  }
  const sobra = quantidadeDe(e.esteira);
  if (!igual(sobra, sobraEsperada)) {
    const medidas = { sobra: texto(sobra), esperado: texto(sobraEsperada), bicas: String(uso.length), cada: texto(carga) };
    return resultado(false, "sobra-diferente", medidas);
  }
  return resultado(true, "ok", { cada: texto(carga), bicas: String(uso.length), sobra: texto(sobra) });
}

function conferirTransporte(e: EstadoBancada, p: Parametros): ResultadoValidacao {
  const teto = comoRacional(String(p.teto));
  const uso = bicasEmUso(e);
  if (uso.length === 0) return resultado(false, "nenhuma-bica", { teto: texto(teto) });
  const sobra = quantidadeDe(e.esteira);
  if (!ehZero(sobra)) {
    return resultado(
      false,
      "ficou-carga",
      { sobra: texto(sobra), bicas: String(uso.length), teto: texto(teto) },
      "arredondou-para-baixo",
    );
  }
  for (const i of uso) {
    const q = quantidadeNaBica(e.bicas[i]);
    if (maiorQue(q, teto)) {
      return resultado(false, "passou-do-teto", { bica: String(i + 1), carga: texto(q), teto: texto(teto) });
    }
  }
  const total = somaTodos(uso.map((i) => quantidadeNaBica(e.bicas[i])));
  const razao = divide(total, teto);
  const minimo = ehZero(razao) ? 0 : razao.d === 1 ? razao.n : parteInteira(razao) + 1;
  if (uso.length > minimo) {
    return resultado(false, "bicas-demais", { bicas: String(uso.length), minimo: String(minimo), teto: texto(teto) });
  }
  return resultado(true, "ok", { bicas: String(uso.length), teto: texto(teto) });
}

function conferirUnitarias(e: EstadoBancada): ResultadoValidacao {
  const base = conferirFechada(e);
  if (!base.ok) return base;
  for (const i of bicasEmUso(e)) {
    for (const p of e.bicas[i].pecas) {
      if (p.tamanho.n !== 1) {
        return resultado(false, "pedaco-nao-unitario", { bica: String(i + 1), pedaco: texto(p.tamanho) });
      }
      if (p.quantidade > 1) {
        return resultado(false, "pedaco-repetido", {
          bica: String(i + 1),
          pedaco: texto(p.tamanho),
          vezes: String(p.quantidade),
        });
      }
    }
  }
  return base;
}

function conferirMostraDivisao(e: EstadoBancada, p: Parametros): ResultadoValidacao {
  const dividendo = comoRacional(String(p.dividendo));
  const divisor = Number(p.divisor);
  const total = totalGeral(e);
  if (!igual(total, dividendo)) {
    return resultado(false, "carga-inicial-diferente", { carga: texto(total), esperado: texto(dividendo) });
  }
  const base = conferirFechada(e);
  if (!base.ok) return base;
  const uso = bicasEmUso(e);
  if (uso.length === divisor) return base;
  if (p.aceitaMedida === true && ehZero(quantidadeDe(e.esteira))) {
    const cada = quantidadeNaBica(e.bicas[uso[0]]);
    if (igual(cada, inteiro(divisor))) return base;
  }
  return resultado(false, "bicas-diferentes", { bicas: String(uso.length), esperado: String(divisor) });
}

function conferirSolucoesDistintas(e: EstadoBancada, p: Parametros, ctx: ContextoValidacao): ResultadoValidacao {
  const base = conferirFechada(e);
  if (!base.ok) return base;
  const n = Number(p.n ?? 2);
  const ass = assinaturaPartilha(e);
  const anteriores = ctx.solucoes ?? [];
  if (anteriores.includes(ass)) {
    return { ...resultado(false, "solucao-repetida", { feitas: String(anteriores.length), n: String(n) }), assinatura: ass };
  }
  const feitas = anteriores.length + 1;
  if (feitas < n) {
    return { ...resultado(false, "falta-solucao", { feitas: String(feitas), n: String(n) }), parcial: true, assinatura: ass };
  }
  return { ...resultado(true, "ok", { feitas: String(feitas), n: String(n) }), assinatura: ass };
}

/**
 * Cada bica em uso com exatamente N peças inteiras, e a esteira ainda com peças: o passo da mão
 * ("uma saca em cada carroça"), antes de a alavanca terminar o serviço.
 */
function conferirInteirasPorBica(e: EstadoBancada, p: Parametros): ResultadoValidacao {
  const n = Number(p.n ?? 1);
  const uso = bicasEmUso(e);
  if (uso.length === 0) return resultado(false, "nenhuma-bica", { esperado: String(n) });
  for (const i of uso) {
    const pecas = e.bicas[i].pecas;
    const so = pecas.length === 1 && pecas[0].tamanho.n === 1 && pecas[0].tamanho.d === 1 && pecas[0].quantidade === n;
    if (!so) {
      return resultado(false, "carga-diferente", {
        esperado: String(n),
        carga: texto(quantidadeNaBica(e.bicas[i])),
        bica: String(i + 1),
        bicas: String(uso.length),
        sobra: texto(quantidadeDe(e.esteira)),
      });
    }
  }
  if (e.esteira.length === 0) return resultado(false, "esteira-vazia", { esperado: String(n), bicas: String(uso.length) });
  return resultado(true, "ok", { cada: String(n), bicas: String(uso.length), sobra: texto(quantidadeDe(e.esteira)) });
}

/** "2x1/8" → texto curto ("2 de 1/8"). */
function lerComposicao(s: string): { tamanho: Racional; quantidade: number }[] {
  return s
    .split("+")
    .filter((x) => x.length > 0)
    .map((x) => {
      const [k, t] = x.split("x");
      return { quantidade: Number(k), tamanho: comoRacional(t) };
    });
}

function textoComposicao(pecas: readonly { tamanho: Racional; quantidade: number }[]): string {
  if (pecas.length === 0) return "nada";
  return pecas.map((p) => `${p.quantidade} de ${texto(p.tamanho)}`).join(" e ");
}

/**
 * Composição declarada por bica: params `bica1`, `bica2`... no formato "2x1/8" ou "1x1/4+1x1/8".
 * Confere só as bicas declaradas; o que ficou na esteira não importa.
 */
function conferirComposicao(e: EstadoBancada, p: Parametros): ResultadoValidacao {
  for (let i = 0; i < e.bicas.length; i++) {
    const declarada = p[`bica${i + 1}`];
    if (declarada === undefined) continue;
    const pedido = lerComposicao(String(declarada));
    const tem = e.bicas[i].pecas;
    const bate =
      pedido.length === tem.length &&
      pedido.every((x) => tem.some((y) => igual(y.tamanho, x.tamanho) && y.quantidade === x.quantidade));
    if (!bate) {
      return resultado(false, "composicao-diferente", { bica: String(i + 1), pedido: textoComposicao(pedido), tem: textoComposicao(tem) });
    }
  }
  const uso = bicasEmUso(e);
  return resultado(true, "ok", { quantidades: quantidadesPorBica(e, uso).map(texto).join(", "), bicas: String(uso.length) });
}

export function validarBancada(
  nome: NomeValidadorBancada,
  params: Parametros,
  e: EstadoBancada,
  ctx: ContextoValidacao = {},
): ResultadoValidacao {
  if (typeof params.voltasMax === "number" && e.voltas > params.voltasMax) {
    return resultado(false, "voltas-demais", { voltas: String(e.voltas), maximo: String(params.voltasMax) });
  }
  switch (nome) {
    case "partilha.fechada":
      return conferirFechada(e);
    case "partilha.carga-exata":
      return conferirCargaExata(e, params);
    case "transporte.tudo-saiu":
      return conferirTransporte(e, params);
    case "partilha.solucoes-distintas":
      return conferirSolucoesDistintas(e, params, ctx);
    case "partilha.unitarias-distintas":
      return conferirUnitarias(e);
    case "maquina.mostra-divisao":
      return conferirMostraDivisao(e, params);
    case "partilha.inteiras-por-bica":
      return conferirInteirasPorBica(e, params);
    case "partilha.composicao":
      return conferirComposicao(e, params);
  }
}

/** Repartiu só com pedaços de numerador 1, sem repetir tamanho (a marca que o museu reconhece). */
export function ehPartilhaUnitaria(e: EstadoBancada): boolean {
  return conferirUnitarias(e).ok;
}

export { OK as VALIDACAO_OK };
