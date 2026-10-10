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
import type { AlvoMaquina, Atividade, Entrada, ModoExecucao, Passo } from "@/nucleo/missoes/tipos";
import { iniciarAtividade } from "@/nucleo/progresso";
import { PELES, type Pele } from "@/conteudo/peles";
import { Bancada, type MarcasBancada } from "@/componentes/maquinas/Bancada";
import { PainelBancada } from "@/componentes/maquinas/PainelBancada";
import { Palco } from "@/componentes/maquinas/Palco";
import { Visor } from "@/componentes/maquinas/Visor";
import { mensagemDoEvento, type TomVisor } from "@/componentes/maquinas/mensagens";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";
import { PainelNonio } from "@/componentes/nonio/PainelNonio";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { atividadePorId, conceitoDoEquivoco, proximaMissao, rotaDe, textoDoEquivoco, textoDoMotivo } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { Falas } from "./Falas";
import { ManualRasgado } from "./Manual";
import { descreverAcao, NOME_DA_FASE } from "./textos";
import { FolhaFrase, FolhaNotacao, FolhaRegistro, PainelPalpite, PainelPrever, PainelVencido, Seguir } from "./Vistas";

interface Aviso {
  texto: string;
  tom: TomVisor;
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
  if (!a) return <p className="p-6">Atividade não encontrada.</p>;
  return <ExecutorDe key={`${a.id}#${modo}`} a={a} modo={modo} voltar={voltar} />;
}

function ExecutorDe({ a, modo, voltar }: { a: Atividade; modo: ModoExecucao; voltar: { href: string; rotulo: string } }) {
  const { pronto, progresso, atualizar } = useProgresso();
  const [fim, setFim] = useState<Fim | null>(null);
  const [nonioAberto, setNonioAberto] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [cotaEscolhida, setCotaEscolhida] = useState<string | null>(null);
  const [comprimida, setComprimida] = useState<string | null>(null);

  if (!pronto) return <Carregando />;
  if (fim) return <TelaFim a={a} fim={fim} voltar={voltar} />;

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

  const cabecalho = (
    <Cabecalho
      a={a}
      modo={modo}
      passo={passo}
      indice={exec.indice}
      total={total}
      voltar={voltar}
      expressao={exec.passo.situacao === "vencido" ? "satisfeito" : exec.passo.ajuda >= 2 ? "medindo" : prefs.postura === "quieto" ? "quieto" : "atento"}
      onNonio={() => setNonioAberto(true)}
      temDicas={passo.dicas !== undefined && (exec.passo.situacao === "ativo" || exec.passo.situacao === "convite")}
      oferta={ofereceAjuda}
      comentario={prefs.postura === "presente" && aviso?.equivoco ? aviso.texto : null}
    />
  );

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
    return (
      <TelaNarrativa atributos={atributos} cabecalho={cabecalho}>
        {passo.tipo === "narrativa" && passo.manual && <ManualRasgado titulo={passo.manual.titulo} linhas={passo.manual.linhas} />}
        {passo.falas && <Falas falas={passo.falas} />}
        {passo.tipo === "registro" ? (
          <FolhaRegistro passo={passo} frase={Object.values(exec.frases).at(-1) ?? ""} onGuardar={() => enviar({ tipo: "seguir" })} />
        ) : passo.tipo === "palpite" ? (
          <PainelPalpite passo={passo} onResponder={(v) => enviar({ tipo: "responder", valor: v })} />
        ) : (
          <Seguir rotulo={passo.tipo === "narrativa" ? (passo.botao ?? "Seguir") : "Seguir"} onClick={() => enviar({ tipo: "seguir" })} />
        )}
      </TelaNarrativa>
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
  const visor = aviso && aviso.seq === bancada.atual.seq ? { texto: aviso.texto, tom: aviso.tom } : msgEvento;
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

  const topo = (
    <>
      {cabecalho}
      {passo.tipo === "operar" && passo.conta && (
        <div className="area-segura flex justify-center pb-1">
          <div className="papel-liso rounded-md px-3 py-1 shadow" aria-label={`Conta a mostrar: ${passo.conta}`}>
            <LinhaNotacao texto={passo.conta} tamanho="pequena" rotulos={false} />
          </div>
        </div>
      )}
    </>
  );

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
          extra={exec.passo.convite === "feito" ? <p className="m-0 text-ambar">Numa volta só. A alavanca agradece.</p> : null}
        />
      );
    } else {
      const resolucao = resolucaoDoPasso(passo, exec);
      const proximaJunto = exec.passo.junto !== null ? resolucao[exec.passo.junto] : undefined;
      controles = (
        <div className="flex flex-col gap-3">
          {exec.passo.situacao === "convite" && passo.convite && <p className="m-0 font-semibold text-ambar">{passo.convite.texto}</p>}
          {exec.passo.solucoes.length > 0 && passo.objetivo.validador === "partilha.solucoes-distintas" && (
            <p className="m-0 text-ambar" data-solucoes={exec.passo.solucoes.length}>
              Jeitos aceitos: {exec.passo.solucoes.length} de {String(passo.objetivo.params?.n ?? 2)}.
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
      <Dobra>
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
      </Dobra>
    );
  } else if (passo.tipo === "notacao") {
    const frase = Object.values(exec.frases).at(-1) ?? "";
    sobreposicao = (
      <Dobra>
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
      </Dobra>
    );
  } else if (passo.tipo === "registro") {
    sobreposicao = (
      <Dobra>
        <FolhaRegistro passo={passo} frase={Object.values(exec.frases).at(-1) ?? ""} onGuardar={() => enviar({ tipo: "seguir" })} />
      </Dobra>
    );
  }

  return (
    <>
      <Palco
        atributos={atributos}
        topo={topo}
        maquina={maquina}
        visor={!formalizacao ? <Visor texto={visor?.texto ?? null} tom={visor?.tom} /> : undefined}
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
    if (r.resultado.ok) return { texto: "Partilha fechada.", tom: "ambar", seq, equivoco: false };
    return { texto: textoDoMotivo(r.resultado.motivo, r.resultado.medidas, pele), tom: r.resultado.parcial ? "ambar" : "atencao", seq, equivoco: false };
  }
  return null;
}

/* ---------- Peças da tela ---------- */

function Cabecalho({
  a,
  modo,
  passo,
  indice,
  total,
  voltar,
  expressao,
  onNonio,
  temDicas,
  oferta,
  comentario,
}: {
  a: Atividade;
  modo: ModoExecucao;
  passo: Passo;
  indice: number;
  total: number;
  voltar: { href: string; rotulo: string };
  expressao: ExpressaoNonio;
  onNonio: () => void;
  temDicas: boolean;
  oferta: boolean;
  comentario: string | null;
}) {
  const rotuloModo = modo === "prova" ? "Prova direta" : modo === "registro" ? "Registro" : a.tipo === "missao" ? `Missão ${a.numero}` : "";
  return (
    <header className="area-segura relative flex flex-col gap-1.5 pb-1.5">
      <div className="flex items-center gap-2">
        <Link href={voltar.href} className="placa placa-pequena placa-discreta shrink-0 px-2.5" aria-label={`Voltar para ${voltar.rotulo}`} data-acao="voltar">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M 10 3 L 5 8 L 10 13" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">{voltar.rotulo}</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="rotulo-chapa m-0 truncate text-[0.78rem]">
            {rotuloModo} · {NOME_DA_FASE[passo.fase]}
          </p>
          <h1 className="fonte-sinal m-0 truncate text-[1.35rem] font-bold uppercase leading-tight text-texto-mundo">{a.titulo}</h1>
        </div>
        <Lampadas indice={indice} total={total} />
        <button
          type="button"
          className={`relative shrink-0 rounded-full border-2 p-0.5 ${temDicas ? "border-turquesa" : "border-noite-borda"}`}
          onClick={onNonio}
          disabled={!temDicas}
          aria-label={temDicas ? "Chamar o Nônio" : "Nônio (sem medida para este passo)"}
          data-acao="nonio"
        >
          <Nonio expressao={expressao} tamanho={34} rotulo="" />
          {oferta && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-turquesa-clara piloto" aria-hidden="true" />}
        </button>
      </div>
      <p className="m-0 rounded-md border border-noite-borda bg-noite-funda px-2.5 py-1.5 text-[0.98rem] leading-snug text-texto-mundo" data-pedido="">
        {passo.pedido}
      </p>
      {(oferta || comentario) && (
        <button type="button" className="flex items-start gap-2 rounded-md border border-turquesa-sombra bg-noite-clara px-2.5 py-1.5 text-left text-[0.92rem] text-texto-mundo-suave anima-esmaecer" onClick={onNonio} data-oferta-nonio="">
          <span className="rotulo-chapa shrink-0 text-[0.74rem]">Nônio</span>
          <span>{comentario ?? "Travou duas vezes. Quer uma medida?"}</span>
        </button>
      )}
    </header>
  );
}

function Lampadas({ indice, total }: { indice: number; total: number }) {
  return (
    <div className="flex shrink-0 items-center gap-[3px]" role="img" aria-label={`Passo ${indice + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`block h-1.5 w-1.5 rounded-full ${i < indice ? "bg-ambar" : i === indice ? "bg-turquesa-clara" : "bg-noite-borda"}`} />
      ))}
    </div>
  );
}

function Junto({ texto, onFazer }: { texto: string; onFazer: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-turquesa bg-noite-funda px-3 py-2" data-junto="">
      <span className="rotulo-chapa shrink-0 text-[0.74rem]">Juntos</span>
      <span className="flex-1 text-[0.95rem]">{texto}</span>
      <button type="button" className="placa placa-pequena" onClick={onFazer} data-acao="fazer-junto">
        Fazer
      </button>
    </div>
  );
}

function Dobra({ children }: { children: React.ReactNode }) {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAberta(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className="dobra" data-aberta={aberta ? "sim" : "nao"}>
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

function TelaNarrativa({ atributos, cabecalho, children }: { atributos: Record<string, string>; cabecalho: React.ReactNode; children: React.ReactNode }) {
  return (
    <main {...atributos} className="flex min-h-dvh flex-col area-segura-topo">
      {cabecalho}
      <div className="area-segura mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-5 py-6 area-segura-base">{children}</div>
    </main>
  );
}

function TelaFim({ a, fim, voltar }: { a: Atividade; fim: Fim; voltar: { href: string; rotulo: string } }) {
  const prox = fim.via !== "registro" ? proximaMissao(a) : null;
  return (
    <main data-pronto="sim" data-tela="fim" data-atividade={a.id} className="area-segura flex min-h-dvh flex-col items-center justify-center gap-5 py-8 text-center">
      <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill="var(--ambar-halo)" className="anima-esmaecer" />
        <circle cx="40" cy="40" r="16" fill="var(--ambar)" />
        <circle cx="35" cy="35" r="4" fill="var(--texto-mundo)" opacity="0.7" />
      </svg>
      <h1 className="fonte-sinal m-0 text-[2rem] font-extrabold uppercase text-ambar">
        {fim.via === "registro" ? "Página guardada" : a.tipo === "missao" ? "Missão concluída" : "Feito"}
      </h1>
      <p className="m-0 max-w-sm text-texto-mundo-suave">
        {fim.via === "prova"
          ? "Prova direta vencida. O registro no Caderno fica à sua espera, quando quiser."
          : fim.pagina
            ? "A página ficou no Caderno, com a sua letra e a da Dália."
            : "Fica registrado."}
      </p>
      {fim.joia && (
        <p className="m-0 max-w-sm text-ambar" data-joia-encontrada={fim.joia}>
          A Joia do Ábaco foi para o primeiro engaste do Relicário. Ainda bruta.
        </p>
      )}
      <div className="flex w-full max-w-sm flex-col gap-2">
        {prox && (
          <Link href={rotaDe(prox)} className="placa placa-cheia w-full" data-acao="proxima">
            Missão {prox.numero}: {prox.titulo}
          </Link>
        )}
        {fim.pagina && (
          <Link href="/caderno" className="placa w-full">
            Abrir o Caderno
          </Link>
        )}
        {fim.joia && (
          <Link href="/relicario" className="placa w-full">
            Ver o Relicário
          </Link>
        )}
        <Link href={voltar.href} className={`placa w-full ${prox ? "placa-discreta" : "placa-cheia"}`} data-acao="voltar">
          {voltar.rotulo}
        </Link>
      </div>
    </main>
  );
}

