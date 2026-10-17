# Roadmap

Status do trabalho. Leia antes de começar; atualize no fim de cada sessão.

## Implementado e verificado
- Etapa 0 — Base: Next.js 16 (App Router, Cache Components), TypeScript estrito, Tailwind v4 lendo
  `src/tema/tokens.css`, Vitest e Playwright. (Fontes e visual trocados na v0.2, abaixo.)
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
  navegador (`npm run e2e`), documentação.
- v0.2 — Retrabalho visual **Quadriculado** (a identidade escolhida pelo Will; referência em
  `docs/referencia-visual/`, regras em `docs/DESIGN-SYSTEM.md`):
  - Base: tokens de lápis, tinta, caneta, marca-texto, vermelho de traço e verde; Rubik e Caveat;
    fundo quadriculado; receitas de componente em `componentes.css`; `/lab/vitrine` com o sistema.
  - Desenho: kit a traço de tinta e a lápis (`PassarACaneta`), peças, receptores, cotas como
    anotação a caneta, círculo a lápis vermelho, Nônio em cúpula com as seis expressões.
  - Bancada nas cinco peles: tira de mensagem, sobra a lápis circulada, engasgo horizontal.
  - Missão (todas as fases, folha pautada que sobe, recorte do Museu, foto da Rua) e Caderno pautado.
  - Mundo: cabeçalho com fila de lugares, mapa em papel (folha larga no computador), distrito como
    caminho com paradas, abertura que desbota para lápis, calibragem em fichas.
  - Planta (etiquetas e linhas pela regra do lápis e da caneta), Relicário, menu, telas de estado,
    aviso de progresso, ícone do site, laboratório.
  - Computador: missão em duas colunas que cabe em 1440 × 900; folhas centradas de até 880 px.
  - Texto: vocabulário de luz e latão trocado por lápis, caneta e passar a limpo (ids intactos).
  - Verificação: `npm run verificar`, `npm run e2e`, comparação lado a lado com a referência,
    capturas em `docs/capturas/v0.2/`.

- Ilhota de degustação (`/degustacao`): a Missão 4 encurtada para o primeiro contato, sem
  pré-requisito (5 broas para aquecer, palpite, 3 broas para 4 mesas, previsão de 2 para 3, frase,
  notação e 5 ÷ 8 sem a máquina); no fim, a padaria passa a caneta, um trailer do resto do Engenho
  (o que existe a caneta, o que falta a lápis) e "Quero continuar". Roda numa loja de progresso à
  parte (`interativmaths:degustacao`): não lê nem muda o progresso do jogo.
- Modo embutido: dentro de um iframe ou com `?embed=1`, sem o voltar; `frame-ancestors` só em
  `/degustacao` ('self', interativai.com, www.interativai.com, *.vercel.app para as prévias de
  deploy); mensagens `{ fonte: "interativmaths", tipo }` (pronto, concluiu, quero-continuar,
  fechar) só para a origem da página-mãe permitida; armazenamento bloqueado não quebra nada.
  Sozinha, "Quero continuar" leva a `https://interativai.com/acesso?produto=matematica`.
- Endereço oficial `https://matematica.interativai.com`: `metadataBase`, URL canônica de `/` e de
  `/degustacao`, Open Graph e imagem de compartilhamento gerada dos tokens. O
  `interativmaths.vercel.app` continua respondendo.
- Verificação: `npm run verificar`, `npm run e2e` (a degustação nos três layouts até "Quero
  continuar"; embutida numa página de teste, com as mensagens certas, e uma origem não permitida
  que nem embute nem recebe nada), capturas em `docs/capturas/degustacao/`.
- v0.3 — **O Nônio guia e a missão viva** (referência nova em `docs/referencia-visual/guia.html`):
  - Base: tokens de acertou e ainda não (`--verde`, `--verde-tinta`, `--vermelho-nevoa`), bilhete e
    véu; mão livre no núcleo (colocar, devolver, cortar, com eventos e testes de propriedade);
    validadores `partilha.inteiras-por-bica` e `partilha.composicao`; execução v2 (assinatura dos
    passos) e progresso v2 (apresentações, preferência da conversa) com migração testada contra um
    progresso real da v0.2.
  - Faixa do Nônio sempre na missão (fila de falas, reações com os números do momento, apontar);
    verde quando acertou, "ainda não" passageiro (some no gesto seguinte), escada dentro da faixa.
  - Toda tela diz o que fazer: `instrucao` com verbo em todo passo (checada), linha do gesto,
    etapas ("2/9"), botões que dizem o que fazem, lembrete de 25 s.
  - Mão livre na tela: tocar e arrastar peças, devolver, menu de corte, teclado, alvos de 44 px.
  - Passos novos: aposta do Nônio (nas Missões 2, 3 e 4; na 2 ele tem razão), chegada (peças e bica
    que chegam), desafio; as cinco missões revistas com soluções e sabotagens.
  - Pergunte ao Nônio: rota com o SDK oficial, contexto pelo servidor, resiliência com orçamento,
    guardas (não entregar, conta certa, voz), simulações, folha da referência 4, aviso de
    privacidade, preferência no menu. Testes da rota sem rede.
  - Fecho: apresentações (uma ferramenta por passo), calibragem com instrução e sondagem quieta,
    laboratório (faixa em todos os estados, mão livre, zerar apresentações), documentos, percurso
    de navegador ampliado e capturas em `docs/capturas/v0.3/`.
  - Junção com a degustação (PR #3): instrução com verbo nos oito passos, faixa do Nônio, mão livre
    e retorno verde e ainda não, como na Missão 4; a conversa fica fora (a degustação não está no
    catálogo e é pública, sem limite de uso no servidor). O palpite de opções mostra o texto da
    opção e tem gesto próprio. Percurso da degustação refeito para a mão livre, nos três layouts e
    embutida; capturas de `docs/capturas/degustacao/` refeitas.
  - Apresentações no computador e em paisagem: o cartão saiu de dentro do véu (lá ficava abaixo da
    ferramenta em destaque e a máquina cobria o "Entendi") e vai para o lado da ferramenta quando há
    espaço. Gesto antes de qualquer volta, quando as inteiras não dão uma para cada: "toque numa
    peça e escolha em quantas partes cortar" (não fala em sobra).
- v0.4 — **Nônio flutuante, contas visíveis, o Manual e o modo escuro** (referência nova em
  `docs/referencia-visual/v04.html`):
  - Base: papéis da tinta separados (`--contorno`, `--sombra`, `sobre-*`, tokens do Nônio) sem
    mudar o claro (capturas iguais pixel a pixel); `--tinta` proibida em borda, traço e sombra
    (higiene); progresso v3 (preferência `aparencia`) com migração testada contra um progresso v2.
  - Nônio flutuante: a faixa saiu; bolinha de 58 px no canto da máquina, recado de até 60
    caracteres que some no gesto seguinte ou em 6 s, ponto de fala nova, janelinha com a fala,
    "Antes, neste passo", Me ajuda em quatro degraus com o caso parecido dentro e "Pergunte por
    escrito"; a máquina ficou maior e o canto dela livre; apresentação `bolha`.
  - Rascunho a lápis (uma linha por gesto que mexe na carga) e conta passada a caneta no acerto,
    com o nome dos termos, em todas as formas (partilha, medida, resto, fração, transporte,
    comparação, parte); conta armada na Missão 3 e no Caderno; tudo verdadeiro com `Racional`.
  - Nome formal (área e conteúdo, nunca ano escolar) no cabeçalho da missão, no distrito, no fim
    da missão, no Caderno e na Planta. O Manual: `/manual` e `/manual/[pagina]`, cinco páginas que
    se restauram com a descoberta, as outras a lápis; "Uma página do Manual voltou" no fim da
    missão; o livro no cabeçalho abre a referência da missão.
  - Modo escuro: a mesma tabela com a luz apagada (objetos não invertem), sem piscar ao abrir, lua
    ou sol no topo, Aparência no Menu; a degustação segue o aparelho e aceita `?tema=`.
  - Tela cheia (topo, Menu e degustação, onde o navegador deixa) e app instalável (manifesto,
    ícones de 192, 512 e mascarável, ícone da tela de início do iPhone); no iPhone, o Menu ensina
    a instalar.
  - Fecho: contador de joias só depois da primeira; o gesto da notação diz "toque em Continuar"
    depois de comprimir; `/lab/vitrine` com a bolinha, o recado, a janelinha, o rascunho, as duas
    contas, uma página do Manual e tudo no escuro; documentos; capturas (trocadas pelas da v0.5).

- v0.5 — **A Joia do Ábaco: o soroban, a lapidação e o Relicário vivo** (referência nova em
  `docs/referencia-visual/v05.html`, que chegou cortada no meio da tela 5):
  - Base: tokens do soroban no claro e no escuro; progresso v4 (treino por técnica e a rodada em
    andamento) com migração testada contra um progresso v3 gravado pela v0.4; a Joia do Ábaco com
    as seis técnicas (Ler e mostrar e 5 e 10 juntos novas) e os critérios corrigidos; estágio em
    toda técnica das quatro joias.
  - Motor do soroban (`nucleo/soroban`): gestos, plano do lance com as marcas, reconhecimento
    (limpo em qualquer ordem, vai e volta com o Desfazer), item (mãos, leitura, sombra, de cabeça,
    ditado), gerador por semente. Testes: a propriedade custo = distância para todo estado de três
    hastes e todo lance que cabe, os 17 casos conhecidos, o reconhecimento, 200 sementes por foco.
    `/lab/soroban` com o reconhecedor e o gerador.
  - Treino genérico (`nucleo/joias`): firmar (6 limpos, 2 rodadas, 20 horas no estágio 2 e 3; o
    imaginado fecha de cabeça ou no ditado), foco que pula a técnica esperando, revisão,
    manutenção, estágio que nunca desce; registro por joia. Saltos novos no `/lab/progresso`.
  - Bancada (`/relicario/abaco`): abertura (técnica nova com o soroban pequeno e o exemplo, ou
    curta), a operação um algarismo por vez, o Nônio com o caminho no nível guiado, ajuda em quatro
    degraus (caso parecido calculado pelo núcleo, caminho junto desenhado nas contas), os pares,
    ver o caminho curto, rascunho a lápis e conta a caneta, fim da rodada e a folha da lapidação;
    retomada no mesmo lance depois de recarregar. Soroban imaginado: sombra, de cabeça, ditado.
  - Relicário vivo (ficha da joia em lapidação, técnicas, Lapidar e Soroban livre) e
    `/relicario/abaco/livre`; o fim da Missão 5 aponta o Lapidar.
  - Caminho do conteúdo: `docs/AUTORIA.md` com exemplos que passam nas checagens
    (`src/conteudo/exemplos`), `textos.test.ts` em todo o conteúdo, Museu e Rua abertos pelo
    catálogo. `CLAUDE.md` e `AGENTS.md` apontam para o AUTORIA.
  - Fecho: vitrine com o soroban e a lapidação, percurso `e2e/lapidacao.spec.ts`, capturas em
    `docs/capturas/v0.5/`. Com o contador de joias, a tela cheia sai do topo em telas estreitas
    (a linha passava dos 390 px).

## Parcialmente implementado
- Pergunte por escrito (a conversa com o Nônio): verificado com simulação e testes da rota; **não
  exercitado contra a API real nesta sessão** (sem chave no ambiente). A primeira prévia com `ANTHROPIC_API_KEY` na Vercel é o
  teste de verdade (latência, tom, guardas com respostas reais).
- Revisitas (atividades geradas) ficam sem a conversa: o servidor só monta contexto de atividades
  do catálogo.
- Laboratório: os saltos de `/lab/progresso` não marcam apresentações como vistas (elas aparecem de
  novo; há o botão de zerar e, para a captura, basta tocar em Entendi).
- Planta: as linhas de dependência são curvas e podem passar por trás de outras etiquetas quando
  dois conceitos estão na mesma coluna; legível, mas um traçado com desvio seria melhor.
- Joias: o treino é genérico, mas só a Joia do Ábaco tem bancada. Cálculo Mental, Multiplicação e
  Estimativa já dizem o estágio de cada técnica e entram por um registro novo.
- Referência v05: as telas 5 (resto), 6, 7 e 8 não chegaram (o apêndice veio cortado); foram feitas
  pelo texto do pedido. Colar o resto do `v05.html` permite a comparação completa.
- Toque no soroban: verificado no Chromium com toque emulado; falta o polegar num celular de verdade
  (alvos de 60 × 28 por conta, a exceção consciente aos 44 px).
- A bancada não tem "Pergunte por escrito": o servidor monta contexto de missão, não de rodada.
- Equivalência de frações: aparece como prévia (Missão 4, comparação; Missão 5, dois jeitos), sem
  formalização nem conceito ativo.
- Palpites: guardados no progresso para a futura Joia da Estimativa; ainda não geram evidência.

## Planejado
- Conversa: limite de uso por servidor (hoje o limite de 20 perguntas por execução é do cliente);
  medir latência e custo reais na prévia.
- Som, que a v0.3 ainda deixa de fora.
- As outras joias treináveis: Cálculo Mental, Multiplicação e Estimativa (registro novo cada uma,
  sem refazer o treino).
- A conversa com o Nônio na bancada (contexto de rodada no servidor).
- Arco 2 de A Partilha: equivalência, comparação, fração de quantidade, razão e proporção.
- O Contrapeso (incógnitas e equações) e os outros distritos.
- Segunda exposição do museu e novas cenas da Rua (as três categorias já existem nos dados).
- Revisitas espaçadas além da primeira (hoje: uma revisita até consolidar).

## Decisões
- O interativMaths faz parte do hub interativAI como produto próprio, no subdomínio
  `matematica.interativai.com`. Os dois apps seguem separados: sem código compartilhado e sem fusão;
  a recepção (interativai.com) só abre a degustação num iframe e conversa por `postMessage`.
- A degustação não grava no progresso do jogo: quem joga a ilhota e depois entra no Engenho começa
  pela abertura e pela calibragem, como qualquer pessoa.

## Precisa de decisão do Will
- O resto do Engenho fica aberto a todos ou trancado como acesso antecipado, igual à programação?
  Hoje está aberto: "Quero continuar" leva ao acesso no interativai.com, mas `/` deste app continua
  livre.

## Pendências
- Tela cheia no celular de verdade: verificada no Chromium do computador (botão, troca de estado,
  some no iframe sem `allow`); falta conferir no Android e o app instalado no iPhone.
- Degustação no celular em pé: com livro, tela cheia e etapas no cabeçalho, o título encurta
  ("Três broas, qu..."). Se incomodar, a tela cheia pode ir para o fim da degustação.
- Planta: o nome formal embaixo de cada etiqueta fica apertado no celular ("Divisão: quantos
  cabem" encosta na vizinha); legível, mas um respiro maior entre colunas ajudaria.
- Previsão: o resultado ("Você disse... A máquina deu") aparece antes de a demonstração terminar,
  porque o painel começa pronto (já era assim na Missão 4). Na degustação, esperar a máquina
  deixaria a descoberta mais forte; é mudança de comportamento das missões, então ficou anotada.
- Sem som no jogo (fora do escopo): a regra "sons só depois do primeiro toque" não tem o que aplicar.
- Soroban com o polegar, no celular: conferir se a conta certa responde (as de baixo ficam a
  28 px umas das outras), se o toque perto da régua não pega a vizinha e se a rolagem não dispara
  um gesto. Se errar o alvo, aumentar a altura das contas antes de mexer na regra.

## Fora do escopo atual
- Conta, login, banco, sincronização; multiplayer, ranking, loja, economia; aplicativo nativo;
  editor de fases; simulador físico genérico. IA corrigindo ou pontuando: nunca (a correção é do
  motor; a IA só conversa).
