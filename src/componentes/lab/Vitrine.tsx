"use client";

/**
 * /lab/vitrine: a identidade Quadriculado inteira, para conferir o sistema numa página só.
 * Materiais, tokens, letra, receitas de componente, kit de desenho, peças, Nônio, guia (a bolinha,
 * o recado, a janelinha, selos, objetivo, bilhete, menu de corte, folhas), rascunho e conta, uma
 * página do Manual, tudo no escuro, joias, notação.
 */
import { useState, type ReactNode } from "react";
import { racional } from "@/nucleo/racional/racional";
import { JOIAS } from "@/conteudo/joias";
import type { FormaReceptor } from "@/conteudo/peles";
import { Anotacao, Bica, Chave, CirculoVermelho, ElipseMarcaTexto, Engrenagem, Esteira, FaixaMarcaTexto, Medidor, NumeroAnotado, PassarACaneta, Rabisco, SetaCurva, Trilho } from "@/componentes/mundo/kit";
import { Unidade, Saco } from "@/componentes/maquinas/pecas";
import { comporUnidades } from "@/componentes/maquinas/geometria";
import { Receptor } from "@/componentes/maquinas/receptores";
import { NumeroSvg } from "@/componentes/maquinas/cota";
import { TiraMensagem } from "@/componentes/maquinas/Tira";
import { Nonio, type ExpressaoNonio } from "@/componentes/nonio/Nonio";
import { Gema } from "@/componentes/joias/Gema";
import { BlocoNotacao, LinhaNotacao } from "@/componentes/notacao/Notacao";
import { Numero, Fracao } from "@/componentes/notacao/Numero";
import { Seletor } from "@/componentes/ui/Seletor";
import { Marca } from "@/componentes/ui/Marca";
import { CabecalhoLugar } from "@/componentes/ui/Cabecalho";
import { FalaDalia, BalaoNonio } from "@/componentes/missao/Falas";
import { FolhaPautada, NotaDalia } from "@/componentes/missao/Papel";
import { EtiquetaEstado } from "@/componentes/mundo/Planta";
import { DesenhoContrapeso, DesenhoPartilha } from "@/componentes/mundo/Distritos";
import { MiniaturaMissao } from "@/componentes/mundo/Miniaturas";
import { IconeAvancar } from "@/componentes/icones/IconeAvancar";
import { IconeCadeado } from "@/componentes/icones/IconeCadeado";
import { IconeChave } from "@/componentes/icones/IconeChave";
import { IconeDesfazer } from "@/componentes/icones/IconeDesfazer";
import { IconeFechar } from "@/componentes/icones/IconeFechar";
import { IconeJoia } from "@/componentes/icones/IconeJoia";
import { IconeMais } from "@/componentes/icones/IconeMais";
import { IconeMenos } from "@/componentes/icones/IconeMenos";
import { IconeMenu } from "@/componentes/icones/IconeMenu";
import { IconeRecomecar } from "@/componentes/icones/IconeRecomecar";
import { IconeVisto } from "@/componentes/icones/IconeVisto";
import { IconeVoltar } from "@/componentes/icones/IconeVoltar";
import { VitrineGuia } from "./VitrineGuia";
import { VitrineV04 } from "./VitrineV04";

const TOKENS: { grupo: string; nomes: string[] }[] = [
  { grupo: "Papel", nomes: ["papel", "grade", "grade-suave", "folha", "pauta", "margem"] },
  { grupo: "Tinta e lápis", nomes: ["tinta", "tinta-suave", "grafite", "grafite-claro"] },
  { grupo: "Caneta azul", nomes: ["caneta", "caneta-escura", "caneta-clara", "caneta-palida"] },
  { grupo: "Marca-texto, bilhete", nomes: ["marca-texto", "marca-texto-palido", "bilhete"] },
  { grupo: "Acertou e ainda não", nomes: ["verde", "verde-tinta", "verde-escuro", "verde-palido", "vermelho", "vermelho-claro", "vermelho-palido", "vermelho-nevoa", "veu"] },
  { grupo: "Materiais", nomes: ["pao", "pao-miolo", "saca", "madeira", "palha", "agua", "agua-clara"] },
  { grupo: "Joias", nomes: ["granada", "safira", "ametista", "turmalina"] },
];

const MATERIAIS: { nome: string; como: string; significa: string }[] = [
  { nome: "Lápis", como: "Traço grafite, preenchimento quase branco, etiqueta tracejada", significa: "Ainda não: em projeto, não avaliado, lugar vazio" },
  { nome: "Tinta", como: "Contorno escuro, cor chapada", significa: "Existe e funciona" },
  { nome: "Caneta azul", como: "Preenchimento, traço ou letra azul", significa: "O que o jogador mexe e o que ele fez" },
  { nome: "Marca-texto", como: "Faixa amarela atrás, inclinada", significa: "Funcionou, resultado, destaque" },
  { nome: "Vermelho", como: "Selo com bolinha, borda e névoa; traço de lápis", significa: "Ainda não, por um instante: some no gesto seguinte. Nunca texto vermelho, nunca X" },
  { nome: "Verde", como: "Selo com visto, borda da máquina, etiqueta", significa: "Acertou, com o que ficou certo; e dominado" },
];

const EXPRESSOES: ExpressaoNonio[] = ["neutro", "atento", "medindo", "duvida", "satisfeito", "quieto"];
const RECEPTORES: FormaReceptor[] = ["carroca", "mesa", "cesto", "casa", "prato"];

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="ficha flex flex-col gap-4 p-4">
      <h2 className="letra-mao m-0 text-[28px] text-tinta">{titulo}</h2>
      {children}
    </section>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <p className="m-0 text-[13px] font-semibold text-tinta-suave">{children}</p>;
}

export function Vitrine() {
  const [lote, setLote] = useState(3);
  const [partes, setPartes] = useState(4);
  const [aberta, setAberta] = useState(true);
  return (
    <main data-pronto="sim" data-tela="lab-vitrine" className="min-h-dvh pb-16">
      <CabecalhoLugar voltar={{ href: "/lab", rotulo: "Laboratório" }} lugar="Laboratório" titulo="Vitrine da identidade" />
      <div className="area-segura mx-auto flex w-full max-w-[880px] flex-col gap-6 pt-5">
        <header className="flex flex-col gap-1">
          <Marca tamanho={26} />
          <p className="m-0 text-[15px] font-medium text-tinta-suave">Quadriculado: o jogo é um caderno de matemática. O que ainda não foi feito está a lápis; o que existe e funciona, a caneta.</p>
          <p className="m-0 text-[13px] font-semibold text-tinta-suave">Referência aprovada: docs/referencia-visual/</p>
        </header>

        <Secao titulo="Materiais">
          <ul className="m-0 grid grid-cols-1 gap-3 p-0 md:grid-cols-2">
            {MATERIAIS.map((m) => (
              <li key={m.nome} className="caixa list-none p-3">
                <p className="m-0 text-[16px] font-extrabold">{m.nome}</p>
                <p className="m-0 text-[14px] font-medium">{m.significa}</p>
                <p className="m-0 text-[13px] font-medium text-tinta-suave">{m.como}</p>
              </li>
            ))}
          </ul>
          <div className="ficha-quadriculada p-2 shadow-none">
            <svg viewBox="0 0 400 92" className="traco-fixo block w-full" role="img" aria-label="O mesmo desenho a lápis e a tinta; passar a caneta.">
              <g transform="translate(-40 -220)">
                <DesenhoContrapeso lapis />
              </g>
              <g transform="translate(92 -220)">
                <DesenhoContrapeso lapis={false} />
              </g>
              <g transform="translate(224 -220)">
                <PassarACaneta feito={aberta}>
                  <DesenhoContrapeso lapis={false} />
                </PassarACaneta>
              </g>
            </svg>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Sub>A lápis · a tinta · passar a caneta (380 ms):</Sub>
            <button type="button" className="botao-secundario" onClick={() => setAberta((v) => !v)}>
              {aberta ? "Voltar ao lápis" : "Passar a caneta"}
            </button>
          </div>
        </Secao>

        <Secao titulo="Tokens">
          {TOKENS.map((g) => (
            <div key={g.grupo} className="flex flex-col gap-2">
              <Sub>{g.grupo}</Sub>
              <div className="flex flex-wrap gap-3">
                {g.nomes.map((n) => (
                  <div key={n} className="flex w-[92px] flex-col gap-1">
                    <span className="block h-11 w-full rounded-[10px] border-2 border-contorno" style={{ background: `var(--${n})` }} />
                    <span className="text-[12px] font-semibold text-tinta-suave">{n}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Secao>

        <Secao titulo="Letra">
          <div className="flex flex-col gap-2">
            <p className="m-0 text-[30px] font-extrabold leading-tight">Rubik 800: títulos e números</p>
            <p className="m-0 text-[18px] font-bold">Rubik 700: botões</p>
            <p className="m-0 text-[15px] font-semibold">Rubik 600: rótulos</p>
            <p className="m-0 text-[16px] font-medium">Rubik 500: texto corrido. Três broas, quatro mesas. Dá para repartir <span className="grifo">sem deixar nada</span> na esteira?</p>
            <p className="m-0 text-[24px] font-extrabold tracking-[0.05em]">0 1 2 3 4 5 6 7 8 9</p>
            <p className="letra-mao m-0 text-[26px]">Caveat 700: anotações curtas, nunca menos de 19 px</p>
            <p className="letra-mao m-0 text-[24px] text-verde-escuro">feita!</p>
          </div>
        </Secao>

        <Secao titulo="Receitas">
          <Sub>Botões: principal, secundário, discreto, desabilitado (a lápis)</Sub>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="botao-principal">
              Repartir
            </button>
            <button type="button" className="botao-secundario">
              Fechar a partilha
            </button>
            <button type="button" className="botao-discreto">
              <IconeDesfazer />
              Desfazer
            </button>
            <button type="button" className="botao-principal" disabled>
              Ainda não
            </button>
            <button type="button" className="botao-icone" aria-label="Voltar">
              <IconeVoltar />
            </button>
          </div>
          <Sub>Opções e passo a passo de valor</Sub>
          <div className="flex flex-wrap items-center gap-4">
            <div className="opcoes w-[220px]" role="radiogroup" aria-label="Cortar em">
              {[2, 3, 4, 8].map((p) => (
                <button key={p} type="button" role="radio" aria-checked={partes === p} className="opcao" onClick={() => setPartes(p)}>
                  {p}
                </button>
              ))}
            </div>
            <Seletor rotulo="Lote" valor={lote} minimo={1} maximo={12} onMudar={setLote} />
          </div>
          <Sub>Etiquetas de lugar, fila de lugares, marca-texto, contador de passo</Sub>
          <div className="flex flex-wrap items-center gap-3">
            <span className="etiqueta-lugar text-[17px] font-extrabold">A Partilha</span>
            <span className="etiqueta-lugar" data-material="lapis">
              Pátio dos Sinais
            </span>
            <span className="etiqueta-nav" aria-current="page">
              Mapa
            </span>
            <span className="etiqueta-nav">Caderno</span>
            <span className="etiqueta-nav" data-material="lapis">
              Museu
            </span>
            <span className="marca-texto text-[13px] font-bold">3 de 5 missões</span>
            <span className="contador-passo">3/6</span>
          </div>
          <Sub>Etiquetas de estado</Sub>
          <div className="flex flex-wrap items-center gap-2.5">
            {(["nao_avaliado", "em_aprendizagem", "dominado", "consolidado", "pede_ajuste", "em_projeto"] as const).map((e) => (
              <EtiquetaEstado key={e} estado={e} />
            ))}
          </div>
          <Sub>Balão do Nônio, ficha da Dália, tira da máquina</Sub>
          <BalaoNonio texto="Ainda tem pão na esteira. Cabe mais uma volta?" />
          <FalaDalia texto="Três broas, quatro mesas. Todas iguais, e nada de pão no chão." />
          <div className="flex flex-col gap-2">
            <TiraMensagem texto="Volta: 1 pedaço de 1/4 em cada mesa aberta." />
            <TiraMensagem texto="Engasgou: um lote de 8 em 4 bicas pede 32; há 24." tom="atencao" />
            <TiraMensagem texto="Partilha fechada." tom="feito" />
          </div>
          <Sub>Ficha de missão e cartão de continuar</Sub>
          <div className="flex max-w-[420px] items-center gap-3 rounded-xl border-2 border-contorno bg-folha p-2.5">
            <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[10px] border-2 border-contorno bg-marca-texto-palido">
              <MiniaturaMissao numero={4} tamanho={30} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[12px] font-semibold text-tinta-suave">Missão 3</p>
              <p className="m-0 text-[15px] font-extrabold leading-tight">Sobrou</p>
            </div>
            <span className="rotate-[-4deg] font-mao text-[22px] font-bold text-verde-escuro">feita!</span>
          </div>
          <div className="ficha flex max-w-[420px] items-center gap-3 p-3">
            <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-xl border-2 border-contorno bg-marca-texto-palido">
              <MiniaturaMissao numero={4} tamanho={36} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[12px] font-semibold text-tinta-suave">Continuar · Missão 4</p>
              <p className="m-0 text-[16px] font-extrabold leading-tight">O pão não é saca</p>
            </div>
            <button type="button" className="botao-principal px-4 text-[16px]">
              Jogar
              <IconeAvancar />
            </button>
          </div>
          <Sub>Ícones (um por arquivo)</Sub>
          <div className="flex flex-wrap items-center gap-4 text-tinta">
            <IconeVoltar />
            <IconeAvancar />
            <IconeMenu />
            <IconeDesfazer />
            <IconeRecomecar />
            <IconeVisto />
            <IconeChave />
            <IconeMais />
            <IconeMenos />
            <IconeFechar />
            <IconeCadeado />
            <IconeJoia />
          </div>
        </Secao>

        <Secao titulo="Kit de desenho">
          <div className="ficha-quadriculada p-2 shadow-none">
            <svg viewBox="0 0 400 300" className="traco-fixo block w-full" role="img" aria-label="Kit de desenho">
              <Engrenagem x={34} y={36} r={20} girando />
              <Esteira id="vitrine-esteira" x0={70} x1={250} y={28} />
              <Trilho x0={270} x1={390} y={22} />
              <Bica cx={300} y={27} />
              <g className="a-lapis">
                <Bica cx={350} y={27} />
              </g>
              <Medidor x={20} y={84} largura={10} altura={80} fracao={0.6} marcas={[0, 0.25, 0.5, 0.75, 1]} teto={0.8} />
              <FaixaMarcaTexto x={50} y={92} largura={110} altura={18} cresce />
              <text x={56} y={106} fontSize={13} fontWeight={700} fill="var(--tinta)">
                marca-texto
              </text>
              <ElipseMarcaTexto cx={250} cy={120} rx={70} ry={14} />
              <Anotacao x={190} y={124}>
                sobram <NumeroAnotado tamanho={17}>4</NumeroAnotado> pedaços
              </Anotacao>
              <SetaCurva de={[330, 110]} para={[360, 140]} />
              <CirculoVermelho cx={90} cy={200} rx={50} ry={32} semente={2} />
              <text x={90} y={204} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--tinta)">
                olhe aqui
              </text>
              <Chave x1={170} x2={250} y={196} />
              <NumeroSvg valor={racional(3, 4)} x={210} y={172} tamanho={18} cor="var(--caneta)" peso={700} />
              <Rabisco tipo="mais" x={290} y={190} />
              <Rabisco tipo="dividir" x={330} y={190} />
              <Rabisco tipo="triangulo" x={370} y={190} />
              <NumeroSvg valor={racional(2, 4)} x={300} y={262} tamanho={18} escalaFracao={1} />
              <NumeroSvg valor={racional(5, 4)} x={360} y={262} tamanho={18} escalaFracao={1} />
            </svg>
          </div>
          <Sub>Engrenagem, esteira, trilho com bicas (aberta a tinta, fechada a lápis), medidor, marca-texto, anotação a caneta, setinha, círculo a lápis vermelho, chave de cota, rabiscos de margem, números exatos.</Sub>
        </Secao>

        <Secao titulo="Peças e receptores">
          <div className="ficha-quadriculada p-2 shadow-none">
            <svg viewBox="0 0 400 140" className="traco-fixo block w-full" role="img" aria-label="Peças e receptores">
              <Saco x={24} y={34} r={14} />
              <Unidade forma="broa" x={70} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1), quantidade: 1 }])[0]} />
              <Unidade forma="broa" x={122} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1, 4), quantidade: 3 }])[0]} />
              <Unidade forma="pizza" x={174} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1, 8), quantidade: 6 }])[0]} />
              <Unidade forma="pao" x={226} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1), quantidade: 1 }])[0]} />
              <Unidade forma="pao" x={278} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1, 2), quantidade: 1 }, { tamanho: racional(1, 10), quantidade: 1 }])[0]} />
              <Unidade forma="tonel" x={330} y={34} r={20} unidade={comporUnidades([{ tamanho: racional(1, 5), quantidade: 3 }])[0]} />
              <Unidade forma="tonel" x={376} y={34} r={16} unidade={comporUnidades([{ tamanho: racional(1), quantidade: 1 }])[0]} />
              {RECEPTORES.map((f, i) => (
                <Receptor key={f} forma={f} cx={44 + i * 78} y={92} largura={72} />
              ))}
            </svg>
          </div>
          <Sub>A mesma lógica nas cinco peles: sacas e carroças, broas e mesas, tonéis e casas, pães e cestos, pizzas e amigos. O lugar vazio de uma peça fica a lápis.</Sub>
        </Secao>

        <Secao titulo="Distritos">
          <div className="ficha-quadriculada p-2 shadow-none">
            <svg viewBox="40 370 330 150" className="traco-fixo block w-full" role="img" aria-label="A Partilha desenhada a caneta">
              <DesenhoPartilha />
            </svg>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-contorno bg-marca-texto-palido">
                <MiniaturaMissao numero={n} tamanho={40} />
              </div>
            ))}
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border-2 border-dashed border-grafite bg-folha">
              <MiniaturaMissao numero={5} tamanho={40} lapis />
            </div>
          </div>
        </Secao>

        <Secao titulo="Nônio">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {EXPRESSOES.map((e) => (
              <div key={e} className="flex flex-col items-center gap-1">
                <Nonio expressao={e} tamanho={84} />
                <span className="text-[13px] font-semibold text-tinta-suave">{e}</span>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-4">
            <Nonio tamanho={34} pes={false} rotulo="Nônio pequeno" />
            <Nonio tamanho={60} rotulo="Nônio médio" />
            <Nonio expressao="satisfeito" tamanho={150} rotulo="Nônio grande" />
          </div>
        </Secao>

        <VitrineGuia Secao={Secao} />

        <VitrineV04 Secao={Secao} />

        <Secao titulo="Joias e estágios">
          <svg viewBox="0 0 300 300" className="traco-fixo block w-full max-w-md" aria-label="Quatro joias em quatro estágios" role="img">
            {JOIAS.map((j, l) => [0, 1, 2, 3].map((e) => <Gema key={`${j.id}-${e}`} x={40 + e * 72} y={40 + l * 72} r={24} estagio={e as 0 | 1 | 2 | 3} base={j.cor.base} luz={j.cor.luz} lapis={l === 3 && e > 1} />))}
          </svg>
          <Sub>A última joia mostra os dois estágios ainda não alcançados, a lápis.</Sub>
        </Secao>

        <FolhaPautada titulo="Notação" margem={<NotaDalia>O traço é uma divisão: 3 ÷ 4 = 3/4.</NotaDalia>} className="rounded-[16px] shadow-[0_4px_0_var(--sombra)]">
          <div className="flex flex-col gap-[14px] pt-[14px]">
            <div className="quadro-notacao self-start">
              <BlocoNotacao linhas={["26 ÷ 4 = 6, resto 2", "26 = 4 × 6 + 2"]} />
            </div>
            <LinhaNotacao texto="5 ÷ 4 = 1 1/4 = 5/4" tamanho="media" />
            <p className="m-0 text-[24px] font-extrabold">
              <Fracao n={3} d={4} /> · <Numero valor={racional(5, 4)} /> · <Numero valor={racional(6)} />
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="lacuna">{" "}</span>
              <span className="lacuna lacuna-preenchida">24</span>
              <button type="button" className="opcao ficha-cota min-w-[52px] text-[19px] font-extrabold" aria-pressed="false">
                6
              </button>
              <button type="button" className="opcao ficha-cota min-w-[52px] text-[19px] font-extrabold" aria-pressed="true">
                4
              </button>
            </div>
          </div>
        </FolhaPautada>
      </div>
    </main>
  );
}
