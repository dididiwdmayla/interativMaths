/**
 * Posições da bancada no viewBox (largura 400, altura adaptável à área disponível).
 * Função pura do estado: a tela e as animações usam as mesmas posições, então o que voa
 * sai de onde a peça estava e chega onde ela fica.
 */
import { chave, maximo, paraNumero, racional, type Racional } from "@/nucleo/racional/racional";
import { cargaInicial, quantidadeNaBica } from "@/nucleo/maquinas/bancada/bancada";
import type { EstadoBancada, Pilha } from "@/nucleo/maquinas/bancada/tipos";
import type { FormaPeca } from "@/conteudo/peles";

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
  canoY1: number;
  canoY2: number;
  volanteY: number;
  conteudo: Caixa;
  medidor: Caixa;
  receptorY: number;
  largura: number;
  rotuloY: number;
}

export interface LayoutBancada {
  altura: number;
  chassi: Caixa;
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
 * @param proporcao altura/largura desejada (a área da tela). Entre 0,5 e 1,7.
 */
export function calcularLayout(e: EstadoBancada, forma: FormaPeca, proporcao = 0.62): LayoutBancada {
  const vagas = e.bicas.length;
  const linhas = vagas >= 9 ? 2 : 1;
  const porLinha = Math.ceil(vagas / linhas);
  const larguraSlot = (LARGURA - 2 * MARGEM - 8) / porLinha;

  // Orçamento vertical: o que é fixo e o que cresce com a altura disponível.
  const H = LARGURA * Math.min(1.7, Math.max(0.5, proporcao));
  const fixo = 18 + 14 + 14 + 34 + linhas * (22 + 28) + 44 + 10;
  const sobra = Math.max(0, H - fixo);
  const zonaPilhas = Math.min(120, Math.max(46, sobra * 0.36));
  const zonaConteudo = Math.min(150, Math.max(44, (sobra - zonaPilhas) / linhas));

  const temFatiador = e.config.fatiador !== undefined;
  const pilhasY = 22;
  const esteiraY = pilhasY + zonaPilhas;
  const fatiador: Caixa | null = temFatiador
    ? { x: MARGEM + 6, y: pilhasY - 4, largura: 52, altura: Math.max(46, zonaPilhas - 4) }
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
  const trilhoY = esteiraY + 26;
  const alturaLinha = 34 + zonaConteudo + 22 + 28;
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
      const medidorL = Math.max(4, Math.min(7, larguraSlot * 0.1));
      bicas.push({
        indice,
        linha: l,
        cx,
        canoY1: tY + 7,
        canoY2: tY + 27,
        volanteY: tY + 16,
        conteudo: { x: cx - larguraSlot / 2 + 4, y: topo, largura: larguraSlot - 12 - medidorL, altura: zonaConteudo },
        medidor: { x: cx + larguraSlot / 2 - 5 - medidorL, y: topo + 4, largura: medidorL, altura: zonaConteudo + 14 },
        receptorY: topo + zonaConteudo,
        largura: larguraSlot,
        rotuloY: topo + zonaConteudo + 22,
      });
    }
  }
  const fimBicas = trilhoY + linhas * alturaLinha;
  const bandeja = { x: LARGURA - MARGEM - 168, y: fimBicas - 4, largura: 160, altura: 38 };
  const altura = Math.max(H, bandeja.y + bandeja.altura + 12);

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
    chassi: { x: 4, y: 4, largura: LARGURA - 8, altura: altura - 8 },
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
