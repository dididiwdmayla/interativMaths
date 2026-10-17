# Autoria: como acrescentar conteúdo sem mexer no código

Para as **sessões de conteúdo** (Sonnet, Codex): missões em máquina que já existe, cenas da Rua,
exposições do Museu, páginas do Manual, falas do Nônio, textos e números da lapidação. Tudo é
**dado** em `src/conteudo/`, e as checagens conferem sozinhas. Leia também `CLAUDE.md`.

**Não mexa em** `src/nucleo/`, `src/componentes/`, `src/app/`, `src/tema/tokens.css` nem nos
testes de fora de `src/conteudo/`. Ids publicados (conceito, missão, passo, joia, técnica) não mudam.

## Regras de texto (valem para tudo)

- PT-BR, frases curtas, tom adulto e calmo. Sem exclamação. Zero emoji.
- Nunca "errado" (nem variações), nota de prova, série, ano escolar, ranking, cronômetro,
  sequência de dias. O que não bateu é "ainda não", passageiro. Verde é acertou.
- Nome formal é área e conteúdo ("Missão 4 · Aritmética · Frações"), nunca ano nem código.
- Instrução (`instrucao`): verbo no imperativo primeiro (lista em `src/nucleo/missoes/instrucao.ts`),
  até 80 caracteres, termina em ponto. Pedido (`pedido`): até 44.
- Recado do Nônio: até 60 caracteres, já com os números do momento.
- O Nônio nunca dá a resposta do passo; dá uma medida, uma pergunta, um caso com outros números.
- Toda conta escrita precisa estar certa (as checagens refazem as contas).

`src/conteudo/textos.test.ts` percorre **todo** texto exportado de `src/conteudo/` e barra emoji,
as palavras proibidas, recado longo e instrução sem verbo. Conteúdo novo é checado sozinho.

## Como verificar (sempre)

```
npm test            # checagens de conteúdo e do núcleo
npm run verificar   # tipos, lint, testes e build (antes de entregar)
```

## Receita 1: missão nova numa máquina que existe

Arquivos: `src/conteudo/missoes/mN-nome.ts` (a `Atividade`) e uma linha em
`src/conteudo/missoes/index.ts`. Exemplo mínimo que passa nas checagens (fora do catálogo):
**`src/conteudo/exemplos/missao-minima.ts`**. Copie, troque ids e textos.

Campos obrigatórios: `id` ("partilha.arcoN.slug"), `tipo: "missao"`, `distrito`, `arco`, `numero`,
`titulo`, `ideia`, `conceitos` (ids de `conceitos.ts`), `passos`, `solucoesDeTeste`, `sabotagens`.
Cada passo: `id`, `tipo`, `fase`, `pedido`, `instrucao`. Passo `operar`, `prever` ou `frase` tem a
escada de **três** `dicas` (olhar, medir, caso parecido com outros números). Equívocos citados
existem em `equivocos.ts`. A missão termina num passo `registro` com a `pagina` do Caderno.
Pelo menos uma solução de teste por modo; sabotagens com o equívoco esperado. Com a mão livre
ligada (o padrão), uma solução usa `colocar`; sem ela, `maoLivre: false` na máquina.
Nome formal: vem dos conceitos; use `conteudoFormal` só quando não basta.

## Receita 2: cena da Rua

Arquivo próprio (`src/conteudo/rua-nome.ts` ou dentro de `rua.ts`) e uma linha em
`src/conteudo/atividades.ts`. Exemplo: **`src/conteudo/exemplos/cena-minima.ts`**.
`tipo: "cena"`, `distrito: "rua"` e a `categoria` certa:
- `aplicacao-direta`: a mesma conta, do mesmo jeito, fora do Engenho;
- `analogia-conceitual`: ideia parecida; ajuda a enxergar, não substitui a prática de lá;
- `transferencia-com-treino`: a conta aparece, mas fazer bem aquilo pede treino daquilo.
Nunca prometa que estudar isto melhora esporte, inteligência ou outra coisa. A porta da Rua abre
a primeira cena ainda não feita; o distrito chama todas.

## Receita 3: exposição do Museu

Modelo: `src/conteudo/museu.ts`. Uma linha em `atividades.ts`. `tipo: "exposicao"`, as três
faixas no passo narrativo: `sabe` (o que se sabe), `interpretacao`, `simplificamos`, e `fontes`.
**Toda afirmação histórica tem fonte conferida na web nesta sessão; sem fonte, não entra.**
Datas com "por volta de" quando as fontes divergem. Cite as fontes no comentário do arquivo.

## Receita 4: página do Manual

Arquivo: `src/conteudo/manual.ts`. Uma página por conceito que alguma missão ensina (os outros
ficam em `CONCEITOS_A_LAPIS`; tire de lá quando a missão chegar). Campos: `conceito`, `slug`,
`frase`, `escrita` (`exemplo` e `forma` verdadeiros, `termos` com um `marca: true`), `maquina`
(`config`, `acoes`, `descricao`, `mostra` com os números do exemplo), `valeSempre`, `cuidado`
(ids de equívocos), `nomes`. As checagens em `manual.test.ts` refazem tudo na máquina.

## Receita 5: falas e recados do Nônio

Arquivos: `reacoes.ts` (retornos e motivos), `tutor.ts` (a janelinha e a conversa),
`apresentacoes.ts` (uma frase por ferramenta nova), `gestos.ts` (a linha "Agora: ...") e
`lapidacao.ts` (`RECADOS_LAPIDACAO`). Marcadores entre chaves (`{d}`, `{haste}`, `{lote}`) são
preenchidos pelo núcleo: não invente marcador novo. Fala longa leva um `recado` de até 60.

## Receita 6: textos e números da lapidação

Arquivo: `src/conteudo/lapidacao.ts`.
- `PARAMETROS_LAPIDACAO`: operações por rodada, lances limpos para firmar, rodadas que contam,
  limpos por rodada, intervalo em horas, intercaladas. Pode afinar; `lapidacao.test.ts` confere
  que os números fazem sentido.
- `ABERTURAS`: frase, destaque, exemplo (somar a + b com a técnica dela) e pares.
- `RECADOS_LAPIDACAO`, `AJUDA_LAPIDACAO` (degraus 1 a 3; o 4 é sempre o caminho junto),
  `GESTOS_SOROBAN`, `FIM_RODADA`, `RELICARIO_VIVO`. Os casos parecidos são calculados pelo núcleo.
- Os dados da joia (habilidade, estágios, nomes das técnicas, `aLapis`) ficam em `joias.ts`.

## Quando parar e devolver para uma sessão com Opus

Pare e descreva o que falta quando o conteúdo precisar de: tipo novo no núcleo (passo, validador,
medida, marcador), máquina ou pele nova, componente, cor ou token, rota nova, arco ou distrito
novo, joia treinável nova, ou quando uma checagem fora de `src/conteudo/` falhar. Não contorne
uma checagem: ela existe para a matemática do jogo ficar certa.

## Formato do relatório (curto, em PT-BR)

1. O que entrou (arquivos e ids).
2. Fontes conferidas (exposições), com o endereço de cada uma.
3. O que ficou de fora e por quê.
4. Resultado de `npm run verificar`.
5. Como ver: a rota, e o salto do `/lab/progresso` que leva até lá.
