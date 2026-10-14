"use client";

/**
 * /lab/maquinas: a bancada solta, com qualquer configuração e pele, com ou sem mão livre.
 */
import { useState } from "react";
import { criarBancada, maoLivreLigada, operar } from "@/nucleo/maquinas/bancada/bancada";
import type { Bancada as BancadaEstado, ConfigBancada, IdPele } from "@/nucleo/maquinas/bancada/tipos";
import { validarBancada, VALIDADORES_BANCADA, type NomeValidadorBancada, type ResultadoValidacao } from "@/nucleo/maquinas/bancada/validadores";
import { PELES } from "@/conteudo/peles";
import { Bancada } from "@/componentes/maquinas/Bancada";
import { PainelBancada } from "@/componentes/maquinas/PainelBancada";
import { Palco } from "@/componentes/maquinas/Palco";
import { FaixaNonio } from "@/componentes/nonio/FaixaNonio";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { mensagemDoEvento } from "@/componentes/maquinas/mensagens";

interface Predefinida {
  nome: string;
  config: ConfigBancada;
  validador: NomeValidadorBancada;
  params: Record<string, string | number | boolean>;
}

const FATIADOR = { partes: [2, 3, 4, 5, 6, 8, 10], denominadorMaximo: 10 };

const PREDEFINIDAS: Predefinida[] = [
  { nome: "Missão 1: 24 sacas, 4 carroças", config: { pele: "sacas-carrocas", pecas: { quantidade: 24 }, bicas: { quantidade: 4, ajustavel: false } }, validador: "partilha.fechada", params: {} },
  { nome: "Missão 2: 30 sacas, 6 em cada", config: { pele: "sacas-carrocas", pecas: { quantidade: 30 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } }, validador: "partilha.carga-exata", params: { carga: 6 } },
  { nome: "Missão 3: 26 sacas, até 6 por carroça", config: { pele: "sacas-carrocas", pecas: { quantidade: 26 }, bicas: { quantidade: 4, ajustavel: true, vagas: 7 }, teto: 6 }, validador: "transporte.tudo-saiu", params: { teto: 6 } },
  { nome: "Missão 4: 3 broas, 4 mesas", config: { pele: "broas-mesas", pecas: { quantidade: 3 }, bicas: { quantidade: 4, ajustavel: false }, fatiador: { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 } }, validador: "partilha.fechada", params: {} },
  { nome: "Museu: 6 pães, 10 cestos", config: { pele: "paes-cestos", pecas: { quantidade: 6 }, bicas: { quantidade: 10, ajustavel: false }, fatiador: FATIADOR }, validador: "partilha.unitarias-distintas", params: {} },
  { nome: "Rua: 3 pizzas em oitavos, 4 pratos", config: { pele: "pizzas-amigos", pecas: { quantidade: 0, pilhas: [{ tamanho: "1/8", quantidade: 24 }] }, bicas: { quantidade: 4, ajustavel: false } }, validador: "partilha.fechada", params: {} },
  { nome: "Eco: 3 tonéis, 5 casas", config: { pele: "toneis-casas", pecas: { quantidade: 3 }, bicas: { quantidade: 5, ajustavel: false }, fatiador: { partes: [2, 3, 4, 5, 10], denominadorMaximo: 10 } }, validador: "partilha.fechada", params: {} },
  { nome: "Caminho de volta: 28 ÷ 7", config: { pele: "sacas-carrocas", pecas: { quantidade: 10 }, carga: { minimo: 1, maximo: 40 }, bicas: { quantidade: 4, ajustavel: true, vagas: 8 } }, validador: "maquina.mostra-divisao", params: { dividendo: 28, divisor: 7, aceitaMedida: true } },
];

export function LabMaquinas() {
  const [indice, setIndice] = useState(0);
  const [config, setConfig] = useState<ConfigBancada>(PREDEFINIDAS[0].config);
  const [bancada, setBancada] = useState<BancadaEstado>(() => criarBancada(PREDEFINIDAS[0].config));
  const [validador, setValidador] = useState<NomeValidadorBancada>(PREDEFINIDAS[0].validador);
  const [params, setParams] = useState(JSON.stringify(PREDEFINIDAS[0].params));
  const [resultado, setResultado] = useState<ResultadoValidacao | null>(null);
  const [cotas, setCotas] = useState(true);
  const [solucoes, setSolucoes] = useState<string[]>([]);
  const pele = PELES[config.pele];

  const usar = (c: ConfigBancada) => {
    setConfig(c);
    setBancada(criarBancada(c));
    setResultado(null);
    setSolucoes([]);
  };

  const escolher = (i: number) => {
    const p = PREDEFINIDAS[i];
    setIndice(i);
    setValidador(p.validador);
    setParams(JSON.stringify(p.params));
    usar(p.config);
  };

  const fechar = () => {
    let p: Record<string, string | number | boolean> = {};
    try {
      p = JSON.parse(params) as Record<string, string | number | boolean>;
    } catch {
      p = {};
    }
    const r = validarBancada(validador, p, bancada.atual, { solucoes });
    setResultado(r);
    if (r.assinatura && (r.ok || r.parcial)) setSolucoes((s) => [...s, r.assinatura as string]);
    if (r.ok) setBancada((b) => operar(b, { tipo: "fechar" }));
  };

  const msg = mensagemDoEvento(bancada.atual, pele);

  return (
    <div data-pronto="sim" data-tela="lab-maquinas">
      <Palco
        cabecalho={<CabecalhoLugar voltar={{ href: "/lab", rotulo: "Laboratório" }} lugar="Laboratório" titulo="Máquinas" />}
        pedido={
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <select
              aria-label="Configuração"
              className="botao-secundario min-w-0 max-w-full flex-1 text-left"
              value={indice}
              onChange={(e) => escolher(Number(e.target.value))}
            >
              {PREDEFINIDAS.map((p, i) => (
                <option key={p.nome} value={i}>
                  {p.nome}
                </option>
              ))}
            </select>
            <label className="flex min-h-[44px] items-center gap-1.5 text-[14px] font-semibold text-tinta-suave">
              <input type="checkbox" checked={cotas} onChange={(e) => setCotas(e.target.checked)} className="h-5 w-5 accent-[var(--caneta)]" /> cotas
            </label>
          </div>
        }
        maquina={<Bancada estado={bancada.atual} pele={pele} cotas={cotas} onAcao={(a) => setBancada((b) => operar(b, a))} marcas={{ aceita: bancada.atual.fechada }} />}
        faixa={<FaixaNonio fala={{ id: "leitura", texto: msg?.texto ?? "Máquina pronta.", categoria: "evento", atencao: msg?.tom === "atencao" }} selo={null} retorno="neutro" expressao="quieto" compacta />}
        controles={
          <div className="flex flex-col gap-3">
            <PainelBancada estado={bancada.atual} pele={pele} onAcao={(a) => setBancada((b) => operar(b, a))} onFechar={fechar} />
            <button
              type="button"
              className="opcao opcao-texto"
              aria-pressed={maoLivreLigada(config)}
              onClick={() => usar({ ...config, maoLivre: maoLivreLigada(config) ? false : undefined })}
              data-acao="mao-livre"
            >
              Mão livre: {maoLivreLigada(config) ? "ligada (toque, arraste, corte)" : config.voltasMax !== undefined ? "desligada (máquina com voltas contadas)" : "desligada (só a alavanca)"}
            </button>
            <details className="text-[14px] text-tinta-suave">
              <summary className="min-h-[44px] cursor-pointer py-2.5 font-semibold">Configuração e validador</summary>
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex flex-col gap-1">
                  Pele
                  <select className="caixa p-2 text-tinta" value={config.pele} onChange={(e) => usar({ ...config, pele: e.target.value as IdPele })}>
                    {Object.keys(PELES).map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Configuração (JSON)
                  <textarea
                    className="caixa h-28 p-2 font-mono text-xs text-tinta"
                    defaultValue={JSON.stringify(config)}
                    key={JSON.stringify(config)}
                    onBlur={(e) => {
                      try {
                        usar(JSON.parse(e.target.value) as ConfigBancada);
                      } catch {
                        // JSON inválido: mantém a configuração
                      }
                    }}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Validador
                  <select className="caixa p-2 text-tinta" value={validador} onChange={(e) => setValidador(e.target.value as NomeValidadorBancada)}>
                    {VALIDADORES_BANCADA.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Parâmetros (JSON)
                  <input className="caixa p-2 font-mono text-xs text-tinta" value={params} onChange={(e) => setParams(e.target.value)} />
                </label>
                {resultado && (
                  <pre className="caixa overflow-x-auto p-2 text-xs text-tinta" data-resultado={resultado.ok ? "ok" : resultado.motivo}>
                    {JSON.stringify(resultado, null, 1)}
                  </pre>
                )}
              </div>
            </details>
          </div>
        }
      />
    </div>
  );
}
