"use client";

/**
 * Menu: postura do Nônio, perguntas por escrito (IA), cotas, animações, rever abertura, apagar progresso.
 * Sem controle de som: som não entra nesta versão.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { definirPreferencias, progressoNovo, type Preferencias } from "@/nucleo/progresso";
import { substituirProgresso } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { TEXTOS_CONVERSA } from "@/conteudo/tutor";
import { CabecalhoJogo } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";

function Grupo<T extends string>({
  titulo,
  ajuda,
  valor,
  opcoes,
  onMudar,
  id,
}: {
  titulo: string;
  ajuda: string;
  valor: T;
  opcoes: { valor: T; rotulo: string; linha: string }[];
  onMudar: (v: T) => void;
  id: string;
}) {
  return (
    <fieldset className="ficha m-0 flex min-w-0 flex-col gap-2 p-4" data-preferencia={id}>
      <legend className="sr-only">{titulo}</legend>
      <h2 className="m-0 text-[17px] font-extrabold" aria-hidden="true">
        {titulo}
      </h2>
      <p className="m-0 text-[14px] font-medium text-tinta-suave">{ajuda}</p>
      <div className="mt-1 flex flex-col gap-2" role="radiogroup" aria-label={titulo}>
        {opcoes.map((o) => (
          <button key={o.valor} type="button" role="radio" aria-checked={valor === o.valor} className="opcao opcao-texto flex-col items-start gap-0.5" onClick={() => onMudar(o.valor)} data-opcao={o.valor}>
            <span className="text-[16px] font-bold">{o.rotulo}</span>
            <span className="text-[13px] font-medium opacity-90">{o.linha}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Menu() {
  const { pronto, progresso, atualizar } = useProgresso();
  const [confirmando, setConfirmando] = useState(false);
  if (!pronto) return <Carregando />;
  const prefs = progresso.preferencias;
  const mudar = (m: Partial<Preferencias>) => atualizar((p, agora) => definirPreferencias(p, m, agora));
  const apagar = () => {
    substituirProgresso(progressoNovo(Date.now()));
    setConfirmando(false);
  };
  let rodape: ReactNode;
  if (confirmando) {
    rodape = (
      <div className="ficha flex flex-col gap-3 p-4" role="alertdialog" aria-label="Confirmar apagar progresso">
        <p className="m-0 text-[15px] font-semibold">Apagar tudo: evidências, páginas do Caderno, joias e calibragem. Não tem volta.</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="botao-principal" onClick={() => setConfirmando(false)} autoFocus>
            Manter
          </button>
          <button type="button" className="botao-secundario min-h-[50px]" onClick={apagar} data-acao="confirmar-apagar">
            Apagar
          </button>
        </div>
      </div>
    );
  } else {
    rodape = (
      <button type="button" className="botao-discreto self-start" onClick={() => setConfirmando(true)} data-acao="apagar">
        Apagar progresso
      </button>
    );
  }
  return (
    <main data-pronto="sim" data-tela="menu" className="min-h-dvh pb-16">
      <CabecalhoJogo atual="menu" />
      <div className="area-segura mx-auto flex w-full max-w-[880px] flex-col gap-4 pt-5">
        <header>
          <p className="m-0 text-[13px] font-semibold text-tinta-suave">Ajustes</p>
          <h1 className="m-0 text-[24px] font-extrabold leading-tight">Menu</h1>
        </header>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <Grupo
            id="postura"
            titulo="Postura do Nônio"
            ajuda="Quanto ele se mete. Nas encomendas sem manual, ele só fala se chamado."
            valor={prefs.postura}
            onMudar={(postura) => mudar({ postura })}
            opcoes={[
              { valor: "quieto", rotulo: "Quieto", linha: "Só quando chamado." },
              { valor: "disponivel", rotulo: "Disponível", linha: "Oferece uma medida depois de duas tentativas travadas." },
              { valor: "presente", rotulo: "Presente", linha: "Comenta o que a máquina mostra, por conta própria." },
            ]}
          />
          <Grupo
            id="conversa"
            titulo={TEXTOS_CONVERSA.preferencia}
            ajuda="O botão Perguntar abre uma conversa sobre a missão. As perguntas vão para um serviço de IA da Anthropic; as contas e as correções continuam com a máquina."
            valor={prefs.conversa}
            onMudar={(conversa) => mudar({ conversa })}
            opcoes={[
              { valor: "ligada", rotulo: TEXTOS_CONVERSA.preferenciaLigada, linha: "O Perguntar aparece na faixa do Nônio, quando o serviço está no ar." },
              { valor: "desligada", rotulo: TEXTOS_CONVERSA.preferenciaDesligada, linha: "Só a escada do Me ajuda, sem IA." },
            ]}
          />
          <Grupo
            id="cotas"
            titulo="Cotas"
            ajuda="As anotações de medida presas às máquinas. Escondidas, você joga sem esse apoio; pedir uma medida ao Nônio mostra uma."
            valor={prefs.cotas}
            onMudar={(cotas) => mudar({ cotas })}
            opcoes={[
              { valor: "visiveis", rotulo: "Visíveis", linha: "Números ao lado das pilhas e debaixo de cada lugar." },
              { valor: "escondidas", rotulo: "Escondidas", linha: "Só os medidores, sem números." },
            ]}
          />
          <Grupo
            id="animacoes"
            titulo="Animações"
            ajuda="Leves reduz o movimento de fundo sem tirar nenhuma informação."
            valor={prefs.animacoes}
            onMudar={(animacoes) => mudar({ animacoes })}
            opcoes={[
              { valor: "completas", rotulo: "Completas", linha: "Esteiras e engrenagens em movimento." },
              { valor: "leves", rotulo: "Leves", linha: "Fundo parado; as máquinas continuam mostrando o que fazem." },
            ]}
          />
          <div className="flex flex-col gap-3">
            <Link href="/abertura?rever=1" className="botao-secundario w-full" data-acao="rever-abertura">
              Rever abertura
            </Link>
            {rodape}
          </div>
        </div>
      </div>
    </main>
  );
}
