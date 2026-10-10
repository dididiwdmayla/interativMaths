"use client";

/**
 * A bancada de partilha desenhada. Desenha o estado da simulação e anima a transição do último
 * evento; não decide nada. Toques (e teclado) viram ações que o núcleo aplica.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { formatar, paraNumero, racional } from "@/nucleo/racional/racional";
import { racionalPorExtenso, inteiroPorExtenso } from "@/nucleo/racional/extenso";
import {
  bicasEmUso,
  contarPecas,
  quantidadeDe,
  quantidadeNaBica,
} from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { Cano, Engrenagem, Lampada, Placa, Rebite, Rolo, Viga, Volante } from "@/componentes/mundo/kit";
import { CotaH, NumeroSvg, corDaCota, type TomCota } from "./cota";
import { comporUnidades, grade } from "./geometria";
import { calcularLayout, LARGURA, type LayoutBancada } from "./layout";
import { Saco, Unidade } from "./pecas";
import { Receptor } from "./receptores";

export type AlvoBancada = "esteira" | "pilha" | "bicas" | "bandeja" | "fatiador" | `bica:${number}`;

export interface MarcasBancada {
  /** Partilha aceita: luzes acesas. */
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
  const id = useId();
  const forma = pele.peca.forma;
  const caixaRef = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState(0.62);
  useEffect(() => {
    if (proporcao !== undefined) return;
    const el = caixaRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entradas) => {
      const r = entradas[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) setMedida(Math.round((r.height / r.width) * 50) / 50);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [proporcao]);
  const L = calcularLayout(estado, forma, proporcao ?? medida);
  const ev = estado.evento;
  const mexivel = onAcao !== undefined;
  const pilhaSel = L.pilhas.find((p) => p.chave === estado.pilha) ?? null;
  const carroX = pilhaSel ? pilhaSel.caixa.x + pilhaSel.caixa.largura / 2 : L.esteira.x0 + 30;
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
    >
      <desc id={`${id}-desc`}>{descreverBancada(estado, pele)}</desc>

      <Chassi L={L} />

      {L.fatiador && <Fatiador L={L} partes={estado.partes} seq={ev?.tipo === "fatia" ? estado.seq : null} realcado={realcar("fatiador")} />}

      <Esteira L={L} />

      {/* Pilhas na esteira */}
      {L.pilhas.map((lp) => {
        const sel = lp.chave === estado.pilha;
        const acao = () => onAcao?.({ tipo: "pilha", tamanho: lp.chave });
        const atencao = marcas.sobraAtencao === true;
        const rotuloPilha = `Pilha: ${nomeQuantidade(pele, lp.pilha.tamanho, lp.pilha.quantidade)}${sel ? ", escolhida" : ""}`;
        const cx = lp.caixa.x + lp.caixa.largura / 2;
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
            <rect x={lp.caixa.x - 4} y={lp.caixa.y - 4} width={lp.caixa.largura + 8} height={lp.caixa.altura + 14} rx={6} fill="transparent" />
            <rect className="anel-foco" x={lp.caixa.x - 4} y={lp.caixa.y - 4} width={lp.caixa.largura + 8} height={lp.caixa.altura + 14} rx={6} />
            <PilhaDesenho lp={lp} forma={forma} tom={atencao ? "sobra" : "normal"} raio={L.raioPilha} />
            {sel && mexivel && (
              <path
                d={`M ${lp.caixa.x - 2} ${L.esteira.y + 10} l 0 4 l ${lp.caixa.largura + 4} 0 l 0 -4`}
                fill="none"
                stroke="var(--turquesa)"
                strokeWidth={2}
              />
            )}
            {cotas && (
              <CotaH x1={lp.caixa.x} x2={lp.caixa.x + lp.caixa.largura} y={lp.topo - 6} tom={atencao ? "atencao" : "normal"} rotuloY={lp.topo - 13}>
                <RotuloPilha k={lp.pilha.quantidade} tamanho={lp.pilha.tamanho} cor={corDaCota(atencao ? "atencao" : "normal")} />
              </CotaH>
            )}
            {realcar("pilha") && sel && <AnelRealce x={cx} y={lp.caixa.y + lp.caixa.altura / 2} r={lp.caixa.largura / 2 + 8} />}
          </g>
        );
      })}
      {estado.esteira.length === 0 && (
        <text x={(L.esteira.x0 + L.esteira.x1) / 2} y={L.esteira.y - 16} textAnchor="middle" fontSize={10} fill="var(--texto-mundo-apagado)">
          esteira vazia
        </text>
      )}
      {realcar("esteira") && <AnelRealce x={(L.esteira.x0 + L.esteira.x1) / 2} y={L.esteira.y - 18} r={70} />}

      {/* Engasgo: a cota do que faltou */}
      {engasgo && (
        <g key={`engasgo-${estado.seq}`} className="anima-esmaecer">
          <rect x={carroX - 62} y={L.esteira.y + 2} width={124} height={15} rx={3} fill="var(--noite-funda)" stroke="var(--vermelhao)" strokeWidth={0.8} />
          <text x={carroX} y={L.esteira.y + 10} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="var(--vermelhao-claro)" fontWeight={700} className="algarismos">
            {`pede ${engasgo.pedido} · há ${engasgo.ha} · faltam ${engasgo.pedido - engasgo.ha}`}
          </text>
        </g>
      )}

      {/* Trilho, carro e bicas */}
      {L.trilhos.map((t, i) => (
        <g key={i}>
          <Viga x={t.x0} y={t.y} largura={t.x1 - t.x0} altura={7} rebites={6} />
          {i > 0 && <Cano x={t.x1 - 4} y1={L.trilhos[0].y + 6} y2={t.y + 2} largura={4} />}
        </g>
      ))}
      <g style={{ transform: `translateX(${carroX}px)`, transition: "transform var(--t-assentar) var(--curva-mecanica)" }} aria-hidden="true">
        <g className={engasgo ? "anima-engasgo" : undefined} key={engasgo ? `carro-${estado.seq}` : "carro"}>
          <rect x={-9} y={L.trilhos[0].y - 10} width={18} height={10} rx={2} fill="var(--aco)" />
          <rect x={-9} y={L.trilhos[0].y - 4} width={18} height={4} fill="var(--aco-sombra)" />
          <line x1={0} y1={L.trilhos[0].y - 10} x2={0} y2={L.esteira.y + 6} stroke="var(--aco-claro)" strokeWidth={1.2} />
          <Rebite x={-5} y={L.trilhos[0].y - 7} r={1.2} />
          <Rebite x={5} y={L.trilhos[0].y - 7} r={1.2} />
        </g>
      </g>

      {L.bicas.map((lb) => {
        const b = estado.bicas[lb.indice];
        const q = quantidadeNaBica(b);
        const emUso = b.aberta || b.pecas.length > 0;
        const ajustavel = estado.config.bicas.ajustavel && mexivel;
        const atencao = marcas.bicasAtencao?.includes(lb.indice) ?? false;
        const lampada = atencao ? "atencao" : marcas.aceita && emUso ? "acesa" : b.aberta ? "piloto" : "apagada";
        const acao = () => onAcao?.({ tipo: "bica", indice: lb.indice });
        const fracao = paraNumero(q) / paraNumero(L.escala);
        const unidades = comporUnidades(b.pecas);
        const pecas = contarPecas(b.pecas);
        return (
          <g key={lb.indice} data-bica={lb.indice} data-aberta={b.aberta ? "sim" : "nao"} data-quantidade={formatar(q)}>
            <Cano x={lb.cx - 3} y1={lb.canoY1} y2={lb.canoY2} apagado={!b.aberta} />
            <path d={`M ${lb.cx - 10} ${lb.canoY2} L ${lb.cx + 4} ${lb.canoY2} L ${lb.cx} ${lb.canoY2 + 5} L ${lb.cx - 6} ${lb.canoY2 + 5} Z`} fill="var(--aco-sombra)" opacity={b.aberta ? 1 : 0.5} />
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
              <circle cx={lb.cx - 3} cy={lb.volanteY} r={Math.min(16, lb.largura / 2 - 2)} fill="transparent" />
              <circle className="anel-foco" cx={lb.cx - 3} cy={lb.volanteY} r={10} />
              <Volante x={lb.cx - 3} y={lb.volanteY} r={6.5} mexivel={ajustavel} aberto={b.aberta} />
            </g>
            <Lampada x={lb.cx + 9} y={lb.volanteY} r={2.6} estado={lampada} />

            {/* Conteúdo */}
            <Conteudo forma={forma} caixa={lb.conteudo} unidades={unidades} pecas={b.pecas} raioMax={L.raioConteudo} />
            <Receptor forma={pele.receptor.forma} cx={lb.cx} y={lb.receptorY} largura={lb.largura} />

            {/* Medidor de nível */}
            <g>
              <rect x={lb.medidor.x - 1} y={lb.medidor.y - 1} width={lb.medidor.largura + 2} height={lb.medidor.altura + 2} rx={2} fill="var(--noite-funda)" stroke={atencao ? "var(--vermelhao)" : "var(--aco)"} strokeWidth={0.8} />
              <rect
                x={lb.medidor.x}
                y={lb.medidor.y}
                width={lb.medidor.largura}
                height={lb.medidor.altura}
                fill={marcas.aceita && emUso ? "var(--ambar)" : "var(--mostarda)"}
                style={{
                  transform: `scaleY(${Math.min(1, fracao)})`,
                  transformOrigin: `${lb.medidor.x}px ${lb.medidor.y + lb.medidor.altura}px`,
                  transformBox: "view-box",
                  transition: "transform 480ms var(--curva-mecanica), fill var(--t-luz)",
                }}
              />
              {L.marcas.map((m, k) => (
                <line key={k} x1={lb.medidor.x - 1.5} x2={lb.medidor.x + lb.medidor.largura * 0.5} y1={lb.medidor.y + lb.medidor.altura * (1 - m)} y2={lb.medidor.y + lb.medidor.altura * (1 - m)} stroke="var(--aco)" strokeWidth={0.7} />
              ))}
              {estado.config.teto !== undefined && (
                <line
                  x1={lb.medidor.x - 3}
                  x2={lb.medidor.x + lb.medidor.largura + 3}
                  y1={lb.medidor.y + lb.medidor.altura * (1 - estado.config.teto / paraNumero(L.escala))}
                  y2={lb.medidor.y + lb.medidor.altura * (1 - estado.config.teto / paraNumero(L.escala))}
                  stroke="var(--vermelhao)"
                  strokeWidth={1}
                  strokeDasharray="2 1.4"
                />
              )}
            </g>

            {cotas && (
              <g>
                <NumeroSvg valor={q} x={lb.cx - 3} y={lb.rotuloY + 6} tamanho={lb.largura < 44 ? 9 : 11} cor={atencao ? "var(--vermelhao-claro)" : marcas.aceita ? "var(--ambar)" : "var(--texto-mundo)"} />
                {forma !== "saco" && pecas > 0 && (
                  <text x={lb.cx - 3} y={lb.rotuloY + 19} textAnchor="middle" fontSize={7.5} fill="var(--texto-mundo-apagado)" className="algarismos">
                    {pecas === 1 ? "1 pedaço" : `${pecas} pedaços`}
                  </text>
                )}
              </g>
            )}
            {(realcar("bicas") || realcar(`bica:${lb.indice}`)) && <AnelRealce x={lb.cx - 3} y={lb.conteudo.y + 26} r={Math.min(30, lb.largura / 2)} />}
          </g>
        );
      })}

      {/* Bandeja da sobra */}
      <Bandeja L={L} estado={estado} pele={pele} cotas={cotas} realcado={realcar("bandeja")} />

      {/* Voo das peças numa volta: sai de onde a pilha estava e chega em cada bica aberta */}
      {ev?.tipo === "volta" && (
        <g key={`voo-${estado.seq}`} aria-hidden="true">
          {ev.bicas.map((i) => {
            const lb = L.bicas[i];
            if (!lb) return null;
            const destinoX = lb.cx - 3;
            const destinoY = lb.conteudo.y + 20;
            const t = { n: Number(ev.tamanho.split("/")[0]), d: Number(ev.tamanho.split("/")[1]) };
            const dx = destinoX - carroX;
            const dy = destinoY - (L.esteira.y - 18);
            return (
              <g key={i} className="anima-voo" style={{ ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px` }}>
                <g transform={`translate(${carroX} ${L.esteira.y - 18})`}>
                  {forma === "saco" ? (
                    <Saco x={0} y={0} r={6} />
                  ) : (
                    <Unidade forma={forma} x={0} y={0} r={8} unidade={comporUnidades([{ tamanho: t, quantidade: 1 }])[0]} contorno={false} />
                  )}
                  {ev.lote > 1 && (
                    <text x={10} y={-6} fontSize={8} fill="var(--texto-mundo)" fontWeight={700} className="algarismos">
                      {`×${ev.lote}`}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      )}

      {cotaExtra && <CotaExtra L={L} alvo={cotaExtra.alvo} texto={cotaExtra.texto} carroX={carroX} />}
    </svg>
    </div>
  );
}

function Chassi({ L }: { L: LayoutBancada }) {
  const c = L.chassi;
  return (
    <g aria-hidden="true">
      <rect x={c.x} y={c.y} width={c.largura} height={c.altura} rx={14} fill="var(--noite-clara)" opacity={0.55} />
      <rect x={c.x} y={c.y} width={c.largura} height={c.altura} rx={14} fill="none" stroke="var(--latao-sombra)" strokeWidth={1.2} />
      {[
        [c.x + 9, c.y + 9],
        [c.x + c.largura - 9, c.y + 9],
        [c.x + 9, c.y + c.altura - 9],
        [c.x + c.largura - 9, c.y + c.altura - 9],
      ].map(([x, y]) => (
        <Rebite key={`${x}-${y}`} x={x} y={y} r={2} />
      ))}
    </g>
  );
}

function RotuloPilha({ k, tamanho, cor }: { k: number; tamanho: { n: number; d: number }; cor: string }) {
  if (tamanho.d === 1 && tamanho.n === 1) {
    return (
      <text textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={cor} fontWeight={700} className="algarismos">
        {k}
      </text>
    );
  }
  return (
    <g>
      <text x={-3} textAnchor="end" dominantBaseline="middle" fontSize={10} fill={cor} fontWeight={700} className="algarismos">
        {`${k} ×`}
      </text>
      <NumeroSvg valor={racional(tamanho.n, tamanho.d)} x={1} y={0} tamanho={10} cor={cor} ancora="start" />
    </g>
  );
}

function PilhaDesenho({ lp, forma, tom, raio }: { lp: LayoutBancada["pilhas"][number]; forma: Pele["peca"]["forma"]; tom: "normal" | "sobra"; raio: number }) {
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
          <Saco key={i} x={p.x} y={p.y} r={r} tom={tom} />
        ))}
        {lp.ocultas > 0 && (
          <text x={caixa.x + caixa.largura} y={caixa.y + caixa.altura - r * 5.6} textAnchor="end" fontSize={9} fill="var(--texto-mundo-suave)" className="algarismos">
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
        <Unidade key={i} forma={forma} x={caixa.x + 3 + r * 1.1 + i * r * 2.25} y={caixa.y + caixa.altura - r - 4} r={r} unidade={u} tom={tom} />
      ))}
      {lp.ocultas > 0 && (
        <text x={caixa.x + caixa.largura} y={caixa.y + caixa.altura - r} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="var(--texto-mundo-suave)" className="algarismos">
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
          <text x={caixa.x + caixa.largura} y={caixa.y + 4} textAnchor="end" fontSize={7} fill="var(--texto-mundo-suave)">{`+${n - mostradas}`}</text>
        )}
      </g>
    );
  }
  const mostradas = unidades.slice(0, 4);
  const { centros, raio } = grade(mostradas.length, caixa, { raioMax, colunasMax: 2 });
  return (
    <g>
      {mostradas.map((u, i) => (
        <Unidade key={i} forma={forma} x={centros[i].x} y={centros[i].y} r={raio} unidade={u} />
      ))}
      {unidades.length > 4 && (
        <text x={caixa.x + caixa.largura} y={caixa.y + 4} textAnchor="end" fontSize={7} fill="var(--texto-mundo-suave)">{`+${unidades.length - 4}`}</text>
      )}
    </g>
  );
}

function Esteira({ L }: { L: LayoutBancada }) {
  const { x0, x1, y } = L.esteira;
  const clip = `esteira-${Math.round(x0)}`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={x0 + 8} y={y - 1} width={x1 - x0 - 16} height={9} />
        </clipPath>
      </defs>
      <rect x={x0} y={y - 2} width={x1 - x0} height={12} rx={6} fill="var(--aco-sombra)" />
      <g clipPath={`url(#${clip})`}>
        <g className="ambiente-esteira">
          {Array.from({ length: Math.ceil((x1 - x0) / 16) + 2 }, (_, i) => (
            <rect key={i} x={x0 + i * 16} y={y} width={7} height={2} fill="var(--aco)" />
          ))}
        </g>
      </g>
      <Rolo x={x0 + 6} y={y + 4} r={7} />
      <Rolo x={x1 - 6} y={y + 4} r={7} />
      <rect x={x0 + 20} y={y + 10} width={4} height={14} fill="var(--latao-sombra)" />
      <rect x={x1 - 24} y={y + 10} width={4} height={14} fill="var(--latao-sombra)" />
    </g>
  );
}

function Fatiador({ L, partes, seq, realcado }: { L: LayoutBancada; partes: number; seq: number | null; realcado: boolean }) {
  const c = L.fatiador;
  if (!c) return null;
  const cx = c.x + c.largura / 2;
  return (
    <g aria-hidden="true">
      <rect x={c.x + 4} y={c.y} width={5} height={c.altura} fill="var(--latao)" />
      <rect x={c.x + c.largura - 9} y={c.y} width={5} height={c.altura} fill="var(--latao)" />
      <rect x={c.x + c.largura - 7} y={c.y} width={3} height={c.altura} fill="var(--latao-sombra)" />
      <rect x={c.x + 2} y={c.y - 2} width={c.largura - 4} height={6} rx={1.5} fill="var(--latao-sombra)" />
      <g key={seq ?? "lamina"} className={seq !== null ? "anima-lamina" : undefined}>
        <path d={`M ${c.x + 10} ${c.y + 8} L ${c.x + c.largura - 10} ${c.y + 8} L ${c.x + c.largura - 10} ${c.y + 16} L ${c.x + 10} ${c.y + 22} Z`} fill="var(--aco-claro)" />
        <path d={`M ${c.x + 10} ${c.y + 18} L ${c.x + c.largura - 10} ${c.y + 13} L ${c.x + c.largura - 10} ${c.y + 16} L ${c.x + 10} ${c.y + 22} Z`} fill="var(--aco)" />
      </g>
      <rect x={c.x + 6} y={c.y + c.altura - 8} width={c.largura - 12} height={6} rx={1} fill="var(--madeira)" />
      <Placa x={c.x} y={c.y + c.altura + 2} largura={c.largura} altura={13}>
        {`em ${partes}`}
      </Placa>
      <Engrenagem x={cx} y={c.y + 34} r={6} dentes={7} />
      {realcado && <AnelRealce x={cx} y={c.y + c.altura / 2} r={c.largura / 2 + 6} />}
    </g>
  );
}

function Bandeja({ L, estado, pele, cotas, realcado }: { L: LayoutBancada; estado: EstadoBancada; pele: Pele; cotas: boolean; realcado: boolean }) {
  const c = L.bandeja;
  const sobra = quantidadeDe(estado.bandeja);
  const unidades = comporUnidades(estado.bandeja);
  const forma = pele.peca.forma;
  const n = contarPecas(estado.bandeja);
  const conteudo = { x: c.x + 46, y: c.y + 3, largura: c.largura - 52, altura: c.altura - 12 };
  const itens = forma === "saco" ? Math.min(n, 8) : Math.min(unidades.length, 4);
  const { centros, raio } = grade(itens, conteudo, { raioMax: forma === "saco" ? 6 : 9 });
  return (
    <g data-sobra={formatar(sobra)}>
      <path d={`M ${c.x} ${c.y + c.altura - 12} L ${c.x + 6} ${c.y + c.altura - 2} L ${c.x + c.largura - 6} ${c.y + c.altura - 2} L ${c.x + c.largura} ${c.y + c.altura - 12} Z`} fill="var(--aco)" />
      <path d={`M ${c.x + 6} ${c.y + c.altura - 4} L ${c.x + c.largura - 6} ${c.y + c.altura - 4} L ${c.x + c.largura - 6} ${c.y + c.altura - 2} L ${c.x + 6} ${c.y + c.altura - 2} Z`} fill="var(--aco-sombra)" />
      <Placa x={c.x + 2} y={c.y + 4} largura={40} altura={12}>
        sobra
      </Placa>
      {centros.map((p, i) =>
        forma === "saco" ? (
          <Saco key={i} x={p.x} y={p.y} r={raio} tom="sobra" />
        ) : (
          <Unidade key={i} forma={forma} x={p.x} y={p.y} r={raio} unidade={unidades[i]} tom="sobra" />
        ),
      )}
      {cotas && (
        <NumeroSvg valor={sobra} x={c.x + 22} y={c.y + 27} tamanho={11} cor={sobra.n > 0 ? "var(--vermelhao-claro)" : "var(--texto-mundo-apagado)"} />
      )}
      {realcado && <AnelRealce x={c.x + c.largura / 2} y={c.y + c.altura / 2} r={c.largura / 2} />}
    </g>
  );
}

function AnelRealce({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g aria-hidden="true" className="anima-realce" style={{ pointerEvents: "none" }}>
      <circle cx={x} cy={y} r={r} fill="none" stroke="var(--turquesa-clara)" strokeWidth={1.6} strokeDasharray="4 3" />
    </g>
  );
}

function CotaExtra({ L, alvo, texto, carroX }: { L: LayoutBancada; alvo: AlvoBancada; texto: string; carroX: number }) {
  let x = carroX;
  let y = L.esteira.y + 18;
  if (alvo === "bandeja") {
    x = L.bandeja.x + L.bandeja.largura / 2;
    y = L.bandeja.y - 6;
  } else if (alvo === "bicas" || alvo.startsWith("bica:")) {
    const i = alvo.startsWith("bica:") ? Number(alvo.slice(5)) : -1;
    const lb = L.bicas[i] ?? L.bicas[Math.floor(L.bicas.length / 2)];
    x = lb ? Math.min(Math.max(lb.cx, 90), LARGURA - 90) : LARGURA / 2;
    y = lb ? lb.canoY1 - 6 : y;
  } else if (alvo === "fatiador" && L.fatiador) {
    x = L.fatiador.x + 70;
    y = L.fatiador.y + L.fatiador.altura + 8;
  }
  const largura = Math.min(LARGURA - 20, texto.length * 5.3 + 16);
  const xc = Math.min(Math.max(x, largura / 2 + 8), LARGURA - largura / 2 - 8);
  const tom: TomCota = "destaque";
  return (
    <g className="anima-esmaecer" aria-hidden="true">
      <rect x={xc - largura / 2} y={y - 8} width={largura} height={16} rx={3} fill="var(--noite-funda)" stroke={corDaCota(tom)} strokeWidth={1} />
      <text x={xc} y={y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize={9.5} fill={corDaCota(tom)} fontWeight={700} className="algarismos">
        {texto}
      </text>
    </g>
  );
}
