/**
 * A Rua (Matemática Invisível): onde a conta aparece na vida. SÓ DADOS.
 * As categorias existem para o jogo nunca prometer que estudar um conteúdo melhora, sozinho,
 * desempenho esportivo ou inteligência.
 */
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";

export const CATEGORIAS_RUA = {
  "aplicacao-direta": {
    nome: "aplicação direta",
    explicacao: "A mesma conta, usada do mesmo jeito fora do Engenho.",
  },
  "analogia-conceitual": {
    nome: "analogia conceitual",
    explicacao: "Uma ideia parecida em outro lugar; ajuda a enxergar, não substitui a prática de lá.",
  },
  "transferencia-com-treino": {
    nome: "depende de treino próprio",
    explicacao: "A conta aparece, mas fazer bem aquilo pede treino daquilo. Estudar isto, sozinho, não melhora o resto.",
  },
} as const;

const SEGUIR: Entrada = { tipo: "seguir" };

export const CENA_PIZZAS: Atividade = {
  id: "rua.tres-pizzas",
  tipo: "cena",
  distrito: "rua",
  titulo: "Três pizzas, quatro amigos",
  ideia: "fração como divisão, na mesa",
  categoria: "aplicacao-direta",
  conceitos: ["fra.parte", "fra.quociente"],
  passos: [
    {
      id: "mesa",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Sexta à noite, na Rua.",
      instrucao: "Leia a cena e sirva a mesa.",
      falas: [
        { quem: "dalia", texto: "Três pizzas chegaram já cortadas em oito. Quatro amigos, todo mundo igual." },
        { quem: "nonio", texto: "Aqui a máquina não corta: as fatias já vêm prontas." },
      ],
      botao: "Servir",
    },
    {
      id: "servir",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "24 fatias, 4 pratos, todos iguais.",
      instrucao: "Sirva as 24 fatias em 4 pratos, todos iguais.",
      maquina: {
        config: {
          pele: "pizzas-amigos",
          pecas: { quantidade: 0, pilhas: [{ tamanho: "1/8", quantidade: 24 }] },
          bicas: { quantidade: 4, ajustavel: false },
        },
      },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 6 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Repare nos pratos: todos precisam ficar na mesma altura.", alvo: "bicas" },
        { texto: "Uma volta de {lote} em {abertas} pratos pede {pedido}; há {ha} fatias." },
        { texto: "Com outros números: 12 fatias para 3 pratos dão 4 em cada." },
      ],
      equivocos: ["lote-maior-que-cabe", "parou-cedo"],
      evidencias: [{ conceito: "fra.parte", tipo: "transferencia" }],
      aoConcluir: [{ quem: "dalia", texto: "Seis fatias para cada um. Ninguém olhou torto para o prato do outro." }],
    },
    {
      id: "quanto-comeu",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Quanto de pizza cada um comeu?",
      instrucao: "Monte com as fichas quanto de pizza cada amigo comeu.",
      pergunta: "Cada amigo comeu quanto de pizza? Monte com as fichas.",
      resposta: { tipo: "fracao", maximo: 8 },
      medida: "carga-por-bica",
      aceitaEquivalente: true,
      demonstracao: [],
      respostasEquivoco: [{ resposta: "6", equivoco: "conta-pedacos" }],
      explicacao: "Seis fatias de um oitavo: 6/8, que é o mesmo que 3/4. É a mesma conta da padaria: 3 ÷ 4 = 3/4.",
      dicas: [
        { texto: "Uma fatia é 1/8 de pizza.", alvo: "bica:0" },
        { texto: "Cada prato tem {cada} de pizza." },
        { texto: "Com outros números: 4 fatias de 1/8 são 4/8, que é meia pizza." },
      ],
      evidencias: [{ conceito: "fra.quociente", tipo: "transferencia" }],
    },
    {
      id: "fim",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A conta estava na mesa.",
      instrucao: "Leia e volte à Rua.",
      falas: [{ quem: "nonio", texto: "Aplicação direta: a mesma conta, do mesmo jeito. Seis oitavos ou três quartos, o prato é o mesmo." }],
      botao: "Voltar à Rua",
    },
  ],
  solucoesDeTeste: [
    {
      nome: "seis de uma vez, responde 3/4",
      modo: "guiada",
      entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 6 } }, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "fechar" }, SEGUIR, { tipo: "responder", valor: "3/4" }, SEGUIR, SEGUIR],
    },
    {
      nome: "de 2 em 2, responde 6/8",
      modo: "guiada",
      entradas: [
        SEGUIR,
        { tipo: "maquina", acao: { tipo: "lote", valor: 2 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        SEGUIR,
        { tipo: "responder", valor: "6/8" },
        SEGUIR,
        SEGUIR,
      ],
    },
  ],
  sabotagens: [
    {
      nome: "responde seis (conta as fatias)",
      modo: "guiada",
      entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 6 } }, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "fechar" }, SEGUIR, { tipo: "responder", valor: "6" }],
      equivoco: "conta-pedacos",
    },
  ],
};
