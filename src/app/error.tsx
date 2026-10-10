"use client";

/**
 * Quando algo quebra numa tela: a máquina emperrou. O progresso salvo não se perde.
 */
import Link from "next/link";
import { useEffect } from "react";
import { FichaEstado } from "@/componentes/ui/FichaEstado";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <FichaEstado tela="erro" expressao="duvida" titulo="A máquina emperrou">
      <p className="m-0 text-[16px] font-medium text-tinta-suave">Algo travou nesta tela. O que você já fez continua salvo.</p>
      <div className="flex w-full flex-col gap-2.5">
        <button type="button" className="botao-principal w-full" onClick={reset}>
          Tentar de novo
        </button>
        <Link href="/mapa" className="botao-secundario w-full">
          Voltar ao mapa
        </Link>
      </div>
    </FichaEstado>
  );
}
