/**
 * Textos da interface da missão que dependem do estado (não são conteúdo de missão).
 */
import { comoRacional, formatar } from "@/nucleo/racional/racional";
import type { AcaoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Fase } from "@/nucleo/missoes/tipos";
import type { Pele } from "@/conteudo/peles";

export function descreverAcao(a: AcaoBancada, pele: Pele): string {
  switch (a.tipo) {
    case "lote":
      return `Gire o lote para ${a.valor}.`;
    case "pilha": {
      const t = comoRacional(a.tamanho);
      return t.d === 1 ? `Escolha a pilha de ${pele.peca.plural} inteiras.` : `Escolha a pilha de pedaços de ${formatar(t)}.`;
    }
    case "bica":
      return `Gire o volante da bica ${a.indice + 1}.`;
    case "bicas":
      return a.abertas === 0 ? "Feche todas as bicas." : `Deixe ${a.abertas} ${a.abertas === 1 ? "bica aberta" : "bicas abertas"}.`;
    case "carga":
      return `Ponha ${a.quantidade} na esteira.`;
    case "partes":
      return `No fatiador, escolha cortar em ${a.valor}.`;
    case "fatiar":
      return a.quantidade === "todas" ? "Corte todas as peças da pilha." : "Corte uma peça.";
    case "repartir":
      return `Puxe a alavanca ${pele.repartir}.`;
    case "fechar":
      return "Feche a partilha.";
    case "desfazer":
      return "Desfaça.";
    case "recomecar":
      return "Recomece.";
  }
}

export const NOME_DA_FASE: Record<Fase, string> = {
  problema: "Problema",
  palpite: "Palpite",
  experimentacao: "Experimento",
  descoberta: "Descoberta",
  formalizacao: "Registro",
  aplicacao: "Aplicação",
  retencao: "Retenção",
};
