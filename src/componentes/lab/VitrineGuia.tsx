"use client";

/**
 * A parte da vitrine que é da v0.3: a faixa do Nônio em todos os estados, os selos, a faixa do
 * objetivo, o bilhete da aposta, o menu de corte e as folhas (etapas, conversa, apresentação).
 * Tudo com dados de exemplo, sem missão aberta.
 */
import { useState, type ReactNode } from "react";
import { MISSAO_4 } from "@/conteudo/missoes/m4-pao-nao-e-saca";
import { PERGUNTAS_PADRAO } from "@/conteudo/tutor";
import { MenuCorte } from "@/componentes/maquinas/MenuCorte";
import { FaixaNonio } from "@/componentes/nonio/FaixaNonio";
import { ConversaNonio } from "@/componentes/nonio/ConversaNonio";
import { Apresentacao } from "@/componentes/nonio/Apresentacao";
import type { MensagemTela } from "@/componentes/nonio/useConversa";
import { Bilhete } from "@/componentes/missao/Aposta";
import { FolhaEtapas } from "@/componentes/missao/Etapas";
import { Objetivo } from "@/componentes/missao/Objetivo";
import { Selo } from "@/componentes/missao/Selo";

const nada = () => undefined;

const CONVERSA_EXEMPLO: MensagemTela[] = [
  { id: 1, autor: "jogador", texto: "Por que não dá para dar as 5 broas direto para as 4 mesas?" },
  { id: 2, autor: "nonio", texto: "Dá, até onde cabe: uma para cada. A quinta não fecha uma volta inteira.", expressao: "atento", alvo: "esteira" },
  { id: 3, autor: "jogador", texto: "cortar?" },
  { id: 4, autor: "nonio", texto: "Isso. Em quantas partes, para as quatro mesas ficarem iguais? Teste na máquina.", expressao: "medindo", alvo: "fatiador" },
];

function Caso({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="m-0 text-[13px] font-semibold text-tinta-suave">{rotulo}</p>
      {children}
    </div>
  );
}

export function VitrineGuia({ Secao }: { Secao: (p: { titulo: string; children: ReactNode }) => ReactNode }) {
  const [folha, setFolha] = useState<"etapas" | "conversa" | "apresentacao" | null>(null);
  return (
    <>
      <Secao titulo="Faixa do Nônio">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-vitrine="faixa">
          <Caso rotulo="Neutra: lê a máquina">
            <FaixaNonio
              fala={{ id: "v-neutra", texto: "Cinco broas, quatro mesas. A quinta não cabe numa volta de inteiras.", categoria: "passo" }}
              selo={null}
              retorno="neutro"
              expressao="atento"
              ajuda={{ rotulo: "Me ajuda", onPedir: nada, oferta: false }}
              onPerguntar={nada}
            />
          </Caso>
          <Caso rotulo="Acertou: verde, com o que ficou certo">
            <FaixaNonio
              fala={{ id: "v-acertou", texto: "Uma broa e um quarto em cada mesa, e nada sobrou.", categoria: "retorno" }}
              selo="acertou"
              retorno="acertou"
              expressao="satisfeito"
            />
          </Caso>
          <Caso rotulo="Ainda não: passageiro, com o porquê e o que tentar">
            <FaixaNonio
              fala={{ id: "v-ainda", texto: "Assim cada mesa ganharia mais de uma broa, e só há duas para três. Quem vai em cima?", categoria: "retorno" }}
              selo="ainda-nao"
              retorno="ainda-nao"
              expressao="medindo"
              ajuda={{ rotulo: "Me ajuda", onPedir: nada, oferta: false }}
            />
          </Caso>
          <Caso rotulo="Pedindo ajuda: a oferta acende a bolinha">
            <FaixaNonio
              fala={{ id: "v-oferta", texto: "Quer uma medida? Eu aponto onde olhar.", categoria: "oferta" }}
              selo={null}
              retorno="neutro"
              expressao="atento"
              ajuda={{ rotulo: "Mais ajuda", onPedir: nada, oferta: true }}
              apontando
            />
          </Caso>
          <Caso rotulo="Aposta: o bilhete e a faixa">
            <div className="flex flex-col gap-3">
              <Bilhete texto="Aposto que 2/8 é mais que 1/4. Afinal, dois é mais que um." />
              <FaixaNonio fala={{ id: "v-aposta", texto: "Fiz uma aposta. Mostre na máquina se eu tenho razão.", categoria: "passo" }} selo={null} retorno="neutro" expressao="atento" />
            </div>
          </Caso>
          <Caso rotulo="Compacta, sobre a folha que sobe">
            <FaixaNonio fala={{ id: "v-compacta", texto: "Toque numa cota e depois numa lacuna.", categoria: "passo" }} selo={null} retorno="neutro" expressao="neutro" compacta />
          </Caso>
        </div>
      </Secao>

      <Secao titulo="Selos e objetivo">
        <div className="flex flex-wrap items-center gap-3">
          <Selo tipo="acertou" />
          <Selo tipo="ainda-nao" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border-2 border-contorno bg-folha" data-vitrine="objetivo">
          <Objetivo etiqueta="Objetivo" instrucao="Reparta as 5 broas entre as 4 mesas, sem sobrar nada." gesto={{ texto: "Agora: ponha uma broa em cada mesa, ou use Repartir.", tom: "gesto" }} />
          <Objetivo etiqueta="Pergunta" instrucao="Monte com as fichas o pedaço que cada mesa recebe: 2 broas, 3 mesas." gesto={{ texto: "Agora: troque as fichas e confira de novo.", tom: "tentar" }} />
          <Objetivo etiqueta="Aposta do Nônio" instrucao="Mostre na máquina se ele tem razão." gesto={null} />
          <Objetivo etiqueta="Desafio" instrucao="Feche numa volta só: um lote que esvazie a esteira de uma vez." gesto={null} />
          <Objetivo etiqueta="Feito" instrucao="Reparta as 5 broas entre as 4 mesas, sem sobrar nada." gesto={{ texto: "Uma broa e um quarto em cada mesa.", tom: "resumo" }} />
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="opcao caixa-ainda-nao px-4" data-ainda-nao="">
            Mesa A
          </span>
          <span className="opcao px-4">Empate</span>
        </div>
      </Secao>

      <Secao titulo="Menu de corte e folhas">
        <div className="relative h-[150px] rounded-xl border-2 border-dashed border-grafite bg-folha" data-vitrine="menu-corte">
          <MenuCorte posicao={{ left: 16, top: 16, lado: "esquerda" }} partes={[2, 3, 4, 6, 8]} quantidade={3} nomePeca="broa" onCortar={nada} onFechar={nada} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="botao-secundario" onClick={() => setFolha("etapas")} data-acao="vitrine-etapas">
            Abrir a folha de etapas
          </button>
          <button type="button" className="botao-secundario" onClick={() => setFolha("conversa")} data-acao="vitrine-conversa">
            Abrir a conversa
          </button>
          <button type="button" className="botao-secundario" onClick={() => setFolha("apresentacao")} data-acao="vitrine-apresentacao">
            Ver uma apresentação
          </button>
        </div>
      </Secao>

      {folha === "etapas" && <FolhaEtapas passos={MISSAO_4.passos} atual={3} onFechar={() => setFolha(null)} />}
      {folha === "conversa" && (
        <ConversaNonio
          mensagens={CONVERSA_EXEMPLO}
          esperando={false}
          sugestoes={PERGUNTAS_PADRAO.operar}
          fechada={false}
          aviso={false}
          onEntendi={nada}
          onEnviar={nada}
          onFechar={() => setFolha(null)}
        />
      )}
      {folha === "apresentacao" && <Apresentacao id="faixa" onEntendi={() => setFolha(null)} />}
    </>
  );
}
