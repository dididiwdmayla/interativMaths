/**
 * Simulações da conversa, só fora de produção (TUTOR_SIMULAR): para ver a tela sem chave e para os
 * testes da rota. Cada uma é uma tentativa como a real, com a mesma forma de resultado.
 */
import type { Segredo } from "@/nucleo/missoes/segredos";
import type { AlvoMaquina } from "@/nucleo/missoes/tipos";
import { formatar } from "@/nucleo/racional/racional";
import type { Simulacao } from "./configuracao";
import type { Relogio } from "./resiliencia";
import type { ResultadoTentativa, Tentativa } from "./tentativa";

const SOBRECARGA: ResultadoTentativa = { ok: false, falha: "sobrecarga", status: 529, retryAfterMs: null, requestId: "req_simulado" };

export function tentativaSimulada(
  simulacao: Simulacao,
  ctx: { readonly alvos: readonly AlvoMaquina[]; readonly segredos: readonly Segredo[]; readonly relogio: Relogio; readonly esperaMs?: number },
): Tentativa {
  let chamadas = 0;
  const alvo = ctx.alvos.includes("esteira") ? "esteira" : null;
  const ok = (json: unknown): ResultadoTentativa => ({ ok: true, json, requestId: "req_simulado" });
  return async () => {
    chamadas += 1;
    await ctx.relogio.esperar(ctx.esperaMs ?? 700);
    switch (simulacao) {
      case "sobrecarga":
        return chamadas === 1 ? SOBRECARGA : ok({ texto: "Olhe a esteira antes de girar. Quantas peças ainda esperam ali?", expressao: "atento", alvo });
      case "sobrecarga-total":
        return SOBRECARGA;
      case "rede":
        return { ok: false, falha: "rede", status: null, retryAfterMs: null, requestId: null };
      case "resposta":
        return ok({ texto: "Olhe a esteira antes de girar. Quantas peças ainda esperam ali?", expressao: "atento", alvo });
      case "entrega": {
        const s = ctx.segredos[0];
        const dito = s ? (s.tipo === "opcao" ? (s.texto ?? formatar(s.valor)) : formatar(s.valor)) : "6";
        return ok({ texto: `A resposta é ${dito}.`, expressao: "neutro", alvo: null });
      }
      case "conta-falsa":
        return ok({ texto: "Repare: 5 ÷ 4 = 2. Teste na máquina.", expressao: "medindo", alvo: null });
    }
  };
}
