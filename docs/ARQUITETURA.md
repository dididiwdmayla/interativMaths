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
    missoes/     contrato de atividade, motor (entrada → execução + efeitos), conferência de respostas,
                 gesto (o próximo gesto), segredos (o que o passo esconde), instrução, referência
    calibragem/  a escada adaptativa D1–D6
    campanha/    situação derivada (missões disponíveis, eco, revisita, sondagem)
    geradores/   aleatório com semente, questões e atividades geradas (revisita, sondagem)
    tutor/       fila de falas, reações, guardas, apresentações, contrato da conversa
    joias.ts     contrato das joias
  conteudo/      SÓ DADOS: conceitos, missões, calibragem, equívocos, peles, joias, museu, rua, eco,
                 reações e gestos (modelos de fala), tutor (instrução de sistema), apresentações
  servidor/      só servidor, nunca importado por cliente: tutor/ (contexto, cliente da Anthropic,
                 resiliência, simulações)
  componentes/   maquinas, missao, mundo, nonio, notacao, caderno, joias, estado, lab, ui, icones
                 (identidade Quadriculado: docs/DESIGN-SYSTEM.md e docs/referencia-visual/)
  tema/          tokens.css (única cor literal) e componentes.css (receitas: ficha, botões, etiquetas,
                 folha pautada, palco)
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

- **Fila** (`fila.ts`): uma fala por vez na faixa. Importante (retorno, chegada, leitura da
  máquina) entra na hora; pedida (Me ajuda, conversa) espera a importante ficar 2,5 s; automática
  (oferta, lembrete, comentário) só com a faixa calma, conforme a postura.
- **Reações** (`reacoes.ts` + `conteudo/reacoes.ts`): de evento e efeito para fala, com os números
  do momento e o alvo para apontar. Até 160 caracteres, sem exclamação.
- **Gesto** (`missoes/gesto.ts`): o próximo gesto ("Agora: ...") a partir do estado; nunca contém
  um segredo do passo (teste de propriedade). **Segredos** (`missoes/segredos.ts`): o que o passo
  esconde (esperado, medidas da resolução, lacunas vazias), menos o que o enunciado já mostra.
- **Apresentações** (`apresentacoes.ts`): uma ferramenta nova por passo, nunca sobre um retorno.

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
   e um painel de controles; use `Palco` (objetivo, nota, máquina, faixa do Nônio, bancada; duas
   colunas a partir de 1024 px). Bica fechada e lugar vazio ficam a lápis (`.a-lapis`, `PassarACaneta`).
4. Uma peça nova do kit entra na `/lab/vitrine`.

## Progresso (`nucleo/progresso`)

Documento único versionado (`VERSAO_PROGRESSO`, hoje 2), lido com proteção (ilegível vira começo novo e o
original fica guardado à parte), normalizado campo a campo e migrado por cadeia testada. Guarda
preferências, calibragem, campanha (atividades, execuções, desvio, conclusões, marcas, palpites),
evidências (teto 1500), Caderno, joias, museu, cenas, revisitas, o deslocamento do relógio e,
desde a v2, as apresentações vistas (id e momento) e a preferência `conversa` (ligada ou
desligada). A migração 1 → 2 é testada com um progresso real gravado pela v0.2
(`nucleo/progresso/amostras/progresso-v1.json`). O histórico da conversa nunca é salvo.
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
2. Núcleo: `src/nucleo/**/*.test.ts`; servidor: `src/servidor/**/*.test.ts` (a rota do tutor com a
   tentativa injetada, sem rede).
3. Conteúdo: `src/conteudo/**/*.test.ts` e `src/higiene.test.ts`.
4. Navegador: `npm run e2e` (`e2e/percurso.spec.ts`, build de produção, 390×844 com toque).
Não rode `next build` com o `next dev` aberto: os dois disputam a pasta `.next`.
