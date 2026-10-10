/**
 * Ler e gravar o progresso com proteção contra falha. O armazenamento é injetado
 * (localStorage no navegador, memória nos testes).
 */
import { migrar } from "./migracoes";
import { ehObjeto, normalizar } from "./normalizar";
import { progressoNovo, type Progresso } from "./tipos";

export const CHAVE_PROGRESSO = "interativmaths:progresso";
export const CHAVE_RESERVA = "interativmaths:progresso:ilegivel";

export interface Armazenamento {
  ler(chave: string): string | null;
  gravar(chave: string, valor: string): void;
  apagar(chave: string): void;
}

export type AvisoCarga = "ilegivel" | "versao-futura" | "sem-armazenamento" | null;

export interface Carga {
  readonly progresso: Progresso;
  readonly aviso: AvisoCarga;
}

export function carregarProgresso(arm: Armazenamento | null, agora: number): Carga {
  if (!arm) return { progresso: progressoNovo(agora), aviso: "sem-armazenamento" };
  let bruto: string | null;
  try {
    bruto = arm.ler(CHAVE_PROGRESSO);
  } catch {
    return { progresso: progressoNovo(agora), aviso: "sem-armazenamento" };
  }
  if (bruto === null) return { progresso: progressoNovo(agora), aviso: null };
  let doc: unknown;
  try {
    doc = JSON.parse(bruto);
  } catch {
    guardarReserva(arm, bruto);
    return { progresso: progressoNovo(agora), aviso: "ilegivel" };
  }
  if (!ehObjeto(doc)) {
    guardarReserva(arm, bruto);
    return { progresso: progressoNovo(agora), aviso: "ilegivel" };
  }
  try {
    const m = migrar(doc);
    return { progresso: normalizar(m.doc, agora), aviso: m.futura ? "versao-futura" : null };
  } catch {
    guardarReserva(arm, bruto);
    return { progresso: progressoNovo(agora), aviso: "ilegivel" };
  }
}

function guardarReserva(arm: Armazenamento, bruto: string): void {
  try {
    arm.gravar(CHAVE_RESERVA, bruto);
  } catch {
    // sem espaço: segue sem reserva
  }
}

export function salvarProgresso(arm: Armazenamento | null, p: Progresso): boolean {
  if (!arm) return false;
  try {
    arm.gravar(CHAVE_PROGRESSO, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function apagarProgresso(arm: Armazenamento | null): void {
  if (!arm) return;
  try {
    arm.apagar(CHAVE_PROGRESSO);
  } catch {
    // nada a fazer
  }
}

export function armazenamentoEmMemoria(inicial: Record<string, string> = {}): Armazenamento & {
  dados: Record<string, string>;
} {
  const dados: Record<string, string> = { ...inicial };
  return {
    dados,
    ler: (c) => (c in dados ? dados[c] : null),
    gravar: (c, v) => {
      dados[c] = v;
    },
    apagar: (c) => {
      delete dados[c];
    },
  };
}
