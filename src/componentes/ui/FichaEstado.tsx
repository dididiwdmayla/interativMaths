/**
 * Uma tela de estado (erro, página inexistente, convite, fim de sondagem): uma ficha centrada com
 * o Nônio, um título e o que fazer.
 */
import type { ReactNode } from "react";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";

/** Uma tela de estado: uma ficha centrada com o Nônio, um título e o que fazer. */
export function FichaEstado({ tela, fase, expressao, titulo, children, atributos }: { tela: string; fase?: string; expressao: ExpressaoNonio; titulo: string; children: ReactNode; atributos?: Record<string, string> }) {
  return (
    <main data-pronto="sim" data-tela={tela} data-fase={fase} {...atributos} className="area-segura flex min-h-dvh flex-col items-center justify-center py-8">
      <section className="ficha flex w-full max-w-[420px] flex-col items-center gap-4 px-5 pb-6 pt-6 text-center">
        <Nonio expressao={expressao} tamanho={110} />
        <h1 className="m-0 text-[24px] font-extrabold leading-tight">{titulo}</h1>
        {children}
      </section>
    </main>
  );
}

