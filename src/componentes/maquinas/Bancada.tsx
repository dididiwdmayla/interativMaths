"use client";

/**
 * A bancada de partilha desenhada a traço de tinta. Desenha o estado da simulação e anima a
 * transição do último evento; não decide nada. Toques (e teclado) viram ações que o núcleo aplica.
 * Bica fechada fica a lápis; abrir é passar a caneta. A sobra cai numa bandeja a lápis e ganha um
 * círculo vermelho. Partilha aceita ganha marca-texto nos números.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as EventoPonteiro } from "react";
import { comoRacional, divide, formatar, inteiro, paraNumero, racional } from "@/nucleo/racional/racional";
import { racionalPorExtenso, inteiroPorExtenso } from "@/nucleo/racional/extenso";
import { bicasEmUso, contarPecas, maoLivreLigada, pilhaDe, quantidadeDe, quantidadeNaBica } from "@/nucleo/maquinas/bancada/bancada";
import type { AcaoBancada, Bica as EstadoBica, EstadoBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Pele } from "@/conteudo/peles";
import { Anotacao, Bica, CirculoVermelho, Esteira, FaixaMarcaTexto, Medidor, NumeroAnotado, PassarACaneta, SetaCurva, TRACO, Trilho } from "@/componentes/mundo/kit";
import { CotaCaneta, NumeroSvg } from "./cota";
import { comporUnidades, grade } from "./geometria";
import { calcularLayout, LARGURA, type LayoutBancada } from "./layout";
import { Saco, Unidade } from "./pecas";
import { Receptor } from "./receptores";
import { MenuCorte, type PosicaoMenu } from "./MenuCorte";

export type AlvoBancada = "esteira" | "pilha" | "bicas" | "bandeja" | "fatiador" | `bica:${number}`;

export interface MarcasBancada {
  /** Partilha aceita: marca-texto nos números. */
  readonly aceita?: boolean;
  /** Bicas que chamam atenção (carga diferente, passou do teto). */
  readonly bicasAtencao?: readonly number[];
  /** A sobra na esteira chama atenção (ficou no pátio). */
  readonly sobraAtencao?: boolean;
  /** Acertou: a anotação "fechou" à mão, em verde-escuro. */
  readonly fechou?: boolean;
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
  /** A chegada de um passo: as peças novas entram pela esteira e a bica nova abre. */
  chegada?: { readonly pecasNovas: readonly { readonly tamanho: string; readonly quantidade: number }[]; readonly bicasAbriram: readonly number[] } | null;
  /** O que cada bica precisa mostrar, a lápis, enquanto está vazia ("2/8?"). */
  metas?: Readonly<Record<number, string>>;
  /** O canto inferior direito é da bolinha do Nônio: a bandeja vai para a esquerda. */
  cantoNonio?: boolean;
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

/** "Broa inteira", "Pedaço de um quarto". */
function nomeDaPeca(pele: Pele, tamanho: { n: number; d: number }): string {
  if (tamanho.d === 1 && tamanho.n === 1) return `${pele.peca.singular[0].toUpperCase()}${pele.peca.singular.slice(1)} ${pele.peca.genero === "f" ? "inteira" : "inteiro"}`;
  return `${pele.pedaco.singular[0].toUpperCase()}${pele.pedaco.singular.slice(1)} de ${racionalPorExtenso(racional(tamanho.n, tamanho.d))}`;
}

/** As partes em que o fatiador corta esta peça (o pedaço não pode passar do menor permitido). */
function partesValidas(e: EstadoBancada, tamanho: string): number[] {
  const f = e.config.fatiador;
  if (!f) return [];
  const t = comoRacional(tamanho);
  return f.partes.filter((p) => divide(t, inteiro(p)).d <= f.denominadorMaximo);
}

/** Qual peça devolver de uma mesa: a do tamanho escolhido, se ela tiver; senão, a menor. */
function pecaParaDevolver(b: EstadoBica, escolhida: string | null): string | null {
  if (b.pecas.length === 0) return null;
  if (escolhida && pilhaDe(b.pecas, escolhida)) return escolhida;
  const menor = b.pecas[b.pecas.length - 1].tamanho;
  return `${menor.n}/${menor.d}`;
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
  chegada = null,
  metas,
  cantoNonio = false,
}: PropsBancada) {
  const id = useId().replace(/:/g, "");
  // A chegada: a bica nova começa a lápis e passa a caneta; as peças novas entram pela esteira.
  const temChegada = chegada !== null;
  const [chegou, setChegou] = useState(!temChegada);
  useEffect(() => {
    if (!temChegada) return;
    const t = setTimeout(() => setChegou(true), 650);
    return () => clearTimeout(t);
  }, [temChegada]);
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
  const L = calcularLayout(estado, forma, proporcao ?? medida.proporcao, cantoNonio);
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

  /* ---------- Mão livre: escolher a peça, pôr na mesa, devolver, arrastar, cortar ---------- */
  const mao = mexivel && maoLivreLigada(estado.config) && !estado.fechada;
  const [armada, setArmada] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [arraste, setArraste] = useState<{ chave: string; x: number; y: number } | null>(null);
  const toque = useRef<{ chave: string; x: number; y: number; ativo: boolean } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pilhaArmada = armada && mao && pilhaSel ? pilhaSel : null;
  const menuPilha = menu !== null && mexivel && !estado.fechada ? (L.pilhas.find((p) => p.chave === menu) ?? null) : null;

  const paraSvg = (cx: number, cy: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const r = pt.matrixTransform(m.inverse());
    return { x: r.x, y: r.y };
  };
  const bicaEm = (x: number, y: number): number | null => {
    const lb = L.bicas.find((b) => Math.abs(x - b.cx) <= b.largura / 2 && y >= b.bicaY - 10 && y <= b.rotuloY + 24);
    return lb ? lb.indice : null;
  };
  /**
   * Primeiro toque: escolhe a peça (anel azul). Se ela não dá uma volta inteira e há fatiador, o
   * menu de corte já abre. Segundo toque na mesma peça: abre o menu; terceiro: solta.
   */
  const tocarPilha = (chave: string) => {
    if (!onAcao) return;
    if (estado.pilha !== chave) onAcao({ tipo: "pilha", tamanho: chave });
    const cortavel = partesValidas(estado, chave).length > 0;
    const jaEscolhida = mao ? armada && estado.pilha === chave : menu === chave;
    if (!jaEscolhida) {
      if (mao) setArmada(true);
      const p = pilhaDe(estado.esteira, chave);
      const naoDaVolta = p !== null && p.quantidade < Math.max(1, estado.bicas.filter((b) => b.aberta).length);
      setMenu(cortavel && (naoDaVolta || !mao) ? chave : null);
      return;
    }
    if (cortavel && menu !== chave) {
      setMenu(chave);
      return;
    }
    soltar();
  };
  const tocarMesa = (i: number) => {
    if (!onAcao || !mao) return;
    setMenu(null);
    if (pilhaArmada) {
      // Uma peça por escolha: o gesto seguinte é de novo "toque numa peça, depois numa mesa".
      onAcao({ tipo: "colocar", tamanho: pilhaArmada.chave, bica: i });
      setArmada(false);
      return;
    }
    const t = pecaParaDevolver(estado.bicas[i], null);
    if (t) onAcao({ tipo: "devolver", bica: i, tamanho: t });
  };
  const soltar = () => {
    setArmada(false);
    setMenu(null);
  };
  const ponteiroDesce = (e: EventoPonteiro<SVGGElement>, chave: string) => {
    if (!mexivel) return;
    toque.current = { chave, x: e.clientX, y: e.clientY, ativo: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const ponteiroMove = (e: EventoPonteiro<SVGGElement>) => {
    const t = toque.current;
    if (!t || !mao) return;
    if (!t.ativo && Math.hypot(e.clientX - t.x, e.clientY - t.y) > 8) t.ativo = true;
    if (t.ativo) {
      const p = paraSvg(e.clientX, e.clientY);
      if (p) setArraste({ chave: t.chave, x: p.x, y: p.y });
    }
  };
  const ponteiroSobe = (e: EventoPonteiro<SVGGElement>) => {
    const t = toque.current;
    toque.current = null;
    setArraste(null);
    if (!t) return;
    if (!t.ativo) {
      tocarPilha(t.chave);
      return;
    }
    const p = paraSvg(e.clientX, e.clientY);
    const destino = p ? bicaEm(p.x, p.y) : null;
    if (destino === null || !onAcao) return;
    if (estado.pilha !== t.chave) onAcao({ tipo: "pilha", tamanho: t.chave });
    onAcao({ tipo: "colocar", tamanho: t.chave, bica: destino });
    setMenu(null);
  };
  const posicaoMenu = (lp: LayoutBancada["pilhas"][number]): PosicaoMenu => {
    const W = medida.largura;
    const H = medida.largura * (proporcao ?? medida.proporcao);
    const s = Math.min(W / LARGURA, H / L.altura);
    const offX = (W - LARGURA * s) / 2;
    const offY = (H - L.altura * s) / 2;
    const n = partesValidas(estado, lp.chave).length;
    const larguraMenu = n * 40 + (n - 1) * 6 + 22;
    const direita = offX + (lp.caixa.x + lp.caixa.largura + 10) * s;
    const top = Math.max(2, offY + (lp.topo - 30) * s);
    if (direita + larguraMenu <= W - 2) return { left: direita, top, lado: "esquerda" };
    const esquerda = offX + (lp.caixa.x - 10) * s - larguraMenu;
    if (esquerda >= 2) return { left: esquerda, top, lado: "direita" };
    // Sem lugar ao lado: o menu desce para baixo da peça, sem cobri-la.
    const centro = offX + (lp.caixa.x + lp.caixa.largura / 2) * s;
    return { left: Math.min(Math.max(2, centro - 24), W - larguraMenu - 2), top: offY + (L.esteira.y + 12) * s, lado: "cima", seta: centro - Math.min(Math.max(2, centro - 24), W - larguraMenu - 2) - 8 };
  };

  return (
    <div
      ref={caixaRef}
      className={`bancada-caixa relative ${className ?? ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") soltar();
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGURA} ${L.altura}`}
        role="group"
        aria-label={rotulo ?? "Bancada de partilha"}
        aria-describedby={`${id}-desc`}
        preserveAspectRatio="xMidYMid meet"
        data-seq={estado.seq}
        className="traco-fixo"
      >
        <desc id={`${id}-desc`}>{descreverBancada(estado, pele)}</desc>

        {L.fatiador && <Fatiador L={L} partes={estado.partes} seq={ev?.tipo === "fatia" || ev?.tipo === "cortou" ? estado.seq : null} realcado={realcar("fatiador")} />}

        <Esteira id={`${id}-esteira`} x0={L.esteira.x0} x1={L.esteira.x1} y={L.esteira.y} />

        {/* Pilhas na esteira */}
        {L.pilhas.map((lp) => {
          const sel = lp.chave === estado.pilha;
          const escolhida = pilhaArmada?.chave === lp.chave;
          const k = lp.pilha.quantidade;
          const rotuloPilha = mao
            ? `${nomeDaPeca(pele, lp.pilha.tamanho)}, na esteira${k > 1 ? ` (${k})` : ""}${escolhida ? ", escolhida" : ""}`
            : `Pilha: ${nomeQuantidade(pele, lp.pilha.tamanho, k)}${sel ? ", escolhida" : ""}`;
          const cx = lp.caixa.x + lp.caixa.largura / 2;
          const tremor = engasgo && sel;
          const cortou = (ev?.tipo === "cortou" || ev?.tipo === "fatia") && ev.novo === lp.chave;
          const novas = chegada?.pecasNovas.find((x) => x.tamanho === lp.chave) ?? null;
          return (
            <g
              key={lp.chave}
              role={mexivel ? "button" : undefined}
              tabIndex={mexivel ? 0 : undefined}
              aria-label={rotuloPilha}
              aria-pressed={mexivel ? (mao ? escolhida : sel) : undefined}
              data-focavel={mexivel ? "" : undefined}
              data-pilha={lp.chave}
              data-peca={mexivel ? lp.chave : undefined}
              data-escolhida={escolhida ? "sim" : undefined}
              onPointerDown={mexivel ? (e) => ponteiroDesce(e, lp.chave) : undefined}
              onPointerMove={mexivel ? ponteiroMove : undefined}
              onPointerUp={mexivel ? ponteiroSobe : undefined}
              onPointerCancel={() => {
                toque.current = null;
                setArraste(null);
              }}
              onKeyDown={mexivel ? (e) => ativarComTeclado(e, () => tocarPilha(lp.chave)) : undefined}
              style={{ cursor: mexivel ? "pointer" : undefined }}
            >
              <rect x={lp.caixa.x - 4} y={lp.topo - 26} width={lp.caixa.largura + 8} height={L.esteira.y - lp.topo + 44} rx={8} fill="transparent" stroke="none" />
              <rect className="anel-foco" x={lp.caixa.x - 4} y={lp.topo - 6} width={lp.caixa.largura + 8} height={L.esteira.y - lp.topo + 24} rx={8} />
              <g key={tremor ? `tremor-${estado.seq}` : cortou ? `corte-${estado.seq}` : "parada"} className={tremor ? "anima-engasgo" : cortou ? "anima-fatia" : novas ? "anima-chegada" : undefined}>
                <PilhaDesenho lp={lp} forma={forma} raio={L.raioPilha} />
              </g>
              {novas && (
                <g className="anima-esmaecer" aria-hidden="true" data-chegaram={novas.quantidade}>
                  {letraDeMao ? (
                    <Anotacao x={lp.caixa.x + lp.caixa.largura + 8} y={lp.topo + 6} inclinacao={-4}>
                      + <NumeroAnotado tamanho={16}>{novas.quantidade}</NumeroAnotado>
                    </Anotacao>
                  ) : (
                    <text x={lp.caixa.x + lp.caixa.largura + 8} y={lp.topo + 8} fontSize={15} fontWeight={800} fill="var(--caneta)" stroke="none">
                      {`+${novas.quantidade}`}
                    </text>
                  )}
                </g>
              )}
              {sel && mexivel && !mao && <line x1={lp.caixa.x - 2} x2={lp.caixa.x + lp.caixa.largura + 2} y1={L.esteira.y + 19} y2={L.esteira.y + 19} stroke="var(--caneta)" strokeWidth={3} strokeLinecap="round" />}
              {escolhida && (
                <rect
                  x={lp.caixa.x - 7}
                  y={lp.topo - 7}
                  width={lp.caixa.largura + 14}
                  height={L.esteira.y - lp.topo + 10}
                  rx={14}
                  fill="none"
                  stroke="var(--caneta)"
                  strokeWidth={2.6}
                  aria-hidden="true"
                  data-anel=""
                />
              )}
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
                <PassarACaneta feito={b.aberta && (chegou || !chegada?.bicasAbriram.includes(lb.indice))}>
                  <Bica cx={lb.cx} y={lb.bicaY} />
                </PassarACaneta>
              </g>

              {/* Conteúdo e receptor: a lápis enquanto a bica não foi usada */}
              <Conteudo forma={forma} caixa={lb.conteudo} unidades={unidades} pecas={b.pecas} raioMax={L.raioConteudo} />
              {metas?.[lb.indice] && b.pecas.length === 0 && (
                <text x={xConteudo} y={lb.conteudo.y + lb.conteudo.altura / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--tinta-suave)" stroke="none" className="algarismos" aria-hidden="true">
                  {metas[lb.indice]}
                </text>
              )}
              {estado.config.nomesBicas?.[lb.indice] && (
                <text x={lb.cx - lb.largura / 2 + 8} y={lb.conteudo.y - 4} fontSize={14} fontWeight={800} fill="var(--tinta)" stroke="none" aria-hidden="true">
                  {estado.config.nomesBicas[lb.indice]}
                </text>
              )}
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
                  pecas={forma !== "saco" && pecas > 0 && !(b.pecas.some((x) => x.tamanho.d === 1) && b.pecas.some((x) => x.tamanho.d !== 1)) ? pecas : null}
                  estreita={lb.largura < 44}
                  marcado={marcas.aceita === true && emUso}
                  fracionaria={forma !== "saco"}
                  inteiras={b.pecas.length === 1 && b.pecas[0].tamanho.n === 1 && b.pecas[0].tamanho.d === 1 ? b.pecas[0].quantidade : null}
                  generoInteira={pele.peca.genero === "f" ? "inteira" : "inteiro"}
                />
              )}
              {mao && (
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={rotuloMesa(pele, lb.indice, q, pilhaArmada ? nomeDaPeca(pele, pilhaArmada.pilha.tamanho).toLowerCase() : null, b, estado.config.nomesBicas)}
                  data-focavel=""
                  data-receptor={lb.indice}
                  onClick={() => tocarMesa(lb.indice)}
                  onKeyDown={(e) => ativarComTeclado(e, () => tocarMesa(lb.indice))}
                  style={{ cursor: pilhaArmada || b.pecas.length > 0 ? "pointer" : undefined }}
                >
                  <rect x={lb.cx - lb.largura / 2 + 2} y={lb.conteudo.y - 6} width={lb.largura - 4} height={lb.rotuloY + 18 - lb.conteudo.y} rx={10} fill="transparent" stroke="none" />
                  <rect className="anel-foco" x={lb.cx - lb.largura / 2 + 4} y={lb.conteudo.y - 4} width={lb.largura - 8} height={lb.rotuloY + 14 - lb.conteudo.y} rx={10} />
                  {pilhaArmada && b.aberta && (
                    <rect
                      x={lb.cx - lb.largura / 2 + 5}
                      y={lb.conteudo.y - 3}
                      width={lb.largura - 10}
                      height={lb.receptorY + 8 - lb.conteudo.y}
                      rx={10}
                      fill="none"
                      stroke="var(--caneta)"
                      strokeWidth={2}
                      strokeDasharray="6 5"
                      aria-hidden="true"
                    />
                  )}
                </g>
              )}
              {atencao && <CirculoVermelho cx={lb.cx} cy={(lb.conteudo.y + lb.rotuloY + 30) / 2} rx={lb.largura / 2 - 1} ry={(lb.rotuloY + 30 - lb.conteudo.y) / 2 + 6} semente={lb.indice + 5} />}
              {marcas.aceita === true && emUso && lb.largura >= 40 && <VistoVerde x={lb.medidor.x + lb.medidor.largura / 2} y={lb.medidor.y - 12} />}
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
          <g key={`voo-${estado.seq}`} aria-hidden="true" style={{ pointerEvents: "none" }}>
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

        {/* A mão: a peça desliza da esteira até a mesa, ou volta */}
        {(ev?.tipo === "colocou" || ev?.tipo === "devolveu") && L.bicas[ev.bica] && (
          <VooDaMao
            key={`mao-${estado.seq}`}
            forma={forma}
            tamanho={ev.tamanho}
            de={ev.tipo === "colocou" ? origemNaEsteira(L, ev.tamanho) : centroDaBica(L, ev.bica)}
            para={ev.tipo === "colocou" ? centroDaBica(L, ev.bica) : origemNaEsteira(L, ev.tamanho)}
          />
        )}
        {arraste && (
          <g transform={`translate(${arraste.x} ${arraste.y})`} opacity={0.85} style={{ pointerEvents: "none" }} aria-hidden="true">
            {forma === "saco" ? (
              <Saco x={0} y={0} r={9} />
            ) : (
              <Unidade forma={forma} x={0} y={0} r={14} unidade={comporUnidades([{ tamanho: comoRacional(arraste.chave), quantidade: 1 }])[0]} contorno={false} />
            )}
          </g>
        )}
        {cotaExtra && <CotaExtra L={L} alvo={cotaExtra.alvo} texto={cotaExtra.texto} pilha={pilhaSel} />}
        {marcas.fechou && letraDeMao && (
          <g className="anima-esmaecer" aria-hidden="true">
            <Anotacao x={LARGURA - 14} y={36} ancora="end" tamanho={30} inclinacao={-6} cor="var(--verde-escuro)">
              fechou
            </Anotacao>
          </g>
        )}
      </svg>
      {menuPilha && (
        <MenuCorte
          key={menuPilha.chave}
          posicao={posicaoMenu(menuPilha)}
          partes={partesValidas(estado, menuPilha.chave)}
          quantidade={menuPilha.pilha.quantidade}
          nomePeca={nomeDaPeca(pele, menuPilha.pilha.tamanho).toLowerCase()}
          onCortar={(partes, todas) => {
            onAcao?.({ tipo: "cortar", tamanho: menuPilha.chave, partes, quantidade: todas ? "todas" : 1 });
            setMenu(null);
          }}
          onFechar={soltar}
        />
      )}
    </div>
  );
}

function rotuloMesa(pele: Pele, i: number, q: ReturnType<typeof quantidadeNaBica>, escolhida: string | null, b: EstadoBica, nomes?: readonly string[]): string {
  const nome = `${pele.receptor.singular[0].toUpperCase()}${pele.receptor.singular.slice(1)} ${nomes?.[i] ?? i + 1}`;
  const tem = q.n === 0 ? (pele.receptor.genero === "f" ? "vazia" : "vazio") : quantidadeComNomeDaPele(q, pele);
  if (escolhida) return `${nome}: ${tem}. Pôr ${escolhida} aqui.`;
  if (b.pecas.length > 0) return `${nome}: ${tem}. Devolver uma peça à esteira.`;
  return `${nome}: ${tem}.`;
}

function quantidadeComNomeDaPele(q: ReturnType<typeof quantidadeNaBica>, pele: Pele): string {
  if (q.d === 1) return `${inteiroPorExtenso(q.n, pele.peca.genero)} ${q.n === 1 ? pele.peca.singular : pele.peca.plural}`;
  return racionalPorExtenso(q, { misto: true });
}

function origemNaEsteira(L: LayoutBancada, tamanho: string): [number, number] {
  const lp = L.pilhas.find((p) => p.chave === tamanho) ?? L.pilhas[0];
  if (!lp) return [L.esteira.x0 + 30, L.esteira.y - 18];
  return [lp.caixa.x + lp.caixa.largura / 2, lp.topo + (L.esteira.y - lp.topo) / 2];
}

function centroDaBica(L: LayoutBancada, i: number): [number, number] {
  const lb = L.bicas[i];
  return [lb.conteudo.x + lb.conteudo.largura / 2, lb.conteudo.y + lb.conteudo.altura - 16];
}

/** Uma peça que desliza (só transform), em 220 ms. */
function VooDaMao({ forma, tamanho, de, para }: { forma: Pele["peca"]["forma"]; tamanho: string; de: [number, number]; para: [number, number] }) {
  return (
    <g aria-hidden="true" style={{ pointerEvents: "none" }}>
      <g className="anima-pousa" style={{ ["--dx" as string]: `${para[0] - de[0]}px`, ["--dy" as string]: `${para[1] - de[1]}px` }}>
        <g transform={`translate(${de[0]} ${de[1]})`}>
          {forma === "saco" ? (
            <Saco x={0} y={0} r={7} />
          ) : (
            <Unidade forma={forma} x={0} y={0} r={10} unidade={comporUnidades([{ tamanho: comoRacional(tamanho), quantidade: 1 }])[0]} contorno={false} />
          )}
        </g>
      </g>
    </g>
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
  inteiras = null,
  generoInteira = "inteira",
}: {
  cx: number;
  y: number;
  valor: ReturnType<typeof quantidadeNaBica>;
  pecas: number | null;
  estreita: boolean;
  marcado: boolean;
  fracionaria: boolean;
  /** Só peças inteiras na bica: a legenda conta inteiras, como na referência. */
  inteiras?: number | null;
  generoInteira?: "inteira" | "inteiro";
}) {
  const tamanho = estreita ? 13 : 18;
  const centro = valor.d === 1 ? y + 12 : y + 22;
  const legenda = pecas === null ? null : inteiras !== null ? (inteiras === 1 ? `1 ${generoInteira}` : `${inteiras} ${generoInteira}s`) : pecas === 1 ? "1 pedaço" : `${pecas} pedaços`;
  const alturaFaixa = valor.d === 1 ? tamanho + 8 : tamanho * 2 + 8;
  const larguraFaixa = estreita ? 26 : 40;
  return (
    <g aria-hidden="true">
      {marcado && <FaixaMarcaTexto x={cx - larguraFaixa / 2} y={centro - alturaFaixa / 2} largura={larguraFaixa} altura={alturaFaixa} cresce />}
      <NumeroSvg valor={valor} x={cx} y={centro} tamanho={tamanho} escalaFracao={1} />
      {fracionaria && legenda !== null && !estreita && (
        <text x={cx} y={y + 52} textAnchor="middle" fontSize={12} fontWeight={500} fill="var(--tinta-suave)" stroke="none" className="algarismos">
          {legenda}
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
  const t = { stroke: "var(--contorno)", strokeWidth: TRACO, strokeLinejoin: "round" as const };
  return (
    <g aria-hidden="true">
      <rect x={c.x + 4} y={c.y + 6} width={7} height={c.altura - 24} rx={2} fill="var(--caneta-clara)" {...t} />
      <rect x={c.x + c.largura - 11} y={c.y + 6} width={7} height={c.altura - 24} rx={2} fill="var(--caneta-clara)" {...t} />
      <g key={seq ?? "lamina"} className={seq !== null ? "anima-lamina" : undefined}>
        <path d={`M ${c.x + 11} ${c.y + 12} H ${c.x + c.largura - 11} V ${c.y + 24} L ${c.x + 11} ${c.y + 36} Z`} fill="var(--folha)" {...t} />
      </g>
      <rect x={c.x} y={c.y} width={c.largura} height={10} rx={4} fill="var(--caneta)" {...t} />
      <rect x={c.x + 2} y={c.y + c.altura - 22} width={c.largura - 4} height={22} rx={6} fill="var(--marca-texto)" {...t} />
      <text x={cx} y={c.y + c.altura - 11} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fontWeight={700} fill="var(--sobre-marca)" stroke="none">
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
        <path d={`M ${c.x + 48} ${fundo - 12} L ${c.x + 54} ${fundo} H ${c.x + c.largura - 6} L ${c.x + c.largura} ${fundo - 12} Z`} fill="var(--folha)" stroke="var(--contorno)" />
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

/** O Nônio aponta: um círculo a lápis azul que pulsa, enquanto a fala está na tela. */
function AnelRealce({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <g className="anima-realce" style={{ pointerEvents: "none" }} data-realce="">
      <CirculoVermelho cx={x} cy={y} rx={rx} ry={ry} semente={7} cor="var(--caneta)" />
    </g>
  );
}

/** Visto verde de um receptor que fechou. */
function VistoVerde({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true" className="anima-esmaecer" data-visto="">
      <circle cx={x} cy={y} r={10} fill="var(--verde)" stroke="var(--contorno)" strokeWidth={2} />
      <path d={`M ${x - 4.5} ${y + 0.5} l 3 3 l 6 -6.5`} fill="none" stroke="var(--sobre-verde)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
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
