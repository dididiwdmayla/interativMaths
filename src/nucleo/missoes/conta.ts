/**
 * A conta passada a caneta: no acerto, a conta do que a máquina fez, com o nome de cada termo.
 * Pura. Calculada do ESTADO FINAL da máquina, com Racional, nunca do texto do conteúdo. Só
 * existe depois do acerto (operar, aposta, previsão conferida, caminho de volta): antes, ela
 * seria a resposta. Devolve uma estrutura; a tela desenha.
 *
 * Formas: partilha exata (24 ÷ 4 = 6), quantos cabem (30 ÷ 6 = 5), com resto (26 ÷ 4 = 6, resto 2,
 * e a conta armada das voltas), com fração (5 ÷ 4 = 1 1/4, ou 5/4), transporte (26 ÷ 6 = 4, resto
 * 2, e o que a situação decide), comparação (2/8 = 1/4, com a altura dos medidores) e parte de um
 * inteiro (2 × 1/6 = 2/6: a fração da peça que o receptor ganhou).
 */
import { compara, divide, ehInteiro, ehZero, formatar, igual, inteiro, multiplica, parteInteira, soma, subtrai, type Racional } from "../racional/racional";
import { lerEmVoz } from "../racional/notacao";
import { bicasEmUso, quantidadeDe, quantidadeNaBica } from "../maquinas/bancada/bancada";
import { rodadasDaBancada, type ModelosRascunho, type PeleRascunho } from "../maquinas/bancada/rascunho";
import type { Bancada, EstadoBancada } from "../maquinas/bancada/tipos";
import type { Execucao } from "./motor";
import type { Objetivo, Passo } from "./tipos";

export type TipoConta = "partilha" | "medida" | "resto" | "fracao" | "transporte" | "comparacao" | "parte";

/** Uma linha da conta armada: o que a volta tira, o que fica e quanto cada receptor recebeu. */
export interface LinhaChave {
  readonly tira: number;
  readonly fica: number;
  readonly parcial: number;
}

/** A conta armada no método da chave, com quocientes parciais (uma linha por volta). */
export interface ContaArmada {
  readonly dividendo: number;
  readonly divisor: number;
  readonly linhas: readonly LinhaChave[];
  readonly quociente: number;
  readonly resto: number;
  /** O texto ao lado da chave: cada volta é uma linha. */
  readonly lado: string;
}

export interface Conta {
  readonly tipo: TipoConta;
  /** A linha principal, em notação: "24 ÷ 4 = 6", "26 ÷ 4 = 6, resto 2", "5 ÷ 4 = 1 1/4", "2/8 = 1/4". */
  readonly expressao: string;
  readonly dividendo: Racional | null;
  readonly divisor: Racional | null;
  readonly quociente: Racional | null;
  readonly resto: Racional | null;
  /** Nome embaixo de cada número da linha principal, na ordem (null: sem nome). */
  readonly nomes: readonly (string | null)[];
  /** "ou 5/4", ao lado do número misto. */
  readonly equivalente: string | null;
  /** Quando o quociente é fração: os dois termos dela, nomeados. */
  readonly fracao: { readonly numerador: number; readonly denominador: number } | null;
  /** A prova: "Confere: 4 × 6 = 24". */
  readonly prova: string | null;
  /** A forma da divisão com resto: "26 = 4 × 6 + 2". */
  readonly forma: string | null;
  /** Quantos cabem: "o 6 cabe 5 vezes no 30". */
  readonly leitura: string | null;
  /** O que a situação decide (transporte): "as 2 que sobram pedem mais uma carroça: 5". */
  readonly frase: string | null;
  readonly chave: ContaArmada | null;
  /** Parte de um inteiro: quantos pedaços × o tamanho de cada um = a fração recebida. */
  readonly produto: { readonly pedacos: number; readonly tamanho: Racional; readonly resultado: Racional } | null;
  /** A conta inteira por extenso, para o leitor de tela. */
  readonly extenso: string;
}

/** Os textos da conta, do conteúdo (`conteudo/conta.ts`). */
export interface ModelosConta {
  readonly nomes: {
    readonly dividendo: string;
    readonly divisor: string;
    readonly quociente: string;
    readonly resto: string;
    readonly numerador: string;
    readonly denominador: string;
    readonly pedacos: string;
    readonly cadaUm: string;
    /** "de broa": embaixo da fração recebida. */
    readonly daPeca: string;
  };
  readonly confere: string;
  readonly confereMisto: string;
  readonly cabe: string;
  readonly equivalente: string;
  readonly sobramVarias: string;
  readonly sobraUma: string;
  readonly mesmaAltura: string;
  readonly maisAlto: string;
  readonly ladoVarias: string;
  readonly ladoPrimeira: string;
  readonly ladoSeguinte: string;
  readonly ladoUma: string;
  readonly receptorNomeado: string;
}

export interface ContextoConta {
  readonly pele: PeleRascunho & { readonly receptor: PeleRascunho["receptor"] & { readonly genero: "m" | "f" } };
  readonly modelos: ModelosConta;
  readonly rascunho: ModelosRascunho;
}

/* ---------- Texto ---------- */

function preencher(modelo: string, v: Readonly<Record<string, string>>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
}

function f(r: Racional): string {
  return formatar(r, { misto: true });
}

/** A fração como está na bica, sem simplificar: dois oitavos são "2/8". */
function composicao(e: EstadoBancada, i: number): string {
  const pecas = e.bicas[i]?.pecas ?? [];
  if (pecas.length === 1) {
    const p = pecas[0];
    return p.tamanho.d === 1 ? String(p.tamanho.n * p.quantidade) : `${p.quantidade * p.tamanho.n}/${p.tamanho.d}`;
  }
  return formatar(quantidadeNaBica(e.bicas[i]));
}

/* ---------- A conta armada ---------- */

/**
 * A chave a partir dos quocientes parciais. Se as voltas não chegam ao quociente (a máquina já
 * veio com parte da carga, ou o histórico foi aparado), a diferença vira a primeira linha; se
 * passam, a conta é armada numa volta só.
 */
export function contaArmada(dividendo: number, divisor: number, parciais: readonly number[], textos: ModelosConta, receptor: string): ContaArmada {
  const quociente = Math.floor(dividendo / divisor);
  const resto = dividendo - quociente * divisor;
  let lista = parciais.filter((p) => Number.isInteger(p) && p > 0);
  const s = lista.reduce((a, b) => a + b, 0);
  if (s > quociente) lista = [quociente];
  else if (s < quociente) lista = [quociente - s, ...lista];
  if (quociente === 0) lista = [];
  let fica = dividendo;
  const linhas: LinhaChave[] = lista.map((parcial) => {
    const tira = parcial * divisor;
    fica -= tira;
    return { tira, fica, parcial };
  });
  const lado =
    linhas.length <= 1
      ? preencher(textos.ladoUma, { parcial: String(quociente), tira: String(quociente * divisor), receptor })
      : preencher(textos.ladoVarias, {
          voltas: linhas
            .map((l, i) => preencher(i === 0 ? textos.ladoPrimeira : textos.ladoSeguinte, { parcial: String(l.parcial), tira: String(l.tira), receptor }))
            .join("; "),
          quociente: String(quociente),
        });
  return { dividendo, divisor, linhas, quociente, resto, lado };
}

/**
 * A conta armada de uma linha de notação com resto ("26 ÷ 4 = 6, resto 2"), numa volta só:
 * a página do Caderno não guarda as voltas, só o que ficou passado a limpo. null se a linha
 * não é uma divisão de inteiros com resto.
 */
export function contaArmadaDaNotacao(linha: string, textos: ModelosConta, receptor: string): ContaArmada | null {
  const m = /^(\d+) ÷ (\d+) = (\d+), resto (\d+)$/.exec(linha.trim());
  if (!m) return null;
  const [dividendo, divisor, quociente, resto] = m.slice(1).map(Number);
  if (divisor === 0 || dividendo !== divisor * quociente + resto || resto >= divisor) return null;
  return contaArmada(dividendo, divisor, [quociente], textos, receptor);
}

/* ---------- O acerto ---------- */

/** O objetivo que valeu no acerto (o do desafio, quando ele foi feito). */
function objetivoDoAcerto(passo: Passo, e: Execucao): Objetivo | null {
  if (passo.tipo === "operar") return e.passo.convite === "feito" && passo.convite ? passo.convite.objetivo : passo.objetivo;
  if (passo.tipo === "aposta") return passo.objetivo;
  return null;
}

/** Só depois do acerto: operar vencido (não automático), aposta acertada, previsão que bateu. */
function houveAcerto(passo: Passo, e: Execucao): boolean {
  const ep = e.passo;
  if (ep.retorno !== "acertou") return false;
  if (passo.tipo === "operar") return ep.situacao === "vencido" && !passo.automatico;
  if (passo.tipo === "aposta") return ep.situacao === "vencido" && ep.respostaCerta === true;
  if (passo.tipo === "prever") return ep.situacao === "conferindo" && ep.respostaCerta === true;
  return false;
}

export function contaDoAcerto(passo: Passo, e: Execucao, ctx: ContextoConta): Conta | null {
  if (!houveAcerto(passo, e) || !e.bancada) return null;
  const estado = e.bancada.atual;
  const objetivo = objetivoDoAcerto(passo, e);
  const total = quantidadeDe([...estado.esteira, ...estado.bandeja, ...estado.bicas.flatMap((b) => b.pecas)]);
  const uso = bicasEmUso(estado);
  if (uso.length === 0) return null;
  const cada = quantidadeNaBica(estado.bicas[uso[0]]);
  const sobra = quantidadeDe([...estado.esteira, ...estado.bandeja]);
  const receptores = inteiro(uso.length);
  const comResto = passo.evidencias?.some((x) => x.conceito === "div.resto") ?? false;

  if (objetivo?.validador === "partilha.composicao") return comparacao(estado, ctx);
  // Com teto, tudo sai: a situação decide o que fazer com o resto (operar ou previsão).
  if (estado.config.teto !== undefined) return transporte(total, estado.config.teto, uso.length, ctx);
  // Uma parte de um inteiro: o receptor ganhou pedaços e o resto da peça ficou de fora.
  if (!ehZero(sobra) && !ehInteiro(cada)) return parte(estado, uso, ctx);

  switch (objetivo?.validador) {
    case "transporte.tudo-saiu":
      return transporte(total, Number(objetivo.params?.teto ?? 1), uso.length, ctx);
    case "partilha.carga-exata":
      if (estado.config.bicas.ajustavel) return medida(total, cada, receptores, ctx);
      return partilha(total, receptores, cada, sobra, e.bancada, comResto, ctx);
    case "maquina.mostra-divisao": {
      const divisor = Number(objetivo.params?.divisor ?? uso.length);
      if (uso.length !== divisor && igual(cada, inteiro(divisor))) return medida(total, cada, receptores, ctx);
      return partilha(total, receptores, cada, sobra, e.bancada, comResto, ctx);
    }
    default:
      return partilha(total, receptores, cada, sobra, e.bancada, comResto, ctx);
  }
}

function nomesDivisao(m: ModelosConta, comResto: boolean): (string | null)[] {
  const n = m.nomes;
  return comResto ? [n.dividendo, n.divisor, n.quociente, n.resto] : [n.dividendo, n.divisor, n.quociente];
}

/** Repartir em partes iguais: exata, com resto (inteiros) ou com fração. */
function partilha(dividendo: Racional, divisor: Racional, quociente: Racional, resto: Racional, b: Bancada, comResto: boolean, ctx: ContextoConta): Conta {
  const m = ctx.modelos;
  const temResto = !ehZero(resto);
  if (temResto || (comResto && ehInteiro(quociente) && ehInteiro(dividendo))) {
    const expressao = temResto ? `${f(dividendo)} ÷ ${f(divisor)} = ${f(quociente)}, resto ${f(resto)}` : `${f(dividendo)} ÷ ${f(divisor)} = ${f(quociente)}`;
    const forma = temResto ? `${f(dividendo)} = ${f(divisor)} × ${f(quociente)} + ${f(resto)}` : null;
    const parciais = rodadasDaBancada(b, ctx.pele, ctx.rascunho)
      .filter((r) => r.receptores === divisor.n && ehInteiro(r.cada))
      .map((r) => r.cada.n);
    const chave = ehInteiro(dividendo) && ehInteiro(divisor) && ehInteiro(quociente) && ehInteiro(resto)
      ? contaArmada(dividendo.n, divisor.n, parciais, m, ctx.pele.receptor.singular)
      : null;
    return {
      tipo: temResto ? "resto" : "partilha",
      expressao,
      dividendo,
      divisor,
      quociente,
      resto: temResto ? resto : null,
      nomes: nomesDivisao(m, temResto),
      equivalente: null,
      fracao: null,
      prova: temResto ? null : preencher(m.confere, { conta: `${f(divisor)} × ${f(quociente)} = ${f(dividendo)}` }),
      forma,
      leitura: null,
      frase: null,
      chave,
      produto: null,
      extenso: lerEmVoz(expressao),
    };
  }
  const expressao = `${f(dividendo)} ÷ ${f(divisor)} = ${f(quociente)}`;
  if (ehInteiro(quociente)) {
    return {
      tipo: "partilha",
      expressao,
      dividendo,
      divisor,
      quociente,
      resto: null,
      nomes: nomesDivisao(m, false),
      equivalente: null,
      fracao: null,
      prova: preencher(m.confere, { conta: `${f(divisor)} × ${f(quociente)} = ${f(dividendo)}` }),
      forma: null,
      leitura: null,
      frase: null,
      chave: null,
      produto: null,
      extenso: lerEmVoz(expressao),
    };
  }
  // Com fração: acima de 1, número misto (e a fração ao lado); abaixo, a fração com os termos nomeados.
  const k = parteInteira(quociente);
  const misto = k >= 1;
  let prova: string;
  if (misto) {
    const inteiros = multiplica(divisor, inteiro(k));
    const resto = subtrai(dividendo, inteiros);
    prova = preencher(m.confereMisto, { divisor: f(divisor), quociente: f(quociente), inteiros: f(inteiros), resto: f(resto), dividendo: f(dividendo) });
  } else {
    prova = preencher(m.confere, { conta: `${f(divisor)} × ${f(quociente)} = ${f(dividendo)}` });
  }
  return {
    tipo: "fracao",
    expressao,
    dividendo,
    divisor,
    quociente,
    resto: null,
    nomes: nomesDivisao(m, false),
    equivalente: misto ? preencher(m.equivalente, { fracao: formatar(quociente) }) : null,
    fracao: misto ? null : { numerador: quociente.n, denominador: quociente.d },
    prova,
    forma: null,
    leitura: null,
    frase: null,
    chave: null,
    produto: null,
    extenso: lerEmVoz(expressao),
  };
}

/** Quantos cabem: o total dividido pelo que vai em cada receptor dá quantos receptores. */
function medida(dividendo: Racional, divisor: Racional, quociente: Racional, ctx: ContextoConta): Conta {
  const m = ctx.modelos;
  const expressao = `${f(dividendo)} ÷ ${f(divisor)} = ${f(quociente)}`;
  return {
    tipo: "medida",
    expressao,
    dividendo,
    divisor,
    quociente,
    resto: null,
    nomes: nomesDivisao(m, false),
    equivalente: null,
    fracao: null,
    prova: preencher(m.confere, { conta: `${f(quociente)} × ${f(divisor)} = ${f(dividendo)}` }),
    forma: null,
    leitura: preencher(m.cabe, { divisor: f(divisor), quociente: f(quociente), dividendo: f(dividendo) }),
    frase: null,
    chave: null,
    produto: null,
    extenso: lerEmVoz(expressao),
  };
}

/** Tudo sai, até o teto: a divisão com resto e o que a situação decide fazer com ele. */
function transporte(total: Racional, teto: number, receptores: number, ctx: ContextoConta): Conta {
  const m = ctx.modelos;
  const dividendo = total;
  const divisor = inteiro(teto);
  const q = parteInteira(divide(total, inteiro(teto)));
  const quociente = inteiro(q);
  const resto = subtrai(dividendo, multiplica(divisor, quociente));
  const temResto = !ehZero(resto);
  const expressao = temResto ? `${f(dividendo)} ÷ ${teto} = ${q}, resto ${f(resto)}` : `${f(dividendo)} ÷ ${teto} = ${q}`;
  const frase = temResto
    ? preencher(igual(resto, inteiro(1)) ? m.sobraUma : m.sobramVarias, {
        resto: f(resto),
        umReceptor: `${ctx.pele.receptor.genero === "f" ? "uma" : "um"} ${ctx.pele.receptor.singular}`,
        total: String(receptores),
      })
    : null;
  return {
    tipo: "transporte",
    expressao,
    dividendo,
    divisor,
    quociente,
    resto: temResto ? resto : null,
    nomes: nomesDivisao(m, temResto),
    equivalente: null,
    fracao: null,
    prova: temResto ? null : preencher(m.confere, { conta: `${teto} × ${q} = ${f(dividendo)}` }),
    forma: temResto ? `${f(dividendo)} = ${teto} × ${q} + ${f(resto)}` : null,
    leitura: null,
    frase,
    chave: null,
    produto: null,
    extenso: lerEmVoz(expressao) + (frase ? `. ${frase}` : ""),
  };
}

/** Duas bicas comparadas: as frações como estão, e a altura do medidor como prova. */
function comparacao(e: EstadoBancada, ctx: ContextoConta): Conta | null {
  const uso = bicasEmUso(e);
  if (uso.length < 2) return null;
  const [a, b] = uso;
  const qa = quantidadeNaBica(e.bicas[a]);
  const qb = quantidadeNaBica(e.bicas[b]);
  const c = compara(qa, qb);
  const sinal = c === 0 ? "=" : c < 0 ? "<" : ">";
  const expressao = `${composicao(e, a)} ${sinal} ${composicao(e, b)}`;
  const nome = (i: number) => preencher(ctx.modelos.receptorNomeado, { receptor: ctx.pele.receptor.singular, nome: e.config.nomesBicas?.[i] ?? String(i + 1) });
  const maior = c > 0 ? a : b;
  const prova =
    c === 0
      ? preencher(ctx.modelos.mesmaAltura, { receptores: ctx.pele.receptor.plural })
      : preencher(ctx.modelos.maisAlto, { receptor: `${ctx.pele.receptor.genero === "f" ? "a" : "o"} ${nome(maior)}` });
  return {
    tipo: "comparacao",
    expressao,
    dividendo: null,
    divisor: null,
    quociente: null,
    resto: null,
    nomes: [nome(a), nome(b)],
    equivalente: null,
    fracao: null,
    prova,
    forma: null,
    leitura: null,
    frase: null,
    chave: null,
    produto: null,
    extenso: `${lerEmVoz(expressao.replace(" < ", " = ").replace(" > ", " = ")).replace("é igual a", c === 0 ? "é igual a" : c < 0 ? "é menor que" : "é maior que")}. ${prova}`,
  };
}

/** A fração de uma peça que o receptor ganhou: 2 pedaços de 1/6 são 2/6. */
function parte(e: EstadoBancada, uso: readonly number[], ctx: ContextoConta): Conta | null {
  if (uso.length !== 1) return null;
  const pecas = e.bicas[uso[0]].pecas;
  if (pecas.length !== 1) return null;
  const { tamanho, quantidade } = pecas[0];
  const resultado = multiplica(tamanho, inteiro(quantidade));
  const escrita = `${quantidade * tamanho.n}/${tamanho.d}`;
  const expressao = `${quantidade} × ${formatar(tamanho)} = ${escrita}`;
  const n = ctx.modelos.nomes;
  const reduz = resultado.d !== tamanho.d;
  return {
    tipo: "parte",
    expressao,
    dividendo: null,
    divisor: null,
    quociente: null,
    resto: null,
    nomes: [n.pedacos, n.cadaUm, preencher(n.daPeca, { peca: ctx.pele.peca.singular })],
    equivalente: reduz ? preencher(ctx.modelos.equivalente, { fracao: formatar(resultado) }) : null,
    fracao: { numerador: quantidade * tamanho.n, denominador: tamanho.d },
    prova: null,
    forma: null,
    leitura: null,
    frase: null,
    chave: null,
    produto: { pedacos: quantidade, tamanho, resultado },
    extenso: lerEmVoz(expressao),
  };
}

/** Confere uma conta com Racional: dividendo = divisor × quociente + resto, e a chave fecha. */
export function contaVerdadeira(c: Conta): boolean {
  if (c.tipo === "comparacao") return true;
  if (c.tipo === "parte") return c.produto !== null && igual(multiplica(c.produto.tamanho, inteiro(c.produto.pedacos)), c.produto.resultado);
  if (!c.dividendo || !c.divisor || !c.quociente) return false;
  const resto = c.resto ?? inteiro(0);
  if (!igual(soma(multiplica(c.divisor, c.quociente), resto), c.dividendo)) return false;
  if (c.resto && compara(c.resto, c.divisor) >= 0) return false;
  if (c.chave) {
    const k = c.chave;
    const somaParciais = k.linhas.reduce((s, l) => s + l.parcial, 0);
    if (somaParciais !== k.quociente) return false;
    if (k.resto >= k.divisor || k.resto < 0) return false;
    const ultima = k.linhas.at(-1);
    if ((ultima ? ultima.fica : k.dividendo) !== k.resto) return false;
    if (k.dividendo !== k.divisor * k.quociente + k.resto) return false;
  }
  return true;
}
