"use client";

/**
 * A parte da vitrine que chegou na v0.4: o rascunho a lápis, a conta passada a caneta (em linha e
 * armada), uma página do Manual (inteira e rasgada) e, num bloco com a luz apagada, as mesmas
 * peças e o Nônio flutuante no escuro. Números de exemplo, montados pelo núcleo.
 */
import { useState, type ReactNode } from "react";
import { PELES } from "@/conteudo/peles";
import { MODELOS_RASCUNHO } from "@/conteudo/rascunho";
import { MODELOS_CONTA } from "@/conteudo/conta";
import { PERGUNTAS_PADRAO } from "@/conteudo/tutor";
import { criarBancada, operarVarias } from "@/nucleo/maquinas/bancada/bancada";
import { rascunhoDaBancada } from "@/nucleo/maquinas/bancada/rascunho";
import { contaArmada, type Conta } from "@/nucleo/missoes/conta";
import { racional } from "@/nucleo/racional/racional";
import { progressoNovo } from "@/nucleo/progresso/tipos";
import { BolhaNonio } from "@/componentes/nonio/BolhaNonio";
import { RecadoNonio } from "@/componentes/nonio/RecadoNonio";
import { JanelaNonio } from "@/componentes/nonio/JanelaNonio";
import { Rascunho } from "@/componentes/missao/Rascunho";
import { ContaPassada } from "@/componentes/missao/ContaPassada";
import { Objetivo } from "@/componentes/missao/Objetivo";
import { CorpoPagina } from "@/componentes/manual/PaginaManual";
import { paginaDoConceito } from "@/componentes/manual/dados";

const nada = () => undefined;

const RASCUNHO = rascunhoDaBancada(
  operarVarias(criarBancada({ pele: "sacas-carrocas", pecas: { quantidade: 26 }, bicas: { quantidade: 4, ajustavel: false } }), [
    { tipo: "lote", valor: 5 },
    { tipo: "repartir" },
    { tipo: "lote", valor: 1 },
    { tipo: "repartir" },
  ]),
  PELES["sacas-carrocas"],
  MODELOS_RASCUNHO,
);

const BASE: Omit<Conta, "tipo" | "expressao" | "dividendo" | "divisor" | "quociente" | "nomes" | "extenso"> = {
  resto: null,
  equivalente: null,
  fracao: null,
  prova: null,
  forma: null,
  leitura: null,
  frase: null,
  chave: null,
  produto: null,
};

const PARTILHA: Conta = {
  ...BASE,
  tipo: "partilha",
  expressao: "24 ÷ 4 = 6",
  dividendo: racional(24),
  divisor: racional(4),
  quociente: racional(6),
  nomes: ["dividendo", "divisor", "quociente"],
  prova: "Confere: 4 × 6 = 24",
  extenso: "24 dividido por 4 é igual a 6",
};

const FRACAO: Conta = {
  ...BASE,
  tipo: "fracao",
  expressao: "5 ÷ 4 = 1 1/4",
  dividendo: racional(5),
  divisor: racional(4),
  quociente: racional(5, 4),
  nomes: ["dividendo", "divisor", "quociente"],
  equivalente: "ou 5/4",
  prova: "Confere: 4 × 1 1/4 = 4 + 1 = 5",
  extenso: "5 dividido por 4 é igual a 1 inteiro e 1 quarto",
};

const ARMADA: Conta = {
  ...BASE,
  tipo: "resto",
  expressao: "26 ÷ 4 = 6, resto 2",
  dividendo: racional(26),
  divisor: racional(4),
  quociente: racional(6),
  resto: racional(2),
  nomes: ["dividendo", "divisor", "quociente", "resto"],
  chave: contaArmada(26, 4, [5, 1], MODELOS_CONTA, "carroça"),
  extenso: "26 dividido por 4 é igual a 6, resto 2",
};

function Caso({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="m-0 text-[13px] font-semibold text-tinta-suave">{rotulo}</p>
      {children}
    </div>
  );
}

function RascunhoEContas() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-vitrine="contas">
      <Caso rotulo="O rascunho a lápis: uma linha por volta, a última no visor">
        <Rascunho linhas={RASCUNHO} />
      </Caso>
      <Caso rotulo="A conta passada a caneta, no acerto">
        <ContaPassada conta={PARTILHA} />
      </Caso>
      <Caso rotulo="Com número misto e o nome dos termos da fração">
        <ContaPassada conta={FRACAO} />
      </Caso>
      <Caso rotulo="A conta armada, feita das voltas do jogador">
        <ContaPassada conta={ARMADA} />
      </Caso>
    </div>
  );
}

function PaginasManual() {
  const resto = paginaDoConceito("div.resto");
  const divisao = paginaDoConceito("fra.quociente");
  if (!resto || !divisao) return null;
  const progresso = progressoNovo(0);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-vitrine="manual">
      <Caso rotulo="Restaurada: papel impresso, sem pauta e sem letra de mão">
        <CorpoPagina pagina={resto} restaurada progresso={progresso} />
      </Caso>
      <Caso rotulo="Rasgada: só os nomes, até a descoberta">
        <CorpoPagina pagina={divisao} restaurada={false} progresso={progresso} />
      </Caso>
    </div>
  );
}

export function VitrineV04({ Secao }: { Secao: (p: { titulo: string; children: ReactNode }) => ReactNode }) {
  const [janela, setJanela] = useState(false);
  return (
    <>
      <Secao titulo="Rascunho e conta">
        <RascunhoEContas />
      </Secao>

      <Secao titulo="Uma página do Manual">
        <PaginasManual />
      </Secao>

      <Secao titulo="No escuro">
        <p className="m-0 text-[14px] font-medium text-tinta-suave">O mesmo caderno com a luz apagada: papel e tinta invertem, objetos não.</p>
        <div data-tema="escuro" className="flex flex-col gap-4 rounded-2xl border-2 border-contorno bg-papel p-4 text-tinta" data-vitrine="escuro">
          <div className="flex flex-wrap items-center gap-4">
            <BolhaNonio expressao="atento" novidade={false} onAbrir={nada} />
            <BolhaNonio expressao="neutro" novidade onAbrir={nada} />
            <BolhaNonio expressao="satisfeito" novidade={false} onAbrir={nada} />
            <div className="nonio-canto nonio-canto-vitrine">
              <RecadoNonio texto="Fechou, sem sobra." selo="acertou" onTocar={nada} />
              <BolhaNonio expressao="satisfeito" novidade={false} onAbrir={nada} />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border-2 border-contorno bg-folha">
            <Objetivo etiqueta="Objetivo" instrucao="Reparta as 5 broas entre as 4 mesas, sem sobrar nada." gesto={{ texto: "Agora: toque na broa que sobrou e escolha em quantas partes cortar.", tom: "gesto" }} />
          </div>
          <RascunhoEContas />
          <PaginasManual />
          <button type="button" className="botao-secundario self-start" onClick={() => setJanela(true)} data-acao="vitrine-janela-escuro">
            Abrir a janelinha no escuro
          </button>
        </div>
      </Secao>

      {/* Fora da seção: a janelinha é fixa na tela, e o envoltório só traz a luz apagada. */}
      <div data-tema="escuro">
        {janela && (
          <JanelaNonio
            fala={{ id: "v-janela-escuro", texto: "Sobrou uma broa. Pão a gente corta: em quantas partes, para as quatro mesas ficarem iguais?" }}
            selo={null}
            expressao="atento"
            apontando="Apontando a broa na esteira"
            antes={[{ id: "v-antes-escuro", texto: "Pão não é saca: o que sobra dá para cortar." }]}
            ajuda={{ rotulo: "Me ajuda", onPedir: nada, nivel: 1, oferta: false }}
            caso={null}
            conversa={{ mensagens: [], esperando: false, sugestoes: PERGUNTAS_PADRAO.operar, fechada: false, aviso: false, onEntendi: nada, onEnviar: nada }}
            onFechar={() => setJanela(false)}
          />
        )}
      </div>
    </>
  );
}
