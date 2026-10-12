"use client";

/**
 * A degustação: a ilhota de cinco a dez minutos para quem nunca viu o jogo. Funciona aberta
 * sozinha (/degustacao) e embutida num iframe da recepção do interativAI. Embutida (dentro de um
 * iframe ou com ?embed=1), some o voltar: fica só a ilhota. Roda numa loja de progresso à parte,
 * então não lê nem muda o progresso do jogo.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { DEGUSTACAO } from "@/conteudo/degustacao";
import { criarLojaIsolada } from "@/componentes/estado/lojaIsolada";
import { ContextoProgresso } from "@/componentes/estado/useProgresso";
import { ExecutorAtividade } from "@/componentes/missao/Executor";
import { Carregando } from "@/componentes/ui/Carregando";
import { FimDegustacao } from "./FimDegustacao";
import { avisarRecepcao, estaEmbutida, origemDaMae, origemPermitida } from "./recepcao";

/** A chave da loja à parte, longe da do jogo (interativmaths:progresso). */
const CHAVE_DEGUSTACAO = "interativmaths:degustacao";

interface Moldura {
  /** Esconde a navegação do app. */
  embutida: boolean;
  /** Há uma recepção permitida para ouvir as mensagens. */
  recepcao: boolean;
}

const nada = () => () => {};
const NO_SERVIDOR = null;
let moldura: Moldura | null = null;

/** Lida uma vez no navegador (a moldura não muda enquanto a página vive). */
function lerMoldura(): Moldura {
  if (moldura === null) {
    const mae = origemDaMae(window);
    moldura = { embutida: estaEmbutida(window), recepcao: mae !== null && origemPermitida(mae, window.location.origin) };
  }
  return moldura;
}

export function Degustacao() {
  const [loja] = useState(() => criarLojaIsolada(CHAVE_DEGUSTACAO));
  const [rodada, setRodada] = useState(0);
  const m = useSyncExternalStore(nada, lerMoldura, () => NO_SERVIDOR);

  // Carregou: a recepção tira o "carregando" dela.
  useEffect(() => {
    if (m) avisarRecepcao("pronto");
  }, [m]);

  if (!m) return <Carregando />;
  return (
    <ContextoProgresso.Provider value={loja}>
      <div data-degustacao="" data-embutida={m.embutida ? "sim" : "nao"} data-recepcao={m.recepcao ? "sim" : "nao"} className="contents">
        <ExecutorAtividade
          key={rodada}
          a={DEGUSTACAO}
          voltar={m.embutida ? null : { href: "/", rotulo: "o Engenho" }}
          aoTerminar={() => <FimDegustacao recepcao={m.recepcao} onDeNovo={() => setRodada((r) => r + 1)} />}
        />
      </div>
    </ContextoProgresso.Provider>
  );
}
