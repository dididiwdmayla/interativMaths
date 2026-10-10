"use client";

/**
 * Painéis de cada tipo de passo (a bancada de baixo, na zona do polegar)
 * e a folha pautada da formalização, que sobe por cima da folha quadriculada.
 */
import type { ReactNode } from "react";
import { comoRacional } from "@/nucleo/racional/racional";
import type { Execucao } from "@/nucleo/missoes/motor";
import { preencher, valoresDasFichas } from "@/nucleo/missoes/motor";
import type { Fala, PassoFrase, PassoNotacao, PassoPalpite, PassoPrever, PassoRegistro } from "@/nucleo/missoes/tipos";
import { Numero } from "@/componentes/notacao/Numero";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { Compressao } from "@/componentes/notacao/Compressao";
import { Falas } from "./Falas";
import { FolhaPautada, NotaDalia } from "./Papel";
import { EntradaResposta } from "./Respostas";

export function Seguir({ rotulo = "Seguir", onClick, destaque = true }: { rotulo?: string; onClick: () => void; destaque?: boolean }) {
  return (
    <button type="button" className={`${destaque ? "botao-principal" : "botao-secundario"} w-full`} onClick={onClick} data-acao="seguir">
      {rotulo}
    </button>
  );
}

export function PainelPalpite({ passo, onResponder }: { passo: PassoPalpite; onResponder: (v: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3" data-painel="palpite">
      {passo.falas && <Falas falas={passo.falas} compacta />}
      <p className="m-0 text-[17px] font-bold leading-snug">{passo.pergunta}</p>
      <p className="m-0 text-[14px] font-medium text-tinta-suave">Palpite não vale ponto. Fica guardado para comparar com a máquina.</p>
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
}: {
  passo: PassoPrever;
  exec: Execucao;
  demonstrando: boolean;
  onResponder: (v: string | null) => void;
  onSeguir: () => void;
}) {
  const conferindo = exec.passo.situacao === "conferindo";
  const resposta = exec.passo.resposta;
  const opcao = passo.resposta.tipo === "opcoes" ? passo.resposta.opcoes : null;
  const textoResposta = (v: string) => (opcao ? (opcao.find((o) => o.id === v)?.texto ?? v) : null);
  return (
    <div className="flex flex-col gap-3" data-painel="prever" data-situacao={exec.passo.situacao}>
      {passo.falas && !conferindo && <Falas falas={passo.falas} compacta />}
      <p className="m-0 text-[17px] font-bold leading-snug">{passo.pergunta}</p>
      {!conferindo && <EntradaResposta tipo={passo.resposta} onResponder={onResponder} />}
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
                    <strong className={`font-extrabold text-caneta ${exec.passo.respostaCerta ? "grifo" : ""}`}>
                      {opcao ? textoResposta(resposta) : <Numero valor={comoRacional(resposta)} />}
                    </strong>
                    {exec.passo.respostaCerta ? ". A máquina deu o mesmo." : "."}
                  </span>
                )}
              </p>
              {passo.explicacao && <p className="m-0 text-[15px] text-tinta-suave">{passo.explicacao}</p>}
              <Seguir onClick={onSeguir} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PainelVencido({
  falas,
  palpite,
  convite,
  onConvite,
  onSeguir,
  extra,
}: {
  falas?: readonly Fala[];
  palpite?: { valor: string | null; certo: string } | null;
  convite?: string | null;
  onConvite?: (aceitar: boolean) => void;
  onSeguir: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3" data-painel="vencido" role="status">
      {falas && <Falas falas={falas} compacta />}
      {palpite && (
        <p className="m-0 text-[15px] font-medium">
          Seu palpite: <strong className="font-extrabold text-caneta">{palpite.valor ?? "nenhum"}</strong>. A máquina deu <span className="grifo font-extrabold">{palpite.certo}</span>.
        </p>
      )}
      {extra}
      {convite && onConvite ? (
        <div className="flex flex-col gap-3">
          <p className="m-0 font-semibold">{convite}</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="botao-secundario min-h-[50px]" onClick={() => onConvite(true)} data-acao="aceitar-convite">
              Tentar
            </button>
            <button type="button" className="botao-principal" onClick={() => onConvite(false)} data-acao="seguir">
              Seguir
            </button>
          </div>
        </div>
      ) : (
        <Seguir onClick={onSeguir} />
      )}
    </div>
  );
}

/* ---------- Formalização: a folha pautada ---------- */

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
    <FolhaPautada titulo="Caderno" className="rounded-t-[18px] lg:rounded-[18px]">
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
            const pendente = exec.passo.lacunasErradas.includes(id) || valor === undefined;
            return (
              <button
                key={i}
                type="button"
                className={`lacuna mx-0.5 align-middle ${pendente ? "" : "lacuna-preenchida"}`}
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
        {exec.passo.lacunasErradas.length > 0 && (
          <p className="m-0 text-[15px] font-semibold leading-[28px]" role="status">
            {exec.passo.lacunasErradas.length === 1 ? "Uma lacuna não bate com a máquina." : "Algumas lacunas não batem com a máquina."} Olhe as cotas de novo.
          </p>
        )}
        {vencido ? (
          <button type="button" className="botao-principal w-full" onClick={onSeguir} data-acao="seguir">
            Seguir
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
    <FolhaPautada titulo="Caderno" className="rounded-t-[18px] lg:rounded-[18px]">
      <div className="flex flex-col gap-[14px] pt-[14px]" data-folha="notacao" data-comprimida={comprimida ? "sim" : "nao"}>
        <Compressao frase={frase} linhas={passo.linhas} comprimida={comprimida} />
        {comprimida && passo.falas && <Falas falas={passo.falas} compacta />}
        {comprimida ? (
          <button type="button" className="botao-principal w-full" onClick={onSeguir} data-acao="seguir">
            Seguir
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
    <FolhaPautada
      titulo={p.titulo}
      className="rounded-t-[18px] lg:rounded-[18px]"
      margem={
        <div className="flex flex-col">
          {p.notas.map((n) => (
            <NotaDalia key={n}>{n}</NotaDalia>
          ))}
        </div>
      }
    >
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
