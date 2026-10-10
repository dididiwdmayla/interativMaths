"use client";

/**
 * Menu: postura do Nônio, cotas, animações, rever abertura, apagar progresso.
 * Sem controle de som: som não entra nesta versão.
 */
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { definirPreferencias, progressoNovo, type Preferencias } from "@/nucleo/progresso";
import { substituirProgresso } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";

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
    <fieldset className="chapa m-0 flex flex-col gap-2 border-0 p-4" data-preferencia={id}>
      <legend className="sr-only">{titulo}</legend>
      <p className="rotulo-chapa m-0" aria-hidden="true">
        {titulo}
      </p>
      <p className="m-0 text-[0.92rem] text-texto-mundo-suave">{ajuda}</p>
      <div className="flex flex-col gap-2" role="radiogroup" aria-label={titulo}>
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            className={`placa w-full flex-col items-start gap-0.5 py-2 text-left ${valor === o.valor ? "placa-escolhida" : ""}`}
            style={{ alignItems: "flex-start" }}
            onClick={() => onMudar(o.valor)}
            data-opcao={o.valor}
          >
            <span>{o.rotulo}</span>
            <span className="text-[0.82rem] font-normal normal-case tracking-normal" style={{ fontFamily: "var(--fonte-texto)" }}>
              {o.linha}
            </span>
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
      <div className="chapa flex flex-col gap-2 border-vermelhao p-4" role="alertdialog" aria-label="Confirmar apagar progresso">
        <p className="m-0">Apagar tudo: evidências, páginas do Caderno, joias e calibragem. Não tem volta.</p>
        <div className="flex gap-2">
          <button type="button" className="placa flex-1" onClick={() => setConfirmando(false)} autoFocus>
            Manter
          </button>
          <button type="button" className="placa flex-1" style={{ borderColor: "var(--vermelhao)", boxShadow: "0 3px 0 var(--vermelhao-sombra)" }} onClick={apagar} data-acao="confirmar-apagar">
            Apagar
          </button>
        </div>
      </div>
    );
  } else {
    rodape = (
      <button type="button" className="placa placa-discreta w-full" onClick={() => setConfirmando(true)} data-acao="apagar">
        Apagar progresso
      </button>
    );
  }
  return (
    <main data-pronto="sim" data-tela="menu" className="min-h-dvh pb-28">
      <header className="area-segura area-segura-topo pb-3 pt-4">
        <p className="rotulo-chapa m-0">Ajustes</p>
        <h1 className="fonte-sinal m-0 text-[2.2rem] font-extrabold uppercase leading-none text-latao-claro">Menu</h1>
      </header>
      <div className="area-segura mx-auto flex max-w-xl flex-col gap-4">
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
          id="cotas"
          titulo="Cotas"
          ajuda="As linhas de medida presas às máquinas. Escondidas, você joga sem esse apoio; pedir uma medida ao Nônio mostra uma."
          valor={prefs.cotas}
          onMudar={(cotas) => mudar({ cotas })}
          opcoes={[
            { valor: "visiveis", rotulo: "Visíveis", linha: "Números ao lado das pilhas e das bicas." },
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
            { valor: "completas", rotulo: "Completas", linha: "Esteiras, engrenagens e luzes em movimento." },
            { valor: "leves", rotulo: "Leves", linha: "Fundo parado; as máquinas continuam mostrando o que fazem." },
          ]}
        />
        <Link href="/abertura?rever=1" className="placa w-full" data-acao="rever-abertura">
          Rever abertura
        </Link>
        {rodape}
      </div>
      <NavJogo atual="menu" />
    </main>
  );
}
