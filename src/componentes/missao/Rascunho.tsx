/**
 * O rascunho a lápis: o que cada gesto na máquina significou em conta, linha por linha, a mais
 * nova embaixo. Rubik 13 px em tinta suave, sublinhado tracejado a lápis (números precisam ser
 * lidos com precisão: nada de letra de mão). No celular, as duas últimas linhas; no computador,
 * todas. Não é interativo; o leitor de tela lê como lista. A última linha é a leitura da máquina
 * (data-visor).
 */
import type { LinhaRascunho } from "@/nucleo/maquinas/bancada/rascunho";
import { ROTULO_RASCUNHO } from "@/conteudo/rascunho";
import { IconeLapis } from "@/componentes/icones/IconeLapis";

export function Rascunho({ linhas }: { linhas: readonly LinhaRascunho[] }) {
  if (linhas.length === 0) return null;
  return (
    <div className="rascunho" data-rascunho={linhas.length}>
      <span className="rascunho-lapis" aria-hidden="true">
        <IconeLapis />
      </span>
      <ol className="rascunho-lista" aria-label={ROTULO_RASCUNHO}>
        {linhas.map((l, i) => (
          <li key={`${i}:${l.texto}`} className="rascunho-linha" data-tipo={l.tipo} data-visor={i === linhas.length - 1 ? "" : undefined}>
            <span>{l.texto}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
