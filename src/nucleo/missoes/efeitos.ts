/**
 * Efeitos do motor aplicados ao progresso. Função pura: a tela só chama isto.
 */
import {
  acrescentarMarca,
  concluirAtividade,
  descartarExecucao,
  encontrarJoia,
  guardarPagina,
  registrarCena,
  registrarEvidencias,
  registrarPalpite,
  registrarVisitaMuseu,
  salvarExecucao,
  type Progresso,
} from "../progresso";
import type { Efeito, Execucao } from "./motor";
import type { Atividade } from "./tipos";

/** Onde a execução fica guardada: guiada pelo id; prova e registro com sufixo, para não se atropelarem. */
export function chaveExecucao(a: Atividade, modo: Execucao["modo"]): string {
  return modo === "guiada" ? a.id : `${a.id}#${modo}`;
}

export function aplicarEfeitos(p: Progresso, a: Atividade, exec: Execucao, efeitos: readonly Efeito[], agora: number): Progresso {
  let q = p;
  for (const ef of efeitos) {
    switch (ef.tipo) {
      case "evidencias":
        q = registrarEvidencias(q, ef.lista, agora);
        break;
      case "palpite":
        q = registrarPalpite(q, { atividade: a.id, passo: ef.passo, valor: ef.valor, certo: ef.certo, momento: agora }, agora);
        break;
      case "pagina":
        q = guardarPagina(q, ef.pagina, agora);
        break;
      case "marca":
        q = acrescentarMarca(q, ef.id, agora);
        break;
      case "joia":
        q = encontrarJoia(q, ef.id, agora);
        break;
      case "concluida":
        if (ef.via !== "registro") {
          q = concluirAtividade(q, a.id, ef.via, agora);
          if (a.tipo === "exposicao") q = registrarVisitaMuseu(q, a.id, agora);
          if (a.tipo === "cena") q = registrarCena(q, a.id, agora);
        }
        break;
      case "equivoco":
      case "resultado":
        break;
    }
  }
  const chave = chaveExecucao(a, exec.modo);
  if (exec.concluida) return descartarExecucao(q, chave, agora);
  return salvarExecucao(q, chave, exec, agora);
}

/** Lê uma execução salva; devolve null se não servir mais (atividade mudou, formato antigo). */
export function restaurarExecucao(salva: unknown, a: Atividade, passosNoModo: (modo: Execucao["modo"]) => number): Execucao | null {
  if (typeof salva !== "object" || salva === null) return null;
  const e = salva as Partial<Execucao>;
  if (e.versao !== 1 || e.atividade !== a.id) return null;
  if (e.modo !== "guiada" && e.modo !== "prova" && e.modo !== "registro") return null;
  if (typeof e.indice !== "number" || e.indice < 0 || e.indice >= passosNoModo(e.modo)) return null;
  if (typeof e.passo !== "object" || e.passo === null) return null;
  if (e.concluida) return null;
  return e as Execucao;
}
