/**
 * A execução de referência de um passo: o começo do passo alcançado pela primeira solução de teste
 * do modo. O servidor da conversa usa para saber o que o passo esconde e que partes a máquina tem,
 * sem confiar no estado que o cliente manda.
 */
import { bicasAbertas } from "../maquinas/bancada/bancada";
import type { EstadoBancada } from "../maquinas/bancada/tipos";
import { aplicarEntrada, iniciarExecucao, passosDoModo, type ContextoMotor, type Execucao } from "./motor";
import type { AlvoMaquina, Atividade, ModoExecucao } from "./tipos";

export function execucaoDeReferencia(a: Atividade, modo: ModoExecucao, passoId: string, ctx: ContextoMotor): Execucao | null {
  const indice = passosDoModo(a, modo).findIndex((p) => p.id === passoId);
  if (indice < 0) return null;
  if (indice === 0) return iniciarExecucao(a, modo);
  for (const solucao of a.solucoesDeTeste.filter((s) => s.modo === modo)) {
    let e = iniciarExecucao(a, modo);
    for (const entrada of solucao.entradas) {
      if (e.indice >= indice) break;
      e = aplicarEntrada(a, e, entrada, ctx).exec;
    }
    if (e.indice === indice) return e;
  }
  return null;
}

/** As partes da máquina para onde o Nônio pode apontar. */
export function alvosDaMaquina(e: EstadoBancada | null): AlvoMaquina[] {
  if (!e) return [];
  const alvos: AlvoMaquina[] = ["esteira", "pilha", "bicas", "bandeja"];
  if (e.config.fatiador) alvos.push("fatiador");
  for (const i of bicasAbertas(e)) alvos.push(`bica:${i}`);
  return alvos;
}
