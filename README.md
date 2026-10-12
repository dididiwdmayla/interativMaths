# interativMaths

Jogo web, em português do Brasil, que ensina matemática por experimentação. O jogador chega ao
Engenho, uma máquina do tamanho de uma cidade desenhada num caderno, que está desbotando para lápis,
e passa cada distrito a caneta de novo descobrindo por que ele funciona. Esta versão traz o Arco 1 de A Partilha (repartir e o
que fazer com o que sobra), o Caderno, a Planta, o Relicário, o Museu e a Rua.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run verificar  # tipos, lint, testes (núcleo e conteúdo) e build
npm run e2e        # build + o percurso de navegador (Playwright, 390×844 com toque)
```

Não rode `next build` com o `next dev` aberto: os dois disputam a pasta `.next`.

## Publicar

Na Vercel, sem variável de ambiente nenhuma. O `vercel.json` fixa o preset Next.js, para o deploy
não depender do preset escolhido quando o projeto foi ligado (o repositório só tinha o README).

## Rotas do jogo

`/` decide para onde ir (abertura, calibragem ou mapa). Depois: `/mapa`, `/partilha` (o distrito),
`/partilha/carga-igual` e as outras missões (`?modo=prova` para a prova direta, `?modo=registro` para
fazer só o registro), `/partilha/revisita`, `/museu/paes-de-ahmes`, `/rua/tres-pizzas`,
`/caderno`, `/planta`, `/relicario`, `/menu`.

`/degustacao` é a ilhota de cinco a dez minutos para quem nunca viu o jogo; funciona sozinha e
embutida (dentro de um iframe ou com `?embed=1`) na recepção do interativAI. Endereço oficial:
https://matematica.interativai.com.

## Laboratório (fora da navegação e dos buscadores)

- `/lab/maquinas`: a bancada solta, com qualquer configuração e pele, e qualquer validador.
- `/lab/progresso`: zerar, saltar para pontos do arco (montados rodando as soluções de teste no
  motor), **adiantar o relógio um dia** (a revisita aparece no mapa), ver evidências e estados.
- `/lab/vitrine`: a identidade Quadriculado inteira (materiais, tokens, letra, receitas, kit de
  desenho, Nônio, joias, notação). A referência aprovada está em `docs/referencia-visual/`.

## Documentos

`CLAUDE.md` (regras), `docs/PROJETO.md`, `docs/ARQUITETURA.md`, `docs/MAPA-CURRICULAR.md`,
`docs/DESIGN-SYSTEM.md`, `docs/ROADMAP.md`, `docs/capturas/`.
