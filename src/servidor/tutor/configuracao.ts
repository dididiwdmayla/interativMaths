/**
 * Variáveis de ambiente do tutor. Só servidor: nada aqui chega ao navegador.
 * - ANTHROPIC_API_KEY: a chave. Sem ela, a conversa não aparece (o jogo funciona igual).
 * - TUTOR_MODELO: o modelo (padrão claude-haiku-5-5).
 * - TUTOR_MODELO_RESERVA: opcional, sem padrão; uma tentativa nele quando o principal está sobrecarregado.
 * - TUTOR_SIMULAR: só fora de produção; troca a chamada por uma simulação (ver simulacao.ts).
 */
export const MODELO_PADRAO = "claude-haiku-5-5";

export const SIMULACOES = ["sobrecarga", "sobrecarga-total", "rede", "resposta", "entrega", "conta-falsa"] as const;
export type Simulacao = (typeof SIMULACOES)[number];

export interface ConfiguracaoTutor {
  readonly chave: string | null;
  readonly modelo: string;
  readonly reserva: string | null;
  readonly simular: Simulacao | null;
}

type Ambiente = Readonly<Record<string, string | undefined>>;

function preenchida(v: string | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

export function lerConfiguracao(env: Ambiente = process.env): ConfiguracaoTutor {
  const pedida = preenchida(env.TUTOR_SIMULAR);
  const simular = env.NODE_ENV !== "production" && pedida !== null ? (SIMULACOES.find((s) => s === pedida) ?? null) : null;
  return {
    chave: preenchida(env.ANTHROPIC_API_KEY),
    modelo: preenchida(env.TUTOR_MODELO) ?? MODELO_PADRAO,
    reserva: preenchida(env.TUTOR_MODELO_RESERVA),
    simular,
  };
}

/** A conversa existe com a chave, ou com uma simulação ativa (fora de produção). */
export function conversaDisponivel(c: ConfiguracaoTutor): boolean {
  return c.chave !== null || c.simular !== null;
}
