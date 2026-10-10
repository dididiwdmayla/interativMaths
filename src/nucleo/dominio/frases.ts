/**
 * Evidências em português comum, para a Planta: "você repartiu com sobra, sem ajuda, em 2 situações".
 * Sem porcentagem, sem nota.
 */
import { inteiroPorExtenso } from "../racional/extenso";
import { ehSucessoValido } from "./dominio";
import type { Evidencia } from "./evidencias";

function situacoes(k: number): string {
  if (k === 1) return "em uma situação";
  return `em ${inteiroPorExtenso(k, "f")} situações`;
}

export function evidenciasEmPalavras(verbo: string, evidencias: readonly Evidencia[]): string[] {
  const linhas: string[] = [];
  const validas = evidencias.filter(ehSucessoValido);
  const semAjuda = new Set(validas.filter((e) => e.ajuda === 0).map((e) => e.contexto));
  const comMedida = new Set(validas.filter((e) => e.ajuda === 1).map((e) => e.contexto));
  for (const c of semAjuda) comMedida.delete(c);
  const comMuitaAjuda = new Set(
    evidencias.filter((e) => e.resultado === "sucesso" && e.ajuda >= 2 && e.tipo !== "calibragem").map((e) => e.contexto),
  );

  if (semAjuda.size > 0) linhas.push(`Você ${verbo}, sem ajuda, ${situacoes(semAjuda.size)}.`);
  if (comMedida.size > 0) linhas.push(`Você ${verbo} com uma dica curta do Nônio ${situacoes(comMedida.size)}.`);
  if (comMuitaAjuda.size > 0) {
    linhas.push(`Com ajuda maior, ${situacoes(comMuitaAjuda.size)}. Essas ainda não entram na conta.`);
  }
  if (evidencias.some((e) => e.tipo === "calibragem" && e.resultado === "sucesso")) {
    linhas.push("Na calibragem, você já mostrou isto.");
  }
  if (validas.some((e) => e.tipo === "revisita")) linhas.push("Você voltou a isto depois de um dia, e funcionou.");
  if (validas.some((e) => e.tipo === "transferencia")) linhas.push("Você reconheceu a mesma ideia com outra roupa.");
  const naoSei = evidencias.filter((e) => e.resultado === "nao_sei").length;
  if (naoSei > 0) linhas.push(`Você disse "não sei ainda" ${naoSei === 1 ? "uma vez" : `${inteiroPorExtenso(naoSei, "f")} vezes`}. Vale.`);
  if (linhas.length === 0) linhas.push("Ainda não há medida disto.");
  return linhas;
}
