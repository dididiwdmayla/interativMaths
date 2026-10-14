/**
 * POST /api/tutor, sem o Next: lê o pedido, valida o contrato, monta o contexto pelos ids, tenta o
 * modelo com resiliência, confere a saída e passa pelas guardas. A rota só chama isto com as
 * dependências reais; os testes injetam a tentativa, o relógio e o log.
 *
 * Falha esperada responde 200 com { erro: { tipo } }; entrada inválida, 400.
 * O log leva tipo, status, modelo, tentativas e o request-id da Anthropic. Nunca o texto da pergunta.
 */
import { lerPedidoTutor, lerSaidaModelo, LIMITES_TUTOR, type EntradaTutor, type RespostaTutor, type TipoFalhaTutor } from "@/nucleo/tutor/contrato";
import { contaFalsa, segredoEntregue } from "@/nucleo/tutor/guardas";
import { tentativaAnthropic } from "./anthropic";
import { conversaDisponivel, lerConfiguracao, type ConfiguracaoTutor } from "./configuracao";
import { esquemaDaSaida, montarContexto, type ContextoConversa } from "./contexto";
import { RELOGIO_REAL, tentarComResiliencia, type Relogio } from "./resiliencia";
import { tentativaSimulada } from "./simulacao";
import type { PedidoModelo, Tentativa } from "./tentativa";

export type Guarda = "entrega" | "conta" | "formato";

export interface RegistroTutor {
  readonly tipo: "ok" | "recurso" | TipoFalhaTutor;
  readonly status: number | null;
  readonly modelo: string | null;
  readonly tentativas: number;
  readonly requestId: string | null;
  readonly guarda?: Guarda;
}

export interface DependenciasTutor {
  readonly config: ConfiguracaoTutor;
  /** Troca a tentativa (testes). Sem ela: a simulação configurada, ou a chamada real. */
  readonly tentativa?: (ctx: ContextoConversa) => Tentativa;
  readonly relogio: Relogio;
  readonly aleatorio: () => number;
  readonly log: (r: RegistroTutor) => void;
}

export function dependenciasPadrao(): DependenciasTutor {
  return {
    config: lerConfiguracao(),
    relogio: RELOGIO_REAL,
    aleatorio: Math.random,
    log: (r) => console.info(`tutor ${JSON.stringify(r)}`),
  };
}

const MAX_TOKENS = 400;

function json(corpo: RespostaTutor | { readonly erro: string }, status = 200): Response {
  return Response.json(corpo, { status, headers: { "cache-control": "no-store" } });
}

/** O histórico como mensagens alternadas, começando pelo jogador; a pergunta vai por último. */
function mensagens(e: EntradaTutor): PedidoModelo["messages"] {
  const lista: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of e.historico) {
    const role = m.autor === "jogador" ? "user" : "assistant";
    if (lista.length === 0 && role === "assistant") continue;
    const ultima = lista.at(-1);
    if (ultima && ultima.role === role) ultima.content = `${ultima.content}\n${m.texto}`;
    else lista.push({ role, content: m.texto });
  }
  const ultima = lista.at(-1);
  if (ultima && ultima.role === "user") ultima.content = `${ultima.content}\n${e.pergunta}`;
  else lista.push({ role: "user", content: e.pergunta });
  return lista;
}

/** O degrau seguinte da escada, para quando a resposta do modelo é barrada. */
function recurso(e: EntradaTutor, ctx: ContextoConversa): RespostaTutor {
  if (!ctx.passo.dicas) return { recurso: { degrau: null } };
  const degrau = Math.max(1, Math.min(3, e.degrau + 1)) as 1 | 2 | 3;
  return { recurso: { degrau } };
}

export async function tratarPedidoTutor(pedido: Request, deps: DependenciasTutor): Promise<Response> {
  let corpo: unknown;
  try {
    corpo = await pedido.json();
  } catch {
    return json({ erro: "corpo inválido" }, 400);
  }
  const lido = lerPedidoTutor(corpo);
  if (!lido) return json({ erro: "pedido fora do contrato" }, 400);
  if (lido.tipo === "disponibilidade") return json({ disponivel: conversaDisponivel(deps.config) });

  const ctx = montarContexto(lido);
  if (!ctx) return json({ erro: "atividade ou passo desconhecido" }, 400);
  if (!conversaDisponivel(deps.config)) {
    deps.log({ tipo: "sem_chave", status: null, modelo: null, tentativas: 0, requestId: null });
    return json({ erro: { tipo: "sem_chave" } });
  }

  const tentativa: Tentativa = deps.tentativa
    ? deps.tentativa(ctx)
    : deps.config.simular
      ? tentativaSimulada(deps.config.simular, { alvos: ctx.alvos, segredos: ctx.segredos, relogio: deps.relogio })
      : tentativaAnthropic(deps.config.chave ?? "");

  const pedidoModelo: PedidoModelo = { system: ctx.system, messages: mensagens(lido), schema: esquemaDaSaida(ctx.alvos), maxTokens: MAX_TOKENS };
  const { resultado, modelo, tentativas } = await tentarComResiliencia(
    tentativa,
    pedidoModelo,
    { principal: deps.config.modelo, reserva: deps.config.reserva },
    { relogio: deps.relogio, aleatorio: deps.aleatorio },
  );
  const base = { modelo, tentativas, requestId: resultado.requestId };

  if (!resultado.ok) {
    deps.log({ tipo: resultado.falha, status: resultado.status, ...base });
    return json({ erro: { tipo: resultado.falha } });
  }

  const barrar = (guarda: Guarda): Response => {
    deps.log({ tipo: "recurso", status: 200, guarda, ...base });
    return json(recurso(lido, ctx));
  };
  const saida = lerSaidaModelo(resultado.json, ctx.alvos);
  // A voz do Nônio também é regra: sem exclamação e sem julgar ("errado").
  if (!saida || saida.texto.length > LIMITES_TUTOR.resposta || /!|\berrad/i.test(saida.texto)) return barrar("formato");
  if (lido.situacao !== "vencido" && segredoEntregue(saida.texto, ctx.segredos)) return barrar("entrega");
  if (contaFalsa(saida.texto)) return barrar("conta");

  deps.log({ tipo: "ok", status: 200, ...base });
  return json({ resposta: saida });
}
