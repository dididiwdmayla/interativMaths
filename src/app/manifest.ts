/**
 * O app instalável: adicionado à tela de início, abre sem as barras do navegador. Cores do claro,
 * lidas de tokens.css. Sem service worker: jogar sem rede está fora do escopo.
 */
import type { MetadataRoute } from "next";
import { lerToken } from "@/tema/lerToken";
import { DESCRICAO, NOME } from "./metadados";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "interativMaths — o Engenho",
    short_name: NOME,
    description: DESCRICAO,
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: lerToken("papel"),
    theme_color: lerToken("papel"),
    icons: [
      { src: "/icones/192", sizes: "192x192", type: "image/png" },
      { src: "/icones/512", sizes: "512x512", type: "image/png" },
      { src: "/icones/mascaravel", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
