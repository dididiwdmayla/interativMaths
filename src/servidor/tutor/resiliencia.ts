/**
 * Novas tentativas com orçamento. Em 429, 500, 504 ou 529: até duas novas tentativas no modelo
 * principal, com espera exponencial e variação (cerca de 1 s e 2 s), respeitando o retry-after
 * quando ele cabe no orçamento; depois, se houver modelo reserva, uma tentativa nele. Nada passa
 * do orçamento total (45 s); cada tentativa tem até 15 s.
 */
import { STATUS_DE_NOVA_TENTATIVA, type PedidoModelo, type ResultadoTentativa, type Tentativa } from "./tentativa";

export const ORCAMENTO_MS = 45_000;
export const LIMITE_TENTATIVA_MS = 15_000;
const NOVAS_TENTATIVAS = 2;
/** Menos que isso de orçamento não vale outra tentativa. */
const MINIMO_PARA_TENTAR_MS = 2_000;

export interface Relogio {
  agora(): number;
  esperar(ms: number): Promise<void>;
}

export const RELOGIO_REAL: Relogio = {
  agora: () => Date.now(),
  esperar: (ms) => new Promise((r) => setTimeout(r, ms)),
};

export interface Desfecho {
  readonly resultado: ResultadoTentativa;
  /** O modelo da última tentativa. */
  readonly modelo: string;
  readonly tentativas: number;
}

function repetivel(r: ResultadoTentativa): boolean {
  return !r.ok && r.status !== null && STATUS_DE_NOVA_TENTATIVA.includes(r.status);
}

export async function tentarComResiliencia(
  tentativa: Tentativa,
  pedido: PedidoModelo,
  modelos: { readonly principal: string; readonly reserva: string | null },
  opcoes: { readonly relogio: Relogio; readonly aleatorio: () => number; readonly orcamentoMs?: number },
): Promise<Desfecho> {
  const { relogio, aleatorio } = opcoes;
  const fim = relogio.agora() + (opcoes.orcamentoMs ?? ORCAMENTO_MS);
  const restante = () => fim - relogio.agora();
  let tentativas = 0;
  let modelo = modelos.principal;

  const tentar = async (m: string): Promise<ResultadoTentativa> => {
    tentativas += 1;
    modelo = m;
    return tentativa(m, pedido, Math.min(LIMITE_TENTATIVA_MS, restante()));
  };

  let resultado = await tentar(modelos.principal);
  for (let n = 1; n <= NOVAS_TENTATIVAS && repetivel(resultado); n++) {
    const base = 1000 * 2 ** (n - 1);
    let espera = Math.round(base * (0.75 + 0.5 * aleatorio()));
    if (!resultado.ok && resultado.retryAfterMs !== null) {
      // O servidor pediu um tempo: respeita, se couber; se não couber, não insiste neste modelo.
      if (resultado.retryAfterMs + MINIMO_PARA_TENTAR_MS > restante()) break;
      espera = Math.max(espera, resultado.retryAfterMs);
    }
    if (espera + MINIMO_PARA_TENTAR_MS > restante()) break;
    await relogio.esperar(espera);
    resultado = await tentar(modelos.principal);
  }

  if (repetivel(resultado) && modelos.reserva && restante() >= MINIMO_PARA_TENTAR_MS) {
    resultado = await tentar(modelos.reserva);
  }
  return { resultado, modelo, tentativas };
}
