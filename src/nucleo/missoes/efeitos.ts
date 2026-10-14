/**
 * Efeitos do motor aplicados ao progresso. Função pura: a tela só chama isto.
 */
import {
  acrescentarMarca,
  concluirAtividade,
  descartarExecucao,
  encerrarRevisita,
  encontrarJoia,
  guardarPagina,
  registrarCena,
  registrarEvidencias,
  registrarPalpite,
  registrarVisitaMuseu,
  salvarExecucao,
  type Progresso,
} from "../progresso";
import { assinaturaDosPassos, VERSAO_EXECUCAO, type Efeito, type EstadoPasso, type Execucao } from "./motor";
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
          if (a.tipo === "revisita") q = encerrarRevisita(q, agora);
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

/** Campos do passo que a v2 acrescentou: uma execução antiga ganha os valores de começo. */
const PASSO_V2: Pick<EstadoPasso, "retorno" | "respostas" | "cumprido"> = { retorno: null, respostas: 0, cumprido: false };

/**
 * Lê uma execução salva; devolve null se não servir mais: atividade ou passos mudaram, formato
 * desconhecido. Execução v1 (até a v0.2) de missão recomeça do primeiro passo, porque os passos
 * das missões mudaram na v0.3; de eco, revisita, exposição e cena, segue de onde estava.
 * Conclusões, evidências, Caderno e joias não moram aqui e não são tocados.
 */
export function restaurarExecucao(salva: unknown, a: Atividade, passosNoModo: (modo: Execucao["modo"]) => number): Execucao | null {
  if (typeof salva !== "object" || salva === null) return null;
  const e = salva as Omit<Partial<Execucao>, "versao"> & { versao?: unknown };
  if (e.atividade !== a.id) return null;
  if (e.modo !== "guiada" && e.modo !== "prova" && e.modo !== "registro") return null;
  if (typeof e.indice !== "number" || e.indice < 0 || e.indice >= passosNoModo(e.modo)) return null;
  if (typeof e.passo !== "object" || e.passo === null) return null;
  if (e.concluida) return null;
  const assinatura = assinaturaDosPassos(a, e.modo);
  if (e.versao === 1) {
    if (a.tipo === "missao") return null;
    return { ...(e as Omit<Execucao, "versao">), versao: VERSAO_EXECUCAO, assinatura, passo: { ...PASSO_V2, ...e.passo } };
  }
  if (e.versao !== VERSAO_EXECUCAO || e.assinatura !== assinatura) return null;
  return { ...(e as Omit<Execucao, "versao">), versao: VERSAO_EXECUCAO, passo: { ...PASSO_V2, ...e.passo } };
}
