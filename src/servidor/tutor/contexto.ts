/**
 * O contexto da conversa, montado no servidor pelos ids: título e ideia da atividade, instrução e
 * pergunta do passo, falas, a escada de dicas, os nomes da pele, os equívocos com nome e a lista de
 * segredos. Do cliente vem só a descrição do estado da máquina (e ela é tratada como descrição).
 */
import { ATIVIDADES } from "@/conteudo/atividades";
import { EQUIVOCOS } from "@/conteudo/equivocos";
import { PELES } from "@/conteudo/peles";
import { INSTRUCAO_EXPOSICAO, INSTRUCAO_SISTEMA, INSTRUCAO_SO_ESCLARECE } from "@/conteudo/tutor";
import { passosDoModo } from "@/nucleo/missoes/motor";
import { alvosDaMaquina, execucaoDeReferencia } from "@/nucleo/missoes/referencia";
import { segredos, type Segredo } from "@/nucleo/missoes/segredos";
import type { AlvoMaquina, Atividade, Passo } from "@/nucleo/missoes/tipos";
import { formatar } from "@/nucleo/racional/racional";
import { EXPRESSOES_TUTOR, type EntradaTutor } from "@/nucleo/tutor/contrato";

export interface ContextoConversa {
  readonly atividade: Atividade;
  readonly passo: Passo;
  readonly system: string;
  readonly alvos: readonly AlvoMaquina[];
  readonly segredos: readonly Segredo[];
}

const CTX_MOTOR = {
  agora: 0,
  conceitoDoEquivoco: (id: string) => EQUIVOCOS.find((e) => e.id === id)?.conceito ?? null,
};

/** Os marcadores de medida viva ({lote}, {ha}) viram uma indicação: o valor está na máquina. */
function semMarcadores(t: string): string {
  return t.replace(/\{\w+\}/g, "[medida da máquina]");
}

function textoDoSegredo(s: Segredo): string {
  if (s.tipo === "opcao") return `a opção "${s.texto ?? formatar(s.valor)}"`;
  if (s.tipo === "partes") return `cortar em ${formatar(s.valor)} partes`;
  return formatar(s.valor, { misto: true });
}

function linhasDoPasso(p: Passo): string[] {
  const l: string[] = [`Tipo do passo: ${p.tipo}. Fase: ${p.fase}.`, `Pedido: ${p.pedido}`, `Instrução na tela: ${p.instrucao}`];
  if (p.tipo === "aposta") l.push(`Bilhete do Nônio (a aposta, com um equívoco de propósito): ${p.aposta}`);
  if (p.tipo === "prever" || p.tipo === "palpite" || p.tipo === "aposta") {
    l.push(`Pergunta do passo: ${p.pergunta}`);
    if (p.resposta.tipo === "opcoes") l.push(`Opções na tela: ${p.resposta.opcoes.map((o) => o.texto).join("; ")}.`);
  }
  if (p.tipo === "frase") l.push(`Frase a completar: ${p.frase.replace(/\{\w+\}/g, "___")}`);
  if (p.tipo === "notacao") l.push(`Notação que aparece: ${p.linhas.join(" | ")}`);
  if (p.nonio) l.push(`O que você (Nônio) já disse na faixa: ${semMarcadores(p.nonio)}`);
  for (const f of p.falas ?? []) l.push(`${f.quem === "dalia" ? "Dália" : "Nônio"} disse: ${f.texto}`);
  return l;
}

/** Monta o contexto. null: atividade ou passo que não existem (a rota responde 400). */
export function montarContexto(e: EntradaTutor): ContextoConversa | null {
  const atividade = ATIVIDADES.find((a) => a.id === e.atividade);
  if (!atividade) return null;
  const passo = passosDoModo(atividade, e.modo).find((p) => p.id === e.passo);
  if (!passo) return null;
  const ref = execucaoDeReferencia(atividade, e.modo, passo.id, CTX_MOTOR);
  const maquina = ref?.bancada?.atual ?? null;
  const alvos = alvosDaMaquina(maquina);
  const lista = e.situacao === "vencido" || !ref ? [] : segredos(passo, ref);
  const pele = maquina ? PELES[maquina.config.pele] : null;

  const blocos: string[] = [INSTRUCAO_SISTEMA.join("\n")];
  blocos.push(["# A missão", `Atividade: ${atividade.titulo} (${atividade.ideia}).`].join("\n"));
  blocos.push(["# O passo agora", ...linhasDoPasso(passo)].join("\n"));
  if (passo.tipo === "narrativa" && passo.faixas) {
    blocos.push(
      [
        "# A exposição",
        `O que se sabe: ${passo.faixas.sabe.join(" ")}`,
        `O que é interpretação: ${passo.faixas.interpretacao.join(" ")}`,
        `O que simplificamos: ${passo.faixas.simplificamos.join(" ")}`,
        INSTRUCAO_EXPOSICAO,
      ].join("\n"),
    );
  }
  if (passo.dicas) {
    blocos.push(
      [
        `# Escada de dicas (o jogador já subiu ${e.degrau} de 4 degraus; ande junto, um degrau por vez)`,
        ...passo.dicas.map((d, i) => `${i + 1}. ${semMarcadores(d.texto)}`),
      ].join("\n"),
    );
  }
  if (pele) {
    blocos.push(
      [
        "# A máquina",
        `Peça: ${pele.peca.singular} (${pele.peca.plural}); pedaço: ${pele.pedaco.singular}; recebe: ${pele.receptor.singular} (${pele.receptor.plural}); sobra vai para: ${pele.sobra}.`,
        `Partes para o campo alvo: ${alvos.join(", ")} (bica:0 é a primeira).`,
        `Estado agora, só descrição: ${e.maquina || "sem descrição"}`,
      ].join("\n"),
    );
  }
  const equivocos = e.equivocos.map((id) => EQUIVOCOS.find((q) => q.id === id)).filter((q) => q !== undefined);
  if (equivocos.length > 0) {
    blocos.push(["# Equívocos recentes do jogador (não diga o nome; use para escolher a pergunta)", ...equivocos.map((q) => `- ${q.nome}`)].join("\n"));
  }
  if (lista.length > 0) {
    blocos.push(["# Segredos: nunca escreva, em nenhuma forma", ...lista.map((s) => `- ${textoDoSegredo(s)}`)].join("\n"));
  }
  if (e.situacao === "vencido") blocos.push("# Situação\nO passo já foi vencido: pode comentar o que a máquina mostrou.");
  if (passo.fase === "aplicacao" || e.modo === "prova") blocos.push(`# Modo\n${INSTRUCAO_SO_ESCLARECE}`);
  blocos.push(`# Expressões possíveis\n${EXPRESSOES_TUTOR.join(", ")}`);

  return { atividade, passo, system: blocos.join("\n\n"), alvos, segredos: lista };
}

/** O esquema da saída: texto, expressao (uma das seis), alvo (uma parte da máquina, ou null). */
export function esquemaDaSaida(alvos: readonly AlvoMaquina[]): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      texto: { type: "string", description: "A resposta do Nônio: até duas frases curtas, sem a resposta do passo." },
      expressao: { type: "string", enum: [...EXPRESSOES_TUTOR] },
      alvo: alvos.length > 0 ? { anyOf: [{ type: "string", enum: [...alvos] }, { type: "null" }] } : { type: "null" },
    },
    required: ["texto", "expressao", "alvo"],
    additionalProperties: false,
  };
}
