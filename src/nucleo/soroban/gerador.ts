/**
 * O gerador de rodadas do soroban. Determinístico pela semente. Sorteia operações e filtra pelo
 * plano: uma operação de foco tem pelo menos um lance com a técnica do foco e nenhuma técnica que
 * o jogador ainda não viu. Os candidatos de cada forma são enumerados uma vez (e guardados), e o
 * sorteio escolhe entre os que passam: nunca falta operação, e a mesma semente dá a mesma rodada.
 *
 * | Foco              | Operações                                                               |
 * | Ler e mostrar     | 3 de mostrar e 3 de ler, alternadas; primeira rodada até 99, depois até 999 |
 * | Contas diretas    | somas e subtrações até 99, todas diretas                                 |
 * | Complemento de 5  | 1ª rodada: um algarismo com um, ou dois com um; depois dois com dois; metade subtração |
 * | Complemento de 10 | igual, sem "juntos" (e sem cadeia)                                       |
 * | 5 e 10 juntos     | com "juntos"; cadeia permitida                                           |
 * | Soroban imaginado | sombra e de cabeça: dois com dois, com complementos; ditado: 3 ou 4 números de um algarismo, depois de dois |
 */
import { aleatorio, type Aleatorio } from "../geradores/aleatorio";
import type { ItemRodada, Nivel } from "./item";
import { lancesDaOperacao, operacaoValida, parciaisDoDitado, type Operacao } from "./operacao";
import type { Marca } from "./plano";
import { HASTES_PADRAO } from "./soroban";
import { MARCA_DA_TECNICA, TECNICAS_SOROBAN, type TecnicaSoroban } from "./tecnicas";

/** As marcas (fora o mostrar) que os lances da operação usam. */
export function marcasDaOperacao(op: Operacao, hastes: number = HASTES_PADRAO): Set<Marca> {
  const s = new Set<Marca>();
  for (const l of lancesDaOperacao(op, hastes)) if (l.lance.tipo !== "mostrar") for (const m of l.plano.marcas) s.add(m);
  return s;
}

interface Candidato {
  readonly op: Operacao;
  readonly chave: string;
  readonly marcas: ReadonlySet<Marca>;
}

type Forma = "um-ou-dois-com-um" | "dois-com-dois" | "ate-99";

const CANDIDATOS = new Map<string, Candidato[]>();

function intervalo(de: number, ate: number): number[] {
  return Array.from({ length: ate - de + 1 }, (_, i) => de + i);
}

/** Todas as somas ou subtrações de uma forma, com as marcas de cada uma. */
function candidatos(tipo: "somar" | "subtrair", forma: Forma): Candidato[] {
  const chave = `${tipo}:${forma}`;
  const guardado = CANDIDATOS.get(chave);
  if (guardado) return guardado;
  const as = forma === "dois-com-dois" ? intervalo(10, 99) : intervalo(1, 99);
  const bs = forma === "um-ou-dois-com-um" ? intervalo(1, 9) : forma === "dois-com-dois" ? intervalo(10, 99) : intervalo(1, 99);
  const lista: Candidato[] = [];
  for (const a of as) {
    for (const b of bs) {
      const op: Operacao = { tipo, a, b };
      const r = tipo === "somar" ? a + b : a - b;
      if (r < 1 || !operacaoValida(op)) continue;
      if (forma === "ate-99" && r > 99) continue;
      lista.push({ op, chave: JSON.stringify(op), marcas: marcasDaOperacao(op) });
    }
  }
  CANDIDATOS.set(chave, lista);
  return lista;
}

/** As marcas que as técnicas vistas permitem (a cadeia só com "5 e 10 juntos"). */
export function marcasPermitidas(vistas: readonly string[]): Set<Marca> {
  const s = new Set<Marca>();
  for (const t of vistas) {
    const m = MARCA_DA_TECNICA[t as TecnicaSoroban];
    if (m) s.add(m);
    if (t === TECNICAS_SOROBAN.juntos) s.add("cadeia");
  }
  return s;
}

function cabe(c: Candidato, permitidas: ReadonlySet<Marca>, exige: readonly Marca[]): boolean {
  for (const m of c.marcas) if (!permitidas.has(m)) return false;
  return exige.length === 0 || exige.some((m) => c.marcas.has(m));
}

const FILTRADOS = new Map<string, Candidato[]>();

/** Sorteia um candidato que passa no filtro e ainda não está na rodada. */
function sortear(rng: Aleatorio, nome: string, lista: readonly Candidato[], permitidas: ReadonlySet<Marca>, exige: readonly Marca[], usadas: Set<string>): Operacao | null {
  const chave = `${nome}|${[...permitidas].sort().join(",")}|${exige.join(",")}`;
  let filtrados = FILTRADOS.get(chave);
  if (!filtrados) {
    filtrados = lista.filter((c) => cabe(c, permitidas, exige));
    FILTRADOS.set(chave, filtrados);
  }
  const bons = filtrados.filter((c) => !usadas.has(c.chave));
  if (bons.length === 0) return null;
  const c = rng.escolher(bons);
  usadas.add(c.chave);
  return c.op;
}

export interface PedidoOperacao {
  readonly tecnica: TecnicaSoroban;
  /** Índice da operação dentro do bloco desta técnica (alterna soma e subtração; mostrar e ler). */
  readonly indice: number;
  /** A primeira rodada desta técnica (números menores). */
  readonly primeira: boolean;
  /** As técnicas que o jogador já viu, com a do foco. */
  readonly vistas: readonly string[];
  /** No soroban imaginado: o nível decide a forma (o ditado pede outra operação). */
  readonly nivel: Nivel;
  /** No ditado: números de dois algarismos. */
  readonly ditadoDeDois: boolean;
}

function gerarDitado(rng: Aleatorio, deDois: boolean, usadas: Set<string>): Operacao {
  for (let tentativa = 0; tentativa < 400; tentativa++) {
    const quantos = rng.inteiro(3, 4);
    const maior = deDois ? 99 : 9;
    const menor = deDois ? 10 : 1;
    const numeros: number[] = [rng.inteiro(menor, maior)];
    let t = numeros[0];
    let subtracoes = 0;
    for (let i = 1; i < quantos; i++) {
      const n = rng.inteiro(menor, maior);
      // Soma e subtração misturadas, nenhum parcial negativo.
      const tira = t - n >= 0 && (rng.proximo() < 0.45 || t + n > 999);
      if (tira) subtracoes++;
      numeros.push(tira ? -n : n);
      t += tira ? -n : n;
    }
    const op: Operacao = { tipo: "ditado", numeros };
    if (subtracoes === 0 || subtracoes === quantos - 1 || !operacaoValida(op) || usadas.has(JSON.stringify(op))) continue;
    usadas.add(JSON.stringify(op));
    return op;
  }
  const reserva: Operacao = deDois ? { tipo: "ditado", numeros: [45, 27, -38] } : { tipo: "ditado", numeros: [7, -3, 5] };
  return reserva;
}

/** Uma operação para uma técnica. */
export function gerarOperacao(rng: Aleatorio, p: PedidoOperacao, usadas: Set<string>): Operacao {
  const permitidas = marcasPermitidas(p.vistas);
  const subtrai = p.indice % 2 === 1;
  const tipo = subtrai ? "subtrair" : "somar";
  const outra = subtrai ? "somar" : "subtrair";
  const tentar = (forma: Forma, exige: readonly Marca[], perm: ReadonlySet<Marca>) =>
    sortear(rng, `${tipo}:${forma}`, candidatos(tipo, forma), perm, exige, usadas) ?? sortear(rng, `${outra}:${forma}`, candidatos(outra, forma), perm, exige, usadas);
  switch (p.tecnica) {
    case TECNICAS_SOROBAN.ler: {
      const teto = p.primeira ? 99 : 999;
      for (let i = 0; i < 200; i++) {
        const valor = rng.inteiro(p.primeira ? 1 : 10, teto);
        const op: Operacao = p.indice % 2 === 0 ? { tipo: "mostrar", valor } : { tipo: "ler", valor };
        if (usadas.has(JSON.stringify(op))) continue;
        usadas.add(JSON.stringify(op));
        return op;
      }
      return p.indice % 2 === 0 ? { tipo: "mostrar", valor: 23 } : { tipo: "ler", valor: 47 };
    }
    case TECNICAS_SOROBAN.diretas:
      return tentar("ate-99", ["direto"], new Set<Marca>(["direto"])) ?? { tipo: "somar", a: 21, b: 13 };
    case TECNICAS_SOROBAN.imaginado: {
      if (p.nivel === "ditado") return gerarDitado(rng, p.ditadoDeDois, usadas);
      return tentar("dois-com-dois", ["complemento-5", "complemento-10", "juntos"], permitidas) ?? { tipo: "somar", a: 48, b: 25 };
    }
    default: {
      const marca = MARCA_DA_TECNICA[p.tecnica];
      if (!marca) return { tipo: "somar", a: 21, b: 13 };
      const forma: Forma = p.primeira ? "um-ou-dois-com-um" : "dois-com-dois";
      return tentar(forma, [marca], permitidas) ?? tentar("um-ou-dois-com-um", [marca], permitidas) ?? { tipo: "somar", a: 3, b: 4 };
    }
  }
}

/** O que a rodada pede (o treino genérico decide o foco; aqui se decide como fica no soroban). */
export interface PedidoRodada {
  readonly semente: number;
  readonly tipo: "tecnica" | "revisao" | "manutencao";
  /** A técnica do foco (rodada de técnica). */
  readonly foco: TecnicaSoroban | null;
  /** As técnicas que faltam (revisão). */
  readonly faltam: readonly TecnicaSoroban[];
  /** As técnicas já apresentadas, com a do foco. */
  readonly vistas: readonly TecnicaSoroban[];
  /** Quantas rodadas já contaram para cada técnica. */
  readonly rodadas: Readonly<Partial<Record<TecnicaSoroban, number>>>;
  /** O estágio de cada técnica (1, 2 ou 3). */
  readonly estagios: Readonly<Record<TecnicaSoroban, 1 | 2 | 3>>;
  readonly operacoes: number;
  readonly intercaladas: number;
}

/** O nível do soroban imaginado, pela rodada: sombra, depois de cabeça, depois ditado. */
export function nivelDoImaginado(rodadasQueContaram: number): Nivel {
  return rodadasQueContaram <= 0 ? "sombra" : rodadasQueContaram === 1 ? "de-cabeca" : "ditado";
}

/** Na primeira rodada de uma técnica, duas com o Nônio; depois, sozinho (estágio 1) ou sem os algarismos (estágio 2). */
export function nivelDaPosicao(indice: number, primeira: boolean, estagio: 1 | 2 | 3): Nivel {
  if (primeira) return indice < 2 ? "com-nonio" : "sozinho";
  return estagio === 1 ? "sozinho" : "sem-algarismos";
}

/** As posições das intercaladas: de duas em duas a partir da última, longe das duas primeiras (6 e 2: a 4ª e a 6ª). */
export function posicoesIntercaladas(total: number, quantas: number): number[] {
  const saida: number[] = [];
  for (let k = 0; k < quantas; k++) {
    const i = total - 1 - 2 * k;
    if (i >= 2) saida.push(i);
  }
  return saida.sort((a, b) => a - b);
}

const TECNICAS_DE_MAO: readonly TecnicaSoroban[] = [TECNICAS_SOROBAN.ler, TECNICAS_SOROBAN.diretas, TECNICAS_SOROBAN.complemento5, TECNICAS_SOROBAN.complemento10, TECNICAS_SOROBAN.juntos];

/** A rodada: seis itens (operação, nível, técnica). */
export function gerarRodada(p: PedidoRodada): ItemRodada[] {
  const rng = aleatorio(p.semente);
  const usadas = new Set<string>();
  const vistas: string[] = [...p.vistas];
  const itens: ItemRodada[] = [];
  const rodadasDe = (t: TecnicaSoroban) => p.rodadas[t] ?? 0;
  const contador = new Map<TecnicaSoroban, number>();
  const proximoIndice = (t: TecnicaSoroban) => {
    const i = contador.get(t) ?? 0;
    contador.set(t, i + 1);
    return i;
  };
  const item = (tecnica: TecnicaSoroban, nivel: Nivel): ItemRodada => {
    const nImag = rodadasDe(TECNICAS_SOROBAN.imaginado);
    const operacao = gerarOperacao(
      rng,
      { tecnica, indice: proximoIndice(tecnica), primeira: rodadasDe(tecnica) === 0 && p.tipo === "tecnica", vistas, nivel, ditadoDeDois: p.tipo === "manutencao" || nImag >= 3 },
      usadas,
    );
    return { operacao, nivel, tecnica };
  };

  if (p.tipo === "manutencao") {
    const ciclo: Nivel[] = ["sombra", "de-cabeca", "ditado"];
    for (let i = 0; i < p.operacoes; i++) itens.push(item(TECNICAS_SOROBAN.imaginado, ciclo[i % 3]));
    return itens;
  }

  if (p.tipo === "revisao") {
    const faltam = p.faltam.length > 0 ? p.faltam : [TECNICAS_SOROBAN.diretas];
    for (let i = 0; i < p.operacoes; i++) {
      const t = faltam[i % faltam.length];
      const nivel = t === TECNICAS_SOROBAN.imaginado ? nivelDoImaginado(rodadasDe(t)) : nivelDaPosicao(i, false, p.estagios[t]);
      itens.push(item(t, nivel));
    }
    return itens;
  }

  const foco = p.foco ?? TECNICAS_SOROBAN.ler;
  if (foco === TECNICAS_SOROBAN.imaginado) {
    const nivel = nivelDoImaginado(rodadasDe(foco));
    for (let i = 0; i < p.operacoes; i++) itens.push(item(foco, nivel));
    return itens;
  }
  const primeira = rodadasDe(foco) === 0;
  // A partir da segunda técnica vista, duas operações são de técnicas já vistas (intercaladas).
  const outras = TECNICAS_DE_MAO.filter((t) => t !== foco && p.vistas.includes(t));
  const posicoes = outras.length > 0 ? posicoesIntercaladas(p.operacoes, p.intercaladas) : [];
  let k = 0;
  for (let i = 0; i < p.operacoes; i++) {
    const nivel = nivelDaPosicao(i, primeira, p.estagios[foco]);
    if (posicoes.includes(i)) {
      // As intercaladas giram entre as técnicas já vistas, da mais recente para a mais antiga.
      const t = outras[outras.length - 1 - (k % outras.length)];
      k++;
      itens.push(item(t, nivel));
    } else itens.push(item(foco, nivel));
  }
  return itens;
}

/** Confere uma rodada contra as regras (usado nos testes e no laboratório). */
export function problemasDaOperacao(op: Operacao, tecnica: TecnicaSoroban, vistas: readonly string[]): string[] {
  const p: string[] = [];
  if (!operacaoValida(op)) p.push("fora das regras (negativo, acima de 999 ou zero)");
  if (op.tipo === "ditado") {
    if (parciaisDoDitado(op.numeros).some((t) => t < 0)) p.push("parcial negativo");
    return p;
  }
  if (op.tipo === "mostrar" || op.tipo === "ler") return p;
  const marcas = marcasDaOperacao(op);
  const permitidas = tecnica === TECNICAS_SOROBAN.diretas ? new Set<Marca>(["direto"]) : marcasPermitidas(vistas);
  for (const m of marcas) if (!permitidas.has(m)) p.push(`técnica ainda não vista: ${m}`);
  const exige = tecnica === TECNICAS_SOROBAN.imaginado ? (["complemento-5", "complemento-10", "juntos"] as Marca[]) : [MARCA_DA_TECNICA[tecnica]].filter((m): m is Exclude<Marca, "cadeia"> => m !== undefined);
  if (exige.length > 0 && !exige.some((m) => marcas.has(m))) p.push("nenhum lance da técnica");
  return p;
}
