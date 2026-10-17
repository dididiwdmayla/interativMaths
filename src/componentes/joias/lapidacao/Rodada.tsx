"use client";

/**
 * A rodada em curso (referências 3, 4, 5, 7 e 8 de v05.html): uma operação por vez, um algarismo
 * por vez. O item vive no progresso a cada gesto (fechar o navegador no meio volta no mesmo
 * lance, com o mesmo soroban). Quem decide é o núcleo (o lance fecha sozinho, limpo ou com vai e
 * volta); a tela desenha o estado, e o Nônio fala o que o núcleo decidiu.
 */
import { useEffect, useRef, useState } from "react";
import type { Joia } from "@/nucleo/joias/contrato";
import { encerrarRodada, guardarAberto, registrarItem, type FimDeRodada } from "@/nucleo/joias/treino";
import { definirJoia, marcarApresentacao, type EstadoJoia, type ItemFeito, type RodadaSalva } from "@/nucleo/progresso";
import {
  aplicarEntradaItem,
  iniciarItem,
  itemFeito,
  lanceAtual,
  lancesDoItem,
  modoDoItem,
  restaurarItem,
  type EntradaItem,
  type EstadoItem,
  type ItemRodada,
} from "@/nucleo/soroban/item";
import { lancesDaOperacao, resultadoDe, resumoDaOperacao } from "@/nucleo/soroban/operacao";
import { aplicarMovimento, mostrar, type Soroban as EstadoSoroban } from "@/nucleo/soroban/soroban";
import { caminhoQueFalta, casoParecido, contaDoItem, exemploDaOperacao, gestoDoItem, movimentosPorHaste, paresDoLance, rascunhoDoItem } from "@/nucleo/soroban/textos";
import { marcasDeTecnica } from "@/nucleo/soroban/plano";
import { falaDoPasso } from "@/nucleo/tutor/fila";
import { recadoDaFala } from "@/nucleo/tutor/recado";
import { CONTA_SOROBAN, GESTOS_SOROBAN, NOMES_POSICAO, PARAMETROS_LAPIDACAO, RASCUNHO_SOROBAN, RECADOS_LAPIDACAO, TEXTOS_BANCADA, AJUDA_LAPIDACAO } from "@/conteudo/lapidacao";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Palco } from "@/componentes/maquinas/Palco";
import { BolhaNonio } from "@/componentes/nonio/BolhaNonio";
import { RecadoNonio } from "@/componentes/nonio/RecadoNonio";
import { JanelaNonio } from "@/componentes/nonio/JanelaNonio";
import { useNonio } from "@/componentes/nonio/useNonio";
import { useFilaNonio } from "@/componentes/nonio/useFila";
import { Apresentacao } from "@/componentes/nonio/Apresentacao";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";
import { IconeLapis } from "@/componentes/icones/IconeLapis";
import { IconeRecomecar } from "@/componentes/icones/IconeRecomecar";
import { Soroban } from "@/componentes/soroban/Soroban";
import { SorobanPequeno } from "@/componentes/soroban/SorobanPequeno";
import { Pares } from "@/componentes/soroban/Pares";
import { ContaSoroban } from "@/componentes/soroban/ContaSoroban";
import { Teclado } from "@/componentes/soroban/Teclado";
import { FaixaOperacao } from "./Faixa";
import { BotaoOperacoes } from "./Operacoes";
import {
  chaveDaOperacao,
  falaComNonio,
  falaComNonioLer,
  falaDaAjuda,
  falaDaOperacao,
  falaDoFim,
  falaForaDoLance,
  falaJunto,
  falaLanceFechou,
  falaLerAindaNao,
  falaSemAlgarismos,
  textoDaAjuda,
} from "./falas";

/** O caminho curto passando no soroban: um quadro a cada 500 ms. */
const QUADRO_MS = 500;

/** Os quadros do caminho curto dos lances dados, do começo de cada um até o alvo. */
function quadrosDosLances(lances: ReturnType<typeof lancesDaOperacao>): EstadoSoroban[] {
  const quadros: EstadoSoroban[] = [];
  for (const l of lances) {
    let s = l.inicio;
    quadros.push(s);
    for (const m of l.plano.movimentos) {
      s = aplicarMovimento(s, m);
      quadros.push(s);
    }
  }
  return quadros;
}

function IconeOsPares() {
  return (
    <svg width="24" height="14" viewBox="0 0 24 14" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <polygon points="1,7 4,2 9,2 12,7 9,12 4,12" fill="currentColor" />
      <polygon points="12,7 15,2 20,2 23,7 20,12 15,12" fill="none" />
    </svg>
  );
}

export function RodadaEmCurso({ joia, estado, titulo, onFim }: { joia: Joia; estado: EstadoJoia; titulo: string; onFim: (f: FimDeRodada) => void }) {
  const rodada = estado.rodada as RodadaSalva;
  const indice = rodada.feitos.length;
  const item = rodada.itens[indice] as ItemRodada;
  return <OperacaoDaRodada key={`${rodada.iniciadaEm}:${indice}`} joia={joia} rodada={rodada} indice={indice} item={item} titulo={titulo} onFim={onFim} />;
}

function OperacaoDaRodada({
  joia,
  rodada,
  indice,
  item,
  titulo,
  onFim,
}: {
  joia: Joia;
  rodada: RodadaSalva;
  indice: number;
  item: ItemRodada;
  titulo: string;
  onFim: (f: FimDeRodada) => void;
}) {
  const { progresso, atualizar } = useProgresso();
  const postura = progresso.preferencias.postura;
  const [e, setE] = useState<EstadoItem>(() => restaurarItem(rodada.aberto, item) ?? iniciarItem(item));
  const [paresAbertos, setParesAbertos] = useState(false);
  const [janelaAberta, setJanelaAberta] = useState(false);
  const [casoAberto, setCasoAberto] = useState(false);
  const [replay, setReplay] = useState<{ quadros: EstadoSoroban[]; i: number } | null>(null);
  const [digitado, setDigitado] = useState("");
  const [aindaNao, setAindaNao] = useState(false);
  const { fila, oferecerFala } = useFilaNonio(postura);
  const passo = chaveDaOperacao(indice);
  const modo = modoDoItem(item);
  const falaAtual = falaDoPasso(fila, passo) ?? falaDaOperacao(passo, e);
  const nonio = useNonio({ fala: falaAtual, postura, janelaAberta, quieta: false });
  const atual = lanceAtual(e);
  const lances = lancesDoItem(e);

  // Ao abrir a operação: com o Nônio, o caminho do primeiro lance; o primeiro nível sem algarismos avisa.
  const abriu = useRef(false);
  useEffect(() => {
    if (abriu.current) return;
    abriu.current = true;
    const anterior = indice > 0 ? (rodada.itens[indice - 1] as ItemRodada) : null;
    if (item.nivel === "sem-algarismos" && anterior?.nivel !== "sem-algarismos") oferecerFala(falaSemAlgarismos(passo));
    else if (item.nivel === "com-nonio" && !e.terminado) {
      const a = lanceAtual(e);
      if (a) oferecerFala(falaComNonio(passo, a.lance, a.indice));
      else if (modo === "leitura") oferecerFala(falaComNonioLer(passo));
    }
  }, [e, indice, item.nivel, modo, oferecerFala, passo, rodada.itens]);

  // O caminho curto passando: um quadro a cada 500 ms, e depois o soroban volta ao estado real.
  useEffect(() => {
    if (!replay) return;
    const fim = replay.i >= replay.quadros.length - 1;
    const t = setTimeout(() => setReplay(fim ? null : { ...replay, i: replay.i + 1 }), fim ? QUADRO_MS * 2 : QUADRO_MS);
    return () => clearTimeout(t);
  }, [replay]);

  const salvar = (novo: EstadoItem) => atualizar((p, t) => (p.joias.abaco ? definirJoia(p, joia.id, guardarAberto(p.joias.abaco, novo), t) : p));

  const enviar = (ent: EntradaItem) => {
    if (replay) return;
    nonio.gesto();
    const r = aplicarEntradaItem(e, ent);
    if (r.estado === e) return;
    setE(r.estado);
    salvar(r.estado);
    for (const ev of r.eventos) {
      if (ev.tipo === "fora" && atual) {
        const f = falaForaDoLance(passo, atual.lance);
        if (f) oferecerFala(f);
      } else if (ev.tipo === "lance-fechou") {
        oferecerFala(falaLanceFechou(passo, ev.indice, ev.limpo));
        setParesAbertos(false);
      } else if (ev.tipo === "resposta" && !ev.certa && modo === "leitura") {
        oferecerFala(falaLerAindaNao(passo, r.estado.resposta.tentativas));
        setAindaNao(true);
      } else if (ev.tipo === "terminou") {
        oferecerFala(falaDoFim(passo, r.estado));
        // A nota da primeira sombra aparece uma vez só.
        if (modo === "sombra" && !("sombra" in progresso.apresentacoes)) atualizar((p, t) => marcarApresentacao(p, "sombra", t));
        setJanelaAberta(false);
        setCasoAberto(false);
        // No imaginado, o soroban mostra o caminho curto depois de conferir (de cabeça, sempre; na sombra, quando não bateu).
        const op = r.estado.item.operacao;
        if ((modo === "cabeca" || (modo === "sombra" && r.estado.resposta.certa !== true)) && (op.tipo === "somar" || op.tipo === "subtrair")) {
          setReplay({ quadros: quadrosDosLances(lancesDaOperacao(op, r.estado.hastes)), i: 0 });
        }
      }
    }
    // Com o Nônio: o caminho do lance seguinte, depois do retorno deste.
    if (item.nivel === "com-nonio" && !r.estado.terminado) {
      const prox = lanceAtual(r.estado);
      if (prox && prox.indice !== atual?.indice) oferecerFala({ ...falaComNonio(passo, prox.lance, prox.indice), prioridade: "pedida" });
    }
  };

  const nivelAjuda = e.aberto.ajuda;
  const pedirAjuda = () => {
    if (nivelAjuda >= 4 || e.terminado) return;
    const degrau = (nivelAjuda + 1) as 1 | 2 | 3 | 4;
    enviar({ tipo: "ajuda" });
    if (degrau <= 3) {
      setJanelaAberta(true);
      oferecerFala(falaDaAjuda(passo, textoDaAjuda(e, atual?.lance ?? null, degrau as 1 | 2 | 3), degrau));
      if (degrau === 2 && (modo === "maos" || modo === "sombra")) setParesAbertos(true);
      if (degrau === 3 && modo === "maos") setCasoAberto(true);
    } else {
      setJanelaAberta(false);
      setCasoAberto(false);
      oferecerFala(falaJunto(passo));
      if (modo === "cabeca" || modo === "ditado") {
        const op = e.item.operacao;
        if (op.tipo === "somar" || op.tipo === "subtrair") setReplay({ quadros: quadrosDosLances(lancesDaOperacao(op, e.hastes)), i: 0 });
      }
    }
  };

  const proxima = () => {
    const feito: ItemFeito = itemFeito(e);
    const ultimo = indice + 1 >= rodada.itens.length;
    const caixa: { fim: FimDeRodada | null } = { fim: null };
    atualizar((p, t) => {
      const j = p.joias.abaco;
      if (!j) return p;
      const depois = registrarItem(j, feito);
      if (!ultimo) return definirJoia(p, joia.id, depois, t);
      caixa.fim = encerrarRodada(joia, depois, PARAMETROS_LAPIDACAO, t);
      return definirJoia(p, joia.id, caixa.fim?.estado ?? depois, t);
    });
    if (caixa.fim) onFim(caixa.fim);
  };

  /* ---------- O que se desenha ---------- */

  const terminado = e.terminado;
  const sorobanNaTela = replay ? replay.quadros[replay.i] : e.soroban;
  const ld = atual?.lance ?? null;
  const caminho = nivelAjuda >= 4 && atual && !replay ? caminhoQueFalta(e) : null;
  const ultimoDigito = [...lances].reverse().find((l) => l.lance.tipo !== "mostrar") ?? null;
  const vistos = e.fechados.flatMap((f, i) => {
    const l = lances[i]?.lance;
    return f.limpo && l && l.tipo !== "mostrar" ? [l.haste] : [];
  });
  const comAlgarismos = (modo === "maos" && (item.nivel === "com-nonio" || item.nivel === "sozinho")) || (modo === "leitura" && nivelAjuda >= 4);
  const daVez = !terminado && !replay && ld && ld.lance.tipo !== "mostrar" && (item.nivel === "com-nonio" || item.nivel === "sozinho") ? ld.lance.haste : null;
  const acerto = terminado && modo === "maos" && ultimoDigito && ultimoDigito.lance.tipo !== "mostrar" ? ultimoDigito.lance.haste : null;
  const escondidas = (modo === "sombra" && !e.verContas && !terminado && !replay) || false;
  const interativo = (modo === "maos" || modo === "sombra") && !terminado && !replay;
  const certo = terminado && e.resposta.certa !== false;
  const retorno = terminado ? (certo ? "acertou" : "ainda-nao") : aindaNao ? "ainda-nao" : "neutro";
  const seloVisivel = falaAtual.selo === "ainda-nao" && !aindaNao && !terminado ? null : (falaAtual.selo ?? null);

  // O retorno de cada lance, para os testes: aberto, limpo, vai-e-volta, com-ajuda.
  const ultimoFechado = e.fechados[e.fechados.length - 1];
  const ultimoLance = lances[e.fechados.length - 1];
  const dataLance =
    e.aberto.movimentos.length > 0 || !ultimoFechado ? "aberto" : ultimoFechado.ajuda >= 2 || ultimoFechado.pares ? "com-ajuda" : ultimoFechado.limpo ? "limpo" : "vai-e-volta";
  const dataTecnicas = ultimoLance ? marcasDeTecnica(ultimoLance.plano.marcas).join(" ") : "";
  const temVaiEVolta = e.fechados.some((f) => !f.limpo);

  // A linha do gesto: o que fazer agora; depois do acerto, o resumo em verde.
  const resumoFim =
    modo === "maos"
      ? e.fechados.some((f) => f.ajuda >= 2 || f.pares)
        ? RECADOS_LAPIDACAO.operacaoComAjuda
        : temVaiEVolta
          ? GESTOS_SOROBAN.vaiEVolta
          : GESTOS_SOROBAN.limpo
      : modo === "leitura"
        ? GESTOS_SOROBAN.leuCerto
        : certo
          ? GESTOS_SOROBAN.imaginadoCerto
          : GESTOS_SOROBAN.aindaNao;
  const gesto = terminado ? resumoFim : gestoDoItem(e, GESTOS_SOROBAN, NOMES_POSICAO, caminho);
  const tomGesto = terminado ? (certo ? "acertou" : "ainda-nao") : "gesto";

  const conta = terminado ? <ContaSoroban conta={contaDoItem(e, NOMES_POSICAO, CONTA_SOROBAN.nomes)} /> : null;
  const rascunho = rascunhoDoItem(e, NOMES_POSICAO, RASCUNHO_SOROBAN);

  const abrirCaminhoCurto = () => {
    setJanelaAberta(false);
    const comVolta = lances.filter((_, i) => e.fechados[i] && !e.fechados[i].limpo);
    if (comVolta.length > 0) setReplay({ quadros: [...quadrosDosLances(comVolta), e.soroban], i: 0 });
  };

  /* ---------- A máquina ---------- */

  const caso = ld ? casoParecido(ld) : null;
  const exemplo = caso ? exemploDaOperacao(caso) : null;
  // De cabeça e no ditado, o soroban só aparece depois (o caminho curto, o resultado) ou no degrau 3.
  const opItem = e.item.operacao;
  const primeiroNumero = opItem.tipo === "somar" || opItem.tipo === "subtrair" ? opItem.a : 0;
  const sorobanAlvo =
    modo === "cabeca" || modo === "ditado"
      ? replay
        ? sorobanNaTela
        : terminado
          ? mostrar(e.hastes, resultadoDe(opItem))
          : nivelAjuda >= 3
            ? mostrar(e.hastes, primeiroNumero)
            : null
      : sorobanNaTela;

  const maquina = (
    <div className="lapidacao-maquina">
      <div className="lapidacao-soroban">
        {sorobanAlvo ? (
          <Soroban
            estado={sorobanAlvo}
            onGesto={interativo ? (g) => enviar({ tipo: "gesto", gesto: g }) : undefined}
            algarismos={comAlgarismos || ((modo === "cabeca" || modo === "ditado") && terminado)}
            contas={escondidas ? "escondidas" : "visiveis"}
            marcas={{ daVez, acerto, vistos: modo === "maos" ? vistos : [], caminho }}
          />
        ) : (
          <div className="a-lapis h-full" aria-hidden="true">
            <Soroban estado={mostrar(e.hastes, 0)} contas="escondidas" algarismos={false} rotulos={false} />
          </div>
        )}
      </div>
      {modo === "sombra" && !terminado && !e.verContas && !("sombra" in progresso.apresentacoes) && (
        <p className="letra-mao nota-sombra m-0" data-nota-sombra="">
          {TEXTOS_BANCADA.notaSombra}
        </p>
      )}
      <div className="lapidacao-canto" aria-hidden="true" />
    </div>
  );

  /* ---------- O painel ---------- */

  const pares = ld ? paresDoLance(ld) : { cinco: null, dez: null };
  let controles: React.ReactNode;
  if (terminado) {
    controles = (
      <div className="flex flex-col gap-3">
        {conta}
        <button type="button" className="botao-principal w-full" onClick={proxima} disabled={replay !== null} data-acao="proxima">
          {indice + 1 >= rodada.itens.length ? TEXTOS_BANCADA.terminar : TEXTOS_BANCADA.proxima}
        </button>
      </div>
    );
  } else if (modo === "maos") {
    const passos = caminho ?? [];
    controles = (
      <div className="flex flex-col gap-2.5">
        {caminho ? (
          <>
            <Pares destaque={pares} so={pares.cinco && !pares.dez ? "cinco" : pares.dez && !pares.cinco ? "dez" : undefined} />
            <ol className="passos-junto" data-passos-junto={passos.length}>
              {passos.map((m, i) => (
                <li key={i}>
                  <span className="passo-ordem">{i + 1}</span>
                  <span>{movimentosPorHaste([m], e.hastes, NOMES_POSICAO, RASCUNHO_SOROBAN)}</span>
                </li>
              ))}
            </ol>
          </>
        ) : paresAbertos ? (
          <Pares destaque={nivelAjuda >= 2 ? pares : { cinco: null, dez: null }} so={nivelAjuda >= 2 && pares.cinco && !pares.dez ? "cinco" : nivelAjuda >= 2 && pares.dez && !pares.cinco ? "dez" : undefined} />
        ) : (
          rascunho.length > 0 && (
            <div className="rascunho" data-rascunho={rascunho.length}>
              <span className="rascunho-lapis" aria-hidden="true">
                <IconeLapis />
              </span>
              <ol className="rascunho-lista" aria-label={RASCUNHO_SOROBAN.rotulo}>
                {rascunho.map((l, i) => (
                  <li key={i} className="rascunho-linha" data-visor={i === rascunho.length - 1 ? "" : undefined}>
                    <span>{l}</span>
                  </li>
                ))}
              </ol>
            </div>
          )
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="botao-secundario"
            aria-pressed={paresAbertos}
            onClick={() => {
              if (!paresAbertos) enviar({ tipo: "pares" });
              setParesAbertos(!paresAbertos);
            }}
            data-acao="pares"
          >
            <IconeOsPares />
            {TEXTOS_BANCADA.osPares}
          </button>
          <button type="button" className="botao-discreto" onClick={() => enviar({ tipo: "desfazer" })} disabled={e.aberto.pilha.length === 0} data-acao="desfazer">
            <IconeDesfazer />
            {TEXTOS_BANCADA.desfazer}
          </button>
          <button type="button" className="botao-discreto" onClick={() => enviar({ tipo: "zerar" })} data-acao="zerar">
            <IconeRecomecar />
            {TEXTOS_BANCADA.zerar}
          </button>
        </div>
        {item.nivel === "com-nonio" && !caminho && !paresAbertos && <p className="painel-nota">{TEXTOS_BANCADA.dicaDoToque}</p>}
      </div>
    );
  } else {
    const rotulo = modo === "leitura" ? TEXTOS_BANCADA.caixaNumero : modo === "sombra" ? TEXTOS_BANCADA.caixaFicou : TEXTOS_BANCADA.caixaQuantoDeu;
    const op = e.item.operacao;
    const ouvindo = modo === "ditado" && op.tipo === "ditado" && e.mostrados < op.numeros.length;
    controles = (
      <div className="flex flex-col gap-2.5">
        {paresAbertos && <Pares destaque={{ cinco: null, dez: null }} />}
        {ouvindo ? (
          <button type="button" className="botao-principal w-full" onClick={() => enviar({ tipo: "proximo-numero" })} data-acao="proximo-numero">
            {TEXTOS_BANCADA.proximoNumero}
          </button>
        ) : (
          <Teclado
            valor={digitado}
            rotulo={rotulo}
            aindaNao={aindaNao}
            onValor={(v) => {
              setDigitado(v);
              setAindaNao(false);
            }}
            onConferir={() => {
              if (digitado.length === 0) return;
              enviar({ tipo: "responder", valor: Number(digitado) });
              setDigitado("");
            }}
            extra={modo === "sombra" && !e.verContas ? { rotulo: TEXTOS_BANCADA.verContas, onTocar: () => enviar({ tipo: "ver-contas" }) } : null}
          />
        )}
        {modo === "sombra" && (
          <div className="flex items-center gap-2">
            <button type="button" className="botao-discreto" onClick={() => enviar({ tipo: "desfazer" })} disabled={e.aberto.pilha.length === 0} data-acao="desfazer">
              <IconeDesfazer />
              {TEXTOS_BANCADA.desfazer}
            </button>
            <button type="button" className="botao-discreto" onClick={() => enviar({ tipo: "zerar" })} data-acao="zerar">
              <IconeRecomecar />
              {TEXTOS_BANCADA.zerar}
            </button>
            <button type="button" className="botao-discreto ml-auto" aria-pressed={paresAbertos} onClick={() => {
              if (!paresAbertos) enviar({ tipo: "pares" });
              setParesAbertos(!paresAbertos);
            }} data-acao="pares">
              {TEXTOS_BANCADA.osPares}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- O Nônio ---------- */

  const voz = (
    <p className="so-leitor" role="status" aria-live="polite" data-fala-nonio={falaAtual.id} data-selo={seloVisivel ?? undefined}>
      {seloVisivel === "acertou" ? "Acertou. " : seloVisivel === "ainda-nao" ? "Ainda não. " : ""}
      {falaAtual.texto}
    </p>
  );
  const canto = (
    <div className="nonio-canto" data-nonio-canto="">
      {nonio.recado && !janelaAberta && <RecadoNonio texto={recadoDaFala(falaAtual)} selo={seloVisivel} onTocar={() => setJanelaAberta(true)} />}
      <BolhaNonio expressao={falaAtual.expressao} novidade={nonio.novidade} onAbrir={() => setJanelaAberta(true)} aberta={janelaAberta} />
    </div>
  );
  const rotuloAjuda = AJUDA_LAPIDACAO.botao[Math.min(nivelAjuda, 3)];
  const janela = janelaAberta ? (
    <JanelaNonio
      fala={falaAtual}
      selo={seloVisivel}
      expressao={falaAtual.expressao}
      apontando={null}
      antes={nonio.antes}
      rotuloAntes={TEXTOS_BANCADA.antes}
      ajuda={!terminado && nivelAjuda < 4 ? { rotulo: rotuloAjuda, onPedir: pedirAjuda, nivel: nivelAjuda, oferta: false } : null}
      caso={
        casoAberto && !terminado
          ? {
              conteudo: (
                <div className="flex flex-col gap-3" data-painel="ajuda">
                  <p className="m-0 text-[16px] font-medium leading-[1.4]" data-degrau={3}>
                    {textoDaAjuda(e, ld, 3)}
                  </p>
                  {exemplo ? (
                    <div className="ficha-quadriculada p-2 shadow-none">
                      <SorobanPequeno inicio={exemplo.inicio} movimentos={exemplo.movimentos} animado rotulo={exemplo.conta} />
                      <p className="m-0 mt-1 text-center text-[17px] font-extrabold algarismos">{exemplo.conta}</p>
                    </div>
                  ) : ld?.lance.tipo === "mostrar" ? (
                    <div className="ficha-quadriculada p-2 shadow-none">
                      <SorobanPequeno inicio={mostrar(1, 7)} modo="leitura" rotulo="7 = 5 + 2" />
                    </div>
                  ) : null}
                  {nivelAjuda < 4 && (
                    <button type="button" className="botao-secundario w-full" onClick={pedirAjuda} data-acao="junto">
                      {AJUDA_LAPIDACAO.botao[3]}
                    </button>
                  )}
                </div>
              ),
              onVoltar: () => setCasoAberto(false),
            }
          : null
      }
      extra={
        temVaiEVolta && !replay ? (
          <button type="button" className="botao-secundario self-start" onClick={abrirCaminhoCurto} data-acao="ver-caminho-curto">
            {TEXTOS_BANCADA.verCaminhoCurto}
          </button>
        ) : null
      }
      conversa={null}
      onFechar={() => {
        setJanelaAberta(false);
        setCasoAberto(false);
      }}
    />
  ) : null;

  const apresentar = modo === "maos" && !terminado && !janelaAberta && !("soroban" in progresso.apresentacoes);

  const cabecalho = (
    <CabecalhoLugar
      voltar={{ href: "/relicario", rotulo: TEXTOS_BANCADA.voltar }}
      lugar={TEXTOS_BANCADA.lugar}
      titulo={titulo}
      direita={<BotaoOperacoes total={rodada.itens.length} feitos={rodada.feitos} atual={TEXTOS_BANCADA.agora} />}
    />
  );

  const op = item.operacao;
  return (
    <>
      <Palco
        atributos={{
          "data-pronto": "sim",
          "data-tela": "lapidacao",
          "data-fase": "operacao",
          "data-passo": String(indice + 1),
          "data-nivel": item.nivel,
          "data-modo": modo,
          "data-operacao": op.tipo === "ditado" ? `ditado:${op.numeros.join(",")}` : op.tipo === "somar" || op.tipo === "subtrair" ? `${op.tipo}:${op.a}:${op.b}` : `${op.tipo}:${op.valor}`,
          "data-resumo": resumoDaOperacao(op),
          "data-lance-indice": String(atual?.indice ?? -1),
          "data-lance": dataLance,
          "data-tecnicas": dataTecnicas,
          "data-pares": paresAbertos ? "aberto" : "fechado",
          "data-retorno": retorno,
          "data-situacao": terminado ? "feito" : "ativo",
          "data-janela": janelaAberta ? "aberta" : "fechada",
          "data-caminho-passando": replay ? "sim" : "nao",
          "data-lapidacao": "rodada",
          "data-ajuda": String(nivelAjuda),
        }}
        cabecalho={cabecalho}
        pedido={<FaixaOperacao e={e} gesto={gesto} tom={tomGesto} />}
        maquina={maquina}
        nonio={canto}
        controles={controles}
      />
      {voz}
      {janela}
      {apresentar && <Apresentacao id="soroban" onEntendi={() => atualizar((p, t) => marcarApresentacao(p, "soroban", t))} />}
    </>
  );
}

