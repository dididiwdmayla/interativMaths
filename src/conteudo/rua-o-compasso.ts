/**
 * Transferência com treino próprio: a conta não substitui a prática musical. SÓ DADOS.
 */
import type { Atividade } from "@/nucleo/missoes/tipos";

export const CENA_COMPASSO: Atividade = {
  id: "rua.o-compasso",
  tipo: "cena",
  distrito: "rua",
  titulo: "O compasso",
  ideia: "três compassos repartidos em quatro notas",
  conceitos: ["fra.parte", "fra.quociente"],
  passos: [
    {
      id: "cena",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Três compassos, quatro notas iguais.",
      instrucao: "Leia a troca e reparta os compassos.",
      falas: [
        { quem: "nonio", texto: "Faz de conta: cada broa é um compasso, e cada mesa é uma nota." },
        {
          quem: "dalia",
          texto: "Numa partitura em compasso de quatro tempos, três compassos inteiros viram quatro notas iguais. Quanto do compasso vale cada nota?"
        }
      ],
      botao: "Repartir os compassos"
    },
    {
      id: "bancada",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "3 broas, 4 mesas, todas iguais.",
      instrucao: "Reparta as 3 broas entre as 4 mesas, cortando o que precisar.",
      maquina: {
        config: {
          pele: "broas-mesas",
          pecas: { quantidade: 3 },
          bicas: { quantidade: 4, ajustavel: false },
          fatiador: { partes: [2, 3, 4, 6, 8], denominadorMaximo: 8 }
        }
      },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [
        { tipo: "partes", valor: 4 },
        { tipo: "fatiar", quantidade: "todas" },
        { tipo: "lote", valor: 3 },
        { tipo: "repartir" }
      ],
      dicas: [
        { texto: "As mesas precisam receber a mesma quantidade, sem deixar broa." },
        { texto: "Compare o número de broas com o de mesas antes de escolher o corte." },
        { texto: "Com outros números: 2 broas entre 3 mesas: corte cada broa em 3 e sirva 2 pedaços por mesa." }
      ],
      equivocos: ["corte-que-nao-fecha", "resto-jogado-fora", "parou-cedo"],
      evidencias: [{ conceito: "fra.parte", tipo: "transferencia" }]
    },
    {
      id: "previsao",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Quanto do compasso vale cada nota?",
      instrucao: "Monte com as fichas quanto do compasso vale cada nota.",
      pergunta: "Quanto do compasso vale cada nota?",
      resposta: { tipo: "fracao", maximo: 8 },
      medida: "carga-por-bica",
      demonstracao: [],
      respostasEquivoco: [{ resposta: "4/3", equivoco: "fracao-invertida" }],
      explicacao: "3 ÷ 4 = 3/4 de compasso por nota. Num compasso de quatro tempos, 3/4 do compasso são 3 tempos.",
      dicas: [
        { texto: "O inteiro é um compasso; cada mesa representa uma nota." },
        { texto: "Conte as partes em cada mesa e veja em quantas partes o inteiro foi cortado." },
        { texto: "Com outros números: 2 compassos entre 3 notas dão 2/3 de compasso por nota." }
      ],
      evidencias: [{ conceito: "fra.quociente", tipo: "transferencia" }],
      aceitaEquivalente: true
    },
    {
      id: "fim",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A conta ajuda a ler o ritmo.",
      instrucao: "Leia e volte à Rua.",
      falas: [
        {
          quem: "nonio",
          texto: "Na partitura, essa nota se chama mínima pontuada: três tempos. Saber a conta ajuda a ler o ritmo; tocar no tempo pede treino de música."
        }
      ],
      botao: "Voltar à Rua"
    }
  ],
  solucoesDeTeste: [
    {
      nome: "Resolve e responde",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "partes", valor: 4 } },
        { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 3 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "3/4" },
        { tipo: "seguir" },
        { tipo: "seguir" }
      ]
    },
    {
      nome: "Em oitavos, aceita 6/8",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "partes", valor: 8 } },
        { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 6 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "6/8" },
        { tipo: "seguir" },
        { tipo: "seguir" }
      ]
    }
  ],
  sabotagens: [
    {
      nome: "Responde pela interpretação ainda não confirmada",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "partes", valor: 4 } },
        { tipo: "maquina", acao: { tipo: "fatiar", quantidade: "todas" } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 3 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "4/3" }
      ],
      equivoco: "fracao-invertida"
    }
  ],
  categoria: "transferencia-com-treino"
};
