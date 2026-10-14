/**
 * O Manual: o que o Engenho sabe, passado a limpo. Uma página por conceito do currículo, papel
 * impresso (não caderno). Os dados vivem em `src/conteudo/manual.ts`; aqui ficam o contrato,
 * a restauração e as checagens.
 *
 * Uma página rasgada mostra só o título, a área e os nomes: o resto é a descoberta, e só volta
 * quando o jogador a faz na máquina.
 */
import type { IdConceito } from "../curriculo/curriculo";
import { situacaoConceito } from "../dominio/dominio";
import type { AcaoBancada, ConfigBancada } from "../maquinas/bancada/tipos";
import type { Atividade } from "../missoes/tipos";
import type { Progresso } from "../progresso/tipos";
import { lerExpressao, valorDoNumero, type Token } from "../racional/notacao";
import { compara, divide, igual, inteiro, multiplica, soma, subtrai, type Racional } from "../racional/racional";

export interface TermoManual {
  readonly valor: string;
  readonly nome: string;
  /** O resultado que a página quer que fique: ganha marca-texto. */
  readonly marca?: boolean;
}

export interface NomeManual {
  readonly termo: string;
  readonly significado: string;
}

export interface PaginaManual {
  readonly conceito: IdConceito;
  readonly slug: string;
  /** "Em uma frase". */
  readonly frase: string;
  /** "Como se escreve": o exemplo, a forma geral e os termos com nome. */
  readonly escrita: {
    readonly exemplo: string;
    readonly forma: string;
    readonly termos: readonly TermoManual[];
  };
  /** "Na máquina": uma bancada pequena, montada pelo núcleo e desenhada parada. */
  readonly maquina: {
    readonly config: ConfigBancada;
    readonly acoes: readonly AcaoBancada[];
    /** Para o leitor de tela. */
    readonly descricao: string;
    /** O que a máquina mostra, nas medidas do motor ("cada", "sobra", "emUso"). */
    readonly mostra: Readonly<Record<string, string>>;
  };
  /** "Vale sempre": duas ou três propriedades. */
  readonly valeSempre: readonly string[];
  /** "Cuidado com": ids de equívocos. */
  readonly cuidado: readonly string[];
  /** "Os nomes": sempre abertos, mesmo na página rasgada. */
  readonly nomes: readonly NomeManual[];
}

/** Conceito que nenhuma atividade ensina ainda: uma linha a lápis, com o arco previsto. */
export interface ConceitoALapis {
  readonly conceito: IdConceito;
  readonly arco: string;
}

type AtividadeDoManual = Pick<Atividade, "id" | "tipo" | "conceitos" | "numero">;

/**
 * As páginas restauradas: o conceito tem página no Caderno, de uma missão que o ensina, ou já
 * está dominado ou consolidado (a prova direta e as revisitas também chegam lá).
 */
export function paginasRestauradas(progresso: Progresso, atividades: readonly AtividadeDoManual[]): Set<IdConceito> {
  const saida = new Set<IdConceito>();
  for (const pagina of progresso.caderno) {
    const a = atividades.find((x) => x.id === pagina.atividade);
    if (a && a.tipo === "missao") for (const c of a.conceitos) saida.add(c);
  }
  const conceitos = new Set(progresso.evidencias.map((e) => e.conceito));
  for (const c of conceitos) {
    const estado = situacaoConceito(c, progresso.evidencias, progresso.atualizadoEm).estado;
    if (estado === "dominado" || estado === "consolidado") saida.add(c);
  }
  return saida;
}

/** A missão onde a página se restaura: a primeira que ensina o conceito. */
export function missaoQueRestaura<A extends AtividadeDoManual>(conceito: IdConceito, atividades: readonly A[]): A | null {
  const missoes = atividades.filter((a) => a.tipo === "missao" && a.conceitos.includes(conceito));
  return [...missoes].sort((x, y) => (x.numero ?? 0) - (y.numero ?? 0))[0] ?? null;
}

/* ---------- Checagem: o exemplo é verdadeiro ---------- */

function valorDe(tokens: readonly Token[]): Racional | null {
  // Primeiro × e ÷, depois + e −, da esquerda para a direita.
  const termos: (Racional | "+" | "−")[] = [];
  let atual: Racional | null = null;
  let pendente: "×" | "÷" | null = null;
  for (const tk of tokens) {
    if (tk.t === "num") {
      const v = valorDoNumero(tk);
      if (atual === null) atual = v;
      else if (pendente === "×") atual = multiplica(atual, v);
      else if (pendente === "÷") atual = igual(v, inteiro(0)) ? null : divide(atual, v);
      else return null;
      if (atual === null) return null;
      pendente = null;
    } else if (tk.t === "op" && (tk.op === "×" || tk.op === "÷")) {
      pendente = tk.op;
    } else if (tk.t === "op" && (tk.op === "+" || tk.op === "−")) {
      if (atual === null) return null;
      termos.push(atual, tk.op);
      atual = null;
    } else {
      return null;
    }
  }
  if (atual === null || pendente) return null;
  termos.push(atual);
  let total = termos[0] as Racional;
  for (let i = 1; i < termos.length; i += 2) {
    const v = termos[i + 1] as Racional;
    total = termos[i] === "+" ? soma(total, v) : subtrai(total, v);
  }
  return total;
}

/**
 * Uma igualdade escrita é verdadeira? "24 ÷ 4 = 6", "26 = 4 × 6 + 2", "3 ÷ 4 = 3/4".
 * Com resto ("26 ÷ 4 = 6, resto 2"), confere dividendo = divisor × quociente + resto e o resto
 * menor que o divisor.
 */
export function igualdadeVerdadeira(texto: string): boolean {
  const resto = /^(\d+) ÷ (\d+) = (\d+), resto (\d+)$/.exec(texto.trim());
  if (resto) {
    const [a, b, q, r] = resto.slice(1).map((x) => inteiro(Number(x)));
    return igual(soma(multiplica(b, q), r), a) && compara(r, b) < 0;
  }
  const tokens = lerExpressao(texto);
  const lados: Token[][] = [[]];
  for (const tk of tokens) {
    if (tk.t === "op" && tk.op === "=") lados.push([]);
    else lados[lados.length - 1].push(tk);
  }
  if (lados.length < 2) return false;
  const valores = lados.map(valorDe);
  if (valores.some((v) => v === null)) return false;
  return valores.every((v) => igual(v as Racional, valores[0] as Racional));
}
