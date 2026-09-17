# ASCII SUBNET

FPS em primeira pessoa renderizado inteiramente em caracteres, em `<canvas>` 2D.
Zero dependência, zero build: dois arquivos estáticos servidos pelo `public/`.

Jogar local: `npm run dev` e abrir `/arcade/index.html`.
Debug: `/arcade/index.html?debug=1` expõe `window.SUBNET` no console
(`SUBNET.spawnEnemy("boss")`, `SUBNET.startWave(9)`, `SUBNET.player`).

## Como o renderer funciona

Não é 3D nem raytracing — é um **raycaster de heightmap**, o meio-termo entre
Wolfenstein e Doom:

- o mapa é uma grade onde cada célula guarda **uma altura** (`MAP_SRC`);
- pra cada coluna da tela, um DDA caminha pelas células de perto pra longe;
- cada célula pinta o **topo** dela (chão/plataforma) e, quando sobe em relação
  à anterior, a **face vertical**;
- uma "janela" de linhas ainda não pintadas fecha de baixo pra cima — quando
  fecha, a coluna acabou e o resto é céu.

Isso dá escada, passarela e plataforma de graça, sem z-buffer por pixel nem
polígono. O custo é não existir teto nem ponte: uma célula só tem uma altura.

Os inimigos são *billboards* de arte em char, com teste de profundidade por
célula da grade (`depth`), então eles somem corretamente atrás de quina e
plataforma. O disparo é hitscan que marcha pelo mesmo heightmap — é por isso que
cobertura funciona: a bala bate na parede antes de chegar no bicho.

A saída vira `fillText` por *run* de mesma cor (espaço não custa nada), o que
mantém ~8 mil células a 60fps.

## Onde mexer

| Quero | Arquivo / símbolo |
|---|---|
| Mudar o mapa | `MAP_SRC` — `#` parede, `1`-`4` plataforma, `.` chão, `P` spawn do player, `e` spawn de inimigo |
| Tunar movimento / dano / cadência | `CFG` |
| Novo tipo de inimigo | `TYPES` + arte em `ART` |
| Mudar a arte de um inimigo | `ART` (espaço = transparente) |
| Composição das ondas | `startWave()` |
| Paleta / estética | `PALETTE`, `RAMP`, `FLOOR_RAMP` |
| Efeitos sonoros | `sfx()` — síntese via WebAudio, sem asset |

## Pendências conhecidas

- Sem suporte a touch: precisa de mouse + teclado.
- IA usa campo de fluxo BFS recalculado 4x/s; inimigo não prevê movimento.
- Sem persistência de recorde (dá pra plugar `localStorage` em `gameOver()`).
