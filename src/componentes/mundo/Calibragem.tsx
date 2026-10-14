"use client";

/**
 * Calibragem: o Nônio precisa saber em que marca você está. Não é prova e não dá nota.
 * Até seis interações curtas, sem tempo, com "não sei ainda" sempre à mão.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  iniciarCalibragem,
  responderCalibragem,
  resultadoCalibragem,
  type EstadoCalibragem,
  type ItemCalibragem,
} from "@/nucleo/calibragem/calibragem";
import { criarBancada, operar } from "@/nucleo/maquinas/bancada/bancada";
import type { Bancada as EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import { validarBancada } from "@/nucleo/maquinas/bancada/validadores";
import type { Evidencia, ResultadoEvidencia } from "@/nucleo/dominio/evidencias";
import { conferirResposta } from "@/nucleo/missoes/respostas";
import { comoRacional } from "@/nucleo/racional/racional";
import { registrarEvidencias, salvarCalibragem } from "@/nucleo/progresso";
import { ITENS_CALIBRAGEM, REGRAS_CALIBRAGEM } from "@/conteudo/calibragem";
import { PELES } from "@/conteudo/peles";
import { atividadePorId, rotaDe } from "@/componentes/estado/catalogo";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { PainelBancada } from "@/componentes/maquinas/PainelBancada";
import { Palco } from "@/componentes/maquinas/Palco";
import { FaixaNonio } from "@/componentes/nonio/FaixaNonio";
import { mensagemDoEvento } from "@/componentes/maquinas/mensagens";
import { EntradaResposta } from "@/componentes/missao/Respostas";
import { Nonio } from "@/componentes/nonio/Nonio";
import { Objetivo } from "@/componentes/missao/Objetivo";
import { Carregando } from "@/componentes/ui/Carregando";

type Fase = "convite" | "medindo" | "resultado";

export function Calibragem() {
  const { pronto, atualizar } = useProgresso();
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("convite");
  const [estado, setEstado] = useState<EstadoCalibragem>(iniciarCalibragem);
  const [bancada, setBancada] = useState<EstadoBancada | null>(() => maquinaDo(ITENS_CALIBRAGEM[2]));
  const [anotado, setAnotado] = useState<ResultadoEvidencia | null>(null);

  if (!pronto) return <Carregando />;

  const item = ITENS_CALIBRAGEM[estado.atual - 1];

  const comecarDoComeco = () => {
    atualizar((p, agora) =>
      salvarCalibragem(p, { feitaEm: agora, pulada: true, respostas: [], maiorDegrau: 0, provaveis: [], recomendacao: REGRAS_CALIBRAGEM.recomendacoes[0].atividade }, agora),
    );
    router.push("/mapa");
  };

  const responder = (resultado: ResultadoEvidencia) => {
    setAnotado(resultado);
  };

  const seguir = () => {
    if (anotado === null) return;
    const novo = responderCalibragem(estado, anotado);
    setAnotado(null);
    setEstado(novo);
    if (novo.terminou) {
      const r = resultadoCalibragem(novo.respostas, REGRAS_CALIBRAGEM);
      atualizar((p, agora) => {
        const evs: Evidencia[] = novo.respostas.map((x, i) => ({
          conceito: ITENS_CALIBRAGEM[x.degrau - 1].conceito,
          tipo: "calibragem",
          resultado: x.resultado,
          ajuda: 0,
          contexto: "calibragem",
          momento: agora + i,
        }));
        return salvarCalibragem(
          registrarEvidencias(p, evs, agora),
          { feitaEm: agora, pulada: false, respostas: novo.respostas, maiorDegrau: r.maiorDegrau, provaveis: r.provaveis, recomendacao: r.recomendacao },
          agora,
        );
      });
      setFase("resultado");
    } else {
      setBancada(maquinaDo(ITENS_CALIBRAGEM[novo.atual - 1]));
    }
  };

  if (fase === "convite") {
    return (
      <main data-pronto="sim" data-tela="calibragem" data-fase="convite" className="area-segura flex min-h-dvh flex-col items-center justify-center py-8">
        <section className="ficha flex w-full max-w-[420px] flex-col items-center gap-4 px-5 pb-6 pt-6 text-center">
          <Nonio expressao="atento" tamanho={110} />
          <h1 className="m-0 text-[26px] font-extrabold leading-tight">Calibragem</h1>
          <p className="m-0 text-[17px] font-semibold">Antes de tudo, preciso saber em que marca você está.</p>
          <p className="m-0 text-[15px] font-medium text-tinta-suave">Não é prova e não dá nota. São até seis medidas curtas, sem relógio. &ldquo;Não sei ainda&rdquo; é uma resposta que vale.</p>
          <div className="mt-1 flex w-full flex-col gap-2.5">
            <button type="button" className="botao-principal w-full" onClick={() => setFase("medindo")} data-acao="comecar-calibragem">
              Começar a calibragem
            </button>
            <button type="button" className="botao-secundario w-full" onClick={comecarDoComeco} data-acao="comecar-do-comeco">
              Começar do começo
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (fase === "resultado") return <ResultadoCalibragem estado={estado} />;

  const atributos = { "data-pronto": "sim", "data-tela": "calibragem", "data-fase": "medindo", "data-degrau": String(estado.atual) };
  const cabecalho = (
    <header className="cabecalho area-segura">
      <Nonio expressao="medindo" tamanho={44} rotulo="" pes={false} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="m-0 text-[12px] font-semibold text-tinta-suave">Calibragem · medida {estado.respostas.length + 1}</p>
        <Regua atual={estado.atual} />
      </div>
      <button type="button" className="botao-discreto shrink-0" onClick={comecarDoComeco} data-acao="comecar-do-comeco">
        Do começo
      </button>
    </header>
  );
  // Instrução com verbo, sem gesto nem escada: a calibragem mede, não ensina.
  const pedido = <Objetivo etiqueta="Medida" instrucao={item.instrucao} gesto={null} />;

  const controlesAnotado = anotado !== null && (
    <div className="flex flex-col gap-3" role="status" data-anotado={anotado}>
      <p className="m-0 text-[17px] font-bold">{anotado === "sucesso" ? <span className="grifo">Marcado.</span> : anotado === "nao_sei" ? "Anotado: ainda não. Vale." : "Anotado."}</p>
      <button type="button" className="botao-principal w-full" onClick={seguir} data-acao="seguir">
        Seguir
      </button>
    </div>
  );

  if (item.tipo === "resposta" && !item.maquina) {
    return (
      <main {...atributos} className="flex min-h-dvh flex-col">
        {cabecalho}
        <div className="palco-pedido">{pedido}</div>
        <div className="area-segura area-segura-base mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center gap-5 py-6">
          <section className="ficha flex flex-col gap-4 p-4">
            <p className="m-0 text-[16px] font-medium">{item.fala}</p>
            {item.figura && (
              <div className="ficha-quadriculada p-2 shadow-none">
                <FiguraMedidas {...item.figura} />
              </div>
            )}
            {controlesAnotado || <EntradaResposta tipo={item.resposta} onResponder={(v) => responder(resultadoResposta(item, v))} rotuloConferir="Responder" />}
          </section>
        </div>
      </main>
    );
  }

  const b = bancada ?? maquinaDo(item);
  if (!b) return <Carregando />;
  const pele = PELES[b.atual.config.pele];
  const msg = mensagemDoEvento(b.atual, pele);

  return (
    <Palco
      atributos={atributos}
      cabecalho={cabecalho}
      pedido={pedido}
      maquina={<Bancada estado={b.atual} pele={pele} onAcao={item.tipo === "maquina" && anotado === null ? (a) => setBancada(operar(b, a)) : undefined} />}
      faixa={<FaixaNonio fala={{ id: "leitura", texto: msg?.texto ?? item.fala, categoria: "evento", atencao: msg?.tom === "atencao" }} selo={null} retorno="neutro" expressao="quieto" compacta />}
      controles={
        controlesAnotado ||
        (item.tipo === "maquina" ? (
          <PainelBancada
            estado={b.atual}
            pele={pele}
            onAcao={(a) => setBancada(operar(b, a))}
            onFechar={() => responder(validarBancada(item.objetivo.validador, item.objetivo.params ?? {}, b.atual).ok ? "sucesso" : "falha")}
            rotuloFechar="Fechar a partilha"
            extra={
              <button type="button" className="botao-secundario w-full" onClick={() => responder("nao_sei")} data-acao="nao-sei">
                Não sei ainda
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="m-0 text-[16px] font-medium">{item.fala}</p>
            <EntradaResposta tipo={item.resposta} onResponder={(v) => responder(resultadoResposta(item, v))} rotuloConferir="Responder" />
          </div>
        ))
      }
    />
  );
}

function maquinaDo(item: ItemCalibragem | undefined): EstadoBancada | null {
  if (!item || !item.maquina) return null;
  return criarBancada(item.maquina);
}

function resultadoResposta(item: Extract<ItemCalibragem, { tipo: "resposta" }>, valor: string | null): ResultadoEvidencia {
  const c = conferirResposta(valor, comoRacional(item.esperado), { aceitaEquivalente: item.aceitaEquivalente ?? true });
  return c.naoSei ? "nao_sei" : c.certa ? "sucesso" : "falha";
}

/** Seis degraus: os já medidos a tinta, o atual a caneta, os de depois a lápis. */
function Regua({ atual }: { atual: number }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Marca ${atual} de 6`}>
      {Array.from({ length: 6 }, (_, i) => {
        const d = i + 1;
        const cor = d === atual ? "border-contorno bg-caneta" : d < atual ? "border-contorno bg-tinta" : "border-grafite border-dashed bg-folha";
        return <span key={d} className={`block h-2.5 w-6 rounded-full border-2 ${cor}`} />;
      })}
    </div>
  );
}

/** Desenho simples das medidas: 2 de farinha para 3 de água; com 6 de farinha, quantas de água? */
function FiguraMedidas({ a, b, rotuloA, rotuloB, dadoA }: { a: number; b: number; rotuloA: string; rotuloB: string; dadoA: number }) {
  const copo = (x: number, y: number, cor: string, chave: string) => (
    <path key={chave} d={`M ${x} ${y} L ${x + 16} ${y} L ${x + 14} ${y + 20} L ${x + 2} ${y + 20} Z`} fill={cor} stroke="var(--contorno)" strokeWidth={2} strokeLinejoin="round" />
  );
  return (
    <svg viewBox="0 0 300 150" className="block w-full max-w-md" role="img" aria-label={`Receita: ${a} medidas de ${rotuloA} para ${b} de ${rotuloB}. Agora, ${dadoA} de ${rotuloA}.`}>
      <text x="8" y="16" fontSize="12" fontWeight={600} fill="var(--tinta-suave)">receita</text>
      {Array.from({ length: a }, (_, i) => copo(10 + i * 20, 24, "var(--pao-miolo)", `a${i}`))}
      {Array.from({ length: b }, (_, i) => copo(70 + i * 20, 24, "var(--agua)", `b${i}`))}
      <text x="10" y="62" fontSize="12" fontWeight={600} fill="var(--tinta)">{rotuloA}</text>
      <text x="70" y="62" fontSize="12" fontWeight={600} fill="var(--tinta)">{rotuloB}</text>
      <line x1="8" x2="292" y1="74" y2="74" stroke="var(--contorno)" strokeWidth={1.6} />
      <text x="8" y="92" fontSize="12" fontWeight={600} fill="var(--tinta-suave)">hoje</text>
      {Array.from({ length: dadoA }, (_, i) => copo(10 + i * 20, 100, "var(--pao-miolo)", `c${i}`))}
      <rect x="140" y="99" width="152" height="24" rx="6" fill="var(--folha)" stroke="var(--caneta)" strokeWidth={2} strokeDasharray="5 4" />
      <text x="216" y="115" textAnchor="middle" fontSize="12.5" fontWeight={700} fill="var(--caneta)">{`quantas de ${rotuloB}?`}</text>
    </svg>
  );
}

function ResultadoCalibragem({ estado }: { estado: EstadoCalibragem }) {
  const r = resultadoCalibragem(estado.respostas, REGRAS_CALIBRAGEM);
  const rec = r.recomendacao ? atividadePorId(r.recomendacao) : null;
  const primeira = atividadePorId(REGRAS_CALIBRAGEM.recomendacoes[0].atividade);
  return (
    <main data-pronto="sim" data-tela="calibragem" data-fase="resultado" data-maior-degrau={r.maiorDegrau} className="area-segura flex min-h-dvh flex-col items-center justify-center py-8">
      <section className="ficha flex w-full max-w-[420px] flex-col items-center gap-4 px-5 pb-6 pt-6 text-center">
        <Nonio expressao="satisfeito" tamanho={110} />
        <h1 className="m-0 text-[26px] font-extrabold leading-tight">Marca anotada</h1>
        {rec && rec.numero !== undefined && rec.numero > 1 ? (
          <p className="m-0 text-[17px] font-medium leading-[1.5]">
            Você pode começar pela{" "}
            <span className="grifo font-bold">
              missão {rec.numero}: {rec.titulo}
            </span>
            . As anteriores ficam com prova direta, para atravessar rápido.
          </p>
        ) : (
          <p className="m-0 text-[17px] font-medium leading-[1.5]">
            O melhor ponto de partida é a <span className="grifo font-bold">missão 1: {primeira?.titulo}</span>.
          </p>
        )}
        {r.alemDoArco && (
          <p className="m-0 text-[15px] font-medium text-tinta-suave">
            Você mostrou mais do que este trecho cobre. O arco tem provas diretas para atravessar rápido; os distritos seguintes ainda estão a lápis.
          </p>
        )}
        <div className="mt-1 flex w-full flex-col gap-2.5">
          {rec && (
            <Link href={rotaDe(rec)} className="botao-principal w-full" data-acao="comecar-recomendado">
              {rec.numero === 1 ? "Começar a missão 1" : `Começar pela missão ${rec.numero}`}
            </Link>
          )}
          {primeira && rec?.id !== primeira.id && (
            <Link href={rotaDe(primeira)} className="botao-secundario w-full" data-acao="comecar-do-comeco">
              Começar do começo
            </Link>
          )}
          <Link href="/mapa" className="botao-secundario w-full" data-acao="ver-mapa">
            Ver o mapa do Engenho
          </Link>
        </div>
      </section>
    </main>
  );
}
