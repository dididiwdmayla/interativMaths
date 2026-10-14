/**
 * O recado do Nônio: a fala curta que abre ao lado da bolinha e some sozinha. Puro.
 *
 * O texto é o começo da fala, em frases inteiras: a primeira frase e, se couberem, as seguintes,
 * até 60 caracteres. Fala cuja primeira frase passa disso traz um `recado` próprio nos dados
 * (uma checagem de conteúdo garante que todo recado possível cabe). Só a resposta livre da
 * conversa, que não é dado, pode cair no corte de emergência.
 */
import type { Postura } from "../progresso/tipos";
import type { CategoriaFala, FalaFaixa } from "./fila";

export const LIMITE_RECADO = 60;

/** Quanto o recado fica na tela sem gesto nenhum. Nenhum relógio aparece. */
export const RECADO_SOME_MS = 6000;

/** As frases de um texto: cada uma termina em ponto, interrogação ou reticências. */
export function frasesDe(texto: string): string[] {
  return (texto.trim().match(/[^.?…]+(?:[.?…]+|$)/g) ?? []).map((f) => f.trim()).filter((f) => f.length > 0);
}

/** O recado tirado do texto: frases inteiras até o limite. null se a primeira já não cabe. */
export function recadoDoTexto(texto: string): string | null {
  let saida = "";
  for (const f of frasesDe(texto)) {
    const junto = saida ? `${saida} ${f}` : f;
    if (junto.length > LIMITE_RECADO) break;
    saida = junto;
  }
  return saida.length > 0 ? saida : null;
}

/** O recado de uma fala: o dela, o do texto, ou (resposta livre) o começo cortado nas palavras. */
export function recadoDaFala(f: Pick<FalaFaixa, "texto" | "recado">): string {
  if (f.recado) return f.recado;
  const doTexto = recadoDoTexto(f.texto);
  if (doTexto) return doTexto;
  const corte = f.texto.slice(0, LIMITE_RECADO - 1);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > 20 ? corte.slice(0, espaco) : corte).replace(/[,;:]$/, "")}…`;
}

/** O recado desta fala cabe sem o corte de emergência? (a checagem de conteúdo usa) */
export function recadoCabe(f: Pick<FalaFaixa, "texto" | "recado">): boolean {
  if (f.recado !== undefined) return f.recado.length > 0 && f.recado.length <= LIMITE_RECADO;
  return recadoDoTexto(f.texto) !== null;
}

/**
 * A postura decide o que vira recado: quieto, nada (só o ponto na bolinha); disponível, o
 * retorno, o passo novo, a oferta de ajuda, o lembrete, o convite da sondagem e a resposta que
 * chegou com a janelinha fechada; presente, também a leitura da máquina e os comentários.
 * A ajuda pedida nunca vira recado: ela abre a janelinha, onde cabe inteira.
 */
export function categoriaComRecado(categoria: CategoriaFala, postura: Postura): boolean {
  if (postura === "quieto" || categoria === "ajuda") return false;
  if (categoria === "evento" || categoria === "comentario") return postura === "presente";
  return true;
}

/** Fala que merece o ponto na bolinha quando o jogador não a viu. A leitura da máquina não. */
export function categoriaNotavel(categoria: CategoriaFala): boolean {
  return categoria !== "evento" && categoria !== "comentario";
}
