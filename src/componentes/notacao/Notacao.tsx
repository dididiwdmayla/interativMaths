"use client";

/**
 * Uma linha de notação passada a limpo: "26 ÷ 4 = 6, resto 2". Rubik 800, sinais em azul,
 * fração empilhada com traço horizontal.
 * Os nomes convencionais aparecem como rótulos que o jogador pode mostrar; não se cobra vocabulário.
 * A leitura por extenso vai para o leitor de tela.
 */
import { useState, type ReactNode } from "react";
import { expressaoPorExtenso, lerExpressao, papeis, type Papel, type Token } from "@/nucleo/racional/notacao";

const CURTO: Record<Papel, string> = {
  dividendo: "dividendo",
  divisor: "divisor",
  quociente: "quociente",
  resto: "resto",
  fator: "fator",
  produto: "produto",
  parcela: "parcela",
  soma: "soma",
};

/** Várias linhas de notação com um só botão para mostrar os nomes dos termos. */
export function BlocoNotacao({ linhas }: { linhas: readonly string[] }) {
  const [nomes, setNomes] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      {linhas.map((l, i) => (
        <LinhaNotacao key={l} texto={l} tamanho={i === 0 ? "grande" : "media"} nomes={nomes} rotulos={false} />
      ))}
      <button type="button" className="botao-discreto -ml-3 self-start" onClick={() => setNomes((v) => !v)} aria-pressed={nomes} data-acao="ver-nomes">
        {nomes ? "Esconder os nomes" : "Ver os nomes dos termos"}
      </button>
    </div>
  );
}

export function LinhaNotacao({
  texto,
  tamanho = "grande",
  rotulos = true,
  nomes: nomesFora,
}: {
  texto: string;
  tamanho?: "grande" | "media" | "pequena";
  rotulos?: boolean;
  /** Quando vem de fora, a linha não tem botão próprio. */
  nomes?: boolean;
}) {
  const tokens = lerExpressao(texto);
  const ps = papeis(tokens);
  const [nomesProprio, setNomes] = useState(false);
  const nomes = nomesFora ?? nomesProprio;
  const temNomes = rotulos && nomesFora === undefined && (ps.some((p) => p !== null) || tokens.some((t) => t.t === "num" && t.forma !== "inteiro"));
  const classe = tamanho === "grande" ? "text-[30px]" : tamanho === "media" ? "text-[23px]" : "text-[18px]";
  return (
    <div className="flex flex-col items-start gap-1.5">
      <p className="so-leitor">{expressaoPorExtenso(tokens)}</p>
      <p aria-hidden="true" className={`m-0 flex flex-wrap items-start gap-x-[0.32em] font-extrabold text-tinta ${classe}`} data-notacao={texto}>
        {tokens.map((tk, i) => (
          <Termo key={i} tk={tk} papel={ps[i]} nomes={nomes} />
        ))}
      </p>
      {temNomes && (
        <button type="button" className="botao-discreto -ml-3" onClick={() => setNomes((v) => !v)} aria-pressed={nomes}>
          {nomes ? "Esconder os nomes" : "Ver os nomes"}
        </button>
      )}
    </div>
  );
}

function ComNome({ nome, mostrar, children }: { nome: string | null; mostrar: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center">
      <span>{children}</span>
      {mostrar && nome && <span className="mt-1 text-[13px] font-semibold leading-none text-caneta">{nome}</span>}
    </span>
  );
}

function Termo({ tk, papel, nomes }: { tk: Token; papel: Papel | null; nomes: boolean }) {
  const linhaBase = "leading-[1.15]";
  if (tk.t === "op") return <span className={`${linhaBase} text-caneta`}>{tk.op}</span>;
  if (tk.t === "virgula") return <span className={`${linhaBase} -ml-[0.3em]`}>,</span>;
  if (tk.t === "palavra") return <span className={`${linhaBase} self-center text-[0.62em] font-semibold text-tinta-suave`}>{tk.texto}</span>;
  const nome = papel ? CURTO[papel] : null;
  if (tk.forma === "inteiro") {
    return (
      <ComNome nome={nome} mostrar={nomes}>
        <span className={linhaBase}>{tk.inteiro}</span>
      </ComNome>
    );
  }
  const fracao = (
    <span className="fracao">
      <span>
        {tk.n}
        {nomes && <span className="ml-1 align-middle text-[13px] font-semibold text-caneta">numerador</span>}
      </span>
      <span>
        {tk.d}
        {nomes && <span className="ml-1 align-middle text-[13px] font-semibold text-caneta">denominador</span>}
      </span>
    </span>
  );
  return (
    <ComNome nome={nome} mostrar={nomes}>
      <span className="inline-flex items-center">
        {tk.forma === "misto" && <span className="mr-[0.08em]">{tk.inteiro}</span>}
        {fracao}
      </span>
    </ComNome>
  );
}
