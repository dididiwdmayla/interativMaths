# interativMaths

Jogo web, em português do Brasil, que ensina matemática por experimentação. O jogador chega ao
Engenho, uma máquina do tamanho de uma cidade desenhada num caderno, que está desbotando para lápis,
e passa cada distrito a caneta de novo descobrindo por que ele funciona. Esta versão traz o Arco 1 de A Partilha (repartir e o
que fazer com o que sobra), o Caderno, o Manual, a Planta, o Relicário, o Museu e a Rua, com o
Nônio guiando cada missão, e a primeira joia treinável: a do Ábaco, lapidada no soroban. Claro ou
escuro, em tela cheia ou instalado no celular.

## Rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run verificar  # tipos, lint, testes (núcleo e conteúdo) e build
npm run e2e        # build + os percursos de navegador (Playwright, 390×844 com toque)
```

Não rode `next build` com o `next dev` aberto: os dois disputam a pasta `.next`.

## Publicar

Na Vercel. O `vercel.json` fixa o preset Next.js, para o deploy não depender do preset escolhido
quando o projeto foi ligado. O jogo funciona sem variável de ambiente nenhuma.

## Ligar a conversa com o Nônio (opcional)

"Pergunte por escrito", na janelinha do Nônio, responde perguntas livres sobre a missão com o
Claude Haiku 5.5, da Anthropic. Sem a chave, ele não aparece e o resto é igual.

1. No Console da Anthropic (platform.claude.com), crie uma chave de API, ponha crédito e, se
   quiser, um limite de gasto mensal.
2. Na Vercel, no projeto, crie `ANTHROPIC_API_KEY` com a chave (Production e Preview) e refaça o
   deploy.

Variáveis (todas só de servidor; nunca com o prefixo `NEXT_PUBLIC_`), documentadas em `.env.example`:

| Variável | Para quê |
|---|---|
| `ANTHROPIC_API_KEY` | A chave. Sem ela, a conversa não aparece. |
| `TUTOR_MODELO` | O modelo (padrão `claude-haiku-5-5`). |
| `TUTOR_MODELO_RESERVA` | Opcional: uma tentativa nele quando o principal está sobrecarregado. |
| `TUTOR_SIMULAR` | Só fora de produção: `resposta` mostra a tela sem chave; também `sobrecarga`, `sobrecarga-total`, `rede`, `entrega`, `conta-falsa`. |

Para ver a conversa localmente sem chave: `TUTOR_SIMULAR=resposta npm run dev`. O jogador pode
desligar as perguntas no menu ("Perguntas por escrito ao Nônio (usa IA)").

## Rotas do jogo

`/` decide para onde ir (abertura, calibragem ou mapa). Depois: `/mapa`, `/partilha` (o distrito),
`/partilha/carga-igual` e as outras missões (`?modo=prova` para a prova direta, `?modo=registro` para
fazer só o registro), `/partilha/revisita`, `/museu/paes-de-ahmes`, `/rua/tres-pizzas`,
`/caderno`, `/manual` (e `/manual/divisao-com-resto` e as outras páginas), `/planta`, `/relicario`,
`/menu`. Depois da Missão 5: `/relicario/abaco` (a bancada de lapidação: a rodada no soroban) e
`/relicario/abaco/livre` (o soroban livre, sem rodada).

## Claro, escuro, tela cheia e instalar no celular

- **Claro ou escuro:** a lua (ou o sol) no topo alterna; o Menu tem Automático (segue o aparelho),
  Claro e Escuro. A escolha fica guardada e o jogo já abre do jeito certo, sem piscar.
- **Tela cheia:** o botão dos quatro cantos no topo (ou no Menu) esconde as barras do navegador;
  sai com o mesmo botão, com Esc ou com o voltar do Android. Só aparece onde o navegador deixa.
- **Instalar:** no Android, o Chrome oferece "Instalar app" (ou Adicionar à tela inicial). No
  iPhone, o Safari não deixa site em tela cheia: em Compartilhar, Adicionar à Tela de Início; o
  jogo instalado abre sem as barras (o Menu ensina isso no próprio iPhone).

`/degustacao` é a ilhota de cinco a dez minutos para quem nunca viu o jogo; funciona sozinha e
embutida (dentro de um iframe ou com `?embed=1`) na recepção do interativAI. Ela segue o claro ou o
escuro do aparelho e aceita `?tema=claro` ou `?tema=escuro`; embutida, a tela cheia só existe se o
iframe tiver `allow="fullscreen"`. Endereço oficial:
https://matematica.interativai.com.

## Laboratório (fora da navegação e dos buscadores)

- `/lab/maquinas`: a bancada solta, com qualquer configuração e pele, qualquer validador, com ou
  sem mão livre.
- `/lab/progresso`: zerar, zerar só as apresentações, saltar para pontos do arco (montados rodando
  as soluções de teste no motor), **adiantar o relógio um dia** (a revisita aparece no mapa; uma
  técnica de estágio 2 que espera o intervalo volta a firmar), ver evidências e estados. Saltos da
  Joia do Ábaco: encontrada, talhada, talhada com o complemento de 5 firmando ou esperando,
  prestes a lapidar, lapidada, polida, e uma rodada parada no meio de um lance.
- `/lab/soroban`: o soroban livre com o reconhecedor à vista (digite "26 + 7", faça na máquina e
  veja cada lance com as marcas, o custo e a distância) e o gerador de rodadas por foco e semente.
- `/lab/vitrine`: a identidade Quadriculado inteira (materiais, tokens, letra, receitas, kit de
  desenho, Nônio, a bolinha nos estados, o recado, a janelinha, selos, objetivo, bilhete, menu de
  corte, o rascunho, as duas contas, uma página do Manual, tudo de novo no escuro, joias,
  notação, e da v0.5 o soroban em cada nível, o teclado, a ficha do Relicário e a lapidação). A
  referência aprovada está em `docs/referencia-visual/` (`v05.html` é a da v0.5).

## Documentos

`CLAUDE.md` (regras), `docs/PROJETO.md`, `docs/ARQUITETURA.md`, `docs/MAPA-CURRICULAR.md`,
`docs/DESIGN-SYSTEM.md`, `docs/ROADMAP.md`, `docs/AUTORIA.md` (para as sessões de conteúdo),
`docs/capturas/`.
