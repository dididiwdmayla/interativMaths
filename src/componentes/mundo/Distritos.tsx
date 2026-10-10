/**
 * Os distritos do Engenho desenhados no caderno, todos na mesma folha de 780 por 732.
 * Cada desenho existe a tinta e colorido; a lápis é o mesmo desenho com o grupo `a-lapis` por fora.
 * O mapa e a abertura usam as mesmas peças e as mesmas posições.
 */
import type { ReactNode } from "react";
import { ElipseMarcaTexto, Engrenagem, TRACO } from "./kit";

export const FOLHA_MAPA = { largura: 780, altura: 732 } as const;

export type IdDistrito = "partilha" | "contrapeso" | "patio" | "observatorio" | "estaleiro" | "feira" | "museu" | "rua";

/** Onde fica a etiqueta de cada lugar (centro, topo), na folha. */
export const ETIQUETAS: Record<IdDistrito, { x: number; y: number }> = {
  partilha: { x: 200, y: 546 },
  contrapeso: { x: 104, y: 296 },
  patio: { x: 304, y: 134 },
  observatorio: { x: 560, y: 150 },
  estaleiro: { x: 478, y: 348 },
  feira: { x: 692, y: 300 },
  museu: { x: 520, y: 560 },
  rua: { x: 692, y: 560 },
};

/** A área que se toca em cada desenho (x, y, largura, altura). */
export const AREAS: Record<IdDistrito, [number, number, number, number]> = {
  partilha: [80, 380, 240, 200],
  contrapeso: [50, 228, 110, 110],
  patio: [240, 40, 120, 136],
  observatorio: [500, 40, 120, 150],
  estaleiro: [420, 240, 120, 150],
  feira: [630, 200, 124, 140],
  museu: [462, 440, 116, 160],
  rua: [632, 440, 120, 160],
};

const tinta = { stroke: "var(--tinta)", strokeWidth: TRACO, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Lapis({ lapis, children }: { lapis: boolean; children: ReactNode }) {
  return <g className={lapis ? "a-lapis" : undefined}>{children}</g>;
}

/** A Partilha: engrenagem, torre, galpão com janelas, pães na esteira. */
export function DesenhoPartilha({ girando = true, comNonio = true }: { girando?: boolean; comNonio?: boolean }) {
  return (
    <g>
      <ElipseMarcaTexto cx={196} cy={496} rx={138} ry={17} />
      <g {...tinta}>
        <Engrenagem x={112} y={446} r={16} dentes={9} girando={girando} />
        <rect x={238} y={408} width={32} height={72} rx={4} fill="var(--vermelho-claro)" />
        <path d="M238 414 a16 13 0 0 1 32 0" fill="var(--vermelho-palido)" />
        <path d="M238 440 H270" fill="none" />
        <path d="M132 420 V396 L163 420 Z M163 420 V396 L194 420 Z M194 420 V396 L225 420 Z" fill="var(--caneta-clara)" />
        <rect x={132} y={420} width={93} height={60} rx={4} fill="var(--caneta)" />
        <rect x={143} y={432} width={15} height={15} rx={2} fill="var(--marca-texto)" strokeWidth={2.2} />
        <rect x={171} y={432} width={15} height={15} rx={2} fill="var(--marca-texto)" strokeWidth={2.2} />
        <rect x={199} y={432} width={15} height={15} rx={2} fill="var(--marca-texto)" strokeWidth={2.2} />
        <rect x={171} y={458} width={15} height={22} rx={2} fill="var(--folha)" strokeWidth={2.2} />
        <path d="M116 488 a10 9 0 0 1 20 0 Z" fill="var(--pao)" strokeWidth={2.2} />
        <path d="M142 488 a10 9 0 0 1 20 0 Z" fill="var(--pao)" strokeWidth={2.2} />
        <path d="M168 488 a10 9 0 0 1 20 0 Z" fill="var(--pao)" strokeWidth={2.2} />
        <rect x={102} y={488} width={128} height={12} rx={6} fill="var(--folha)" />
        <circle cx={112} cy={494} r={1.6} fill="var(--tinta)" />
        <circle cx={166} cy={494} r={1.6} fill="var(--tinta)" />
        <circle cx={220} cy={494} r={1.6} fill="var(--tinta)" />
      </g>
      {comNonio && <NonioNoMapa x={270} y={500} />}
    </g>
  );
}

/** O Nônio de pé, ao lado da esteira (desenho fixo, sem expressão). */
function NonioNoMapa({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="var(--tinta)" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <line x1={28} y1={-28} x2={34} y2={-37} />
      <circle cx={35} cy={-39} r={4} fill="var(--marca-texto)" />
      <rect x={15} y={6} width={5} height={9} rx={2.5} fill="var(--caneta-clara)" />
      <rect x={36} y={6} width={5} height={9} rx={2.5} fill="var(--caneta-clara)" />
      <path d="M0 0 A28 28 0 0 1 56 0 Z" fill="var(--caneta)" />
      <path d="M10 0 A18 18 0 0 1 46 0 Z" fill="var(--folha)" />
      <rect x={-3} y={0} width={62} height={8} rx={4} fill="var(--caneta-clara)" />
      <circle cx={22} cy={-8} r={1.5} fill="var(--tinta)" stroke="none" />
      <circle cx={34} cy={-8} r={1.5} fill="var(--tinta)" stroke="none" />
      <path d="M25 -4.5 Q28 -2 31 -4.5" fill="none" strokeWidth={1.8} />
    </g>
  );
}

/** O Contrapeso: uma balança de dois pratos. */
export function DesenhoContrapeso({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M60 284 H148" fill="none" />
        <rect x={101} y={238} width={6} height={46} fill="var(--tinta-suave)" />
        <path d="M62 240 H146" fill="none" />
        <path d="M70 240 V258 M138 240 V258" fill="none" />
        <path d="M56 258 h28 a14 9 0 0 1 -28 0 Z" fill="var(--marca-texto)" />
        <path d="M124 258 h28 a14 9 0 0 1 -28 0 Z" fill="var(--caneta-clara)" />
      </g>
    </Lapis>
  );
}

/** Pátio dos Sinais: um poste com três sinais de chave. */
export function DesenhoPatio({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M246 122 H338" fill="none" />
        <rect x={289} y={92} width={6} height={30} fill="var(--tinta-suave)" />
        <rect x={279} y={48} width={26} height={44} rx={9} fill="var(--caneta)" />
        <circle cx={292} cy={60} r={4.5} fill="var(--vermelho-claro)" />
        <circle cx={292} cy={70} r={4.5} fill="var(--marca-texto)" />
        <circle cx={292} cy={80} r={4.5} fill="var(--verde-palido)" />
      </g>
    </Lapis>
  );
}

/** Observatório: cúpula com luneta e o gráfico de uma função no quadro. */
export function DesenhoObservatorio({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M512 128 H608" fill="none" />
        <line x1={578} y1={74} x2={604} y2={50} strokeWidth={6} />
        <path d="M528 104 A32 32 0 0 1 592 104 Z" fill="var(--caneta-clara)" />
        <rect x={524} y={104} width={72} height={24} rx={3} fill="var(--folha)" />
        <path d="M556 104 V80" fill="none" />
        <path d="M532 122 Q 546 106 560 116 T 588 108" fill="none" stroke="var(--caneta)" strokeWidth={2} />
      </g>
    </Lapis>
  );
}

/** Estaleiro das Formas: um guindaste erguendo um quadrado; um triângulo no chão. */
export function DesenhoEstaleiro({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M428 330 H530" fill="none" />
        <path d="M446 330 V256 H520" fill="none" strokeWidth={3} />
        <path d="M446 270 L462 256" fill="none" />
        <path d="M508 256 V276" fill="none" />
        <rect x={496} y={276} width={24} height={24} rx={2} fill="var(--caneta-clara)" />
        <path d="M464 330 L478 304 L492 330 Z" fill="var(--marca-texto)" />
        <rect x={440} y={316} width={12} height={14} fill="var(--folha)" />
      </g>
    </Lapis>
  );
}

/** Feira do Acaso: uma barraca listrada e um dado. */
export function DesenhoFeira({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M640 282 H744" fill="none" />
        <path d="M652 238 L688 212 L724 238 Z" fill="var(--vermelho-claro)" />
        <rect x={656} y={238} width={64} height={44} fill="var(--folha)" />
        <path d="M672 238 V282 M688 238 V282 M704 238 V282" fill="none" strokeWidth={1.8} />
        <path d="M688 212 V200 l10 4 l-10 4" fill="var(--marca-texto)" />
        <rect x={724} y={258} width={22} height={22} rx={4} fill="var(--folha)" />
        <circle cx={730} cy={264} r={1.8} fill="var(--tinta)" stroke="none" />
        <circle cx={735} cy={269} r={1.8} fill="var(--tinta)" stroke="none" />
        <circle cx={740} cy={274} r={1.8} fill="var(--tinta)" stroke="none" />
      </g>
    </Lapis>
  );
}

/** Museu das Descobertas: frontão com colunas. */
export function DesenhoMuseu({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M474 534 H566" fill="none" />
        <path d="M478 470 L520 448 L562 470 Z" fill="var(--caneta-clara)" />
        <rect x={480} y={470} width={80} height={8} fill="var(--folha)" />
        {[490, 510, 530, 550].map((x) => (
          <rect key={x} x={x - 4} y={478} width={8} height={46} fill="var(--caneta-palida)" />
        ))}
        <rect x={476} y={524} width={88} height={10} fill="var(--folha)" />
        <circle cx={520} cy={462} r={4} fill="var(--marca-texto)" />
      </g>
    </Lapis>
  );
}

/** A Rua: duas casas e uma árvore. */
export function DesenhoRua({ lapis }: { lapis: boolean }) {
  return (
    <Lapis lapis={lapis}>
      <g {...tinta}>
        <path d="M640 534 H748" fill="none" />
        <rect x={648} y={490} width={40} height={44} fill="var(--folha)" />
        <path d="M644 492 L668 470 L692 492 Z" fill="var(--vermelho-claro)" />
        <rect x={656} y={500} width={11} height={11} rx={1} fill="var(--marca-texto)" strokeWidth={2} />
        <rect x={672} y={512} width={10} height={22} rx={1} fill="var(--caneta-clara)" strokeWidth={2} />
        <rect x={696} y={500} width={32} height={34} fill="var(--folha)" />
        <path d="M692 502 L712 484 L732 502 Z" fill="var(--pao)" />
        <rect x={704} y={510} width={10} height={10} rx={1} fill="var(--marca-texto)" strokeWidth={2} />
        <path d="M740 534 V512" fill="none" />
        <circle cx={740} cy={504} r={9} fill="var(--verde-palido)" />
      </g>
    </Lapis>
  );
}
