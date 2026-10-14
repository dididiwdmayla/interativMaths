/**
 * A tentativa real: uma chamada ao Messages API pelo SDK oficial. O cliente não repete sozinho
 * (maxRetries 0): as novas tentativas são nossas, com log e orçamento. Saída estruturada por
 * output_config.format (json_schema), esforço baixo e sem pensamento estendido, para responder rápido.
 * As falhas são classificadas pelas classes de erro do SDK e pelo status, nunca pelo texto.
 */
import Anthropic from "@anthropic-ai/sdk";
import { falhaDoStatus, type PedidoModelo, type ResultadoTentativa, type Tentativa } from "./tentativa";

export const LIMITE_POR_TENTATIVA_MS = 15_000;

/**
 * Pensamento desligado, como pede a conversa. Alguns modelos não aceitam desligar: o Sonnet 5.5
 * troca por between_tools; Opus 5.5 e Fable seguem adaptativos com esforço baixo. Só importa
 * quando o modelo reserva for um deles.
 */
function pensamentoPara(modelo: string): Anthropic.ThinkingConfigParam | undefined {
  if (modelo.startsWith("claude-sonnet-5-5")) return { type: "between_tools" };
  if (modelo.startsWith("claude-opus-5-5") || modelo.startsWith("claude-fable") || modelo.startsWith("claude-mythos")) return undefined;
  return { type: "disabled" };
}

/** retry-after vem em segundos (pode ter fração). */
function lerRetryAfter(cabecalhos: Headers | undefined): number | null {
  const bruto = cabecalhos?.get("retry-after");
  if (!bruto) return null;
  const s = Number(bruto);
  return Number.isFinite(s) && s >= 0 ? Math.round(s * 1000) : null;
}

export function classificarErro(e: unknown): ResultadoTentativa {
  // APIConnectionError (e o timeout, que herda dele) é subclasse de APIError: vem primeiro.
  if (e instanceof Anthropic.APIConnectionError) {
    return { ok: false, falha: "rede", status: null, retryAfterMs: null, requestId: null };
  }
  if (e instanceof Anthropic.APIError) {
    const status = typeof e.status === "number" ? e.status : null;
    return {
      ok: false,
      falha: status === null ? "desconhecido" : falhaDoStatus(status),
      status,
      retryAfterMs: lerRetryAfter(e.headers),
      requestId: e.requestID ?? null,
    };
  }
  return { ok: false, falha: "desconhecido", status: null, retryAfterMs: null, requestId: null };
}

export function tentativaAnthropic(chave: string): Tentativa {
  const cliente = new Anthropic({ apiKey: chave, maxRetries: 0, timeout: LIMITE_POR_TENTATIVA_MS });
  return async (modelo: string, pedido: PedidoModelo, limiteMs: number): Promise<ResultadoTentativa> => {
    try {
      const pensamento = pensamentoPara(modelo);
      const resposta = await cliente.messages.create(
        {
          model: modelo,
          max_tokens: pedido.maxTokens,
          system: pedido.system,
          messages: pedido.messages.map((m) => ({ role: m.role, content: m.content })),
          ...(pensamento ? { thinking: pensamento } : {}),
          output_config: { effort: "low", format: { type: "json_schema", schema: { ...pedido.schema } } },
        },
        { timeout: Math.min(limiteMs, LIMITE_POR_TENTATIVA_MS) },
      );
      const requestId = resposta._request_id ?? null;
      // Recusa ou corte por tamanho: a saída pode não seguir o esquema.
      if (resposta.stop_reason === "refusal" || resposta.stop_reason === "max_tokens") {
        return { ok: false, falha: "desconhecido", status: 200, retryAfterMs: null, requestId };
      }
      const bloco = resposta.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      let json: unknown = null;
      try {
        json = bloco ? JSON.parse(bloco.text) : null;
      } catch {
        json = null;
      }
      return { ok: true, json, requestId };
    } catch (e) {
      return classificarErro(e);
    }
  };
}
