"use client";

/**
 * Tela do mapa: o corte do Engenho, com o que está desperto, bloqueado e em projeto.
 */
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { arcoConcluido, concluida, ecoDisponivel, revisitaDisponivel, sondagensPendentes } from "@/nucleo/campanha/campanha";
import { CONCEITOS_DO_ARCO_1 } from "@/conteudo/conceitos";
import { MISSOES_ARCO_1 } from "@/conteudo/missoes";
import { ATIVIDADES } from "@/conteudo/atividades";
import { existeAtividade, rotaDe, SONDAGEM_ATIVA } from "@/componentes/estado/catalogo";
import { agoraDoJogo } from "@/componentes/estado/loja";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Carregando } from "@/componentes/ui/Carregando";
import { NavJogo } from "@/componentes/ui/NavJogo";
import { useAmbiente } from "@/componentes/ui/useAmbiente";
import { CorteEngenho, type EstadoCorte } from "./CorteEngenho";

const M4 = "partilha.arco1.pao-nao-e-saca";
const ECO = "partilha.arco1.eco";

export function Mapa() {
  const { pronto, progresso } = useProgresso();
  const router = useRouter();
  const ambiente = useAmbiente<HTMLDivElement>();
  const rolou = useRef(false);

  useEffect(() => {
    if (!pronto || rolou.current) return;
    rolou.current = true;
    document.getElementById("andar-partilha")?.scrollIntoView({ block: "center" });
  }, [pronto]);

  if (!pronto) return <Carregando />;
  const agora = agoraDoJogo(progresso);
  const transferencia = concluida(progresso, M4);
  const revisita = revisitaDisponivel(progresso, CONCEITOS_DO_ARCO_1, agora).length > 0;
  const sondagem = SONDAGEM_ATIVA && sondagensPendentes(progresso, CONCEITOS_DO_ARCO_1, agora).length > 0;
  const eco = ATIVIDADES.some((a) => a.id === ECO) && ecoDisponivel(progresso, M4, ECO);
  const estado: EstadoCorte = {
    partilhaMissoes: MISSOES_ARCO_1.filter((m) => concluida(progresso, m.id)).length,
    partilhaAcesa: arcoConcluido(progresso, MISSOES_ARCO_1),
    museuAberto: transferencia && existeAtividade("museu.paes-de-ahmes"),
    ruaAberta: transferencia && existeAtividade("rua.tres-pizzas"),
    chamado: revisita ? "revisita" : sondagem ? "sondagem" : eco ? "eco" : null,
  };
  const ir = (id: string) => {
    const a = ATIVIDADES.find((x) => x.id === id);
    if (a) router.push(rotaDe(a));
  };

  return (
    <main data-pronto="sim" data-tela="mapa" data-chamado={estado.chamado ?? ""} className="min-h-dvh bg-noite pb-24">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 area-segura area-segura-topo pb-2">
        <div className="pointer-events-auto mx-auto flex max-w-[560px] items-center justify-between rounded-b-xl bg-[var(--veu)] px-3 py-2">
          <div>
            <p className="rotulo-chapa m-0 text-[0.76rem]">O vale</p>
            <h1 className="fonte-sinal m-0 text-[1.7rem] font-extrabold uppercase leading-none text-latao-claro">O Engenho</h1>
          </div>
          <p className="m-0 max-w-[48%] text-right text-[0.88rem] text-texto-mundo-suave">
            {estado.partilhaAcesa ? "O primeiro setor acendeu." : "Toque em A Partilha para entrar."}
          </p>
        </div>
      </header>
      <div ref={ambiente} className="mx-auto max-w-[560px]">
        <CorteEngenho
          estado={estado}
          destinos={{
            partilha: () => router.push("/partilha"),
            museu: () => router.push("/museu/paes-de-ahmes"),
            rua: () => router.push("/rua/tres-pizzas"),
            chamado: () => (estado.chamado === "revisita" ? ir("partilha.arco1.revisita") : estado.chamado === "eco" ? ir(ECO) : router.push("/partilha")),
          }}
        />
      </div>
      <NavJogo atual="mapa" />
    </main>
  );
}
