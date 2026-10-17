/**
 * Consultas ao catálogo de conteúdo (atividades, equívocos, peles).
 */
import { ATIVIDADES } from "@/conteudo/atividades";
import { EQUIVOCOS } from "@/conteudo/equivocos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import type { Pele } from "@/conteudo/peles";
import { TEXTOS_REACAO } from "@/conteudo/reacoes";
import type { Atividade } from "@/nucleo/missoes/tipos";
import { marcadoresDaPele, textoDoEquivoco as textoEquivocoNucleo, textoDoMotivo as textoMotivoNucleo } from "@/nucleo/tutor/reacoes";

export { TEXTOS_REACAO };

export function atividadePorId(id: string): Atividade | null {
  return ATIVIDADES.find((a) => a.id === id) ?? null;
}

export function slugDe(a: Atividade): string {
  return a.id.slice(a.id.lastIndexOf(".") + 1);
}

export function atividadePorSlug(slug: string, tipos?: readonly Atividade["tipo"][]): Atividade | null {
  return ATIVIDADES.find((a) => slugDe(a) === slug && (!tipos || tipos.includes(a.tipo))) ?? null;
}

export function rotaDe(a: Atividade): string {
  if (a.tipo === "exposicao") return `/museu/${slugDe(a)}`;
  if (a.tipo === "cena") return `/rua/${slugDe(a)}`;
  if (a.tipo === "revisita") return "/partilha/revisita";
  return `/partilha/${slugDe(a)}`;
}

export function conceitoDoEquivoco(id: string): string | null {
  return EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null;
}

export function textoDoEquivoco(id: string, medidas: Readonly<Record<string, string>>, pele: Pele): string {
  return textoEquivocoNucleo(id, { ...marcadoresDaPele(pele), ...medidas }, TEXTOS_REACAO);
}

export function textoDoMotivo(motivo: string, medidas: Readonly<Record<string, string>>, pele: Pele): string {
  return textoMotivoNucleo(motivo, { ...marcadoresDaPele(pele), ...medidas }, TEXTOS_REACAO);
}

export function proximaMissao(a: Atividade): Atividade | null {
  if (a.tipo !== "missao" || a.numero === undefined) return null;
  return MISSOES_ARCO_1.find((m) => m.numero === (a.numero ?? 0) + 1) ?? null;
}

/** A tela de sondagem existe nesta versão? (enquanto não existir, o chamado não aparece) */
export const SONDAGEM_ATIVA = true;

export function existeAtividade(id: string): boolean {
  return ATIVIDADES.some((a) => a.id === id);
}

/** As exposições do Museu ou as cenas da Rua do catálogo, na ordem do catálogo. */
export function atividadesDoLugar(tipo: "exposicao" | "cena"): readonly Atividade[] {
  return ATIVIDADES.filter((a) => a.tipo === tipo);
}

/**
 * A porta do Museu ou da Rua: a primeira exposição (ou cena) ainda não feita; se todas foram,
 * a primeira. Exposição e cena novas entram só como dado (um arquivo e uma linha no catálogo).
 */
export function portaDoLugar(tipo: "exposicao" | "cena", feita: (id: string) => boolean): Atividade | null {
  const todas = atividadesDoLugar(tipo);
  return todas.find((a) => !feita(a.id)) ?? todas[0] ?? null;
}
