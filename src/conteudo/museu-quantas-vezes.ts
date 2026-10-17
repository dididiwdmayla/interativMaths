/**
 * Exposição Quantas vezes. SÓ DADOS.
 * Fontes conferidas em 17/10/2026:
 * Dicio, quociente — https://www.dicio.com.br/quociente/
 * Etymonline, quotient — https://www.etymonline.com/word/quotient
 * MacTutor, Earliest Uses of Symbols of Operation — https://mathshistory.st-andrews.ac.uk/Miller/mathsym/operation/
 * MacTutor, Earliest Uses of Symbols for Fractions — https://mathshistory.st-andrews.ac.uk/Miller/mathsym/fractions/
 * Wikipedia, Division sign — https://en.wikipedia.org/wiki/Division_sign
 */
import type { Atividade } from "@/nucleo/missoes/tipos";

export const EXPOSICAO_QUANTAS_VEZES: Atividade = {
  id: "museu.quantas-vezes",
  tipo: "exposicao",
  distrito: "museu",
  titulo: "Quantas vezes",
  ideia: "o quociente e os sinais de divisão",
  conceitos: ["div.medida", "fra.quociente"],
  passos: [
    {
      id: "cena",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Quantas vezes uma carga cabe na outra?",
      instrucao: "Leia a vitrine e vá à bancada.",
      falas: [
        {
          quem: "dalia",
          texto: "São 36 sacas. Cada carroça precisa levar exatamente 9. Quantas carroças chamar?"
        }
      ],
      botao: "Ir à bancada"
    },
    {
      id: "bancada",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "36 sacas, exatamente 9 por carroça.",
      instrucao: "Abra quantas carroças precisar: 9 sacas em cada, nenhuma sobrando.",
      maquina: {
        config: { pele: "sacas-carrocas", pecas: { quantidade: 36 }, bicas: { quantidade: 3, ajustavel: true, vagas: 6 } }
      },
      objetivo: { validador: "partilha.carga-exata", params: { carga: 9 } },
      resolucao: [{ tipo: "bicas", abertas: 4 }, { tipo: "lote", valor: 9 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Cada medidor precisa parar no 9 e a esteira precisa esvaziar." },
        { texto: "Compare a carga total com a carga de uma carroça." },
        { texto: "Com outros números: 20 sacas em grupos de 5 pedem 4 carroças." }
      ],
      equivocos: ["lote-maior-que-cabe"],
      evidencias: [{ conceito: "div.medida", tipo: "transferencia" }]
    },
    {
      id: "previsao",
      tipo: "prever",
      fase: "aplicacao",
      pedido: "Quantas vezes o 9 cabe no 36?",
      instrucao: "Responda quantas vezes o 9 cabe no 36.",
      pergunta: "Quantas vezes o 9 cabe no 36?",
      resposta: { tipo: "numero", minimo: 0, maximo: 6, unidade: "vezes" },
      medida: "bicas-em-uso",
      demonstracao: [],
      respostasEquivoco: [{ resposta: "3", equivoco: "parou-cedo" }],
      explicacao: "36 ÷ 9 = 4. Quociente quer dizer isso: quantas vezes.",
      dicas: [
        { texto: "Cada carroça carregada é um grupo de 9." },
        { texto: "Conte os grupos de 9 que você formou com as 36 sacas." },
        { texto: "Com outros números: 20 ÷ 5 = 4: o 5 cabe 4 vezes no 20." }
      ],
      evidencias: [{ conceito: "fra.quociente", tipo: "transferencia" }]
    },
    {
      id: "placa",
      tipo: "narrativa",
      fase: "retencao",
      pedido: "A legenda da exposição.",
      instrucao: "Leia a legenda e volte ao Museu.",
      falas: [
        {
          quem: "nonio",
          texto: "Você viu isso na Missão 2 antes de saber o nome: dividir é perguntar quantas vezes cabe."
        }
      ],
      botao: "Voltar ao Museu",
      faixas: {
        sabe: [
          "Quociente vem do latim quotiens: quantas vezes.",
          "Em 1659, Johann Rahn usou ÷ para divisão no livro Teutsche Algebra. Antes disso, outros autores usavam o sinal para subtrair.",
          "O traço deitado da fração veio dos matemáticos árabes. Várias fontes o atribuem a al-Hassar, por volta de 1200. Fibonacci foi o primeiro europeu a usá-lo como hoje.",
          "Augustus De Morgan recomendou a barra inclinada (/) em 1845. O traço deitado dava trabalho na tipografia: pedia três linhas de tipos.",
          "A norma internacional ISO 80000-2 recomenda escrever a divisão com a barra ou com o traço, e não com ÷."
        ],
        interpretacao: [
          "A autoria do ÷ é incerta. Há quem a atribua a John Pell, que editou a tradução inglesa do livro de Rahn, publicada em Londres em 1668. Florian Cajori escreveu que não há prova disso.",
          "O nome quantas vezes sugere a divisão pensada como medida. Não sabemos como cada calculista antigo pensava a conta."
        ],
        simplificamos: [
          "Carroças e sacas são um jeito de enxergar a medida; os livros antigos não dividiam assim.",
          "A placa conta só três sinais. Houve outros, como os dois-pontos, que ficam para outra exposição."
        ],
        fontes: [
          "Dicio, quociente — https://www.dicio.com.br/quociente/",
          "Etymonline, quotient — https://www.etymonline.com/word/quotient",
          "MacTutor, Earliest Uses of Symbols of Operation — https://mathshistory.st-andrews.ac.uk/Miller/mathsym/operation/",
          "MacTutor, Earliest Uses of Symbols for Fractions — https://mathshistory.st-andrews.ac.uk/Miller/mathsym/fractions/",
          "Wikipedia, Division sign — https://en.wikipedia.org/wiki/Division_sign"
        ]
      }
    }
  ],
  solucoesDeTeste: [
    {
      nome: "Resolve e responde",
      modo: "guiada",
      entradas: [
        { tipo: "seguir" },
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 4 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 9 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "4" },
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
        { tipo: "maquina", acao: { tipo: "bicas", abertas: 4 } },
        { tipo: "maquina", acao: { tipo: "lote", valor: 9 } },
        { tipo: "maquina", acao: { tipo: "repartir" } },
        { tipo: "fechar" },
        { tipo: "seguir" },
        { tipo: "responder", valor: "3" }
      ],
      equivoco: "parou-cedo"
    }
  ]
};
