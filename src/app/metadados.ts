/**
 * O endereço oficial e os metadados de compartilhamento. O interativMaths é um produto do
 * interativAI, no subdomínio matematica.interativai.com; o interativmaths.vercel.app continua
 * respondendo, mas a URL canônica é sempre a oficial.
 */
import type { Metadata } from "next";

export const ENDERECO_OFICIAL = "https://matematica.interativai.com";

export const NOME = "interativMaths";
export const DESCRICAO = "Uma aventura de matemática: faça o Engenho voltar a funcionar descobrindo por que ele funciona.";

/** Open Graph de uma página (o objeto inteiro: o Next não mescla o de cima com o de baixo). */
export function compartilhamento(caminho: string, titulo: string, descricao: string): Pick<Metadata, "alternates" | "openGraph"> {
  return {
    alternates: { canonical: caminho },
    openGraph: { type: "website", locale: "pt_BR", siteName: NOME, url: caminho, title: titulo, description: descricao },
  };
}
