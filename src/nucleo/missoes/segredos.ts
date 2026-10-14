/**
 * O que um passo esconde: o valor que o jogador precisa achar sozinho. Nenhum texto que não vem
 * do motor (o gesto, a conversa com IA) pode dizer isso antes de o passo ser vencido.
 *
 * - previsão e aposta: o esperado (e, por valor, todos os equivalentes);
 * - operar: as medidas do estado final da resolução (quanto em cada, em quantas partes cortar,
 *   quantas bicas);
 * - frase: os valores das lacunas ainda vazias;
 * - palpite: o valor que a máquina vai dar.
 * Sai da lista o que já está à vista no enunciado (instrução, pedido, pergunta, bilhete).
 */
import { operarVarias } from "../maquinas/bancada/bancada";
import { medir, type NomeMedida } from "../maquinas/bancada/medidas";
import { comoRacional, compara, igual, type Racional } from "../racional/racional";
import { conferirPrevisao, resolucaoDoPasso, type Execucao } from "./motor";
import type { Passo } from "./tipos";

/** quantidade: um número (em qualquer forma); partes: um corte ("em 4", "em quartos"); opcao: um texto. */
export type TipoSegredo = "quantidade" | "partes" | "opcao";

export interface Segredo {
  readonly tipo: TipoSegredo;
  readonly valor: Racional;
  /** Para opção: o texto da opção certa. */
  readonly texto?: string;
  /** De onde veio (para os testes e o log). */
  readonly origem: string;
}

/** Números que o enunciado já mostra (algarismos, frações e mistos). */
export function numerosVisiveis(texto: string): Racional[] {
  const saida: Racional[] = [];
  const re = /(\d+)\s*\/\s*(\d+)|(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    if (m[1] !== undefined && Number(m[2]) !== 0) saida.push(comoRacional(`${m[1]}/${m[2]}`));
    else if (m[3] !== undefined) saida.push(comoRacional(Number(m[3])));
  }
  return saida;
}

export function textoDoEnunciado(p: Passo): string {
  const partes: string[] = [p.instrucao, p.pedido];
  if (p.tipo === "prever" || p.tipo === "palpite" || p.tipo === "aposta") partes.push(p.pergunta);
  if (p.tipo === "aposta") partes.push(p.aposta);
  if (p.tipo === "operar" && p.conta) partes.push(p.conta);
  return partes.join(" ");
}

function cortesVisiveis(texto: string): number[] {
  const saida: number[] = [];
  const re = /\bem\s+(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) saida.push(Number(m[1]));
  return saida;
}

function unicos(lista: Segredo[]): Segredo[] {
  const vistos = new Set<string>();
  return lista.filter((s) => {
    const k = `${s.tipo}:${s.valor.n}/${s.valor.d}:${s.texto ?? ""}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
}

/** As medidas do estado final da resolução de um passo de máquina. */
function segredosDaResolucao(p: Extract<Passo, { tipo: "operar" | "aposta" }>, e: Execucao): Segredo[] {
  const inicio = e.passo.inicio;
  if (!inicio) return [];
  const final = operarVarias(inicio, resolucaoDoPasso(p, e)).atual;
  const saida: Segredo[] = [];
  const medidas: NomeMedida[] = ["carga-por-bica", "bicas-em-uso"];
  for (const m of medidas) saida.push({ tipo: "quantidade", valor: medir(final, m), origem: m });
  if (final.config.fatiador) {
    const partes = medir(final, "partes");
    if (partes.n > 1) saida.push({ tipo: "partes", valor: partes, origem: "partes" });
  }
  return saida;
}

/** O que o passo esconde agora. Passo vencido não esconde mais nada. */
export function segredos(p: Passo, e: Execucao): Segredo[] {
  const ep = e.passo;
  if (ep.situacao === "vencido" || ep.situacao === "conferindo") return [];
  let lista: Segredo[] = [];
  switch (p.tipo) {
    case "palpite":
      lista = [{ tipo: "quantidade", valor: comoRacional(p.certo), origem: "palpite" }];
      break;
    case "prever": {
      if (!ep.inicio) break;
      const { esperado } = conferirPrevisao(p, ep.inicio);
      if (p.resposta.tipo === "opcoes") {
        const texto = p.resposta.opcoes.find((o) => o.id === esperado)?.texto ?? esperado;
        lista = [{ tipo: "opcao", valor: comoRacional(0), texto, origem: "esperado" }];
      } else {
        lista = [{ tipo: "quantidade", valor: comoRacional(esperado), origem: "esperado" }];
      }
      break;
    }
    case "aposta": {
      const texto = p.resposta.tipo === "opcoes" ? (p.resposta.opcoes.find((o) => o.id === p.esperado)?.texto ?? p.esperado) : p.esperado;
      lista = [{ tipo: "opcao", valor: comoRacional(0), texto, origem: "esperado" }];
      break;
    }
    case "operar":
      lista = segredosDaResolucao(p, e);
      break;
    case "frase": {
      const estado = e.bancada?.atual;
      if (!estado) break;
      lista = p.lacunas.filter((l) => ep.lacunas[l.id] === undefined).map((l) => ({ tipo: "quantidade", valor: medir(estado, l.medida), origem: `lacuna:${l.id}` }));
      break;
    }
    default:
      break;
  }
  const enunciado = textoDoEnunciado(p);
  const visiveis = numerosVisiveis(enunciado);
  const cortes = cortesVisiveis(enunciado);
  return unicos(
    lista.filter((s) => {
      if (s.tipo === "opcao") return true;
      if (s.tipo === "partes") return !cortes.includes(s.valor.n);
      // Zero e um quase sempre aparecem em outro sentido ("uma em cada"); só valem se forem a resposta de uma pergunta.
      if ((s.origem === "carga-por-bica" || s.origem === "bicas-em-uso") && compara(s.valor, comoRacional(1)) <= 0) return false;
      return !visiveis.some((v) => igual(v, s.valor));
    }),
  );
}
