/**
 * A conta passada a caneta (referência 3 de v04.html): no acerto, a conta do que a máquina fez,
 * num cartão branco com contorno e sombra dura. Números em Rubik 800, sinais em caneta, o
 * resultado com marca-texto, o nome de cada termo embaixo. Quem calcula é o núcleo, do estado
 * final da máquina; a tela só desenha. O leitor de tela ouve a conta por extenso.
 */
import type { Conta } from "@/nucleo/missoes/conta";
import { lerExpressao, type Token } from "@/nucleo/racional/notacao";
import { MODELOS_CONTA, ROTULOS_CONTA } from "@/conteudo/conta";
import { IconeCaneta } from "@/componentes/icones/IconeCaneta";
import { Fracao } from "@/componentes/notacao/Numero";
import { ContaArmada } from "./ContaArmada";

/** Um número da linha, do jeito que foi escrito: inteiro, fração empilhada ou misto. */
function NumeroConta({ tk }: { tk: Extract<Token, { t: "num" }> }) {
  if (tk.forma === "inteiro") return <span>{tk.inteiro}</span>;
  if (tk.forma === "fracao") return <Fracao n={tk.n ?? 0} d={tk.d ?? 1} />;
  return (
    <span className="conta-misto">
      <span>{tk.inteiro}</span>
      <Fracao n={tk.n ?? 0} d={tk.d ?? 1} />
    </span>
  );
}

export function ContaPassada({ conta }: { conta: Conta }) {
  if (conta.chave) return <ContaArmada conta={conta} chave={conta.chave} />;
  const tokens = lerExpressao(conta.expressao);
  // O resultado é o primeiro número depois do "=": ganha o marca-texto.
  const igual = tokens.findIndex((t) => t.t === "op" && t.op === "=");
  const resultado = tokens.findIndex((t, i) => i > igual && t.t === "num");
  // O nome de cada número, na ordem em que aparecem na linha.
  const ordem = tokens.map((t, i) => (t.t === "num" ? i : -1)).filter((i) => i >= 0);
  const nomeDe = (i: number) => conta.nomes[ordem.indexOf(i)] ?? null;
  const n = MODELOS_CONTA.nomes;
  return (
    <section className="conta-caneta" data-conta={conta.expressao} data-tipo-conta={conta.tipo} aria-label={`A conta: ${conta.extenso}`}>
      <p className="conta-rotulo m-0">
        <IconeCaneta />
        {ROTULOS_CONTA.caneta}
      </p>
      <div className="conta-linha" aria-hidden="true">
        {tokens.map((tk, i) => {
          if (tk.t === "op") {
            return (
              <span key={i} className="conta-coluna">
                <span className="conta-op">{tk.op}</span>
                <span className="conta-nome" />
              </span>
            );
          }
          if (tk.t === "virgula") return <span key={i} className="conta-virgula">,</span>;
          if (tk.t === "palavra") {
            return (
              <span key={i} className="conta-coluna">
                <span className="conta-palavra">{tk.texto}</span>
                <span className="conta-nome" />
              </span>
            );
          }
          const nome = nomeDe(i);
          return (
            <span key={i} className="conta-coluna">
              <span className={`conta-num ${i === resultado ? "conta-resultado" : ""}`}>
                <NumeroConta tk={tk} />
              </span>
              <span className="conta-nome">{nome}</span>
            </span>
          );
        })}
        {conta.equivalente && (
          <span className="conta-coluna">
            <span className="conta-ou">{conta.equivalente}</span>
            <span className="conta-nome" />
          </span>
        )}
      </div>
      {conta.fracao && (
        <p className="conta-nota m-0" data-termos-fracao="">
          <strong>{conta.fracao.numerador}</strong> {n.numerador} · <strong>{conta.fracao.denominador}</strong> {n.denominador}
        </p>
      )}
      {conta.leitura && <p className="conta-nota m-0">{conta.leitura}</p>}
      {conta.forma && <p className="conta-forma m-0">{conta.forma}</p>}
      {conta.frase && <p className="conta-nota m-0" data-frase-conta="">{conta.frase}</p>}
      {conta.prova && <p className="conta-nota m-0">{conta.prova}</p>}
    </section>
  );
}
