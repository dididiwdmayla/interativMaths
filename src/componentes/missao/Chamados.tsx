"use client";

/**
 * Atividades geradas: a revisita (um dia depois) e a sondagem (uma pergunta, quando a mesma
 * medida escapou duas vezes). Se a sondagem confirmar a folga num pré-requisito, o jogo oferece
 * um desvio e depois devolve o jogador exatamente onde estava.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ancestrais } from "@/nucleo/curriculo/curriculo";
import { situacaoConceito } from "@/nucleo/dominio/dominio";
import { atividadeRevisita, atividadeSondagem } from "@/nucleo/geradores/atividades";
import { conceitosDaRevisita, CONCEITOS_COM_GERADOR } from "@/nucleo/geradores/questoes";
import { revisitaDisponivel } from "@/nucleo/campanha/campanha";
import { definirDesvio, iniciarRevisita } from "@/nucleo/progresso";
import { TEXTOS_REVISITA, TEXTOS_SONDAGEM } from "@/conteudo/chamados";
import { CONCEITOS, CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { atividadePorId, rotaDe } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { FichaEstado } from "@/componentes/ui/FichaEstado";
import { Carregando } from "@/componentes/ui/Carregando";
import { ExecutorAtividade } from "./Executor";

function Aviso({ titulo, texto, tela }: { titulo: string; texto: string; tela: string }) {
  return (
    <FichaEstado tela={tela} expressao="quieto" titulo={titulo}>
      <p className="m-0 text-[16px] font-medium text-tinta-suave">{texto}</p>
      <Link href="/partilha" className="botao-principal w-full">
        Voltar à Partilha
      </Link>
    </FichaEstado>
  );
}

export function Revisita() {
  const { pronto, progresso, atualizar } = useProgresso();
  if (!pronto) return <Carregando />;
  const atual = progresso.revisitas.atual;
  if (!atual) {
    const devidos = revisitaDisponivel(progresso, CONCEITOS_DO_ARCO_1, agoraDoJogo(progresso)).filter((c) => CONCEITOS_COM_GERADOR.includes(c));
    const conceitos = conceitosDaRevisita(devidos);
    if (conceitos.length === 0) {
      return <Aviso tela="revisita" titulo="Nenhuma revisita agora" texto="A revisita aparece no mapa, como um chamado do Nônio, no mínimo vinte horas depois do primeiro acerto." />;
    }
    return (
      <FichaEstado tela="revisita" fase="convite" expressao="atento" titulo="Revisita">
        <p className="m-0 text-[16px] font-medium">Passou um dia. Três perguntas rápidas, com números novos.</p>
        <button type="button" className="botao-principal w-full" onClick={() => atualizar((p, t) => iniciarRevisita(p, conceitos, t))} data-acao="comecar-revisita">
          Começar
        </button>
      </FichaEstado>
    );
  }
  const a = atividadeRevisita(atual.conceitos, atual.semente, TEXTOS_REVISITA);
  return <ExecutorAtividade key={`${a.id}:${atual.semente}`} a={a} voltar={{ href: "/partilha", rotulo: "Partilha" }} />;
}

export function Sondagem() {
  const params = useSearchParams();
  const conceito = params.get("conceito") ?? "";
  const origem = params.get("origem");
  const { pronto, progresso } = useProgresso();
  if (!pronto) return <Carregando />;
  if (!CONCEITOS_COM_GERADOR.includes(conceito)) {
    return <Aviso tela="sondagem" titulo="Sem medida pendente" texto="Não há nada para conferir agora." />;
  }
  const semente = 3001 + progresso.evidencias.filter((e) => e.conceito === conceito).length * 17;
  const a = atividadeSondagem(conceito, semente, TEXTOS_SONDAGEM);
  const voltar = origem && atividadePorId(origem) ? { href: rotaDe(atividadePorId(origem) as NonNullable<ReturnType<typeof atividadePorId>>), rotulo: "Voltar" } : { href: "/partilha", rotulo: "Partilha" };
  return <ExecutorAtividade key={`${a.id}:${semente}`} a={a} voltar={voltar} aoTerminar={() => <FimSondagem conceito={conceito} origem={origem} />} />;
}

function FimSondagem({ conceito, origem }: { conceito: string; origem: string | null }) {
  const { progresso, atualizar } = useProgresso();
  const router = useRouter();
  const agora = agoraDoJogo(progresso);
  const s = situacaoConceito(conceito, progresso.evidencias, agora);
  const nome = CONCEITOS.find((c) => c.id === conceito)?.nome ?? conceito;
  const a = origem ? atividadePorId(origem) : null;
  // O desvio só faz sentido se a folga é num pré-requisito da atividade de onde o jogador veio.
  const ehPreRequisito = a !== null && a.conceitos.some((c) => c !== conceito && ancestrais(CONCEITOS, c).includes(conceito));
  const missao = MISSOES_ARCO_1.find((m) => m.conceitos.includes(conceito));
  const desviar = () => {
    if (!missao) return;
    if (!origem) return;
    atualizar((p, t) => definirDesvio(p, { origem, destino: missao.id, conceito, criadoEm: t }, t));
    router.push(rotaDe(missao));
  };
  const ajuste = s.estado === "pede_ajuste";
  return (
    <FichaEstado tela="fim-sondagem" expressao={ajuste ? "medindo" : "satisfeito"} titulo={ajuste ? "Achei a folga" : "Está firme"} atributos={{ "data-estado": s.estado }}>
      <p className="m-0 text-[16px] font-medium">
        {ajuste
          ? `A peça "${nome.toLowerCase()}" pede ajuste. Não é defeito seu: é uma peça de baixo que merece outra volta.`
          : "A medida bateu. As duas escapadas foram acaso; sigo sem mexer em nada."}
      </p>
      <div className="flex w-full flex-col gap-2.5">
        {ajuste && missao && a && ehPreRequisito && (
          <button type="button" className="botao-principal w-full" onClick={desviar} data-acao="desvio">
            Desvio: missão {missao.numero}, depois volto
          </button>
        )}
        {ajuste && missao && !a && (
          <Link href={rotaDe(missao)} className="botao-principal w-full" data-acao="rever-missao">
            Rever a missão {missao.numero}: {missao.titulo}
          </Link>
        )}
        {a ? (
          <Link href={rotaDe(a)} className={`${ajuste && missao && ehPreRequisito ? "botao-secundario" : "botao-principal"} w-full`} data-acao="voltar-origem">
            Voltar para {a.titulo}
          </Link>
        ) : (
          <Link href="/partilha" className={`${ajuste && missao ? "botao-secundario" : "botao-principal"} w-full`}>
            Voltar à Partilha
          </Link>
        )}
      </div>
    </FichaEstado>
  );
}
