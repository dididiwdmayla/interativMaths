/**
 * A conta armada (referência 4 de v04.html), no método da chave com quocientes parciais: cada
 * volta que o jogador deu é uma linha que tira lote × receptores; os quocientes parciais ficam
 * empilhados à direita e somam o quociente; o último número da esquerda é o resto, com
 * marca-texto. Ao lado, o que cada linha quer dizer; embaixo, a forma com o nome dos termos.
 */
import type { Conta, ContaArmada as Chave } from "@/nucleo/missoes/conta";
import { MODELOS_CONTA, ROTULOS_CONTA } from "@/conteudo/conta";
import { IconeCaneta } from "@/componentes/icones/IconeCaneta";

interface Celula {
  readonly texto: string;
  readonly classe?: string;
}

/** As linhas da grade: menos, número da esquerda, barra, quociente parcial. */
function grade(k: Chave): Celula[][] {
  const linhas: Celula[][] = [[{ texto: "" }, { texto: String(k.dividendo), classe: "chave-r" }, { texto: "", classe: "chave-barra" }, { texto: String(k.divisor), classe: "chave-q chave-traco" }]];
  const n = k.linhas.length;
  const direita: Celula[] = [];
  k.linhas.forEach((l, i) => direita.push({ texto: i === 0 ? String(l.parcial) : `+ ${l.parcial}`, classe: `chave-q ${n === 1 ? "chave-marca" : ""}` }));
  if (n >= 2) {
    direita.push({ texto: "", classe: "chave-q chave-traco chave-soma" });
    direita.push({ texto: String(k.quociente), classe: "chave-q chave-marca" });
  }
  if (n === 0) direita.push({ texto: String(k.quociente), classe: "chave-q chave-marca" });
  const esquerda: Celula[][] = [];
  k.linhas.forEach((l, i) => {
    esquerda.push([{ texto: "−", classe: "chave-menos" }, { texto: String(l.tira), classe: "chave-r chave-traco" }]);
    esquerda.push([{ texto: "" }, { texto: String(l.fica), classe: `chave-r ${i === n - 1 ? "chave-marca" : ""}` }]);
  });
  if (n === 0) esquerda.push([{ texto: "" }, { texto: String(k.resto), classe: "chave-r chave-marca" }]);
  const total = Math.max(esquerda.length, direita.length);
  for (let i = 0; i < total; i++) {
    const e = esquerda[i] ?? [{ texto: "" }, { texto: "" }];
    linhas.push([...e, { texto: "" }, direita[i] ?? { texto: "", classe: "chave-q" }]);
  }
  return linhas;
}

export function ContaArmada({
  conta,
  chave,
  semForma = false,
}: {
  conta: Pick<Conta, "expressao" | "extenso" | "tipo">;
  chave: Chave;
  /** Sem a forma embaixo (o Caderno já a tem na notação). */
  semForma?: boolean;
}) {
  const n = MODELOS_CONTA.nomes;
  const termos: [string, string][] = [
    [String(chave.dividendo), n.dividendo],
    [String(chave.divisor), n.divisor],
    [String(chave.quociente), n.quociente],
    [String(chave.resto), n.resto],
  ];
  return (
    <section className="conta-caneta" data-conta={conta.expressao} data-conta-armada={chave.linhas.length} data-tipo-conta={conta.tipo} aria-label={`A conta armada: ${conta.extenso}. ${chave.lado}`}>
      <p className="conta-rotulo m-0">
        <IconeCaneta />
        {ROTULOS_CONTA.armada}
      </p>
      <div className="flex items-start gap-3.5" aria-hidden="true">
        <div className="chave">
          {grade(chave).flatMap((linha, i) =>
            linha.map((c, j) => {
              const marca = c.classe?.includes("chave-marca") ?? false;
              return (
                <span key={`${i}:${j}`} className={c.classe?.replace("chave-marca", "") ?? ""}>
                  {marca && c.texto ? (
                    <span className="marca-chave">{c.texto}</span>
                  ) : c.texto.startsWith("+ ") ? (
                    <>
                      <span className="chave-mais">+</span> {c.texto.slice(2)}
                    </>
                  ) : (
                    c.texto
                  )}
                </span>
              );
            }),
          )}
        </div>
        <p className="chave-lado m-0">{chave.lado}</p>
      </div>
      {!semForma && (
        <p className="conta-forma m-0" aria-hidden="true">
          {`${chave.dividendo} = ${chave.divisor} × ${chave.quociente} + ${chave.resto}`}
        </p>
      )}
      <p className="conta-nomes m-0" aria-hidden="true">
        {termos.map(([v, nome]) => (
          <span key={nome}>
            <strong>{v}</strong> {nome}
          </span>
        ))}
      </p>
    </section>
  );
}
