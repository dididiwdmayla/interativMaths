# Design system: Quadriculado

O jogo é um **caderno de matemática**. O mundo é desenhado em papel quadriculado, a traço de
caneta, com marca-texto e anotações à mão. A ideia que organiza tudo é a diferença entre **lápis e
caneta** e entre **rascunho e passado a limpo**: o que ainda não foi feito está a lápis; o que
existe e funciona, a caneta. O quadriculado é o rascunho (a máquina); a folha pautada é o passado
a limpo (o Caderno). O Engenho desbota para lápis; entender um distrito é passá-lo a caneta.

**Referência aprovada:** `docs/referencia-visual/` (`mapa.html`, `missao.html`, `pecas.html` e,
desde a v0.3, `guia.html`: guia na missão, acertou, ainda não, Pergunte ao Nônio, aposta).
Toda tela nova se confere contra ela, no mesmo tamanho, lado a lado.

## Materiais (regra de interface, sem exceção)

| Material | Como se desenha | Significa |
|---|---|---|
| Lápis | Traço grafite cheio, preenchimento grafite-claro; etiqueta tracejada | Ainda não: em projeto, não avaliado, lugar vazio, desabilitado |
| Tinta | Contorno escuro de 2,4 px, cor chapada | Existe e funciona |
| Caneta azul | Preenchimento, traço ou letra azul | O que o jogador mexe e o que ele fez |
| Marca-texto | Faixa amarela atrás, inclinada −1,5° | Funcionou, resultado, destaque |
| Vermelho | Selo com bolinha; borda e névoa na caixa da resposta; traço de lápis | Ainda não, por um instante; sobra e atenção |
| Verde | Selo com visto, borda da máquina, etiqueta "Feito" | Acertou; dominado |

## Acertou e ainda não

**Acertou fica verde e diz o que ficou certo**, com os números do momento: selo "Acertou" com
visto na faixa do Nônio, borda verde na ficha da máquina, etiqueta "Feito" no objetivo, linha do
resumo em verde-tinta. Fica enquanto o passo está vencido.

**Ainda não fica vermelho por um instante**: selo "Ainda não" com bolinha (palavra e forma, nunca
só cor), borda vermelha e névoa (`--vermelho-nevoa`) na caixa da resposta que não bateu, o porquê
e o que tentar na voz do Nônio. Some no primeiro gesto seguinte. Nunca texto vermelho, nunca X,
nunca risco, nunca "errado". O vermelho de traço continua só para sobra e atenção.

## Tokens (`src/tema/tokens.css`, o único arquivo com cor literal)

Papel: `--papel`, `--grade` (linhas a cada 20 px), `--grade-suave` (dentro de fichas), `--folha`,
`--pauta` (linhas a cada 28 px), `--margem`. Tinta: `--tinta`, `--tinta-suave`. Lápis:
`--grafite` (só traço), `--grafite-claro`. Caneta: `--caneta`, `--caneta-escura`, `--caneta-clara`,
`--caneta-palida`. Marca-texto: `--marca-texto`, `--marca-texto-palido`. Vermelho: `--vermelho`
(só traço), `--vermelho-claro`, `--vermelho-palido` (preenchimento de objeto). Verde:
`--verde`, `--verde-tinta` (texto), `--verde-escuro`, `--verde-palido`. Névoa do ainda não:
`--vermelho-nevoa`. Bilhete da aposta: `--bilhete`. Véu das folhas: `--veu`. Materiais: `--pao`, `--pao-miolo`, `--saca`, `--madeira`,
`--palha`, `--agua`, `--agua-clara`. Joias: `--granada`, `--safira`, `--ametista`, `--turmalina`,
cada uma com `-luz`. Movimento: `--t-caneta`, `--t-assentar`, `--t-folha`, `--curva-firme`,
`--curva-saida`. O Tailwind lê os mesmos nomes (`bg-caneta`, `text-tinta-suave`...).

Contraste: tinta sobre papel 14,9:1; tinta suave sobre branco 6,2:1; branco sobre caneta 5,9:1;
tinta sobre marca-texto 12:1; verde-escuro sobre branco 5,3:1. Grafite e vermelho: só traço.

## Letra (`src/app/fontes.ts`)

- **Rubik** para tudo: 500 no texto, 600 em rótulos, 700 em botões, 800 em títulos e números.
  Algarismos tabulares. Nada em caixa alta.
- **Caveat 700** para a letra de mão: título do mapa e do distrito, títulos das páginas do
  Caderno, notas da Dália, "ainda a lápis", "você está aqui", "feita!", anotações da máquina.
  Nunca menor que 19 px, só frase curta. Número dentro da letra de mão sai em Rubik.

Tamanhos no celular: título de tela 17 a 24 px; corpo 15 a 16; rótulo 14; botão principal 18;
fração na máquina 18 px peso 800.

## Receitas (`src/tema/componentes.css`)

| Classe | Receita |
|---|---|
| `.ficha` | Branco, borda 2 tinta, raio 16, sombra dura `0 4px 0` tinta (`-quadriculada`, `-lapis`) |
| `.botao-principal` | Caneta, borda 2 tinta, raio 14, sombra 4, branco 700 18 px, 50 de altura; pressionado desce 3 px |
| `.botao-secundario` | Branco, borda 2 tinta, raio 12, tinta 600 15 px, 46 de altura |
| `.botao-discreto` | Sem borda e sem fundo, tinta suave 600, com ícone de traço |
| `.botao-icone` | 44 × 44, borda 2 tinta, raio 12 (voltar, menu, fechar) |
| `.botao-pequeno` | Branco, borda 2 tinta, raio 10, 600 de 14 px, 44 de altura (Me ajuda, Perguntar, etapas) |
| `.opcoes` + `.opcao` | Grade de botões, raio 10, 44 de altura; o escolhido em caneta com sombra 3 |
| `.passo-valor` | Menos e mais 44 × 44; o valor num quadro marca-texto pálido, 800 de 24 px |
| `.etiqueta-lugar`, `.etiqueta-nav` | Branco, borda 2 tinta, raio 10; a lápis: tracejada grafite, sem sombra |
| `.marca-texto`, `.grifo` | Faixa amarela inclinada; grifo no meio da frase |
| `.contador-passo` | Fundo tinta, branco 700, raio 7 |
| `.etiqueta-estado` | Raio 8, borda 2 tinta, 700 de 13 px, fundo pelo estado (`data-estado`) |
| `.balao-nonio`, `.cabecalho`, `.fila-lugares`, `.bancada-controles` | Como na referência |
| `.faixa-nonio` | Rosto do Nônio e balão; selo no topo do balão; ações (Me ajuda, Perguntar) embaixo |
| `.selo` | Raio 8, borda 2; acertou em verde-pálido com visto, ainda não em branco com bolinha |
| `.objetivo` | Etiqueta (Objetivo, Pergunta, Aposta do Nônio, Desafio, Feito) + instrução + linha do gesto |
| `.menu-corte` | "Cortar em" e botões de partes junto da peça, com setinha; Esta ou Todas |
| `.bilhete` | Amarelo `--bilhete`, borda 2, raio 4, inclinado −2°, letra de mão em caneta-escura |
| `.conversa-eu`, `.conversa-ele` | Balões da conversa: o jogador à direita em caneta-pálida, o Nônio à esquerda em folha |
| `.folha-pautada`, `.quadro-notacao`, `.lacuna`, `.ficha-cota` | O passado a limpo |

Disabled é lápis. Alvo de toque mínimo de 44 px. Foco: contorno de 3 px em caneta. Dentro de
uma ficha, separe com espaço; ficha dentro de ficha só para objeto de verdade (página, máquina).

## Desenho (`componentes/mundo/kit.tsx`, `maquinas/pecas.tsx`, `receptores.tsx`, `Distritos.tsx`)

Tudo em SVG. Contorno de tinta, cor chapada, sem degradê nem sombra. Desenhos que escalam usam
`traco-fixo` (o traço fica com a mesma espessura na tela). A lápis é o mesmo desenho dentro de
`.a-lapis`; `PassarACaneta` cruza as duas camadas por opacidade. Kit: engrenagem, esteira,
trilho, bica, medidor, faixa e elipse de marca-texto, anotação a caneta (Caveat azul, número em
Rubik), setinha curva, chave de cota, círculo a lápis vermelho (não fecha certinho), rabiscos de
margem (no máximo três por tela). Peças: saco, broa, pão e pizza em setores exatos, tonel com
água. Receptores: carroça, mesa, cesto, casa, prato. O lugar vazio de uma peça fica a lápis.

Na bancada: bica fechada a lápis; pilha com chave e número a caneta; sobra numa bandeja a lápis,
circulada de vermelho quando tem algo; partilha aceita ganha marca-texto nos números; o engasgo
treme na horizontal e anota o que faltou. As cotas podem ser escondidas no menu.

## Nônio (`componentes/nonio/Nonio.tsx`)

Medidor em cúpula: semicírculo caneta, janela branca com o rosto, base caneta-clara, dois
pezinhos, antena com bolinha amarela (o ponteiro). Expressões: neutro (olhos em ponto, sorriso),
atento (olhos maiores, antena em pé), medindo (olhos de lado, antena inclinada), dúvida (olhos
para cima, boca reta, cúpula inclinada 6°), satisfeito (olhos em arco, boca aberta, dois mais
azuis), quieto (olhos fechados, bolinha branca). Rostos se cruzam por opacidade; antena e
cúpula giram por transform.

## O guia na missão

- **Faixa do Nônio:** sempre na tela da missão, entre a máquina e a bancada (no computador, na
  coluna da direita). Uma voz só, até 160 caracteres, sem exclamação. A antena aponta e o lápis
  azul circula a parte da máquina de que ele fala. Me ajuda sobe a escada; depois do primeiro
  degrau, "Mais ajuda". A leitura da máquina mora dentro da faixa (`data-visor`).
- **Faixa do objetivo:** embaixo do cabeçalho, a etiqueta e a instrução (verbo primeiro, até 80
  caracteres); embaixo, a linha do gesto em caneta com o ícone da mão ("Agora: ..."). Sem gesto
  por 25 s, a linha pulsa uma vez.
- **Etapas:** botão "2/9" no cabeçalho; abre a folha com os passos (feito, agora, a lápis).
- **Mão livre:** peça escolhida ganha anel azul; mesa recebe com um toque; arrastar funciona;
  menu de corte junto da peça. Alvos de 44 px.
- **Bilhete:** a aposta do Nônio acima da máquina, à mão, assinada.
- **Folhas:** sobem da borda de baixo sobre véu (`--veu`): etapas, caso parecido, Pergunte ao
  Nônio. No computador, a conversa é um painel na coluna da direita.
- **Apresentações:** na primeira vez com uma ferramenta, véu, a ferramenta acima dele com
  contorno de caneta, um cartão com o Nônio, uma frase e "Entendi". Uma por passo.

## Movimento

O verbo é **passar a limpo**. Passar a caneta: lápis esmaece e tinta aparece (380 ms).
Marca-texto cresce da esquerda (`scaleX`). Botão desce 3 px. A folha pautada sobe da borda de
baixo (`folha-sobe`). Engasgo: tremor curto na horizontal. Peça posta pousa em 220 ms; peças
que chegam entram pela esteira; selos e apresentações esmaecem. Só `transform` e `opacity`; nada
quica, sem confete, sem traço se desenhando sozinho. Animação ambiente em CSS, pausada fora da
tela e no modo leve; `prefers-reduced-motion` troca deslocamento por esmaecer.

## Layout

Celular em pé: cabeçalho de 60 px e fila de lugares (Mapa, Caderno, Planta, Joias, Museu, A Rua);
dentro de missão, voltar, lugar sobre o título e as etapas à direita. Missão: objetivo, nota
(bilhete ou Dália), máquina na ficha quadriculada, faixa do Nônio, bancada embaixo, na zona do
polegar. A partir de 1024 px: fila no cabeçalho; missão em duas colunas (máquina à esquerda;
objetivo, faixa e bancada à direita); mapa como folha larga com o cartão no canto; Caderno,
Planta, Relicário e menu numa folha de até 880 px.

## O que evitar

Fundo escuro, degradê, brilho, metal, caixa alta, letra condensada, rebite e ornamento sem
função, cartão com faixa colorida na lateral, lista de cartões como tela principal, cinza sem cor,
ícone de pacote (ícones são SVG próprios, um por arquivo, em `componentes/icones`), emoji,
texto vermelho, X de errado.
Contorno em tudo pesa: dentro da ficha, espaço em vez de mais uma caixa.
