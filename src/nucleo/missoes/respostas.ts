/**
 * Conferência de respostas (notacao.equivale): compara por VALOR exato, aceitando formas
 * equivalentes quando o passo permitir. Reconhece equívocos por regra, sem IA.
 */
import { comoRacional, divide, igual, lerRacional, UM, type Racional } from "../racional/racional";
import type { RespostaEquivoco } from "./tipos";

export interface Conferencia {
  readonly certa: boolean;
  readonly naoSei: boolean;
  readonly equivoco: string | null;
}

export function lerEscrita(valor: string): { n: number; d: number } | null {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(valor);
  if (m) return Number(m[2]) === 0 ? null : { n: Number(m[1]), d: Number(m[2]) };
  const k = /^\s*(\d+)\s*$/.exec(valor);
  return k ? { n: Number(k[1]), d: 1 } : null;
}

/**
 * @param valor resposta escrita ("3/4", "6", "2/4") ou id de opção; null = "não sei ainda".
 * @param esperado valor exato, ou id de opção quando `opcao` é true.
 */
export function conferirResposta(
  valor: string | null,
  esperado: Racional | string,
  opcoes: { aceitaEquivalente?: boolean; respostasEquivoco?: readonly RespostaEquivoco[]; opcao?: boolean } = {},
): Conferencia {
  if (valor === null) return { certa: false, naoSei: true, equivoco: null };
  if (typeof esperado === "string" || opcoes.opcao) {
    const alvo = typeof esperado === "string" ? esperado : `${esperado.n}/${esperado.d}`;
    const certa = valor === alvo;
    const eq = opcoes.respostasEquivoco?.find((r) => r.resposta === valor)?.equivoco ?? null;
    return { certa, naoSei: false, equivoco: certa ? null : eq };
  }
  const lido = lerRacional(valor);
  const escrita = lerEscrita(valor);
  if (!lido) return { certa: false, naoSei: false, equivoco: null };
  const aceitaEquivalente = opcoes.aceitaEquivalente ?? true;
  const certa = aceitaEquivalente
    ? igual(lido, esperado)
    : escrita !== null && escrita.n === esperado.n && escrita.d === esperado.d;
  if (certa) return { certa: true, naoSei: false, equivoco: null };
  const declarado = opcoes.respostasEquivoco?.find((r) => {
    const x = lerRacional(r.resposta);
    return x !== null && igual(x, lido) && (r.resposta === valor || aceitaEquivalente);
  });
  if (declarado) return { certa: false, naoSei: false, equivoco: declarado.equivoco };
  // Fração invertida: 4/3 no lugar de 3/4.
  if (lido.n !== 0 && esperado.n !== 0 && !igual(esperado, UM) && igual(lido, divide(UM, esperado))) {
    return { certa: false, naoSei: false, equivoco: "fracao-invertida" };
  }
  return { certa: false, naoSei: false, equivoco: null };
}

export function esperadoDeTexto(t: string): Racional {
  return comoRacional(t);
}
