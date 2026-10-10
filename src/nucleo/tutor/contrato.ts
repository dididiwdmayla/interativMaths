/**
 * Contrato do tutor por conversa (futuro). Nesta versão o tutor é determinístico (escada de dicas e
 * resposta por equívoco); a rota existe e responde que a conversa não está disponível.
 * Em qualquer versão futura, a correção matemática continua sendo do motor.
 */
import type { ExpressaoTutor } from "./expressoes";

export interface EntradaTutor {
  readonly missao: string;
  readonly passo: string;
  /** Resumo do estado da máquina, em texto (o mesmo que o leitor de tela recebe). */
  readonly maquina: string;
  /** Equívocos recentes, do mais antigo ao mais novo. */
  readonly equivocos: readonly string[];
  readonly pergunta: string;
}

export interface SaidaTutor {
  readonly texto: string;
  readonly expressao: ExpressaoTutor;
}

export type RespostaTutor =
  | { readonly disponivel: false; readonly motivo: string }
  | { readonly disponivel: true; readonly saida?: SaidaTutor };

export type PedidoTutor = { readonly tipo: "disponibilidade" } | ({ readonly tipo: "pergunta" } & EntradaTutor);

export function ehPedidoTutor(x: unknown): x is PedidoTutor {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Record<string, unknown>;
  if (p.tipo === "disponibilidade") return true;
  return (
    p.tipo === "pergunta" &&
    typeof p.missao === "string" &&
    typeof p.passo === "string" &&
    typeof p.maquina === "string" &&
    Array.isArray(p.equivocos) &&
    typeof p.pergunta === "string" &&
    p.pergunta.length <= 500
  );
}
