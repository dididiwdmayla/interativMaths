# Arquitetura

Next.js 16 (App Router, Cache Components), TypeScript estrito, Tailwind v4 lendo `src/tema/tokens.css`.
Desenho em SVG e DOM (nada de canvas ou motor de jogo). Progresso em `localStorage`.

## Camadas

```
src/
  nucleo/        TypeScript puro, sem React, determinístico
    racional/    Racional exato, leitura por extenso, notação com papéis
    curriculo/   conceitos e dependências (consultas); nome formal (área e conteúdo)
    dominio/     evidências → estados; frases em português comum
    progresso/   documento versionado: tipos, normalização, migrações, ações puras, relógio
    maquinas/    a bancada de partilha: regras, validadores, medidas, viabilidade de corte, rascunho
    missoes/     contrato de atividade, motor (entrada → execução + efeitos), conferência de respostas,
                 gesto (o próximo gesto), segredos (o que o passo esconde), instrução, referência,
                 conta (a conta passada a caneta, em linha e armada)
    manual/      o contrato das páginas, a restauração e a checagem das igualdades
    calibragem/  a escada adaptativa D1–D6
    campanha/    situação derivada (missões disponíveis, eco, revisita, sondagem)
    geradores/   aleatório com semente, questões e atividades geradas (revisita, sondagem)
    tutor/       fila de falas, reações, guardas, apresentações, contrato da conversa
    joias.ts     contrato das joias
  conteudo/      SÓ DADOS: conceitos (com nome formal), áreas, missões, calibragem, equívocos, peles,
                 joias, museu, rua, eco, reações e gestos (modelos de fala), tutor, apresentações,
                 rascunho e conta (modelos), manual (as páginas)
  servidor/      só servidor, nunca importado por cliente: tutor/ (contexto, cliente da Anthropic,
                 resiliência, simulações)
  componentes/   maquinas, missao, mundo, nonio, notacao, caderno, manual, joias, estado, lab, ui
                 (tema, tela cheia, cabeçalho), icones
                 (identidade Quadriculado: docs/DESIGN-SYSTEM.md e docs/referencia-visual/)
  tema/          tokens.css (única cor literal; claro e escuro) e componentes.css (receitas: ficha,
                 botões, etiquetas, folha pautada, palco, Nônio flutuante, rascunho, conta, Manual)
  app/           rotas (cada página só monta um componente)
```

Regra de dependência: `app → componentes → conteudo → nucleo`; `app/api → servidor → conteudo →
nucleo`. O núcleo não importa React, Next, componentes nem conteúdo (o ESLint barra). O conteúdo
não tem função nem JSX; nenhum cliente importa `servidor`; nada de `NEXT_PUBLIC_` (testes barram).

## A bancada de partilha (`nucleo/maquinas/bancada`)

Estado → ação → novo estado. Ações: `lote`, `pilha`, `bica`, `bicas`, `carga`, `partes`,
`repartir`, `fatiar`, `fechar`, `desfazer`, `recomecar` e, com a **mão livre**, `colocar` (uma peça
da esteira numa bica), `devolver` (de volta à esteira) e `cortar` (uma peça ou todas, em partes).
A mão livre vem ligada; sai com `maoLivre: false` ou quando a máquina conta voltas (`voltasMax`).
Recusas e engasgos viram `evento` (`colocou`, `devolveu`, `cortou`, `engasgo`...): a tela anima o
evento; o estado é a verdade. Toda quantidade é `Racional`. Invariante testada (por propriedade,
com sequências aleatórias): a soma exata de esteira + bicas + bandeja é constante.
`diferencaDeMaquinas(anterior, nova)` diz o que uma máquina nova traz (peças, bicas): a chegada.

Validadores (propriedades do estado final): `partilha.fechada`, `partilha.carga-exata`,
`transporte.tudo-saiu`, `partilha.solucoes-distintas`, `partilha.unitarias-distintas`,
`maquina.mostra-divisao`, `partilha.inteiras-por-bica`, `partilha.composicao`; respostas por valor exato em `missoes/respostas.ts` (`notacao.equivale`).
`viabilidade.ts` decide se um corte ainda fecha (busca sobre contagens módulo bicas).

## O motor de atividade (`nucleo/missoes/motor.ts`)

`iniciarExecucao(atividade, modo)` e `aplicarEntrada(atividade, execucao, entrada, ctx)` →
`{ exec, efeitos }`. Modos: `guiada`, `prova` (prova direta), `registro` (só a formalização).
Efeitos: `evidencias`, `palpite`, `equivoco`, `resultado`, `pagina`, `marca`, `concluida`, `joia`.
A tela aplica os efeitos com `aplicarEfeitos` (`missoes/efeitos.ts`) e guarda a execução no
progresso: recarregar devolve o mesmo passo, com a máquina no mesmo estado.

**Execução v2** (`VERSAO_EXECUCAO = 2`): guarda a assinatura dos passos (ids e tipos); assinatura
diferente ou execução v1 de missão recomeça a missão, sem perder evidências nem conquistas. O
passo guarda o `retorno` ("acertou" enquanto vencido; "ainda-nao" passageiro, limpo no primeiro
gesto), as respostas e, na aposta, se o objetivo já foi `cumprido` (conferido a cada gesto).
**Aposta**: operar até cumprir; a pergunta destrava; a resposta leva o retorno. **Chegada**:
`chegadaDoPasso` devolve a diferença enquanto o passo está intacto. **Passo automático**: vence
quando o objetivo se cumpre, sem fechar.

## O Nônio guia (`nucleo/tutor`, `componentes/nonio`)

- **Fila** (`fila.ts`): uma fala por vez (na bolinha e na janelinha). Importante (retorno, chegada, leitura da
  máquina) entra na hora; pedida (Me ajuda, conversa) espera a importante ficar 2,5 s; automática
  (oferta, lembrete, comentário) só com o Nônio calmo, conforme a postura.
- **Reações** (`reacoes.ts` + `conteudo/reacoes.ts`): de evento e efeito para fala, com os números
  do momento e o alvo para apontar. Até 160 caracteres, sem exclamação.
- **Gesto** (`missoes/gesto.ts`): o próximo gesto ("Agora: ...") a partir do estado; nunca contém
  um segredo do passo (teste de propriedade). **Segredos** (`missoes/segredos.ts`): o que o passo
  esconde (esperado, medidas da resolução, lacunas vazias), menos o que o enunciado já mostra.
- **Apresentações** (`apresentacoes.ts`): uma ferramenta nova por passo, nunca sobre um retorno.

- **O Nônio flutuante** (v0.4, a faixa saiu): `useNonio` junta fila, recado e janelinha;
  `BolhaNonio` no canto da máquina (`cantoNonio` tira a bandeja do canto), `RecadoNonio` com o
  recado curto (`tutor/recado.ts`: até 60 caracteres; a fala longa traz `recado` no conteúdo),
  `JanelaNonio` com a fala inteira, "Antes, neste passo", a escada e a conversa.

## Rascunho e conta

- **Rascunho** (`maquinas/bancada/rascunho.ts`): `rascunhoDaBancada(bancada, pele, modelos)`
  lê o histórico da bancada (`passado` + `atual`) e devolve uma linha por gesto que mexeu na carga
  (volta, à mão, corte, devolução, engasgo); desfazer tira a linha. Textos em `conteudo/rascunho.ts`.
- **Conta** (`missoes/conta.ts`): `contaDoAcerto(passo, execucao, ctx)` só existe depois do
  acerto, calculada do estado final da máquina (partilha, medida, resto, fração, transporte,
  comparação, parte). Na divisão com resto, `contaArmada` faz a chave com as voltas do jogador
  como quocientes parciais. `contaVerdadeira` confere tudo com `Racional` (teste com todas as
  soluções de teste).

## O Manual e o nome formal

- **Nome formal** (`curriculo/formal.ts`): área do distrito (`conteudo/areas.ts`) e conteúdo dos
  conceitos (`formal`, `formalCurto`, `aspecto`; `conteudoFormal` na atividade quando precisa).
  O cabeçalho mostra a linha cheia e troca pela curta (sem a área) quando não cabe.
- **Páginas** (`conteudo/manual.ts`): uma por conceito que alguma missão ensina; as outras a
  lápis, com o arco previsto. Checagens: exemplo e forma verdadeiros (`igualdadeVerdadeira`), o
  desenho "Na máquina" (config + ações, montado pelo núcleo) mostra os números do exemplo, todo
  equívoco citado existe e tem o texto do Manual.
- **Restauração** (`manual/manual.ts`): `paginasRestauradas(progresso, atividades)`: página no
  Caderno de uma missão que ensina o conceito, ou conceito dominado ou consolidado. O fim da
  missão compara antes e depois e diz "Uma página do Manual voltou". `ReferenciaMissao` (o livro
  no cabeçalho) mostra nomes e páginas; não existe na sondagem; na degustação, só os nomes.

## Tema, tela cheia e app

- **Tema** (`componentes/ui/tema.ts`, `Tema.tsx`): `SCRIPT_TEMA` no `<head>` põe `data-tema`
  antes da primeira pintura (`?tema=`, a chave `interativmaths:aparencia`, o aparelho);
  `AplicarTema` aplica a preferência `aparencia`, segue o aparelho no automático e acerta
  `theme-color`. A degustação ignora a escolha guardada.
- **Tela cheia** (`componentes/ui/TelaCheia.tsx`): Fullscreen API no documento; botão só com
  `document.fullscreenEnabled`; no iPhone sem a API e fora do app instalado, o Menu ensina a
  instalar.
- **Instalável**: `app/manifest.ts` (standalone, cores do claro), ícones em `app/icones/*`
  e `apple-icon.tsx`, todos de `app/desenhoIcone.tsx`. Sem service worker.

## A conversa com IA (`POST /api/tutor`, `servidor/tutor`)

O cliente manda ids e o estado visível (`nucleo/tutor/contrato.ts`, validado à risca: campo a
mais é 400). O servidor monta o contexto pelos ids (enunciado, escada, pele, equívocos, segredos;
execução de referência pela primeira solução de teste), chama o modelo pelo SDK oficial com saída
estruturada (`output_config.format`, json_schema: texto, expressão, alvo), esforço baixo e sem
pensamento estendido. Resiliência: `maxRetries: 0` no cliente; 15 s por tentativa, 45 s no total;
em 429, 500, 504 e 529, duas novas tentativas (1 s e 2 s, com variação, respeitando
`retry-after`) e uma no modelo reserva. Falhas viram tipo (`sobrecarga`, `sem_chave`,
`sem_credito`, `rede`, `desconhecido`) e respondem 200. Depois do modelo, as **guardas**
(`nucleo/tutor/guardas.ts`): resposta que entrega um segredo (algarismo, fração, extenso, misto,
corte) ou traz conta falsa vira `{ recurso }`, e o cliente mostra o degrau seguinte da escada.
Log: tipo, status, modelo, tentativas, request-id e guarda; nunca o texto da pergunta.

Variáveis (só servidor; `.env.example`): `ANTHROPIC_API_KEY`, `TUTOR_MODELO` (padrão
`claude-haiku-5-5`), `TUTOR_MODELO_RESERVA` (opcional), `TUTOR_SIMULAR` (fora de produção:
`sobrecarga`, `sobrecarga-total`, `rede`, `resposta`, `entrega`, `conta-falsa`). A rota não exporta
`runtime`: Node.js é o padrão, e com Cache Components o Next 16.4 recusa a opção.

Regras de evidência: erro de exploração (engasgo na experimentação) não vira evidência; erro de
conclusão e de previsão sim, uma vez por equívoco por passo; a falha vai para o conceito do
equívoco (o pré-requisito). Ajuda = degrau mais alto da escada no passo; "resolver junto" é 4.

## Contrato de conteúdo (resumo de `nucleo/missoes/tipos.ts`)

Uma `Atividade` tem `id`, `tipo` (missao, eco, revisita, exposicao, cena, sondagem), `conceitos`,
`passos`, `prova?`, `joia?`, `categoria?`, `solucoesDeTeste` e `sabotagens`. Cada passo tem `id`,
`fase`, `tipo`, `pedido` (até 44 caracteres), `instrucao` (verbo primeiro, até 80, termina em
ponto; um teste confere), `perguntas?` (sugestões da conversa), `chegada?`, `nonio?`, `acerto?`,
`falas?`, `maquina?` (config + ações opcionais; sem ela o passo continua a máquina anterior),
`dicas?` (olhar, medir, caso parecido), `equivocos?`, `evidencias?`. Tipos de passo: `narrativa`,
`palpite`, `operar` (com `automatico?`, `maoLivre?`, `convite?` = desafio), `prever`, `aposta`,
`frase`, `notacao`, `registro`.

## Como acrescentar uma missão

1. Crie `src/conteudo/missoes/mN-nome.ts` com a `Atividade` (só dados; use as constantes de
   `comum.ts`). Ids publicados não mudam.
2. Escreva ao menos uma solução de teste por modo (uma delas com `colocar`, quando há mão livre)
   e sabotagens com o equívoco esperado; na aposta que o Nônio perde, uma sabotagem responde como
   o bilhete.
3. Registre em `conteudo/missoes/index.ts` (e em `conteudo/atividades.ts` se não for missão).
4. Rode `npm test`: as checagens rodam as soluções no motor, conferem ids, escadas de dicas,
   tamanho do pedido, página no Caderno e domínio alcançável.
5. Se a missão ensina um conceito novo, acrescente-o em `conteudo/conceitos.ts` e na Planta.

## Como acrescentar uma máquina

1. No núcleo, uma pasta em `nucleo/maquinas/<nome>` com tipos, `criarEstado`, `aplicar`/`operar`,
   validadores por propriedade e testes (inclusive invariantes).
2. Estenda `MaquinaDoPasso`/`Objetivo` para aceitar a nova máquina (hoje o motor conhece a bancada).
3. Na tela, um componente SVG em `componentes/maquinas` composto com o kit (`componentes/mundo/kit`)
   e um painel de controles; use `Palco` (objetivo, nota, máquina com a bolinha do Nônio, rascunho, bancada; duas
   colunas a partir de 1024 px). Bica fechada e lugar vazio ficam a lápis (`.a-lapis`, `PassarACaneta`).
4. Uma peça nova do kit entra na `/lab/vitrine`.

## Progresso (`nucleo/progresso`)

Documento único versionado (`VERSAO_PROGRESSO`, hoje 3), lido com proteção (ilegível vira começo novo e o
original fica guardado à parte), normalizado campo a campo e migrado por cadeia testada. Guarda
preferências, calibragem, campanha (atividades, execuções, desvio, conclusões, marcas, palpites),
evidências (teto 1500), Caderno, joias, museu, cenas, revisitas, o deslocamento do relógio e,
desde a v2, as apresentações vistas (id e momento) e a preferência `conversa` (ligada ou
desligada); desde a v3, a preferência `aparencia` (automático, claro, escuro), espelhada em
`interativmaths:aparencia` para o script do tema. As migrações 1 → 2 e 2 → 3 são testadas com
progressos reais gravados (`nucleo/progresso/amostras/`). O histórico da conversa nunca é salvo.
A loja do navegador (`componentes/estado/loja.ts`) usa `useSyncExternalStore`: no servidor e na
hidratação o estado é "carregando", então a primeira pintura nunca diverge.

## Rotas

`/` (porta), `/abertura`, `/calibragem`, `/mapa`, `/partilha`, `/partilha/[atividade]`
(`?modo=prova|registro`), `/partilha/revisita`, `/partilha/sondagem`, `/museu/[exposicao]`,
`/rua/[cena]`, `/caderno`, `/manual`, `/manual/[pagina]`, `/planta`, `/relicario`, `/menu`,
`/lab`, `/lab/maquinas`, `/lab/progresso`, `/lab/vitrine`, `POST /api/tutor`, `/degustacao`
(`?embed=1`, `?tema=claro|escuro`), `/manifest.webmanifest`, `/icones/192`, `/icones/512`,
`/icones/mascaravel`.

## A degustação (`/degustacao`)

A atividade `conteudo/degustacao.ts` (tipo `degustacao`, fora do catálogo, mas nas checagens de
conteúdo) roda no mesmo `ExecutorAtividade`, dentro de um `ContextoProgresso` com uma loja à parte
(`componentes/estado/lojaIsolada.ts`): o progresso do jogo não é lido nem gravado. `useProgresso`
lê o contexto; o padrão é a loja do jogo. Embutida, a conversa com a recepção está em
`componentes/degustacao/recepcao.ts`; o cabeçalho `frame-ancestors` está em `next.config.ts`, e um
teste confere que os dois têm a mesma lista de origens.

Com Cache Components, `params` só é lido dentro de `<Suspense>` (`params.then(...)`), e
`useSearchParams` também fica sob `<Suspense>`. Telas visitadas ficam escondidas no DOM (Activity):
nos testes de navegador, filtre por elementos visíveis.

## Testes

1. `npm run tipos`, `npm run lint`, `npm run build`.
2. Núcleo: `src/nucleo/**/*.test.ts`; servidor: `src/servidor/**/*.test.ts` (a rota do tutor com a
   tentativa injetada, sem rede).
3. Conteúdo: `src/conteudo/**/*.test.ts` e `src/higiene.test.ts`.
4. Navegador: `npm run e2e` (`e2e/percurso.spec.ts` e `e2e/degustacao.spec.ts`, build de
   produção): o percurso confere bolinha, rascunho, conta, Manual restaurado, escuro depois de
   recarregar; a degustação nos três layouts, embutida e com `?tema=`.
Não rode `next build` com o `next dev` aberto: os dois disputam a pasta `.next`.
