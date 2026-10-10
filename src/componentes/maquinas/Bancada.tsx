"use client";

/**
 * A bancada de partilha desenhada a traço de tinta. Desenha o estado da simulação e anima a
 * transição do último evento; não decide nada. Toques (e teclado) viram ações que o núcleo aplica.
 * Bica fechada fica a lápis; abrir é passar a caneta. A sobra cai numa bandeja a lápis e ganha um
 * círculo vermelho. Partilha aceita ganha marca-texto nos números.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { formatar, paraNumero, racional } from "@/nucleo/racional/racional";
import { racionalPorExtenso, inteiroPorExtenso } from "@/nucleo/racional/extenso";
import { bicasEmUso, contarPecas, quantidadeDe, quantidadeNaBica } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { Anotacao, Bica, CirculoVermelho, Esteira, FaixaMarcaTexto, Medidor, NumeroAnotado, PassarACaneta, SetaCurva, TRACO, Trilho } from "@/componentes/mundo/kit";
import { CotaCaneta, NumeroSvg } from "./cota";
import { comporUnidades, grade } from "./geometria";
import { calcularLayout, LARGURA, type LayoutBancada } from "./layout";
import { Saco, Unidade } from "./pecas";
import { Receptor } from "./receptores";

export type AlvoBancada = "esteira" | "pilha" | "bicas" | "bandeja" | "fatiador" | `bica:${number}`;

export interface MarcasBancada {
  /** Partilha aceita: marca-texto nos números. */
  readonly aceita?: boolean;
  /** Bicas que chamam atenção (carga diferente, passou do teto). */
  readonly bicasAtencao?: readonly number[];
  /** A sobra na esteira chama atenção (ficou no pátio). */
  readonly sobraAtencao?: boolean;
}

export interface PropsBancada {
  estado: EstadoBancada;
  pele: Pele;
  cotas?: boolean;
  onAcao?: (acao: AcaoBancada) => void;
  realce?: AlvoBancada | null;
  cotaExtra?: { alvo: AlvoBancada; texto: string } | null;
  marcas?: MarcasBancada;
  rotulo?: string;
  className?: string;
  /** Altura/largura fixa (miniatura). Sem ela, a bancada ocupa a área disponível. */
  proporcao?: number;
}

function ativarComTeclado(e: KeyboardEvent, f: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    f();
  }
}

function nomeQuantidade(pele: Pele, tamanho: { n: number; d: number }, k: number): string {
  if (tamanho.d === 1 && tamanho.n === 1) {
    return `${inteiroPorExtenso(k, pele.peca.genero)} ${k === 1 ? pele.peca.singular : pele.peca.plural}`;
  }
  return `${inteiroPorExtenso(k, pele.pedaco.genero)} ${k === 1 ? pele.pedaco.singular : pele.pedaco.plural} de ${racionalPorExtenso(racional(tamanho.n, tamanho.d))}`;
}

/** Resumo do estado para leitor de tela. */
export function descreverBancada(e: EstadoBancada, pele: Pele): string {
  const partes: string[] = [];
  partes.push(
    e.esteira.length === 0
      ? "Esteira vazia."
      : `Na esteira: ${e.esteira.map((p) => nomeQuantidade(pele, p.tamanho, p.quantidade)).join("; ")}.`,
  );
  const uso = bicasEmUso(e);
  const abertas = e.bicas.filter((b) => b.aberta).length;
  partes.push(`${abertas} de ${e.bicas.length} bicas abertas.`);
  if (uso.length > 0) {
    partes.push(
      uso
        .map((i) => `${pele.receptor.singular} ${i + 1}: ${racionalPorExtenso(quantidadeNaBica(e.bicas[i]), { misto: true })}`)
        .join("; ") + ".",
    );
  }
  const sobra = quantidadeDe(e.bandeja);
  if (sobra.n > 0) partes.push(`Na ${pele.sobra}: ${racionalPorExtenso(sobra, { misto: true })}.`);
  return partes.join(" ");
}

export function Bancada({
  estado,
  pele,
  cotas = true,
  onAcao,
  realce = null,
  cotaExtra = null,
  marcas = {},
  rotulo,
  className,
  proporcao,
}: PropsBancada) {
  const id = useId().replace(/:/g, "");
  const forma = pele.peca.forma;
  const caixaRef = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState({ proporcao: 0.62, largura: 360 });
  useEffect(() => {
    const el = caixaRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entradas) => {
      const r = entradas[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) setMedida({ proporcao: Math.round((r.height / r.width) * 50) / 50, largura: Math.round(r.width) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const L = calcularLayout(estado, forma, proporcao ?? medida.proporcao);
  // A letra de mão só aparece quando sai com 19 px ou mais na tela.
  const escala = Math.min(medida.largura / LARGURA, (medida.largura * (proporcao ?? medida.proporcao)) / L.altura);
  const letraDeMao = escala * 22 >= 19;
  const ev = estado.evento;
  const mexivel = onAcao !== undefined;
  const pilhaSel = L.pilhas.find((p) => p.chave === estado.pilha) ?? null;
  const pilhaX = pilhaSel ? pilhaSel.caixa.x + pilhaSel.caixa.largura / 2 : L.esteira.x0 + 30;
  const pilhaY = pilhaSel ? pilhaSel.topo + (L.esteira.y - pilhaSel.topo) / 2 : L.esteira.y - 18;
  const engasgo = ev?.tipo === "engasgo" ? ev : null;
  const realcar = (alvo: AlvoBancada) => realce === alvo;

  return (
    <div ref={caixaRef} className={`bancada-caixa ${className ?? ""}`}>
      <svg
        viewBox={`0 0 ${LARGURA} ${L.altura}`}
        role="group"
        aria-label={rotulo ?? "Bancada de partilha"}
        aria-describedby={`${id}-desc`}
        preserveAspectRatio="xMidYMid meet"
        data-seq={estado.seq}
        className="traco-fixo"
      >
        <desc id={`${id}-desc`}>{descreverBancada(estado, pele)}</desc>

        {L.fatiador && <Fatiador L={L} partes={estado.partes} seq={ev?.tipo === "fatia" ? estado.seq : null} realcado={realcar("fatiador")} />}

        <Esteira id={`${id}-esteira`} x0={L.esteira.x0} x1={L.esteira.x1} y={L.esteira.y} />

        {/* Pilhas na esteira */}
        {L.pilhas.map((lp) => {
          const sel = lp.chave === estado.pilha;
          const acao = () => onAcao?.({ tipo: "pilha", tamanho: lp.chave });
          const rotuloPilha = `Pilha: ${nomeQuantidade(pele, lp.pilha.tamanho, lp.pilha.quantidade)}${sel ? ", escolhida" : ""}`;
          const cx = lp.caixa.x + lp.caixa.largura / 2;
          const tremor = engasgo && sel;
          return (
            <g
              key={lp.chave}
              role={mexivel ? "button" : undefined}
              tabIndex={mexivel ? 0 : undefined}
              aria-label={rotuloPilha}
              aria-pressed={mexivel ? sel : undefined}
              data-focavel={mexivel ? "" : undefined}
              data-pilha={lp.chave}
              onClick={mexivel ? acao : undefined}
              onKeyDown={mexivel ? (e) => ativarComTeclado(e, acao) : undefined}
              style={{ cursor: mexivel ? "pointer" : undefined }}
            >
              <rect x={lp.caixa.x - 4} y={lp.topo - 26} width={lp.caixa.largura + 8} height={L.esteira.y - lp.topo + 44} rx={8} fill="transparent" stroke="none" />
              <rect className="anel-foco" x={lp.caixa.x - 4} y={lp.topo - 6} width={lp.caixa.largura + 8} height={L.esteira.y - lp.topo + 24} rx={8} />
              <g key={tremor ? `tremor-${estado.seq}` : "parada"} className={tremor ? "anima-engasgo" : undefined}>
                <PilhaDesenho lp={lp} forma={forma} raio={L.raioPilha} />
              </g>
              {sel && mexivel && <line x1={lp.caixa.x - 2} x2={lp.caixa.x + lp.caixa.largura + 2} y1={L.esteira.y + 19} y2={L.esteira.y + 19} stroke="var(--caneta)" strokeWidth={3} strokeLinecap="round" />}
              {cotas && (
                <CotaCaneta x1={lp.caixa.x + 2} x2={lp.caixa.x + lp.caixa.largura - 2} y={lp.topo - 4} rotuloY={lp.pilha.tamanho.d === 1 && lp.pilha.tamanho.n === 1 ? lp.topo - 21 : lp.topo - 30}>
                  <RotuloPilha k={lp.pilha.quantidade} tamanho={lp.pilha.tamanho} pele={pele} palavra={letraDeMao && L.pilhas.length === 1} />
                </CotaCaneta>
              )}
              {marcas.sobraAtencao && <CirculoVermelho cx={cx} cy={lp.topo + (L.esteira.y - lp.topo) / 2} rx={lp.caixa.largura / 2 + 12} ry={(L.esteira.y - lp.topo) / 2 + 14} semente={3} />}
              {realcar("pilha") && sel && <AnelRealce x={cx} y={lp.topo + (L.esteira.y - lp.topo) / 2} rx={lp.caixa.largura / 2 + 14} ry={(L.esteira.y - lp.topo) / 2 + 16} />}
            </g>
          );
        })}
        {estado.esteira.length === 0 && letraDeMao && (
          <Anotacao x={(L.esteira.x0 + L.esteira.x1) / 2} y={L.esteira.y - 12} ancora="middle" cor="var(--tinta-suave)">
            esteira vazia
          </Anotacao>
        )}
        {realcar("esteira") && <AnelRealce x={(L.esteira.x0 + L.esteira.x1) / 2} y={L.esteira.y - 10} rx={(L.esteira.x1 - L.esteira.x0) / 2 + 4} ry={34} />}

        {/* Engasgo: a anotação do que faltou */}
        {engasgo && (
          <g key={`engasgo-${estado.seq}`} className="anima-esmaecer" aria-hidden="true">
            <AnotacaoEngasgo x={pilhaX} y={L.esteira.y + 38} pedido={engasgo.pedido} ha={engasgo.ha} letraDeMao={letraDeMao} />
          </g>
        )}

        {/* Trilho e bicas */}
        {L.trilhos.map((t, i) => (
          <Trilho key={i} x0={t.x0} x1={t.x1} y={t.y} />
        ))}

        {L.bicas.map((lb) => {
          const b = estado.bicas[lb.indice];
          const q = quantidadeNaBica(b);
          const emUso = b.aberta || b.pecas.length > 0;
          const ajustavel = estado.config.bicas.ajustavel && mexivel;
          const atencao = marcas.bicasAtencao?.includes(lb.indice) ?? false;
          const acao = () => onAcao?.({ tipo: "bica", indice: lb.indice });
          const fracao = paraNumero(q) / paraNumero(L.escala);
          const unidades = comporUnidades(b.pecas);
          const pecas = contarPecas(b.pecas);
          const xConteudo = lb.conteudo.x + lb.conteudo.largura / 2;
          return (
            <g key={lb.indice} data-bica={lb.indice} data-aberta={b.aberta ? "sim" : "nao"} data-quantidade={formatar(q)}>
              <g
                role={ajustavel ? "button" : undefined}
                tabIndex={ajustavel ? 0 : undefined}
                aria-label={ajustavel ? `${b.aberta ? "Fechar" : "Abrir"} a bica ${lb.indice + 1}` : undefined}
                aria-pressed={ajustavel ? b.aberta : undefined}
                data-focavel={ajustavel ? "" : undefined}
                data-volante={lb.indice}
                onClick={ajustavel ? acao : undefined}
                onKeyDown={ajustavel ? (e) => ativarComTeclado(e, acao) : undefined}
                style={{ cursor: ajustavel ? "pointer" : undefined }}
              >
                <rect x={lb.cx - lb.largura / 2 + 2} y={lb.bicaY - 8} width={lb.largura - 4} height={36} rx={8} fill="transparent" stroke="none" />
                <rect className="anel-foco" x={lb.cx - 13} y={lb.bicaY - 4} width={26} height={30} rx={6} />
                <PassarACaneta feito={b.aberta}>
                  <Bica cx={lb.cx} y={lb.bicaY} />
                </PassarACaneta>
              </g>

              {/* Conteúdo e receptor: a lápis enquanto a bica não foi usada */}
              <Conteudo forma={forma} caixa={lb.conteudo} unidades={unidades} pecas={b.pecas} raioMax={L.raioConteudo} />
              <PassarACaneta feito={emUso}>
                <Receptor forma={pele.receptor.forma} cx={lb.cx} y={lb.receptorY} largura={lb.largura} />
              </PassarACaneta>

              <Medidor
                x={lb.medidor.x}
                y={lb.medidor.y}
                largura={lb.medidor.largura}
                altura={lb.medidor.altura}
                fracao={fracao}
                marcas={L.marcas}
                teto={estado.config.teto !== undefined ? estado.config.teto / paraNumero(L.escala) : undefined}
              />

              {cotas && (
                <RotuloBica
                  cx={lb.cx}
                  y={lb.rotuloY}
                  valor={q}
                  pecas={forma !== "saco" && pecas > 0 ? pecas : null}
                  estreita={lb.largura < 44}
                  marcado={marcas.aceita === true && emUso}
                  fracionaria={forma !== "saco"}
                />
              )}
              {atencao && <CirculoVermelho cx={lb.cx} cy={(lb.conteudo.y + lb.rotuloY + 30) / 2} rx={lb.largura / 2 - 1} ry={(lb.rotuloY + 30 - lb.conteudo.y) / 2 + 6} semente={lb.indice + 5} />}
              {realcar(`bica:${lb.indice}`) && <AnelRealce x={xConteudo} y={lb.conteudo.y + lb.conteudo.altura / 2} rx={Math.min(32, lb.largura / 2)} ry={Math.min(48, lb.conteudo.altura / 2 + 8)} />}
            </g>
          );
        })}

        {realcar("bicas") && L.bicas.length > 0 && (
          <AnelRealce
            x={(L.bicas[0].cx + L.bicas[L.bicas.length - 1].cx) / 2}
            y={L.bicas[0].conteudo.y + L.bicas[0].conteudo.altura / 2}
            rx={(L.bicas[L.bicas.length - 1].cx - L.bicas[0].cx) / 2 + L.bicas[0].largura / 2 + 2}
            ry={L.bicas[0].conteudo.altura / 2 + 22}
          />
        )}

        {/* Bandeja da sobra */}
        <Bandeja L={L} estado={estado} pele={pele} cotas={cotas} realcado={realcar("bandeja")} />

        {/* Voo das peças numa volta: sai de onde a pilha estava e chega em cada bica aberta */}
        {ev?.tipo === "volta" && (
          <g key={`voo-${estado.seq}`} aria-hidden="true">
            {ev.bicas.map((i) => {
              const lb = L.bicas[i];
              if (!lb) return null;
              const destinoX = lb.conteudo.x + lb.conteudo.largura / 2;
              const destinoY = lb.conteudo.y + lb.conteudo.altura - 16;
              const t = { n: Number(ev.tamanho.split("/")[0]), d: Number(ev.tamanho.split("/")[1]) };
              const dx = destinoX - pilhaX;
              const dy = destinoY - pilhaY;
              return (
                <g key={i} className="anima-voo" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }}>
                  <g transform={`translate(${pilhaX} ${pilhaY})`}>
                    {forma === "saco" ? (
                      <Saco x={0} y={0} r={7} />
                    ) : (
                      <Unidade forma={forma} x={0} y={0} r={10} unidade={comporUnidades([{ tamanho: t, quantidade: 1 }])[0]} contorno={false} />
                    )}
                    {ev.lote > 1 && (
                      <text x={12} y={-8} fontSize={12} fill="var(--caneta)" stroke="none" fontWeight={700} className="algarismos">
                        {`×${ev.lote}`}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {cotaExtra && <CotaExtra L={L} alvo={cotaExtra.alvo} texto={cotaExtra.texto} pilha={pilhaSel} />}
      </svg>
    </div>
  );
}

function RotuloPilha({ k, tamanho, pele, palavra }: { k: number; tamanho: { n: number; d: number }; pele: Pele; palavra: boolean }) {
  const inteira = tamanho.d === 1 && tamanho.n === 1;
  if (inteira) {
    const nome = k === 1 ? pele.peca.singular : pele.peca.plural;
    if (palavra) {
      return (
        <Anotacao x={0} y={4} ancora="middle" inclinacao={-2}>
          <NumeroAnotado tamanho={16}>{k}</NumeroAnotado> {nome}
        </Anotacao>
      );
    }
    return (
      <text textAnchor="middle" dominantBaseline="central" fontSize={15} fill="var(--caneta)" stroke="none" fontWeight={700} className="algarismos">
        {k}
      </text>
    );
  }
  return (
    <g>
      <text x={-2} textAnchor="end" dominantBaseline="central" fontSize={15} fill="var(--caneta)" stroke="none" fontWeight={700} className="algarismos">
        {`${k} ×`}
      </text>
      <NumeroSvg valor={racional(tamanho.n, tamanho.d)} x={2} y={0} tamanho={15} cor="var(--caneta)" ancora="start" peso={700} />
    </g>
  );
}

function AnotacaoEngasgo({ x, y, pedido, ha, letraDeMao }: { x: number; y: number; pedido: number; ha: number; letraDeMao: boolean }) {
  const largura = letraDeMao ? 168 : 120;
  const xc = Math.min(Math.max(x, largura / 2 + 6), LARGURA - largura / 2 - 6);
  if (!letraDeMao) {
    return (
      <text x={xc} y={y} textAnchor="middle" fontSize={13} fill="var(--caneta)" stroke="none" fontWeight={700} className="algarismos">
        {`pede ${pedido} · há ${ha}`}
      </text>
    );
  }
  return (
    <Anotacao x={xc} y={y} ancora="middle" inclinacao={-1.5}>
      pede <NumeroAnotado tamanho={17}>{pedido}</NumeroAnotado>, há <NumeroAnotado tamanho={17}>{ha}</NumeroAnotado>
    </Anotacao>
  );
}

function RotuloBica({
  cx,
  y,
  valor,
  pecas,
  estreita,
  marcado,
  fracionaria,
}: {
  cx: number;
  y: number;
  valor: ReturnType<typeof quantidadeNaBica>;
  pecas: number | null;
  estreita: boolean;
  marcado: boolean;
  fracionaria: boolean;
}) {
  const tamanho = estreita ? 13 : 18;
  const centro = valor.d === 1 ? y + 12 : y + 22;
  const alturaFaixa = valor.d === 1 ? tamanho + 8 : tamanho * 2 + 8;
  const larguraFaixa = estreita ? 26 : 40;
  return (
    <g aria-hidden="true">
      {marcado && <FaixaMarcaTexto x={cx - larguraFaixa / 2} y={centro - alturaFaixa / 2} largura={larguraFaixa} altura={alturaFaixa} cresce />}
      <NumeroSvg valor={valor} x={cx} y={centro} tamanho={tamanho} escalaFracao={1} />
      {fracionaria && pecas !== null && !estreita && (
        <text x={cx} y={y + 52} textAnchor="middle" fontSize={12} fontWeight={500} fill="var(--tinta-suave)" stroke="none" className="algarismos">
          {pecas === 1 ? "1 pedaço" : `${pecas} pedaços`}
        </text>
      )}
    </g>
  );
}

function PilhaDesenho({ lp, forma, raio }: { lp: LayoutBancada["pilhas"][number]; forma: Pele["peca"]["forma"]; raio: number }) {
  const { caixa } = lp;
  if (forma === "saco") {
    const n = lp.mostradas;
    const colunas = Math.min(4, n);
    const r = raio;
    const itens = Array.from({ length: n }, (_, i) => {
      const linha = Math.floor(i / colunas);
      const col = i % colunas;
      return { x: caixa.x + r * 1.1 + col * r * 2.15 + (linha % 2) * r * 0.9, y: caixa.y + caixa.altura - r * 1.05 - linha * r * 1.75 };
    });
    return (
      <g>
        {itens.map((p, i) => (
          <Saco key={i} x={p.x} y={p.y} r={r} />
        ))}
        {lp.ocultas > 0 && (
          <text x={caixa.x + caixa.largura + 4} y={caixa.y + caixa.altura - r} textAnchor="start" dominantBaseline="central" fontSize={12} fontWeight={700} fill="var(--tinta-suave)" stroke="none" className="algarismos">
            {`+${lp.ocultas}`}
          </text>
        )}
      </g>
    );
  }
  const unidades = comporUnidades([lp.pilha]).slice(0, lp.mostradas);
  const r = Math.min(raio, (caixa.largura - 6) / Math.max(1, lp.mostradas) / 2.25);
  return (
    <g>
      {unidades.map((u, i) => (
        <Unidade key={i} forma={forma} x={caixa.x + 3 + r * 1.1 + i * r * 2.25} y={caixa.y + caixa.altura - r - 2} r={r} unidade={u} contorno={false} />
      ))}
      {lp.ocultas > 0 && (
        <text x={caixa.x + caixa.largura} y={caixa.y + caixa.altura - r} textAnchor="end" dominantBaseline="central" fontSize={12} fontWeight={700} fill="var(--tinta-suave)" stroke="none" className="algarismos">
          {`+${lp.ocultas}`}
        </text>
      )}
    </g>
  );
}

function Conteudo({
  forma,
  caixa,
  unidades,
  pecas,
  raioMax,
}: {
  forma: Pele["peca"]["forma"];
  caixa: { x: number; y: number; largura: number; altura: number };
  unidades: ReturnType<typeof comporUnidades>;
  pecas: EstadoBancada["bicas"][number]["pecas"];
  raioMax: number;
}) {
  if (forma === "saco") {
    const n = contarPecas(pecas);
    const mostradas = Math.min(n, 12);
    const { centros, raio } = grade(mostradas, caixa, { raioMax, colunasMax: 4 });
    return (
      <g>
        {centros.map((c, i) => (
          <Saco key={i} x={c.x} y={c.y} r={raio} />
        ))}
        {n > mostradas && (
          <text x={caixa.x + caixa.largura} y={caixa.y + 8} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--tinta-suave)" stroke="none">{`+${n - mostradas}`}</text>
        )}
      </g>
    );
  }
  const mostradas = unidades.slice(0, 4);
  const { centros, raio } = grade(Math.max(1, mostradas.length), caixa, { raioMax, colunasMax: 2 });
  return (
    <g>
      {mostradas.length === 0 && (
        <Unidade forma={forma} x={centros[0].x} y={centros[0].y} r={raio} unidade={{ fatias: [], inteira: false }} />
      )}
      {mostradas.map((u, i) => (
        <Unidade key={i} forma={forma} x={centros[i].x} y={centros[i].y} r={raio} unidade={u} />
      ))}
      {unidades.length > 4 && (
        <text x={caixa.x + caixa.largura} y={caixa.y + 8} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--tinta-suave)" stroke="none">{`+${unidades.length - 4}`}</text>
      )}
    </g>
  );
}

function Fatiador({ L, partes, seq, realcado }: { L: LayoutBancada; partes: number; seq: number | null; realcado: boolean }) {
  const c = L.fatiador;
  if (!c) return null;
  const cx = c.x + c.largura / 2;
  const t = { stroke: "var(--tinta)", strokeWidth: TRACO, strokeLinejoin: "round" as const };
  return (
    <g aria-hidden="true">
      <rect x={c.x + 4} y={c.y + 6} width={7} height={c.altura - 24} rx={2} fill="var(--caneta-clara)" {...t} />
      <rect x={c.x + c.largura - 11} y={c.y + 6} width={7} height={c.altura - 24} rx={2} fill="var(--caneta-clara)" {...t} />
      <g key={seq ?? "lamina"} className={seq !== null ? "anima-lamina" : undefined}>
        <path d={`M ${c.x + 11} ${c.y + 12} H ${c.x + c.largura - 11} V ${c.y + 24} L ${c.x + 11} ${c.y + 36} Z`} fill="var(--folha)" {...t} />
      </g>
      <rect x={c.x} y={c.y} width={c.largura} height={10} rx={4} fill="var(--caneta)" {...t} />
      <rect x={c.x + 2} y={c.y + c.altura - 22} width={c.largura - 4} height={22} rx={6} fill="var(--marca-texto)" {...t} />
      <text x={cx} y={c.y + c.altura - 11} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fontWeight={700} fill="var(--tinta)" stroke="none">
        {`em ${partes}`}
      </text>
      {realcado && <AnelRealce x={cx} y={c.y + c.altura / 2} rx={c.largura / 2 + 8} ry={c.altura / 2 + 8} />}
    </g>
  );
}

function Bandeja({ L, estado, pele, cotas, realcado }: { L: LayoutBancada; estado: EstadoBancada; pele: Pele; cotas: boolean; realcado: boolean }) {
  const c = L.bandeja;
  const sobra = quantidadeDe(estado.bandeja);
  const unidades = comporUnidades(estado.bandeja);
  const forma = pele.peca.forma;
  const n = contarPecas(estado.bandeja);
  const conteudo = { x: c.x + 54, y: c.y + 4, largura: c.largura - 62, altura: c.altura - 16 };
  const itens = forma === "saco" ? Math.min(n, 8) : Math.min(unidades.length, 4);
  const { centros, raio } = grade(itens, conteudo, { raioMax: forma === "saco" ? 7 : 11 });
  const fundo = c.y + c.altura - 4;
  return (
    <g data-sobra={formatar(sobra)}>
      <g className="a-lapis" aria-hidden="true">
        <path d={`M ${c.x + 48} ${fundo - 12} L ${c.x + 54} ${fundo} H ${c.x + c.largura - 6} L ${c.x + c.largura} ${fundo - 12} Z`} fill="var(--folha)" stroke="var(--tinta)" />
      </g>
      {cotas && (
        <text x={c.x + 2} y={c.y + 12} fontSize={12} fontWeight={600} fill="var(--tinta-suave)" stroke="none">
          sobra
        </text>
      )}
      {cotas && <NumeroSvg valor={sobra} x={c.x + 2} y={c.y + 32} tamanho={sobra.d === 1 ? 18 : 15} ancora="start" cor={sobra.n > 0 ? "var(--tinta)" : "var(--tinta-suave)"} />}
      {centros.map((p, i) =>
        forma === "saco" ? <Saco key={i} x={p.x} y={p.y} r={raio} /> : <Unidade key={i} forma={forma} x={p.x} y={p.y} r={raio} unidade={unidades[i]} contorno={false} />,
      )}
      {sobra.n > 0 && <CirculoVermelho cx={conteudo.x + conteudo.largura / 2} cy={conteudo.y + conteudo.altura / 2 + 2} rx={conteudo.largura / 2 + 6} ry={conteudo.altura / 2 + 6} semente={11} />}
      {realcado && <AnelRealce x={c.x + c.largura / 2} y={c.y + c.altura / 2} rx={c.largura / 2 + 4} ry={c.altura / 2 + 6} />}
    </g>
  );
}

/** O Nônio pede para olhar aqui: um círculo a lápis vermelho que pulsa três vezes. */
function AnelRealce({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <g className="anima-realce" style={{ pointerEvents: "none" }}>
      <CirculoVermelho cx={x} cy={y} rx={rx} ry={ry} semente={7} />
    </g>
  );
}

/** A medida que o Nônio mostra: uma anotação a caneta com setinha, ao lado do que ela mede. */
function CotaExtra({ L, alvo, texto, pilha }: { L: LayoutBancada; alvo: AlvoBancada; texto: string; pilha: LayoutBancada["pilhas"][number] | null }) {
  const largura = Math.min(LARGURA - 16, texto.length * 6.9 + 20);
  const limitar = (x: number) => Math.min(Math.max(x, largura / 2 + 8), LARGURA - largura / 2 - 8);
  let xc: number;
  let y: number;
  let de: [number, number];
  let para: [number, number];
  if (alvo === "bandeja") {
    xc = limitar(L.bandeja.x + L.bandeja.largura / 2 - 30);
    y = L.bandeja.y - 16;
    de = [xc + largura / 2 - 14, y + 12];
    para = [L.bandeja.x + L.bandeja.largura / 2 + 20, L.bandeja.y + 18];
  } else if (alvo === "bicas" || alvo.startsWith("bica:")) {
    const i = alvo.startsWith("bica:") ? Number(alvo.slice(5)) : -1;
    const lb = L.bicas[i] ?? L.bicas[Math.floor(L.bicas.length / 2)];
    xc = limitar(lb ? lb.cx : LARGURA / 2);
    y = lb ? lb.conteudo.y + 20 : L.esteira.y + 60;
    de = [xc + largura / 2 - 16, y - 12];
    para = [lb ? lb.cx + 10 : xc, lb ? lb.bicaY + 24 : y - 30];
  } else if (alvo === "fatiador" && L.fatiador) {
    xc = limitar(L.fatiador.x + L.fatiador.largura + 20 + largura / 2);
    y = L.fatiador.y + 14;
    de = [xc - largura / 2 - 2, y + 4];
    para = [L.fatiador.x + L.fatiador.largura + 2, L.fatiador.y + 30];
  } else {
    const direita = pilha ? pilha.caixa.x + pilha.caixa.largura : L.esteira.x0 + 60;
    const meio = pilha ? pilha.topo + (L.esteira.y - pilha.topo) / 2 : L.esteira.y - 20;
    xc = limitar(direita + 18 + largura / 2);
    y = Math.max(16, meio - 10);
    de = [xc - largura / 2 - 3, y + 6];
    para = [direita + 6, meio + 6];
  }
  return (
    <g className="anima-esmaecer" aria-hidden="true">
      <SetaCurva de={de} para={para} curva={0.3} />
      <rect x={xc - largura / 2} y={y - 12} width={largura} height={24} rx={8} fill="var(--folha)" stroke="var(--caneta)" strokeWidth={2} />
      <text x={xc} y={y + 0.5} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fill="var(--caneta)" stroke="none" fontWeight={700} className="algarismos">
        {texto}
      </text>
    </g>
  );
}
