"use client";

/**
 * O soroban livre (/relicario/abaco/livre): para brincar sem rodada. Os algarismos ligáveis
 * ("Mostrar os algarismos"), Zerar (aqui só limpa) e Os pares. Nada conta, nada fica guardado.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { aplicarGesto, ler, sorobanVazio } from "@/nucleo/soroban/soroban";
import { SOROBAN_LIVRE, TEXTOS_BANCADA } from "@/conteudo/lapidacao";
import { useProgresso } from "@/componentes/estado/useProgresso";
import { Palco } from "@/componentes/maquinas/Palco";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { Carregando } from "@/componentes/ui/Carregando";
import { IconeRecomecar } from "@/componentes/icones/IconeRecomecar";
import { Soroban } from "@/componentes/soroban/Soroban";
import { Pares } from "@/componentes/soroban/Pares";

export function SorobanLivre() {
  const { pronto, progresso } = useProgresso();
  const router = useRouter();
  const [estado, setEstado] = useState(() => sorobanVazio());
  const [algarismos, setAlgarismos] = useState(true);
  const [pares, setPares] = useState(false);
  const encontrada = progresso.joias.abaco?.encontrada === true;
  useEffect(() => {
    if (pronto && !encontrada) router.replace("/relicario");
  }, [pronto, encontrada, router]);
  if (!pronto || !encontrada) return <Carregando />;
  return (
    <Palco
      atributos={{ "data-pronto": "sim", "data-tela": "soroban-livre", "data-pares": pares ? "aberto" : "fechado" }}
      cabecalho={<CabecalhoLugar voltar={{ href: "/relicario", rotulo: TEXTOS_BANCADA.voltar }} lugar={TEXTOS_BANCADA.lugar} titulo={SOROBAN_LIVRE.titulo} />}
      pedido={
        <div className="faixa-operacao" data-faixa-operacao="">
          <div className="faixa-linha">
            <span className="objetivo-etiqueta">{SOROBAN_LIVRE.mostrando}</span>
            <p className="faixa-op m-0 algarismos" aria-live="polite" data-valor-livre={ler(estado)}>
              {ler(estado)}
            </p>
          </div>
          <p className="objetivo-gesto m-0">{SOROBAN_LIVRE.linha}</p>
        </div>
      }
      maquina={
        <div className="lapidacao-maquina">
          <div className="lapidacao-soroban">
            <Soroban estado={estado} onGesto={(g) => setEstado((s) => aplicarGesto(s, g).soroban)} algarismos={algarismos} />
          </div>
        </div>
      }
      controles={
        <div className="flex flex-col gap-2.5">
          {pares && <Pares destaque={{ cinco: null, dez: null }} />}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="botao-secundario" aria-pressed={algarismos} onClick={() => setAlgarismos(!algarismos)} data-acao="algarismos">
              {SOROBAN_LIVRE.algarismos}
            </button>
            <button type="button" className="botao-secundario" aria-pressed={pares} onClick={() => setPares(!pares)} data-acao="pares">
              {SOROBAN_LIVRE.osPares}
            </button>
            <button type="button" className="botao-discreto" onClick={() => setEstado(sorobanVazio())} data-acao="zerar">
              <IconeRecomecar />
              {SOROBAN_LIVRE.zerar}
            </button>
          </div>
        </div>
      }
    />
  );
}
