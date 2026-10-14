/**
 * Posições da bancada no viewBox (largura 400, altura adaptável à área disponível).
 * Função pura do estado: a tela e as animações usam as mesmas posições, então o que voa
 * sai de onde a peça estava e chega onde ela fica.
 */
import { chave, maximo, paraNumero, racional, type Racional } from "@/nucleo/racional/racional";
import { cargaInicial, quantidadeNaBica } from "@/nucleo/maquinas/bancada/bancada";
import type { EstadoBancada, Pilha } from "@/nucleo/maquinas/bancada/tipos";
import type { FormaPeca } from "@/conteudo/peles";
import { ALTURA_RECEPTOR } from "./receptores";

export const LARGURA = 400;
const MARGEM = 12;

export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export interface LayoutPilha {
  pilha: Pilha;
  chave: string;
  caixa: Caixa;
  mostradas: number;
  ocultas: number;
  /** Onde o desenho da pilha começa (para a cota ficar logo acima). */
  topo: number;
}

export interface LayoutBica {
  indice: number;
  linha: number;
  cx: number;
  /** Topo da caixa da bica, presa ao trilho. */
  bicaY: number;
  conteudo: Caixa;
  medidor: Caixa;
  receptorY: number;
  largura: number;
  /** Onde começam os números da cota, abaixo do receptor. */
  rotuloY: number;
}

export interface LayoutBancada {
  altura: number;
  esteira: { x0: number; x1: number; y: number; pilhasY: number };
  fatiador: Caixa | null;
  trilhos: { y: number; x0: number; x1: number }[];
  pilhas: LayoutPilha[];
  bicas: LayoutBica[];
  bandeja: Caixa;
  escala: Racional;
  marcas: number[];
  /** Raio-base das peças na esteira. */
  raioPilha: number;
  /** Raio máximo das peças nos receptores. */
  raioConteudo: number;
}

function mdc(a: number, b: number): number {
  return b === 0 ? a : mdc(b, a % b);
}

function unidadesDaPilha(p: Pilha): number {
  return Math.ceil(paraNumero(p.tamanho) * p.quantidade - 1e-9);
}

/**
 * A faixa de baixo da máquina, onde fica a bandeja da sobra. Com o Nônio flutuante, o canto
 * inferior direito (cerca de 72 × 72 px na tela) é dele: a bandeja vai para a esquerda e a faixa
 * cresce o bastante para a bolinha não cobrir os números das bicas.
 */
const FAIXA_BANDEJA = 58;
const FAIXA_BANDEJA_COM_NONIO = 76;

/**
 * @param proporcao altura/largura desejada (a área da tela). Entre 0,5 e 1,7.
 * @param cantoNonio o canto inferior direito fica livre para a bolinha do Nônio.
 */
export function calcularLayout(e: EstadoBancada, forma: FormaPeca, proporcao = 0.62, cantoNonio = false): LayoutBancada {
  const vagas = e.bicas.length;
  const linhas = vagas >= 9 ? 2 : 1;
  const porLinha = Math.ceil(vagas / linhas);
  const larguraSlot = (LARGURA - 2 * MARGEM - 8) / porLinha;

  // Orçamento vertical: o que é fixo e o que cresce com a altura disponível.
  const H = LARGURA * Math.min(1.7, Math.max(0.5, proporcao));
  const alturaRotulo = forma === "saco" ? 30 : 58;
  const pilhasY = 56;
  const fixoLinha = 34 + 2 + ALTURA_RECEPTOR + 6 + alturaRotulo;
  const faixaBandeja = cantoNonio ? FAIXA_BANDEJA_COM_NONIO : FAIXA_BANDEJA;
  const fixo = pilhasY + 14 + 30 + linhas * fixoLinha + faixaBandeja + 8;
  const sobra = Math.max(0, H - fixo);
  const zonaPilhas = Math.min(116, Math.max(44, sobra * 0.36));
  const zonaConteudo = Math.min(150, Math.max(44, (sobra - zonaPilhas) / linhas));

  const temFatiador = e.config.fatiador !== undefined;
  const esteiraY = pilhasY + zonaPilhas;
  const fatiador: Caixa | null = temFatiador
    ? { x: MARGEM + 2, y: Math.max(8, esteiraY - 74), largura: 54, altura: 74 }
    : null;
  const x0 = temFatiador ? MARGEM + 66 : MARGEM + 4;
  const x1 = LARGURA - MARGEM - 4;

  // Pilhas na esteira, da maior para a menor, encolhendo juntas se não couberem.
  const raioBase = forma === "saco" ? Math.min(11, Math.max(6.5, zonaPilhas / 7.2)) : Math.min(22, Math.max(11, zonaPilhas / 3.4));
  const medidas = e.esteira.map((p) => {
    if (forma === "saco") {
      const mostradas = Math.min(p.quantidade, 16);
      const colunas = Math.min(4, mostradas);
      return { p, largura: colunas * raioBase * 2.15 + raioBase, mostradas, ocultas: p.quantidade - mostradas };
    }
    const u = unidadesDaPilha(p);
    const mostradas = Math.min(u, 3);
    return { p, largura: mostradas * raioBase * 2.25 + 6 + (u > 3 ? 16 : 0), mostradas, ocultas: u - mostradas };
  });
  const disponivel = x1 - x0 - 26;
  const total = medidas.reduce((a, m) => a + m.largura + 10, 0);
  const fator = total > disponivel ? disponivel / total : 1;
  let cursor = x0 + 14;
  const r = raioBase * fator;
  const pilhas: LayoutPilha[] = medidas.map((m) => {
    const largura = m.largura * fator;
    const caixa = { x: cursor, y: pilhasY, largura, altura: esteiraY - pilhasY - 2 };
    cursor += largura + 10 * fator;
    const fileiras = Math.ceil(m.mostradas / Math.max(1, Math.min(4, m.mostradas)));
    const altura = forma === "saco" ? r * 2.05 + (fileiras - 1) * r * 1.75 : 2 * Math.min(r, (largura - 6) / Math.max(1, m.mostradas) / 2.25) + 4;
    return {
      pilha: m.p,
      chave: chave(m.p.tamanho),
      caixa,
      mostradas: m.mostradas,
      ocultas: m.ocultas,
      topo: Math.max(pilhasY - 6, caixa.y + caixa.altura - altura),
    };
  });

  // Trilhos e bicas.
  const trilhoY = esteiraY + 14 + 30;
  const alturaLinha = fixoLinha + zonaConteudo;
  const trilhos: LayoutBancada["trilhos"] = [];
  const bicas: LayoutBica[] = [];
  for (let l = 0; l < linhas; l++) {
    const tY = trilhoY + l * alturaLinha;
    trilhos.push({ y: tY, x0: MARGEM + 4, x1: LARGURA - MARGEM - 4 });
    for (let k = 0; k < porLinha; k++) {
      const indice = l * porLinha + k;
      if (indice >= vagas) break;
      const cx = MARGEM + 4 + larguraSlot * (k + 0.5);
      const topo = tY + 34;
      // Com poucas bicas, o lugar de cada uma não se espalha: o medidor fica junto do conteúdo.
      const ls = Math.min(larguraSlot, 128);
      const medidorL = Math.max(6, Math.min(10, ls * 0.12));
      const medidorX = cx + ls / 2 - 7 - medidorL;
      bicas.push({
        indice,
        linha: l,
        cx,
        bicaY: tY + 5,
        conteudo: { x: cx - ls / 2 + 5, y: topo, largura: medidorX - (cx - ls / 2 + 5) - 4, altura: zonaConteudo },
        medidor: { x: medidorX, y: topo - 4, largura: medidorL, altura: zonaConteudo + 4 },
        receptorY: topo + zonaConteudo + 2,
        largura: ls,
        rotuloY: topo + zonaConteudo + 2 + ALTURA_RECEPTOR + 6,
      });
    }
  }
  const fimBicas = trilhoY + linhas * alturaLinha;
  const bandeja = { x: cantoNonio ? MARGEM + 4 : LARGURA - MARGEM - 170, y: fimBicas + 4, largura: 166, altura: 46 };
  const altura = Math.max(H, cantoNonio ? fimBicas + faixaBandeja + 4 : bandeja.y + bandeja.altura + 8);

  // Escala do medidor: o que caberia em cada bica aberta no começo, ou o teto, ou o maior atual.
  const abertasNoInicio = Math.max(1, e.config.bicas.quantidade);
  const carga = cargaInicial(e.config);
  const porBica = racional(carga.n, carga.d * abertasNoInicio);
  let escala: Racional = racional(Math.max(1, Math.ceil(paraNumero(porBica) - 1e-9)));
  if (e.config.teto !== undefined) escala = maximo(escala, racional(e.config.teto + 1));
  for (const b of e.bicas) {
    const q = quantidadeNaBica(b);
    if (paraNumero(q) > paraNumero(escala)) escala = racional(Math.ceil(paraNumero(q) - 1e-9));
  }
  const esc = paraNumero(escala);
  let marcas: number[];
  if (esc <= 2) {
    const dens = new Set<number>();
    for (const p of [...e.esteira, ...e.bicas.flatMap((b) => b.pecas)]) dens.add(p.tamanho.d);
    let den = 1;
    for (const d of dens) den = (den * d) / mdc(den, d);
    if (den > 12) den = 1;
    marcas = Array.from({ length: Math.round(esc * den) + 1 }, (_, i) => i / den / esc);
  } else {
    marcas = Array.from({ length: Math.round(esc) + 1 }, (_, i) => i / esc);
  }

  return {
    altura,
    esteira: { x0, x1, y: esteiraY, pilhasY },
    fatiador,
    trilhos,
    pilhas,
    bicas,
    bandeja,
    escala,
    marcas,
    raioPilha: r,
    raioConteudo: forma === "saco" ? Math.min(13, Math.max(7, zonaConteudo / 4.4)) : Math.min(30, Math.max(12, zonaConteudo / 2.3)),
  };
}
