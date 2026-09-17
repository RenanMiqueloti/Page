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

O mapa é um piso de racks: fileiras longas e paralelas com corredor entre elas,
uma passarela cruzando tudo e uma praça ao sul. Corredor dá linha de tiro
comprida; praça dá respiro. Construído por operações (`rect`, `ring`, `stairs`),
não por arte ASCII.

Navegação é campo de fluxo BFS a partir da célula do player, recalculado 4x/s.
Três invariantes que o código garante — cada um veio de um bug que o teste
headless pegou, todos da mesma família (**a navegação mentindo sobre o que o
corpo consegue fazer**):

1. **O ator não é um ponto.** `bodyH` guarda a altura vista por um corpo de raio
   `CFG.radius` no centro de cada célula, e é isso — não a altura crua — que a
   busca usa. Sem isso, a rota aprova corredor onde o inimigo não cabe: ele mira
   o centro da célula, trava na quina e o desvio o joga pra fora da rota.
2. **Fluxo menor não significa alcançável.** O vizinho pode ter sido alcançado
   pelo outro lado. `flowStep` só aceita vizinho que respeite `stepUp` a partir
   de onde o bicho está — senão ele escolhe uma face 0.76 acima e empurra parede
   pra sempre.
3. **Todo spawn precisa de rota provada.** `reachable()` faz flood fill com as
   mesmas regras de passo e `placeSpawns()` só aceita célula conectada ao
   início, numa faixa de distância (não no ponto mais longe, senão a onda leva
   meio minuto andando antes de virar jogo).

E uma regra de nível: toda plataforma alta precisa de escada **dos dois lados**.
1.52 de uma vez é intransponível com `stepUp` de 0.42, e um desnível desses vira
parede invisível que ilha metade do mapa.

## Onde mexer

| Quero | Símbolo |
|---|---|
| Movimento, dano, cadência | `CFG` |
| Layout do nível | `buildLevel()` |
| Paleta | `PALETTE` + o mapa de papéis em `P` |
| Fragmentos de superfície | `HEX` |
| Novo tipo de hostil | `TYPES` + arte em `ART` |
| Composição das ondas | `startWave()` |
| Nome das zonas do HUD | `ZONES` |
| Silhueta da arma | `AK` (eixo do cano × deslocamento, em proporção real) |
| Efeitos sonoros | `sfx()` — WebAudio, sem asset |

## Pendências conhecidas

- Sem suporte a touch: precisa de mouse e teclado.
- Sem recorde persistente (dá pra plugar `localStorage` em `gameOver()`).
- A arma é uma silhueta de blocos: lê como AK, sem detalhe fino de perto.
