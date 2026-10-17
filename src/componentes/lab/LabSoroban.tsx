"use client";

/**
 * /lab/soroban: o soroban livre com o reconhecedor à vista. Digite uma operação ("26 + 7"), faça
 * na máquina, e o painel mostra cada lance com as marcas, o custo e a distância, limpo ou não.
 * Abaixo, o gerador: escolha o foco e a semente e veja as seis operações com as técnicas de cada lance.
 */
import { useState } from "react";
import { custo, distancia } from "@/nucleo/soroban/soroban";
import { aplicarEntradaItem, iniciarItem, lanceAtual, lancesDoItem, type EntradaItem, type EstadoItem } from "@/nucleo/soroban/item";
import { lancesDaOperacao, operacaoDoTexto, resumoDaOperacao, type LanceDaOperacao } from "@/nucleo/soroban/operacao";
import { gerarRodada, type PedidoRodada } from "@/nucleo/soroban/gerador";
import { ORDEM_TECNICAS_SOROBAN, TECNICAS_SOROBAN, type TecnicaSoroban } from "@/nucleo/soroban/tecnicas";
import { JOIAS } from "@/conteudo/joias";
import { NOMES_POSICAO, ROTULOS_MARCA } from "@/conteudo/lapidacao";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { Soroban } from "@/componentes/soroban/Soroban";

const ABACO = JOIAS.find((j) => j.id === "abaco");
const NOME_TECNICA = new Map(ABACO?.tecnicas.map((t) => [t.id, t.nome]) ?? []);

function nomeDoLance(l: LanceDaOperacao): string {
  if (l.lance.tipo === "mostrar") return `Mostrar ${l.lance.valor}`;
  const pos = NOMES_POSICAO[l.posicao ?? 0];
  return `${pos.nome} ${l.lance.tipo === "por" ? "+" : "−"}${l.lance.d}`;
}

function marcasDoLance(l: LanceDaOperacao): string {
  return l.plano.marcas.map((m) => ROTULOS_MARCA[m]).join(", ") || "mostrar";
}

function Reconhecedor() {
  const [texto, setTexto] = useState("26 + 7");
  const [e, setE] = useState<EstadoItem | null>(() => {
    const op = operacaoDoTexto("26 + 7");
    return op ? iniciarItem({ operacao: op, nivel: "sozinho", tecnica: "lab" }) : null;
  });
  const [algarismos, setAlgarismos] = useState(true);
  const [erro, setErro] = useState(false);
  const enviar = (ent: EntradaItem) => setE((x) => (x ? aplicarEntradaItem(x, ent).estado : x));
  const comecar = () => {
    const op = operacaoDoTexto(texto);
    setErro(op === null);
    if (op) setE(iniciarItem({ operacao: op, nivel: "sozinho", tecnica: "lab" }));
  };
  const lances = e ? lancesDoItem(e) : [];
  const atual = e ? lanceAtual(e) : null;
  return (
    <section className="ficha flex flex-col gap-3 p-4" data-lab="reconhecedor">
      <h2 className="m-0 text-[17px] font-extrabold">Reconhecedor</h2>
      <form
        className="m-0 flex flex-wrap items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          comecar();
        }}
      >
        <label className="rotulo" htmlFor="lab-operacao">
          Operação
        </label>
        <input id="lab-operacao" className="campo-pergunta max-w-[180px]" value={texto} onChange={(ev) => setTexto(ev.target.value)} data-lab="operacao" autoComplete="off" />
        <button type="submit" className="botao-principal" data-acao="lab-comecar">
          Começar
        </button>
        {erro && <span className="text-[14px] font-semibold text-tinta-suave">Use algo como 26 + 7, 52 − 17 ou 305, até 999.</span>}
      </form>
      {e && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-2">
            <div className="ficha-quadriculada h-[300px] p-2 shadow-none">
              <Soroban estado={e.soroban} onGesto={(gesto) => enviar({ tipo: "gesto", gesto })} algarismos={algarismos} marcas={{ daVez: atual ? (atual.lance.plano.movimentos.at(-1)?.haste ?? null) : null }} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="botao-secundario" onClick={() => enviar({ tipo: "desfazer" })} data-acao="desfazer">
                Desfazer
              </button>
              <button type="button" className="botao-secundario" onClick={() => enviar({ tipo: "zerar" })} data-acao="zerar">
                Zerar
              </button>
              <label className="flex items-center gap-2 text-[15px] font-semibold">
                <input type="checkbox" checked={algarismos} onChange={(ev) => setAlgarismos(ev.target.checked)} />
                Mostrar os algarismos
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="m-0 font-bold">
              {resumoDaOperacao(e.item.operacao)} {e.terminado ? "· feita" : ""}
            </p>
            <table className="w-full text-left text-[0.9rem]" data-lab="lances">
              <thead>
                <tr className="text-tinta-suave">
                  <th className="py-1 font-semibold">Lance</th>
                  <th className="py-1 font-semibold">Marcas</th>
                  <th className="py-1 font-semibold">Custo</th>
                  <th className="py-1 font-semibold">Distância</th>
                  <th className="py-1 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody>
                {lances.map((l, i) => {
                  const fechado = e.fechados[i];
                  const aberto = !fechado && atual?.indice === i;
                  const c = fechado ? custo(fechado.movimentos) : aberto ? custo(e.aberto.movimentos) : null;
                  const situacao = fechado ? (fechado.limpo ? "limpo" : "vai e volta") : aberto ? "aberto" : "depois";
                  return (
                    <tr key={i} className="border-t border-grade" data-lance-lab={i} data-situacao={situacao}>
                      <td className="py-1 pr-2 font-semibold">{nomeDoLance(l)}</td>
                      <td className="py-1 pr-2">{marcasDoLance(l)}</td>
                      <td className="py-1 pr-2">{c ?? ""}</td>
                      <td className="py-1 pr-2">{distancia(l.inicio, l.plano.alvo)}</td>
                      <td className={`py-1 ${situacao === "limpo" ? "font-bold text-verde-escuro" : ""}`}>{situacao}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

const ESTAGIOS = Object.fromEntries((ABACO?.tecnicas ?? []).map((t) => [t.id, t.estagio])) as PedidoRodada["estagios"];

function Gerador() {
  const [foco, setFoco] = useState<TecnicaSoroban>(TECNICAS_SOROBAN.complemento5);
  const [semente, setSemente] = useState(1);
  const [rodada, setRodada] = useState(0);
  const vistas = ORDEM_TECNICAS_SOROBAN.slice(0, ORDEM_TECNICAS_SOROBAN.indexOf(foco) + 1);
  const itens = gerarRodada({ semente, tipo: "tecnica", foco, faltam: [], vistas, rodadas: { [foco]: rodada }, estagios: ESTAGIOS, operacoes: 6, intercaladas: 2 });
  return (
    <section className="ficha flex flex-col gap-3 p-4" data-lab="gerador">
      <h2 className="m-0 text-[17px] font-extrabold">Gerador</h2>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[15px] font-semibold">
          Foco
          <select className="campo-pergunta h-[44px] max-w-[220px]" value={foco} onChange={(ev) => setFoco(ev.target.value as TecnicaSoroban)} data-lab="foco">
            {ORDEM_TECNICAS_SOROBAN.map((t) => (
              <option key={t} value={t}>
                {NOME_TECNICA.get(t) ?? t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[15px] font-semibold">
          Semente
          <input type="number" className="campo-pergunta h-[44px] w-[110px]" value={semente} min={1} onChange={(ev) => setSemente(Math.max(1, Math.floor(Number(ev.target.value) || 1)))} data-lab="semente" />
        </label>
        <label className="flex items-center gap-2 text-[15px] font-semibold">
          Rodadas que já contaram
          <input type="number" className="campo-pergunta h-[44px] w-[80px]" value={rodada} min={0} max={4} onChange={(ev) => setRodada(Math.max(0, Math.min(4, Math.floor(Number(ev.target.value) || 0))))} />
        </label>
      </div>
      <ol className="m-0 flex flex-col gap-2 p-0" data-lab="rodada">
        {itens.map((it, i) => (
          <li key={i} className="caixa list-none px-3 py-2" data-item-lab={i}>
            <p className="m-0 flex flex-wrap items-baseline gap-x-3 font-bold">
              <span className="algarismos text-[17px]">{resumoDaOperacao(it.operacao)}</span>
              <span className="text-[13px] font-semibold text-tinta-suave">
                {it.nivel} · {NOME_TECNICA.get(it.tecnica) ?? it.tecnica}
              </span>
            </p>
            <p className="m-0 text-[13.5px] font-medium text-tinta-suave">
              {lancesDaOperacao(it.operacao)
                .filter((l) => l.lance.tipo !== "mostrar")
                .map((l) => `${nomeDoLance(l)}: ${marcasDoLance(l)}`)
                .join(" · ") || "sem lance no soroban"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LabSoroban() {
  return (
    <main data-pronto="sim" data-tela="lab-soroban" className="min-h-dvh pb-16">
      <CabecalhoLugar voltar={{ href: "/lab", rotulo: "Laboratório" }} lugar="Laboratório" titulo="Soroban" />
      <div className="area-segura mx-auto flex w-full max-w-[1100px] flex-col gap-5 pt-5">
        <Reconhecedor />
        <Gerador />
      </div>
    </main>
  );
}
