# Arquitetura

Next.js 16 (App Router, Cache Components), TypeScript estrito, Tailwind v4 lendo `src/tema/tokens.css`.
Desenho em SVG e DOM (nada de canvas ou motor de jogo). Progresso em `localStorage`.

## Camadas

```
src/
  nucleo/        TypeScript puro, sem React, determinístico
    racional/    Racional exato, leitura por extenso, notação com papéis
    curriculo/   conceitos e dependências (consultas)
    dominio/     evidências → estados; frases em português comum
    progresso/   documento versionado: tipos, normalização, migrações, ações puras, relógio
    maquinas/    a bancada de partilha: regras, validadores, medidas, viabilidade de corte
    missoes/     contrato de atividade, motor (entrada → execução + efeitos), conferência de respostas
    calibragem/  a escada adaptativa D1–D6
    campanha/    situação derivada (missões disponíveis, eco, revisita, sondagem)
    geradores/   aleatório com semente, questões e atividades geradas (revisita, sondagem)
    tutor/       contrato do tutor por conversa (desligado)
    joias.ts     contrato das joias
  conteudo/      SÓ DADOS: conceitos, missões, calibragem, equívocos, peles, joias, museu, rua, eco
  componentes/   maquinas, missao, mundo, nonio, notacao, caderno, joias, estado, lab, ui, icones
  tema/          tokens.css (única cor literal) e componentes.css (placas, chapa, papel, dobra)
  app/           rotas (cada página só monta um componente)
```

Regra de dependência: `app → componentes → conteudo → nucleo`. O núcleo não importa React, Next,
componentes nem conteúdo (o ESLint barra). O conteúdo não tem função nem JSX (um teste barra).

## A bancada de partilha (`nucleo/maquinas/bancada`)

Estado → ação → novo estado. Ações: `lote`, `pilha`, `bica`, `bicas`, `carga`, `partes`,
`repartir`, `fatiar`, `fechar`, `desfazer`, `recomecar`. Recusas e engasgos viram `evento` (a tela
anima o evento; o estado é a verdade). Toda quantidade é `Racional`. Invariante testada: a soma
exata de esteira + bicas + bandeja é constante.

Validadores (propriedades do estado final): `partilha.fechada`, `partilha.carga-exata`,
`transporte.tudo-saiu`, `partilha.solucoes-distintas`, `partilha.unitarias-distintas`,
`maquina.mostra-divisao`; respostas por valor exato em `missoes/respostas.ts` (`notacao.equivale`).
`viabilidade.ts` decide se um corte ainda fecha (busca sobre contagens módulo bicas).

## O motor de atividade (`nucleo/missoes/motor.ts`)

`iniciarExecucao(atividade, modo)` e `aplicarEntrada(atividade, execucao, entrada, ctx)` →
`{ exec, efeitos }`. Modos: `guiada`, `prova` (prova direta), `registro` (só a formalização).
Efeitos: `evidencias`, `palpite`, `equivoco`, `resultado`, `pagina`, `marca`, `concluida`, `joia`.
A tela aplica os efeitos com `aplicarEfeitos` (`missoes/efeitos.ts`) e guarda a execução no
progresso: recarregar devolve o mesmo passo, com a máquina no mesmo estado.

Regras de evidência: erro de exploração (engasgo na experimentação) não vira evidência; erro de
conclusão e de previsão sim, uma vez por equívoco por passo; a falha vai para o conceito do
equívoco (o pré-requisito). Ajuda = degrau mais alto da escada no passo; "resolver junto" é 4.

## Contrato de conteúdo (resumo de `nucleo/missoes/tipos.ts`)

Uma `Atividade` tem `id`, `tipo` (missao, eco, revisita, exposicao, cena, sondagem), `conceitos`,
`passos`, `prova?`, `joia?`, `categoria?`, `solucoesDeTeste` e `sabotagens`. Cada passo tem `id`,
`fase`, `tipo`, `pedido` (até 44 caracteres), `falas?`, `maquina?` (config + ações opcionais; sem
ela o passo continua a máquina anterior), `dicas?` (olhar, medir, caso parecido), `equivocos?`,
`evidencias?`. Tipos de passo: `narrativa`, `palpite`, `operar`, `prever`, `frase`, `notacao`,
`registro`.

## Como acrescentar uma missão

1. Crie `src/conteudo/missoes/mN-nome.ts` com a `Atividade` (só dados; use as constantes de
   `comum.ts`). Ids publicados não mudam.
2. Escreva ao menos uma solução de teste por modo e sabotagens com o equívoco esperado.
3. Registre em `conteudo/missoes/index.ts` (e em `conteudo/atividades.ts` se não for missão).
4. Rode `npm test`: as checagens rodam as soluções no motor, conferem ids, escadas de dicas,
   tamanho do pedido, página no Caderno e domínio alcançável.
5. Se a missão ensina um conceito novo, acrescente-o em `conteudo/conceitos.ts` e na Planta.

## Como acrescentar uma máquina

1. No núcleo, uma pasta em `nucleo/maquinas/<nome>` com tipos, `criarEstado`, `aplicar`/`operar`,
   validadores por propriedade e testes (inclusive invariantes).
2. Estenda `MaquinaDoPasso`/`Objetivo` para aceitar a nova máquina (hoje o motor conhece a bancada).
3. Na tela, um componente SVG em `componentes/maquinas` composto com o kit (`componentes/mundo/kit`)
   e um painel de controles; use `Palco` para o layout em pé e deitado.
4. Uma peça nova do kit entra na `/lab/vitrine`.

## Progresso (`nucleo/progresso`)

Documento único versionado (`VERSAO_PROGRESSO`), lido com proteção (ilegível vira começo novo e o
original fica guardado à parte), normalizado campo a campo e migrado por cadeia testada. Guarda
preferências, calibragem, campanha (atividades, execuções, desvio, conclusões, marcas, palpites),
evidências (teto 1500), Caderno, joias, museu, cenas, revisitas e o deslocamento do relógio.
A loja do navegador (`componentes/estado/loja.ts`) usa `useSyncExternalStore`: no servidor e na
hidratação o estado é "carregando", então a primeira pintura nunca diverge.

## Rotas

`/` (porta), `/abertura`, `/calibragem`, `/mapa`, `/partilha`, `/partilha/[atividade]`
(`?modo=prova|registro`), `/partilha/revisita`, `/partilha/sondagem`, `/museu/[exposicao]`,
`/rua/[cena]`, `/caderno`, `/planta`, `/relicario`, `/menu`, `/lab`, `/lab/maquinas`,
`/lab/progresso`, `/lab/vitrine`, `POST /api/tutor`.

Com Cache Components, `params` só é lido dentro de `<Suspense>` (`params.then(...)`), e
`useSearchParams` também fica sob `<Suspense>`. Telas visitadas ficam escondidas no DOM (Activity):
nos testes de navegador, filtre por elementos visíveis.

## Testes

1. `npm run tipos`, `npm run lint`, `npm run build`.
2. Núcleo: `src/nucleo/**/*.test.ts`.
3. Conteúdo: `src/conteudo/**/*.test.ts` e `src/higiene.test.ts`.
4. Navegador: `npm run e2e` (`e2e/percurso.spec.ts`, build de produção, 390×844 com toque).
Não rode `next build` com o `next dev` aberto: os dois disputam a pasta `.next`.
