"use client";

/**
 * Executa uma atividade (missão, prova direta, registro, eco, exposição, cena) na tela.
 * O estado da execução vive no progresso: fechar e reabrir o navegador devolve o mesmo passo,
 * com a máquina no mesmo estado. Girar o aparelho só muda o CSS.
 *
 * O Nônio mora numa faixa entre a máquina e a bancada: lê a máquina, diz o retorno de cada
 * conferência (verde quando acertou; "ainda não", passageiro, quando não bateu) e dá a escada
 * de ajuda a pedido. Quem decide é o motor; a faixa só fala o que ele decidiu.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { operarVarias, quantidadeNaBica, bicasEmUso } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, Bancada as EstadoBancada, EstadoBancada as EstadoMaquina } from "@/nucleo/maquinas/bancada/tipos";
import { metasDeComposicao } from "@/nucleo/maquinas/bancada/validadores";
import type { DiferencaMaquinas } from "@/nucleo/maquinas/bancada/diferenca";
import { compara } from "@/nucleo/racional/racional";
import {
  aplicarEntrada,
  chegadaDoPasso,
  iniciarExecucao,
  medidasVivas,
  palpiteDoPasso,
  passoAtual,
  passosDoModo,
  resolucaoDoPasso,
  type Efeito,
  type Execucao,
} from "@/nucleo/missoes/motor";
import { aplicarEfeitos, chaveExecucao, restaurarExecucao } from "@/nucleo/missoes/efeitos";
import type { AlvoMaquina, Atividade, Entrada, FaixasExposicao, ModoExecucao, Passo } from "@/nucleo/missoes/tipos";
import { definirDesvio, iniciarAtividade, type Desvio } from "@/nucleo/progresso";
import { situacaoConceito } from "@/nucleo/dominio/dominio";
import { falaDoPasso, PERMANENCIA_MINIMA_MS, type FalaFaixa } from "@/nucleo/tutor/fila";
import { falaDeLembrete, falaDeOferta, falaDoEstado, reagir, seloVisivel } from "@/nucleo/tutor/reacoes";
import { passoDeMaquina, proximoGesto } from "@/nucleo/missoes/gesto";
import { CATEGORIAS_RUA } from "@/conteudo/rua";
import { PELES, type Pele } from "@/conteudo/peles";
import { AJUDA } from "@/conteudo/reacoes";
import { GESTOS } from "@/conteudo/gestos";
import { Bancada, type MarcasBancada } from "@/componentes/maquinas/Bancada";
import { PainelBancada } from "@/componentes/maquinas/PainelBancada";
import { Palco } from "@/componentes/maquinas/Palco";
import { Nonio } from "@/componentes/nonio/Nonio";
import { FaixaNonio, type AcaoAjuda } from "@/componentes/nonio/FaixaNonio";
import { BarraJunto, FolhaCasoParecido } from "@/componentes/nonio/AjudaNonio";
import { useFalaQuandoCalmo, useFilaNonio } from "@/componentes/nonio/useFila";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { atividadePorId, conceitoDoEquivoco, proximaMissao, rotaDe, SONDAGEM_ATIVA, TEXTOS_REACAO } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { Bilhete, PainelAposta } from "./Aposta";
import { BotaoEtapas } from "./Etapas";
import { FalaDalia, Falas } from "./Falas";
import { Objetivo, type Etiqueta } from "./Objetivo";
import { ManualRasgado } from "./Manual";
import type { MarcaResposta } from "./Respostas";
import { descreverAcao, NOME_DA_FASE } from "./textos";
import { FaixaNaFolha, FolhaFrase, FolhaNotacao, FolhaRegistro, PainelPalpite, PainelPrever, PainelVencido, Seguir } from "./Vistas";

interface Fim {
  via: "guiada" | "prova" | "registro";
  pagina: boolean;
  joia: string | null;
}

function lerModo(v: string | null): ModoExecucao {
  return v === "prova" ? "prova" : v === "registro" ? "registro" : "guiada";
}

export function Executor({ atividadeId, voltar }: { atividadeId: string; voltar: { href: string; rotulo: string } }) {
  const a = atividadePorId(atividadeId);
  const modo = lerModo(useSearchParams().get("modo"));
  if (!a) return <p className="m-0 p-6 font-semibold">Atividade não encontrada.</p>;
  return <ExecutorAtividade key={`${a.id}#${modo}`} a={a} modo={modo} voltar={voltar} />;
}

const TIPOS_COM_ESCADA: readonly Passo["tipo"][] = ["operar", "prever", "frase", "aposta"];

/** Executa uma atividade dada (também as geradas: revisita e sondagem). */
export function ExecutorAtividade({
  a,
  modo = "guiada",
  voltar,
  aoTerminar,
}: {
  a: Atividade;
  modo?: ModoExecucao;
  voltar: { href: string; rotulo: string };
  /** Tela própria de fim (a sondagem usa para oferecer o desvio). */
  aoTerminar?: () => React.ReactNode;
}) {
  const { pronto, progresso, atualizar } = useProgresso();
  const [fim, setFim] = useState<Fim | null>(null);
  const [sondagem, setSondagem] = useState<string | null>(null);
  const [cotaEscolhida, setCotaEscolhida] = useState<string | null>(null);
  const [comprimida, setComprimida] = useState<string | null>(null);
  const [casoAberto, setCasoAberto] = useState(false);
  /** O jogador mexeu na resposta depois de um "ainda não": o vermelho sai (passageiro). */
  const [rascunho, setRascunho] = useState<string | null>(null);
  const postura = progresso.preferencias.postura;
  const { fila, oferecerFala } = useFilaNonio(postura);

  const salva = restaurarExecucao(progresso.campanha.execucoes[chaveExecucao(a, modo)], a, (m) => passosDoModo(a, m).length);
  const exec: Execucao = salva && salva.modo === modo ? salva : iniciarExecucao(a, modo);
  const passo = passoAtual(a, exec);
  const pele = exec.bancada ? PELES[exec.bancada.atual.config.pele] : null;
  const oferta = pronto && !fim && passo ? falaDeOferta(passo, exec, postura, TEXTOS_REACAO) : null;
  useFalaQuandoCalmo(oferta, fila, oferecerFala, PERMANENCIA_MINIMA_MS + 3500);
  const gesto = passo ? proximoGesto(passo, exec, { textos: GESTOS, reacoes: TEXTOS_REACAO, pele }) : null;
  const lembrete = useLembrete(
    pronto && !fim && passo !== null && passoDeMaquina(passo) && exec.passo.situacao !== "vencido" ? `${passo.id}:${exec.bancada?.atual.seq ?? 0}:${exec.passo.situacao}` : null,
    (n) => {
      if (!passo || !gesto || postura === "quieto" || passo.fase === "aplicacao") return;
      oferecerFala(falaDeLembrete(passo, gesto.texto, TEXTOS_REACAO, n));
    },
  );

  if (!pronto) return <Carregando />;
  if (fim) return aoTerminar ? <>{aoTerminar()}</> : <TelaFim a={a} fim={fim} voltar={voltar} desvio={progresso.campanha.desvio} />;
  if (!passo) return <Carregando />;
  const total = passosDoModo(a, modo).length;

  const enviar = (entrada: Entrada) => {
    const agora = agoraDoJogo(progresso);
    const r = aplicarEntrada(a, exec, entrada, { agora, conceitoDoEquivoco });
    atualizar((p, t) => aplicarEfeitos(iniciarAtividade(p, a.id, t), a, r.exec, r.efeitos, t));
    const peleDepois = r.exec.bancada ? PELES[r.exec.bancada.atual.config.pele] : pele;
    const fala = reagir({
      atividade: a,
      passo,
      antes: exec,
      depois: r.exec,
      entrada,
      efeitos: r.efeitos,
      postura,
      textos: TEXTOS_REACAO,
      pele: peleDepois,
      palpite: palpiteDoPasso(a, r.exec),
    });
    if (fala) oferecerFala(fala);
    if (entrada.tipo === "dica" && r.exec.passo.ajuda === 3 && exec.passo.ajuda < 3) setCasoAberto(true);
    // Duas falhas com o mesmo equívoco, em atividades diferentes: o Nônio pede uma sondagem.
    if (SONDAGEM_ATIVA && a.tipo !== "sondagem") {
      const novas = r.efeitos.flatMap((e) => (e.tipo === "evidencias" ? e.lista : []));
      for (const ev of novas) {
        if (ev.resultado !== "falha" || !ev.equivoco) continue;
        const antes = situacaoConceito(ev.conceito, progresso.evidencias, agora);
        const depois = situacaoConceito(ev.conceito, [...progresso.evidencias, ...novas], agora);
        if (!antes.sondagemPendente && depois.sondagemPendente) {
          setSondagem(ev.conceito);
          oferecerFala({ id: "sondagem", texto: AJUDA.sondagem, expressao: "medindo", prioridade: "pedida", categoria: "sondagem", passo: passo.id });
        }
      }
    }
    if (r.exec.indice !== exec.indice) {
      setCotaEscolhida(null);
      setCasoAberto(false);
    }
    const concluida = r.efeitos.find((e): e is Extract<Efeito, { tipo: "concluida" }> => e.tipo === "concluida");
    if (concluida) {
      setFim({
        via: concluida.via,
        pagina: r.efeitos.some((e) => e.tipo === "pagina"),
        joia: r.efeitos.find((e): e is Extract<Efeito, { tipo: "joia" }> => e.tipo === "joia")?.id ?? null,
      });
    }
  };

  /* ---------- A faixa do Nônio ---------- */

  const palpite = palpiteDoPasso(a, exec);
  const falaAtual: FalaFaixa = falaDoPasso(fila, passo.id) ?? falaDoEstado(a, passo, exec, TEXTOS_REACAO, pele, palpite);
  const chaveRascunho = `${passo.id}:${exec.passo.respostas}:${exec.passo.tentativas}`;
  const selo = rascunho === chaveRascunho && exec.passo.retorno === "ainda-nao" ? null : seloVisivel(falaAtual, exec);
  const retorno = selo ?? "neutro";
  const sit = exec.passo.situacao;
  const nivel = exec.passo.ajuda;
  const temEscada = passo.dicas !== undefined && TIPOS_COM_ESCADA.includes(passo.tipo) && (sit === "ativo" || sit === "convite");
  const podeJunto = passo.tipo === "operar" || passo.tipo === "frase" || passo.tipo === "aposta";
  const pedirAjuda = () => {
    if (nivel < 3) enviar({ tipo: "dica" });
    else if (podeJunto) enviar({ tipo: "junto" });
    else setCasoAberto(true);
  };
  const rotuloAjuda = nivel === 0 ? "Me ajuda" : nivel < 3 ? "Mais ajuda" : podeJunto ? "Resolver junto" : "Ver o caso";
  const ajudaNaResposta = passo.tipo === "prever" && selo === "ainda-nao";
  const acaoAjuda: AcaoAjuda | null =
    temEscada && nivel < 4 && !ajudaNaResposta ? { rotulo: rotuloAjuda, onPedir: pedirAjuda, oferta: falaAtual.categoria === "oferta" } : null;
  const expressao = falaAtual.categoria === "passo" && postura === "quieto" ? "quieto" : falaAtual.expressao;

  const origemDesvio = progresso.campanha.desvio?.destino === a.id ? atividadePorId(progresso.campanha.desvio.origem) : null;
  const faixa = (compacta: boolean) => (
    <>
      {!compacta && origemDesvio && (
        <Link href={rotaDe(origemDesvio)} className="block rotate-[-0.6deg] rounded-md border-2 border-tinta bg-marca-texto px-3 py-2 text-[14px] font-semibold" data-desvio="">
          Desvio. Quando quiser, volte para {origemDesvio.titulo}: a máquina está como você deixou.
        </Link>
      )}
      {!compacta && a.categoria && <CategoriaRua categoria={a.categoria} />}
      <FaixaNonio
        fala={falaAtual}
        selo={selo}
        retorno={retorno}
        expressao={expressao}
        ajuda={acaoAjuda}
        compacta={compacta}
        apontando={falaAtual.alvo !== undefined}
        extra={
          sondagem ? (
            <Link
              href={`/partilha/sondagem?conceito=${encodeURIComponent(sondagem)}&origem=${encodeURIComponent(a.id)}`}
              className="botao-pequeno mt-2"
              data-convite-sondagem={sondagem}
            >
              Uma pergunta
            </Link>
          ) : null
        }
      />
    </>
  );

  const folhaCaso =
    casoAberto && passo.dicas ? (
      <FolhaCasoParecido
        dica={passo.dicas[2]}
        medidas={{ ...medidasVivas(exec.bancada?.atual ?? null), feitas: String(exec.passo.solucoes.length) }}
        podeJunto={podeJunto && sit === "ativo" && nivel < 4}
        onJunto={() => {
          setCasoAberto(false);
          enviar({ tipo: "junto" });
        }}
        onFechar={() => setCasoAberto(false)}
      />
    ) : null;

  const atributos = {
    "data-pronto": "sim",
    "data-tela": "missao",
    "data-atividade": a.id,
    "data-modo": modo,
    "data-passo": passo.id,
    "data-fase": passo.fase,
    "data-situacao": sit,
    "data-retorno": retorno,
  };

  const cabecalho = (
    <CabecalhoLugar
      voltar={voltar}
      lugar={`${lugarDe(a, modo)} · ${NOME_DA_FASE[passo.fase]}`}
      titulo={a.titulo}
      direita={total > 1 ? <BotaoEtapas passos={passosDoModo(a, modo)} atual={exec.indice} /> : undefined}
    />
  );

  const desafio = passo.tipo === "operar" && sit === "convite" && passo.convite;
  const etiqueta: Etiqueta =
    selo === "acertou" && (sit === "vencido" || sit === "conferindo")
      ? "Feito"
      : desafio
        ? "Desafio"
        : passo.tipo === "prever"
          ? "Pergunta"
          : passo.tipo === "palpite"
            ? "Palpite"
            : passo.tipo === "aposta"
              ? "Aposta do Nônio"
              : passo.tipo === "frase" || passo.tipo === "notacao" || passo.tipo === "registro"
                ? "Registro"
                : "Objetivo";
  const pedido = (
    <Objetivo etiqueta={etiqueta} instrucao={desafio ? (passo.convite.instrucao ?? passo.convite.texto) : passo.instrucao} gesto={gesto} lembrete={lembrete} />
  );

  if (passo.tipo === "narrativa" || !exec.bancada) {
    const exposicao = a.tipo === "exposicao" && passo.tipo === "narrativa" && passo.faixas !== undefined;
    return (
      <>
        <TelaNarrativa atributos={atributos} cabecalho={cabecalho} pedido={pedido}>
          {passo.tipo === "narrativa" && passo.manual && <ManualRasgado titulo={passo.manual.titulo} linhas={passo.manual.linhas} />}
          {exposicao ? (
            <Recorte>
              {passo.falas && <Falas falas={passo.falas} compacta />}
              {passo.tipo === "narrativa" && passo.faixas && <Faixas faixas={passo.faixas} />}
            </Recorte>
          ) : (
            <>
              {passo.falas && <Falas falas={passo.falas} />}
              {passo.tipo === "narrativa" && passo.faixas && <Faixas faixas={passo.faixas} />}
            </>
          )}
          {passo.falasSeMarca && progresso.campanha.marcas.includes(passo.falasSeMarca.marca) && <Falas falas={passo.falasSeMarca.falas} />}
          <div className="flex flex-col gap-2.5">{faixa(false)}</div>
          {passo.tipo === "registro" ? (
            <FolhaRegistro passo={passo} frase={Object.values(exec.frases).at(-1) ?? ""} onGuardar={() => enviar({ tipo: "seguir" })} />
          ) : passo.tipo === "palpite" ? (
            <div className="ficha p-4">
              <PainelPalpite passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} />
            </div>
          ) : (
            <Seguir rotulo={passo.tipo === "narrativa" ? (passo.botao ?? "Continuar") : "Continuar"} onClick={() => enviar({ tipo: "seguir" })} />
          )}
        </TelaNarrativa>
        {folhaCaso}
      </>
    );
  }

  const bancada = exec.bancada;
  const peleMaquina = PELES[bancada.atual.config.pele];
  const aindaNao = selo === "ainda-nao";
  const alvo = falaAtual.alvo ?? null;
  const vencido = sit === "vencido";
  const marcas: MarcasBancada = {
    aceita: vencido && (passo.tipo === "operar" || passo.tipo === "aposta"),
    fechou: vencido && passo.tipo === "operar" && selo === "acertou",
    bicasAtencao: aindaNao ? bicasDoAlvo(alvo, bancada.atual) : [],
    sobraAtencao: aindaNao && alvo === "esteira",
  };
  const realce = !aindaNao && alvo && (sit === "ativo" || sit === "convite") ? alvo : null;
  const cotaDica = nivel >= 2 && sit === "ativo" ? passo.dicas?.[1].cota : undefined;
  const vivas = medidasVivas(bancada.atual);
  const cotaExtra = cotaDica ? { alvo: cotaDica.alvo, texto: textoComMedidas(cotaDica.texto, vivas) } : null;
  const formalizacao = passo.tipo === "frase" || passo.tipo === "notacao" || passo.tipo === "registro";
  const parada = formalizacao || passo.tipo === "palpite" || passo.tipo === "prever";
  const operavel = (passo.tipo === "operar" || passo.tipo === "aposta") && !vencido;
  // A máquina nova continua a história: a chegada anima só a diferença, enquanto o passo está intacto.
  const chegada = chegadaDoPasso(a, exec);
  const intacto = bancada.atual.seq === exec.passo.inicio?.atual.seq && exec.passo.respostas === 0 && sit === "ativo";

  const maquina = (
    <MaquinaDoPasso
      key={passo.id}
      exec={exec}
      passo={passo}
      pele={peleMaquina}
      cotas={progresso.preferencias.cotas === "visiveis" || nivel >= 2}
      onAcao={parada || !operavel ? undefined : (acao) => enviar({ tipo: "maquina", acao })}
      realce={realce}
      cotaExtra={cotaExtra}
      marcas={marcas}
      chegada={chegada}
      metas={passo.tipo === "aposta" && !vencido ? metasDeComposicao(passo.objetivo) : undefined}
    />
  );

  // Acima da máquina: o bilhete da aposta; a Dália, quando a máquina muda ou quando abre a conversa.
  const falasDaDalia = passo.falas?.filter((f) => f.quem === "dalia").map((f) => f.texto) ?? [];
  const nota =
    passo.tipo === "aposta" ? (
      <Bilhete texto={passo.aposta} />
    ) : passo.chegada && intacto ? (
      <div className="ficha px-4 pb-3 pt-2" data-chegada={passo.id}>
        <FalaDalia texto={passo.chegada.fala} compacta />
      </div>
    ) : falasDaDalia.length > 0 && intacto ? (
      <div className="ficha px-4 pb-3 pt-2">
        <FalaDalia texto={falasDaDalia} compacta />
      </div>
    ) : null;

  const conta =
    passo.tipo === "operar" && passo.conta ? (
      <div className="absolute left-3 top-3 z-10 quadro-notacao px-3 py-1" aria-label={`Conta a mostrar: ${passo.conta}`}>
        <LinhaNotacao texto={passo.conta} tamanho="pequena" rotulos={false} />
      </div>
    ) : null;

  const marcaResposta = {
    valor: aindaNao ? (exec.passo.resposta ?? null) : null,
    onRascunho: () => setRascunho(chaveRascunho),
    ajuda: ajudaNaResposta && temEscada && nivel < 4 ? { rotulo: rotuloAjuda, onPedir: pedirAjuda } : null,
  };

  let controles: React.ReactNode = null;
  let sobreposicao: React.ReactNode = null;

  const junto = (p: Extract<Passo, { tipo: "operar" | "aposta" }>) => {
    if (exec.passo.junto === null) return null;
    const proxima = resolucaoDoPasso(p, exec)[exec.passo.junto];
    if (proxima) return <BarraJunto texto={descreverAcao(proxima, peleMaquina)} onFazer={() => enviar({ tipo: "maquina", acao: proxima })} />;
    if (p.tipo === "operar" && !p.automatico) return <BarraJunto texto="Agora feche." onFazer={() => enviar({ tipo: "fechar" })} />;
    return null;
  };

  if (passo.tipo === "palpite") {
    controles = <PainelPalpite passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} />;
  } else if (passo.tipo === "prever") {
    controles = (
      <PainelPreverComDemo exec={exec} passo={passo} marca={marcaResposta} onResponder={(v) => enviar({ tipo: "responder", valor: v })} onSeguir={() => enviar({ tipo: "seguir" })} />
    );
  } else if (passo.tipo === "aposta") {
    controles = (
      <PainelAposta
        passo={passo}
        exec={exec}
        alavanca={
          passo.alavanca !== false ? (
            <PainelBancada estado={bancada.atual} pele={peleMaquina} onAcao={(acao) => enviar({ tipo: "maquina", acao })} soAlavanca />
          ) : null
        }
        junto={junto(passo)}
        marca={marcaResposta.valor}
        onRascunho={marcaResposta.onRascunho}
        onResponder={(v) => enviar({ tipo: "responder", valor: v })}
        onDesfazer={() => enviar({ tipo: "maquina", acao: { tipo: "desfazer" } })}
        onSeguir={() => enviar({ tipo: "seguir" })}
      />
    );
  } else if (passo.tipo === "operar") {
    if (vencido) {
      controles = (
        <PainelVencido
          falas={passo.aoConcluir}
          palpite={palpite}
          convite={passo.convite && exec.passo.convite === null ? passo.convite.texto : null}
          onConvite={(aceitar) => enviar({ tipo: "convite", aceitar })}
          onSeguir={() => enviar({ tipo: "seguir" })}
        />
      );
    } else {
      controles = (
        <div className="flex flex-col gap-3">
          {sit === "convite" && passo.convite && <p className="m-0 font-bold"><span className="grifo">{passo.convite.texto}</span></p>}
          {exec.passo.solucoes.length > 0 && passo.objetivo.validador === "partilha.solucoes-distintas" && (
            <p className="m-0 font-semibold" data-solucoes={exec.passo.solucoes.length}>
              Jeitos aceitos: <span className="grifo font-extrabold">{exec.passo.solucoes.length} de {String(passo.objetivo.params?.n ?? 2)}</span>.
            </p>
          )}
          {junto(passo)}
          <PainelBancada
            estado={bancada.atual}
            pele={peleMaquina}
            onAcao={(acao) => enviar({ tipo: "maquina", acao })}
            onFechar={passo.automatico ? undefined : () => enviar({ tipo: "fechar" })}
            rotuloFechar={passo.rotuloFechar}
          />
        </div>
      );
    }
  } else if (passo.tipo === "frase") {
    sobreposicao = (
      <FolhaSobe>
        <FaixaNaFolha>{faixa(true)}</FaixaNaFolha>
        <FolhaFrase
          passo={passo}
          exec={exec}
          escolhida={cotaEscolhida}
          onEscolher={setCotaEscolhida}
          onColocar={(lacuna) => {
            if (cotaEscolhida !== null) {
              enviar({ tipo: "lacuna", lacuna, valor: cotaEscolhida });
              setCotaEscolhida(null);
            }
          }}
          onConferir={() => enviar({ tipo: "conferir" })}
          onSeguir={() => enviar({ tipo: "seguir" })}
        />
      </FolhaSobe>
    );
  } else if (passo.tipo === "notacao") {
    const frase = Object.values(exec.frases).at(-1) ?? "";
    sobreposicao = (
      <FolhaSobe>
        <FaixaNaFolha>{faixa(true)}</FaixaNaFolha>
        <FolhaNotacao
          passo={passo}
          frase={frase}
          comprimida={comprimida === passo.id}
          onComprimir={() => setComprimida(passo.id)}
          onSeguir={() => {
            setComprimida(null);
            enviar({ tipo: "seguir" });
          }}
        />
      </FolhaSobe>
    );
  } else if (passo.tipo === "registro") {
    sobreposicao = (
      <FolhaSobe>
        <FaixaNaFolha>{faixa(true)}</FaixaNaFolha>
        <FolhaRegistro passo={passo} frase={Object.values(exec.frases).at(-1) ?? ""} onGuardar={() => enviar({ tipo: "seguir" })} />
      </FolhaSobe>
    );
  }

  return (
    <>
      <Palco
        atributos={{ ...atributos, "data-cena": a.tipo === "cena" ? "sim" : "nao" }}
        cabecalho={cabecalho}
        pedido={pedido}
        nota={nota}
        maquina={
          <>
            {conta}
            {maquina}
          </>
        }
        faixa={faixa(false)}
        controles={controles}
        sobreposicao={sobreposicao}
      />
      {folhaCaso}
    </>
  );
}

function textoComMedidas(modelo: string, vivas: Record<string, string>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => vivas[k] ?? "");
}

/** As bicas que o "ainda não" circula: a do motivo, ou a de mais e a de menos carga. */
function bicasDoAlvo(alvo: AlvoMaquina | null, e: EstadoMaquina): number[] {
  if (!alvo) return [];
  if (alvo.startsWith("bica:")) return [Number(alvo.slice(5))];
  if (alvo !== "bicas") return [];
  const uso = bicasEmUso(e);
  if (uso.length < 2) return uso;
  const ordenadas = [...uso].sort((x, y) => compara(quantidadeNaBica(e.bicas[x]), quantidadeNaBica(e.bicas[y])));
  const menor = ordenadas[0];
  const maior = ordenadas[ordenadas.length - 1];
  if (compara(quantidadeNaBica(e.bicas[menor]), quantidadeNaBica(e.bicas[maior])) === 0) return [];
  return [menor, maior];
}

/**
 * 25 s sem gesto num passo de máquina: a linha do gesto pulsa uma vez (devolve um número novo) e
 * o Nônio pode repetir o gesto. Qualquer gesto (a chave muda) recomeça a conta. Nenhum relógio
 * aparece na tela.
 */
const LEMBRETE_MS = 25_000;

function useLembrete(chave: string | null, aoLembrar: (vez: number) => void): number {
  const [vez, setVez] = useState<{ chave: string | null; n: number }>({ chave: null, n: 0 });
  useEffect(() => {
    // Uma vez por parada: depois do lembrete, só um gesto novo (chave nova) arma outro.
    if (!chave || vez.chave === chave) return;
    const t = setTimeout(() => {
      const n = vez.n + 1;
      setVez({ chave, n });
      aoLembrar(n);
    }, LEMBRETE_MS);
    return () => clearTimeout(t);
    // O lembrete só recomeça quando a chave (passo, máquina, situação) muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, vez]);
  return vez.chave === chave ? vez.n : 0;
}

/* ---------- Peças da tela ---------- */

/** Onde a atividade acontece, para a linha de cima do cabeçalho. */
function lugarDe(a: Atividade, modo: ModoExecucao): string {
  const distrito = a.tipo === "exposicao" ? "Museu" : a.tipo === "cena" ? "A Rua" : "A Partilha";
  const tipo =
    modo === "prova"
      ? "Prova direta"
      : modo === "registro"
        ? "Registro"
        : a.tipo === "missao"
          ? `Missão ${a.numero}`
          : a.tipo === "exposicao"
            ? "Exposição"
            : a.tipo === "cena"
              ? "Cena"
              : a.tipo === "eco"
                ? "Eco"
                : a.tipo === "revisita"
                  ? "Revisita"
                  : "Sondagem";
  return `${distrito} · ${tipo}`;
}

/** A folha pautada sobe da borda de baixo, por cima da folha quadriculada. */
function FolhaSobe({ children }: { children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAberta(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className="folha-sobe" data-aberta={aberta ? "sim" : "nao"}>
      {children}
    </div>
  );
}

/** A máquina do passo; numa previsão, a máquina confere ação por ação. */
function MaquinaDoPasso({
  exec,
  passo,
  pele,
  cotas,
  onAcao,
  realce,
  cotaExtra,
  marcas,
  chegada,
  metas,
}: {
  exec: Execucao;
  passo: Passo;
  pele: Pele;
  cotas: boolean;
  onAcao?: (a: AcaoBancada) => void;
  realce: AlvoMaquina | null;
  cotaExtra: { alvo: AlvoMaquina; texto: string } | null;
  marcas: MarcasBancada;
  chegada: DiferencaMaquinas | null;
  metas?: Readonly<Record<number, string>>;
}) {
  const demo = useDemonstracao(passo.tipo === "prever" && exec.passo.situacao === "conferindo" ? passo : null, exec.passo.inicio);
  const estado = demo ?? exec.bancada;
  if (!estado) return null;
  return (
    <Bancada
      estado={estado.atual}
      pele={pele}
      cotas={cotas}
      onAcao={onAcao}
      realce={realce}
      cotaExtra={cotaExtra}
      marcas={demo ? { aceita: false } : passo.tipo === "prever" && exec.passo.situacao === "conferindo" ? { aceita: true } : marcas}
      chegada={demo ? null : chegada}
      metas={metas}
    />
  );
}

/** Reproduz a demonstração de uma previsão, uma ação a cada 700 ms. Devolve null ao terminar. */
function useDemonstracao(passo: Extract<Passo, { tipo: "prever" }> | null, inicio: EstadoBancada | null): EstadoBancada | null {
  const [quadro, setQuadro] = useState<{ chave: string; i: number } | null>(null);
  const chave = passo && inicio ? `${passo.id}:${inicio.atual.seq}` : null;
  const total = passo?.demonstracao.length ?? 0;
  useEffect(() => {
    if (!chave) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setQuadro({ chave, i });
      if (i > total) clearInterval(t);
    }, 700);
    return () => clearInterval(t);
  }, [chave, total]);
  if (!passo || !inicio || !chave) return null;
  const i = quadro && quadro.chave === chave ? quadro.i : 0;
  if (i > total) return null;
  return operarVarias(inicio, passo.demonstracao.slice(0, i));
}

function PainelPreverComDemo({
  exec,
  passo,
  onResponder,
  onSeguir,
  marca,
}: {
  exec: Execucao;
  passo: Extract<Passo, { tipo: "prever" }>;
  onResponder: (v: string | null) => void;
  onSeguir: () => void;
  marca: MarcaResposta;
}) {
  const [pronto, setPronto] = useState(exec.passo.situacao !== "conferindo");
  const conferindo = exec.passo.situacao === "conferindo";
  useEffect(() => {
    if (!conferindo) return;
    const t = setTimeout(() => setPronto(true), 700 * (passo.demonstracao.length + 1));
    return () => clearTimeout(t);
  }, [conferindo, passo.demonstracao.length]);
  return <PainelPrever passo={passo} exec={exec} demonstrando={conferindo && !pronto} onResponder={onResponder} onSeguir={onSeguir} marca={marca} />;
}

function TelaNarrativa({
  atributos,
  cabecalho,
  pedido,
  children,
}: {
  atributos: Record<string, string>;
  cabecalho: React.ReactNode;
  pedido: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main {...atributos} className="flex min-h-dvh flex-col">
      {cabecalho}
      <div className="palco-pedido lg:hidden">{pedido}</div>
      <div className="area-segura area-segura-base mx-auto flex w-full max-w-[600px] flex-1 flex-col gap-5 py-6">
        <div className="palco-pedido hidden lg:flex">{pedido}</div>
        {children}
      </div>
    </main>
  );
}

/** A exposição do museu: um recorte colado na folha, com fita adesiva nos cantos. */
function Recorte({ children }: { children: React.ReactNode }) {
  return (
    <div className="recorte flex flex-col gap-4 p-4 pt-5" data-recorte="">
      {children}
    </div>
  );
}

function TelaFim({ a, fim, voltar, desvio }: { a: Atividade; fim: Fim; voltar: { href: string; rotulo: string }; desvio: Desvio | null }) {
  const prox = fim.via !== "registro" ? proximaMissao(a) : null;
  const origem = desvio && desvio.destino === a.id ? atividadePorId(desvio.origem) : null;
  const { atualizar } = useProgresso();
  const titulo =
    fim.via === "registro"
      ? "Página guardada"
      : a.tipo === "missao"
        ? "Missão concluída"
        : a.tipo === "exposicao"
          ? "Exposição vista"
          : a.tipo === "cena"
            ? "Cena feita"
            : a.tipo === "revisita"
              ? "Revisita feita"
              : "Feito";
  const texto =
    fim.via === "prova"
      ? "Prova direta vencida. O registro no Caderno fica à sua espera, quando quiser."
      : fim.pagina
        ? "A página ficou no Caderno, passada a limpo, com a sua letra e a da Dália."
        : a.tipo === "revisita"
          ? "As medidas de um dia depois foram para a Planta."
          : a.tipo === "exposicao" || a.tipo === "cena" || a.tipo === "eco"
            ? "A mesma ideia, com outra roupa. Isso também conta na Planta."
            : "Fica registrado.";
  const principal = origem ? "origem" : prox ? "proxima" : "voltar";
  return (
    <main data-pronto="sim" data-tela="fim" data-atividade={a.id} className="area-segura flex min-h-dvh flex-col items-center justify-center py-8">
      <section className="ficha relative flex w-full max-w-[420px] flex-col items-center gap-4 px-5 pb-6 pt-6 text-center">
        <Nonio expressao="satisfeito" tamanho={110} />
        <p className="letra-mao absolute right-6 top-5 m-0 rotate-[-6deg] text-[30px] text-verde-escuro" aria-hidden="true">
          feita!
        </p>
        <h1 className="m-0 text-[24px] font-extrabold leading-tight">
          <span className="marca-texto" data-cresce="">
            {titulo}
          </span>
        </h1>
        <p className="m-0 max-w-sm text-[16px] font-medium text-tinta-suave">{texto}</p>
        {fim.joia && (
          <p className="m-0 max-w-sm text-[15px] font-semibold" data-joia-encontrada={fim.joia}>
            A Joia do Ábaco foi para o primeiro engaste do Relicário. Ainda bruta.
          </p>
        )}
        <div className="mt-1 flex w-full flex-col gap-2.5">
          {origem && (
            <Link href={rotaDe(origem)} className="botao-principal w-full" onClick={() => atualizar((p, t) => definirDesvio(p, null, t))} data-acao="voltar-do-desvio">
              Voltar para {origem.titulo}
            </Link>
          )}
          {prox && !origem && (
            <Link href={rotaDe(prox)} className="botao-principal w-full" data-acao="proxima">
              Missão {prox.numero}: {prox.titulo}
            </Link>
          )}
          {fim.pagina && (
            <Link href="/caderno" className="botao-secundario w-full">
              Abrir o Caderno
            </Link>
          )}
          {fim.joia && (
            <Link href="/relicario" className="botao-secundario w-full">
              Ver as joias
            </Link>
          )}
          <Link href={voltar.href} className={`${principal === "voltar" ? "botao-principal" : "botao-discreto"} w-full`} data-acao="voltar">
            {voltar.rotulo}
          </Link>
        </div>
      </section>
    </main>
  );
}

function Faixas({ faixas }: { faixas: FaixasExposicao }) {
  const faixa = (rotulo: string, linhas: readonly string[], estado: string) => (
    <section className="flex flex-col items-start" aria-label={rotulo}>
      <h2 className="etiqueta-estado relative z-[1] -mb-[2px] ml-3 rounded-b-none border-b-0 text-[13px]" data-estado={estado}>
        {rotulo}
      </h2>
      <div className="caixa w-full px-4 py-3">
        {linhas.map((l) => (
          <p key={l} className="m-0 mt-1.5 text-[15px] font-medium leading-[1.45] first:mt-0">
            {l}
          </p>
        ))}
      </div>
    </section>
  );
  return (
    <div className="flex flex-col gap-4" data-faixas="">
      {faixa("O que se sabe", faixas.sabe, "dominado")}
      {faixa("O que é interpretação", faixas.interpretacao, "em_aprendizagem")}
      {faixa("O que simplificamos", faixas.simplificamos, "pede_ajuste")}
      <p className="m-0 text-[13px] font-medium text-tinta-suave">Fontes: {faixas.fontes.join("; ")}.</p>
    </div>
  );
}

function CategoriaRua({ categoria }: { categoria: NonNullable<Atividade["categoria"]> }) {
  const c = CATEGORIAS_RUA[categoria];
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium text-tinta-suave" data-categoria={categoria}>
      <span className="etiqueta-estado" data-estado="em_aprendizagem">
        {c.nome}
      </span>
      <span>{c.explicacao}</span>
    </p>
  );
}
