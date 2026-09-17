# ASCII SUBNET

FPS em primeira pessoa desenhado numa grade de caracteres, em `<canvas>` 2D.
Dois arquivos estáticos, zero dependência, zero build.

Rodar: `npm run dev` e abrir `/arcade/index.html`.
Debug: `?debug=1` expõe `window.SUBNET` (`SUBNET.spawn("boss")`,
`SUBNET.startWave(9)`, `SUBNET.player`).

## Como o visual foi decidido

Esta é a segunda versão. A primeira preenchia cada célula com caractere de
sombreamento por distância e ficava achatada e leitosa. A reescrita saiu da
observação de um frame real de um FPS ASCII que funciona, e três medidas
guiaram tudo:

**Grade fina.** ~240 colunas, célula de ~6px. Com célula grande o preenchimento
lê como textura de texto; com célula pequena, lê como cor sólida.

**Sombreamento chapado.** Cada face recebe UMA cor, escolhida pela orientação e
pela altura — não um gradiente por distância. O relevo vem do contraste entre
faces vizinhas. A névoa só escurece em degraus grossos (`fade()`), porque
gradiente fino em caractere vira ruído.

**Luminância calibrada, não estimada.** A referência tem média 28/255, 90% dos
pixels abaixo de 46, e menos de 2% acima de 80. A paleta daqui foi ajustada até
cair na mesma distribuição (média 32, p90 43, 1,5% acima de 80). Cinza claro
demais é o erro mais fácil de cometer: a cena inteira embranquece.

Duas consequências de implementação:

- **Preenchimento é retângulo, não glifo.** A célula sólida usa um código
  sentinela e vira `fillRect` no flush — sem costura entre linhas, e mais rápido
  que `fillText`. Caractere fica para o que é detalhe: linha de painel, quina,
  malha do piso, plaqueta de hostil.
- **HUD em DOM.** Número grande com tipografia de verdade lê melhor que qualquer
  coisa desenhada em célula, e a grade sobra inteira para o mundo. Na grade só
  fica o que pertence ao espaço 3D: mira, marcador de acerto, borda de dano.

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

O mapa é construído por operações (`rect`, `ring`, `stairs`), não por arte ASCII
— pátio grande com arquitetura afastada é o que cria linha de horizonte.

Dois invariantes que o código garante sozinho:

- `reachable()` faz flood fill com as MESMAS regras de passo do jogo, e
  `placeSpawns()` só aceita spawn em célula comprovadamente conectada ao início.
  Sem isso, editar o nível gera região ilhada e a onda nunca termina — foi
  exatamente o bug que apareceu no primeiro teste desta versão.
- Toda plataforma alta precisa de escada dos dois lados: 1.52 de uma vez é
  intransponível com `stepUp` de 0.42, e um desnível desses vira parede.

A IA usa campo de fluxo BFS a partir da célula do player, recalculado 4x/s: cada
hostil só desce o gradiente, o que basta pra contornar torre e subir escada.

## Onde mexer

| Quero | Símbolo |
|---|---|
| Movimento, dano, cadência | `CFG` |
| Layout do nível | `buildLevel()` |
| Paleta | `PALETTE` + o mapa de papéis em `P` |
| Novo tipo de hostil | `TYPES` + arte em `ART` |
| Composição das ondas | `startWave()` |
| Nome das zonas do HUD | `ZONES` |
| Silhueta da arma | `AK` (retângulos; altura em linhas ÷ 1.45) |
| Efeitos sonoros | `sfx()` — WebAudio, sem asset |

## Pendências conhecidas

- Sem suporte a touch: precisa de mouse e teclado.
- Sem recorde persistente (dá pra plugar `localStorage` em `gameOver()`).
- A arma é uma silhueta de caixas: lê como AK de longe, sem detalhe fino de perto.
