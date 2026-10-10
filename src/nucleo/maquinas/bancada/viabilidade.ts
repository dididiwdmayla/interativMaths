/**
 * Viabilidade: dá para ainda fechar a partilha sem sobra, cortando e repartindo?
 * Usada para reconhecer o corte que não fecha (cortar 1 broa em 3 para 4 mesas).
 *
 * Com as bicas iguais, cada volta tira múltiplos de B (bicas em uso) de uma pilha. Uma pilha com
 * c peças equivale a uma com c (se c < B) ou B + (c mod B) peças: sobra liberdade para cortar
 * qualquer quantidade, e o excesso sai em voltas. Busca em profundidade sobre esse estado
 * reduzido, com memória e teto. Se o teto estourar, a resposta é "não sei" (null).
 */
import { chave, comoRacional, divide, inteiro } from "../../racional/racional";
import { bicasEmUso, quantidadesPorBica, todasIguais } from "./bancada";
import type { EstadoBancada } from "./tipos";

const TETO_BUSCA = 20000;

type Contagens = Map<string, number>;

function reduzir(c: number, B: number): number {
  return c < B ? c : B + (c % B);
}

function assinatura(r: Contagens): string {
  return [...r.entries()]
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

/**
 * true: ainda fecha; false: não fecha mais; null: não dá para dizer (sem Fatiador, bicas desiguais
 * ou busca grande demais). Quem chama só acusa equívoco com `false`.
 */
export function aindaFecha(e: EstadoBancada): boolean | null {
  const f = e.config.fatiador;
  if (!f) return null;
  const uso = bicasEmUso(e);
  const B = uso.length;
  if (B === 0) return null;
  if (!todasIguais(quantidadesPorBica(e, uso))) return null;

  const inicio: Contagens = new Map();
  for (const p of e.esteira) inicio.set(chave(p.tamanho), reduzir(p.quantidade, B));

  const vistos = new Set<string>();
  let passos = 0;
  let estourou = false;

  const fechou = (r: Contagens) => [...r.values()].every((v) => v % B === 0);

  const buscar = (r: Contagens): boolean => {
    if (fechou(r)) return true;
    const ass = assinatura(r);
    if (vistos.has(ass)) return false;
    vistos.add(ass);
    passos += 1;
    if (passos > TETO_BUSCA) {
      estourou = true;
      return false;
    }
    for (const [k, c] of r) {
      if (c === 0) continue;
      const tamanho = comoRacional(k);
      for (const P of f.partes) {
        const novo = divide(tamanho, inteiro(P));
        if (novo.d > f.denominadorMaximo) continue;
        const kn = chave(novo);
        for (let j = 1; j <= c; j++) {
          const prox = new Map(r);
          prox.set(k, reduzir(c - j, B));
          prox.set(kn, reduzir((prox.get(kn) ?? 0) + j * P, B));
          if (buscar(prox)) return true;
          if (estourou) return false;
        }
      }
    }
    return false;
  };

  const ok = buscar(inicio);
  if (ok) return true;
  return estourou ? null : false;
}
