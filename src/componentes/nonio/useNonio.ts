"use client";

/**
 * O Nônio flutuante na tela: decide quando a fala atual vira recado, quando a bolinha ganha o
 * ponto de fala nova e o que ele disse antes neste passo. Quem escolhe a fala é a fila e o motor;
 * aqui só se guarda o que o jogador já viu.
 *
 * - Fala nova com a janelinha fechada: vira recado, se a postura aceita a categoria.
 * - O recado some no primeiro gesto (visto) ou depois de 6 s (não visto: fica o ponto).
 * - Abrir a janelinha conta como ver tudo o que está nela.
 */
import { useCallback, useEffect, useState } from "react";
import type { Postura } from "@/nucleo/progresso/tipos";
import type { FalaFaixa } from "@/nucleo/tutor/fila";
import { categoriaComRecado, categoriaNotavel, RECADO_SOME_MS } from "@/nucleo/tutor/recado";

interface EstadoNonio {
  readonly chave: string;
  readonly passo: string;
  readonly recado: boolean;
  /** Falas vistas (chaves), as mais recentes. */
  readonly vistas: readonly string[];
  readonly ultima: FalaFaixa | null;
  /** O que o Nônio disse antes, neste passo (sem a leitura da máquina, que mora no rascunho). */
  readonly antes: readonly FalaFaixa[];
}

const TETO_VISTAS = 40;
const TETO_ANTES = 3;

function chaveDe(f: FalaFaixa): string {
  return `${f.passo}|${f.id}|${f.texto}`;
}

function ver(vistas: readonly string[], chave: string): readonly string[] {
  return vistas.includes(chave) ? vistas : [...vistas, chave].slice(-TETO_VISTAS);
}

interface Entrada {
  /** null enquanto a tela carrega. */
  readonly fala: FalaFaixa | null;
  readonly postura: Postura;
  readonly janelaAberta: boolean;
  /** A sondagem é quieta: nem recado nem ponto. */
  readonly quieta: boolean;
}

/** O estado seguinte; o mesmo objeto quando nada muda (para não renderizar em laço). */
function derivar(e: EstadoNonio | null, x: Entrada & { readonly fala: FalaFaixa }): EstadoNonio {
  const chave = chaveDe(x.fala);
  if (!e || e.chave !== chave) {
    const mesmoPasso = e !== null && e.passo === x.fala.passo;
    const anterior = e?.ultima ?? null;
    const guarda = mesmoPasso && anterior !== null && categoriaNotavel(anterior.categoria);
    const antes = mesmoPasso ? (guarda ? [...(e?.antes ?? []), anterior].slice(-TETO_ANTES) : (e?.antes ?? [])) : [];
    const recado = !x.janelaAberta && !x.quieta && categoriaComRecado(x.fala.categoria, x.postura);
    const vistas = x.janelaAberta || x.quieta ? ver(e?.vistas ?? [], chave) : (e?.vistas ?? []);
    return { chave, passo: x.fala.passo, recado, vistas, ultima: x.fala, antes };
  }
  if (x.janelaAberta && (e.recado || !e.vistas.includes(chave))) return { ...e, recado: false, vistas: ver(e.vistas, chave) };
  return e;
}

export interface NonioNaTela {
  /** O recado está aberto ao lado da bolinha. */
  readonly recado: boolean;
  /** A bolinha mostra o ponto: há fala que o jogador não viu. */
  readonly novidade: boolean;
  /** Até três falas anteriores deste passo, da mais antiga para a mais nova. */
  readonly antes: readonly FalaFaixa[];
  /** Um gesto do jogador: o recado some (e conta como visto). */
  readonly gesto: () => void;
}

export function useNonio(x: Entrada): NonioNaTela {
  const [salvo, setSalvo] = useState<EstadoNonio | null>(null);
  const e = x.fala ? derivar(salvo, { ...x, fala: x.fala }) : salvo;
  if (e !== salvo) setSalvo(e);

  // O recado some sozinho: sem relógio na tela, e sem contar como visto.
  const recado = e?.recado ?? false;
  const chaveAtual = e?.chave ?? null;
  useEffect(() => {
    if (!recado) return;
    const t = setTimeout(() => setSalvo((s) => (s && s.chave === chaveAtual ? { ...s, recado: false } : s)), RECADO_SOME_MS);
    return () => clearTimeout(t);
  }, [recado, chaveAtual]);

  const gesto = useCallback(() => setSalvo((s) => (s && s.recado ? { ...s, recado: false, vistas: ver(s.vistas, s.chave) } : s)), []);

  if (!e || !x.fala) return { recado: false, novidade: false, antes: [], gesto };
  const novidade = !x.quieta && !x.janelaAberta && !e.recado && categoriaNotavel(x.fala.categoria) && !e.vistas.includes(e.chave);
  return { recado: e.recado, novidade, antes: e.antes, gesto };
}
