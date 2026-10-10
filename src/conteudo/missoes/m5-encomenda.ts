/**
 * Missão 5 — Encomenda sem manual (aplicação, sem dica automática). SÓ DADOS.
 * Fecha o Arco 1: A Partilha volta a caneta e a Joia do Ábaco é encontrada.
 */
import type { ConfigBancada } from "@/nucleo/maquinas/bancada/tipos";
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";
import { CORTAR_TODAS, FATIADOR_PADARIA, FECHAR, LOTE_2, LOTE_3, LOTE_6, REPARTIR, SEGUIR } from "./comum";

const TRES: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 3 },
  bicas: { quantidade: 4, ajustavel: false },
  fatiador: FATIADOR_PADARIA,
};

const FORNO: ConfigBancada = {
  pele: "broas-mesas",
  pecas: { quantidade: 1 },
  carga: { minimo: 1, maximo: 6 },
  bicas: { quantidade: 3, ajustavel: false },
  fatiador: { partes: [2, 3, 4, 6], denominadorMaximo: 6 },
};

const PARTES_2: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 2 } };
const PARTES_3: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 3 } };
const PARTES_4: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 4 } };
const PARTES_8: Entrada = { tipo: "maquina", acao: { tipo: "partes", valor: 8 } };
const PILHA_MEIO: Entrada = { tipo: "maquina", acao: { tipo: "pilha", tamanho: "1/2" } };

const QUARTOS: Entrada[] = [PARTES_4, CORTAR_TODAS, LOTE_3, REPARTIR, FECHAR];
const OITAVOS: Entrada[] = [PARTES_8, CORTAR_TODAS, LOTE_6, REPARTIR, FECHAR];
/** Metade e um quarto: só pedaços de numerador 1, sem repetir. */
const MEIO_E_QUARTO: Entrada[] = [PARTES_2, CORTAR_TODAS, REPARTIR, PILHA_MEIO, PARTES_2, CORTAR_TODAS, REPARTIR, FECHAR];

const FORNO_OK: Entrada[] = [{ tipo: "maquina", acao: { tipo: "carga", quantidade: 2 } }, PARTES_3, CORTAR_TODAS, LOTE_2, REPARTIR, FECHAR, SEGUIR];

const FIM: Entrada[] = [SEGUIR, SEGUIR];

export const MISSAO_5: Atividade = {
  id: "partilha.arco1.encomenda",
  tipo: "missao",
  distrito: "partilha",
  arco: "partilha.arco1",
  numero: 5,
  titulo: "Encomenda sem manual",
  ideia: "aplicação, sem dica automática",
  conceitos: ["fra.parte", "fra.quociente"],
  joia: "abaco",
  passos: [
    {
      id: "pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Leia a encomenda.",
      falas: [
        { quem: "dalia", texto: "Encomenda do outro lado do vale, e desta vez não tem manual nenhum. Só o pedido." },
        { quem: "dalia", texto: "O Nônio fica quieto. Se precisar, chame: ele mede, não resolve." },
      ],
      botao: "Ler o pedido",
    },
    {
      id: "dois-jeitos",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "3 broas, 4 mesas, de dois jeitos.",
      maquina: { config: TRES },
      objetivo: { validador: "partilha.solucoes-distintas", params: { n: 2 } },
      resolucao: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 3 }, { tipo: "repartir" }],
      alternativas: [[{ tipo: "partes", valor: 8 }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: 6 }, { tipo: "repartir" }]],
      marcaUnitaria: "unitarias-sem-repetir",
      dicas: [
        { texto: "Dois jeitos contam como diferentes quando os pedaços de cada mesa são diferentes.", alvo: "fatiador" },
        { texto: "Jeitos aceitos até agora: {feitas}. Medidores iguais, pedaços diferentes, vale." },
        {
          texto: "Com outros números: 1 broa para 2 mesas sai em metades, ou em quartos (dois para cada).",
          caso: {
            maquina: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 2, ajustavel: false }, fatiador: FATIADOR_PADARIA },
            acoes: [{ tipo: "partes", valor: 4 }, { tipo: "fatiar", quantidade: 1 }, { tipo: "lote", valor: 2 }, { tipo: "repartir" }],
          },
        },
      ],
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      evidencias: [{ conceito: "fra.parte", tipo: "aplicacao" }],
      aoConcluir: [{ quem: "dalia", texto: "Medidores na mesma altura, pedaços diferentes. Anoto isso para pensar depois." }],
    },
    {
      id: "forno",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "3 mesas com 2/3 cada: quantas broas?",
      falas: [{ quem: "dalia", texto: "Bilhete do forno: cada uma das três mesas recebeu dois terços de broa e não sobrou nada. Quantas broas saíram? Mostre na máquina." }],
      maquina: { config: FORNO },
      objetivo: { validador: "partilha.carga-exata", params: { carga: "2/3" } },
      resolucao: [
        { tipo: "carga", quantidade: 2 },
        { tipo: "partes", valor: 3 },
        { tipo: "fatiar", quantidade: "todas" },
        { tipo: "lote", valor: 2 },
        { tipo: "repartir" },
      ],
      dicas: [
        { texto: "Escolha quantas broas vão na esteira antes de cortar.", alvo: "esteira" },
        { texto: "Na esteira há {total}; cada mesa tem {cada}." },
        { texto: "Com outros números: 4 mesas com 1/2 cada pedem 2 broas." },
      ],
      equivocos: ["corte-que-nao-fecha"],
      evidencias: [{ conceito: "fra.quociente", tipo: "aplicacao" }],
      aoConcluir: [{ quem: "dalia", texto: "Duas broas. O forno não mentiu." }],
    },
    {
      id: "registro",
      tipo: "registro",
      fase: "formalizacao",
      pedido: "Guarde a página no Caderno.",
      pagina: {
        id: "partilha.arco1.encomenda",
        titulo: "Encomenda sem manual",
        frase: "Três broas para quatro mesas, de dois jeitos: medidores na mesma altura. Duas broas para três mesas dão dois terços.",
        notacao: ["3 ÷ 4 = 3/4", "2 ÷ 3 = 2/3"],
        notas: ["Quartos ou oitavos, a mesa come o mesmo. O Nônio diz que isso tem nome; fica para outro dia."],
      },
    },
    {
      id: "acendeu",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A Partilha voltou a caneta.",
      falas: [
        { quem: "dalia", texto: "Olha o mapa: a Partilha está a caneta de novo. Fazia trinta anos." },
        { quem: "nonio", texto: "Achei isto no fundo da bandeja da sobra. Uma joia bruta. Relógios usam joias nos mancais para girar com menos atrito." },
      ],
      botao: "Guardar a joia",
    },
  ],
  solucoesDeTeste: [
    { nome: "quartos e oitavos", modo: "guiada", entradas: [SEGUIR, ...QUARTOS, ...OITAVOS, SEGUIR, ...FORNO_OK, ...FIM] },
    { nome: "metade e um quarto, depois quartos", modo: "guiada", entradas: [SEGUIR, ...MEIO_E_QUARTO, ...QUARTOS, SEGUIR, ...FORNO_OK, ...FIM] },
    {
      nome: "repetir um jeito não conta",
      modo: "guiada",
      entradas: [SEGUIR, ...QUARTOS, ...QUARTOS, { tipo: "maquina", acao: { tipo: "recomecar" } }, ...OITAVOS, SEGUIR, ...FORNO_OK, ...FIM],
    },
    { nome: "só o registro", modo: "registro", entradas: [SEGUIR] },
  ],
  sabotagens: [
    { nome: "corta as 3 broas em 3 para 4 mesas", modo: "guiada", entradas: [SEGUIR, PARTES_3, CORTAR_TODAS], equivoco: "corte-que-nao-fecha" },
    { nome: "fecha sem repartir nada", modo: "guiada", entradas: [SEGUIR, FECHAR], equivoco: "resto-jogado-fora" },
  ],
};
