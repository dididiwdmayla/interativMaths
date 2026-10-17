/**
 * A Joia do Ábaco no treino: o soroban se pluga pelo registro. As técnicas do treino são as da
 * joia (dados); o soroban decide as operações e os níveis de apoio de cada item.
 */
import type { EstadoJoia } from "../progresso/tipos";
import { gerarRodada, type PedidoRodada } from "../soroban/gerador";
import { iniciarItem, itemFeito, lerItemRodada, type ItemRodada } from "../soroban/item";
import { jogarItem, type ModoDeJogar } from "../soroban/jogador";
import { ehTecnicaSoroban, ORDEM_TECNICAS_SOROBAN, type TecnicaSoroban } from "../soroban/tecnicas";
import type { Joia } from "./contrato";
import { itensDaRodada, type ContextoRodada, type RegistroJoia } from "./registro";
import { decidirRodada, encerrarRodada, iniciarRodada, registrarItem, sementeDaRodada, treinoDe, type FimDeRodada, type ParametrosLapidacao } from "./treino";

function pedidoDaRodada(c: ContextoRodada): PedidoRodada {
  const { joia, estado, decisao, parametros, semente } = c;
  const soroban = joia.tecnicas.map((t) => t.id).filter(ehTecnicaSoroban);
  const foco = decisao.tipo === "tecnica" && ehTecnicaSoroban(decisao.foco.id) ? decisao.foco.id : null;
  const vistas = soroban.filter((id) => treinoDe(estado, id).apresentadaEm !== null || id === foco);
  const rodadas: Partial<Record<TecnicaSoroban, number>> = {};
  for (const id of soroban) rodadas[id] = treinoDe(estado, id).rodadas.length;
  const estagios = Object.fromEntries(ORDEM_TECNICAS_SOROBAN.map((id) => [id, joia.tecnicas.find((t) => t.id === id)?.estagio ?? 2])) as PedidoRodada["estagios"];
  return {
    semente,
    tipo: decisao.tipo,
    foco,
    faltam: decisao.tipo === "revisao" ? decisao.faltam.map((t) => t.id).filter(ehTecnicaSoroban) : [],
    vistas,
    rodadas,
    estagios,
    operacoes: parametros.operacoesPorRodada,
    intercaladas: parametros.intercaladas,
  };
}

export const REGISTRO_ABACO: RegistroJoia = {
  gerarItens: (c) => gerarRodada(pedidoDaRodada(c)),
  itemValido: (item) => lerItemRodada(item) !== null,
};

/* ---------- Jogar uma rodada inteira, como um jogador (testes e laboratório) ---------- */


/** Como o jogador faz cada item da rodada (o índice do item e o item). */
export type JeitoDeJogar = (indice: number, item: ItemRodada) => ModoDeJogar;

/** Começa uma rodada (como no Começar), sem fazer nenhum item. */
export function comecarRodadaDoAbaco(joia: Joia, estado: EstadoJoia, p: ParametrosLapidacao, agora: number): EstadoJoia {
  const decisao = decidirRodada(joia, estado, p, agora);
  const semente = sementeDaRodada(estado, joia);
  const itens = itensDaRodada(REGISTRO_ABACO, { joia, estado, decisao, parametros: p, semente });
  return iniciarRodada(estado, decisao, itens, semente, agora);
}

/** Faz a rodada inteira: decide, gera, joga cada item e encerra. */
export function jogarRodadaDoAbaco(joia: Joia, estado: EstadoJoia, p: ParametrosLapidacao, agora: number, jeito: JeitoDeJogar = () => ({})): FimDeRodada {
  let e = comecarRodadaDoAbaco(joia, estado, p, agora);
  const itens = (e.rodada?.itens ?? []).map((x) => x as ItemRodada);
  itens.forEach((item, i) => {
    e = registrarItem(e, itemFeito(jogarItem(iniciarItem(item), jeito(i, item))));
  });
  const fim = encerrarRodada(joia, e, p, agora);
  if (!fim) throw new Error("rodada que não encerrou");
  return fim;
}
