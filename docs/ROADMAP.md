# Roadmap

Status do trabalho. Leia antes de começar; atualize no fim de cada sessão.

## Implementado e verificado
- Etapa 0 — Base: Next.js 16 (App Router, Cache Components), TypeScript estrito, Tailwind v4 lendo
  `src/tema/tokens.css`, fontes (Big Shoulders, Atkinson Hyperlegible Next, Caveat), Vitest e Playwright.
- Etapa 1 — Núcleo: `Racional` exato e leitura por extenso; notação com papéis; currículo; evidências
  e modelo de domínio v1 (sondagem, ajuste, revisita); progresso versionado com normalização, cadeia
  de migrações e relógio injetável. Higiene: cor literal só em tokens, zero emoji, conteúdo sem função.
- Etapa 2 — Máquinas: bancada de partilha (Repartidor + Fatiador) com desfazer, recomeçar, engasgo
  medido, viabilidade de corte e seis validadores por propriedade do estado; invariante de
  conservação testada; desenho SVG com kit de peças, cotas vivas, medidor de nível, cinco peles;
  toque e teclado; `/lab/maquinas`.
- Etapa 3 — Missões: motor puro (entrada → execução + efeitos); as cinco missões do Arco 1 como
  dados, com provas diretas, soluções de teste e sabotagens; checagens de conteúdo; tela da missão
  (palpite, máquina, previsão conferida, frase com cotas, dobra, compressão em notação, caminho de
  volta, registro); Nônio com escada de dicas e "resolver junto"; Caderno.
- Etapa 4 — Mundo: abertura, calibragem D1–D6, mapa do Engenho em corte, distrito, Planta,
  Relicário (vitrine), menu, `/lab/progresso`.
- Etapa 5 — Transferência e retenção: eco, revisita gerada por semente, sondagem com desvio e volta
  ao ponto exato, Museu ("Os pães de Ahmes"), Rua ("Três pizzas, quatro amigos").
- Etapa 6 — Acabamento: avisos de falha do progresso, páginas de erro e de sala inexistente, ícone
  gerado dos tokens, rota `POST /api/tutor` desligada com contrato, `/lab/vitrine`, percurso de
  navegador (`npm run e2e`), capturas em `docs/capturas/v0.1/`, documentação.

## Parcialmente implementado
- Joias: contratos, estágios e campos no progresso prontos; só a Joia do Ábaco é encontrada (fim do
  arco). Treino e bancada de lapidação aparecem como em projeto.
- Equivalência de frações: aparece como prévia (Missão 4, comparação; Missão 5, dois jeitos), sem
  formalização nem conceito ativo.
- Palpites: guardados no progresso para a futura Joia da Estimativa; ainda não geram evidência.
- Tutor por conversa: contrato e rota prontos; sem integração com modelo.

## Planejado
- Treino das joias, começando pelo soroban (sessão própria).
- Arco 2 de A Partilha: equivalência, comparação, fração de quantidade, razão e proporção.
- O Contrapeso (incógnitas e equações) e os outros distritos.
- Segunda exposição do museu e novas cenas da Rua (as três categorias já existem nos dados).
- Revisitas espaçadas além da primeira (hoje: uma revisita até consolidar).

## Fora do escopo atual
- Som; chamada a modelo generativo; conta, login, banco, sincronização; multiplayer, ranking, loja,
  economia; aplicativo nativo; editor de fases; simulador físico genérico.
