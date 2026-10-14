/**
 * A regra da instrução: verbo no imperativo primeiro, até 80 caracteres, termina em ponto,
 * concreta, sem julgar. A checagem de conteúdo roda isto em todo passo de toda atividade,
 * inclusive nas geradas.
 */

/** Verbos com que uma instrução pode começar. Verbo novo entra aqui, de propósito. */
export const VERBOS_DA_INSTRUCAO: readonly string[] = [
  "Abra",
  "Chame",
  "Comprima",
  "Complete",
  "Corte",
  "Diga",
  "Distribua",
  "Entregue",
  "Escolha",
  "Faça",
  "Feche",
  "Guarde",
  "Leia",
  "Leve",
  "Monte",
  "Mostre",
  "Ponha",
  "Reparta",
  "Responda",
  "Sirva",
  "Termine",
  "Tire",
  "Toque",
  "Veja",
];

export const LIMITE_INSTRUCAO = 80;

/** O que a instrução quebra da regra (vazio: está boa). */
export function problemasDaInstrucao(instrucao: string): string[] {
  const p: string[] = [];
  if (instrucao.length > LIMITE_INSTRUCAO) p.push(`passa de ${LIMITE_INSTRUCAO} caracteres`);
  if (!instrucao.endsWith(".")) p.push("não termina em ponto");
  const primeira = instrucao.split(/[\s,:]/)[0];
  if (!VERBOS_DA_INSTRUCAO.includes(primeira)) p.push(`não começa com verbo da lista ("${primeira}")`);
  if (/errad|!/i.test(instrucao)) p.push("julga ou exclama");
  return p;
}
