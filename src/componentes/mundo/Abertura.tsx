"use client";

/**
 * Abertura: até 30 segundos, pulável, não se repete sozinha.
 * Uma luz-piloto; as luzes do corte se apagam; a placa do título; a Dália entrega o Caderno;
 * o Nônio se desdobra e começa a calibragem.
 */
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marcarAberturaVista } from "@/nucleo/progresso";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Nonio } from "@/componentes/nonio/Nonio";
import { Rebite } from "./kit";

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
    <main data-pronto="sim" data-tela="abertura" data-cena={cena} className="relative flex min-h-dvh flex-col overflow-hidden bg-noite-funda" onClick={cena < DURACOES.length ? avancar : undefined}>
      <div className="area-segura area-segura-topo absolute right-0 top-0 z-10">
        <button
          type="button"
          className="placa placa-pequena placa-discreta mt-2"
          onClick={(e) => {
            e.stopPropagation();
            terminar(rever ? "/menu" : "/calibragem");
          }}
          data-acao="pular"
        >
          Pular
        </button>
      </div>

      <div className="area-segura flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        {cena === 0 && (
          <Cena key="c0">
            <svg viewBox="0 0 60 60" width="72" height="72" aria-hidden="true">
              <circle cx="30" cy="30" r="24" fill="var(--ambar-halo)" className="piloto" />
              <circle cx="30" cy="30" r="7" fill="var(--ambar)" />
            </svg>
            <Fala>O Engenho fazia a cidade funcionar.</Fala>
          </Cena>
        )}
        {cena === 1 && (
          <Cena key="c1">
            <CorteApagando />
            <Fala>Ninguém esqueceu como ligar. Esqueceram por que funcionava.</Fala>
          </Cena>
        )}
        {cena === 2 && (
          <Cena key="c2">
            <svg viewBox="0 0 320 120" className="w-full max-w-[340px]" role="img" aria-label="interativMaths: uma aventura de matemática">
              <rect x="6" y="10" width="308" height="100" rx="10" fill="var(--esmalte-sombra)" />
              <rect x="6" y="6" width="308" height="100" rx="10" fill="var(--esmalte)" stroke="var(--latao)" strokeWidth="3" />
              <Rebite x={22} y={22} r={3.4} />
              <Rebite x={298} y={22} r={3.4} />
              <Rebite x={22} y={90} r={3.4} />
              <Rebite x={298} y={90} r={3.4} />
              <text x="160" y="58" textAnchor="middle" className="fonte-sinal" fontSize="42" fontWeight="800" fill="var(--latao-claro)" style={{ letterSpacing: 1 }}>
                interativMaths
              </text>
              <text x="160" y="86" textAnchor="middle" fontSize="15" fill="var(--texto-mundo)">
                uma aventura de matemática
              </text>
            </svg>
            <Fala>Faça o Engenho voltar a funcionar descobrindo por que ele funciona.</Fala>
          </Cena>
        )}
        {cena === 3 && (
          <Cena key="c3">
            <CadernoFechado />
            <figure className="m-0 max-w-sm text-left">
              <figcaption className="fonte-mao text-[1.4rem] text-latao-claro">Dália</figcaption>
              <blockquote className="m-0 text-[1.15rem]">Sigo o manual há trinta anos e nunca entendi metade. Fica com o Caderno. Escreve o porquê.</blockquote>
            </figure>
          </Cena>
        )}
        {cena >= 4 && (
          <Cena key="c4">
            <NonioDesdobrando />
            <Fala>Antes de tudo, preciso saber em que marca você está.</Fala>
            <div className="flex w-full max-w-sm flex-col gap-2">
              {rever ? (
                <button type="button" className="placa placa-cheia w-full" onClick={() => terminar("/menu")} data-acao="fim-abertura">
                  Voltar ao menu
                </button>
              ) : (
                <button type="button" className="placa placa-cheia w-full" onClick={() => terminar("/calibragem")} data-acao="fim-abertura">
                  Começar
                </button>
              )}
            </div>
          </Cena>
        )}
      </div>

      {cena < DURACOES.length && <p className="area-segura-base m-0 pb-4 text-center text-[0.85rem] text-texto-mundo-apagado">toque para seguir</p>}
    </main>
  );
}

function Cena({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full flex-col items-center gap-6 anima-cena">{children}</div>;
}

function Fala({ children }: { children: React.ReactNode }) {
  return <p className="m-0 max-w-sm text-[1.3rem] leading-snug text-texto-mundo">{children}</p>;
}

function CorteApagando() {
  const janelas = Array.from({ length: 18 }, (_, i) => ({ c: i % 3, l: Math.floor(i / 3) }));
  const ordem = [5, 12, 0, 16, 8, 3, 14, 10, 1, 17, 6, 11, 2, 15, 9, 4, 13, 7];
  return (
    <svg viewBox="0 0 160 200" width="160" height="200" aria-hidden="true">
      <path d="M 80 8 L 140 40 L 140 196 L 20 196 L 20 40 Z" fill="var(--noite-clara)" stroke="var(--latao-sombra)" strokeWidth="2" />
      {janelas.map(({ c, l }, i) => (
        <rect
          key={i}
          x={34 + c * 34}
          y={50 + l * 24}
          width={22}
          height={14}
          rx={2}
          fill="var(--janela)"
          className="anima-apagar"
          style={{ animationDelay: `${600 + ordem.indexOf(i) * 260}ms` }}
        />
      ))}
    </svg>
  );
}

function CadernoFechado() {
  return (
    <svg viewBox="0 0 120 150" width="110" height="138" aria-hidden="true" className="-rotate-3">
      <rect x="10" y="8" width="100" height="134" rx="6" fill="var(--papel-sombra)" />
      <rect x="6" y="4" width="100" height="134" rx="6" fill="var(--papel)" stroke="var(--papel-linha)" />
      <rect x="6" y="4" width="14" height="134" fill="var(--latao-sombra)" />
      <text x="62" y="60" textAnchor="middle" className="fonte-sinal" fontSize="16" fontWeight="800" fill="var(--tinta)">
        CADERNO
      </text>
      <line x1="34" x2="92" y1="70" y2="70" stroke="var(--tinta-suave)" />
      <text x="62" y="96" textAnchor="middle" className="fonte-mao" fontSize="15" fill="var(--tinta-dalia)">
        o porquê
      </text>
    </svg>
  );
}

function NonioDesdobrando() {
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAberto(true), 500);
    return () => clearTimeout(t);
  }, []);
  return <Nonio expressao={aberto ? "atento" : "quieto"} tamanho={110} />;
}
