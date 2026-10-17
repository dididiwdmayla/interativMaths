"use client";

/**
 * A bancada de lapidação da Joia do Ábaco (/relicario/abaco). Sem rodada guardada: a abertura da
 * próxima (o treino decide o foco; o soroban gera os itens) e Começar. Com rodada guardada: volta
 * na mesma operação, no mesmo lance. No fim: a lapidação, quando o estágio sobe, ou "Rodada feita".
 * Joia ainda não encontrada: volta para o Relicário.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { REGISTRO_ABACO } from "@/nucleo/joias/abaco";
import { itensDaRodada, rodadaValida } from "@/nucleo/joias/registro";
import { andamentoDaTecnica, decidirRodada, iniciarRodada, sementeDaRodada, treinoDe, type FimDeRodada } from "@/nucleo/joias/treino";
import { preencher } from "@/nucleo/soroban/textos";
import { definirJoia } from "@/nucleo/progresso";
import type { ItemRodada } from "@/nucleo/soroban/item";
import { JOIAS } from "@/conteudo/joias";
import { FIM_RODADA, PARAMETROS_LAPIDACAO, TEXTOS_BANCADA } from "@/conteudo/lapidacao";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { AberturaRodada } from "./lapidacao/Abertura";
import { FimRodada } from "./lapidacao/FimRodada";
import { RodadaEmCurso } from "./lapidacao/Rodada";

const ABACO = JOIAS.find((j) => j.id === "abaco");

export function Lapidacao() {
  const { pronto, progresso, atualizar, agora } = useProgresso();
  const router = useRouter();
  const [fim, setFim] = useState<FimDeRodada | null>(null);
  const estado = progresso.joias.abaco;
  const encontrada = estado?.encontrada === true;
  useEffect(() => {
    if (pronto && !encontrada) router.replace("/relicario");
  }, [pronto, encontrada, router]);
  if (!pronto || !encontrada || !estado || !ABACO) return <Carregando />;
  const joia = ABACO;
  if (fim) return <FimRodada joia={joia} fim={fim} onOutra={() => setFim(null)} />;

  if (estado.rodada && rodadaValida(REGISTRO_ABACO, estado) && estado.rodada.feitos.length < estado.rodada.itens.length) {
    const r = estado.rodada;
    const foco = r.foco ? joia.tecnicas.find((t) => t.id === r.foco) : null;
    const titulo = r.tipo === "revisao" ? TEXTOS_BANCADA.tituloRevisao : r.tipo === "manutencao" ? TEXTOS_BANCADA.tituloManutencao : (foco?.nome ?? joia.nome);
    return <RodadaEmCurso joia={joia} estado={estado} titulo={titulo} onFim={setFim} />;
  }

  // A abertura da próxima rodada: a mesma decisão e os mesmos itens até o Começar.
  const t = agora();
  const decisao = decidirRodada(joia, estado, PARAMETROS_LAPIDACAO, t);
  const semente = sementeDaRodada(estado, joia);
  const itens = itensDaRodada(REGISTRO_ABACO, { joia, estado, decisao, parametros: PARAMETROS_LAPIDACAO, semente });
  const a = decisao.tipo === "tecnica" && !decisao.nova ? andamentoDaTecnica(decisao.foco, treinoDe(estado, decisao.foco.id), PARAMETROS_LAPIDACAO, t) : null;
  const andamento =
    a && decisao.tipo === "tecnica"
      ? preencher(FIM_RODADA.andamento, { tecnica: decisao.foco.nome, limpos: a.limpos, alvoLimpos: a.limposAlvo, rodadas: a.rodadas, alvoRodadas: a.rodadasAlvo })
      : null;
  return (
    <AberturaRodada
      joia={joia}
      andamento={andamento}
      decisao={decisao}
      itens={itens as readonly ItemRodada[]}
      onComecar={() =>
        atualizar((p, tt) => {
          const j = p.joias.abaco;
          return j ? definirJoia(p, joia.id, iniciarRodada(j, decisao, itens, semente, tt), tt) : p;
        })
      }
    />
  );
}
