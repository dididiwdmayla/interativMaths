"use client";

/**
 * O fim da degustação: a comemoração (a padaria passa a caneta, e a descoberta fica escrita), um
 * trailer curto do resto do Engenho, sem jogar, e "Quero continuar". Embutida, a recepção ouve
 * "concluiu", "quero-continuar" e "fechar"; sozinha, "Quero continuar" leva ao acesso.
 */
import { useEffect, useRef, useState } from "react";
import { TRAILER, type CenaTrailer } from "@/conteudo/degustacao";
import { DesenhoContrapeso, DesenhoEstaleiro, DesenhoFeira, DesenhoMuseu, DesenhoObservatorio, DesenhoPartilha, DesenhoPatio, DesenhoRua } from "@/componentes/mundo/Distritos";
import { PassarACaneta } from "@/componentes/mundo/kit";
import { Nonio } from "@/componentes/nonio/Nonio";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { avisarRecepcao, URL_ACESSO } from "./recepcao";

/** Quanto cada cena do trailer fica na tela. */
const CENA_MS = 3600;

export function FimDegustacao({ recepcao, onDeNovo }: { recepcao: boolean; onDeNovo: () => void }) {
  const avisou = useRef(false);
  useEffect(() => {
    if (avisou.current) return;
    avisou.current = true;
    avisarRecepcao("concluiu");
  }, []);

  return (
    <main data-pronto="sim" data-tela="degustacao-fim" className="flex min-h-dvh flex-col">
      <div className="area-segura mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-6 pb-6 pt-6 md:grid md:grid-cols-2 md:items-start md:gap-7 lg:pt-10">
        <Comemoracao />
        <Trailer />
      </div>
      <div className="area-segura area-segura-base sticky bottom-0 z-20 flex-none border-t-2 border-tinta bg-papel pt-3">
        <div className="mx-auto flex w-full max-w-[520px] flex-col gap-1.5 md:max-w-[640px] md:flex-row md:items-center md:gap-3">
          <a
            href={URL_ACESSO}
            className="botao-principal w-full md:flex-1"
            data-acao="quero-continuar"
            onClick={(e) => {
              // Embutida, a recepção cuida de levar ao acesso; sozinha, o link leva.
              if (avisarRecepcao("quero-continuar")) e.preventDefault();
            }}
          >
            Quero continuar
          </a>
          {recepcao ? (
            <button type="button" className="botao-discreto w-full justify-center md:w-auto" onClick={() => avisarRecepcao("fechar")} data-acao="fechar-ilhota">
              Agora não
            </button>
          ) : (
            <button type="button" className="botao-discreto w-full justify-center md:w-auto" onClick={onDeNovo} data-acao="de-novo">
              Jogar de novo
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/** A padaria, que estava a lápis, passa a caneta; o Nônio satisfeito; a descoberta escrita. */
function Comemoracao() {
  const [feito, setFeito] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFeito(true), 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <section className="ficha relative flex flex-col items-center gap-4 px-5 pb-6 pt-5 text-center" data-comemoracao={feito ? "feita" : "lapis"} aria-labelledby="titulo-comemoracao">
      <p className="letra-mao absolute right-5 top-4 m-0 rotate-[-6deg] text-[30px] text-verde-escuro" aria-hidden="true">
        feita!
      </p>
      <div className="flex w-full items-end justify-center gap-1">
        <svg viewBox="96 386 186 124" className="block w-full max-w-[250px]" role="img" aria-label="A padaria do Engenho, passada a caneta.">
          <PassarACaneta feito={feito}>
            <DesenhoPartilha girando={false} comNonio={false} />
          </PassarACaneta>
        </svg>
        <div className="-ml-3 shrink-0">
          <Nonio expressao={feito ? "satisfeito" : "atento"} tamanho={78} />
        </div>
      </div>
      <h1 id="titulo-comemoracao" className="m-0 text-[24px] font-extrabold leading-tight">
        <span className="marca-texto" data-cresce="">
          A padaria passou a caneta
        </span>
      </h1>
      <p className="m-0 max-w-sm text-[16px] font-medium leading-snug">
        Ninguém disse a regra. Você mexeu na máquina e descobriu o que muita gente só decorou:
      </p>
      <div className="quadro-notacao items-center" data-descoberta="">
        <LinhaNotacao texto="3 ÷ 4 = 3/4" tamanho="media" rotulos={false} />
      </div>
      <p className="m-0 max-w-sm text-[17px] font-bold leading-snug">
        O traço da fração <span className="grifo">é uma divisão</span>. Sempre foi.
      </p>
      <p className="m-0 max-w-sm text-[15px] font-medium text-tinta-suave">Foi uma missão. O Engenho tem outras, e cada uma passa um pedaço da cidade a caneta.</p>
    </section>
  );
}

/** Um trailer curto, sem jogar: os lugares do Engenho, um de cada vez. Toque para passar. */
function Trailer() {
  const [cena, setCena] = useState(0);
  const [parado, setParado] = useState(false);
  useEffect(() => {
    if (parado) return;
    const t = setInterval(() => setCena((c) => (c + 1) % TRAILER.length), CENA_MS);
    return () => clearInterval(t);
  }, [parado]);
  const atual = TRAILER[cena];
  const ir = (i: number) => {
    setParado(true);
    setCena(i);
  };
  return (
    <section className="ficha-quadriculada flex flex-col gap-3 px-4 pb-4 pt-4" aria-labelledby="titulo-trailer" data-trailer="" data-cena={atual.id}>
      <h2 id="titulo-trailer" className="letra-mao m-0 text-[28px] leading-none text-caneta">
        o que mais existe no Engenho
      </h2>
      <button
        type="button"
        className="flex min-h-[260px] w-full flex-col items-start gap-3 rounded-xl text-left"
        onClick={() => ir((cena + 1) % TRAILER.length)}
        aria-label={`${atual.lugar}. ${atual.texto} Toque para a próxima.`}
        data-acao="trailer-proxima"
      >
        <span key={atual.id} className="flex w-full flex-col items-start gap-3 anima-subir" aria-hidden="true">
          <span className="caixa flex h-[150px] w-full items-center justify-center overflow-hidden px-3 py-2">
            <DesenhoDaCena cena={atual} />
          </span>
          <span className="etiqueta-lugar" data-material={atual.existe ? undefined : "lapis"}>
            {atual.lugar}
            {!atual.existe && <span className="letra-mao text-[19px] leading-none text-tinta-suave">em projeto</span>}
          </span>
          <span className="block text-[16px] font-medium leading-snug">{atual.texto}</span>
        </span>
      </button>
      <div className="-mx-2 flex items-center justify-center" role="group" aria-label="Cenas do trailer">
        {TRAILER.map((c, i) => (
          <button key={c.id} type="button" className="grid h-11 w-11 place-items-center" onClick={() => ir(i)} aria-label={c.lugar} aria-current={i === cena ? "true" : undefined} data-cena-trailer={c.id}>
            <span className={`block h-3 w-3 rounded-full border-2 ${i === cena ? "border-tinta bg-caneta" : c.existe ? "border-tinta bg-folha" : "border-dashed border-grafite bg-folha"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}

/** O desenho de cada cena, recortado da folha do mapa. O que não existe ainda fica a lápis. */
function DesenhoDaCena({ cena }: { cena: CenaTrailer }) {
  switch (cena.id) {
    case "partilha":
      return (
        <svg viewBox="96 386 240 132" className="block h-full max-w-full">
          <DesenhoPartilha girando={false} />
        </svg>
      );
    case "museu":
      return (
        <svg viewBox="462 438 116 104" className="block h-full max-w-full">
          <DesenhoMuseu lapis={false} />
        </svg>
      );
    case "rua":
      return (
        <svg viewBox="632 460 126 82" className="block h-full max-w-full">
          <DesenhoRua lapis={false} />
        </svg>
      );
    case "caderno":
      return <DesenhoCaderno />;
    case "lapis":
      return (
        <svg viewBox="44 36 712 310" className="block h-full max-w-full">
          <DesenhoPatio lapis />
          <DesenhoObservatorio lapis />
          <DesenhoContrapeso lapis />
          <DesenhoEstaleiro lapis />
          <DesenhoFeira lapis />
        </svg>
      );
  }
}

/** Uma página do Caderno, pautada, com a descoberta passada a limpo. */
function DesenhoCaderno() {
  return (
    <svg viewBox="0 0 220 130" className="block h-full max-w-full">
      <g stroke="var(--tinta)" strokeWidth={2.4} strokeLinejoin="round">
        <rect x={20} y={10} width={180} height={112} rx={8} fill="var(--folha)" />
      </g>
      {[42, 62, 82, 102].map((y) => (
        <line key={y} x1={22} x2={198} y1={y} y2={y} stroke="var(--pauta)" strokeWidth={1.4} />
      ))}
      <line x1={46} x2={46} y1={12} y2={120} stroke="var(--margem)" strokeWidth={1.8} />
      <text x={56} y={34} fontFamily="var(--fonte-mao)" fontWeight={700} fontSize={20} fill="var(--tinta)">
        O traço é uma divisão
      </text>
      <rect x={54} y={46} width={92} height={20} rx={3} fill="var(--marca-texto)" transform="rotate(-1.5 100 56)" />
      <text x={60} y={61} fontWeight={800} fontSize={15} fill="var(--tinta)">
        3 ÷ 4 = 3/4
      </text>
      <text x={56} y={98} fontFamily="var(--fonte-mao)" fontWeight={700} fontSize={17} fill="var(--caneta)">
        com a sua letra
      </text>
    </svg>
  );
}
