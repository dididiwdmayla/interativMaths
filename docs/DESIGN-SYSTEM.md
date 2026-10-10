# Design system: Quadriculado

O jogo é um **caderno de matemática**. O mundo é desenhado em papel quadriculado, a traço de
caneta, com marca-texto e anotações à mão. A ideia que organiza tudo é a diferença entre **lápis e
caneta** e entre **rascunho e passado a limpo**: o que ainda não foi feito está a lápis; o que
existe e funciona, a caneta. O quadriculado é o rascunho (a máquina); a folha pautada é o passado
a limpo (o Caderno). O Engenho desbota para lápis; entender um distrito é passá-lo a caneta.

**Referência aprovada:** `docs/referencia-visual/` (`mapa.html`, `missao.html`, `pecas.html`).
Toda tela nova se confere contra ela, no mesmo tamanho, lado a lado.

## Materiais (regra de interface, sem exceção)

| Material | Como se desenha | Significa |
|---|---|---|
| Lápis | Traço grafite cheio, preenchimento grafite-claro; etiqueta tracejada | Ainda não: em projeto, não avaliado, lugar vazio, desabilitado |
| Tinta | Contorno escuro de 2,4 px, cor chapada | Existe e funciona |
| Caneta azul | Preenchimento, traço ou letra azul | O que o jogador mexe e o que ele fez |
| Marca-texto | Faixa amarela atrás, inclinada −1,5° | Funcionou, resultado, destaque |
| Vermelho | Traço de lápis vermelho: círculo irregular, seta | Sobra e atenção. Nunca texto, nunca corrige |
| Verde | Etiqueta verde-clara com visto | Dominado |

O vermelho nunca risca, nunca sublinha resposta, nunca diz nada sobre o que o jogador sabe.
Lacuna que não bate com a máquina volta a lápis (tracejada); nada é marcado de vermelho.

## Tokens (`src/tema/tokens.css`, o único arquivo com cor literal)

Papel: `--papel`, `--grade` (linhas a cada 20 px), `--grade-suave` (dentro de fichas), `--folha`,
`--pauta` (linhas a cada 28 px), `--margem`. Tinta: `--tinta`, `--tinta-suave`. Lápis:
`--grafite` (só traço), `--grafite-claro`. Caneta: `--caneta`, `--caneta-escura`, `--caneta-clara`,
`--caneta-palida`. Marca-texto: `--marca-texto`, `--marca-texto-palido`. Vermelho: `--vermelho`
(só traço), `--vermelho-claro`, `--vermelho-palido` (preenchimento de objeto). Verde:
`--verde-escuro`, `--verde-palido`. Materiais: `--pao`, `--pao-miolo`, `--saca`, `--madeira`,
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
| `.botao-icone` | 44 × 44, borda 2 tinta, raio 12 (voltar, menu, Nônio) |
| `.opcoes` + `.opcao` | Grade de botões, raio 10, 44 de altura; o escolhido em caneta com sombra 3 |
| `.passo-valor` | Menos e mais 44 × 44; o valor num quadro marca-texto pálido, 800 de 24 px |
| `.etiqueta-lugar`, `.etiqueta-nav` | Branco, borda 2 tinta, raio 10; a lápis: tracejada grafite, sem sombra |
| `.marca-texto`, `.grifo` | Faixa amarela inclinada; grifo no meio da frase |
| `.contador-passo` | Fundo tinta, branco 700, raio 7 |
| `.etiqueta-estado` | Raio 8, borda 2 tinta, 700 de 13 px, fundo pelo estado (`data-estado`) |
| `.balao-nonio`, `.cabecalho`, `.fila-lugares`, `.bancada-controles`, `.tira` | Como na referência |
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

## Movimento

O verbo é **passar a limpo**. Passar a caneta: lápis esmaece e tinta aparece (380 ms).
Marca-texto cresce da esquerda (`scaleX`). Botão desce 3 px. A folha pautada sobe da borda de
baixo (`folha-sobe`). Engasgo: tremor curto na horizontal. Só `transform` e `opacity`; nada
quica, sem confete, sem traço se desenhando sozinho. Animação ambiente em CSS, pausada fora da
tela e no modo leve; `prefers-reduced-motion` troca deslocamento por esmaecer.

## Layout

Celular em pé: cabeçalho de 60 px e fila de lugares (Mapa, Caderno, Planta, Joias, Museu, A Rua);
dentro de missão, voltar, lugar sobre o título e o Nônio à direita. Missão: linha do pedido,
máquina na ficha quadriculada, tira, balão do Nônio, bancada embaixo. A partir de 1024 px: fila
no cabeçalho; missão em duas colunas (máquina até 760 px, coluna de 380 px); mapa como folha
larga com o cartão no canto; Caderno, Planta, Relicário e menu numa folha de até 880 px.

## O que evitar

Fundo escuro, degradê, brilho, metal, caixa alta, letra condensada, rebite e ornamento sem
função, cartão com faixa colorida na lateral, lista de cartões como tela principal, cinza sem cor,
ícone de pacote (ícones são SVG próprios, um por arquivo, em `componentes/icones`), emoji.
Contorno em tudo pesa: dentro da ficha, espaço em vez de mais uma caixa.
