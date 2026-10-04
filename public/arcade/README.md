# ASCII SUBNET

FPS em primeira pessoa desenhado numa grade de caracteres, em `<canvas>` 2D.
Dois arquivos estáticos, zero dependência, zero build.

Rodar: `npm run dev` e abrir `/arcade/index.html`.
Debug: `?debug=1` expõe `window.SUBNET` (`SUBNET.spawn("boss")`,
`SUBNET.startWave(9)`, `SUBNET.player`).

## Identidade visual

O jogo tem premissa própria: **você é o agente e o mapa é o seu runtime**. Não é
um datacenter genérico — é o portfólio jogável de quem constrói agentes.

**Duas cores saturadas, com significado fixo.** Esmeralda é *seu* (rota que dá
pra pisar, munição, o acento do portfólio). Âmbar é *anomalia* (hostil). Rosa só
aparece quando você toma dano — tela rosa é urgência real, não decoração. Todo o
resto é preto-violeta quente e cinza-lilás. Paleta com papel definido troca
"bonito" por legível: você sabe o que é uma coisa antes de reconhecer a forma.

**A parede tem endereço.** O detalhe de superfície são fragmentos hex
(`0x`, `7f`, `a3`), não tracinho decorativo — o mundo é memória, então ele
mostra memória.

**O HUD não usa caixa.** Cantos em colchete, uma régua fina e barras
segmentadas: vida em 20 blocos, munição tique a tique (um por bala). Você lê
quanto resta sem ler número nenhum.

**Luminância calibrada, não estimada.** Média ~28/255, a mesma faixa de um FPS
ASCII de referência que funciona. Cinza claro demais é o erro mais fácil de
cometer: a cena inteira embranquece.

Consequências de implementação que sustentam tudo isso:

- **Grade fina** (~240 colunas, célula de ~6px): preenchimento lê como cor
  sólida, não como textura de texto.
- **Sombreamento chapado por face**, com névoa em degraus grossos. O relevo vem
  do contraste entre faces vizinhas; gradiente fino em caractere vira ruído.
- **Célula sólida vira `fillRect`**, não glifo: sem costura entre linhas e mais
  rápido que `fillText`. Caractere fica só para o detalhe.

## O que faz a cena ter volume

Cinco coisas, e nenhuma é "mais detalhe":

**Luz direcional, não sombreamento por eixo.** O raycaster só sabe qual eixo o
raio cruzou; combinando com o sentido do passo dá pra saber pra onde a face
aponta, e cada orientação recebe seu valor (`FACE`). Sombrear pelo eixo deixava
a parede rasante — que ocupa metade da tela — mais clara que a parede de frente,
e a cena inteira lia como papelão chapado.

**Dois passos de valor entre faces vizinhas.** Com índices de paleta vizinhos a
diferença some. O volume vem do contraste ENTRE superfícies, não do detalhe
dentro de cada uma.

**Sombra acumulando na base.** As últimas linhas de cada face escurecem, o que
assenta a parede no chão em vez de deixá-la boiando.

**Costuras de painel.** Junta horizontal e montante vertical dão ESCALA: sem
elas, uma parede de 20 células é uma mancha só e o olho não tem como medir
tamanho nem distância.

**Céu em gradiente ancorado no horizonte.** A faixa mais clara logo acima da
linha do horizonte é o que faz a silhueta recortar. Fundo liso afunda tudo no
mesmo preto.

Duas regras de composição que vieram junto: o pátio precisa existir como plano
(desenhado só com nós esparsos, o terço inferior da tela virava vazio e a cena
flutuava), e acento esmeralda vai **tracejado** — linha cheia numa borda longa
vira barra luminosa atravessando a tela e rouba a cena inteira. Pelo mesmo
motivo a praça sul é feita de plataformas separadas, não de degraus de ponta a
ponta: degrau contínuo projeta uma reta que corta a tela ao meio.

## Nitidez e distância

Dois problemas que pareciam estéticos e eram técnicos:

**Borrado.** A célula tinha tamanho fracionário em pixels, então todo retângulo
e todo glifo caíam em meio pixel e o navegador reamostrava a tela inteira. Agora
a célula é inteira em pixels de dispositivo, o buffer do canvas é múltiplo exato
dela, e o CSS casa com o buffer — mapeamento 1:1, sem reamostragem.

**Coisas sumindo ao longe.** A névoa escurecia até o preto, então a geometria
distante se dissolvia no fundo. A regra correta é convergir pra cor do
HORIZONTE: aí o objeto "sai da névoa" em vez de desaparecer. A rampa é gerada no
boot (um índice de paleta por tom e nível), o que dá degradê liso em vez de
quatro degraus grossos e permitiu dobrar o alcance de visão.

## Como o mundo é renderizado

Raycaster de heightmap: cada célula do mapa guarda uma altura. Para cada coluna
da tela, um DDA caminha de perto para longe mantendo uma janela de linhas ainda
não pintadas; cada célula pinta seu topo e, se subiu, a face vertical. Isso dá
escada, passarela e plataforma sem z-buffer por pixel. O custo é não existir
teto nem ponte — uma célula tem uma altura só.

Hostis são billboards com teste de profundidade por célula, então somem
corretamente atrás de quina. O tiro é hitscan marchando o mesmo heightmap: é por
isso que cobertura vale igual para a bala e para a linha de visão da IA.

## Nível e navegação

O mapa tem distritos com caráter próprio, não uma grade regular:

- **CORE ZIGGURAT** — torre alta no centro, com anel de passarela e uma única
  escada de acesso pelo sul. Um ombro mais baixo serve de posto de tiro. É o
  marco que orienta o mapa e o ponto mais disputado. (A primeira versão era um
  zigurate de degraus concêntricos: visto do chão vira listra paralela e some
  a leitura de volume — massa vertical com acesso único lê muito melhor.)
- **STACK BLOCK** — quarteirão denso de blocos com alturas diferentes e becos
  entre eles. Combate curto, muita quina.
- **TERRACE CLIMB** — quatro faixas de 0.38 encadeadas subindo até a torre do
  canto. A subida é contínua e visível de longe.
- **SEALED ROOMS** — salas fechadas com porta. Contraponto do pátio aberto:
  lá dentro o tiro longo não vale e a faca passa a fazer sentido.
- **SOUTH YARD** — pátio com rampa diagonal pra uma passarela que domina a
  praça mas não tem saída rápida.

Entulho espalhado por RNG com semente fixa, porque validação de navegabilidade
precisa testar o mesmo mapa que o jogador recebe. Caixas em 0.38 (sobe andando)
e 0.72 (sobe pulando) — 0.45 ficava logo acima do degrau e só atrapalhava.

Navegação é campo de fluxo BFS a partir da célula do player, recalculado 4x/s.
Quatro invariantes que o código garante — cada um veio de um bug que o teste
headless pegou, todos da mesma família (**a navegação mentindo sobre o que o
corpo consegue fazer**):

1. **O ator não é um ponto.** `bodyH` guarda a altura vista por um corpo de raio
   `CFG.radius` no centro de cada célula, e é isso — não a altura crua — que a
   busca usa. Sem isso, a rota aprova corredor onde o inimigo não cabe.
2. **Fluxo menor não significa alcançável.** O vizinho pode ter sido alcançado
   pelo outro lado. `flowStep` só aceita vizinho que respeite `stepUp` a partir
   de onde o bicho está.
3. **Quem decide é o degrau, não a altura absoluta.** Havia um corte tratando
   qualquer superfície acima de 2 como parede: plataforma alcançável por escada
   ficava fora do mapa de navegação e, pior, com o player em cima dela o campo
   de fluxo abortava inteiro e todo inimigo congelava.
4. **Todo spawn precisa de rota provada.** `reachable()` faz flood fill com as
   mesmas regras de passo e `placeSpawns()` só aceita célula conectada ao
   início, numa faixa de distância.

E uma regra de nível: toda plataforma alta precisa de escada **dos dois lados**.
1.52 de uma vez é intransponível com `stepUp` de 0.42, e um desnível desses vira
parede invisível que ilha metade do mapa.

## Onde mexer

| Quero | Símbolo |
|---|---|
| Movimento, dano, cadência | `CFG` |
| Layout do nível | `buildLevel()` + `room` / `stairDiag` / `stairs` |
| Paleta | `PALETTE` + o mapa de papéis em `P` |
| Fragmentos de superfície | `HEX` |
| Novo tipo de hostil | `TYPES` + arte em `ART` |
| Composição das ondas | `startWave()` |
| Nome das zonas do HUD | `ZONES` |
| Armas | `WEAPONS` (stats + pose) e `MODEL_*` (caixas 3D) |
| Efeitos sonoros | `sfx()` — WebAudio, sem asset |

## Pendências conhecidas

- Sem suporte a touch: precisa de mouse e teclado.
- Sem recorde persistente (dá pra plugar `localStorage` em `gameOver()`).
