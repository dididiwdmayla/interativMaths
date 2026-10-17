/**
 * A conta passada a caneta do soroban (referência 4 de v05.html): só no fim da operação. A
 * operação com o nome dos termos (parcela, parcela, soma; minuendo, subtraendo, diferença), o
 * resultado em marca-texto e, embaixo, um lance por linha com o caminho curto e a etiqueta da
 * técnica; "com vai e volta" em tinta suave onde houve. Na leitura, o algarismo de cada haste;
 * no ditado, a sequência inteira. Quem calcula é o núcleo.
 */
import type { ContaDoItem } from "@/nucleo/soroban/textos";
import { preencher } from "@/nucleo/soroban/textos";
import { CONTA_SOROBAN, ROTULOS_MARCA } from "@/conteudo/lapidacao";
import { IconeCaneta } from "@/componentes/icones/IconeCaneta";

function textoDoAlgarismo(d: number): string {
  if (d < 5) return preencher(CONTA_SOROBAN.deBaixo, { d });
  if (d === 5) return CONTA_SOROBAN.deCima;
  return preencher(CONTA_SOROBAN.cincoMais, { resto: d - 5 });
}

export function ContaSoroban({ conta }: { conta: ContaDoItem }) {
  const ultimo = conta.termos.length - 1;
  // O nome de cada número, na ordem em que aparecem.
  const indiceDoNumero = conta.termos.map((t, i) => conta.termos.slice(0, i).filter((x) => typeof x === "number").length);
  return (
    <section className="conta-caneta" data-conta={conta.expressao} data-tipo-conta={conta.tipo} aria-label={`A conta: ${conta.expressao}`}>
      <p className="conta-rotulo m-0">
        <IconeCaneta />
        {CONTA_SOROBAN.rotulo}
      </p>
      <div className="conta-linha" aria-hidden="true">
        {conta.termos.map((t, i) => {
          if (typeof t === "string") {
            return (
              <span key={i} className="conta-coluna">
                <span className="conta-op">{t}</span>
                <span className="conta-nome" />
              </span>
            );
          }
          const nome = conta.nomes[indiceDoNumero[i]] ?? null;
          return (
            <span key={i} className="conta-coluna">
              <span className={`conta-num ${i === ultimo ? "conta-resultado" : ""}`}>{t}</span>
              {conta.tipo !== "ditado" && <span className="conta-nome">{nome}</span>}
            </span>
          );
        })}
      </div>
      {(conta.linhas.length > 0 || conta.hastes.length > 0) && <div className="conta-separador" aria-hidden="true" />}
      {conta.linhas.map((l, i) => (
        <p key={i} className="conta-lance m-0" data-lance-conta={i} data-tecnicas={l.marcas.join(" ")}>
          <strong>{l.haste}</strong>
          <span className="algarismos">
            {l.lance}
            {l.decomposicao && (
              <>
                {" = "}
                <span className="text-caneta">{l.decomposicao}</span>
              </>
            )}
          </span>
          {l.marcas.length === 1 && l.marcas[0] === "direto" ? (
            <span className="text-tinta-suave">{CONTA_SOROBAN.direto}</span>
          ) : (
            <span className="ml-auto flex flex-wrap justify-end gap-1">
              {l.marcas.map((m) => (
                <span key={m} className="selo-caneta">
                  {ROTULOS_MARCA[m]}
                </span>
              ))}
            </span>
          )}
          {(l.vaiEVolta || l.comAjuda || l.cadeia) && (
            <span className="w-full text-[12.5px] font-semibold text-tinta-suave">
              {[l.cadeia ? CONTA_SOROBAN.cadeia : null, l.comAjuda ? CONTA_SOROBAN.comAjuda : l.vaiEVolta ? CONTA_SOROBAN.vaiEVolta : null].filter(Boolean).join(" · ")}
            </span>
          )}
        </p>
      ))}
      {conta.hastes.map((h, i) => (
        <p key={i} className="conta-lance m-0">
          <strong>{h.haste}</strong>
          <span className="algarismos">{h.algarismo}</span>
          <span className="text-tinta-suave">{h.algarismo === 0 ? "" : textoDoAlgarismo(h.algarismo)}</span>
        </p>
      ))}
    </section>
  );
}
