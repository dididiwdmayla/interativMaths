/**
 * Consultas do Manual: junta os dados (`conteudo/manual.ts`) ao catálogo e ao progresso.
 */
import { AREAS } from "@/conteudo/areas";
import { ATIVIDADES } from "@/conteudo/atividades";
import { CONCEITOS } from "@/conteudo/conceitos";
import { CONCEITOS_A_LAPIS, PAGINAS_MANUAL, TEXTOS_MANUAL } from "@/conteudo/manual";
import type { Conceito, IdConceito } from "@/nucleo/curriculo/curriculo";
import { areaDoDistrito, linhaFormal, nomeFormal, type NomeFormal } from "@/nucleo/curriculo/formal";
import { missaoQueRestaura, paginasRestauradas, type NomeManual, type PaginaManual } from "@/nucleo/manual/manual";
import type { Atividade, ModoExecucao } from "@/nucleo/missoes/tipos";
import type { Progresso } from "@/nucleo/progresso/tipos";

export function conceitoPorId(id: IdConceito): Conceito | null {
  return CONCEITOS.find((c) => c.id === id) ?? null;
}

export function paginaPorSlug(slug: string): PaginaManual | null {
  return PAGINAS_MANUAL.find((p) => p.slug === slug) ?? null;
}

export function paginaDoConceito(id: IdConceito): PaginaManual | null {
  return PAGINAS_MANUAL.find((p) => p.conceito === id) ?? null;
}

/** A posição da página no Manual (1, 2, 3...). */
export function numeroDaPagina(p: PaginaManual): number {
  return PAGINAS_MANUAL.indexOf(p) + 1;
}

export function tituloDaPagina(p: PaginaManual): string {
  return conceitoPorId(p.conceito)?.formal ?? p.conceito;
}

export function areaDoConceito(id: IdConceito): string {
  const c = conceitoPorId(id);
  return (c && areaDoDistrito(AREAS, c.distrito)?.area) ?? "";
}

export function restauradasDe(progresso: Progresso): Set<IdConceito> {
  return paginasRestauradas(progresso, ATIVIDADES);
}

export function missaoDaPagina(id: IdConceito): Atividade | null {
  return missaoQueRestaura(id, ATIVIDADES);
}

export function preencherManual(modelo: string, valores: Readonly<Record<string, string | number>>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));
}

/** "Restaure na Missão 4". */
export function ondeRestaura(id: IdConceito): string {
  const m = missaoDaPagina(id);
  return m ? preencherManual(TEXTOS_MANUAL.restaureNa, { n: m.numero ?? "" }) : "";
}

/** Os nomes de uma lista de conceitos, sem repetir o termo. */
export function nomesDosConceitos(ids: readonly IdConceito[]): NomeManual[] {
  const saida: NomeManual[] = [];
  for (const id of ids) {
    for (const n of paginaDoConceito(id)?.nomes ?? []) if (!saida.some((x) => x.termo === n.termo)) saida.push(n);
  }
  return saida;
}

export function nomeFormalDe(a: Pick<Atividade, "distrito" | "conceitos" | "conteudoFormal">): NomeFormal {
  return nomeFormal(a, CONCEITOS, AREAS);
}

/** A palavra que abre a linha de cima do cabeçalho. */
export function prefixoDe(a: Atividade, modo: ModoExecucao): string {
  if (modo === "prova") return "Prova direta";
  if (modo === "registro") return "Registro";
  switch (a.tipo) {
    case "missao":
      return `Missão ${a.numero}`;
    case "exposicao":
      return "Museu";
    case "cena":
      return "A Rua";
    case "eco":
      return "Eco";
    case "revisita":
      return "Revisita";
    case "degustacao":
      return "Degustação";
    default:
      return "Sondagem";
  }
}

/** A linha de cima do cabeçalho de uma atividade: "Missão 4 · Aritmética · Frações". */
export function linhaDoCabecalho(a: Atividade, modo: ModoExecucao): { cheia: string; curta: string } {
  // A sondagem mede: o cabeçalho não diz o conteúdo.
  if (a.tipo === "sondagem") return { cheia: "A Partilha · Sondagem", curta: "Sondagem" };
  return linhaFormal(prefixoDe(a, modo), nomeFormalDe(a));
}


export { AREAS, CONCEITOS_A_LAPIS, PAGINAS_MANUAL, TEXTOS_MANUAL };
