"use client";

/**
 * O mapa: o Engenho desenhado no caderno. A Partilha a caneta e colorida; os distritos em projeto
 * a lápis, com etiqueta tracejada. Os caminhos são tracejados, azuis no trecho já percorrido e
 * grafite no resto. O distrito onde o jogador está fica circulado a lápis vermelho. No celular a
 * folha continua para o lado; no computador ela aparece inteira. O cartão de continuar fica preso
 * embaixo, com a próxima missão e o botão Jogar.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { arcoConcluido, concluida, ecoDisponivel, revisitaDisponivel, situacaoMissoes, sondagensPendentes } from "@/nucleo/campanha/campanha";
import { REGRAS_CALIBRAGEM } from "@/conteudo/calibragem";
import { CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { ATIVIDADES } from "@/conteudo/atividades";
import { existeAtividade, rotaDe, SONDAGEM_ATIVA } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { IconeAvancar } from "@/componentes/icones/IconeAvancar";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { useAmbiente } from "@/componentes/ui/useAmbiente";
import { Rabisco, SetaCurva } from "./kit";
import {
  AREAS,
  DesenhoContrapeso,
  DesenhoEstaleiro,
  DesenhoFeira,
  DesenhoMuseu,
  DesenhoObservatorio,
  DesenhoPartilha,
  DesenhoPatio,
  DesenhoRua,
  ETIQUETAS,
  FOLHA_MAPA,
  type IdDistrito,
} from "./Distritos";
import { MiniaturaMissao } from "./Miniaturas";

const M4 = "partilha.arco1.pao-nao-e-saca";
const ECO = "partilha.arco1.eco";

type Ponto = [number, number];
type Cubica = [Ponto, Ponto, Ponto, Ponto];

/** Divide uma curva cúbica em t (de Casteljau). */
function dividir(c: Cubica, t: number): [Cubica, Cubica] {
  const l = (a: Ponto, b: Ponto): Ponto => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const [p0, p1, p2, p3] = c;
  const a = l(p0, p1);
  const b = l(p1, p2);
  const d = l(p2, p3);
  const e = l(a, b);
  const f = l(b, d);
  const g = l(e, f);
  return [
    [p0, a, e, g],
    [g, f, d, p3],
  ];
}

const caminho = (c: Cubica) => `M ${c[0][0]} ${c[0][1]} C ${c[1][0]} ${c[1][1]}, ${c[2][0]} ${c[2][1]}, ${c[3][0]} ${c[3][1]}`;

/** Ponta de seta no fim de uma curva. */
function ponta(c: Cubica): string {
  const [, , p2, p3] = c;
  const ang = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]);
  const r = 9;
  const a1 = ang + Math.PI * 0.78;
  const a2 = ang - Math.PI * 0.78;
  return `M ${p3[0] + r * Math.cos(a1)} ${p3[1] + r * Math.sin(a1)} L ${p3[0]} ${p3[1]} L ${p3[0] + r * Math.cos(a2)} ${p3[1] + r * Math.sin(a2)}`;
}

const CAMINHO_SUBIDA: Cubica = [
  [178, 390],
  [196, 360],
  [200, 318],
  [176, 280],
];

/** Os caminhos a lápis, de um lugar ao outro. */
const CAMINHOS_LAPIS: Cubica[] = [
  [
    [170, 250],
    [200, 232],
    [214, 170],
    [236, 120],
  ],
  [
    [346, 80],
    [400, 58],
    [460, 66],
    [512, 92],
  ],
  [
    [592, 132],
    [640, 160],
    [676, 190],
    [688, 206],
  ],
  [
    [540, 140],
    [514, 180],
    [494, 214],
    [486, 246],
  ],
];

const CAMINHO_MUSEU: Cubica = [
  [378, 488],
  [404, 470],
  [436, 474],
  [466, 488],
];

const CAMINHO_RUA: Cubica = [
  [572, 500],
  [600, 486],
  [620, 488],
  [642, 496],
];

interface Lugar {
  id: IdDistrito;
  nome: string;
  /** Do que é feito o distrito, para o bilhete. */
  linha: string;
}

const EM_PROJETO: Lugar[] = [
  { id: "contrapeso", nome: "O Contrapeso", linha: "incógnitas e equações" },
  { id: "patio", nome: "Pátio dos Sinais", linha: "lógica: sinais e chaves" },
  { id: "observatorio", nome: "Observatório", linha: "funções" },
  { id: "estaleiro", nome: "Estaleiro das Formas", linha: "formas e medidas" },
  { id: "feira", nome: "Feira do Acaso", linha: "acaso e chance" },
];

export function Mapa() {
  const { pronto, progresso } = useProgresso();
  const router = useRouter();
  const ambiente = useAmbiente<HTMLDivElement>();
  const vistaRef = useRef<HTMLDivElement | null>(null);
  const [escala, setEscala] = useState(1);
  const [bilhete, setBilhete] = useState<{ id: IdDistrito; texto: string } | null>(null);

  useEffect(() => {
    const el = vistaRef.current;
    if (!el) return;
    const obs = new ResizeObserver((e) => {
      const r = e[0]?.contentRect;
      if (!r || r.height <= 0) return;
      const largo = r.width >= 1024;
      const k = largo ? Math.min(r.height / FOLHA_MAPA.altura, (r.width - 40) / FOLHA_MAPA.largura) : r.height / FOLHA_MAPA.altura;
      setEscala(Math.max(0.62, Math.min(1.5, k)));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [pronto]);

  useEffect(() => {
    if (!bilhete) return;
    const t = setTimeout(() => setBilhete(null), 3200);
    return () => clearTimeout(t);
  }, [bilhete]);

  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const feitas = MISSOES_ARCO_1.filter((m) => concluida(progresso, m.id)).length;
  const passadaALimpo = arcoConcluido(progresso, MISSOES_ARCO_1);
  const transferencia = concluida(progresso, M4);
  const museuAberto = transferencia && existeAtividade("museu.paes-de-ahmes");
  const ruaAberta = transferencia && existeAtividade("rua.tres-pizzas");
  const revisita = revisitaDisponivel(progresso, CONCEITOS_DO_ARCO_1, agora).length > 0 || progresso.revisitas.atual !== null;
  const sondagem = SONDAGEM_ATIVA && sondagensPendentes(progresso, CONCEITOS_DO_ARCO_1, agora).length > 0;
  const eco = ATIVIDADES.some((a) => a.id === ECO) && ecoDisponivel(progresso, M4, ECO);
  const chamado = revisita ? "revisita" : sondagem ? "sondagem" : eco ? "eco" : null;
  const irChamado = () => {
    if (chamado === "revisita") router.push("/partilha/revisita");
    else if (chamado === "eco") {
      const a = ATIVIDADES.find((x) => x.id === ECO);
      if (a) router.push(rotaDe(a));
    } else router.push("/partilha");
  };

  const estacoes = situacaoMissoes(progresso, MISSOES_ARCO_1, REGRAS_CALIBRAGEM);
  const proxima =
    estacoes.find((s) => s.status === "em_andamento") ?? estacoes.find((s) => s.recomendada && s.status !== "concluida") ?? estacoes.find((s) => s.status === "disponivel") ?? null;

  const progressoCaminho = Math.max(0.18, feitas / MISSOES_ARCO_1.length);
  const [feito, falta] = dividir(CAMINHO_SUBIDA, progressoCaminho);
  const W = FOLHA_MAPA.largura;
  const H = FOLHA_MAPA.altura;

  return (
    <main data-pronto="sim" data-tela="mapa" data-chamado={chamado ?? ""} className="flex h-dvh flex-col overflow-hidden">
      <CabecalhoJogo atual="mapa" />
      <div ref={ambiente} className="relative min-h-0 flex-1">
        <div ref={vistaRef} className="absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain" data-folha-mapa="">
          <div className="relative lg:mx-auto" style={{ width: W * escala, height: H * escala }}>
            <div className="absolute left-0 top-0" style={{ width: W, height: H, transform: `scale(${escala})`, transformOrigin: "0 0" }}>
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute left-0 top-0 block" role="img" aria-label={`O Engenho desenhado em papel quadriculado: A Partilha a caneta, ${feitas} de 5 missões; os outros distritos ainda a lápis.`}>
                <path d="M22 62 C 60 56, 110 66, 152 58" fill="none" stroke="var(--marca-texto)" strokeWidth={9} strokeLinecap="round" />
                <Rabisco tipo="mais" x={41} y={188} />
                <Rabisco tipo="triangulo" x={346} y={261} />
                <Rabisco tipo="dividir" x={338} y={612} />
                <Rabisco tipo="mais" x={420} y={640} />

                {/* Caminhos */}
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d={caminho(falta)} stroke="var(--grafite)" strokeWidth={2.4} strokeDasharray="7 7" />
                  {CAMINHOS_LAPIS.map((c, i) => (
                    <g key={i}>
                      <path d={caminho(c)} stroke="var(--grafite)" strokeWidth={2.4} strokeDasharray="7 7" />
                      <path d={ponta(c)} stroke="var(--grafite)" strokeWidth={2.4} />
                    </g>
                  ))}
                  <path d={caminho(feito)} stroke="var(--caneta)" strokeWidth={2.6} strokeDasharray="7 7" />
                  <path d={ponta(feito)} stroke="var(--caneta)" strokeWidth={2.6} />
                  <path d={caminho(CAMINHO_MUSEU)} stroke={museuAberto ? "var(--caneta)" : "var(--grafite)"} strokeWidth={2.4} strokeDasharray="7 7" />
                  <path d={ponta(CAMINHO_MUSEU)} stroke={museuAberto ? "var(--caneta)" : "var(--grafite)"} strokeWidth={2.4} />
                  <path d={caminho(CAMINHO_RUA)} stroke={ruaAberta ? "var(--caneta)" : "var(--grafite)"} strokeWidth={2.4} strokeDasharray="7 7" />
                  <path d={ponta(CAMINHO_RUA)} stroke={ruaAberta ? "var(--caneta)" : "var(--grafite)"} strokeWidth={2.4} />
                </g>

                <DesenhoContrapeso lapis />
                <DesenhoPatio lapis />
                <DesenhoObservatorio lapis />
                <DesenhoEstaleiro lapis />
                <DesenhoFeira lapis />
                <DesenhoMuseu lapis={!museuAberto} />
                <DesenhoRua lapis={!ruaAberta} />
                <DesenhoPartilha />

                {/* Você está aqui */}
                <path d="M66 452 C 60 400, 168 372, 262 380 C 346 388, 372 444, 350 486 C 326 528, 150 540, 90 518 C 54 504, 50 478, 70 446" fill="none" stroke="var(--vermelho)" strokeWidth={2.6} strokeLinecap="round" />
                <SetaCurva de={[326, 366]} para={[328, 390]} curva={-0.45} />
              </svg>

              <div className="pointer-events-none absolute left-[20px] top-[14px] rotate-[-2deg] font-mao text-[38px] font-bold leading-none">O Engenho</div>
              <div className="pointer-events-none absolute left-[236px] top-[334px] rotate-[-4deg] whitespace-nowrap font-mao text-[23px] font-bold leading-none text-caneta">você está aqui</div>

              {/* A Partilha */}
              <Link
                href="/partilha"
                className="absolute rounded-2xl"
                style={{ left: AREAS.partilha[0], top: AREAS.partilha[1], width: AREAS.partilha[2], height: AREAS.partilha[3] + 46 }}
                aria-label={`A Partilha: entrar. ${feitas} de 5 missões feitas.`}
                id="andar-partilha"
                data-destino="andar-partilha"
              />
              <div className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-1.5" style={{ left: ETIQUETAS.partilha.x, top: ETIQUETAS.partilha.y }}>
                <span className="etiqueta-lugar text-[17px] font-extrabold">A Partilha</span>
                <span className="marca-texto text-[13px] font-bold">{passadaALimpo ? "passada a limpo" : `${feitas} de 5 missões`}</span>
              </div>

              {/* Distritos em projeto */}
              {EM_PROJETO.map((l) => (
                <LugarLapis key={l.id} lugar={l} onTocar={() => setBilhete({ id: l.id, texto: `${l.nome}: ${l.linha}. Ainda a lápis nesta versão.` })} />
              ))}

              {/* Museu e Rua */}
              <LugarFechavel
                id="museu"
                nome="Museu"
                aberto={museuAberto}
                href="/museu/paes-de-ahmes"
                rotulo={museuAberto ? "Museu das Descobertas: entrar" : "Museu das Descobertas: abre depois da missão 4"}
              />
              <LugarFechavel id="rua" nome="A Rua" aberto={ruaAberta} href="/rua/tres-pizzas" rotulo={ruaAberta ? "A Rua, matemática invisível: entrar" : "A Rua: abre depois da missão 4"} />

              {/* Chamado: bilhete amarelo ao lado do distrito */}
              {chamado && (
                <button
                  type="button"
                  className="absolute left-[18px] top-[352px] min-h-[44px] rotate-[-4deg] rounded-md border-2 border-contorno bg-marca-texto text-sobre-marca px-3 py-1.5 text-left text-[14px] font-bold leading-tight anima-subir"
                  onClick={irChamado}
                  id="chamado"
                  data-destino="chamado"
                  aria-label={chamado === "revisita" ? "Chamado do Nônio: revisita" : chamado === "eco" ? "Chamado: eco" : "Chamado do Nônio: uma medida rápida"}
                >
                  {chamado === "revisita" ? "Revisita esperando" : chamado === "eco" ? "Eco esperando" : "Uma medida rápida"}
                </button>
              )}

              {bilhete && (
                <p
                  role="status"
                  className="absolute z-10 m-0 w-[220px] -translate-x-1/2 rotate-[-1.5deg] rounded-md border-2 border-contorno bg-marca-texto text-sobre-marca px-3 py-2 text-[14px] font-semibold anima-esmaecer"
                  style={{ left: Math.min(W - 120, Math.max(120, ETIQUETAS[bilhete.id].x)), top: ETIQUETAS[bilhete.id].y + 54 }}
                  data-bilhete=""
                >
                  {bilhete.texto}
                </p>
              )}
            </div>
          </div>
        </div>

        <CartaoContinuar proxima={proxima?.missao ?? null} emAndamento={proxima?.status === "em_andamento"} />
      </div>
    </main>
  );
}

function LugarLapis({ lugar, onTocar }: { lugar: Lugar; onTocar: () => void }) {
  const [x, y, w, h] = AREAS[lugar.id];
  const e = ETIQUETAS[lugar.id];
  return (
    <>
      <button type="button" className="absolute rounded-2xl" style={{ left: x, top: y, width: w, height: h + 30 }} onClick={onTocar} aria-label={`${lugar.nome}: em projeto. ${lugar.linha}.`} data-distrito={lugar.id} data-estado="em_projeto" />
      <div className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-0.5" style={{ left: e.x, top: e.y }}>
        <span className="etiqueta-lugar" data-material="lapis">
          {lugar.nome}
        </span>
        <span className="font-mao text-[19px] font-bold text-tinta-suave">ainda a lápis</span>
      </div>
    </>
  );
}

function LugarFechavel({ id, nome, aberto, href, rotulo }: { id: "museu" | "rua"; nome: string; aberto: boolean; href: string; rotulo: string }) {
  const [x, y, w, h] = AREAS[id];
  const e = ETIQUETAS[id];
  const etiqueta = (
    <div className="pointer-events-none absolute flex -translate-x-1/2 flex-col items-center gap-0.5" style={{ left: e.x, top: e.y }}>
      <span className="etiqueta-lugar" data-material={aberto ? undefined : "lapis"}>
        {nome}
      </span>
      {!aberto && <span className="whitespace-nowrap text-[12px] font-semibold text-tinta-suave">abre depois da missão 4</span>}
    </div>
  );
  return (
    <>
      {aberto ? (
        <Link href={href} className="absolute rounded-2xl" style={{ left: x, top: y, width: w, height: h }} aria-label={rotulo} id={id} data-destino={id} />
      ) : (
        <div className="absolute" style={{ left: x, top: y, width: w, height: h }} role="img" aria-label={rotulo} id={id} />
      )}
      {etiqueta}
    </>
  );
}

function CartaoContinuar({ proxima, emAndamento }: { proxima: (typeof MISSOES_ARCO_1)[number] | null; emAndamento: boolean }) {
  if (!proxima) {
    return (
      <div className="ficha absolute inset-x-[14px] bottom-[18px] flex items-center gap-3 p-3 lg:left-auto lg:right-7 lg:w-[420px]" data-cartao="continuar">
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="m-0 text-[12px] font-semibold text-tinta-suave">Arco 1</p>
          <p className="m-0 text-[16px] font-extrabold leading-tight">A Partilha passada a limpo</p>
        </div>
        <Link href="/caderno" className="botao-principal shrink-0 px-4 text-[16px]" data-acao="continuar">
          Caderno
          <IconeAvancar />
        </Link>
      </div>
    );
  }
  return (
    <div className="ficha absolute inset-x-[14px] bottom-[18px] flex items-center gap-3 p-3 lg:left-auto lg:right-7 lg:w-[420px]" data-cartao="continuar">
      <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl border-2 border-contorno bg-marca-texto-palido">
        <MiniaturaMissao numero={proxima.numero ?? 1} tamanho={36} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <p className="m-0 text-[12px] font-semibold text-tinta-suave">
          {emAndamento ? "Continuar" : "Próxima"} · Missão {proxima.numero}
        </p>
        <p className="m-0 truncate text-[16px] font-extrabold leading-tight">{proxima.titulo}</p>
      </div>
      <Link href={rotaDe(proxima)} className="botao-principal shrink-0 px-4 text-[16px]" data-acao="continuar">
        Jogar
        <IconeAvancar />
      </Link>
    </div>
  );
}
