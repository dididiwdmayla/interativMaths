# interativMaths — o projeto

## Visão

Um jogo web, em português do Brasil, que ensina matemática por experimentação. Muita gente
atravessa a escola carregando lacunas e aprende fórmulas sem saber de onde vieram; quando trava em
equações, o problema costuma estar em frações. O jogo faz duas coisas: encontra a lacuna de verdade
e faz o conceito ser descoberto antes de ser nomeado.

Princípio: **a matemática faz o mundo funcionar.** O jogador recebe ferramentas e um problema e acha
uma solução. A sensação procurada é a de montar um mecanismo, não a de responder exercício.

## Público e tom

Jovens e adultos recuperando base, gente que acredita "não ter base".

- Sem nota, sem a palavra "errado", sem série escolar, sem cronômetro, sem estrelas, sem ranking.
- Erro é um evento da máquina (ela engasga, a bandeja apara) e tudo pode ser desfeito.
- "Não sei ainda" é resposta legítima em qualquer pergunta.
- Texto adulto, seco e caloroso, em frases curtas. Nada infantilizado, nada de exclamação.

## Pilares

1. **Máquinas estreitas.** A descoberta pura falha com quem tem lacunas; por isso cada máquina é
   estreita o bastante para a descoberta ser quase inevitável, e a formalização é obrigatória.
2. **Validar propriedades, não caminhos.** Toda solução correta é aceita por construção.
3. **Evidências, não conclusões.** O progresso guarda o que aconteceu; o estado de cada conceito é
   calculado. A regra de domínio pode mudar sem migrar o progresso de ninguém.
4. **Uma ideia, várias janelas.** Repartir igualmente e o que fazer com o que sobra aparece no
   distrito, no Caderno, no Museu, na Rua e na Planta, sempre na mesma simulação.
5. **Fidelidade ao estado.** Nenhum controle sugere uma ação que não existe; o que não foi construído
   aparece como "em projeto".

## O ciclo de cada conceito

| Fase | Na tela |
|---|---|
| Problema | Um pedido da Dália, com a página do manual rasgada |
| Palpite | Quanto o jogador acha que vai dar; nunca bloqueia; fica guardado (futura Joia da Estimativa) |
| Experimentação | Opera a máquina; desfazer e recomeçar sempre existem |
| Descoberta | Prevê um caso novo; a máquina confere (no máximo duas previsões) |
| Formalização | Frase com lacunas preenchida com as cotas, compressão em notação, caminho de volta |
| Aplicação | Problema novo, sem dica automática |
| Retenção | Eco (mesma sessão, outra roupa) e revisita (20 h depois) |

## O universo: o Engenho

*Engenho* é a máquina e é a capacidade de inventar. O Engenho é uma máquina do tamanho de uma cidade
que fazia o vale funcionar. Não quebrou: está parando, distrito por distrito, porque quem entendia
foi embora e quem ficou só segue o manual, de páginas rasgadas. O jogador chega como aprendiz e faz
cada distrito voltar a funcionar descobrindo por que ele funciona.

**Personagens** (só estes dois):

- **Nônio**, o tutor: um pequeno paquímetro de latão que anda. A expressão vem da abertura das
  hastes e da lente. Ele não julga: mostra uma medida.
- **Dália**, a última ajustadora. Sabe fazer funcionar, nunca soube por quê. Dá os problemas e
  escreve à mão nas margens do Caderno. Não é desenhada: existe pela voz e pela letra.

**Lugares nesta versão:** A Partilha (Arco 1 jogável); O Contrapeso, Pátio dos Sinais,
Observatório, Estaleiro das Formas e Feira do Acaso (em projeto); a Planta; o Caderno; o Relicário
(vitrine); o Museu das Descobertas (uma exposição); a Rua (uma cena).

## Arco 1 de A Partilha: "O resto que ninguém repartia"

1. **Carga igual** — dividir repartindo (24 sacas, 4 carroças).
2. **Quantas carroças?** — dividir como "quantos cabem" (30 sacas, 6 em cada).
3. **Sobrou** — o resto e a situação que decide o que fazer com ele (26 sacas).
4. **O pão não é saca** — fração como parte e como divisão (5 e 3 broas, 4 mesas).
5. **Encomenda sem manual** — aplicação; fecha o arco e encontra a Joia do Ábaco.

Depois da missão 4 abrem o Museu ("Os pães de Ahmes") e a Rua ("Três pizzas, quatro amigos").

## As joias

Relógios usam rubis como mancais. As joias do jogo são habilidades reais do jogador que reduzem o
atrito do raciocínio (Ábaco, Cálculo Mental, Multiplicação, Estimativa), com quatro estágios de
lapidação. Não dão poder fictício. O treino é assunto de outra versão.

## O tutor sem IA

Nesta versão o Nônio é determinístico: escada de dicas por passo (olhar, medir, caso parecido com
outros números, resolver junto) e resposta por equívoco nomeado. A rota `POST /api/tutor` existe e
responde que a conversa não está disponível; a correção matemática será sempre do motor.
