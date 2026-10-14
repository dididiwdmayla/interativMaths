/**
 * Uma tentativa de resposta: a chamada ao modelo, ou uma simulação. A resiliência (novas
 * tentativas, orçamento, reserva) fica fora, em resiliencia.ts; os testes injetam a tentativa.
 */
import type { TipoFalhaTutor } from "@/nucleo/tutor/contrato";

export interface PedidoModelo {
  readonly system: string;
  readonly messages: readonly { readonly role: "user" | "assistant"; readonly content: string }[];
  /** O esquema da saída estruturada: { texto, expressao, alvo }. */
  readonly schema: Readonly<Record<string, unknown>>;
  readonly maxTokens: number;
}

export type ResultadoTentativa =
  | { readonly ok: true; readonly json: unknown; readonly requestId: string | null }
  | {
      readonly ok: false;
      readonly falha: TipoFalhaTutor;
      /** Status HTTP (null: sem resposta, como numa queda de rede). */
      readonly status: number | null;
      readonly retryAfterMs: number | null;
      readonly requestId: string | null;
    };

export type Tentativa = (modelo: string, pedido: PedidoModelo, limiteMs: number) => Promise<ResultadoTentativa>;

/** Status que pedem nova tentativa: muita gente, falha do servidor, porta de entrada, sobrecarga. */
export const STATUS_DE_NOVA_TENTATIVA: readonly number[] = [429, 500, 504, 529];

/** O tipo de falha por status HTTP. */
export function falhaDoStatus(status: number): TipoFalhaTutor {
  if (status === 401 || status === 403) return "sem_chave";
  if (status === 402) return "sem_credito";
  if (status === 429 || status >= 500) return "sobrecarga";
  return "desconhecido";
}
