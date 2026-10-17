/**
 * Exemplo mínimo de cena da Rua (docs/AUTORIA.md). SÓ DADOS. Fica fora do catálogo, mas passa
 * pelas mesmas checagens. Para uma cena de verdade, copie, troque, e registre em atividades.ts.
 */
import type { Atividade, Entrada } from "@/nucleo/missoes/tipos";

const SEGUIR: Entrada = { tipo: "seguir" };

export const CENA_MINIMA: Atividade = {
  id: "rua.doze-figurinhas",
  tipo: "cena",
  distrito: "rua",
  titulo: "Doze figurinhas, três irmãos",
  ideia: "dividir repartindo, na vida",
  categoria: "aplicacao-direta",
  conceitos: ["div.partilha"],
  passos: [
    {
      id: "cena",
      tipo: "narrativa",
      fase: "problema",
      pedido: "Domingo, na Rua.",
      instrucao: "Leia a cena e reparta.",
      falas: [{ quem: "dalia", texto: "Doze figurinhas repetidas, três irmãos. Cada um quer o mesmo tanto." }],
      botao: "Repartir",
    },
    {
      id: "repartir",
      tipo: "operar",
      fase: "aplicacao",
      pedido: "12 figurinhas, 3 irmãos.",
      instrucao: "Reparta as 12 figurinhas entre os 3 irmãos.",
      maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: 12 }, bicas: { quantidade: 3, ajustavel: false }, maoLivre: false } },
      objetivo: { validador: "partilha.fechada" },
      resolucao: [{ tipo: "lote", valor: 4 }, { tipo: "repartir" }],
      dicas: [
        { texto: "Todos param na mesma altura, e nada sobra.", alvo: "bicas" },
        { texto: "Uma volta de {lote} em {abertas} pede {pedido}; há {ha}." },
        { texto: "Com outros números: 6 figurinhas para 2 irmãos dão 3 para cada." },
      ],
      equivocos: ["lote-maior-que-cabe", "parou-cedo"],
      evidencias: [{ conceito: "div.partilha", tipo: "transferencia" }],
    },
  ],
  solucoesDeTeste: [{ nome: "lote 4", modo: "guiada", entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 4 } }, { tipo: "maquina", acao: { tipo: "repartir" } }, { tipo: "fechar" }, SEGUIR] }],
  sabotagens: [{ nome: "lote 5 pede 15", modo: "guiada", entradas: [SEGUIR, { tipo: "maquina", acao: { tipo: "lote", valor: 5 } }, { tipo: "maquina", acao: { tipo: "repartir" } }], equivoco: "lote-maior-que-cabe" }],
};
