/**
 * As falas do Nônio na bancada: do evento do motor para a fala, com os números do momento. Os
 * textos vêm de src/conteudo/lapidacao.ts; o núcleo decide o que aconteceu (lance limpo, fora do
 * lance, resposta que não bateu); aqui só se escolhe o texto e a prioridade na fila.
 */
import type { FalaFaixa, SeloFala } from "@/nucleo/tutor/fila";
import type { ExpressaoTutor } from "@/nucleo/tutor/expressoes";
import { maoBateu, marcaDoItem, modoDoItem, type EstadoItem } from "@/nucleo/soroban/item";
import type { LanceDaOperacao } from "@/nucleo/soroban/operacao";
import { medidasDoLance, preencher, tipoDoLance } from "@/nucleo/soroban/textos";
import { AJUDA_LAPIDACAO, NOMES_POSICAO, RECADOS_LAPIDACAO } from "@/conteudo/lapidacao";

export function chaveDaOperacao(indice: number): string {
  return `operacao:${indice}`;
}

function fala(
  passo: string,
  id: string,
  texto: string,
  o: { categoria: FalaFaixa["categoria"]; prioridade?: FalaFaixa["prioridade"]; expressao?: ExpressaoTutor; selo?: SeloFala },
): FalaFaixa {
  return { id, texto, passo, categoria: o.categoria, prioridade: o.prioridade ?? "importante", expressao: o.expressao ?? "neutro", selo: o.selo };
}

/** A fala calma da operação (fica na janelinha; não vira recado). */
export function falaDaOperacao(passo: string, e: EstadoItem): FalaFaixa {
  const modo = modoDoItem(e.item);
  const texto = modo === "leitura" ? RECADOS_LAPIDACAO.operacaoLer : modo === "maos" ? RECADOS_LAPIDACAO.operacao : RECADOS_LAPIDACAO.operacaoImaginada;
  return fala(passo, "operacao", texto, { categoria: "evento", prioridade: "automatica" });
}

/** Com o Nônio: o caminho antes do gesto, no começo de cada lance. */
export function falaComNonio(passo: string, ld: LanceDaOperacao, indiceLance: number): FalaFaixa {
  const c = RECADOS_LAPIDACAO.comNonio;
  const modelos = {
    mostrar: c.mostrar,
    direto: c.direto,
    diretoTirar: c.diretoTirar,
    cincoPor: c.cincoPor,
    cincoTirar: c.cincoTirar,
    dezPor: c.dezPor,
    dezTirar: c.dezTirar,
    juntosPor: c.juntosPor,
    juntosTirar: c.juntosTirar,
  } as const;
  const texto = preencher(modelos[tipoDoLance(ld)], medidasDoLance(ld, NOMES_POSICAO));
  return fala(passo, `com-nonio:${indiceLance}`, texto, { categoria: "passo", expressao: "atento" });
}

export function falaComNonioLer(passo: string): FalaFaixa {
  return fala(passo, "com-nonio:ler", RECADOS_LAPIDACAO.comNonio.ler, { categoria: "passo", expressao: "atento" });
}

export function falaSemAlgarismos(passo: string): FalaFaixa {
  return fala(passo, "sem-algarismos", RECADOS_LAPIDACAO.semAlgarismos, { categoria: "passo", expressao: "atento" });
}

/** O gesto numa haste que o lance não toca: o aviso fala da haste do lance ("é da haste das unidades"). */
export function falaForaDoLance(passo: string, ld: LanceDaOperacao): FalaFaixa | null {
  if (ld.lance.tipo === "mostrar") return null;
  const m = medidasDoLance(ld, NOMES_POSICAO);
  return fala(passo, `fora:${ld.lance.haste}`, preencher(RECADOS_LAPIDACAO.fora, { haste: m.haste }), { categoria: "retorno", expressao: "duvida" });
}

export function falaLanceFechou(passo: string, indiceLance: number, limpo: boolean): FalaFaixa {
  const texto = limpo ? RECADOS_LAPIDACAO.limpo[indiceLance % RECADOS_LAPIDACAO.limpo.length] : RECADOS_LAPIDACAO.vaiEVolta;
  return fala(passo, `lance:${indiceLance}`, texto, { categoria: "retorno", expressao: limpo ? "satisfeito" : "medindo" });
}

/** O fim da operação: o selo Acertou (ou "ainda não", no imaginado), com o porquê. */
export function falaDoFim(passo: string, e: EstadoItem): FalaFaixa {
  const modo = modoDoItem(e.item);
  const r = RECADOS_LAPIDACAO;
  if (modo === "maos") {
    const marca = marcaDoItem(e);
    const texto = marca === "limpo" ? r.operacaoLimpa : marca === "vai-e-volta" ? r.operacaoVaiEVolta : r.operacaoComAjuda;
    return fala(passo, `fim:${marca}`, texto, { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
  }
  if (modo === "leitura") return fala(passo, "fim:ler", r.lerCerto, { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
  if (e.resposta.certa !== true) return fala(passo, "fim:ainda-nao", r.imaginadoAindaNao, { categoria: "retorno", selo: "ainda-nao", expressao: "medindo" });
  if (modo === "sombra") {
    const texto = maoBateu(e) ? r.sombraBateu : r.sombraOutroCaminho;
    return fala(passo, `fim:sombra:${maoBateu(e)}`, texto, { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
  }
  return fala(passo, "fim:imaginado", r.imaginadoCerto, { categoria: "retorno", selo: "acertou", expressao: "satisfeito" });
}

export function falaLerAindaNao(passo: string, tentativa: number): FalaFaixa {
  return fala(passo, `ler:ainda-nao:${tentativa}`, RECADOS_LAPIDACAO.lerAindaNao, { categoria: "retorno", selo: "ainda-nao", expressao: "medindo" });
}

export function falaJunto(passo: string): FalaFaixa {
  return fala(passo, "junto", RECADOS_LAPIDACAO.junto, { categoria: "retorno", expressao: "atento" });
}

/** O texto do degrau 1 a 3 do Me ajuda, para o lance (ou o item) de agora. */
export function textoDaAjuda(e: EstadoItem, ld: LanceDaOperacao | null, degrau: 1 | 2 | 3): string {
  const a = AJUDA_LAPIDACAO;
  const modo = modoDoItem(e.item);
  if (modo === "leitura") return degrau === 1 ? a.ler.olhar : degrau === 2 ? a.ler.medir : a.ler.caso;
  if (modo !== "maos") return degrau === 1 ? a.imaginado.olhar : degrau === 2 ? a.imaginado.medir : modo === "sombra" ? a.imaginado.caso : a.imaginado.casoCabeca;
  if (!ld) return a.mostrar.olhar;
  const m = medidasDoLance(ld, NOMES_POSICAO);
  const tipo = tipoDoLance(ld);
  const d = Number(m.d);
  switch (tipo) {
    case "mostrar":
      return degrau === 1 ? a.mostrar.olhar : degrau === 2 ? a.mostrar.medir : a.mostrar.caso;
    case "direto":
    case "diretoTirar":
      if (degrau === 1) return tipo === "direto" ? a.direto.olhar : a.direto.olharTirar;
      if (degrau === 2) return preencher(d >= 5 ? a.direto.medir : a.direto.medirPequeno, m);
      return a.direto.caso;
    case "cincoPor":
      return preencher(degrau === 1 ? a.cincoPor.olhar : degrau === 2 ? a.cincoPor.medir : a.cincoPor.caso, m);
    case "cincoTirar":
      return preencher(degrau === 1 ? a.cincoTirar.olhar : degrau === 2 ? a.cincoTirar.medir : a.cincoTirar.caso, m);
    case "dezPor":
      return preencher(degrau === 1 ? a.dezPor.olhar : degrau === 2 ? a.dezPor.medir : a.dezPor.caso, m);
    case "dezTirar":
      return preencher(degrau === 1 ? a.dezTirar.olhar : degrau === 2 ? a.dezTirar.medir : a.dezTirar.caso, m);
    case "juntosPor":
      return preencher(degrau === 1 ? a.juntos.olhar : degrau === 2 ? a.juntos.medir : a.juntos.caso, m);
    case "juntosTirar":
      return preencher(degrau === 1 ? a.juntos.olharTirar : degrau === 2 ? a.juntos.medirTirar : a.juntos.caso, m);
  }
}

/** A ajuda pedida entra na hora: foi o jogador quem pediu, e a janelinha está aberta esperando. */
export function falaDaAjuda(passo: string, texto: string, degrau: number): FalaFaixa {
  return fala(passo, `ajuda:${degrau}`, texto, { categoria: "ajuda", prioridade: "importante", expressao: "medindo" });
}
