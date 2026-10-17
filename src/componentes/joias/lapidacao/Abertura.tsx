/**
 * A abertura da rodada (referência 2 de v05.html). Técnica nova: a ficha da técnica (rótulo, nome,
 * a frase, a haste desenhada com o exemplo, a conta do exemplo, os pares quando há), "A rodada" em
 * três linhas e Começar. Nas outras rodadas, uma abertura curta: o nome da rodada, uma linha e
 * Começar.
 */
import type { Joia } from "@/nucleo/joias/contrato";
import type { DecisaoRodada } from "@/nucleo/joias/treino";
import type { ItemRodada } from "@/nucleo/soroban/item";
import { mostrar } from "@/nucleo/soroban/soroban";
import { exemploDaOperacao } from "@/nucleo/soroban/textos";
import { ABERTURAS, DESTAQUE_DA_RODADA, LINHA_DO_NIVEL, LINHA_MANUTENCAO, LINHA_REVISAO, LINHAS_DA_RODADA, NOMES_NIVEL, TEXTOS_BANCADA } from "@/conteudo/lapidacao";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { SorobanPequeno } from "@/componentes/soroban/SorobanPequeno";
import { Pares } from "@/componentes/soroban/Pares";

function ContaPequena({ cheia }: { cheia: boolean }) {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
      <polygon
        points="2,7 6,2 16,2 20,7 16,12 6,12"
        fill={cheia ? "var(--soroban-conta)" : "var(--folha)"}
        stroke={cheia ? "var(--contorno)" : "var(--grafite)"}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeDasharray={cheia ? undefined : "3 2"}
      />
    </svg>
  );
}

/** Uma linha de "A rodada", com o caminho curto em negrito. */
function LinhaComDestaque({ texto }: { texto: string }) {
  const i = texto.indexOf(DESTAQUE_DA_RODADA);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <strong>{DESTAQUE_DA_RODADA}</strong>
      {texto.slice(i + DESTAQUE_DA_RODADA.length)}
    </>
  );
}

function ExemploDaTecnica({ id }: { id: keyof typeof ABERTURAS }) {
  const a = ABERTURAS[id];
  const ex = a.exemplo;
  if (ex.tipo === "ler" || ex.tipo === "sombra") {
    const leitura = ex.tipo === "ler";
    return (
      <>
        <SorobanPequeno inicio={mostrar(1, ex.valor)} modo={leitura ? "leitura" : "sombra"} rotulo={leitura ? `Uma haste mostrando ${ex.valor}: a de cima e ${ex.valor - 5} de baixo.` : TEXTOS_BANCADA.notaSombra} />

      </>
    );
  }
  const exemplo = exemploDaOperacao({ tipo: "somar", a: ex.a, b: ex.b });
  if (!exemplo) return null;
  const partes = exemplo.conta.split(" = ");
  return (
    <>
      <SorobanPequeno inicio={exemplo.inicio} movimentos={exemplo.movimentos} rotulo={exemplo.conta} />
      <p className="m-0 flex flex-wrap items-baseline gap-x-2 text-[22px] font-extrabold leading-[1.1] algarismos" data-conta-exemplo={exemplo.conta}>
        <span>{partes[0]}</span>
        {partes.slice(1, -1).map((p) => (
          <span key={p} className="text-[18px] text-caneta">
            = {p}
          </span>
        ))}
        <span>
          = <span className="manual-marca">{partes[partes.length - 1]}</span>
        </span>
      </p>
    </>
  );
}

export function AberturaRodada({
  joia,
  decisao,
  itens,
  andamento,
  onComecar,
}: {
  joia: Joia;
  decisao: DecisaoRodada;
  itens: readonly ItemRodada[];
  /** O andamento da técnica do foco ("2 de 6 lances limpos, 1 de 2 rodadas"), nas rodadas que não são de técnica nova. */
  andamento: string | null;
  onComecar: () => void;
}) {
  const nivel = itens[0]?.nivel ?? "sozinho";
  const nova = decisao.tipo === "tecnica" && decisao.nova;
  const id = decisao.tipo === "tecnica" ? (decisao.foco.id as keyof typeof ABERTURAS) : null;
  const abertura = id && id in ABERTURAS ? ABERTURAS[id] : null;
  const linhas = id === "soroban.ler" ? LINHAS_DA_RODADA.ler : id === "soroban.imaginado" ? LINHAS_DA_RODADA.imaginado : LINHAS_DA_RODADA.padrao;
  const tituloCurto =
    decisao.tipo === "tecnica" ? `${decisao.foco.nome} · ${NOMES_NIVEL[nivel]}` : decisao.tipo === "revisao" ? TEXTOS_BANCADA.tituloRevisao : TEXTOS_BANCADA.tituloManutencao;
  const linhaCurta = decisao.tipo === "tecnica" ? LINHA_DO_NIVEL[nivel] : decisao.tipo === "revisao" ? LINHA_REVISAO : LINHA_MANUTENCAO;
  return (
    <main
      data-pronto="sim"
      data-tela="lapidacao"
      data-fase="abertura"
      data-passo="abertura"
      data-foco={decisao.tipo === "tecnica" ? decisao.foco.id : decisao.tipo}
      data-nova={nova ? "sim" : "nao"}
      data-nivel={nivel}
      className="flex min-h-dvh flex-col"
    >
      <CabecalhoLugar voltar={{ href: "/relicario", rotulo: TEXTOS_BANCADA.voltar }} lugar={TEXTOS_BANCADA.lugar} titulo={TEXTOS_BANCADA.tituloAbertura} />
      <div className="area-segura area-segura-base mx-auto flex w-full max-w-[560px] flex-1 flex-col gap-3 pt-3.5">
        {nova && abertura && decisao.tipo === "tecnica" ? (
          <>
            <section className="ficha flex flex-col gap-2.5 p-3.5" data-ficha-tecnica={decisao.foco.id}>
              <p className="m-0 text-[12.5px] font-bold text-caneta">{TEXTOS_BANCADA.tecnicaNova}</p>
              <h1 className="m-0 -mt-1.5 text-[25px] font-extrabold leading-[1.1]">{decisao.foco.nome}</h1>
              <p className="m-0 text-[15.5px] font-medium leading-[1.42]">
                {abertura.frase} <strong>{abertura.destaque}</strong>
                {abertura.depois ? ` ${abertura.depois}` : ""}
              </p>
              <ExemploDaTecnica id={decisao.foco.id as keyof typeof ABERTURAS} />
              {abertura.pares !== "nenhum" && (
                <Pares destaque={{ cinco: null, dez: null }} so={abertura.pares === "cinco" ? "cinco" : abertura.pares === "dez" ? "dez" : undefined} />
              )}
            </section>
            <section className="flex flex-col gap-[7px] px-1 py-0.5" aria-label={TEXTOS_BANCADA.aRodada}>
              <h2 className="m-0 text-[15px] font-extrabold">{TEXTOS_BANCADA.aRodada}</h2>
              {linhas.map((l, i) => (
                <p key={i} className={`linha-rodada m-0 ${i === 2 ? "text-tinta-suave" : ""}`}>
                  <ContaPequena cheia={i < 2} />
                  <span>
                    <LinhaComDestaque texto={l} />
                  </span>
                </p>
              ))}
            </section>
          </>
        ) : (
          <section className="ficha flex flex-col gap-2 p-4" data-abertura-curta="">
            <p className="m-0 text-[12.5px] font-bold text-tinta-suave">{joia.nome}</p>
            <h1 className="m-0 text-[23px] font-extrabold leading-[1.15]">{tituloCurto}</h1>
            <p className="m-0 text-[15.5px] font-medium leading-[1.42]">{linhaCurta}</p>
            {andamento && (
              <p className="m-0 text-[13.5px] font-semibold text-tinta-suave" data-andamento-foco="">
                {andamento}
              </p>
            )}
            {decisao.tipo === "revisao" && <p className="m-0 text-[14px] font-semibold text-tinta-suave">{decisao.faltam.map((t) => t.nome).join(", ")}</p>}
          </section>
        )}
        <button type="button" className="botao-principal mb-[22px] mt-auto w-full" onClick={onComecar} data-acao="comecar">
          {TEXTOS_BANCADA.comecar}
        </button>
      </div>
    </main>
  );
}
