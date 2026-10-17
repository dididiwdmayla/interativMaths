/**
 * Os pares do 5 (1 e 4, 2 e 3) e do 10 (1 e 9 até 5 e 5), em fichas pequenas; os que importam no
 * lance ficam em marca-texto (o degrau 2 e o caminho junto). Olhar não é proibido: só não firma.
 */
import { PARES, TEXTOS_BANCADA } from "@/conteudo/lapidacao";
import { preencher } from "@/nucleo/soroban/textos";

function iguais(a: readonly number[], b: readonly number[] | null): boolean {
  return b !== null && a[0] === b[0] && a[1] === b[1];
}

export function Pares({
  destaque,
  so,
}: {
  destaque: { readonly cinco: readonly [number, number] | null; readonly dez: readonly [number, number] | null };
  /** Só um dos grupos (a abertura mostra os do 5 ou os do 10). */
  so?: "cinco" | "dez";
}) {
  const grupos = so ? [so] : (["cinco", "dez"] as const);
  return (
    <div className="flex flex-col gap-2" data-pares-lista="" aria-label={TEXTOS_BANCADA.osPares}>
      {grupos.map((g) => (
        <div key={g} className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[13.5px] font-bold text-tinta-suave">{PARES[g].titulo}</span>
          {PARES[g].pares.map((par) => {
            const marcado = iguais(par, destaque[g]);
            return (
              <span key={par.join("-")} className="par" data-marcado={marcado ? "sim" : "nao"} data-par={par.join("-")}>
                {preencher(PARES.junto, { a: par[0], b: par[1] })}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
