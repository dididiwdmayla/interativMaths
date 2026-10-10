"use client";

/**
 * O interior de A Partilha: uma linha de esteira com as cinco missões como estações.
 * Cada estação mostra o estado e oferece a prova direta quando a calibragem a liberou.
 */
import Link from "next/link";
import { concluida, ecoDisponivel, revisitaDisponivel, situacaoMissoes, sondagensPendentes, type SituacaoMissao } from "@/nucleo/campanha/campanha";
import { REGRAS_CALIBRAGEM } from "@/conteudo/calibragem";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { ATIVIDADES } from "@/conteudo/atividades";
import { rotaDe, SONDAGEM_ATIVA } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Lampada } from "@/componentes/mundo/kit";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";

const M4 = "partilha.arco1.pao-nao-e-saca";

export function Distrito() {
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const estacoes = situacaoMissoes(progresso, MISSOES_ARCO_1, REGRAS_CALIBRAGEM);
  const chamados: { id: string; titulo: string; linha: string; href: string }[] = [];
  const revisita = ATIVIDADES.find((a) => a.id === "partilha.arco1.revisita");
  const devidas = revisitaDisponivel(progresso, CONCEITOS_DO_ARCO_1, agora);
  if (revisita && devidas.length > 0) {
    chamados.push({ id: "revisita", titulo: "Revisita do Nônio", linha: "Três perguntas rápidas com números novos, um dia depois.", href: rotaDe(revisita) });
  }
  const sondagens = SONDAGEM_ATIVA ? sondagensPendentes(progresso, CONCEITOS_DO_ARCO_1, agora) : [];
  for (const s of sondagens) {
    const c = CONCEITOS.find((x) => x.id === s.conceito);
    chamados.push({ id: `sondagem-${s.conceito}`, titulo: "Uma medida rápida", linha: `O Nônio quer conferir uma coisa sobre ${c?.nome.toLowerCase() ?? s.conceito}.`, href: `/partilha/sondagem?conceito=${encodeURIComponent(s.conceito)}` });
  }
  const eco = ATIVIDADES.find((a) => a.id === "partilha.arco1.eco");
  if (eco && ecoDisponivel(progresso, M4, eco.id)) {
    chamados.push({ id: "eco", titulo: "Eco: tonéis e casas", linha: "A mesma ideia com outra roupa. Responda antes de ligar a máquina.", href: rotaDe(eco) });
  }
  if (concluida(progresso, M4)) {
    for (const id of ["museu.paes-de-ahmes", "rua.tres-pizzas"]) {
      const a = ATIVIDADES.find((x) => x.id === id);
      if (a && !concluida(progresso, a.id)) chamados.push({ id, titulo: a.titulo, linha: a.tipo === "exposicao" ? "Museu das Descobertas: abriu." : "A Rua: abriu.", href: rotaDe(a) });
    }
  }

  return (
    <main data-pronto="sim" data-tela="distrito" className="min-h-dvh pb-28">
      <header className="area-segura area-segura-topo flex items-center gap-3 pb-2 pt-3">
        <Link href="/mapa" className="placa placa-pequena placa-discreta px-2.5" aria-label="Voltar ao mapa" data-acao="voltar">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M 10 3 L 5 8 L 10 13" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div>
          <p className="rotulo-chapa m-0 text-[0.78rem]">Arco 1 · O resto que ninguém repartia</p>
          <h1 className="fonte-sinal m-0 text-[2rem] font-extrabold uppercase leading-none text-latao-claro">A Partilha</h1>
        </div>
      </header>

      <div className="area-segura mx-auto max-w-xl">
        <ol className="relative m-0 flex flex-col gap-0 p-0" aria-label="Estações da esteira">
          <div className="absolute bottom-6 left-[34px] top-6 w-[10px] rounded" aria-hidden="true" style={{ background: "var(--aco-sombra)" }} />
          {estacoes.map((s, i) => (
            <Estacao key={s.missao.id} s={s} ultima={i === estacoes.length - 1} />
          ))}
        </ol>

        <section className="chapa mt-6 p-4" aria-labelledby="quadro" data-quadro="">
          <h2 id="quadro" className="rotulo-chapa m-0">
            Quadro de chamados
          </h2>
          {chamados.length === 0 ? (
            <p className="mb-0 mt-2 text-texto-mundo-suave">Nenhum chamado agora. Eles aparecem aqui: eco, revisita, museu, rua.</p>
          ) : (
            <ul className="m-0 mt-2 flex flex-col gap-2 p-0">
              {chamados.map((c) => (
                <li key={c.id} className="list-none">
                  <Link href={c.href} className="flex items-center gap-3 rounded-lg border-2 border-turquesa bg-noite-funda px-3 py-2.5" data-chamado={c.id}>
                    <span className="block h-3 w-3 shrink-0 rounded-full bg-turquesa-clara piloto" aria-hidden="true" />
                    <span>
                      <span className="fonte-sinal block text-[1.15rem] font-bold uppercase text-texto-mundo">{c.titulo}</span>
                      <span className="block text-[0.92rem] text-texto-mundo-suave">{c.linha}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <NavJogo atual="mapa" />
    </main>
  );
}

function Estacao({ s, ultima }: { s: SituacaoMissao; ultima: boolean }) {
  const m = s.missao;
  const rota = rotaDe(m);
  const lampada = s.status === "concluida" ? "acesa" : s.status === "bloqueada" ? "apagada" : "piloto";
  return (
    <li className={`relative list-none ${ultima ? "" : "pb-4"}`} data-estacao={m.id} data-status={s.status}>
      <div className="flex items-stretch gap-3">
        <div className="relative z-10 flex w-[78px] shrink-0 flex-col items-center pt-2">
          <svg viewBox="0 0 78 78" width="78" height="78" aria-hidden="true">
            <rect x="6" y="6" width="66" height="66" rx="10" fill={s.status === "bloqueada" ? "var(--noite-funda)" : "var(--noite-clara)"} stroke={s.recomendada ? "var(--turquesa)" : "var(--latao-sombra)"} strokeWidth={s.recomendada ? 2.5 : 1.5} />
            <IconeEstacao numero={m.numero ?? 0} apagada={s.status === "bloqueada"} />
            <Lampada x={62} y={16} r={4} estado={lampada} />
          </svg>
        </div>
        <div className={`chapa flex-1 px-3.5 pb-3 pt-3 ${s.status === "bloqueada" ? "opacity-70" : ""}`}>
          <p className="rotulo-chapa m-0 text-[0.78rem]">
            Missão {m.numero} · {m.ideia}
          </p>
          <h2 className="fonte-sinal m-0 text-[1.45rem] font-bold uppercase leading-tight text-texto-mundo">{m.titulo}</h2>
          <p className="m-0 mt-0.5 text-[0.92rem] text-texto-mundo-suave">
            {s.status === "concluida"
              ? s.via === "prova"
                ? "Feita pela prova direta."
                : "Feita. A página está no Caderno."
              : s.status === "em_andamento"
                ? "Em andamento: a máquina está como você deixou."
                : s.status === "bloqueada"
                  ? `Abre depois da missão ${(m.numero ?? 1) - 1}.`
                  : s.recomendada
                    ? "Próximo passo recomendado."
                    : "Disponível."}
          </p>
          {s.status !== "bloqueada" && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Link href={rota} className={`placa placa-pequena ${s.recomendada && s.status !== "concluida" ? "placa-cheia" : s.status === "concluida" ? "placa-discreta" : ""}`} data-acao="entrar">
                {s.status === "concluida" ? "Refazer" : s.status === "em_andamento" ? "Continuar" : "Entrar"}
              </Link>
              {s.provaLiberada && (
                <Link href={`${rota}?modo=prova`} className="placa placa-pequena" data-acao="prova">
                  Prova direta
                </Link>
              )}
              {s.status === "concluida" && !s.temPagina && m.passos.some((p) => p.fase === "formalizacao") && (
                <Link href={`${rota}?modo=registro`} className="placa placa-pequena" data-acao="registro">
                  Fazer o registro
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/** Uma máquina pequena por estação. */
function IconeEstacao({ numero, apagada }: { numero: number; apagada: boolean }) {
  const cor = apagada ? "var(--noite-traco)" : "var(--saca)";
  const broa = apagada ? "var(--noite-traco)" : "var(--broa)";
  const madeira = apagada ? "var(--noite-traco)" : "var(--madeira)";
  switch (numero) {
    case 1:
      return (
        <g>
          {[20, 34, 48].map((x) => (
            <g key={x}>
              <rect x={x - 6} y={50} width={14} height={4} fill={madeira} />
              <circle cx={x + 1} cy={44} r={4} fill={cor} />
              <circle cx={x + 1} cy={36} r={4} fill={cor} />
            </g>
          ))}
        </g>
      );
    case 2:
      return (
        <g>
          {[18, 30, 42, 54].map((x, i) => (
            <g key={x}>
              <rect x={x - 5} y={50} width={10} height={4} fill={madeira} />
              <circle cx={x} cy={44} r={3.6} fill={cor} />
              {i < 3 && <circle cx={x} cy={37} r={3.6} fill={cor} />}
            </g>
          ))}
          <text x={39} y={28} textAnchor="middle" fontSize={11} fontWeight={700} fill={apagada ? "var(--noite-traco)" : "var(--ambar)"}>?</text>
        </g>
      );
    case 3:
      return (
        <g>
          <rect x={14} y={48} width={50} height={6} rx={2} fill={apagada ? "var(--noite-traco)" : "var(--aco)"} />
          <circle cx={32} cy={43} r={4.5} fill={apagada ? "var(--noite-traco)" : "var(--saca)"} stroke={apagada ? "none" : "var(--vermelhao)"} strokeWidth={1.4} />
          <circle cx={45} cy={43} r={4.5} fill={apagada ? "var(--noite-traco)" : "var(--saca)"} stroke={apagada ? "none" : "var(--vermelhao)"} strokeWidth={1.4} />
          <circle cx={39} cy={28} r={5} fill={cor} />
        </g>
      );
    case 4:
      return (
        <g>
          <circle cx={39} cy={40} r={17} fill={broa} />
          {!apagada && <path d="M 39 40 L 39 23 A 17 17 0 0 1 56 40 Z" fill="var(--miolo)" />}
          <line x1={39} y1={23} x2={39} y2={57} stroke={apagada ? "var(--noite)" : "var(--broa-sombra)"} strokeWidth={1.4} />
          <line x1={22} y1={40} x2={56} y2={40} stroke={apagada ? "var(--noite)" : "var(--broa-sombra)"} strokeWidth={1.4} />
        </g>
      );
    default:
      return (
        <g>
          <rect x={20} y={28} width={38} height={28} rx={2} fill={madeira} />
          <line x1={20} y1={38} x2={58} y2={38} stroke={apagada ? "var(--noite)" : "var(--madeira-sombra)"} strokeWidth={2} />
          <line x1={39} y1={28} x2={39} y2={56} stroke={apagada ? "var(--noite)" : "var(--madeira-sombra)"} strokeWidth={2} />
        </g>
      );
  }
}
