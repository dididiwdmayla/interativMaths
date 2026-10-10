/**
 * Cadeia de migrações do progresso. Cada passo leva o documento da versão `de` para `para = de + 1`.
 * Regra: id publicado não muda; se mudar, a migração reescreve as referências aqui.
 */
import { ehObjeto } from "./normalizar";
import { VERSAO_PROGRESSO } from "./tipos";

export type Documento = Record<string, unknown>;

export interface Migracao {
  readonly de: number;
  readonly descricao: string;
  readonly migrar: (doc: Documento) => Documento;
}

/**
 * v0 = documento sem número de versão (protótipo ou dado parcial).
 * Guarda o que dá para aproveitar e marca a versão 1; a normalização completa o resto.
 */
const DE_0_PARA_1: Migracao = {
  de: 0,
  descricao: "documento sem versão vira versão 1",
  migrar: (doc) => {
    const saida: Documento = { ...doc, versao: 1 };
    // Protótipos guardavam as preferências em "prefs".
    if (!("preferencias" in doc) && ehObjeto(doc.prefs)) saida.preferencias = doc.prefs;
    delete saida.prefs;
    return saida;
  },
};

export const MIGRACOES: readonly Migracao[] = [DE_0_PARA_1];

export function versaoDe(doc: Documento): number {
  const v = doc.versao;
  return typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : 0;
}

/**
 * Aplica as migrações em ordem até a versão alvo. Devolve o documento e as versões percorridas.
 * Documento de versão futura volta intacto (quem lê decide o que fazer).
 */
export function migrar(
  doc: Documento,
  migracoes: readonly Migracao[] = MIGRACOES,
  alvo: number = VERSAO_PROGRESSO,
): { doc: Documento; caminho: number[]; futura: boolean } {
  let atual = doc;
  let versao = versaoDe(atual);
  const caminho = [versao];
  if (versao > alvo) return { doc, caminho, futura: true };
  while (versao < alvo) {
    const passo = migracoes.find((m) => m.de === versao);
    if (!passo) throw new Error(`falta migração da versão ${versao}`);
    atual = passo.migrar(atual);
    versao = passo.de + 1;
    atual = { ...atual, versao };
    caminho.push(versao);
  }
  return { doc: atual, caminho, futura: false };
}
