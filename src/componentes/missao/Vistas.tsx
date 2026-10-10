"use client";

/**
 * Painéis de cada tipo de passo (a parte de baixo da tela, na zona do polegar)
 * e a folha de papel da formalização.
 */
import type { ReactNode } from "react";
import { comoRacional } from "@/nucleo/racional/racional";
import type { Execucao } from "@/nucleo/missoes/motor";
import { preencher, valoresDasFichas } from "@/nucleo/missoes/motor";
import type { Fala, PassoFrase, PassoNotacao, PassoPalpite, PassoPrever, PassoRegistro } from "@/nucleo/missoes/tipos";
import { Numero } from "@/componentes/notacao/Numero";
import { LinhaNotacao } from "@/componentes/notacao/Notacao";
import { Compressao } from "@/componentes/notacao/Compressao";
import { Alavanca } from "@/componentes/ui/Alavanca";
import { Falas } from "./Falas";
import { FolhaPapel, NotaDalia } from "./Papel";
import { EntradaResposta } from "./Respostas";

export function Seguir({ rotulo = "Seguir", onClick, destaque = true }: { rotulo?: string; onClick: () => void; destaque?: boolean }) {
  return (
    <button type="button" className={`placa w-full ${destaque ? "placa-cheia" : ""}`} onClick={onClick} data-acao="seguir">
      {rotulo}
    </button>
  );
}

export function PainelPalpite({ passo, onResponder }: { passo: PassoPalpite; onResponder: (v: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3" data-painel="palpite">
      {passo.falas && <Falas falas={passo.falas} compacta />}
      <p className="m-0 text-[1.08rem] font-semibold">{passo.pergunta}</p>
      <p className="m-0 text-[0.92rem] text-texto-mundo-suave">Palpite não vale ponto. Fica guardado para comparar com a máquina.</p>
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
      <p className="m-0 text-[1.08rem] font-semibold">{passo.pergunta}</p>
      {!conferindo && <EntradaResposta tipo={passo.resposta} onResponder={onResponder} />}
      {conferindo && (
        <div className="flex flex-col gap-2" role="status" aria-live="polite">
          {demonstrando ? (
            <p className="m-0 text-texto-mundo-suave">A máquina está conferindo...</p>
          ) : (
            <>
              <p className="m-0 flex flex-wrap items-center gap-x-2 text-[1.05rem]" data-resultado-previsao={exec.passo.respostaCerta ? "certa" : resposta === null ? "nao-sei" : "outra"}>
                {resposta === null || resposta === undefined ? (
                  <span className="text-texto-mundo-suave">Você disse: não sei ainda. Vale.</span>
                ) : (
                  <span>
                    Você disse:{" "}
                    <strong className={exec.passo.respostaCerta ? "text-ambar" : "text-texto-mundo"}>
                      {opcao ? textoResposta(resposta) : <Numero valor={comoRacional(resposta)} />}
                    </strong>
                    {exec.passo.respostaCerta ? ". A máquina deu o mesmo." : "."}
                  </span>
                )}
              </p>
              {passo.explicacao && <p className="m-0 text-texto-mundo-suave">{passo.explicacao}</p>}
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
        <p className="m-0 text-[0.95rem] text-texto-mundo-suave">
          Seu palpite: {palpite.valor ?? "nenhum"}. A máquina deu {palpite.certo}.
        </p>
      )}
      {extra}
      {convite && onConvite ? (
        <div className="flex flex-col gap-2">
          <p className="m-0">{convite}</p>
          <div className="flex gap-2">
            <button type="button" className="placa flex-1" onClick={() => onConvite(true)} data-acao="aceitar-convite">
              Tentar
            </button>
            <button type="button" className="placa placa-cheia flex-1" onClick={() => onConvite(false)} data-acao="seguir">
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

/* ---------- Formalização: a página de papel ---------- */

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
    <FolhaPapel titulo="Caderno">
      <div className="flex flex-col gap-3 pt-2" data-folha="frase">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Cotas da máquina">
          {fichas.map((f) => (
            <button
              key={`${f.medida}:${f.valor}`}
              type="button"
              className={`placa placa-papel placa-pequena min-w-[52px] text-[1.15rem] normal-case ${escolhida === f.valor ? "placa-escolhida" : ""}`}
              aria-pressed={escolhida === f.valor}
              onClick={() => onEscolher(escolhida === f.valor ? null : f.valor)}
              disabled={vencido}
              data-cota={f.valor}
              style={{ fontFamily: "var(--fonte-texto)" }}
            >
              <Numero valor={comoRacional(f.valor)} pequena />
            </button>
          ))}
        </div>
        <p className="m-0 text-[1.2rem] leading-[2.4rem] text-tinta">
          {partes.map((p, i) => {
            const m = /^\{(\w+)\}$/.exec(p);
            if (!m) return <span key={i}>{p}</span>;
            const id = m[1];
            const valor = exec.passo.lacunas[id];
            const errada = exec.passo.lacunasErradas.includes(id);
            return (
              <button
                key={i}
                type="button"
                className={`mx-0.5 inline-flex min-h-[44px] min-w-[3.2rem] items-center justify-center rounded-md border-2 border-dashed px-2 align-middle font-bold ${
                  errada ? "border-tinta-vermelha text-tinta-vermelha" : valor ? "border-turquesa-tinta text-tinta" : "border-tinta-suave text-tinta-suave"
                }`}
                onClick={() => onColocar(id)}
                disabled={vencido}
                aria-label={`Lacuna: ${valor ?? "vazia"}`}
                data-lacuna={id}
              >
                {valor ? <Numero valor={comoRacional(valor)} pequena /> : "    "}
              </button>
            );
          })}
        </p>
        {exec.passo.lacunasErradas.length > 0 && (
          <p className="m-0 text-tinta-vermelha" role="status">
            {exec.passo.lacunasErradas.length === 1 ? "Uma lacuna não bate com a máquina." : "Algumas lacunas não batem com a máquina."} Olhe as cotas de novo.
          </p>
        )}
        {vencido ? (
          <button type="button" className="placa placa-papel placa-cheia w-full" onClick={onSeguir} data-acao="seguir">
            Seguir
          </button>
        ) : (
          <button type="button" className="placa placa-papel w-full" disabled={!completas} onClick={onConferir} data-acao="conferir-frase">
            Conferir com a máquina
          </button>
        )}
        {!vencido && <p className="m-0 text-[0.9rem] text-tinta-suave">Toque numa cota e depois na lacuna.</p>}
      </div>
    </FolhaPapel>
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
    <FolhaPapel titulo="Caderno">
      <div className="flex flex-col gap-4 pt-2" data-folha="notacao" data-comprimida={comprimida ? "sim" : "nao"}>
        <Compressao frase={frase} linhas={passo.linhas} comprimida={comprimida} />
        {comprimida && passo.falas && (
          <div className="rounded-lg bg-noite p-3">
            <Falas falas={passo.falas} compacta />
          </div>
        )}
        {comprimida ? (
          <button type="button" className="placa placa-papel placa-cheia w-full" onClick={onSeguir} data-acao="seguir">
            Seguir
          </button>
        ) : (
          <div className="flex justify-center">
            <Alavanca rotulo="Comprimir" onPuxar={onComprimir} idTeste="comprimir" />
          </div>
        )}
      </div>
    </FolhaPapel>
  );
}

export function FolhaRegistro({ passo, frase, onGuardar }: { passo: PassoRegistro; frase: string; onGuardar: () => void }) {
  const p = passo.pagina;
  return (
    <FolhaPapel
      titulo={p.titulo}
      margem={
        <div className="flex flex-col gap-1">
          {p.notas.map((n) => (
            <NotaDalia key={n}>{n}</NotaDalia>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-3 pt-2" data-folha="registro">
        {(p.frase ?? frase) && <p className="m-0 text-[1.05rem] text-tinta">{p.frase ?? frase}</p>}
        {p.notacao.map((l, i) => (
          <LinhaNotacao key={l} texto={l} tamanho={i === 0 ? "media" : "pequena"} rotulos={false} />
        ))}
        {p.volta && (
          <div className="flex items-center gap-2 text-tinta-suave">
            <span className="text-[0.85rem] uppercase tracking-wide">caminho de volta</span>
            <LinhaNotacao texto={p.volta} tamanho="pequena" rotulos={false} />
          </div>
        )}
        <button type="button" className="placa placa-papel placa-cheia w-full" onClick={onGuardar} data-acao="guardar-pagina">
          Guardar no Caderno
        </button>
      </div>
    </FolhaPapel>
  );
}

export function textoFrase(exec: Execucao, passoFrase: string | undefined): string {
  return passoFrase ? (exec.frases[passoFrase] ?? "") : (Object.values(exec.frases).at(-1) ?? "");
}

export { preencher };
