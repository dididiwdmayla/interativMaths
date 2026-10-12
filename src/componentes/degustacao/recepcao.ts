/**
 * A conversa da degustação com a recepção do interativAI (interativai.com), que a abre num iframe.
 * As mensagens vão só para a origem da página-mãe, e só se ela estiver na lista permitida; nunca
 * para "*". A mesma lista está no cabeçalho frame-ancestors de /degustacao (next.config.ts); um
 * teste confere que as duas concordam.
 */

/** A recepção, com e sem www. */
export const ORIGENS_DA_RECEPCAO = ["https://interativai.com", "https://www.interativai.com"] as const;

/** Prévias de deploy da Vercel (qualquer projeto em *.vercel.app), para testar antes de publicar. */
const PREVIA_VERCEL = /^https:\/\/([a-z0-9-]+\.)+vercel\.app$/;

/** Para onde "Quero continuar" leva quando a ilhota está aberta sozinha. */
export const URL_ACESSO = "https://interativai.com/acesso?produto=matematica";

export type TipoMensagem = "pronto" | "concluiu" | "quero-continuar" | "fechar";

export interface MensagemDegustacao {
  readonly fonte: "interativmaths";
  readonly tipo: TipoMensagem;
}

/** A página-mãe pode embutir e ouvir a ilhota? Vale a própria origem, a recepção e as prévias. */
export function origemPermitida(origem: string, propria: string): boolean {
  if (origem === propria) return true;
  if ((ORIGENS_DA_RECEPCAO as readonly string[]).includes(origem)) return true;
  return PREVIA_VERCEL.test(origem);
}

/** A ilhota está dentro de um iframe, ou pediu o modo embutido com ?embed=1. */
export function estaEmbutida(janela: Window): boolean {
  if (new URLSearchParams(janela.location.search).get("embed") === "1") return true;
  try {
    return janela.self !== janela.top;
  } catch {
    // Ler window.top de outra origem pode ser barrado: só acontece dentro de um iframe.
    return true;
  }
}

/** A origem da página-mãe, se houver uma e der para saber qual é. */
export function origemDaMae(janela: Window): string | null {
  if (janela.parent === janela) return null;
  const ancestrais = janela.location.ancestorOrigins;
  if (ancestrais && ancestrais.length > 0) return ancestrais[0];
  try {
    return janela.document.referrer ? new URL(janela.document.referrer).origin : null;
  } catch {
    return null;
  }
}

/** Manda uma mensagem à recepção. Devolve se mandou (há mãe, e ela está na lista). */
export function avisarRecepcao(tipo: TipoMensagem): boolean {
  if (typeof window === "undefined") return false;
  const mae = origemDaMae(window);
  if (!mae || !origemPermitida(mae, window.location.origin)) return false;
  const mensagem: MensagemDegustacao = { fonte: "interativmaths", tipo };
  try {
    window.parent.postMessage(mensagem, mae);
    return true;
  } catch {
    return false;
  }
}
