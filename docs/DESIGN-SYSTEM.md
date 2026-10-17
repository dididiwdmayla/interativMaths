# Design system: Quadriculado

O jogo é um **caderno de matemática**. O mundo é desenhado em papel quadriculado, a traço de
caneta, com marca-texto e anotações à mão. A ideia que organiza tudo é a diferença entre **lápis e
caneta** e entre **rascunho e passado a limpo**: o que ainda não foi feito está a lápis; o que
existe e funciona, a caneta. O quadriculado é o rascunho (a máquina); a folha pautada é o passado
a limpo (o Caderno). O Engenho desbota para lápis; entender um distrito é passá-lo a caneta.

**Referência aprovada:** `docs/referencia-visual/`. A atual é **`v05.html`** (o Relicário vivo, a
abertura da rodada, o lance guiado, o acerto pelo caminho curto, o caminho junto, a lapidação, a
sombra, o lance no escuro; o arquivo chegou cortado no meio da tela 5, e as telas 5 a 8 foram
feitas pelo texto do pedido). `v04.html` (missão com o Nônio flutuante, janelinha, conta, Manual,
escuro) e as anteriores (`mapa.html`, `missao.html`, `pecas.html`, `guia.html`) valem no que as
novas não mudaram. Toda tela nova se confere contra ela, em 390 × 844, lado a lado.

## Materiais (regra de interface, sem exceção)

| Material | Como se desenha | Significa |
|---|---|---|
| Lápis | Traço grafite cheio, preenchimento grafite-claro; etiqueta tracejada | Ainda não: em projeto, não avaliado, lugar vazio, desabilitado |
| Tinta | Contorno de 2,4 px (`--contorno`), cor chapada | Existe e funciona |
| Caneta azul | Preenchimento, traço ou letra azul | O que o jogador mexe e o que ele fez |
| Marca-texto | Faixa amarela atrás, inclinada −1,5° | Funcionou, resultado, destaque |
| Vermelho | Selo com bolinha; borda e névoa na caixa da resposta; traço de lápis | Ainda não, por um instante; sobra e atenção |
| Verde | Selo com visto, borda da máquina, etiqueta "Feito" | Acertou; dominado |

## Acertou e ainda não

**Acertou fica verde e diz o que ficou certo**, com os números do momento: selo "Acertou" no
recado do Nônio, borda verde na ficha da máquina, etiqueta "Feito" no objetivo, resumo em
verde-tinta e a conta passada a caneta. Fica enquanto o passo está vencido.

**Ainda não fica vermelho por um instante**: selo "Ainda não" com bolinha (palavra e forma, nunca
só cor), borda vermelha e névoa na caixa da resposta que não bateu, o porquê na voz do Nônio. Some
no primeiro gesto seguinte. Nunca texto vermelho, nunca X, nunca risco, nunca "errado".

## Tokens (`src/tema/tokens.css`, o único arquivo com cor literal)

Papel: `--papel`, `--grade`, `--grade-suave`, `--folha`, `--pauta`, `--margem`. Tinta (o texto):
`--tinta`, `--tinta-suave`. **Os outros papéis da tinta, separados na v0.4:** `--contorno` (toda
borda e todo traço de desenho), `--sombra` (a sombra dura), e o texto sobre cor chapada:
`--sobre-caneta`, `--sobre-marca` (marca-texto e bilhete), `--sobre-verde`. Lápis: `--grafite`
(só traço), `--grafite-claro`. Caneta: `--caneta`, `--caneta-escura`, `--caneta-clara`,
`--caneta-palida`. Marca-texto: `--marca-texto`, `--marca-texto-palido`. Vermelho: `--vermelho`
(só traço), `--vermelho-claro`, `--vermelho-palido`, `--vermelho-nevoa`. Verde: `--verde`,
`--verde-tinta` (texto), `--verde-escuro`, `--verde-palido`. Bilhete: `--bilhete`,
`--bilhete-tinta`. O Nônio: `--nonio-cupula`, `--nonio-rosto`, `--nonio-aba`, `--nonio-traco`,
`--nonio-olho`. Materiais: `--pao`, `--pao-miolo`, `--saca`, `--madeira`, `--palha`, `--agua`,
`--agua-clara`. Joias com `-luz`. O soroban: `--soroban-conta`, `--soroban-conta-luz` (a faceta de
cima), `--soroban-livre` (a conta afastada). Véu: `--veu`. Movimento: `--t-caneta`, `--t-assentar`,
`--t-folha`, `--curva-firme`, `--curva-saida`. O Tailwind lê os mesmos nomes.

Regra: **borda e traço usam `--contorno`, sombra usa `--sombra`, texto sobre cor usa `sobre-*`.**
`--tinta` é só texto (`src/higiene.test.ts` confere). No claro, os três valem a mesma cor; no
escuro, não.

## Modo escuro

**O mesmo caderno com a luz apagada.** Papel e tinta invertem; **objetos não**: o Nônio, o pão, a
saca, a madeira, o marca-texto, o bilhete e as joias mantêm a cor própria. Mesma letra, mesmos
componentes, mesmas sombras duras (agora mais escuras que o papel). Nada de brilho, degradê ou
cor nova: só a tabela trocada, no bloco `[data-tema="escuro"]` de `tokens.css`.

- Escolha: Automático (segue o aparelho), Claro, Escuro. Lua ou sol no topo; as três no Menu.
- Sem piscar: um script no `<head>` põe `data-tema` no `<html>` antes da primeira pintura.
- A degustação segue o aparelho e aceita `?tema=claro|escuro`. Ícone e imagem de
  compartilhamento ficam claros.
- Contraste (testado em `tokens.test.ts`, nos dois modos): tinta sobre folha 13,7:1 no escuro;
  tinta suave 7,6:1; caneta como texto 6,6:1; texto sobre caneta 7,5:1.

## Letra (`src/app/fontes.ts`)

- **Rubik** para tudo: 500 no texto, 600 em rótulos, 700 em botões, 800 em títulos e números.
  Algarismos tabulares. Nada em caixa alta.
- **Caveat 700** para a letra de mão: títulos do mapa e do Caderno, notas da Dália, "ainda a
  lápis", "feita!", anotações da máquina, "resto" no Manual. Nunca menor que 19 px.

## Receitas (`src/tema/componentes.css`)

| Classe | Receita |
|---|---|
| `.ficha` | Folha, borda 2 contorno, raio 16, sombra dura `0 4px 0` sombra (`-quadriculada`, `-lapis`) |
| `.botao-principal` | Caneta, borda 2, raio 14, sombra 4, sobre-caneta 700 18 px, 50 de altura |
| `.botao-secundario` | Folha, borda 2, raio 12, tinta 600 15 px, 46 de altura |
| `.botao-icone` | 44 × 44, borda 2, raio 12 (voltar, livro, lua, tela cheia, menu, fechar) |
| `.botao-pequeno` | Folha, borda 2, raio 10, 600 de 14 px (`.botao-etapas`: "2/9", 44 de altura) |
| `.opcoes` + `.opcao` | Grade de botões; o escolhido em caneta com sombra 3 |
| `.passo-valor` | Menos e mais 44 × 44; o valor num quadro marca-texto pálido, 800 de 24 px |
| `.etiqueta-nav` | Folha, borda 2, raio 10; a lápis: tracejada grafite, sem sombra |
| `.selo` | Acertou em verde-pálido com visto; ainda não em folha com bolinha |
| `.objetivo` | Etiqueta + instrução + linha do gesto em caneta |
| `.bolha-nonio`, `.recado-nonio`, `.janela-nonio` | O Nônio flutuante (abaixo) |
| `.rascunho` | O rascunho a lápis embaixo da máquina |
| `.conta-caneta`, `.chave` | A conta passada a caneta e a conta armada |
| `.manual-pag`, `.folha-manual`, `.manual-forma` | O Manual: papel impresso |
| `.bilhete` | Amarelo, borda 2, raio 4, inclinado −2°, letra de mão em bilhete-tinta |
| `.folha-pautada`, `.quadro-notacao`, `.lacuna`, `.ficha-cota` | O passado a limpo |

Disabled é lápis. Alvo de toque mínimo de 44 px. Foco: contorno de 3 px em caneta.

## Desenho

Tudo em SVG, contorno `--contorno`, cor chapada, sem degradê nem sombra. `traco-fixo` mantém a
espessura do traço. A lápis é o mesmo desenho dentro de `.a-lapis`. Peças: saco, broa, pão, pizza
em setores exatos, tonel. Receptores: carroça, mesa, cesto, casa, prato. Na bancada: bica fechada a
lápis; pilha com chave e número a caneta; sobra numa bandeja a lápis; engasgo treme e anota.

## O Nônio flutuante (v0.4; a faixa saiu)

- **A bolinha:** 58 px no canto de baixo à direita da máquina (44 px no celular deitado), a
  cúpula do Nônio na expressão do momento; um ponto amarelo quando há fala nova; a antena balança
  devagar. O canto da máquina fica livre: a bandeja vai para a esquerda.
- **O recado:** ao lado da bolinha, até 60 caracteres, com selo quando é acerto ou ainda não.
  Some no primeiro gesto ou em 6 s. Tocar abre a janelinha.
- **A janelinha:** folha que sobe (no computador e deitado, painel lateral) com a fala inteira,
  "Antes, neste passo", Me ajuda (quatro degraus, o caso parecido dentro) e Pergunte por escrito.
  A antena aponta e o lápis azul circula a parte da máquina de que ele fala.

## O rascunho e a conta

- **Rascunho, a lápis:** embaixo da máquina, uma linha por gesto que mexeu na carga ("Volta 1: 5
  em cada · 4 × 5 = 20 · ficam 26 − 20 = 6"); a última no visor. Desfazer tira a linha.
- **Conta, a caneta:** só depois do acerto. Cartão folha com contorno e sombra dura; números em
  Rubik 800, sinais em caneta, resultado com marca-texto, o nome de cada termo embaixo. Na Missão
  3, a conta armada: as voltas do jogador viram os quocientes parciais da chave.

## O soroban (objeto, v05.html)

Desenhado a partir dos algarismos (viewBox 330 × 304, escala com a largura): cinco hastes a cada
60; contas bicônicas, hexágono de 52 × 26, passo de 28; acima da régua a de cima e o vão dela;
abaixo, quatro contas e um vão. Moldura e régua em `--madeira`, leito em `--folha`, hastes em
`--contorno`, pontos da régua em marca-texto (unidades e milhar). Conta **encostada** (a que
conta) em `--soroban-conta` com a faceta de cima em `--soroban-conta-luz`; **afastada** em
`--soroban-livre`; as duas com contorno. Na madeira as contas são da mesma cor: aqui a que conta
fica azul, para ler mais rápido. **Haste da vez**: faixa marca-texto pálido e o rótulo numa
etiqueta marca-texto. **Lance feito limpo**: visto verde ao lado do algarismo. **Acerto**: borda
verde na ficha e a haste do último lance em verde pálido. **Que vai se mexer** (o caminho junto):
borda de caneta, seta e o número da ordem na conta que se toca. Rótulos em cima e algarismos
embaixo (zeros à esquerda em grafite) conforme o nível; na sombra, as contas não aparecem.
**O toque é a exceção consciente aos 44 px:** a largura da haste (60) na altura de cada conta
(28); o vão não faz nada. Contas deslizam 160 ms (`transform`); com movimento reduzido, não deslizam.

## A bancada de lapidação

A rodada usa o palco da missão: faixa da operação (o verbo, a operação grande com o algarismo da
vez em marca-texto e os feitos sublinhados em verde, a linha do gesto em caneta), o soroban na
ficha quadriculada com o Nônio no canto de baixo, e o painel (rascunho a lápis, Os pares,
Desfazer, Zerar; no fim, a conta passada a caneta com um lance por linha e a etiqueta da técnica
em caneta pálida). Ler e o imaginado trazem o teclado (teclas de 46 px, a caixa marca-texto pálido;
"ainda não" é borda vermelha e névoa). O soroban pequeno (uma ou duas hastes) mostra o exemplo
e o caso parecido, com a ordem em marca-texto à direita. **A lapidação**: a folha que sobe sobre
o véu; a gema anterior esmaece e encolhe, a nova se desenha faceta por faceta (só opacidade e
transform), "lapidada!" à mão em verde. Sem nota, porcentagem ou sequência de dias.

## O Manual

**Papel impresso, não caderno:** folha, Rubik, sem pauta e sem letra de mão (o Caderno continua
sendo a letra do jogador e da Dália). Índice por área, páginas com selo "Restaurada", rasgadas
tracejadas em grafite com o ícone de folha rasgada, as sem missão a lápis. A página: Em uma frase,
Como se escreve (exemplo, forma e termos), Na máquina (desenho parado), Vale sempre, Cuidado
com, Os nomes. Nome formal: área e conteúdo ("Missão 4 · Aritmética · Frações"), nunca ano escolar.

## Movimento

O verbo é **passar a limpo**. Passar a caneta: lápis esmaece e tinta aparece (380 ms).
Marca-texto cresce da esquerda. Botão desce 3 px. Folhas sobem da borda de baixo. Só `transform`
e `opacity`; nada quica, sem confete. `prefers-reduced-motion` troca deslocamento por esmaecer.

## Layout

Celular em pé: topo de 60 px (marca, joias depois da primeira, lua ou sol, tela cheia, menu) e
fila de lugares (Mapa, Caderno, Manual, Planta, Joias, Museu, A Rua). Na missão: voltar, nome
formal sobre o título, livro e etapas; objetivo, máquina grande com a bolinha no canto, rascunho
ou conta e controles na zona do polegar. A partir de 1024 px: missão em duas colunas (máquina à
esquerda; objetivo, rascunho ou conta e controles à direita); telas de folha até 880 px.

## O que evitar

Escuro como direção visual nova (o escuro é a mesma tabela), degradê, brilho, metal, caixa alta,
letra condensada, ornamento sem função, cartão com faixa colorida na lateral, cinza sem cor, ícone
de pacote (ícones são SVG próprios, um por arquivo), emoji, texto vermelho, X de errado, `--tinta`
em borda ou sombra. Contorno em tudo pesa: dentro da ficha, espaço em vez de mais uma caixa.
