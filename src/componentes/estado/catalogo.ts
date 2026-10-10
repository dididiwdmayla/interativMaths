/**
 * Consultas ao catálogo de conteúdo (atividades, equívocos, peles).
 */
import { ATIVIDADES } from "@/conteudo/atividades";
import { EQUIVOCOS, MOTIVOS } from "@/conteudo/equivocos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import type { Pele } from "@/conteudo/peles";
import { preencher } from "@/nucleo/missoes/motor";
import type { Atividade } from "@/nucleo/missoes/tipos";

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
  return `/partilha/${slugDe(a)}`;
}

export function conceitoDoEquivoco(id: string): string | null {
  return EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null;
}

export function textoDoEquivoco(id: string, medidas: Readonly<Record<string, string>>): string {
  const e = EQUIVOCOS.find((x) => x.id === id);
  return e ? preencher(e.resposta, medidas) : "";
}

export function textoDoMotivo(motivo: string, medidas: Readonly<Record<string, string>>, pele: Pele): string {
  const modelo = MOTIVOS[motivo] ?? "";
  return preencher(modelo, { receptor: pele.receptor.singular, receptores: pele.receptor.plural, ...medidas });
}

export function proximaMissao(a: Atividade): Atividade | null {
  if (a.tipo !== "missao" || a.numero === undefined) return null;
  return MISSOES_ARCO_1.find((m) => m.numero === (a.numero ?? 0) + 1) ?? null;
}
