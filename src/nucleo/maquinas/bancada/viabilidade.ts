/**
 * Viabilidade: dá para ainda fechar a partilha sem sobra, cortando e repartindo?
 * Usada para reconhecer o corte que não fecha (cortar 1 broa em 3 para 4 mesas).
 *
 * Com as bicas iguais, cada volta tira múltiplos de B (bicas em uso) de uma pilha. Só importa o
 * resto de cada pilha módulo B. Busca em profundidade sobre esses restos, com memória e teto.
 */
import { chave, comoRacional, divide, inteiro, type Racional } from "../../racional/racional";
import { bicasEmUso, quantidadesPorBica, todasIguais } from "./bancada";
import type { EstadoBancada } from "./tipos";

const TETO_BUSCA = 6000;

type Restos = Map<string, number>;

function assinatura(r: Restos): string {
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

  const inicio: Restos = new Map();
  for (const p of e.esteira) inicio.set(chave(p.tamanho), p.quantidade % B);

  const vistos = new Set<string>();
  let passos = 0;
  let estourou = false;

  const buscar = (r: Restos): boolean => {
    const ass = assinatura(r);
    if (ass === "") return true;
    if (vistos.has(ass)) return false;
    vistos.add(ass);
    passos += 1;
    if (passos > TETO_BUSCA) {
      estourou = true;
      return false;
    }
    for (const [k, resto] of r) {
      if (resto === 0) continue;
      const tamanho: Racional = comoRacional(k);
      for (const P of f.partes) {
        const novo = divide(tamanho, inteiro(P));
        if (novo.d > f.denominadorMaximo) continue;
        const kn = chave(novo);
        for (let j = 1; j <= resto; j++) {
          const prox = new Map(r);
          prox.set(k, resto - j);
          prox.set(kn, ((prox.get(kn) ?? 0) + j * P) % B);
          if (buscar(prox)) return true;
        }
      }
    }
    return false;
  };

  const ok = buscar(inicio);
  if (ok) return true;
  return estourou ? null : false;
}
