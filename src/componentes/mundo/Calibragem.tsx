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
import { Visor } from "@/componentes/maquinas/Visor";
import { mensagemDoEvento } from "@/componentes/maquinas/mensagens";
import { EntradaResposta } from "@/componentes/missao/Respostas";
import { Nonio } from "@/componentes/nonio/Nonio";
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
      <main data-pronto="sim" data-tela="calibragem" data-fase="convite" className="area-segura flex min-h-dvh flex-col items-center justify-center gap-5 py-8 text-center">
        <Nonio expressao="atento" tamanho={96} />
        <h1 className="fonte-sinal m-0 text-[2.1rem] font-extrabold uppercase text-latao-claro">Calibragem</h1>
        <p className="m-0 max-w-sm text-[1.1rem]">Antes de tudo, preciso saber em que marca você está.</p>
        <p className="m-0 max-w-sm text-texto-mundo-suave">Não é prova e não dá nota. São até seis medidas curtas, sem relógio. &ldquo;Não sei ainda&rdquo; é uma resposta que vale.</p>
        <div className="flex w-full max-w-sm flex-col gap-2">
          <button type="button" className="placa placa-cheia w-full" onClick={() => setFase("medindo")} data-acao="comecar-calibragem">
            Começar a calibragem
          </button>
          <button type="button" className="placa placa-discreta w-full" onClick={comecarDoComeco} data-acao="comecar-do-comeco">
            Começar do começo
          </button>
        </div>
      </main>
    );
  }

  if (fase === "resultado") return <ResultadoCalibragem estado={estado} />;

  const atributos = { "data-pronto": "sim", "data-tela": "calibragem", "data-fase": "medindo", "data-degrau": String(estado.atual) };
  const cabecalho = (
    <header className="area-segura flex flex-col gap-2 pb-2">
      <div className="flex items-center gap-3">
        <Nonio expressao="medindo" tamanho={36} />
        <div className="flex-1">
          <p className="rotulo-chapa m-0 text-[0.78rem]">Calibragem · medida {estado.respostas.length + 1}</p>
          <Regua atual={estado.atual} />
        </div>
        <button type="button" className="placa placa-pequena placa-discreta" onClick={comecarDoComeco} data-acao="comecar-do-comeco">
          Do começo
        </button>
      </div>
      <p className="m-0 rounded-md border border-noite-borda bg-noite-funda px-2.5 py-1.5 text-[0.98rem]" data-pedido="">
        {item.pedido}
      </p>
    </header>
  );

  const controlesAnotado = anotado !== null && (
    <div className="flex flex-col gap-3" role="status" data-anotado={anotado}>
      <p className="m-0 text-[1.05rem]">{anotado === "sucesso" ? "Marcado." : anotado === "nao_sei" ? "Anotado: ainda não. Vale." : "Anotado."}</p>
      <button type="button" className="placa placa-cheia w-full" onClick={seguir} data-acao="seguir">
        Seguir
      </button>
    </div>
  );

  if (item.tipo === "resposta" && !item.maquina) {
    return (
      <main {...atributos} className="flex min-h-dvh flex-col area-segura-topo">
        {cabecalho}
        <div className="area-segura mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-5 py-4 area-segura-base">
          <p className="m-0 text-[1.05rem]">{item.fala}</p>
          {item.figura && <FiguraMedidas {...item.figura} />}
          {controlesAnotado || (
            <EntradaResposta
              tipo={item.resposta}
              onResponder={(v) => responder(resultadoResposta(item, v))}
              rotuloConferir="Pronto"
            />
          )}
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
      topo={cabecalho}
      maquina={<Bancada estado={b.atual} pele={pele} onAcao={item.tipo === "maquina" && anotado === null ? (a) => setBancada(operar(b, a)) : undefined} />}
      visor={<Visor texto={msg?.texto ?? item.fala} tom={msg?.tom} />}
      controles={
        controlesAnotado ||
        (item.tipo === "maquina" ? (
          <PainelBancada
            estado={b.atual}
            pele={pele}
            onAcao={(a) => setBancada(operar(b, a))}
            onFechar={() => responder(validarBancada(item.objetivo.validador, item.objetivo.params ?? {}, b.atual).ok ? "sucesso" : "falha")}
            rotuloFechar="Pronto"
            extra={
              <button type="button" className="placa placa-pequena placa-discreta ml-auto" onClick={() => responder("nao_sei")} data-acao="nao-sei">
                Não sei ainda
              </button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="m-0">{item.fala}</p>
            <EntradaResposta tipo={item.resposta} onResponder={(v) => responder(resultadoResposta(item, v))} rotuloConferir="Pronto" />
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

/** Régua de seis marcas; o cursor do Nônio mostra o degrau medido agora. */
function Regua({ atual }: { atual: number }) {
  return (
    <svg viewBox="0 0 160 22" className="block h-6 w-full max-w-[220px]" role="img" aria-label={`Marca ${atual} de 6`}>
      <rect x="2" y="12" width="156" height="6" rx="1.5" fill="var(--latao)" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1={14 + i * 26.4} x2={14 + i * 26.4} y1="12" y2="16" stroke="var(--latao-sombra)" strokeWidth="1.4" />
      ))}
      <g style={{ transform: `translateX(${(atual - 1) * 26.4}px)`, transition: "transform var(--t-assentar) var(--curva-mecanica)" }}>
        <path d="M 8 2 L 20 2 L 20 11 L 14 16 L 8 11 Z" fill="var(--turquesa)" />
        <circle cx="14" cy="7" r="2.2" fill="var(--noite-funda)" />
      </g>
    </svg>
  );
}

/** Desenho simples das medidas: 2 de farinha para 3 de água; com 6 de farinha, quantas de água? */
function FiguraMedidas({ a, b, rotuloA, rotuloB, dadoA }: { a: number; b: number; rotuloA: string; rotuloB: string; dadoA: number }) {
  const copo = (x: number, y: number, cor: string, chave: string) => (
    <g key={chave}>
      <path d={`M ${x} ${y} L ${x + 16} ${y} L ${x + 14} ${y + 20} L ${x + 2} ${y + 20} Z`} fill={cor} stroke="var(--latao-sombra)" strokeWidth="1" />
    </g>
  );
  return (
    <svg viewBox="0 0 300 150" className="w-full max-w-md" role="img" aria-label={`Receita: ${a} medidas de ${rotuloA} para ${b} de ${rotuloB}. Agora, ${dadoA} de ${rotuloA}.`}>
      <text x="8" y="16" fontSize="11" fill="var(--texto-mundo-suave)">receita</text>
      {Array.from({ length: a }, (_, i) => copo(10 + i * 20, 24, "var(--miolo)", `a${i}`))}
      {Array.from({ length: b }, (_, i) => copo(70 + i * 20, 24, "var(--agua)", `b${i}`))}
      <text x="10" y="60" fontSize="10" fill="var(--texto-mundo-suave)">{rotuloA}</text>
      <text x="70" y="60" fontSize="10" fill="var(--texto-mundo-suave)">{rotuloB}</text>
      <line x1="8" x2="292" y1="72" y2="72" stroke="var(--noite-borda)" />
      <text x="8" y="90" fontSize="11" fill="var(--texto-mundo-suave)">hoje</text>
      {Array.from({ length: dadoA }, (_, i) => copo(10 + i * 20, 98, "var(--miolo)", `c${i}`))}
      <g>
        <rect x="140" y="98" width="150" height="22" rx="4" fill="none" stroke="var(--turquesa)" strokeDasharray="4 3" />
        <text x="215" y="113" textAnchor="middle" fontSize="11" fill="var(--turquesa-clara)">{`quantas de ${rotuloB}?`}</text>
      </g>
    </svg>
  );
}

function ResultadoCalibragem({ estado }: { estado: EstadoCalibragem }) {
  const r = resultadoCalibragem(estado.respostas, REGRAS_CALIBRAGEM);
  const rec = r.recomendacao ? atividadePorId(r.recomendacao) : null;
  const primeira = atividadePorId(REGRAS_CALIBRAGEM.recomendacoes[0].atividade);
  return (
    <main data-pronto="sim" data-tela="calibragem" data-fase="resultado" data-maior-degrau={r.maiorDegrau} className="area-segura flex min-h-dvh flex-col items-center justify-center gap-4 py-8 text-center">
      <Nonio expressao="satisfeito" tamanho={84} />
      <h1 className="fonte-sinal m-0 text-[1.9rem] font-extrabold uppercase text-latao-claro">Marca anotada</h1>
      {rec && rec.numero !== undefined && rec.numero > 1 ? (
        <p className="m-0 max-w-sm text-[1.1rem]">
          Você pode começar pela missão {rec.numero}: {rec.titulo}. As anteriores ficam com prova direta, para atravessar rápido.
        </p>
      ) : (
        <p className="m-0 max-w-sm text-[1.1rem]">O melhor ponto de partida é a missão 1: {primeira?.titulo}.</p>
      )}
      {r.alemDoArco && (
        <p className="m-0 max-w-sm text-texto-mundo-suave">
          Você mostrou mais do que este trecho cobre. O arco tem provas diretas para atravessar rápido; os distritos seguintes ainda estão em projeto.
        </p>
      )}
      <div className="flex w-full max-w-sm flex-col gap-2">
        {rec && (
          <Link href={rotaDe(rec)} className="placa placa-cheia w-full" data-acao="comecar-recomendado">
            {rec.numero === 1 ? "Começar a missão 1" : `Começar pela missão ${rec.numero}`}
          </Link>
        )}
        {primeira && rec?.id !== primeira.id && (
          <Link href={rotaDe(primeira)} className="placa w-full" data-acao="comecar-do-comeco">
            Começar do começo
          </Link>
        )}
        <Link href="/mapa" className="placa placa-discreta w-full" data-acao="ver-mapa">
          Ver o mapa do Engenho
        </Link>
      </div>
    </main>
  );
}
