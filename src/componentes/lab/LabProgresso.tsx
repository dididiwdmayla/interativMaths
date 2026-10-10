"use client";

/**
 * /lab/progresso: zerar, saltar para pontos do arco, adiantar o relógio um dia, ver o registro
 * de evidências e os estados calculados.
 */
import Link from "next/link";
import { situacaoConceito } from "@/nucleo/dominio";
import { adiantarRelogio, progressoNovo, UM_DIA_MS, type Progresso } from "@/nucleo/progresso";
import { proximaRevisita, revisitasDevidas } from "@/nucleo/dominio/dominio";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { agoraDoJogo, substituirProgresso } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { progressoAteMissao, progressoCalibrado, progressoComSondagem, progressoComTransferencia } from "./cenarios";

const NOMES_ESTADO: Record<string, string> = {
  nao_avaliado: "não avaliado",
  em_aprendizagem: "em aprendizagem",
  dominado: "dominado",
  consolidado: "consolidado",
  pede_ajuste: "pede ajuste",
};

function data(t: number): string {
  return new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

export function LabProgresso() {
  const { pronto, progresso, atualizar } = useProgresso();
  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const saltar = (f: (agora: number) => Progresso) => substituirProgresso(f(Date.now()));
  const devidas = revisitasDevidas(CONCEITOS_DO_ARCO_1, progresso.evidencias, agora);
  const proxima = proximaRevisita(CONCEITOS_DO_ARCO_1, progresso.evidencias, agora);
  const provaveis = progresso.calibragem?.provaveis ?? [];

  return (
    <main data-pronto="sim" data-tela="lab-progresso" className="area-segura area-segura-topo mx-auto flex max-w-3xl flex-col gap-5 pb-16 pt-4">
      <header className="flex items-center gap-3">
        <Link href="/lab" className="placa placa-pequena placa-discreta">
          Lab
        </Link>
        <h1 className="fonte-sinal m-0 text-[1.9rem] font-extrabold uppercase">Progresso</h1>
      </header>

      <section className="chapa flex flex-col gap-2 p-4">
        <h2 className="rotulo-chapa m-0">Relógio do jogo</h2>
        <p className="m-0" data-relogio={progresso.relogio.deslocamentoMs}>
          Agora no jogo: <strong>{data(agora)}</strong>
          {progresso.relogio.deslocamentoMs > 0 && <span className="text-texto-mundo-suave"> (adiantado {Math.round(progresso.relogio.deslocamentoMs / 3_600_000)} h)</span>}
        </p>
        <p className="m-0 text-texto-mundo-suave">
          {devidas.length > 0 ? `Revisita disponível agora: ${devidas.map((d) => d.conceito).join(", ")}.` : proxima ? `Próxima revisita abre em ${data(proxima)}.` : "Nenhuma revisita marcada."}
        </p>
        <button type="button" className="placa placa-cheia self-start" onClick={() => atualizar((p, t) => adiantarRelogio(p, UM_DIA_MS, t))} data-acao="adiantar-dia">
          Adiantar um dia
        </button>
      </section>

      <section className="chapa flex flex-col gap-2 p-4">
        <h2 className="rotulo-chapa m-0">Saltar para</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="placa placa-pequena" onClick={() => saltar((t) => progressoNovo(t))} data-acao="zerar">
            Zerar
          </button>
          <button type="button" className="placa placa-pequena" onClick={() => saltar(progressoCalibrado)} data-acao="calibrado">
            Calibrado, do começo
          </button>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" className="placa placa-pequena" onClick={() => saltar((t) => progressoAteMissao(n, t))} data-acao={`ate-missao-${n}`}>
              Missões 1 a {n}
            </button>
          ))}
          <button type="button" className="placa placa-pequena" onClick={() => saltar((t) => progressoAteMissao(5, t))} data-acao="arco">
            Arco concluído
          </button>
          <button type="button" className="placa placa-pequena" onClick={() => saltar(progressoComTransferencia)} data-acao="transferencia">
            Arco + museu + rua
          </button>
          <button
            type="button"
            className="placa placa-pequena"
            onClick={() =>
              saltar((t) => {
                const p = progressoAteMissao(5, t);
                return { ...p, relogio: { deslocamentoMs: p.relogio.deslocamentoMs + UM_DIA_MS } };
              })
            }
            data-acao="arco-mais-um-dia"
          >
            Arco + um dia (revisita)
          </button>
          <button type="button" className="placa placa-pequena" onClick={() => saltar(progressoComSondagem)} data-acao="sondagem">
            Sondagem pendente
          </button>
        </div>
      </section>

      <section className="chapa flex flex-col gap-2 p-4">
        <h2 className="rotulo-chapa m-0">Estados calculados</h2>
        <table className="w-full text-left text-[0.92rem]">
          <thead>
            <tr className="text-texto-mundo-suave">
              <th className="py-1 font-normal">Conceito</th>
              <th className="py-1 font-normal">Estado</th>
              <th className="py-1 font-normal">Sucessos válidos / contextos</th>
            </tr>
          </thead>
          <tbody>
            {CONCEITOS.filter((c) => c.situacao !== "em_projeto").map((c) => {
              const s = situacaoConceito(c.id, progresso.evidencias, agora, provaveis);
              return (
                <tr key={c.id} className="border-t border-noite-borda" data-estado-conceito={c.id} data-estado={s.estado}>
                  <td className="py-1">{c.id}</td>
                  <td className="py-1">
                    {NOMES_ESTADO[s.estado]}
                    {s.provavel ? " · provável" : ""}
                    {s.sondagemPendente ? ` · sondagem (${s.sondagemPendente.equivoco})` : ""}
                  </td>
                  <td className="py-1">
                    {s.sucessosValidos} / {s.contextosComSucesso}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="chapa flex flex-col gap-2 p-4">
        <h2 className="rotulo-chapa m-0">Registro de evidências ({progresso.evidencias.length})</h2>
        <div className="max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-[0.82rem]">
            <tbody>
              {[...progresso.evidencias].reverse().slice(0, 120).map((e, i) => (
                <tr key={i} className="border-t border-noite-borda">
                  <td className="py-1 pr-2 text-texto-mundo-suave">{data(e.momento)}</td>
                  <td className="py-1 pr-2">{e.conceito}</td>
                  <td className="py-1 pr-2">{e.tipo}</td>
                  <td className={`py-1 pr-2 ${e.resultado === "sucesso" ? "text-ambar" : e.resultado === "falha" ? "text-vermelhao-claro" : ""}`}>{e.resultado}</td>
                  <td className="py-1 pr-2">ajuda {e.ajuda}</td>
                  <td className="py-1 pr-2 text-texto-mundo-suave">{e.contexto}</td>
                  <td className="py-1">{e.equivoco ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="chapa flex flex-col gap-2 p-4">
        <h2 className="rotulo-chapa m-0">Atividades</h2>
        <ul className="m-0 p-0 text-[0.9rem]">
          {Object.entries(progresso.campanha.atividades).map(([id, a]) => (
            <li key={id} className="list-none">
              {id}: {a.status}
              {a.via ? ` (${a.via})` : ""}
            </li>
          ))}
          {Object.keys(progresso.campanha.execucoes).map((id) => (
            <li key={`e-${id}`} className="list-none text-texto-mundo-suave">
              execução salva: {id}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
