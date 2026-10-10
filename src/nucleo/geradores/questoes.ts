/**
 * Gerador de questões com semente e restrições, para a revisita e a sondagem.
 * Cada questão é um passo "prever" comum: a máquina confere com a mesma simulação e o mesmo
 * conferidor das missões. As checagens rodam muitas sementes.
 */
import type { IdConceito } from "../curriculo/curriculo";
import type { TipoEvidencia } from "../dominio/evidencias";
import type { Fala, PassoPrever } from "../missoes/tipos";
import { aleatorio, type Aleatorio } from "./aleatorio";

/** Pares que aparecem nas missões: a revisita usa números novos. */
const JA_USADOS = new Set(["24/4", "30/5", "30/6", "26/4", "27/4", "28/4", "35/7", "42/6", "31/4", "12/3", "14/4", "18/3", "28/7", "23/5", "3/4", "2/3", "5/4", "5/8", "2/5", "3/5", "6/10", "2/4"]);

function novo(a: number, b: number): boolean {
  return !JA_USADOS.has(`${a}/${b}`);
}

function sortearAte<T>(r: Aleatorio, gerar: () => T, aceitar: (x: T) => boolean): T {
  for (let i = 0; i < 200; i++) {
    const x = gerar();
    if (aceitar(x)) return x;
  }
  return gerar();
}

const FALA_REVISITA: Fala = { quem: "nonio", texto: "Um dia depois, com números novos. A máquina confere." };
const FALA_SONDAGEM: Fala = { quem: "nonio", texto: "Uma pergunta só. Responda; a máquina confere." };

export const CONCEITOS_COM_GERADOR: readonly IdConceito[] = ["div.partilha", "div.medida", "div.resto", "fra.quociente", "fra.parte"];

export function gerarQuestao(conceito: IdConceito, semente: number, tipo: TipoEvidencia = "revisita", id = `q-${conceito}`): PassoPrever {
  const r = aleatorio(semente);
  const ev = [{ conceito, tipo }];
  const fase = tipo === "revisita" ? "retencao" : "aplicacao";
  const fala = tipo === "revisita" ? FALA_REVISITA : FALA_SONDAGEM;
  switch (conceito) {
    case "div.partilha": {
      const { b, k } = sortearAte(r, () => ({ b: r.inteiro(3, 6), k: r.inteiro(3, 8) }), ({ b, k }) => novo(b * k, b));
      const n = b * k;
      return {
        id,
        tipo: "prever",
        fase,
        pedido: `${n} sacas, ${b} carroças, todas iguais.`,
        falas: [fala],
        maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: n }, bicas: { quantidade: b, ajustavel: false } } },
        pergunta: `${n} sacas entre ${b} carroças, todas iguais. Quanto em cada?`,
        resposta: { tipo: "numero", minimo: 0, maximo: n, unidade: "sacas" },
        medida: "carga-por-bica",
        demonstracao: [{ tipo: "lote", valor: k }, { tipo: "repartir" }],
        explicacao: `${n} ÷ ${b} = ${k}.`,
        dicas: [
          { texto: "Conte as carroças abertas.", alvo: "bicas" },
          { texto: `Uma volta de 1 em cada usa ${b} sacas.` },
          { texto: "Com outros números: 10 sacas entre 2 carroças dão 5 em cada." },
        ],
        evidencias: ev,
      };
    }
    case "div.medida": {
      const { t, k } = sortearAte(r, () => ({ t: r.inteiro(3, 8), k: r.inteiro(3, 7) }), ({ t, k }) => novo(t * k, t) && t !== k);
      const n = t * k;
      return {
        id,
        tipo: "prever",
        fase,
        pedido: `${n} sacas, ${t} em cada carroça.`,
        falas: [fala],
        maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: n }, bicas: { quantidade: 2, ajustavel: true, vagas: 8 } } },
        pergunta: `${n} sacas, exatamente ${t} em cada carroça. Quantas carroças?`,
        resposta: { tipo: "numero", minimo: 0, maximo: 12, unidade: "carroças" },
        medida: "bicas-em-uso",
        demonstracao: [{ tipo: "bicas", abertas: k }, { tipo: "lote", valor: t }, { tipo: "repartir" }],
        explicacao: `${n} ÷ ${t} = ${k}: cabem ${k} grupos de ${t}.`,
        dicas: [
          { texto: "Quantos grupos do mesmo tamanho cabem no total?", alvo: "pilha" },
          { texto: `Cada carroça leva ${t}.` },
          { texto: "Com outros números: 12 sacas de 3 em 3 pedem 4 carroças." },
        ],
        evidencias: ev,
      };
    }
    case "div.resto": {
      const transporte = r.proximo() < 0.5;
      const { b, q, resto } = sortearAte(
        r,
        () => {
          const b = r.inteiro(3, 6);
          return { b, q: r.inteiro(3, 7), resto: r.inteiro(1, b - 1) };
        },
        ({ b, q, resto }) => b !== q && novo(b * q + resto, b),
      );
      const n = b * q + resto;
      if (transporte) {
        // Teto de b por carroça: q carroças cheias e uma com o resto.
        const t = b;
        return {
          id,
          tipo: "prever",
          fase,
          pedido: `${n} sacas, até ${t} por carroça, tudo sai.`,
          falas: [fala],
          maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: n }, bicas: { quantidade: q, ajustavel: true, vagas: q + 1 }, teto: t } },
          pergunta: `${n} sacas precisam sair todas, até ${t} por carroça. Quantas carroças?`,
          resposta: { tipo: "numero", minimo: 0, maximo: 20, unidade: "carroças" },
          medida: "bicas-em-uso",
          demonstracao: [
            { tipo: "lote", valor: t },
            { tipo: "repartir" },
            { tipo: "bicas", abertas: 0 },
            { tipo: "bica", indice: q },
            { tipo: "lote", valor: resto },
            { tipo: "repartir" },
          ],
          respostasEquivoco: [{ resposta: String(q), equivoco: "resto-jogado-fora" }],
          explicacao: `${q} carroças cheias e uma com ${resto}: ${q + 1}. Aqui o resto vira mais uma carroça.`,
          dicas: [
            { texto: "O que sobra também precisa sair.", alvo: "esteira" },
            { texto: `${q} carroças cheias levam ${q * t}.` },
            { texto: "Com outros números: 14 sacas, até 4 por carroça, pedem 4 carroças." },
          ],
          evidencias: ev,
        };
      }
      return {
        id,
        tipo: "prever",
        fase,
        pedido: `${n} sacas, ${b} carroças: quanto sobra?`,
        falas: [fala],
        maquina: { config: { pele: "sacas-carrocas", pecas: { quantidade: n }, bicas: { quantidade: b, ajustavel: false } } },
        pergunta: `${n} sacas entre ${b} carroças, todas iguais. Quanto sobra na bandeja?`,
        resposta: { tipo: "numero", minimo: 0, maximo: n, unidade: "sacas" },
        medida: "sobra",
        demonstracao: [{ tipo: "lote", valor: q }, { tipo: "repartir" }],
        respostasEquivoco: [{ resposta: "0", equivoco: "resto-jogado-fora" }],
        explicacao: `${n} ÷ ${b} = ${q}, resto ${resto}.`,
        dicas: [
          { texto: "Quantas voltas inteiras cabem?", alvo: "pilha" },
          { texto: `${q} em cada usa ${q * b}.` },
          { texto: "Com outros números: 11 sacas entre 3 carroças deixam 2 na bandeja." },
        ],
        evidencias: ev,
      };
    }
    case "fra.quociente": {
      const { a, b } = sortearAte(r, () => ({ a: r.inteiro(1, 6), b: r.inteiro(3, 8) }), ({ a, b }) => a < b && novo(a, b) && b !== 7);
      return {
        id,
        tipo: "prever",
        fase,
        pedido: `${a} ${a === 1 ? "broa" : "broas"}, ${b} mesas: quanto em cada?`,
        falas: [fala],
        maquina: { config: { pele: "broas-mesas", pecas: { quantidade: a }, bicas: { quantidade: b, ajustavel: false }, fatiador: { partes: [b], denominadorMaximo: b } } },
        pergunta: `${a} ${a === 1 ? "broa" : "broas"} para ${b} mesas. Quanto de broa cada mesa recebe?`,
        resposta: { tipo: "fracao", maximo: 10 },
        medida: "carga-por-bica",
        aceitaEquivalente: true,
        demonstracao: [{ tipo: "partes", valor: b }, { tipo: "fatiar", quantidade: "todas" }, { tipo: "lote", valor: a }, { tipo: "repartir" }],
        explicacao: `${a} ÷ ${b} = ${a}/${b}.`,
        dicas: [
          { texto: "O traço da fração é uma divisão.", alvo: "fatiador" },
          { texto: "Em cima, o que se reparte; embaixo, entre quantos." },
          { texto: "Com outros números: 3 broas para 4 mesas dão 3/4." },
        ],
        evidencias: ev,
      };
    }
    default: {
      // fra.parte: nomear o pedaço.
      const p = r.escolher([3, 4, 5, 6, 8]);
      const pedacos = r.inteiro(1, p - 1);
      return {
        id,
        tipo: "prever",
        fase,
        pedido: `Uma broa em ${p}; a mesa recebe ${pedacos}.`,
        falas: [fala],
        maquina: { config: { pele: "broas-mesas", pecas: { quantidade: 1 }, bicas: { quantidade: 1, ajustavel: false }, fatiador: { partes: [p], denominadorMaximo: p } } },
        pergunta: `Uma broa cortada em ${p} partes iguais. A mesa recebe ${pedacos} ${pedacos === 1 ? "pedaço" : "pedaços"}. Quanto de broa ela recebeu?`,
        resposta: { tipo: "fracao", maximo: 10 },
        medida: "carga-por-bica",
        aceitaEquivalente: true,
        demonstracao: [{ tipo: "partes", valor: p }, { tipo: "fatiar", quantidade: 1 }, { tipo: "lote", valor: pedacos }, { tipo: "repartir" }],
        respostasEquivoco: [{ resposta: String(pedacos), equivoco: "conta-pedacos" }],
        explicacao: `Cada pedaço é 1/${p}; ${pedacos} deles são ${pedacos}/${p}.`,
        dicas: [
          { texto: "O denominador diz em quantas partes iguais a broa foi cortada.", alvo: "fatiador" },
          { texto: `Cada pedaço é 1/${p} de broa.` },
          { texto: "Com outros números: 3 pedaços de uma broa cortada em 4 são 3/4." },
        ],
        evidencias: ev,
      };
    }
  }
}

/** A revisita: três perguntas, uma por conceito devido (repetindo conceitos se faltarem). */
export const PREFERENCIA_REVISITA: readonly IdConceito[] = ["div.resto", "fra.quociente", "fra.parte", "div.partilha", "div.medida"];

export function conceitosDaRevisita(devidos: readonly IdConceito[], quantas = 3): IdConceito[] {
  const ordenados = PREFERENCIA_REVISITA.filter((c) => devidos.includes(c));
  if (ordenados.length === 0) return [];
  const saida: IdConceito[] = [];
  for (let i = 0; saida.length < quantas; i++) saida.push(ordenados[i % ordenados.length]);
  return saida;
}
