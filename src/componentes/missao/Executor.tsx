"use client";

/**
 * Executa uma atividade (missão, prova direta, registro, eco, exposição, cena) na tela.
 * O estado da execução vive no progresso: fechar e reabrir o navegador devolve o mesmo passo,
 * com a máquina no mesmo estado. Girar o aparelho só muda o CSS.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { operarVarias } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, Bancada as EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import {
  aplicarEntrada,
  iniciarExecucao,
  medidasVivas,
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
import { CATEGORIAS_RUA } from "@/conteudo/rua";
import { PELES, type Pele } from "@/conteudo/peles";
import { Bancada, type MarcasBancada } from "@/componentes/maquinas/Bancada";
import { PainelBancada } from "@/componentes/maquinas/PainelBancada";
import { Palco } from "@/componentes/maquinas/Palco";
import { TiraMensagem } from "@/componentes/maquinas/Tira";
import { mensagemDoEvento, type TomTira } from "@/componentes/maquinas/mensagens";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";
import { PainelNonio } from "@/componentes/nonio/PainelNonio";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { atividadePorId, conceitoDoEquivoco, proximaMissao, rotaDe, SONDAGEM_ATIVA, textoDoEquivoco, textoDoMotivo } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { BalaoNonio, Falas } from "./Falas";
import { ManualRasgado } from "./Manual";
import { descreverAcao, NOME_DA_FASE } from "./textos";
import { FolhaFrase, FolhaNotacao, FolhaRegistro, PainelPalpite, PainelPrever, PainelVencido, Seguir } from "./Vistas";

interface Aviso {
  texto: string;
  tom: TomTira;
  /** seq da máquina quando o aviso nasceu: um evento novo apaga o aviso. */
  seq: number;
  equivoco: boolean;
}

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
  const [nonioAberto, setNonioAberto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [cotaEscolhida, setCotaEscolhida] = useState<string | null>(null);
  const [comprimida, setComprimida] = useState<string | null>(null);

  if (!pronto) return <Carregando />;
  if (fim) return aoTerminar ? <>{aoTerminar()}</> : <TelaFim a={a} fim={fim} voltar={voltar} desvio={progresso.campanha.desvio} />;

  const salva = restaurarExecucao(progresso.campanha.execucoes[chaveExecucao(a, modo)], a, (m) => passosDoModo(a, m).length);
  const exec: Execucao = salva && salva.modo === modo ? salva : iniciarExecucao(a, modo);
  const passo = passoAtual(a, exec);
  if (!passo) return <Carregando />;
  const total = passosDoModo(a, modo).length;
  const prefs = progresso.preferencias;

  const enviar = (entrada: Entrada) => {
    const agora = agoraDoJogo(progresso);
    const r = aplicarEntrada(a, exec, entrada, { agora, conceitoDoEquivoco });
    atualizar((p, t) => aplicarEfeitos(iniciarAtividade(p, a.id, t), a, r.exec, r.efeitos, t));
    const pele = r.exec.bancada ? PELES[r.exec.bancada.atual.config.pele] : null;
    setAviso(avisoDe(r.efeitos, r.exec, pele));
    // Duas falhas com o mesmo equívoco, em atividades diferentes: o Nônio pede uma sondagem.
    if (SONDAGEM_ATIVA && a.tipo !== "sondagem") {
      const novas = r.efeitos.flatMap((e) => (e.tipo === "evidencias" ? e.lista : []));
      for (const ev of novas) {
        if (ev.resultado !== "falha" || !ev.equivoco) continue;
        const antes = situacaoConceito(ev.conceito, progresso.evidencias, agora);
        const depois = situacaoConceito(ev.conceito, [...progresso.evidencias, ...novas], agora);
        if (!antes.sondagemPendente && depois.sondagemPendente) setSondagem(ev.conceito);
      }
    }
    if (r.exec.indice !== exec.indice) {
      setCotaEscolhida(null);
      setNonioAberto(false);
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

  const atributos = {
    "data-pronto": "sim",
    "data-tela": "missao",
    "data-atividade": a.id,
    "data-modo": modo,
    "data-passo": passo.id,
    "data-fase": passo.fase,
    "data-situacao": exec.passo.situacao,
  };

  const aplicacao = passo.fase === "aplicacao";
  const tentativasParaOferecer = prefs.postura === "presente" ? 1 : 2;
  const ofereceAjuda =
    !aplicacao && prefs.postura !== "quieto" && exec.passo.situacao === "ativo" && exec.passo.ajuda < 3 && exec.passo.tentativas >= tentativasParaOferecer && passo.dicas !== undefined;

  const expressao: ExpressaoNonio = exec.passo.situacao === "vencido" ? "satisfeito" : exec.passo.ajuda >= 2 ? "medindo" : prefs.postura === "quieto" ? "quieto" : "atento";
  const temDicas = passo.dicas !== undefined && (exec.passo.situacao === "ativo" || exec.passo.situacao === "convite");
  const comentario = prefs.postura === "presente" && aviso?.equivoco ? aviso.texto : null;

  const cabecalho = (
    <CabecalhoLugar
      voltar={voltar}
      lugar={`${lugarDe(a, modo)} · ${NOME_DA_FASE[passo.fase]}`}
      titulo={a.titulo}
      direita={<BotaoNonio expressao={expressao} temDicas={temDicas} oferta={ofereceAjuda} onAbrir={() => setNonioAberto(true)} />}
    />
  );

  const pedido = (
    <>
      <span className="contador-passo" aria-label={`Passo ${exec.indice + 1} de ${total}`}>
        {exec.indice + 1}/{total}
      </span>
      <p className="m-0 min-w-0 flex-1 text-[15px] font-semibold leading-snug" data-pedido="">
        {passo.pedido}
      </p>
    </>
  );

  const origemDesvio = progresso.campanha.desvio?.destino === a.id ? atividadePorId(progresso.campanha.desvio.origem) : null;
  const avisosNonio =
    ofereceAjuda || comentario || sondagem || origemDesvio || a.categoria ? (
      <div className="flex flex-col gap-2.5">
        {(ofereceAjuda || comentario) && (
          <button type="button" className="block w-full text-left anima-esmaecer" onClick={() => setNonioAberto(true)} data-oferta-nonio="">
            <BalaoNonio texto={comentario ?? "Travou duas vezes. Quer uma medida?"} expressao={comentario ? "medindo" : "atento"} compacta />
          </button>
        )}
        {sondagem && (
          <Link href={`/partilha/sondagem?conceito=${encodeURIComponent(sondagem)}&origem=${encodeURIComponent(a.id)}`} className="block anima-esmaecer" data-convite-sondagem={sondagem}>
            <BalaoNonio texto="A mesma medida escapou duas vezes, em lugares diferentes. Posso conferir uma coisa? Uma pergunta só; depois você volta para cá." expressao="medindo" compacta />
          </Link>
        )}
        {origemDesvio && (
          <Link href={rotaDe(origemDesvio)} className="block rotate-[-0.6deg] rounded-md border-2 border-tinta bg-marca-texto px-3 py-2 text-[14px] font-semibold" data-desvio="">
            Desvio. Quando quiser, volte para {origemDesvio.titulo}: a máquina está como você deixou.
          </Link>
        )}
        {a.categoria && <CategoriaRua categoria={a.categoria} />}
      </div>
    ) : null;

  const painelNonio = (
    <PainelNonio
      aberto={nonioAberto}
      onFechar={() => setNonioAberto(false)}
      dicas={passo.dicas}
      ajuda={exec.passo.ajuda}
      medidas={{ ...medidasVivas(exec.bancada?.atual ?? null), feitas: String(exec.passo.solucoes.length) }}
      onPedir={() => enviar({ tipo: "dica" })}
      onJunto={() => {
        enviar({ tipo: "junto" });
        setNonioAberto(false);
      }}
      podeJunto={passo.tipo === "operar" || passo.tipo === "frase" || passo.tipo === "prever"}
      aplicacao={aplicacao}
    />
  );

  if (passo.tipo === "narrativa" || !exec.bancada) {
    const exposicao = a.tipo === "exposicao" && passo.tipo === "narrativa" && passo.faixas !== undefined;
    return (
      <>
        <TelaNarrativa atributos={atributos} cabecalho={cabecalho} pedido={pedido}>
          {avisosNonio}
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
          {passo.tipo === "registro" ? (
            <FolhaRegistro passo={passo} frase={Object.values(exec.frases).at(-1) ?? ""} onGuardar={() => enviar({ tipo: "seguir" })} />
          ) : passo.tipo === "palpite" ? (
            <div className="ficha p-4">
              <PainelPalpite passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} />
            </div>
          ) : (
            <Seguir rotulo={passo.tipo === "narrativa" ? (passo.botao ?? "Seguir") : "Seguir"} onClick={() => enviar({ tipo: "seguir" })} />
          )}
        </TelaNarrativa>
        {painelNonio}
      </>
    );
  }

  const bancada = exec.bancada;
  const pele = PELES[bancada.atual.config.pele];
  const ultimo = exec.passo.ultimo;
  const marcas: MarcasBancada = {
    aceita: exec.passo.situacao === "vencido" && bancada.atual.fechada,
    bicasAtencao: ultimo && !ultimo.ok && ultimo.medidas.bica ? [Number(ultimo.medidas.bica) - 1] : [],
    sobraAtencao: ultimo !== null && !ultimo.ok && ["ficou-carga", "sobra-da-mais-uma-volta", "sobra-pode-ser-cortada", "sobra-diferente", "sobra-nao-fecha"].includes(ultimo.motivo),
  };
  const msgEvento = mensagemDoEvento(bancada.atual, pele);
  const tira = aviso && aviso.seq === bancada.atual.seq ? { texto: aviso.texto, tom: aviso.tom } : msgEvento;
  const realce = exec.passo.ajuda >= 1 && exec.passo.situacao === "ativo" ? (passo.dicas?.[0].alvo ?? null) : null;
  const cotaDica = exec.passo.ajuda >= 2 && exec.passo.situacao === "ativo" ? passo.dicas?.[1].cota : undefined;
  const vivas = medidasVivas(bancada.atual);
  const cotaExtra = cotaDica ? { alvo: cotaDica.alvo, texto: textoComMedidas(cotaDica.texto, vivas) } : null;
  const formalizacao = passo.tipo === "frase" || passo.tipo === "notacao" || passo.tipo === "registro";
  const parada = formalizacao || passo.tipo === "palpite" || passo.tipo === "prever";

  const maquina = (
    <MaquinaDoPasso
      exec={exec}
      passo={passo}
      pele={pele}
      cotas={prefs.cotas === "visiveis" || exec.passo.ajuda >= 2}
      onAcao={parada || exec.passo.situacao === "vencido" ? undefined : (acao) => enviar({ tipo: "maquina", acao })}
      realce={realce}
      cotaExtra={cotaExtra}
      marcas={marcas}
    />
  );

  const conta =
    passo.tipo === "operar" && passo.conta ? (
      <div className="absolute left-3 top-3 z-10 quadro-notacao px-3 py-1" aria-label={`Conta a mostrar: ${passo.conta}`}>
        <LinhaNotacao texto={passo.conta} tamanho="pequena" rotulos={false} />
      </div>
    ) : null;

  let controles: React.ReactNode = null;
  let sobreposicao: React.ReactNode = null;

  if (passo.tipo === "palpite") {
    controles = <PainelPalpite passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} />;
  } else if (passo.tipo === "prever") {
    controles = (
      <PainelPreverComDemo exec={exec} passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} onSeguir={() => enviar({ tipo: "seguir" })} />
    );
  } else if (passo.tipo === "operar") {
    if (exec.passo.situacao === "vencido") {
      const palpiteId = Object.keys(exec.palpites).at(-1);
      controles = (
        <PainelVencido
          falas={passo.aoConcluir}
          palpite={palpiteId && exec.indice <= 3 && passosDoModo(a, modo).find((p) => p.id === palpiteId)?.tipo === "palpite" ? { valor: exec.palpites[palpiteId], certo: certoDoPalpite(a, palpiteId) } : null}
          convite={passo.convite && exec.passo.convite === null ? passo.convite.texto : null}
          onConvite={(aceitar) => enviar({ tipo: "convite", aceitar })}
          onSeguir={() => enviar({ tipo: "seguir" })}
          extra={exec.passo.convite === "feito" ? <p className="m-0 font-semibold"><span className="grifo">Numa volta só.</span> A máquina agradece.</p> : null}
        />
      );
    } else {
      const resolucao = resolucaoDoPasso(passo, exec);
      const proximaJunto = exec.passo.junto !== null ? resolucao[exec.passo.junto] : undefined;
      controles = (
        <div className="flex flex-col gap-3">
          {exec.passo.situacao === "convite" && passo.convite && <p className="m-0 font-bold"><span className="grifo">{passo.convite.texto}</span></p>}
          {exec.passo.solucoes.length > 0 && passo.objetivo.validador === "partilha.solucoes-distintas" && (
            <p className="m-0 font-semibold" data-solucoes={exec.passo.solucoes.length}>
              Jeitos aceitos: <span className="grifo font-extrabold">{exec.passo.solucoes.length} de {String(passo.objetivo.params?.n ?? 2)}</span>.
            </p>
          )}
          {proximaJunto && <Junto texto={descreverAcao(proximaJunto, pele)} onFazer={() => enviar({ tipo: "maquina", acao: proximaJunto })} />}
          {exec.passo.junto !== null && !proximaJunto && <Junto texto="Agora feche." onFazer={() => enviar({ tipo: "fechar" })} />}
          <PainelBancada
            estado={bancada.atual}
            pele={pele}
            onAcao={(acao) => enviar({ tipo: "maquina", acao })}
            onFechar={() => enviar({ tipo: "fechar" })}
            rotuloFechar={passo.rotuloFechar}
          />
        </div>
      );
    }
  } else if (passo.tipo === "frase") {
    sobreposicao = (
      <FolhaSobe>
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
        maquina={
          <>
            {conta}
            {maquina}
          </>
        }
        tira={!formalizacao ? <TiraMensagem texto={tira?.texto ?? null} tom={tira?.tom} /> : undefined}
        nonio={!formalizacao ? avisosNonio : undefined}
        controles={controles}
        sobreposicao={sobreposicao}
      />
      {painelNonio}
    </>
  );
}

function textoComMedidas(modelo: string, vivas: Record<string, string>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => vivas[k] ?? "");
}

function certoDoPalpite(a: Atividade, passoId: string): string {
  const p = a.passos.find((x) => x.id === passoId);
  return p && p.tipo === "palpite" ? p.certo : "";
}

function avisoDe(efeitos: readonly Efeito[], exec: Execucao, pele: Pele | null): Aviso | null {
  const seq = exec.bancada?.atual.seq ?? -1;
  const eq = efeitos.find((e): e is Extract<Efeito, { tipo: "equivoco" }> => e.tipo === "equivoco");
  if (eq) return { texto: textoDoEquivoco(eq.id, eq.medidas), tom: "atencao", seq, equivoco: true };
  const r = efeitos.find((e): e is Extract<Efeito, { tipo: "resultado" }> => e.tipo === "resultado");
  if (r && pele) {
    if (r.resultado.ok) return { texto: "Partilha fechada.", tom: "feito", seq, equivoco: false };
    return { texto: textoDoMotivo(r.resultado.motivo, r.resultado.medidas, pele), tom: r.resultado.parcial ? "feito" : "atencao", seq, equivoco: false };
  }
  return null;
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

function BotaoNonio({ expressao, temDicas, oferta, onAbrir }: { expressao: ExpressaoNonio; temDicas: boolean; oferta: boolean; onAbrir: () => void }) {
  return (
    <button
      type="button"
      className="botao-icone relative w-12"
      onClick={onAbrir}
      disabled={!temDicas}
      aria-label={temDicas ? "Pedir uma medida ao Nônio" : "Nônio (sem medida para este passo)"}
      data-acao="nonio"
    >
      <Nonio expressao={temDicas ? expressao : "quieto"} tamanho={34} rotulo="" pes={false} />
      {oferta && <span className="anima-oferta absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-tinta bg-marca-texto" aria-hidden="true" />}
    </button>
  );
}

function Junto({ texto, onFazer }: { texto: string; onFazer: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border-2 border-caneta bg-caneta-palida px-3 py-2" data-junto="">
      <span className="letra-mao shrink-0 text-[22px]">juntos</span>
      <span className="min-w-0 flex-1 text-[15px] font-semibold">{texto}</span>
      <button type="button" className="botao-secundario shrink-0" onClick={onFazer} data-acao="fazer-junto">
        Fazer
      </button>
    </div>
  );
}

/** A folha pautada sobe da borda de baixo, por cima da folha quadriculada. */
function FolhaSobe({ children }: { children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAberta(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className="folha-sobe" data-aberta={aberta ? "sim" : "nao"} data-dobra="">
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
}: {
  exec: Execucao;
  passo: Passo;
  pele: Pele;
  cotas: boolean;
  onAcao?: (a: AcaoBancada) => void;
  realce: AlvoMaquina | null;
  cotaExtra: { alvo: AlvoMaquina; texto: string } | null;
  marcas: MarcasBancada;
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
}: {
  exec: Execucao;
  passo: Extract<Passo, { tipo: "prever" }>;
  onResponder: (v: string | null) => void;
  onSeguir: () => void;
}) {
  const [pronto, setPronto] = useState(exec.passo.situacao !== "conferindo");
  const conferindo = exec.passo.situacao === "conferindo";
  useEffect(() => {
    if (!conferindo) return;
    const t = setTimeout(() => setPronto(true), 700 * (passo.demonstracao.length + 1));
    return () => clearTimeout(t);
  }, [conferindo, passo.demonstracao.length]);
  return <PainelPrever passo={passo} exec={exec} demonstrando={conferindo && !pronto} onResponder={onResponder} onSeguir={onSeguir} />;
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
