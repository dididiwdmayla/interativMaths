/**
 * O que a tira de mensagem da máquina diz depois de cada evento. Frases curtas, fatos da máquina.
 * Nunca "errado": a máquina engasga, a bandeja apara.
 */
import { comoRacional, formatar } from "@/nucleo/racional/racional";
import type { EstadoBancada, Evento } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";

/** normal; atenção (sobra, engasgo: ganha um ponto vermelho); feito (ganha marca-texto). */
export type TomTira = "normal" | "atencao" | "feito";

function nomePeca(pele: Pele, tamanho: string, k: number): string {
  const t = comoRacional(tamanho);
  if (t.n === 1 && t.d === 1) return `${k} ${k === 1 ? pele.peca.singular : pele.peca.plural}`;
  return `${k} ${k === 1 ? pele.pedaco.singular : pele.pedaco.plural} de ${formatar(t)}`;
}

const RECUSAS: Record<Extract<Evento, { tipo: "recusa" }>["motivo"], string> = {
  "sem-pilha": "Escolha uma pilha na esteira.",
  "pilha-vazia": "A esteira está vazia.",
  "sem-bica-aberta": "Nenhuma bica aberta: nada sai.",
  "limite-voltas": "Nesta encomenda, uma volta só. Recomece para tentar outro lote.",
  "sem-fatiador": "Esta máquina não tem fatiador: estas peças não se cortam.",
  "partes-invalidas": "O fatiador não corta nesse número de partes.",
  "pedaco-pequeno-demais": "Pedaço pequeno demais para o fatiador cortar de novo.",
  "carga-travada": "A carga já foi posta. Recomece para mudar.",
  "bicas-travadas": "Nesta máquina as bicas ficam como estão.",
  fechada: "Partilha fechada. Desfaça ou recomece para mexer.",
  "fora-do-limite": "Esse valor não cabe no seletor.",
};

export function mensagemDoEvento(e: EstadoBancada, pele: Pele): { texto: string; tom: TomTira } | null {
  const ev = e.evento;
  if (!ev) return null;
  switch (ev.tipo) {
    case "volta": {
      const aberta = pele.receptor.genero === "f" ? "aberta" : "aberto";
      return { texto: `Volta: ${nomePeca(pele, ev.tamanho, ev.lote)} em cada ${pele.receptor.singular} ${aberta}.`, tom: "normal" };
    }
    case "engasgo":
      return {
        texto: `Engasgou: um lote de ${ev.lote} em ${ev.abertas} bicas pede ${ev.pedido}; há ${ev.ha}.`,
        tom: "atencao",
      };
    case "fatia":
      return {
        texto: `Cortou ${ev.quantidade === 1 ? "uma peça" : `${ev.quantidade} peças`} em ${ev.partes}: ${ev.quantidade * ev.partes} pedaços de ${formatar(comoRacional(ev.novo))}.`,
        tom: "normal",
      };
    case "fechou":
      return { texto: "Partilha fechada.", tom: "feito" };
    case "bica":
      return { texto: `Bica ${ev.indice + 1} ${ev.aberta ? "aberta" : "fechada"}.`, tom: "normal" };
    case "carga":
      return { texto: `Na esteira: ${ev.quantidade}.`, tom: "normal" };
    case "ajuste":
      return null;
    case "recusa":
      return { texto: RECUSAS[ev.motivo], tom: ev.motivo === "fechada" ? "normal" : "atencao" };
  }
}
