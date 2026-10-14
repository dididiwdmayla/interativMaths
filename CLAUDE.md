# interativMaths — regras para toda sessão

Jogo web em PT-BR que ensina matemática por experimentação. Universo: o Engenho.
Visão e tom em `docs/PROJETO.md`; módulos e contratos em `docs/ARQUITETURA.md`.
A referência visual aprovada mora em `docs/referencia-visual/`; toda tela nova se confere contra ela
(identidade Quadriculado, regras em `docs/DESIGN-SYSTEM.md`).

## Antes e depois
- Antes de começar, leia o status em `docs/ROADMAP.md` e continue da primeira etapa não concluída.
- No fim, atualize o `docs/ROADMAP.md` (quatro seções: implementado e verificado; parcialmente
  implementado; planejado; fora do escopo atual). Não refaça o que está marcado como verificado.
- O Next.js deste projeto (16.x) muda entre versões: leia `node_modules/next/dist/docs/` antes de
  usar uma API do framework. Mantenha o bloco do Next no `AGENTS.md`.

## Regras de código
- TypeScript estrito, sem `any`. Nomes de domínio em português.
- `src/nucleo/` é TypeScript puro (sem React, sem Next) e determinístico.
- `src/conteudo/` é SÓ DADO: nada de função nem JSX. Missão nova = arquivo de dados + checagem.
- Toda quantidade é inteiro ou `Racional` exato. Ponto flutuante só para posicionar desenho.
- A tela desenha o estado da simulação; quem decide é o núcleo.
- Cor literal só em `src/tema/tokens.css`. Em todo o resto: `var(--token)` ou classe do Tailwind.
- Zero emoji, em código, conteúdo e interface. Expressividade vem de SVG.
- Ícones: SVG próprio, um por arquivo. Sem kit de interface, pacote de ícones ou lib de gráficos.
- Anime só `transform` e `opacity`. Movimento reduzido troca deslocamento por esmaecer.
- Interface em PT-BR, frases curtas, tom adulto. Nunca "errado", nota, série, cronômetro, ranking.
- Nenhuma chave no navegador: nada de `NEXT_PUBLIC_` com segredo. Correção matemática é do motor.
- Ids publicados (conceito, missão, passo) não mudam. Renomear exige migração do progresso.
- Raiz de cada tela expõe `data-pronto`, `data-passo`, `data-fase` para teste.
- Todo passo tem `instrucao` com verbo no imperativo primeiro (até 80 caracteres, termina em ponto).
- A IA só conversa: passa pelas guardas e nunca dá a resposta do passo; correção é do motor.
- Verde é acertou; vermelho é ainda não, passageiro, nunca em texto (sem X, sem "errado").

## Testes em camadas (gaste onde há risco)
1. `npm run tipos`, `npm run lint`, `npm run build`.
2. Unitários do núcleo (`src/nucleo/**/*.test.ts`).
3. Checagens de conteúdo (`src/conteudo/**/*.test.ts`): toda solução de teste passa,
   toda sabotagem falha com o equívoco declarado. Missão sem solução comprovada não é publicada.
4. Um percurso de navegador (`npm run e2e`, Playwright, Chromium em `/opt/pw-browsers`).
5. Capturas em 390x844 e 1440x900, olhadas de verdade. No máximo oito em `docs/capturas/`.
Depois de um ajuste cosmético, rode só o que ele toca. `npm run verificar` roda 1 a 3 e o build.

## Git
- Nunca commit direto na `main`: trabalhe numa branch e abra pull request.
- Mensagens de commit em português, descrevendo o resultado, sem emoji.

## Relatório final (resposta e descrição do PR), curto, em PT-BR
- O que foi feito (por etapa, uma ou duas linhas cada).
- O que ficou faltando ou foi adiado, e por quê.
- Decisões a conferir.
- Riscos concretos.
- Como ver (rotas, inclusive `/lab`, e o que testar primeiro no celular).
- Próximo passo recomendado.
