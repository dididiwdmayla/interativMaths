/**
 * As quatro joias do Relicário. SÓ DADOS. Na v0.5 só a do Ábaco é treinável; as outras três
 * já dizem o estágio de cada técnica e entram pelo mesmo treino quando ganharem a bancada.
 */
import type { Joia } from "@/nucleo/joias/contrato";

export const JOIAS: readonly Joia[] = [
  {
    id: "abaco",
    nome: "Joia do Ábaco",
    mineral: "granada",
    cor: { base: "var(--granada)", luz: "var(--granada-luz)" },
    habilidade: "Calcular com o soroban e, depois, com o soroban imaginado.",
    treino: ["Operações curtas no soroban, um algarismo por vez.", "Aos poucos o soroban some e fica a imagem dele na cabeça."],
    estagios: [
      { nome: "bruta", criterio: "Encontrada." },
      { nome: "talhada", criterio: "Mostrar, ler, somar e subtrair no soroban sem trocar contas." },
      { nome: "lapidada", criterio: "Usar os complementos de 5 e de 10 sem olhar os pares." },
      { nome: "polida", criterio: "Fazer as mesmas operações com o soroban imaginado." },
    ],
    tecnicas: [
      { id: "soroban.ler", nome: "Ler e mostrar", estagio: 1, aLapis: "a primeira" },
      { id: "soroban.unidades", nome: "Contas diretas", estagio: 1, aLapis: "depois de ler" },
      { id: "soroban.complemento-5", nome: "Complemento de 5", estagio: 2, aLapis: "depois das diretas" },
      { id: "soroban.complemento-10", nome: "Complemento de 10", estagio: 2, aLapis: "depois do 5" },
      { id: "soroban.juntos", nome: "5 e 10 juntos", estagio: 2, aLapis: "depois do 10" },
      { id: "soroban.imaginado", nome: "Soroban imaginado", estagio: 3, aLapis: "no último estágio", fechaCom: ["de-cabeca", "ditado"] },
    ],
    requisito: { tipo: "atividade", atividade: "partilha.arco1.encomenda" },
    engaste: 0,
    treinavel: true,
    formal: "Aritmética · Soroban",
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
      { id: "mental.decompor", nome: "Decompor", estagio: 1, aLapis: "no primeiro estágio" },
      { id: "mental.compensar", nome: "Compensar", estagio: 2, aLapis: "no segundo estágio" },
      { id: "mental.escolher", nome: "Escolher o caminho", estagio: 3, aLapis: "no último estágio" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 1,
    treinavel: false,
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
      { id: "mult.dobro", nome: "Dobrar", estagio: 2, aLapis: "no segundo estágio" },
      { id: "mult.grupo-a-mais", nome: "Um grupo a mais", estagio: 2, aLapis: "no segundo estágio" },
      { id: "mult.trocar-ordem", nome: "Trocar a ordem", estagio: 1, aLapis: "no primeiro estágio" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 2,
    treinavel: false,
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
      { id: "estimativa.ordem", nome: "Ordem de grandeza", estagio: 1, aLapis: "no primeiro estágio" },
      { id: "estimativa.arredondar", nome: "Arredondar para estimar", estagio: 2, aLapis: "no segundo estágio" },
    ],
    requisito: { tipo: "em_projeto" },
    engaste: 3,
    treinavel: false,
  },
];
