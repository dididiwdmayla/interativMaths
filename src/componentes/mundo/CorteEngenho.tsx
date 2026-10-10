"use client";

/**
 * O mapa: o Engenho visto por dentro, em corte vertical. Quanto mais alto, mais avançado.
 * Distrito desperto tem janelas acesas e mecanismo em movimento; os outros são silhueta com uma
 * luz-piloto. Dois fechados diferentes: bloqueado (existe, falta progresso) e em projeto
 * (ainda não construído nesta versão).
 */
import type { KeyboardEvent, ReactNode } from "react";
import { Engrenagem, Lampada, Placa, Rebite, Viga } from "./kit";

export const ALTURA_CORTE = 1520;

export interface EstadoCorte {
  /** A Partilha: quantas missões concluídas (0 a 5) e se o arco acendeu. */
  readonly partilhaMissoes: number;
  readonly partilhaAcesa: boolean;
  readonly museuAberto: boolean;
  readonly ruaAberta: boolean;
  readonly chamado: "revisita" | "eco" | "sondagem" | null;
}

export interface DestinosCorte {
  readonly partilha: () => void;
  readonly museu?: () => void;
  readonly rua?: () => void;
  readonly chamado?: () => void;
}

const ESTRELAS = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 97.13) % 392;
  const y = (i * 53.71) % 330;
  return { x: 4 + x, y: 6 + y, r: i % 7 === 0 ? 1.3 : 0.7 };
});

function Clicavel({
  rotulo,
  onAtivar,
  children,
  id,
}: {
  rotulo: string;
  onAtivar?: () => void;
  children: ReactNode;
  id?: string;
}) {
  if (!onAtivar) return <g id={id}>{children}</g>;
  const teclado = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onAtivar();
    }
  };
  return (
    <g id={id} role="link" tabIndex={0} aria-label={rotulo} onClick={onAtivar} onKeyDown={teclado} style={{ cursor: "pointer" }} data-focavel="" data-destino={id}>
      {children}
    </g>
  );
}

/** Andar em projeto: só a silhueta tracejada e uma luz-piloto. */
function EmProjeto({ x, y, largura, altura, nome, linha, children }: { x: number; y: number; largura: number; altura: number; nome: string; linha: string; children?: ReactNode }) {
  return (
    <g aria-label={`${nome}: em projeto. ${linha}`} role="img">
      <rect x={x} y={y} width={largura} height={altura} fill="var(--noite-funda)" opacity={0.55} />
      <rect x={x} y={y} width={largura} height={altura} fill="none" stroke="var(--noite-traco)" strokeDasharray="5 4" />
      <g stroke="var(--noite-traco)" strokeDasharray="3 3" fill="none" strokeWidth={1.1}>
        {children}
      </g>
      <Lampada x={x + largura - 14} y={y + 14} r={3.2} estado="piloto" />
      <PlacaProjeto x={x + largura / 2} y={y + altura - 46} nome={nome} linha={linha} largura={largura} />
    </g>
  );
}

function PlacaProjeto({ x, y, nome, linha, largura }: { x: number; y: number; nome: string; linha: string; largura: number }) {
  const w = Math.min(largura - 16, Math.max(120, nome.length * 8.6 + 24));
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={18} rx={3} fill="var(--esmalte-sombra)" stroke="var(--noite-traco)" />
      <text x={x} y={y + 9.5} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} className="fonte-sinal" fill="var(--texto-mundo-suave)" style={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
        {nome}
      </text>
      <text x={x} y={y + 30} textAnchor="middle" fontSize={10.5} fill="var(--texto-mundo-apagado)">
        <tspan className="fonte-sinal" style={{ letterSpacing: 1.2 }} fontWeight={700}>
          EM PROJETO ·{" "}
        </tspan>
        {linha}
      </text>
    </g>
  );
}

export function CorteEngenho({ estado, destinos }: { estado: EstadoCorte; destinos: DestinosCorte }) {
  const H = ALTURA_CORTE;
  const luzes = estado.partilhaAcesa ? 6 : Math.min(6, 2 + estado.partilhaMissoes);
  return (
    <svg viewBox={`0 0 400 ${H}`} className="block h-auto w-full" role="group" aria-label="O Engenho em corte">
      <defs>
        <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ceu-alto)" />
          <stop offset="0.55" stopColor="var(--ceu-baixo)" />
          <stop offset="1" stopColor="var(--noite)" />
        </linearGradient>
        <radialGradient id="halo-partilha" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--ambar)" stopOpacity={0.32} />
          <stop offset="1" stopColor="var(--ambar)" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Céu e estrelas */}
      <rect x={0} y={0} width={400} height={H} fill="url(#ceu)" />
      {ESTRELAS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--estrela)" opacity={0.5 + (i % 3) * 0.15} />
      ))}
      <path d="M 52 54 a 18 18 0 1 0 18 24 a 14 14 0 1 1 -18 -24 Z" fill="var(--papel)" opacity={0.85} />

      {/* Estrutura: pilares e poço do elevador */}
      <rect x={18} y={300} width={8} height={1140} fill="var(--latao-sombra)" />
      <rect x={374} y={300} width={8} height={1140} fill="var(--latao-sombra)" />
      <rect x={352} y={330} width={3} height={892} fill="var(--aco-sombra)" />
      <rect x={364} y={330} width={3} height={892} fill="var(--aco-sombra)" />

      {/* Topo: Observatório, Estaleiro das Formas, Feira do Acaso */}
      <g>
        <line x1={200} y1={232} x2={200} y2={300} stroke="var(--aco)" strokeWidth={2} />
        <Lampada x={200} y={228} r={4} estado="piloto" />
        <EmProjeto x={132} y={300} largura={136} altura={300} nome="Observatório" linha="funções">
          <path d="M 152 400 A 48 48 0 0 1 248 400" />
          <line x1={152} y1={400} x2={248} y2={400} />
          <line x1={200} y1={352} x2={232} y2={322} />
          <rect x={164} y={420} width={72} height={60} />
        </EmProjeto>
        <EmProjeto x={26} y={430} largura={104} altura={170} nome="Estaleiro" linha="formas">
          <line x1={50} y1={560} x2={50} y2={450} />
          <line x1={50} y1={455} x2={112} y2={470} />
          <line x1={104} y1={468} x2={104} y2={500} />
          <rect x={88} y={500} width={30} height={18} />
        </EmProjeto>
        <EmProjeto x={270} y={430} largura={104} altura={170} nome="Feira" linha="acaso">
          <circle cx={322} cy={500} r={38} />
          <line x1={322} y1={462} x2={322} y2={538} />
          <line x1={284} y1={500} x2={360} y2={500} />
        </EmProjeto>
        <Viga x={18} y={598} largura={364} altura={9} rebites={9} />
      </g>

      {/* Pátio dos Sinais */}
      <g>
        <EmProjeto x={26} y={607} largura={348} altura={195} nome="Pátio dos Sinais" linha="lógica: sinais e chaves">
          {[70, 140, 210].map((x) => (
            <g key={x}>
              <line x1={x} y1={730} x2={x} y2={640} />
              <circle cx={x} cy={650} r={7} />
              <circle cx={x} cy={672} r={7} />
            </g>
          ))}
          <path d="M 240 740 L 330 700 M 240 740 L 330 740" />
        </EmProjeto>
        <Viga x={18} y={800} largura={364} altura={9} rebites={9} />
      </g>

      {/* O Contrapeso */}
      <g>
        <EmProjeto x={26} y={809} largura={348} altura={195} nome="O Contrapeso" linha="incógnitas e equações">
          <line x1={200} y1={840} x2={200} y2={930} />
          <line x1={120} y1={860} x2={280} y2={860} />
          <path d="M 120 860 L 105 890 L 135 890 Z M 280 860 L 265 890 L 295 890 Z" />
          <rect x={300} y={830} width={40} height={60} />
        </EmProjeto>
        <Viga x={18} y={1002} largura={364} altura={9} rebites={9} />
      </g>

      {/* A Partilha: desperta */}
      <Clicavel rotulo={`A Partilha: entrar. ${estado.partilhaMissoes} de 5 missões concluídas.`} onAtivar={destinos.partilha} id="andar-partilha">
        <rect x={26} y={1011} width={348} height={210} fill="var(--noite-clara)" />
        <ellipse cx={200} cy={1110} rx={190} ry={110} fill="url(#halo-partilha)" opacity={estado.partilhaAcesa ? 1 : 0.6} />
        {/* janelas */}
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={40 + i * 56} y={1024} width={40} height={30} rx={2} fill={i < luzes ? "var(--janela)" : "var(--janela-apagada)"} style={{ transition: "fill var(--t-luz)" }} />
            <line x1={60 + i * 56} y1={1024} x2={60 + i * 56} y2={1054} stroke="var(--esmalte-sombra)" strokeWidth={1.5} />
          </g>
        ))}
        {/* esteira em movimento */}
        <rect x={50} y={1130} width={260} height={10} rx={5} fill="var(--aco-sombra)" />
        <clipPath id="clip-esteira-mapa">
          <rect x={56} y={1131} width={248} height={8} />
        </clipPath>
        <g clipPath="url(#clip-esteira-mapa)">
          <g className="ambiente-esteira">
            {Array.from({ length: 18 }, (_, i) => (
              <rect key={i} x={56 + i * 16} y={1133} width={7} height={2} fill="var(--aco)" />
            ))}
          </g>
        </g>
        {[80, 112, 144, 200, 232].map((x, i) => (
          <path key={x} d={`M ${x - 7} ${1129} Q ${x - 9} ${1112} ${x} ${1110 - (i % 2) * 2} Q ${x + 9} ${1112} ${x + 7} ${1129} Z`} fill="var(--saca)" stroke="var(--saca-sombra)" strokeWidth={0.8} />
        ))}
        <Engrenagem x={330} y={1100} r={22} dentes={10} girando cor="var(--latao)" />
        <Engrenagem x={300} y={1078} r={12} dentes={8} girando cor="var(--latao-sombra)" />
        {/* carroças saindo */}
        {[70, 150].map((x) => (
          <g key={x}>
            <rect x={x} y={1176} width={50} height={10} rx={2} fill="var(--madeira)" />
            <circle cx={x + 10} cy={1192} r={6} fill="var(--aco)" />
            <circle cx={x + 40} cy={1192} r={6} fill="var(--aco)" />
          </g>
        ))}
        <Placa x={196} y={1166} largura={146} altura={22}>
          A Partilha
        </Placa>
        <text x={269} y={1206} textAnchor="middle" fontSize={11} fill={estado.partilhaAcesa ? "var(--ambar)" : "var(--texto-mundo-suave)"}>
          {estado.partilhaAcesa ? "setor aceso" : `${estado.partilhaMissoes} de 5 missões`}
        </text>
        {/* cabine do elevador parada neste andar */}
        <rect x={350} y={1150} width={20} height={30} rx={2} fill="var(--latao)" />
        <rect x={354} y={1156} width={12} height={10} fill={estado.partilhaAcesa ? "var(--janela)" : "var(--janela-apagada)"} />
        <rect className="anel-foco" x={30} y={1015} width={340} height={202} rx={8} />
      </Clicavel>
      <Viga x={18} y={1221} largura={364} altura={9} rebites={9} />

      {/* Chamado do Nônio */}
      {estado.chamado && destinos.chamado && (
        <Clicavel rotulo={estado.chamado === "revisita" ? "Chamado do Nônio: revisita" : estado.chamado === "eco" ? "Chamado: eco" : "Chamado do Nônio: uma medida rápida"} onAtivar={destinos.chamado} id="chamado">
          <circle cx={60} cy={990} r={26} fill="var(--turquesa-halo)" className="piloto" />
          <circle cx={60} cy={990} r={20} fill="var(--noite-funda)" stroke="var(--turquesa)" strokeWidth={2.5} />
          <rect x={56} y={976} width={8} height={26} rx={2} fill="var(--latao)" />
          <path d="M 56 976 L 46 976 L 44 980 L 56 980 Z" fill="var(--latao)" />
          <circle cx={62} cy={987} r={3.5} fill="var(--turquesa-clara)" />
          <rect x={86} y={980} width={estado.chamado === "sondagem" ? 112 : 84} height={20} rx={4} fill="var(--noite-funda)" stroke="var(--turquesa)" />
          <text x={estado.chamado === "sondagem" ? 142 : 128} y={991} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="var(--turquesa-clara)" className="fonte-sinal" style={{ textTransform: "uppercase" }}>
            {estado.chamado === "revisita" ? "Revisita" : estado.chamado === "eco" ? "Eco" : "Medida rápida"}
          </text>
        </Clicavel>
      )}

      {/* Base: Museu, portão, Rua */}
      <Clicavel rotulo={estado.museuAberto ? "Museu das Descobertas: entrar" : "Museu das Descobertas: abre depois da missão 4"} onAtivar={estado.museuAberto ? destinos.museu : undefined} id="museu">
        <g opacity={estado.museuAberto ? 1 : 0.62}>
          <path d="M 26 1268 L 84 1240 L 142 1268 Z" fill="var(--aco)" />
          <rect x={30} y={1268} width={108} height={8} fill="var(--aco-claro)" />
          {[40, 62, 84, 106, 128].map((x) => (
            <rect key={x} x={x - 4} y={1276} width={8} height={96} fill="var(--aco-claro)" />
          ))}
          <rect x={30} y={1372} width={108} height={10} fill="var(--aco)" />
          {[51, 73, 95, 117].map((x) => (
            <rect key={x} x={x - 6} y={1300} width={12} height={40} fill={estado.museuAberto ? "var(--janela)" : "var(--janela-apagada)"} />
          ))}
          <Placa x={30} y={1390} largura={108} altura={18}>
            Museu
          </Placa>
          {!estado.museuAberto && <Trava x={84} y={1350} />}
          {!estado.museuAberto && (
            <text x={84} y={1426} textAnchor="middle" fontSize={10.5} fill="var(--texto-mundo-suave)">
              abre depois da missão 4
            </text>
          )}
        </g>
      </Clicavel>

      <g aria-hidden="true">
        <path d="M 160 1382 L 160 1300 A 40 40 0 0 1 240 1300 L 240 1382 Z" fill="var(--esmalte)" stroke="var(--latao)" strokeWidth={2} />
        <line x1={200} y1={1262} x2={200} y2={1382} stroke="var(--latao-sombra)" strokeWidth={2} />
        <Rebite x={190} y={1330} r={2.4} />
        <Rebite x={210} y={1330} r={2.4} />
        <Lampada x={200} y={1252} r={4} estado="acesa" />
        <text x={200} y={1402} textAnchor="middle" fontSize={11} className="fonte-sinal" fontWeight={700} fill="var(--latao-claro)" style={{ letterSpacing: 1 }}>
          PORTÃO
        </text>
      </g>

      <Clicavel rotulo={estado.ruaAberta ? "A Rua, matemática invisível: entrar" : "A Rua: abre depois da missão 4"} onAtivar={estado.ruaAberta ? destinos.rua : undefined} id="rua">
        <g opacity={estado.ruaAberta ? 1 : 0.62}>
          <path d="M 262 1312 L 290 1288 L 318 1312 Z" fill="var(--vermelhao-sombra)" />
          <rect x={266} y={1312} width={48} height={70} fill="var(--aco)" />
          <rect x={276} y={1326} width={12} height={14} fill={estado.ruaAberta ? "var(--janela)" : "var(--janela-apagada)"} />
          <rect x={294} y={1350} width={12} height={32} fill="var(--madeira-sombra)" />
          <path d="M 318 1330 L 344 1306 L 370 1330 Z" fill="var(--latao-sombra)" />
          <rect x={322} y={1330} width={44} height={52} fill="var(--aco-sombra)" />
          <rect x={332} y={1342} width={10} height={12} fill={estado.ruaAberta ? "var(--janela)" : "var(--janela-apagada)"} />
          <line x1={252} y1={1382} x2={252} y2={1300} stroke="var(--aco-claro)" strokeWidth={2} />
          <Lampada x={252} y={1296} r={3.4} estado={estado.ruaAberta ? "acesa" : "apagada"} />
          <Placa x={266} y={1390} largura={100} altura={18}>
            A Rua
          </Placa>
          {!estado.ruaAberta && <Trava x={316} y={1352} />}
          {!estado.ruaAberta && (
            <text x={316} y={1426} textAnchor="middle" fontSize={10.5} fill="var(--texto-mundo-suave)">
              abre depois da missão 4
            </text>
          )}
        </g>
      </Clicavel>

      {/* Chão */}
      <rect x={0} y={1440} width={400} height={80} fill="var(--noite-funda)" />
      <line x1={0} y1={1442} x2={400} y2={1442} stroke="var(--latao-sombra)" strokeWidth={2} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={10 + i * 40} y={1470} width={20} height={3} fill="var(--noite-traco)" />
      ))}
    </svg>
  );
}

/** Trava: existe, falta progresso. Diferente do "em projeto". */
function Trava({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true">
      <path d={`M ${x - 6} ${y - 4} L ${x - 6} ${y - 10} A 6 6 0 0 1 ${x + 6} ${y - 10} L ${x + 6} ${y - 4}`} fill="none" stroke="var(--latao)" strokeWidth={2.4} />
      <rect x={x - 9} y={y - 4} width={18} height={14} rx={2} fill="var(--latao)" />
      <circle cx={x} cy={y + 2} r={2} fill="var(--latao-sombra)" />
    </g>
  );
}
