/**
 * Mudanças no progresso, como funções puras: progresso + dados → novo progresso.
 * A interface só chama estas funções; nunca monta o documento à mão.
 */
import { acrescentarEvidencias, type Evidencia } from "../dominio/evidencias";
import { TETO_CONCLUIDAS, TETO_PALPITES } from "./normalizar";
import type {
  CalibragemSalva,
  Desvio,
  EstadoAtividade,
  EstadoJoia,
  PaginaCaderno,
  Palpite,
  Preferencias,
  Progresso,
  ViaConclusao,
} from "./tipos";

function tocar(p: Progresso, agora: number): Progresso {
  return { ...p, atualizadoEm: agora };
}

export function definirPreferencias(p: Progresso, mudancas: Partial<Preferencias>, agora: number): Progresso {
  return tocar({ ...p, preferencias: { ...p.preferencias, ...mudancas } }, agora);
}

export function marcarAberturaVista(p: Progresso, agora: number): Progresso {
  return tocar({ ...p, aberturaVista: true }, agora);
}

export function salvarCalibragem(p: Progresso, c: CalibragemSalva, agora: number): Progresso {
  return tocar({ ...p, calibragem: c }, agora);
}

export function registrarEvidencias(p: Progresso, novas: readonly Evidencia[], agora: number): Progresso {
  if (novas.length === 0) return p;
  return tocar({ ...p, evidencias: acrescentarEvidencias(p.evidencias, novas) }, agora);
}

export function iniciarAtividade(p: Progresso, id: string, agora: number): Progresso {
  const atual = p.campanha.atividades[id];
  if (atual) return p;
  const novo: EstadoAtividade = {
    status: "em_andamento",
    via: null,
    iniciadaEm: agora,
    concluidaEm: null,
    conclusoes: 0,
  };
  return tocar({ ...p, campanha: { ...p.campanha, atividades: { ...p.campanha.atividades, [id]: novo } } }, agora);
}

export function salvarExecucao(p: Progresso, id: string, execucao: unknown, agora: number): Progresso {
  return tocar({ ...p, campanha: { ...p.campanha, execucoes: { ...p.campanha.execucoes, [id]: execucao } } }, agora);
}

export function descartarExecucao(p: Progresso, id: string, agora: number): Progresso {
  if (!(id in p.campanha.execucoes)) return p;
  const execucoes = { ...p.campanha.execucoes };
  delete execucoes[id];
  return tocar({ ...p, campanha: { ...p.campanha, execucoes } }, agora);
}

export function concluirAtividade(p: Progresso, id: string, via: ViaConclusao, agora: number): Progresso {
  const antes = p.campanha.atividades[id];
  const estado: EstadoAtividade = {
    status: "concluida",
    // Uma conclusão guiada nunca é rebaixada para "prova".
    via: antes?.via === "guiada" ? "guiada" : via,
    iniciadaEm: antes?.iniciadaEm ?? agora,
    concluidaEm: agora,
    conclusoes: (antes?.conclusoes ?? 0) + 1,
  };
  const concluidas = [...p.campanha.concluidas, { atividade: id, momento: agora }].slice(-TETO_CONCLUIDAS);
  const execucoes = { ...p.campanha.execucoes };
  delete execucoes[id];
  return tocar(
    {
      ...p,
      campanha: {
        ...p.campanha,
        atividades: { ...p.campanha.atividades, [id]: estado },
        execucoes,
        concluidas,
      },
    },
    agora,
  );
}

export function registrarPalpite(p: Progresso, palpite: Palpite, agora: number): Progresso {
  const palpites = [...p.campanha.palpites, palpite].slice(-TETO_PALPITES);
  return tocar({ ...p, campanha: { ...p.campanha, palpites } }, agora);
}

export function acrescentarMarca(p: Progresso, marca: string, agora: number): Progresso {
  if (p.campanha.marcas.includes(marca)) return p;
  return tocar({ ...p, campanha: { ...p.campanha, marcas: [...p.campanha.marcas, marca] } }, agora);
}

export function definirDesvio(p: Progresso, desvio: Desvio | null, agora: number): Progresso {
  return tocar({ ...p, campanha: { ...p.campanha, desvio } }, agora);
}

/** Uma página por id; registrar de novo substitui (o jogador refez o registro). */
export function guardarPagina(p: Progresso, pagina: PaginaCaderno, agora: number): Progresso {
  const caderno = [...p.caderno.filter((x) => x.id !== pagina.id), pagina];
  return tocar({ ...p, caderno }, agora);
}

export function encontrarJoia(p: Progresso, id: string, agora: number): Progresso {
  const atual = p.joias[id];
  if (atual?.encontrada) return p;
  const joia: EstadoJoia = {
    encontrada: true,
    encontradaEm: agora,
    estagio: 0,
    treinos: atual?.treinos ?? 0,
    tecnicas: atual?.tecnicas ?? [],
  };
  return tocar({ ...p, joias: { ...p.joias, [id]: joia } }, agora);
}

export function registrarVisitaMuseu(p: Progresso, id: string, agora: number): Progresso {
  return tocar({ ...p, museu: { ...p.museu, [id]: agora } }, agora);
}

export function registrarCena(p: Progresso, id: string, agora: number): Progresso {
  return tocar({ ...p, cenas: { ...p.cenas, [id]: agora } }, agora);
}

export function contarRevisitaGerada(p: Progresso, agora: number): Progresso {
  return tocar({ ...p, revisitas: { geradas: p.revisitas.geradas + 1 } }, agora);
}

export function adiantarRelogio(p: Progresso, ms: number, agora: number): Progresso {
  return tocar({ ...p, relogio: { deslocamentoMs: p.relogio.deslocamentoMs + Math.max(0, ms) } }, agora);
}
