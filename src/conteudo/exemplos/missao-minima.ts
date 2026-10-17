/**
 * Exemplo mínimo de missão numa máquina que existe (docs/AUTORIA.md). SÓ DADOS. Fica fora do
 * catálogo: não aparece no jogo, mas passa pelas mesmas checagens (src/conteudo/atividades.test.ts).
 * Para uma missão de verdade, copie, troque ids e textos, e registre em missoes/index.ts.
 */
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";

const SEGUIR: Entrada = { tipo: "seguir" };

export const MISSAO_MINIMA: Atividade = {
  id: "partilha.arco1.dezoito-sacas",
  tipo: "missao",
  distrito: "partilha",
  arco: "partilha.arco1",
  numero: 6,
  titulo: "Dezoito sacas",
  ideia: "dividir repartindo",
  conceitos: ["div.partilha"],
  passos: [
    {
      id: "pedido",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Leia o pedido da Dália.",
      instrucao: "Leia o pedido da Dália e aceite o serviço.",
      falas: [{ quem: "dalia", texto: "Dezoito sacas, três carroças, todas com a mesma carga." }],
      botao: "Aceitar",
    },
    {
      id: "repartir",
      tipo: "operar",
      fase: "experimentacao",
      pedido: "18 sacas, 3 carroças, todas iguais.",
      instrucao: "Reparta as 18 sacas entre as 3 carroças.",
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 18 }, bicas: { quantidade: 3, ajustavel: false }, maoLivre: false } },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "As carroças param na mesma altura, e a esteira fica vazia.", alvo: "bicas" },
        { texto: "Uma volta de {lote} em {abertas} carroças pede {pedido}; há {ha}." },
        { texto: "Com outros números: 8 sacas em 2 carroças dão 4 em cada." },
      ],
      equivocos: ["lote-maior-que-cabe", "parou-cedo"],
      evidencias: [{ conceito: "div.partilha", tipo: "aplicacao" }],
    },
    {
      id: "registro",
      tipo: "registro",
      fase: "formalizacao",
      pedido: "Guarde a página no Caderno.",
      instrucao: "Guarde a página no Caderno.",
      pagina: { id: "partilha.arco1.dezoito-sacas", titulo: "Dezoito sacas", notacao: ["18 ÷ 3 = 6"], notas: [] },
    },
  ],
  solucoesDeTeste: [
    { nome: "lote 6", modo: "guiada", entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 6 } }, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "fechar" }, SEGUIR, SEGUIR] },
  ],
  sabotagens: [
    { nome: "lote 7 pede 21", modo: "guiada", entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 7 } }, { tipo: "maquina", acao: { tipo: "repartir" } }], equivoco: "lote-maior-que-cabe" },
  ],
};
