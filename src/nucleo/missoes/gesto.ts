/**
 * O próximo gesto: a próxima ação física que a tela escreve, em caneta, logo abaixo da instrução.
 * Puro e determinístico. Nunca diz um valor que é a resposta do passo (a checagem procura os
 * segredos do passo em todo gesto das soluções de teste). Depois do acerto, vira o resumo verde;
 * depois do "ainda não", diz o que tentar.
 */
import { bicasAbertas, bicasEmUso, contarPecas, maoLivreLigada, pilhaDe, quantidadeDe, quantidadeNaBica } from "../maquinas/bancada/bancada";
import type { EstadoBancada } from "../maquinas/bancada/tipos";
import { aindaFecha } from "../maquinas/bancada/viabilidade";
import { ehZero, igual, inteiro, maiorQue, comoRacional } from "../racional/racional";
import { marcadoresDaPele, preencherFala, resumoDoAcerto, type NomesPele, type TextosReacao } from "../tutor/reacoes";
import type { Execucao } from "./motor";
import type { AlvoMaquina, Passo, PassoAposta, PassoOperar } from "./tipos";

export interface TextosGesto {
  readonly narrativa: string;
  readonly palpite: string;
  /** Palpite de opções (a degustação): tocar numa opção já responde. */
  readonly palpiteOpcoes: string;
  readonly operar: {
    readonly inicioComMao: string;
    readonly inicioAlavanca: string;
    readonly maoUmaEmCada: string;
    readonly maoDevolver: string;
    readonly maisVoltas: string;
    readonly maisVoltasAlavanca: string;
    readonly cortar: string;
    /** Nada repartido ainda, e as inteiras não dão uma para cada (3 broas, 4 mesas). */
    readonly cortarAntes: string;
    readonly cortarPedaco: string;
    readonly repartirPedacos: string;
    readonly fechar: string;
    readonly engasgo: string;
    readonly corteNaoFecha: string;
    readonly abrirBicas: string;
    readonly nenhumaAberta: string;
    readonly teto: string;
    readonly carga: string;
    readonly bicasDaConta: string;
    readonly desafio: string;
    readonly junto: string;
    readonly tentarDesiguais: string;
    readonly tentarSobra: string;
    readonly tentarCorte: string;
    readonly tentarCarga: string;
    readonly tentar: string;
    readonly segundoJeito: string;
  };
  readonly prever: {
    readonly numero: string;
    readonly fracao: string;
    readonly opcoes: string;
    readonly deNovoNumero: string;
    readonly deNovoFracao: string;
    readonly deNovoOpcoes: string;
    readonly conferindo: string;
  };
  readonly aposta: { readonly tirarProva: string; readonly responder: string; readonly deNovo: string; readonly feito: string };
  readonly frase: { readonly lacuna: string; readonly conferir: string; readonly trocar: string };
  readonly notacao: string;
  readonly registro: string;
  readonly vencido: string;
  readonly resumos: {
    readonly prever: string;
    readonly naoSei: string;
    readonly conferiu: string;
    readonly apostaPerdida: string;
    readonly apostaGanha: string;
    readonly frase: string;
  };
}

/** gesto: a próxima ação (caneta, com a mão); resumo: o que ficou certo (verde); tentar: depois do ainda não. */
export type TomGesto = "gesto" | "resumo" | "tentar";

export interface Gesto {
  readonly texto: string;
  readonly tom: TomGesto;
  readonly alvo?: AlvoMaquina;
}

export interface ContextoGesto {
  readonly textos: TextosGesto;
  /** Os modelos de acerto (o resumo verde vem deles). */
  readonly reacoes: TextosReacao;
  readonly pele: NomesPele | null;
}

function g(texto: string, tom: TomGesto = "gesto", alvo?: AlvoMaquina): Gesto {
  return alvo ? { texto, tom, alvo } : { texto, tom };
}

/** O próximo gesto do passo, no estado atual da execução. */
export function proximoGesto(passo: Passo, e: Execucao, ctx: ContextoGesto): Gesto {
  const { textos, pele } = ctx;
  const m = pele ? marcadoresDaPele(pele) : {};
  const ep = e.passo;
  switch (passo.tipo) {
    case "narrativa":
      return g(preencherFala(textos.narrativa, { botao: passo.botao ?? "Continuar" }));
    case "palpite":
      return g(passo.resposta.tipo === "opcoes" ? textos.palpiteOpcoes : textos.palpite);
    case "notacao":
      return g(textos.notacao);
    case "registro":
      return g(textos.registro);
    case "frase": {
      if (ep.situacao === "vencido") return g(textos.resumos.frase, "resumo");
      if (ep.retorno === "ainda-nao") return g(textos.frase.trocar, "tentar");
      const completas = passo.lacunas.every((l) => ep.lacunas[l.id] !== undefined);
      return g(completas ? textos.frase.conferir : textos.frase.lacuna);
    }
    case "prever": {
      if (ep.situacao === "conferindo") {
        if (ep.retorno === "acertou") return g(textos.resumos.prever, "resumo");
        return g(ep.resposta === null ? textos.resumos.naoSei : textos.resumos.conferiu, ep.resposta === null ? "gesto" : "tentar");
      }
      const t = passo.resposta.tipo;
      if (ep.retorno === "ainda-nao") return g(t === "numero" ? textos.prever.deNovoNumero : t === "fracao" ? textos.prever.deNovoFracao : textos.prever.deNovoOpcoes, "tentar");
      return g(t === "numero" ? textos.prever.numero : t === "fracao" ? textos.prever.fracao : textos.prever.opcoes);
    }
    case "aposta":
      return gestoAposta(passo, e, textos);
    case "operar":
      return gestoOperar(passo, e, ctx, m);
  }
}

function gestoAposta(passo: PassoAposta, e: Execucao, textos: TextosGesto): Gesto {
  const ep = e.passo;
  if (ep.situacao === "vencido") {
    if (ep.retorno === "acertou") return g(passo.nonioTemRazao ? textos.resumos.apostaGanha : textos.resumos.apostaPerdida, "resumo");
    return g(textos.aposta.feito);
  }
  if (ep.retorno === "ainda-nao") return g(textos.aposta.deNovo, "tentar");
  if (ep.cumprido) return g(textos.aposta.responder);
  return g(passo.gesto ?? textos.aposta.tirarProva);
}

function gestoOperar(passo: PassoOperar, e: Execucao, ctx: ContextoGesto, m: Record<string, string>): Gesto {
  const { textos } = ctx;
  const t = textos.operar;
  const ep = e.passo;
  const b = e.bancada?.atual ?? null;
  if (ep.situacao === "vencido") {
    if (b && ctx.pele) {
      const validador = ep.convite === "feito" && passo.convite ? passo.convite.objetivo.validador : passo.objetivo.validador;
      return g(resumoDoAcerto(validador, b, ctx.pele, ctx.reacoes), "resumo");
    }
    return g(textos.vencido);
  }
  if (!b) return g(t.tentar);
  if (ep.junto !== null) return g(t.junto);
  const mao = maoLivreLigada(b.config);
  const valores = { ...m };

  // Depois do "ainda não": o que tentar, pelo motivo (nunca o valor que fecha).
  if (ep.retorno === "ainda-nao" && ep.ultimo) {
    switch (ep.ultimo.motivo) {
      case "desiguais":
      case "mesma-contagem-quantidades-diferentes":
        return g(t.tentarDesiguais, "tentar", "bicas");
      case "sobra-da-mais-uma-volta":
      case "sobra-diferente":
        return g(t.tentarSobra, "tentar", "esteira");
      case "sobra-pode-ser-cortada":
        return g(t.tentarCorte, "tentar", "fatiador");
      case "sobra-nao-fecha":
        return g(t.corteNaoFecha, "tentar", "fatiador");
      case "carga-diferente":
      case "passou-do-teto":
        return g(t.tentarCarga, "tentar", "bicas");
      case "ficou-carga":
        return g(t.teto, "tentar", "bicas");
      case "solucao-repetida":
        return g(t.segundoJeito, "tentar", "fatiador");
      default:
        return g(t.tentar, "tentar");
    }
  }
  if (ep.retorno === "acertou" && ep.ultimo?.parcial) return g(t.segundoJeito);

  const ev = b.evento;
  if (ev?.tipo === "engasgo") return g(preencherFala(t.engasgo, { pedido: String(ev.pedido), ha: String(ev.ha) }), "gesto", "pilha");
  if (b.config.fatiador && !ehZero(quantidadeDe(b.esteira)) && aindaFecha(b) === false) return g(t.corteNaoFecha, "gesto", "fatiador");

  if (ep.situacao === "convite") return g(t.desafio);

  // Caminho de volta: a carga e as bicas vêm da conta.
  if (b.config.carga && !b.cargaTravada) return g(t.carga, "gesto", "esteira");
  if (passo.objetivo.validador === "maquina.mostra-divisao" && b.config.bicas.ajustavel && bicasEmUso(b).length === 0) return g(t.bicasDaConta, "gesto", "bicas");

  // O passo da mão: uma (ou n) inteira em cada bica.
  if (passo.automatico && passo.objetivo.validador === "partilha.inteiras-por-bica") {
    const n = Number(passo.objetivo.params?.n ?? 1);
    const passou = bicasAbertas(b).find((i) => contarPecas(b.bicas[i].pecas) > n);
    if (passou !== undefined) return g(preencherFala(t.maoDevolver, { ...valores, bica: String(passou + 1) }), "gesto", `bica:${passou}`);
    return g(preencherFala(t.maoUmaEmCada, valores), "gesto", "esteira");
  }

  const abertas = bicasAbertas(b);
  if (abertas.length === 0) return g(b.config.bicas.ajustavel ? t.nenhumaAberta : t.tentar, "gesto", "bicas");

  // Transporte: o teto encheu e ainda há carga.
  if (b.config.teto !== undefined && !ehZero(quantidadeDe(b.esteira))) {
    const teto = inteiro(b.config.teto);
    const cheias = abertas.every((i) => !maiorQue(teto, quantidadeNaBica(b.bicas[i])));
    if (cheias) return g(t.teto, "gesto", "bicas");
  }
  if (passo.objetivo.validador === "partilha.carga-exata" && b.config.bicas.ajustavel && b.voltas === 0 && bicasEmUso(b).every((i) => b.bicas[i].pecas.length === 0)) {
    return g(t.abrirBicas, "gesto", "bicas");
  }

  if (b.esteira.length === 0) return g(t.fechar);
  const B = abertas.length;
  const daVolta = b.esteira.some((p) => p.quantidade >= B);
  const vazias = abertas.every((i) => b.bicas[i].pecas.length === 0);
  if (daVolta) {
    const pilha = pilhaDe(b.esteira, b.pilha) ?? b.esteira[0];
    const inteira = igual(pilha.tamanho, comoRacional(1));
    if (vazias) return g(preencherFala(mao && inteira ? t.inicioComMao : mao ? t.repartirPedacos : t.inicioAlavanca, valores));
    if (!inteira) return g(preencherFala(mao ? t.repartirPedacos : t.maisVoltasAlavanca, valores));
    return g(preencherFala(mao ? t.maisVoltas : t.maisVoltasAlavanca, valores));
  }
  // Sobrou menos que uma volta: corta (se há fatiador) ou fecha.
  if (b.config.fatiador) {
    const inteira = b.esteira.some((p) => igual(p.tamanho, comoRacional(1)));
    return g(preencherFala(inteira ? (vazias ? t.cortarAntes : t.cortar) : t.cortarPedaco, valores), "gesto", "fatiador");
  }
  return g(t.fechar);
}

/** O passo pede gesto na máquina (operar, aposta)? Para o lembrete de 25 s. */
export function passoDeMaquina(p: Passo): boolean {
  return p.tipo === "operar" || p.tipo === "aposta";
}

export type { EstadoBancada };
