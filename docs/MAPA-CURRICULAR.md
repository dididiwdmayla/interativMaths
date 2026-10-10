# Mapa curricular

A fonte da verdade são os dados (`src/conteudo/conceitos.ts`, as missões e
`src/nucleo/dominio/dominio.ts`); este documento explica.

## Conceitos

| Id | Nome | Depende de | Onde se ensina | Situação |
|---|---|---|---|---|
| `mul.grupos` | Multiplicar como grupos | — | só medido na calibragem (D1) | pré-requisito |
| `div.partilha` | Repartir igualmente | `mul.grupos` | Missão 1; aplicação na Missão 3 | ativo |
| `div.medida` | Quantos cabem | `div.partilha` | Missão 2; aplicação no transporte da Missão 3 | ativo |
| `div.resto` | O que sobra | `div.partilha` | Missão 3; aplicação na Missão 4 (a broa que sobra) | ativo |
| `fra.parte` | Fração como parte | `div.partilha` | Missão 4; aplicação na Missão 5; transferência no Museu e na Rua | ativo |
| `fra.quociente` | Fração como divisão | `fra.parte`, `div.resto` | Missão 4; aplicação na Missão 5; transferência no eco, Museu e Rua | ativo |
| `fra.equivalencia` | Frações equivalentes | `fra.quociente` | prévia na Missão 5 (medidores iguais) | em projeto |
| `fra.comparacao` | Comparar frações | `fra.equivalencia` | — | em projeto |
| `fra.de-quantidade` | Fração de uma quantidade | `fra.parte`, `div.partilha` | — | em projeto |
| `raz.razao` | Razão | `div.medida`, `fra.quociente` | — | em projeto |
| `pro.proporcao` | Proporção | `raz.razao`, `mul.grupos` | medido na calibragem (D6) | em projeto |
| `est.plausibilidade` | Estimativa | `mul.grupos`, `div.partilha` | palpites guardados para a Joia da Estimativa | em projeto |

Ids publicados não mudam; renomear exige migração do progresso.

## Evidências

Cada evidência: conceito, tipo (`calibragem`, `experimento`, `descoberta`, `aplicacao`,
`transferencia`, `sondagem`, `revisita`), resultado (`sucesso`, `falha`, `nao_sei`), ajuda (0 sem
dica; 1 a 4 conforme o degrau mais alto da escada), contexto (id da atividade), equívoco e momento.

## Modelo de domínio v1 (`MODELO_DOMINIO`)

| Constante | Valor | Uso |
|---|---|---|
| `ajudaMaximaValida` | 1 | sucesso com ajuda até 1 conta para domínio |
| `contextosParaDominar` | 2 | dois sucessos válidos em contextos diferentes |
| `tiposFortes` | aplicacao, transferencia, revisita | ao menos um dos dois sucessos |
| `tiposQueNaoContam` | calibragem, sondagem | nunca contam como sucesso de domínio |
| `falhasParaSondagem` | 2 | mesmo equívoco, contextos diferentes |
| `sucessosParaSairDoAjuste` | 2 | sucessos novos depois da sondagem que falhou |
| `esperaRevisitaMs` | 20 h | do primeiro sucesso até a revisita |

Estados:

- **Não avaliado:** nenhuma evidência.
- **Em aprendizagem:** há evidência; domínio não cumprido.
- **Dominado:** dois sucessos válidos em contextos diferentes, um deles forte. Como cada missão é um
  contexto só, concluir uma missão nunca domina.
- **Consolidado:** dominado e com uma revisita bem-sucedida.
- **Pede ajuste:** a sondagem confirmou a lacuna. Um erro nunca basta: duas falhas com o mesmo
  equívoco em atividades diferentes disparam uma sondagem; só se ela falhar o estado muda.
- **Provável** (marca, não estado): a calibragem indicou; abre a prova direta.

Quando o equívoco aponta um pré-requisito, a falha vai para ele (`conteudo/equivocos.ts`, campo
`conceito`). Confirmada a folga, o jogo oferece desvio para a missão do conceito e devolve o jogador
exatamente onde estava.

## Calibragem

Começa em D3; sucesso sobe, falha ou "não sei ainda" desce; termina ao falhar tendo vencido o
degrau de baixo, ao vencer D6, ao falhar D1, ou em seis interações.

| Degrau | Conceito | Interação |
|---|---|---|
| D1 | `mul.grupos` | pôr na esteira o que dá 3 sacas para cada uma de 4 carroças (12) |
| D2 | `div.partilha` | 12 sacas, 3 carroças, numa volta só |
| D3 | `div.resto` | 14 sacas, 4 carroças, numa volta só (3 e sobra 2) |
| D4 | `fra.parte` | entregar 3/4 de uma broa a uma mesa |
| D5 | `fra.quociente` | 2 broas, 4 mesas: quanto para cada (1/2 ou 2/4), em fichas |
| D6 | `pro.proporcao` | 2 de farinha para 3 de água; com 6 de farinha, 9 de água |

Recomendação (degrau mais alto vencido): 0–1 → Missão 1; 2 → Missão 2; 3–4 → Missão 4; 5–6 →
Missão 5. `div.medida` fica provável a partir de D3. Provas diretas: Missão 1 a partir de D2;
Missões 2 e 3 a partir de D3; Missão 4 a partir de D5. "Começar do começo" está sempre à mão.

## Retenção

- **Eco** (`transferencia`): tonéis e casas, 3/5, depois de pelo menos duas outras atividades
  desde a Missão 4.
- **Revisita** (`revisita`): 20 h depois do primeiro sucesso; três perguntas geradas por semente,
  com preferência por resto com interpretação, fração como divisão e nomear o pedaço.
