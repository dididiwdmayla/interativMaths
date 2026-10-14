/**
 * Reações determinísticas: dos efeitos do motor para a fala da faixa do Nônio. Puro.
 * Os textos são dado (conteúdo); aqui só se escolhe o modelo e se preenchem as medidas.
 * Quem decide se está certo continua sendo o motor: a reação só lê o que ele já decidiu.
 */
import { fracaoPorExtenso, inteiroPorExtenso, type Genero } from "../racional/extenso";
import { comoRacional, compara, ehZero, formatar, multiplica, parteFracionaria, parteInteira, subtrai, inteiro, type Racional } from "../racional/racional";
import { bicasAbertas, bicasEmUso, contarPecas, pilhaDe, quantidadeDe, quantidadeNaBica } from "../maquinas/bancada/bancada";
import type { EstadoBancada, Evento } from "../maquinas/bancada/tipos";
import type { ResultadoValidacao } from "../maquinas/bancada/validadores";
import { medidasVivas, preencher, type Efeito, type Execucao } from "../missoes/motor";
import type { AlvoMaquina, Atividade, Entrada, Passo } from "../missoes/tipos";
import type { Postura } from "../progresso/tipos";
import type { FalaFaixa, SeloFala } from "./fila";

/* ---------- Contratos com o conteúdo ---------- */

export interface Nome {
  readonly singular: string;
  readonly plural: string;
  readonly genero: Genero;
}

/** O que a reação precisa saber da pele (o tipo do conteúdo encaixa aqui). */
export interface NomesPele {
  readonly peca: Nome;
  readonly pedaco: Nome;
  readonly receptor: Nome;
  readonly repartir: string;
  /** "Pão a gente corta". */
  readonly corta?: string;
}

export interface TextoRetorno {
  readonly consequencia: string;
  readonly pergunta: string;
}

export interface TextosReacao {
  readonly equivocos: readonly (TextoRetorno & { readonly id: string; readonly previsao?: TextoRetorno })[];
  readonly motivos: Readonly<Record<string, TextoRetorno>>;
  readonly recusas: Readonly<Record<string, string>>;
  readonly eventos: {
    readonly volta: string;
    readonly voltaCortavel: string;
    readonly fatia: string;
    readonly colocou: string;
    readonly devolveu: string;
    readonly bicaAberta: string;
    readonly bicaFechada: string;
    readonly carga: string;
    readonly primeiraVoltaAMao: string;
  };
  readonly comentarios: { readonly fatia: string; readonly engasgo: string; readonly devolveu: string };
  readonly acertos: Readonly<Record<string, string>>;
  readonly aberturas: Readonly<Record<string, string>>;
  readonly aberturaAplicacao: string;
  readonly respostas: {
    readonly naoSei: string;
    readonly aindaNao: string;
    readonly aindaNaoPergunta: string;
    readonly conferiu: string;
    readonly produto: string;
  };
  readonly frase: { readonly acertou: string; readonly umaLacuna: string; readonly variasLacunas: string; readonly pergunta: string };
  readonly palpite: { readonly mosca: string; readonly moscaFala: string; readonly distancia: string };
  readonly ajuda: {
    readonly oferta: string;
    readonly ofertaPresente: string;
    readonly sondagem: string;
    readonly aplicacao: string;
    readonly caso: string;
    readonly junto: string;
    readonly semDica: string;
    readonly lembrete: string;
  };
}

export const LIMITE_FALA = 160;

/* ---------- Nomes e medidas por extenso ---------- */

function artigo(g: Genero, plural: boolean): string {
  return g === "f" ? (plural ? "as" : "a") : plural ? "os" : "o";
}

function maiuscula(t: string): string {
  return t.length > 0 ? t[0].toUpperCase() + t.slice(1) : t;
}

/** Quantidade com o nome da peça: "seis sacas", "uma broa e mais um quarto", "três quartos de broa". */
export function quantidadeComNome(r: Racional, pele: NomesPele): string {
  const g = pele.peca.genero;
  if (ehZero(r)) return `nada`;
  if (r.d === 1) return `${inteiroPorExtenso(r.n, g)} ${r.n === 1 ? pele.peca.singular : pele.peca.plural}`;
  const k = parteInteira(r);
  const resto = parteFracionaria(r);
  const fracao = fracaoPorExtenso(resto.n, resto.d);
  if (k === 0) return `${fracao} de ${pele.peca.singular}`;
  return `${inteiroPorExtenso(k, g)} ${k === 1 ? pele.peca.singular : pele.peca.plural} e mais ${fracao}`;
}

/** "uma saca", "um pedaço de 1/4". */
function umaPecaDeTamanho(tamanho: string, pele: NomesPele): string {
  const t = comoRacional(tamanho);
  if (t.n === 1 && t.d === 1) return `${inteiroPorExtenso(1, pele.peca.genero)} ${pele.peca.singular}`;
  return `${inteiroPorExtenso(1, pele.pedaco.genero)} ${pele.pedaco.singular} de ${formatar(t)}`;
}

/** "6 sacas", "1 pedaço de 1/4" (para a leitura curta da volta). */
function pecasDeTamanho(tamanho: string, k: number, pele: NomesPele): string {
  const t = comoRacional(tamanho);
  if (t.n === 1 && t.d === 1) return `${k} ${k === 1 ? pele.peca.singular : pele.peca.plural}`;
  return `${k} ${k === 1 ? pele.pedaco.singular : pele.pedaco.plural} de ${formatar(t)}`;
}

/** Marcadores da pele, para qualquer modelo. */
export function marcadoresDaPele(pele: NomesPele): Record<string, string> {
  const r = pele.receptor;
  const p = pele.peca;
  return {
    receptor: r.singular,
    receptores: r.plural,
    peca: p.singular,
    pecaPlural: p.plural,
    umaPeca: `${inteiroPorExtenso(1, p.genero)} ${p.singular}`,
    osPecas: `${artigo(p.genero, true)} ${p.plural}`,
    osReceptores: `${artigo(r.genero, true)} ${r.plural}`,
    pedaco: pele.pedaco.singular,
    pedacoPlural: pele.pedaco.plural,
    na: r.genero === "f" ? "na" : "no",
    aberta: r.genero === "f" ? "aberta" : "aberto",
    corta: pele.corta ?? "Dá para cortar",
    repartir: pele.repartir,
  };
}

/** Medidas vivas da máquina, com as versões por extenso. */
export function medidasComNomes(e: EstadoBancada | null, pele: NomesPele): Record<string, string> {
  if (!e) return marcadoresDaPele(pele);
  const uso = bicasEmUso(e);
  const abertas = bicasAbertas(e).length;
  const cada = uso.length > 0 ? quantidadeNaBica(e.bicas[uso[0]]) : inteiro(0);
  const sobra = quantidadeDe(e.esteira.length > 0 ? e.esteira : e.bandeja);
  const total = quantidadeDe([...e.esteira, ...e.bandeja, ...e.bicas.flatMap((b) => b.pecas)]);
  return {
    ...marcadoresDaPele(pele),
    ...medidasVivas(e),
    cadaNome: quantidadeComNome(cada, pele),
    sobraNome: quantidadeComNome(sobra, pele),
    totalNome: total.d === 1 ? inteiroPorExtenso(total.n, pele.peca.genero) : formatar(total, { misto: true }),
    abertasNome: inteiroPorExtenso(abertas, pele.receptor.genero),
    bicasNome: inteiroPorExtenso(uso.length, pele.receptor.genero),
    osBicasNome: `${artigo(pele.receptor.genero, true)} ${inteiroPorExtenso(Math.max(abertas, uso.length), pele.receptor.genero)} ${pele.receptor.plural}`,
  };
}

/** Preenche e confere: marcador que sobrou vira texto vazio, nunca chaves na tela. */
export function preencherFala(modelo: string, valores: Readonly<Record<string, string>>): string {
  return preencher(modelo, valores)
    .replace(/\{\w+\}/g, "")
    .replace(/\s+([.,:?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function juntar(...partes: (string | null | undefined)[]): string {
  return partes
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim())
    .join(" ");
}

/* ---------- Acerto ---------- */

/** O modelo de resumo do validador, com as medidas da máquina vencida. */
export function resumoDoAcerto(validador: string, e: EstadoBancada, pele: NomesPele, textos: TextosReacao): string {
  const m = medidasComNomes(e, pele);
  const sobra = quantidadeDe(e.bandeja.length > 0 ? e.bandeja : e.esteira);
  const chaveModelo = validador === "partilha.fechada" && !ehZero(sobra) ? "partilha.fechada.sobra" : validador;
  const modelo = textos.acertos[chaveModelo] ?? textos.acertos["partilha.fechada"];
  return maiuscula(preencherFala(modelo, m));
}

function falaNonioDe(falas: Passo["aoConcluir"]): string | null {
  return falas?.find((f) => f.quem === "nonio")?.texto ?? null;
}

/** Palpite revelado no passo de máquina seguinte: "na mosca" ou a distância, sem julgamento. */
export function comentarioDoPalpite(valor: string | null, certo: string, pele: NomesPele, textos: TextosReacao): string | null {
  if (valor === null) return null;
  // Palpite de opções (texto): só "na mosca" ou nada; não há distância a medir.
  if (valor === certo) return textos.palpite.moscaFala;
  let distancia: Racional;
  try {
    const d = subtrai(comoRacional(valor), comoRacional(certo));
    distancia = compara(d, inteiro(0)) < 0 ? multiplica(d, inteiro(-1)) : d;
  } catch {
    return null;
  }
  if (ehZero(distancia)) return textos.palpite.moscaFala;
  return preencherFala(textos.palpite.distancia, { distancia: quantidadeComNome(distancia, pele) });
}

/* ---------- Ainda não ---------- */

/** Para onde aponta um "ainda não" (o círculo a lápis vermelho na máquina). */
export function alvoDoMotivo(r: ResultadoValidacao): AlvoMaquina | undefined {
  switch (r.motivo) {
    case "sobra-da-mais-uma-volta":
    case "sobra-pode-ser-cortada":
    case "sobra-nao-fecha":
    case "sobra-diferente":
    case "ficou-carga":
    case "carga-inicial-diferente":
    case "esteira-vazia":
      return "esteira";
    case "carga-diferente":
    case "passou-do-teto":
    case "composicao-diferente":
    case "pedaco-repetido":
    case "pedaco-nao-unitario":
      return r.medidas.bica ? (`bica:${Number(r.medidas.bica) - 1}` as AlvoMaquina) : "bicas";
    case "desiguais":
    case "mesma-contagem-quantidades-diferentes":
    case "nenhuma-bica":
    case "bicas-demais":
    case "bicas-diferentes":
      return "bicas";
    default:
      return undefined;
  }
}

function textoRetorno(t: TextoRetorno | undefined, valores: Record<string, string>, aplicacao: boolean): string {
  if (!t) return "";
  return juntar(preencherFala(t.consequencia, valores), aplicacao ? null : preencherFala(t.pergunta, valores));
}

/** O texto de um equívoco com nome, para a máquina (operar) ou para a resposta (previsão). */
export function textoDoEquivoco(
  id: string,
  valores: Record<string, string>,
  textos: TextosReacao,
  opcoes: { aplicacao?: boolean; previsao?: boolean } = {},
): string {
  const e = textos.equivocos.find((x) => x.id === id);
  if (!e) return "";
  const t = opcoes.previsao && e.previsao ? e.previsao : e;
  return textoRetorno(t, valores, opcoes.aplicacao ?? false);
}

export function textoDoMotivo(motivo: string, valores: Record<string, string>, textos: TextosReacao, aplicacao = false): string {
  return textoRetorno(textos.motivos[motivo], valores, aplicacao);
}

/* ---------- Leituras da máquina ---------- */

/** O que a máquina fez, em voz de instrumento (a antiga tira de mensagem). */
export function leituraDoEvento(
  e: EstadoBancada,
  pele: NomesPele,
  textos: TextosReacao,
  opcoes: { postura?: Postura; aplicacao?: boolean; antes?: EstadoBancada | null } = {},
): { texto: string; atencao: boolean } | null {
  const ev: Evento | null = e.evento;
  if (!ev) return null;
  const m = medidasComNomes(e, pele);
  const presente = opcoes.postura === "presente";
  switch (ev.tipo) {
    case "volta": {
      const sobra = quantidadeDe(e.esteira);
      const B = bicasAbertas(e).length;
      const naoDaVolta = !ehZero(sobra) && B > 0 && e.esteira.every((p) => p.quantidade < B);
      if (naoDaVolta && e.config.fatiador && !opcoes.aplicacao) {
        return { texto: preencherFala(textos.eventos.voltaCortavel, { ...m, sobraNome: quantidadeComNome(sobra, pele) }), atencao: false };
      }
      return { texto: preencherFala(textos.eventos.volta, { ...m, lotePecas: pecasDeTamanho(ev.tamanho, ev.lote, pele) }), atencao: false };
    }
    case "engasgo": {
      const v = { ...m, lote: String(ev.lote), abertas: String(ev.abertas), pedido: String(ev.pedido), ha: String(ev.ha), falta: String(ev.pedido - ev.ha) };
      const base = textoDoEquivoco("lote-maior-que-cabe", v, textos, { aplicacao: opcoes.aplicacao });
      return { texto: base, atencao: true };
    }
    case "fatia":
    case "cortou": {
      const cortadas = ev.quantidade === 1 ? "uma peça" : `${ev.quantidade} peças`;
      const texto = preencherFala(textos.eventos.fatia, { ...m, cortadas, partes: String(ev.partes), pedacos: String(ev.quantidade * ev.partes), novo: formatar(comoRacional(ev.novo)) });
      return { texto: juntar(texto, presente ? preencherFala(textos.comentarios.fatia, m) : null), atencao: false };
    }
    case "colocou": {
      const b = e.bicas[ev.bica];
      const antes = opcoes.antes;
      if (antes && opcoes.postura !== "quieto" && primeiraVoltaAMao(antes, e)) {
        return { texto: preencherFala(textos.eventos.primeiraVoltaAMao, m), atencao: false };
      }
      const texto = preencherFala(textos.eventos.colocou, {
        ...m,
        umaPecaTamanho: maiuscula(umaPecaDeTamanho(ev.tamanho, pele)),
        bica: String(ev.bica + 1),
        cargaBica: b ? formatar(quantidadeNaBica(b), { misto: true }) : "",
      });
      return { texto, atencao: false };
    }
    case "devolveu": {
      const texto = preencherFala(textos.eventos.devolveu, { ...m, umaPecaTamanho: maiuscula(umaPecaDeTamanho(ev.tamanho, pele)) });
      return { texto: juntar(texto, presente ? preencherFala(textos.comentarios.devolveu, m) : null), atencao: false };
    }
    case "bica":
      return { texto: preencherFala(ev.aberta ? textos.eventos.bicaAberta : textos.eventos.bicaFechada, { ...m, bica: String(ev.indice + 1) }), atencao: false };
    case "carga":
      return { texto: preencherFala(textos.eventos.carga, { ...m, quantidade: String(ev.quantidade) }), atencao: false };
    case "recusa":
      return { texto: preencherFala(textos.recusas[ev.motivo] ?? "", m), atencao: ev.motivo !== "fechada" };
    case "fechou":
    case "ajuste":
      return null;
  }
}

/** Todas as bicas abertas com uma peça inteira cada, nenhuma volta da alavanca: uma volta feita à mão. */
function primeiraVoltaAMao(antes: EstadoBancada, depois: EstadoBancada): boolean {
  const umaEmCada = (e: EstadoBancada) => {
    const abertas = bicasAbertas(e);
    return abertas.length > 1 && e.voltas === 0 && abertas.every((i) => contarPecas(e.bicas[i].pecas) === 1);
  };
  return !umaEmCada(antes) && umaEmCada(depois);
}

/* ---------- A fala de cada momento ---------- */

export interface ContextoReacao {
  readonly atividade: Atividade;
  readonly passo: Passo;
  readonly antes: Execucao;
  readonly depois: Execucao;
  readonly entrada: Entrada;
  readonly efeitos: readonly Efeito[];
  readonly postura: Postura;
  readonly textos: TextosReacao;
  readonly pele: NomesPele | null;
  /** O palpite revelado neste passo (valor do jogador e o que a máquina dá). */
  readonly palpite?: { readonly valor: string | null; readonly certo: string } | null;
}

function fala(
  passo: Passo,
  id: string,
  texto: string,
  extra: Partial<Omit<FalaFaixa, "id" | "texto" | "passo">> & Pick<FalaFaixa, "categoria">,
): FalaFaixa {
  return { id, texto: maiuscula(texto), passo: passo.id, expressao: "neutro", prioridade: "importante", ...extra };
}

function ehAplicacao(p: Passo): boolean {
  return p.fase === "aplicacao";
}

/** A linha de acerto do Nônio: a fala do passo, ou a do Nônio ao concluir, ou o resumo. */
export function falaDeAcerto(ctx: Pick<ContextoReacao, "passo" | "depois" | "textos" | "pele" | "palpite">, validador: string): string {
  const { passo, depois, textos, pele } = ctx;
  const e = depois.bancada?.atual ?? null;
  const m = e && pele ? medidasComNomes(e, pele) : {};
  const propria = passo.acerto ?? falaNonioDe(passo.aoConcluir);
  const base = propria ? preencherFala(propria, m) : e && pele ? resumoDoAcerto(validador, e, pele, textos) : "";
  const palpite = ctx.palpite && pele ? comentarioDoPalpite(ctx.palpite.valor, ctx.palpite.certo, pele, textos) : null;
  const com = juntar(base, palpite);
  return com.length <= LIMITE_FALA ? com : base;
}

/** Reação a uma entrada. null: a faixa continua com o que tinha. */
export function reagir(ctx: ContextoReacao): FalaFaixa | null {
  const { passo, antes, depois, entrada, efeitos, textos, pele } = ctx;
  if (depois.indice !== antes.indice || depois.concluida) return null;
  const aplicacao = ehAplicacao(passo);
  const estado = depois.bancada?.atual ?? null;
  const m = pele ? medidasComNomes(estado, pele) : {};

  if (entrada.tipo === "dica" || entrada.tipo === "junto") {
    if (depois.passo.ajuda === antes.passo.ajuda && entrada.tipo === "dica") return null;
    return falaDeAjuda(passo, depois, textos, pele);
  }

  const resultado = efeitos.find((x): x is Extract<Efeito, { tipo: "resultado" }> => x.tipo === "resultado")?.resultado;
  const equivoco = efeitos.find((x): x is Extract<Efeito, { tipo: "equivoco" }> => x.tipo === "equivoco");

  if (resultado) {
    const vm = { ...m, ...resultado.medidas };
    if (resultado.ok) {
      const validador = passo.tipo === "operar" ? (depois.passo.convite === "feito" && passo.convite ? passo.convite.objetivo.validador : passo.objetivo.validador) : "partilha.fechada";
      return fala(passo, `acertou:${passo.id}:${depois.passo.convite ?? ""}`, falaDeAcerto(ctx, validador), { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
    }
    if (resultado.parcial) {
      return fala(passo, `parcial:${resultado.medidas.feitas}`, textoDoMotivo(resultado.motivo, vm, textos), { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
    }
    const texto = equivoco ? textoDoEquivoco(equivoco.id, { ...vm, ...equivoco.medidas }, textos, { aplicacao }) : textoDoMotivo(resultado.motivo, vm, textos, aplicacao);
    return fala(passo, `ainda-nao:${resultado.motivo}:${equivoco?.id ?? ""}:${texto}`, texto, {
      categoria: "retorno",
      selo: "ainda-nao",
      expressao: "medindo",
      alvo: alvoDoMotivo(resultado),
    });
  }

  if (entrada.tipo === "responder" && (passo.tipo === "prever" || passo.tipo === "aposta")) {
    return reagirResposta(ctx, m, equivoco?.id ?? null);
  }

  if (entrada.tipo === "conferir" && passo.tipo === "frase") {
    if (depois.passo.retorno === "acertou") {
      return fala(passo, `acertou:${passo.id}`, preencherFala(textos.frase.acertou, m), { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
    }
    const quantas = depois.passo.lacunasErradas.length;
    const texto = juntar(
      preencherFala(quantas === 1 ? textos.frase.umaLacuna : textos.frase.variasLacunas, { quantas: maiuscula(inteiroPorExtenso(quantas, "f")) }),
      aplicacao ? null : textos.frase.pergunta,
    );
    return fala(passo, `ainda-nao:frase:${quantas}`, texto, { categoria: "retorno", selo: "ainda-nao", expressao: "medindo" });
  }

  if (entrada.tipo === "maquina" && estado && pele) {
    if (estado.seq === antes.bancada?.atual.seq) return null;
    if (entrada.acao.tipo === "desfazer" || entrada.acao.tipo === "recomecar") {
      const texto = entrada.acao.tipo === "desfazer" ? "Desfeito: a máquina voltou um passo." : "A máquina voltou ao começo.";
      return fala(passo, `${entrada.acao.tipo}:${estado.seq}`, texto, { categoria: "evento", expressao: "atento" });
    }
    // Um corte que não fecha é um equívoco da máquina: informação, com ponto vermelho.
    if (equivoco?.id === "corte-que-nao-fecha") {
      const texto = textoDoEquivoco(equivoco.id, { ...m, ...equivoco.medidas }, textos, { aplicacao });
      return fala(passo, `evento:${estado.seq}`, texto, { categoria: "evento", expressao: "medindo", atencao: true, alvo: "fatiador" });
    }
    const leitura = leituraDoEvento(estado, pele, textos, { postura: ctx.postura, aplicacao, antes: antes.bancada?.atual ?? null });
    if (!leitura) return null;
    return fala(passo, `evento:${estado.seq}`, leitura.texto, { categoria: "evento", expressao: leitura.atencao ? "medindo" : "atento", atencao: leitura.atencao });
  }
  return null;
}

function reagirResposta(ctx: ContextoReacao, m: Record<string, string>, equivoco: string | null): FalaFaixa | null {
  const { passo, depois, textos } = ctx;
  if (passo.tipo !== "prever" && passo.tipo !== "aposta") return null;
  const aplicacao = ehAplicacao(passo);
  const ep = depois.passo;
  const explicacao = passo.explicacao ?? "";
  if (ep.retorno === "acertou") {
    return fala(passo, `acertou:${passo.id}`, preencherFala(explicacao || textos.respostas.conferiu, m), { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
  }
  if (ep.resposta === null) {
    return fala(passo, `nao-sei:${passo.id}`, juntar(textos.respostas.naoSei, preencherFala(explicacao, m)).slice(0, LIMITE_FALA), { categoria: "retorno", expressao: "atento" });
  }
  if (ep.retorno !== "ainda-nao") return null;
  if (ep.situacao === "conferindo") {
    return fala(passo, `ainda-nao:final:${passo.id}`, preencherFala(textos.respostas.conferiu, { ...m, explicacao }), { categoria: "retorno", selo: "ainda-nao", expressao: "medindo" });
  }
  const valores = { ...m, resposta: ep.resposta ?? "" };
  let texto = "";
  if (equivoco) {
    texto = textoDoEquivoco(equivoco, valores, textos, { aplicacao, previsao: true });
  } else if (passo.tipo === "prever" && passo.medida === "carga-por-bica" && ep.resposta) {
    texto = juntar(textoProduto(ctx, valores), aplicacao ? null : preencherFala(passo.dicas?.[0].texto ?? "", valores));
  } else {
    texto = juntar(textos.respostas.aindaNao, aplicacao ? null : preencherFala(passo.dicas?.[0].texto ?? "", valores));
  }
  if (texto.length > LIMITE_FALA) texto = textoDoEquivoco(equivoco ?? "", valores, textos, { aplicacao: true, previsao: true }) || textos.respostas.aindaNao;
  return fala(passo, `ainda-nao:${passo.id}:${ep.resposta}`, texto, { categoria: "retorno", selo: "ainda-nao", expressao: "medindo", alvo: passo.dicas?.[0].alvo });
}

/** "Com 5 em cada, 5 carroças levariam 25. Na esteira há 30." Sem dizer quanto dá. */
function textoProduto(ctx: ContextoReacao, valores: Record<string, string>): string {
  const inicio = ctx.depois.passo.inicio?.atual ?? ctx.depois.bancada?.atual ?? null;
  if (!inicio || !ctx.pele) return ctx.textos.respostas.aindaNao;
  let produto: Racional;
  try {
    produto = multiplica(comoRacional(valores.resposta), inteiro(bicasAbertas(inicio).length));
  } catch {
    return ctx.textos.respostas.aindaNao;
  }
  const m = medidasComNomes(inicio, ctx.pele);
  return preencherFala(ctx.textos.respostas.produto, { ...m, ...valores, resposta: formatar(comoRacional(valores.resposta), { misto: true }), produto: formatar(produto, { misto: true }) });
}

/** Cabe na faixa (160): corta na última frase inteira; sem frase inteira, nas palavras. */
export function encurtarFala(texto: string): string {
  const t = texto.trim();
  if (t.length <= LIMITE_FALA) return t;
  const corte = t.slice(0, LIMITE_FALA);
  const fim = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("? "));
  if (fim > 40) return corte.slice(0, fim + 1);
  return `${corte.slice(0, corte.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

/**
 * Um degrau da escada como texto, com as medidas vivas, sem subir a escada. O Me ajuda usa o
 * degrau atual; a conversa usa o degrau seguinte quando a guarda barra a resposta do modelo.
 */
export function textoDoDegrau(passo: Passo, degrau: 1 | 2 | 3, e: Execucao, pele: NomesPele | null): { readonly texto: string; readonly alvo?: AlvoMaquina } | null {
  const dica = passo.dicas?.[degrau - 1];
  if (!dica) return null;
  const vivas = { ...(pele ? medidasComNomes(e.bancada?.atual ?? null, pele) : medidasVivas(e.bancada?.atual ?? null)), feitas: String(e.passo.solucoes.length) };
  const alvo = degrau === 1 ? dica.alvo : degrau === 2 ? (dica.cota?.alvo ?? dica.alvo) : undefined;
  return { texto: preencherFala(dica.texto, vivas), alvo };
}

/** Me ajuda: o degrau atual da escada, com as medidas vivas; aponta e mostra a cota. */
export function falaDeAjuda(passo: Passo, e: Execucao, textos: TextosReacao, pele: NomesPele | null): FalaFaixa | null {
  const nivel = e.passo.ajuda;
  if (nivel === 0) return null;
  if (nivel >= 4) return fala(passo, `ajuda:4`, textos.ajuda.junto, { categoria: "ajuda", prioridade: "pedida", expressao: "atento" });
  const degrau = textoDoDegrau(passo, nivel as 1 | 2 | 3, e, pele);
  if (!degrau) return fala(passo, `ajuda:sem`, textos.ajuda.semDica, { categoria: "ajuda", prioridade: "pedida", expressao: "neutro" });
  return fala(passo, `ajuda:${nivel}`, degrau.texto, {
    categoria: "ajuda",
    prioridade: "pedida",
    expressao: nivel === 1 ? "atento" : "medindo",
    alvo: degrau.alvo,
  });
}

/** A fala com que um passo começa: a do Nônio no passo, ou o modelo do tipo de passo. */
export function falaDeAbertura(a: Atividade, passo: Passo, e: Execucao, textos: TextosReacao, pele: NomesPele | null): FalaFaixa {
  const m = pele ? medidasComNomes(e.bancada?.atual ?? null, pele) : {};
  if (passo.fase === "aplicacao" && a.tipo === "missao") {
    return fala(passo, `abertura:${passo.id}`, passo.nonio ? preencherFala(passo.nonio, m) : textos.aberturaAplicacao, { categoria: "passo", expressao: "quieto" });
  }
  const daCena = passo.tipo !== "narrativa" ? passo.falas?.filter((f) => f.quem === "nonio").map((f) => f.texto).join(" ") : undefined;
  const propria = passo.nonio ?? passo.chegada?.texto ?? (daCena && daCena.length <= LIMITE_FALA ? daCena : undefined);
  const texto = preencherFala(propria ?? textos.aberturas[passo.tipo] ?? "", m);
  return fala(passo, `abertura:${passo.id}`, texto, { categoria: "passo", expressao: passo.tipo === "narrativa" ? "neutro" : "atento" });
}

/** A oferta de ajuda depois de tentativas travadas (automática: a postura decide). */
export function falaDeOferta(passo: Passo, e: Execucao, postura: Postura, textos: TextosReacao): FalaFaixa | null {
  if (ehAplicacao(passo) || postura === "quieto" || !passo.dicas) return null;
  if (e.passo.situacao !== "ativo" || e.passo.ajuda >= 3) return null;
  const limite = postura === "presente" ? 1 : 2;
  if (e.passo.tentativas < limite) return null;
  return fala(passo, `oferta:${e.passo.tentativas}`, postura === "presente" ? textos.ajuda.ofertaPresente : textos.ajuda.oferta, {
    categoria: "oferta",
    prioridade: "automatica",
    expressao: "atento",
  });
}

/** O selo que a faixa mostra agora: o da fala, se o motor ainda sustenta aquele retorno. */
export function seloVisivel(f: FalaFaixa | null, e: Execucao): SeloFala | null {
  if (!f?.selo) return null;
  return e.passo.retorno === f.selo ? f.selo : null;
}

/** Pílula para a pilha escolhida (usado pela leitura de recusa "sem-pilha"). */
export function pilhaEscolhida(e: EstadoBancada): string | null {
  return pilhaDe(e.esteira, e.pilha) ? e.pilha : null;
}

/**
 * A fala que o estado do passo pede quando a faixa não tem nada deste passo (ao abrir a tela,
 * ao recarregar): o acerto de um passo vencido, o resultado de uma previsão, ou a abertura.
 */
export function falaDoEstado(
  a: Atividade,
  passo: Passo,
  e: Execucao,
  textos: TextosReacao,
  pele: NomesPele | null,
  palpite: { readonly valor: string | null; readonly certo: string } | null = null,
): FalaFaixa {
  const ep = e.passo;
  const m = pele ? medidasComNomes(e.bancada?.atual ?? null, pele) : {};
  if (passo.tipo === "operar" && ep.situacao === "vencido") {
    const validador = ep.convite === "feito" && passo.convite ? passo.convite.objetivo.validador : passo.objetivo.validador;
    return fala(passo, `acertou:${passo.id}:${ep.convite ?? ""}`, falaDeAcerto({ passo, depois: e, textos, pele, palpite }, validador), {
      categoria: "retorno",
      selo: "acertou",
      expressao: "satisfeito",
    });
  }
  if ((passo.tipo === "prever" && ep.situacao === "conferindo") || (passo.tipo === "aposta" && ep.situacao === "vencido")) {
    const explicacao = preencherFala(passo.explicacao ?? "", m);
    if (ep.retorno === "acertou") return fala(passo, `acertou:${passo.id}`, explicacao || textos.respostas.conferiu, { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
    if (ep.resposta === null) return fala(passo, `nao-sei:${passo.id}`, juntar(textos.respostas.naoSei, explicacao).slice(0, LIMITE_FALA), { categoria: "retorno", expressao: "atento" });
    return fala(passo, `ainda-nao:final:${passo.id}`, preencherFala(textos.respostas.conferiu, { ...m, explicacao }), { categoria: "retorno", selo: "ainda-nao", expressao: "medindo" });
  }
  if (passo.tipo === "frase" && ep.situacao === "vencido") {
    return fala(passo, `acertou:${passo.id}`, preencherFala(textos.frase.acertou, m), { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
  }
  return falaDeAbertura(a, passo, e, textos, pele);
}

/** O lembrete de 25 s sem gesto: o Nônio repete o gesto com as palavras dele (automático). */
export function falaDeLembrete(passo: Passo, gesto: string, textos: TextosReacao, vez: number): FalaFaixa {
  const semAgora = gesto.replace(/^Agora:\s*/, "");
  return fala(passo, `lembrete:${vez}`, preencherFala(textos.ajuda.lembrete, { gesto: semAgora }), {
    categoria: "lembrete",
    prioridade: "automatica",
    expressao: "atento",
  });
}
