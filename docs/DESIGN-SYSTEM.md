# Design system

Direção: **dois materiais, dois modos de pensar.** O mundo é noite com luz quente (azul profundo,
janelas âmbar, máquinas em esmalte e latão): é onde se experimenta. A matemática formal é papel
(creme, tinta escura, a letra da Dália nas margens): é onde se registra. A passagem entre os dois é
**a dobra**: uma página se desdobra por cima do mundo a partir da borda de baixo.

## Tokens (`src/tema/tokens.css`, a única cor literal)

| Token | Uso |
|---|---|
| `--noite`, `--noite-clara`, `--noite-funda`, `--noite-borda` | fundo e estrutura do mundo |
| `--texto-mundo`, `--texto-mundo-suave`, `--texto-mundo-apagado` | texto sobre a noite (AA) |
| `--turquesa` (+ clara, sombra, tinta) | **tudo o que o jogador pode mexer** |
| `--ambar` (+ sombra, halo), `--janela` | funcionou, está energizado; acerto é luz acendendo |
| `--vermelhao` (+ sombra, claro) | sobra, excesso, atenção. Nunca "erro" |
| `--latao`, `--mostarda`, `--esmalte`, `--aco` | estrutura das máquinas, placas, rebites |
| `--papel`, `--tinta`, `--tinta-dalia`, `--tinta-vermelha` | matemática formal |
| `--saca`, `--broa`, `--miolo`, `--pizza`, `--agua`, `--madeira`, `--pao` | materiais das peles |
| `--granada`, `--safira`, `--ametista`, `--turmalina` | uma cor de mineral por joia |

Nada de verde de "certo" e vermelho de "errado". Contraste de texto conferido em AA (texto suave
sobre noite 8,5:1; turquesa sobre noite 7:1; vermelhão sobre noite 4,8:1; tinta sobre papel 13:1).

## Tipografia (`next/font/google`)

- **Big Shoulders**: placas, títulos, números grandes (mostradores).
- **Atkinson Hyperlegible Next**: texto e algarismos (tabulares); caracteres parecidos não se
  confundem, o que em matemática é função.
- **Caveat**: só a letra da Dália, nas margens do Caderno.

## Forma

Tudo em SVG e CSS, sem imagem gerada. Geometria simples, duas tonalidades por forma (luz e sombra),
sem degradê, exceto o céu do mapa e o halo das luzes.

**Kit de peças** (`componentes/mundo/kit.tsx`): Rebite, Viga, Placa esmaltada, Lâmpada (apagada,
piloto, acesa, atenção), Volante (turquesa quando mexível), Rolo, Cano, Engrenagem. Peças
(`componentes/maquinas/pecas.tsx`): saco; broa, pizza e pão como discos (inteira mostra a casca,
pedaço cortado mostra o miolo, setores do tamanho exato); tonel com água em fatias. Receptores:
carroça, mesa, cesto, casa, prato. Tudo aparece em `/lab/vitrine`.

**Cotas vivas** (`componentes/maquinas/cota.tsx`): linhas de cota de desenho técnico presas às
máquinas, com o número exato (fração empilhada). Podem ser escondidas no menu; pedir uma medida ao
Nônio mostra uma cota em turquesa-clara.

**Controles pertencem ao mundo**: botão é placa esmaltada (`.placa`) ou alavanca (`Alavanca`);
painel é chapa de instrumento (`.chapa`); valor é mostrador (`.mostrador`). Alvos de 44 px no
mínimo. Nada depende de hover: a cor turquesa ensina onde tocar.

**Papel** (`.papel`, `FolhaPapel`): grade fina, margem vermelha, notas da Dália em Caveat.
Notação: `×` e `÷`, fração empilhada com traço horizontal, vírgula decimal; leitura por extenso
para leitor de tela.

## Layout

Celular em pé (390 × 844): máquina na metade de cima, enquadrada sozinha; controles na zona do
polegar; pedido atual numa linha. Deitado ou no computador: máquina de um lado, bancada do outro
(`Palco`). Girar o aparelho só troca o CSS. A bancada mede a própria área e redistribui a altura.

## Movimento

Mecânico: esteira em ritmo constante, mecanismo assenta com pouco excesso
(`--curva-mecanica`), luz acende em 300 a 600 ms (`--t-luz`). Nada quica; sem confete.
Só `transform` e `opacity`. Animação ambiente em CSS, pausada fora da tela e durante a rolagem
(`useAmbiente`), e parada no modo "animações leves". `prefers-reduced-motion` troca deslocamentos
por esmaecer (inclusive a dobra).

## O que evitar

Grade de cartões retangulares, cara de painel administrativo, barra de progresso como único
indicador, questionário enfeitado, paleta de doce, emoji (um teste barra), ícones de pacote (os
ícones são SVG próprios, um por arquivo, em `componentes/icones`).
