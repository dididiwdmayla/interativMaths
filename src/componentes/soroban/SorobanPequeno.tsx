"use client";

/**
 * O soroban pequeno, de uma ou duas hastes (referência 2 de v05.html): o exemplo da técnica nova na
 * abertura e o caso parecido do Me ajuda. As contas que vão se mexer ganham borda de caneta e seta;
 * à direita, a ordem (marca-texto), o número em caneta e o que a mão faz ("desce o 5"). No fim,
 * "fica:" e o resultado em marca-texto. Animado (o caso parecido), o caminho passa um movimento por
 * vez e recomeça; com movimento reduzido, as contas mudam sem deslizar.
 */
import { useEffect, useState } from "react";
import { aplicarMovimento, valorDaHaste, type Movimento, type Soroban } from "@/nucleo/soroban/soroban";
import { preencher, textoDoMovimento } from "@/nucleo/soroban/textos";
import { NOMES_POSICAO, PASSOS_SOROBAN, TEXTOS_BANCADA } from "@/conteudo/lapidacao";

const CONTA = "-23,0 -13,-11.5 13,-11.5 23,0 13,11.5 -13,11.5";
const LUZ = "-13,-11.5 13,-11.5 18,-5 -18,-5";
const Y_CIMA = 27;
const Y_CIMA_ENC = 56.5;
const Y_BAIXO_ENC = 92.5;
const PASSO_CONTA = 25;

const xHaste = (i: number) => 42 + 60 * i;
const yBaixo = (k: number, enc: boolean) => Y_BAIXO_ENC + PASSO_CONTA * (enc ? k : k + 1);

/** Onde mora (antes do movimento) a conta que a mão toca, e o que se diz do movimento. */
function passoDoMovimento(s: Soroban, m: Movimento): { y: number; texto: string } {
  const h = s[m.haste];
  const vizinha = m.haste < s.length - 1;
  let y: number;
  let texto: string;
  if (m.cinco !== 0) {
    y = h.cinco ? Y_CIMA_ENC : Y_CIMA;
    texto = m.cinco > 0 ? PASSOS_SOROBAN.desceCinco : PASSOS_SOROBAN.sobeCinco;
  } else if (m.uns > 0) {
    y = yBaixo(h.uns + m.uns - 1, false);
    texto = preencher(PASSOS_SOROBAN.poeBaixo, { n: m.uns });
  } else {
    y = yBaixo(h.uns + m.uns, true);
    texto = preencher(PASSOS_SOROBAN.tiraBaixo, { n: -m.uns });
  }
  if (vizinha) texto = preencher(PASSOS_SOROBAN.naHaste, { texto, haste: NOMES_POSICAO[s.length - 1 - m.haste].rotulo });
  return { y, texto };
}

/** Separa as linhas da direita para não se encostarem (26 de folga). */
function espalhar(ys: readonly number[]): number[] {
  const ordem = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  let ultimo = -Infinity;
  const saida = new Array<number>(ys.length);
  for (const o of ordem) {
    const y = Math.max(o.y, ultimo + 26);
    saida[o.i] = y;
    ultimo = y;
  }
  return saida;
}

function Conta({ cx, cy, encostada, marcada, sentido }: { cx: number; cy: number; encostada: boolean; marcada: boolean; sentido: -1 | 1 }) {
  const seta = encostada ? "var(--sobre-caneta)" : "var(--caneta)";
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <polygon points={CONTA} fill={encostada ? "var(--soroban-conta)" : "var(--soroban-livre)"} stroke="var(--contorno)" strokeWidth={2.2} strokeLinejoin="round" />
      {encostada && <polygon points={LUZ} fill="var(--soroban-conta-luz)" />}
      {marcada && (
        <>
          <polygon points={CONTA} fill="none" stroke="var(--caneta)" strokeWidth={3.2} strokeLinejoin="round" />
          <path d={`M0 ${-6 * sentido} V${6 * sentido}`} stroke={seta} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M-4.5 ${1.5 * sentido} L0 ${7 * sentido} L4.5 ${1.5 * sentido}`} fill="none" stroke={seta} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </g>
  );
}

export function SorobanPequeno({
  inicio,
  movimentos = [],
  modo = "caminho",
  animado = false,
  rotulo,
}: {
  inicio: Soroban;
  movimentos?: readonly Movimento[];
  /** caminho: os passos numerados; leitura: a de cima e as de baixo somadas; sombra: as contas não aparecem. */
  modo?: "caminho" | "leitura" | "sombra";
  animado?: boolean;
  rotulo: string;
}) {
  const n = inicio.length;
  const [quadro, setQuadro] = useState(0);
  useEffect(() => {
    if (!animado || movimentos.length === 0) return;
    const t = setInterval(() => setQuadro((q) => (q >= movimentos.length + 1 ? 0 : q + 1)), 1000);
    return () => clearInterval(t);
  }, [animado, movimentos.length]);
  // O estado antes de cada movimento, e o de agora.
  const estados: Soroban[] = [inicio];
  for (const m of movimentos) estados.push(aplicarMovimento(estados[estados.length - 1], m));
  const feitos = animado ? Math.min(quadro, movimentos.length) : 0;
  const agora = estados[feitos];
  const final = estados[estados.length - 1];
  const passos = movimentos.map((m, i) => ({ ...passoDoMovimento(estados[i], m), m, ordem: i + 1, haste: m.haste }));
  const ysRotulo = espalhar(passos.map((p) => p.y));
  const direita = 82 + 60 * (n - 1);
  const largura = Math.max(300, direita + 220);
  const valorFinal = final.reduce((t, h) => t * 10 + valorDaHaste(h), 0);

  // As contas marcadas: as que o próximo movimento (ou todos, parado) vai mexer.
  const marcadas = new Map<string, -1 | 1>();
  movimentos.forEach((m, i) => {
    if (animado && i !== feitos) return;
    const s = estados[i];
    const h = s[m.haste];
    if (m.cinco !== 0) marcadas.set(`${m.haste}:c`, m.cinco > 0 ? 1 : -1);
    else if (m.uns > 0) for (let k = h.uns; k < h.uns + m.uns; k++) marcadas.set(`${m.haste}:${k}`, -1);
    else for (let k = h.uns + m.uns; k < h.uns; k++) marcadas.set(`${m.haste}:${k}`, 1);
  });

  const leitura = modo === "leitura" ? inicio[n - 1] : null;
  return (
    <svg viewBox={`0 0 ${largura} 216`} className="block w-full max-w-[360px]" role="img" aria-label={rotulo} data-soroban-pequeno={modo}>
      <rect x={2} y={4} width={80 + 60 * (n - 1)} height={206} rx={10} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={2.4} />
      <rect x={12} y={14} width={60 + 60 * (n - 1)} height={186} rx={4} fill="var(--folha)" stroke="var(--contorno)" strokeWidth={1.8} />
      {inicio.map((_, i) => (
        <line key={i} x1={xHaste(i)} y1={14} x2={xHaste(i)} y2={200} stroke="var(--contorno)" strokeWidth={2.2} />
      ))}
      <rect x={2} y={68} width={80 + 60 * (n - 1)} height={12} fill="var(--madeira)" stroke="var(--contorno)" strokeWidth={2.2} />
      <circle cx={xHaste(n - 1)} cy={74} r={3.2} fill="var(--marca-texto)" stroke="var(--contorno)" strokeWidth={1.4} />
      {modo !== "sombra" &&
        agora.map((h, i) => (
          <g key={i}>
            <g className="soroban-conta" style={{ transform: `translateY(${h.cinco ? Y_CIMA_ENC - Y_CIMA : 0}px)` }}>
              <Conta cx={xHaste(i)} cy={Y_CIMA} encostada={h.cinco} marcada={marcadas.has(`${i}:c`)} sentido={marcadas.get(`${i}:c`) ?? 1} />
            </g>
            {[0, 1, 2, 3].map((k) => (
              <g key={k} className="soroban-conta" style={{ transform: `translateY(${k < h.uns ? -PASSO_CONTA : 0}px)` }}>
                <Conta cx={xHaste(i)} cy={yBaixo(k, false)} encostada={k < h.uns} marcada={marcadas.has(`${i}:${k}`)} sentido={marcadas.get(`${i}:${k}`) ?? 1} />
              </g>
            ))}
          </g>
        ))}
      {modo === "caminho" &&
        passos.map((p, i) => {
          const y = ysRotulo[i];
          const ativo = !animado || i < feitos || i === feitos;
          const x0 = direita - 10;
          return (
            <g key={i} style={{ opacity: ativo ? 1 : 0.35 }} className="camada" data-passo-exemplo={p.ordem}>
              <path d={`M${xHaste(p.haste) + 30} ${p.y} L${x0} ${p.y} L${x0 + 8} ${y} H${direita + 18}`} fill="none" stroke="var(--caneta)" strokeWidth={2} strokeDasharray="3 3" />
              <circle cx={direita + 32} cy={y} r={11} fill="var(--marca-texto)" stroke="var(--contorno)" strokeWidth={2} />
              <text x={direita + 32} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="var(--sobre-marca)">
                {p.ordem}
              </text>
              <text x={direita + 50} y={y + 6} fontSize={17} fontWeight={800} fill="var(--caneta)">
                {textoDoMovimento(p.m)}
              </text>
              <text x={direita + 86} y={y + 5} fontSize={14.5} fontWeight={600} fill="var(--tinta)">
                {p.texto}
              </text>
            </g>
          );
        })}
      {leitura && (
        <g>
          {leitura.cinco && (
            <g>
              <path d={`M${direita - 10} ${Y_CIMA_ENC} H${direita + 18}`} stroke="var(--caneta)" strokeWidth={2} strokeDasharray="3 3" />
              <text x={direita + 26} y={Y_CIMA_ENC + 6} fontSize={17} fontWeight={800} fill="var(--caneta)">
                5
              </text>
              <text x={direita + 50} y={Y_CIMA_ENC + 5} fontSize={14.5} fontWeight={600} fill="var(--tinta)">
                {PASSOS_SOROBAN.aDeCima}
              </text>
            </g>
          )}
          {leitura.uns > 0 && (
            <g>
              <path d={`M${direita - 10} ${Y_BAIXO_ENC + (PASSO_CONTA * (leitura.uns - 1)) / 2} H${direita + 18}`} stroke="var(--caneta)" strokeWidth={2} strokeDasharray="3 3" />
              <text x={direita + 26} y={Y_BAIXO_ENC + (PASSO_CONTA * (leitura.uns - 1)) / 2 + 6} fontSize={17} fontWeight={800} fill="var(--caneta)">
                {leitura.uns}
              </text>
              <text x={direita + 50} y={Y_BAIXO_ENC + (PASSO_CONTA * (leitura.uns - 1)) / 2 + 5} fontSize={14.5} fontWeight={600} fill="var(--tinta)">
                {preencher(PASSOS_SOROBAN.deBaixo, { n: leitura.uns })}
              </text>
            </g>
          )}
        </g>
      )}
      {modo === "sombra" ? (
        <text x={direita + 18} y={96} fontSize={22} fontWeight={700} fontFamily="var(--fonte-mao), cursive" fill="var(--caneta)">
          {TEXTOS_BANCADA.notaSombra.split("; ").map((linha, i) => (
            <tspan key={i} x={direita + 18} dy={i === 0 ? 0 : 26}>
              {linha}
              {i === 0 ? ";" : ""}
            </tspan>
          ))}
        </text>
      ) : (
        <g>
          <text x={direita + 22} y={196} fontSize={15} fontWeight={600} fill="var(--tinta-suave)">
            {PASSOS_SOROBAN.fica}
            {leitura ? ` ${leitura.cinco ? "5" : ""}${leitura.cinco && leitura.uns ? " + " : ""}${leitura.uns || ""} =` : ""}
          </text>
          <rect x={direita + (leitura ? 130 : 66)} y={176} width={14 + 16 * String(valorFinal).length} height={28} rx={6} fill="var(--marca-texto)" />
          <text x={direita + (leitura ? 130 : 66) + (14 + 16 * String(valorFinal).length) / 2} y={197} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--sobre-marca)">
            {animado && feitos < movimentos.length ? "?" : valorFinal}
          </text>
        </g>
      )}
    </svg>
  );
}
