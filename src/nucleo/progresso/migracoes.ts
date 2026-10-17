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

/**
 * v0.3: o progresso passa a guardar as apresentações vistas e a preferência da conversa com o
 * Nônio (ligada por padrão). Execuções salvas não mudam aqui: o motor reconhece as de formato
 * antigo e recomeça a missão cujos passos mudaram, sem tocar em conclusões, evidências e Caderno.
 */
const DE_1_PARA_2: Migracao = {
  de: 1,
  descricao: "apresentações vistas e preferência da conversa",
  migrar: (doc) => {
    const prefs = ehObjeto(doc.preferencias) ? doc.preferencias : {};
    return {
      ...doc,
      preferencias: { ...prefs, conversa: prefs.conversa === "desligada" ? "desligada" : "ligada" },
      apresentacoes: ehObjeto(doc.apresentacoes) ? doc.apresentacoes : {},
    };
  },
};

/**
 * v0.4: a preferência de aparência (automático, claro ou escuro), automático por padrão.
 * Nada mais muda: os passos publicados são os mesmos, e as execuções seguem de onde estavam.
 */
const DE_2_PARA_3: Migracao = {
  de: 2,
  descricao: "preferência de aparência",
  migrar: (doc) => {
    const prefs = ehObjeto(doc.preferencias) ? doc.preferencias : {};
    const aparencia = prefs.aparencia === "claro" || prefs.aparencia === "escuro" ? prefs.aparencia : "automatico";
    return { ...doc, preferencias: { ...prefs, aparencia } };
  },
};

/**
 * v0.5: as joias ganham o treino por técnica e a rodada em andamento. Nenhuma joia tinha treino
 * antes (a bancada estava em projeto): cada uma começa com o treino vazio e sem rodada. Os ids da
 * joia e das técnicas que existiam não mudam.
 */
const DE_3_PARA_4: Migracao = {
  de: 3,
  descricao: "treino das joias por técnica e rodada em andamento",
  migrar: (doc) => {
    const joias: Documento = ehObjeto(doc.joias) ? doc.joias : {};
    const saida: Documento = {};
    for (const [id, j] of Object.entries(joias)) {
      if (!ehObjeto(j)) continue;
      saida[id] = { ...j, treino: ehObjeto(j.treino) ? j.treino : {}, rodada: null };
    }
    return { ...doc, joias: saida };
  },
};

export const MIGRACOES: readonly Migracao[] = [DE_0_PARA_1, DE_1_PARA_2, DE_2_PARA_3, DE_3_PARA_4];

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
