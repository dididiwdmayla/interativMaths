"use client";

/**
 * Abertura: até 30 segundos, pulável, não se repete sozinha. Uma página quadriculada; o Engenho
 * aparece a caneta e colorido; a tinta desbota para lápis, distrito por distrito; o título com
 * marca-texto; a Dália entrega o Caderno, com a nota à mão numa folha pautada; o Nônio aparece.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { marcarAberturaVista } from "@/nucleo/progresso";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { FolhaPautada, NotaDalia } from "@/componentes/missao/Papel";
import { Nonio } from "@/componentes/nonio/Nonio";
import { Marca } from "@/componentes/ui/Marca";
import { DesenhoContrapeso, DesenhoPartilha, DesenhoPatio } from "./Distritos";

const DURACOES = [4200, 6400, 4600, 6200];

export function Abertura() {
  const router = useRouter();
  const rever = useSearchParams().get("rever") === "1";
  const { atualizar } = useProgresso();
  const [cena, setCena] = useState(0);

  useEffect(() => {
    if (cena >= DURACOES.length) return;
    const t = setTimeout(() => setCena((c) => c + 1), DURACOES[cena]);
    return () => clearTimeout(t);
  }, [cena]);

  const terminar = (destino: string) => {
    atualizar((p, agora) => marcarAberturaVista(p, agora));
    router.push(destino);
  };
  const avancar = () => setCena((c) => Math.min(c + 1, DURACOES.length));

  return (
    <main data-pronto="sim" data-tela="abertura" data-cena={cena} className="relative flex min-h-dvh flex-col overflow-hidden" onClick={cena < DURACOES.length ? avancar : undefined}>
      <div className="area-segura area-segura-topo absolute right-0 top-0 z-10 pt-3">
        <button
          type="button"
          className="botao-secundario"
          onClick={(e) => {
            e.stopPropagation();
            terminar(rever ? "/menu" : "/calibragem");
          }}
          data-acao="pular"
        >
          Pular
        </button>
      </div>

      <div className="area-segura mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
        {(cena === 0 || cena === 1) && (
          <Cena key="engenho">
            <Engenho desbotando={cena === 1} />
            {cena === 0 ? <Fala>O Engenho fazia a cidade funcionar.</Fala> : <Fala>Ninguém esqueceu como ligar. Esqueceram por que funcionava.</Fala>}
          </Cena>
        )}
        {cena === 2 && (
          <Cena key="titulo">
            <div className="flex flex-col items-center gap-3" role="img" aria-label="interativMaths: uma aventura de matemática">
              <Marca tamanho={44} />
              <p className="m-0 font-mao text-[28px] font-bold leading-none text-caneta">uma aventura de matemática</p>
            </div>
            <Fala>Passe o Engenho a caneta de novo, descobrindo por que ele funciona.</Fala>
          </Cena>
        )}
        {cena === 3 && (
          <Cena key="caderno">
            <FolhaPautada titulo="Caderno" className="w-full max-w-[360px] rotate-[-1.5deg] rounded-[16px] text-left shadow-[0_4px_0_var(--sombra)]">
              <div className="pt-[14px]">
                <NotaDalia>Sigo o manual há trinta anos e nunca entendi metade.</NotaDalia>
                <NotaDalia>Fica com o Caderno. Escreve o porquê.</NotaDalia>
              </div>
            </FolhaPautada>
            <p className="m-0 text-[15px] font-semibold text-tinta-suave">A Dália entrega o Caderno.</p>
          </Cena>
        )}
        {cena >= 4 && (
          <Cena key="nonio">
            <NonioChegando />
            <Fala>Antes de tudo, preciso saber em que marca você está.</Fala>
            <div className="flex w-full max-w-sm flex-col gap-2">
              {rever ? (
                <button type="button" className="botao-principal w-full" onClick={() => terminar("/menu")} data-acao="fim-abertura">
                  Voltar ao menu
                </button>
              ) : (
                <button type="button" className="botao-principal w-full" onClick={() => terminar("/calibragem")} data-acao="fim-abertura">
                  Começar
                </button>
              )}
            </div>
          </Cena>
        )}
      </div>

      {cena < DURACOES.length && <p className="area-segura-base m-0 pb-5 text-center text-[14px] font-semibold text-tinta-suave">toque para seguir</p>}
    </main>
  );
}

function Cena({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col items-center gap-6 anima-subir">{children}</div>;
}

function Fala({ children }: { children: ReactNode }) {
  return <p className="m-0 max-w-sm text-[21px] font-bold leading-snug">{children}</p>;
}

/** Uma camada a tinta por cima da mesma a lápis; desbotar é a de tinta esmaecer. */
function Desbota({ desbotando, atraso, lapis, tinta }: { desbotando: boolean; atraso: number; lapis: ReactNode; tinta: ReactNode }) {
  return (
    <g>
      {lapis}
      <g className="camada" style={{ opacity: desbotando ? 0 : 1, transitionDelay: `${atraso}ms`, transitionDuration: "900ms" }}>
        {tinta}
      </g>
    </g>
  );
}

/** O Engenho desenhado a caneta, que desbota para lápis, distrito por distrito. */
function Engenho({ desbotando }: { desbotando: boolean }) {
  return (
    <svg viewBox="20 30 360 540" className="block w-full max-w-[340px]" aria-label={desbotando ? "O Engenho desbota para lápis, distrito por distrito." : "O Engenho, desenhado a caneta e colorido."} role="img">
      <path d="M178 390 C 196 360, 200 318, 176 280 M170 250 C 200 232, 214 170, 236 120" fill="none" stroke="var(--grafite)" strokeWidth={2.4} strokeDasharray="7 7" strokeLinecap="round" />
      <Desbota desbotando={desbotando} atraso={300} lapis={<DesenhoPatio lapis />} tinta={<DesenhoPatio lapis={false} />} />
      <Desbota desbotando={desbotando} atraso={1500} lapis={<DesenhoContrapeso lapis />} tinta={<DesenhoContrapeso lapis={false} />} />
      <Desbota
        desbotando={desbotando}
        atraso={2700}
        lapis={
          <g className="a-lapis">
            <DesenhoPartilha girando={false} comNonio={false} />
          </g>
        }
        tinta={<DesenhoPartilha girando={false} comNonio={false} />}
      />
    </svg>
  );
}

function NonioChegando() {
  const [chegou, setChegou] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setChegou(true), 500);
    return () => clearTimeout(t);
  }, []);
  return <Nonio expressao={chegou ? "atento" : "quieto"} tamanho={130} />;
}
