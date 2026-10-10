"use client";

/**
 * Quando algo quebra numa tela: a máquina emperrou. O progresso salvo não se perde.
 */
import Link from "next/link";
import { useEffect } from "react";
import { Nonio } from "@/componentes/nonio/Nonio";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main data-pronto="sim" data-tela="erro" className="area-segura flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
      <Nonio expressao="duvida" tamanho={84} />
      <h1 className="fonte-sinal m-0 text-[2rem] font-extrabold uppercase text-latao-claro">A máquina emperrou</h1>
      <p className="m-0 max-w-sm text-texto-mundo-suave">Algo travou nesta tela. O que você já fez continua salvo.</p>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <button type="button" className="placa placa-cheia w-full" onClick={reset}>
          Tentar de novo
        </button>
        <Link href="/mapa" className="placa w-full">
          Voltar ao mapa
        </Link>
      </div>
    </main>
  );
}
