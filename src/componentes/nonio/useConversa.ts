"use client";

/**
 * A conversa com o Nônio no cliente: pergunta ao servidor se ela existe (uma vez por carga da
 * página), envia perguntas e guarda o histórico só na memória da execução aberta: nada vai para o
 * progresso. "Sem crédito" tira o botão Perguntar até recarregar a página.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { LIMITES_TUTOR, type EntradaTutor, type MensagemConversa, type RespostaTutor, type TipoFalhaTutor } from "@/nucleo/tutor/contrato";
import type { AlvoMaquina } from "@/nucleo/missoes/tipos";
import type { ExpressaoTutor } from "@/nucleo/tutor/expressoes";

let consulta: Promise<boolean> | null = null;
let foraDoAr = false;
const ouvintes = new Set<() => void>();

async function consultar(): Promise<boolean> {
  try {
    const r = await fetch("/api/tutor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tipo: "disponibilidade" }) });
    if (!r.ok) return false;
    const j = (await r.json()) as { disponivel?: unknown };
    return j.disponivel === true;
  } catch {
    // Sem rede agora: tenta de novo na próxima montagem.
    consulta = null;
    return false;
  }
}

function marcarForaDoAr() {
  foraDoAr = true;
  for (const f of ouvintes) f();
}

/** A conversa está disponível (a chave existe no servidor e não ficou fora do ar nesta carga)? */
export function useConversaDisponivel(ativa: boolean): boolean {
  const [disponivel, setDisponivel] = useState(false);
  const fora = useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => foraDoAr,
    () => false,
  );
  useEffect(() => {
    if (!ativa) return;
    let vivo = true;
    consulta ??= consultar();
    void consulta.then((d) => {
      if (vivo) setDisponivel(d);
    });
    return () => {
      vivo = false;
    };
  }, [ativa]);
  return ativa && disponivel && !fora;
}

export interface MensagemTela {
  readonly id: number;
  readonly autor: "jogador" | "nonio";
  readonly texto: string;
  readonly expressao?: ExpressaoTutor;
  readonly alvo?: AlvoMaquina | null;
  /** Resposta que não é do modelo (falha, limite): não entra no histórico enviado. */
  readonly aviso?: boolean;
}

export type Desfecho =
  | { readonly tipo: "resposta"; readonly texto: string; readonly expressao: ExpressaoTutor; readonly alvo: AlvoMaquina | null }
  | { readonly tipo: "recurso"; readonly degrau: 1 | 2 | 3 | null }
  | { readonly tipo: "falha"; readonly falha: TipoFalhaTutor };

const LIMITE_CLIENTE_MS = 50_000;

/** Envia uma pergunta. Nunca lança: toda falha vira um tipo. */
export async function perguntar(entrada: EntradaTutor): Promise<Desfecho> {
  const controle = new AbortController();
  const t = setTimeout(() => controle.abort(), LIMITE_CLIENTE_MS);
  try {
    const r = await fetch("/api/tutor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tipo: "pergunta", ...entrada }),
      signal: controle.signal,
    });
    if (!r.ok) return { tipo: "falha", falha: "desconhecido" };
    const j = (await r.json()) as RespostaTutor;
    if ("resposta" in j) return { tipo: "resposta", ...j.resposta };
    if ("recurso" in j) return { tipo: "recurso", degrau: j.recurso.degrau };
    if ("erro" in j) {
      if (j.erro.tipo === "sem_credito" || j.erro.tipo === "sem_chave") marcarForaDoAr();
      return { tipo: "falha", falha: j.erro.tipo };
    }
    return { tipo: "falha", falha: "desconhecido" };
  } catch {
    return { tipo: "falha", falha: "rede" };
  } finally {
    clearTimeout(t);
  }
}

/** O histórico que vai junto: as últimas trocas de verdade, cortadas no limite do contrato. */
export function historicoParaEnviar(mensagens: readonly MensagemTela[]): MensagemConversa[] {
  return mensagens
    .filter((m) => !m.aviso)
    .slice(-LIMITES_TUTOR.historico)
    .map((m) => ({ autor: m.autor, texto: m.texto.slice(0, LIMITES_TUTOR.mensagem) }));
}
