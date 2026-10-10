/**
 * As quatro joias do Relicário. SÓ DADOS. Nesta versão nenhuma é treinável.
 */
import type { Joia } from "@/nucleo/joias";

export const JOIAS: readonly Joia[] = [
  {
    id: "abaco",
    nome: "Joia do Ábaco",
    mineral: "granada",
    cor: { base: "var(--granada)", luz: "var(--granada-luz)" },
    habilidade: "Calcular com o soroban e, depois, com um ábaco imaginado.",
    treino: ["Contas curtas no soroban, com as contas do próprio jogo.", "Aos poucos o soroban some e fica a imagem dele na cabeça."],
    estagios: [
      { nome: "bruta", criterio: "Encontrada." },
      { nome: "talhada", criterio: "Somar e subtrair no soroban com as cinco contas de baixo." },
      { nome: "lapidada", criterio: "Usar os complementos de 5 e de 10 sem olhar a tabela." },
      { nome: "polida", criterio: "Fazer a mesma conta com o ábaco imaginado." },
    ],
    tecnicas: [
      { id: "soroban.unidades", nome: "Contas de baixo" },
      { id: "soroban.complemento-5", nome: "Complemento de 5" },
      { id: "soroban.complemento-10", nome: "Complemento de 10" },
      { id: "soroban.imaginado", nome: "Ábaco imaginado" },
    ],
    requisito: { tipo: "atividade", atividade: "partilha.arco1.encomenda" },
    engaste: 0,
  },
  {
    id: "calculo-mental",
    nome: "Joia do Cálculo Mental",
    mineral: "safira",
    cor: { base: "var(--safira)", luz: "var(--safira-luz)" },
    habilidade: "Fazer contas de cabeça escolhendo o caminho mais curto.",
    treino: ["Uma conta, três caminhos: decompor, compensar, arredondar e voltar.", "O treino mede o caminho escolhido, não a pressa."],
    estagios: [
      { nome: "bruta", criterio: "Encontrada." },
      { nome: "talhada", criterio: "Decompor números para somar e subtrair." },
      { nome: "lapidada", criterio: "Compensar: arredondar e corrigir depois." },
      { nome: "polida", criterio: "Escolher o caminho conforme a conta." },
    ],
    tecnicas: [
      { id: "mental.decompor", nome: "Decompor" },
      { id: "mental.compensar", nome: "Compensar" },
      { id: "mental.escolher", nome: "Escolher o caminho" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 1,
  },
  {
    id: "multiplicacao",
    nome: "Joia da Multiplicação",
    mineral: "ametista",
    cor: { base: "var(--ametista)", luz: "var(--ametista-luz)" },
    habilidade: "Ter os fatos da multiplicação à mão, sabendo de onde vêm.",
    treino: ["Cada fato nasce de um que você já sabe: dobrar, somar um grupo, trocar a ordem.", "Fatos firmes voltam menos; os frágeis voltam até firmar."],
    estagios: [
      { nome: "bruta", criterio: "Encontrada." },
      { nome: "talhada", criterio: "Tabuadas do 2, do 5 e do 10, e trocar a ordem." },
      { nome: "lapidada", criterio: "Derivar o 4, o 8, o 3, o 6 e o 9 dos já sabidos." },
      { nome: "polida", criterio: "Os fatos até 10 × 10 sem hesitar." },
    ],
    tecnicas: [
      { id: "mult.dobro", nome: "Dobrar" },
      { id: "mult.grupo-a-mais", nome: "Um grupo a mais" },
      { id: "mult.trocar-ordem", nome: "Trocar a ordem" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 2,
  },
  {
    id: "estimativa",
    nome: "Joia da Estimativa",
    mineral: "turmalina",
    cor: { base: "var(--turmalina)", luz: "var(--turmalina-luz)" },
    habilidade: "Saber antes de fazer se um resultado é plausível.",
    treino: ["Os palpites que você dá antes de ligar as máquinas já estão guardados para ela.", "O treino compara palpite e resultado e mostra a sua margem."],
    estagios: [
      { nome: "bruta", criterio: "Encontrada." },
      { nome: "talhada", criterio: "Palpites na ordem de grandeza certa." },
      { nome: "lapidada", criterio: "Palpites com margem pequena." },
      { nome: "polida", criterio: "Desconfiar de um resultado implausível antes de conferir." },
    ],
    tecnicas: [
      { id: "estimativa.ordem", nome: "Ordem de grandeza" },
      { id: "estimativa.arredondar", nome: "Arredondar para estimar" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 3,
  },
];
