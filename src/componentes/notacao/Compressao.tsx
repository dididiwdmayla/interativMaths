"use client";

/**
 * A frase se comprime em notação: as palavras somem, os números ficam, os sinais aparecem.
 * Só opacidade: com movimento reduzido continua igual.
 */
import { useEffect, useState } from "react";
import { BlocoNotacao } from "./Notacao";

export function Compressao({ frase, linhas, comprimida }: { frase: string; linhas: readonly string[]; comprimida: boolean }) {
  const [fase, setFase] = useState<"frase" | "somindo" | "notacao">(comprimida ? "notacao" : "frase");
  useEffect(() => {
    if (!comprimida) return;
    const t1 = setTimeout(() => setFase("somindo"), 20);
    const t2 = setTimeout(() => setFase("notacao"), 620);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [comprimida]);
  const pedacos = frase.split(/(\d+(?:\/\d+)?)/);
  return (
    <div className="flex flex-col gap-3">
      {fase !== "notacao" ? (
        <p className="m-0 text-[1.25rem] leading-snug text-tinta" data-frase="">
          {pedacos.map((p, i) =>
            /^\d/.test(p) ? (
              <strong key={i} className="font-bold text-tinta">
                {p}
              </strong>
            ) : (
              <span key={i} style={{ opacity: fase === "somindo" ? 0.08 : 1, transition: "opacity 520ms var(--curva-firme)" }}>
                {p}
              </span>
            ),
          )}
        </p>
      ) : (
        <div className="anima-esmaecer" data-compressao="feita">
          <BlocoNotacao linhas={linhas} />
        </div>
      )}
    </div>
  );
}
