/**
 * O tema sem piscar: o script do <head> roda antes da primeira pintura e põe `data-tema` no
 * <html>. Ordem: `?tema=claro|escuro` no endereço; a escolha guardada (fora da degustação, que
 * segue o aparelho); e o `prefers-color-scheme` do aparelho. O resto vem do React (Tema.tsx).
 */
export type Tema = "claro" | "escuro";

/** A escolha espelhada fora do progresso, para o script ler antes do React. */
export const CHAVE_APARENCIA = "interativmaths:aparencia";

export const CONSULTA_ESCURO = "(prefers-color-scheme: dark)";

export const SCRIPT_TEMA = `(function(){var d=document.documentElement,t=null;try{var q=new URLSearchParams(location.search).get("tema");if(q==="claro"||q==="escuro")t=q}catch(e){}if(!t&&location.pathname.indexOf("/degustacao")!==0){try{var a=localStorage.getItem("${CHAVE_APARENCIA}");if(a==="claro"||a==="escuro")t=a}catch(e){}}if(!t)t=window.matchMedia&&window.matchMedia("${CONSULTA_ESCURO}").matches?"escuro":"claro";d.setAttribute("data-tema",t)})()`;

/** O tema pedido no endereço (?tema=), se houver. */
export function temaDoEndereco(busca: string): Tema | null {
  const q = new URLSearchParams(busca).get("tema");
  return q === "claro" || q === "escuro" ? q : null;
}
