/**
 * O rascunho a lápis: a máquina escreve, linha por linha, o que cada gesto significou em conta.
 * Nunca o que fazer; só o que aconteceu. Puro: calculado do histórico da bancada (o passado e o
 * atual), nunca guardado. Desfazer tira a linha sozinho, porque o histórico perde o estado.
 *
 * Linhas:
 * - volta (Repartir): "Volta 1: 5 em cada carroça · 4 × 5 = 20 · ficam 26 − 20 = 6";
 * - corte: "Corte: 1 broa em 4 pedaços · 1 = 4 × 1/4";
 * - à mão: peças avulsas ("Mesa 2: + 1 broa") que, quando completam uma rodada com uma peça do
 *   mesmo tamanho em cada receptor aberto, viram uma linha só ("À mão: 1 broa em cada mesa · 4 × 1 = 4");
 *   devolver uma avulsa apaga a linha dela; devolver outra peça escreve "Mesa 2: − 1 broa";
 * - engasgo (a volta pedida não coube): só enquanto ele é o último evento, porque o material não mudou;
 * - fechar: nada (o acerto passa a conta a caneta).
 * Os modelos de texto vêm do conteúdo (`conteudo/rascunho.ts`), com os nomes da pele.
 */
import { formatar, inteiro, soma, subtrai, vezes, type Racional } from "../../racional/racional";
import { bicasAbertas, quantidadeDe } from "./bancada";
import type { Bancada, EstadoBancada, Pilha } from "./tipos";

export interface NomeRascunho {
  readonly singular: string;
  readonly plural: string;
}

/** O que o rascunho precisa da pele (o tipo do conteúdo encaixa aqui). */
export interface PeleRascunho {
  readonly peca: NomeRascunho;
  readonly pedaco: NomeRascunho;
  readonly receptor: NomeRascunho;
}

/** Modelos com marcadores, preenchidos aqui. */
export interface ModelosRascunho {
  readonly volta: string;
  /** A mesma volta sem o nome do receptor, quando a linha passa do limite. */
  readonly voltaCurta: string;
  readonly ficam: string;
  readonly mao: string;
  readonly maoCurta: string;
  readonly avulsa: string;
  readonly devolveu: string;
  readonly corteUma: string;
  readonly corteVarias: string;
  readonly engasgo: string;
}

/** Acima disso a linha usa o modelo curto (não cabe numa linha do celular). */
export const LIMITE_LINHA_RASCUNHO = 58;

export type TipoLinha = "volta" | "mao" | "avulsa" | "devolveu" | "corte" | "engasgo";

/** Uma rodada que tirou a mesma quantidade para cada receptor (volta da alavanca ou à mão). */
export interface Rodada {
  readonly tipo: "volta" | "mao";
  /** Quanto cada receptor recebeu nesta rodada. */
  readonly cada: Racional;
  readonly receptores: number;
  /** cada × receptores. */
  readonly tirou: Racional;
}

export interface LinhaRascunho {
  readonly tipo: TipoLinha;
  readonly texto: string;
  /** Voltas e rodadas à mão: o que a conta armada lê. */
  readonly rodada?: Rodada;
}

/* ---------- Diferenças entre dois estados ---------- */

type Contagem = Map<string, { tamanho: Racional; k: number }>;

function contar(pilhas: readonly Pilha[]): Contagem {
  const m: Contagem = new Map();
  for (const p of pilhas) m.set(`${p.tamanho.n}/${p.tamanho.d}`, { tamanho: p.tamanho, k: p.quantidade });
  return m;
}

/** O que mudou numa lista de pilhas: tamanho → quantas peças a mais (ou a menos). */
function delta(antes: readonly Pilha[], depois: readonly Pilha[]): Contagem {
  const a = contar(antes);
  const d = contar(depois);
  const saida: Contagem = new Map();
  for (const [c, v] of d) {
    const k = v.k - (a.get(c)?.k ?? 0);
    if (k !== 0) saida.set(c, { tamanho: v.tamanho, k });
  }
  for (const [c, v] of a) if (!d.has(c)) saida.set(c, { tamanho: v.tamanho, k: -v.k });
  return saida;
}

function unico(m: Contagem): { tamanho: Racional; k: number } | null {
  return m.size === 1 ? [...m.values()][0] : null;
}

/* ---------- Texto ---------- */

function preencher(modelo: string, v: Readonly<Record<string, string>>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
}

function maiuscula(t: string): string {
  return t.length > 0 ? t[0].toUpperCase() + t.slice(1) : t;
}

function inteira(t: Racional): boolean {
  return t.n === 1 && t.d === 1;
}

/** "1 broa", "5 sacas", ou a quantidade em pedaços ("1/4", "6/8"), sem simplificar. */
function cadaComNome(tamanho: Racional, lote: number, pele: PeleRascunho): string {
  if (inteira(tamanho)) return `${lote} ${lote === 1 ? pele.peca.singular : pele.peca.plural}`;
  return `${lote * tamanho.n}/${tamanho.d}`;
}

function cadaNumero(tamanho: Racional, lote: number): string {
  return inteira(tamanho) ? String(lote) : `${lote * tamanho.n}/${tamanho.d}`;
}

/** "1 broa", "3 broas", "1 pedaço de 1/4", "2 pedaços de 1/8". */
function pecasComNome(tamanho: Racional, k: number, pele: PeleRascunho): string {
  if (inteira(tamanho)) return `${k} ${k === 1 ? pele.peca.singular : pele.peca.plural}`;
  return `${k} ${k === 1 ? pele.pedaco.singular : pele.pedaco.plural} de ${formatar(tamanho)}`;
}

/** "+ 1 broa", "+ 1/4 de broa": o que uma peça avulsa leva. */
function umaPeca(tamanho: Racional, pele: PeleRascunho): string {
  return inteira(tamanho) ? `1 ${pele.peca.singular}` : `${formatar(tamanho)} de ${pele.peca.singular}`;
}

function q(r: Racional): string {
  return formatar(r, { misto: true });
}

function escolher(longa: string, curta: string): string {
  return longa.length <= LIMITE_LINHA_RASCUNHO ? longa : curta;
}

/* ---------- O rascunho ---------- */

interface Avulsa {
  readonly bica: number;
  readonly chave: string;
  readonly tamanho: Racional;
  /** A linha que esta peça escreveu. */
  readonly linha: LinhaRascunho;
}

/** As linhas do rascunho, da mais antiga para a mais nova. */
export function rascunhoDaBancada(b: Bancada, pele: PeleRascunho, modelos: ModelosRascunho): LinhaRascunho[] {
  const estados = [...b.passado, b.atual];
  const linhas: LinhaRascunho[] = [];
  let pendentes: Avulsa[] = [];
  let voltas = 0;
  const receptor = maiuscula(pele.receptor.singular);
  const nomes = (e: EstadoBancada, i: number) => e.config.nomesBicas?.[i] ?? String(i + 1);

  for (let i = 1; i < estados.length; i++) {
    const antes = estados[i - 1];
    const depois = estados[i];
    if (depois.fechada && !antes.fechada) continue;
    const dEsteira = delta(antes.esteira, depois.esteira);
    const dBicas = depois.bicas.map((bica, j) => delta(antes.bicas[j]?.pecas ?? [], bica.pecas));
    const mudaram = dBicas.map((d, j) => (d.size > 0 ? j : -1)).filter((j) => j >= 0);

    // Volta da alavanca: cada bica aberta ganhou o mesmo lote de um tamanho.
    if (depois.voltas > antes.voltas && mudaram.length > 0) {
      const ganho = unico(dBicas[mudaram[0]]);
      if (!ganho || ganho.k <= 0) continue;
      voltas += 1;
      const r = mudaram.length;
      const cada = vezes(ganho.tamanho, ganho.k);
      const tirou = vezes(cada, r);
      const total = quantidadeDe(antes.esteira);
      const v = {
        n: String(voltas),
        cadaNome: cadaComNome(ganho.tamanho, ganho.k, pele),
        cada: cadaNumero(ganho.tamanho, ganho.k),
        receptor: pele.receptor.singular,
        receptores: String(r),
        tirou: q(tirou),
        antes: q(total),
        depois: q(subtrai(total, tirou)),
      };
      const ficam = preencher(modelos.ficam, v);
      linhas.push({
        tipo: "volta",
        texto: escolher(preencher(modelos.volta, v) + ficam, preencher(modelos.voltaCurta, v) + ficam),
        rodada: { tipo: "volta", cada, receptores: r, tirou },
      });
      continue;
    }

    // Corte: as bicas não mudaram; a esteira trocou peças de um tamanho por pedaços menores.
    if (mudaram.length === 0 && dEsteira.size === 2) {
      const [x, y] = [...dEsteira.values()];
      const saiu = x.k < 0 ? x : y;
      const entrou = x.k < 0 ? y : x;
      if (saiu.k < 0 && entrou.k > 0 && entrou.k % -saiu.k === 0) {
        const qtd = -saiu.k;
        const partes = entrou.k / qtd;
        const v = {
          qtdNome: pecasComNome(saiu.tamanho, qtd, pele),
          partes: String(partes),
          pedacos: pele.pedaco.plural,
          total: q(vezes(saiu.tamanho, qtd)),
          novos: String(entrou.k),
          novo: formatar(entrou.tamanho),
        };
        linhas.push({ tipo: "corte", texto: preencher(qtd === 1 ? modelos.corteUma : modelos.corteVarias, v) });
      }
      continue;
    }

    // Uma peça à mão: da esteira para uma bica, ou de volta.
    if (mudaram.length === 1) {
      const j = mudaram[0];
      const m = unico(dBicas[j]);
      if (!m || Math.abs(m.k) !== 1) continue;
      const chave = `${m.tamanho.n}/${m.tamanho.d}`;
      if (m.k > 0) {
        const linha: LinhaRascunho = { tipo: "avulsa", texto: preencher(modelos.avulsa, { receptor, i: nomes(depois, j), peca: umaPeca(m.tamanho, pele) }) };
        linhas.push(linha);
        pendentes.push({ bica: j, chave, tamanho: m.tamanho, linha });
        // Uma rodada completa: uma peça deste tamanho em cada bica aberta vira uma linha só.
        const abertas = bicasAbertas(depois);
        const daRodada = abertas.map((k) => pendentes.find((p) => p.bica === k && p.chave === chave) ?? null);
        if (abertas.length > 0 && daRodada.every((p) => p !== null)) {
          const usadas = daRodada as Avulsa[];
          const primeira = Math.min(...usadas.map((p) => linhas.indexOf(p.linha)));
          const r = abertas.length;
          const tirou = vezes(m.tamanho, r);
          const v = {
            cadaNome: cadaComNome(m.tamanho, 1, pele),
            cada: cadaNumero(m.tamanho, 1),
            receptor: pele.receptor.singular,
            receptores: String(r),
            tirou: q(tirou),
          };
          const rodada: LinhaRascunho = {
            tipo: "mao",
            texto: escolher(preencher(modelos.mao, v), preencher(modelos.maoCurta, v)),
            rodada: { tipo: "mao", cada: m.tamanho, receptores: r, tirou },
          };
          const fora = new Set(usadas.map((p) => p.linha));
          const restantes = linhas.filter((l) => !fora.has(l));
          restantes.splice(Math.min(primeira, restantes.length), 0, rodada);
          linhas.length = 0;
          linhas.push(...restantes);
          pendentes = pendentes.filter((p) => !usadas.includes(p));
        }
      } else {
        // Devolver uma peça avulsa desfaz a linha dela; devolver outra fica escrito.
        const k = pendentes.map((p) => p.bica === j && p.chave === chave).lastIndexOf(true);
        if (k >= 0) {
          const p = pendentes[k];
          pendentes = pendentes.filter((_, x) => x !== k);
          const idx = linhas.indexOf(p.linha);
          if (idx >= 0) linhas.splice(idx, 1);
        } else {
          linhas.push({ tipo: "devolveu", texto: preencher(modelos.devolveu, { receptor, i: nomes(depois, j), peca: umaPeca(m.tamanho, pele) }) });
        }
      }
    }
  }

  // O engasgo não muda o material: aparece enquanto é o último evento.
  const ev = b.atual.evento;
  if (ev?.tipo === "engasgo") {
    linhas.push({
      tipo: "engasgo",
      texto: preencher(modelos.engasgo, { lote: String(ev.lote), abertas: String(ev.abertas), pedido: String(ev.pedido), ha: String(ev.ha) }),
    });
  }
  return linhas;
}

/** As rodadas do rascunho (voltas e rodadas à mão), na ordem: o que a conta armada lê. */
export function rodadasDaBancada(b: Bancada, pele: PeleRascunho, modelos: ModelosRascunho): Rodada[] {
  return rascunhoDaBancada(b, pele, modelos).flatMap((l) => (l.rodada ? [l.rodada] : []));
}

/** A soma do que cada receptor recebeu nas rodadas (para conferir com o quociente). */
export function somaDasRodadas(rodadas: readonly Rodada[]): Racional {
  return rodadas.reduce((s, r) => soma(s, r.cada), inteiro(0));
}
