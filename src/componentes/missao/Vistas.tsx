"use client";

/**
 * Painéis de cada tipo de passo (a bancada de baixo, na zona do polegar)
 * e a folha pautada da formalização, que sobe por cima da folha quadriculada.
 */
import type { ReactNode } from "react";
import { comoRacional, igual } from "@/nucleo/racional/racional";
import type { Execucao } from "@/nucleo/missoes/motor";
import { preencher, valoresDasFichas } from "@/nucleo/missoes/motor";
import type { PassoFrase, PassoNotacao, PassoPalpite, PassoPrever, PassoRegistro } from "@/nucleo/missoes/tipos";
import { Numero } from "@/componentes/notacao/Numero";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { Compressao } from "@/componentes/notacao/Compressao";
import { Falas } from "./Falas";
import { FolhaPautada, NotaDalia } from "./Papel";
import { IconeEstrela } from "@/componentes/icones/IconeEstrela";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { EntradaResposta, type MarcaResposta } from "./Respostas";

export function Seguir({ rotulo = "Seguir", onClick, destaque = true }: { rotulo?: string; onClick: () => void; destaque?: boolean }) {
  return (
    <button type="button" className={`${destaque ? "botao-principal" : "botao-secundario"} w-full`} onClick={onClick} data-acao="seguir">
      {rotulo}
    </button>
  );
}

export function PainelPalpite({ passo, onResponder }: { passo: PassoPalpite; onResponder: (v: string | null) => void }) {
  const dalia = passo.falas?.filter((f) => f.quem === "dalia") ?? [];
  return (
    <div className="flex flex-col gap-3" data-painel="palpite">
      {dalia.length > 0 && <Falas falas={dalia} compacta />}
      <p className="m-0 text-[17px] font-bold leading-snug">{passo.pergunta}</p>
      <EntradaResposta tipo={passo.resposta} onResponder={onResponder} rotuloConferir="Ligar a máquina" rotuloNaoSei="Não faço ideia" />
    </div>
  );
}

export function PainelPrever({
  passo,
  exec,
  demonstrando,
  onResponder,
  onSeguir,
  marca,
  rascunho,
  conta,
}: {
  passo: PassoPrever;
  exec: Execucao;
  demonstrando: boolean;
  onResponder: (v: string | null) => void;
  onSeguir: () => void;
  marca?: MarcaResposta;
  /** O rascunho a lápis da máquina (o que a demonstração fez). */
  rascunho?: ReactNode;
  /** A conta passada a caneta, quando a previsão bateu. */
  conta?: ReactNode;
}) {
  const conferindo = exec.passo.situacao === "conferindo";
  const resposta = exec.passo.resposta;
  const opcao = passo.resposta.tipo === "opcoes" ? passo.resposta.opcoes : null;
  const textoResposta = (v: string) => (opcao ? (opcao.find((o) => o.id === v)?.texto ?? v) : null);
  const dalia = passo.falas?.filter((f) => f.quem === "dalia") ?? [];
  return (
    <div className="flex flex-col gap-3" data-painel="prever" data-situacao={exec.passo.situacao}>
      {conferindo && !demonstrando && rascunho}
      {dalia.length > 0 && !conferindo && exec.passo.respostas === 0 && <Falas falas={dalia} compacta />}
      <p className="m-0 text-[17px] font-bold leading-snug">{passo.pergunta}</p>
      {!conferindo && <EntradaResposta tipo={passo.resposta} onResponder={onResponder} rotuloConferir={exec.passo.respostas > 0 ? "Conferir de novo" : "Conferir"} marca={marca} />}
      {conferindo && (
        <div className="flex flex-col gap-3" role="status" aria-live="polite">
          {demonstrando ? (
            <p className="m-0 font-semibold text-tinta-suave">A máquina está conferindo...</p>
          ) : (
            <>
              <p className="m-0 flex flex-wrap items-center gap-x-2 text-[16px] font-medium" data-resultado-previsao={exec.passo.respostaCerta ? "certa" : resposta === null ? "nao-sei" : "outra"}>
                {resposta === null || resposta === undefined ? (
                  <span>Você disse: não sei ainda. Vale.</span>
                ) : (
                  <span>
                    Você disse:{" "}
                    <strong className="font-extrabold text-caneta">{opcao ? textoResposta(resposta) : <Numero valor={comoRacional(resposta)} />}</strong>
                    {exec.passo.respostaCerta ? ". A máquina deu o mesmo." : ". A máquina mostra o que dá."}
                  </span>
                )}
              </p>
              {conta}
              <Seguir rotulo="Continuar" onClick={onSeguir} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * O passo vencido (referência 3): o rascunho a lápis em cima, a conta passada a caneta embaixo,
 * e então Continuar e o desafio. A fala da Dália sobre o acerto mora acima da máquina.
 */
export function PainelVencido({
  rascunho,
  conta,
  palpite,
  convite,
  onConvite,
  onSeguir,
  extra,
}: {
  rascunho?: ReactNode;
  conta?: ReactNode;
  palpite?: { valor: string | null; certo: string } | null;
  convite?: string | null;
  onConvite?: (aceitar: boolean) => void;
  onSeguir: () => void;
  extra?: ReactNode;
}) {
  const mosca = palpite && palpite.valor !== null && mesmoValor(palpite.valor, palpite.certo);
  return (
    <div className="flex flex-col gap-2.5" data-painel="vencido">
      {rascunho}
      {conta}
      {palpite && (
        <p className="m-0 flex flex-wrap items-center gap-2 text-[15px] font-medium" data-palpite={mosca ? "na-mosca" : "outro"}>
          {mosca ? (
            <>
              <span className="selo" data-selo="acertou">
                <IconeVisto />
                Na mosca.
              </span>
              <span>
                Seu palpite: <strong className="font-extrabold text-caneta">{palpite.valor}</strong>
              </span>
            </>
          ) : (
            <span>
              Seu palpite: <strong className="font-extrabold text-caneta">{palpite.valor ?? "nenhum"}</strong> · A máquina: <span className="grifo font-extrabold">{palpite.certo}</span>
            </span>
          )}
        </p>
      )}
      {extra}
      <div className="flex items-stretch gap-2.5">
        <button type="button" className="botao-principal min-w-0 flex-1" onClick={onSeguir} data-acao="seguir">
          Continuar
        </button>
        {convite && onConvite && (
          <button type="button" className="botao-secundario shrink-0" onClick={() => onConvite(true)} aria-label={`Desafio: ${convite}`} data-acao="aceitar-convite">
            <IconeEstrela />
            Desafio
          </button>
        )}
      </div>
    </div>
  );
}

function mesmoValor(a: string, b: string): boolean {
  try {
    return igual(comoRacional(a), comoRacional(b));
  } catch {
    return a === b;
  }
}

/* ---------- Formalização: a folha pautada ---------- */

/** A folha sobe da borda de baixo: cantos de cima redondos (no computador, todos). */
const CANTOS = "rounded-t-[18px] lg:rounded-b-[18px]";

export function FolhaFrase({
  passo,
  exec,
  escolhida,
  onEscolher,
  onColocar,
  onConferir,
  onSeguir,
}: {
  passo: PassoFrase;
  exec: Execucao;
  escolhida: string | null;
  onEscolher: (valor: string | null) => void;
  onColocar: (lacuna: string) => void;
  onConferir: () => void;
  onSeguir: () => void;
}) {
  const fichas = exec.bancada ? valoresDasFichas(passo, exec.bancada.atual) : [];
  const vencido = exec.passo.situacao === "vencido";
  const partes = passo.frase.split(/(\{\w+\})/);
  const completas = passo.lacunas.every((l) => exec.passo.lacunas[l.id] !== undefined);
  return (
    <FolhaPautada titulo="Caderno" className={CANTOS}>
      <div className="flex flex-col gap-[14px] pt-[14px]" data-folha="frase">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Cotas da máquina">
          {fichas.map((f) => (
            <button
              key={`${f.medida}:${f.valor}`}
              type="button"
              className="opcao ficha-cota min-w-[52px] text-[19px] font-extrabold"
              aria-pressed={escolhida === f.valor}
              onClick={() => onEscolher(escolhida === f.valor ? null : f.valor)}
              disabled={vencido}
              data-cota={f.valor}
            >
              <Numero valor={comoRacional(f.valor)} pequena />
            </button>
          ))}
        </div>
        <p className="m-0 text-[19px] font-semibold leading-[56px] text-tinta">
          {partes.map((p, i) => {
            const m = /^\{(\w+)\}$/.exec(p);
            if (!m) return <span key={i}>{p}</span>;
            const id = m[1];
            const valor = exec.passo.lacunas[id];
            const naoBate = exec.passo.retorno === "ainda-nao" && exec.passo.lacunasErradas.includes(id) && valor !== undefined;
            const pendente = valor === undefined;
            return (
              <button
                key={i}
                type="button"
                className={`lacuna mx-0.5 align-middle ${pendente ? "" : "lacuna-preenchida"} ${naoBate ? "caixa-ainda-nao" : ""}`}
                data-ainda-nao={naoBate ? "" : undefined}
                onClick={() => onColocar(id)}
                disabled={vencido}
                aria-label={`Lacuna: ${valor ?? "vazia"}`}
                data-lacuna={id}
              >
                {valor ? <Numero valor={comoRacional(valor)} pequena /> : " "}
              </button>
            );
          })}
        </p>
        {vencido ? (
          <button type="button" className="botao-principal w-full" onClick={onSeguir} data-acao="seguir">
            Continuar
          </button>
        ) : (
          <button type="button" className="botao-principal w-full" disabled={!completas} onClick={onConferir} data-acao="conferir-frase">
            Conferir com a máquina
          </button>
        )}
      </div>
    </FolhaPautada>
  );
}

export function FolhaNotacao({
  passo,
  frase,
  comprimida,
  onComprimir,
  onSeguir,
}: {
  passo: PassoNotacao;
  frase: string;
  comprimida: boolean;
  onComprimir: () => void;
  onSeguir: () => void;
}) {
  return (
    <FolhaPautada titulo="Caderno" className={CANTOS}>
      <div className="flex flex-col gap-[14px] pt-[14px]" data-folha="notacao" data-comprimida={comprimida ? "sim" : "nao"}>
        <Compressao frase={frase} linhas={passo.linhas} comprimida={comprimida} />
        {comprimida && passo.falas && <Falas falas={passo.falas} compacta />}
        {comprimida ? (
          <button type="button" className="botao-principal w-full" onClick={onSeguir} data-acao="seguir">
            Continuar
          </button>
        ) : (
          <button type="button" className="botao-principal w-full" onClick={onComprimir} data-acao="comprimir">
            Comprimir em notação
          </button>
        )}
      </div>
    </FolhaPautada>
  );
}

export function FolhaRegistro({ passo, frase, onGuardar }: { passo: PassoRegistro; frase: string; onGuardar: () => void }) {
  const p = passo.pagina;
  return (
    <FolhaPautada titulo={p.titulo} className={CANTOS}>
      <div className="flex flex-col gap-[14px] pt-[14px]" data-folha="registro">
        {(p.frase ?? frase) && <p className="m-0 text-[16px] font-medium leading-[28px] text-tinta">{p.frase ?? frase}</p>}
        <div className="quadro-notacao self-start">
          {p.notacao.map((l, i) => (
            <LinhaNotacao key={l} texto={l} tamanho={i === 0 ? "media" : "pequena"} rotulos={false} />
          ))}
        </div>
        {p.volta && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="letra-mao text-[22px]">caminho de volta</span>
            <LinhaNotacao texto={p.volta} tamanho="pequena" rotulos={false} />
          </div>
        )}
        {p.notas.length > 0 && (
          <div className="flex flex-col">
            {p.notas.map((n) => (
              <NotaDalia key={n}>{n}</NotaDalia>
            ))}
          </div>
        )}
        <button type="button" className="botao-principal w-full" onClick={onGuardar} data-acao="guardar-pagina">
          Guardar no Caderno
        </button>
      </div>
    </FolhaPautada>
  );
}

export function textoFrase(exec: Execucao, passoFrase: string | undefined): string {
  return passoFrase ? (exec.frases[passoFrase] ?? "") : (Object.values(exec.frases).at(-1) ?? "");
}

export { preencher };
