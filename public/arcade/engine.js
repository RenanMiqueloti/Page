/* ============================================================================
 * ASCII SUBNET — FPS em grade de caracteres, canvas 2D, zero dependência.
 *
 * Reescrito a partir da observação de um frame real de um FPS ASCII que
 * funciona. Três decisões definem o visual e nenhuma é óbvia:
 *
 *   1. GRADE FINA (~240 colunas). Com célula de ~6px, preenchimento lê como
 *      cor sólida em vez de textura de caractere.
 *   2. SOMBREAMENTO CHAPADO. Cada face tem UMA cor, escolhida pela orientação
 *      e pela altura — não um gradiente por distância. O relevo vem do
 *      contraste entre faces vizinhas; fog só escurece em degraus grossos.
 *   3. PREENCHIMENTO É RETÂNGULO, NÃO GLIFO. A célula sólida vira fillRect no
 *      flush: sem costura entre linhas, e mais rápido que fillText.
 *
 * Os caracteres ficam para o que é DETALHE: linhas de painel, quinas, malha do
 * piso, plaqueta de hostil. É essa divisão de trabalho que faz a cena ler como
 * arquitetura em vez de parede de texto.
 * ========================================================================== */
(() => {
  "use strict";

  // ---------------------------------------------------------------- config
  const CFG = {
    cols: 240,             // largura alvo da grade
    charAspect: 1.45,      // altura/largura da célula
    fov: (72 * Math.PI) / 180,
    far: 46,
    eye: 0.62,
    eyeSlide: 0.30,
    radius: 0.26,
    stepUp: 0.42,
    gravity: 15,
    jumpV: 4.7,
    speedWalk: 3.4,
    speedSprint: 5.6,
    speedSlide: 7.8,
    slideTime: 0.45,
    sens: 0.0015,
    hpMax: 100,
    regenDelay: 2.5,
    regenRate: 25,
    mag: 30,
    reload: 1.5,
    fireDelay: 0.093,
    dmg: 26,
    headMult: 2.8,
    headZone: 0.72,
    spread: 0.010,
    spreadMove: 0.030,
  };

  // --------------------------------------------------------------- paleta
  // Amostrada do frame de referência: azul-ardósia muito escuro, arquitetura
  // em cinza frio, e só duas cores saturadas em toda a tela.
  const P = {
    sky: 0, void_: 1,
    s0: 2, s1: 3, s2: 4, s3: 5, s4: 6, s5: 7,   // estrutura, escuro -> claro
    cy0: 8, cy1: 9, cy2: 10,                     // rota / superfície pisável
    co0: 11, co1: 12,                            // hostil
    boss: 13, ink: 14,
  };
  // Calibrada contra a distribuição de luminância do frame de referência:
  // 90% da imagem abaixo de ~46, e menos de 2% acima de 80. Cinza claro demais
  // é o erro mais fácil de cometer aqui — a cena inteira vira leitosa.
  const PALETTE = [
    "#0d1216", // 0 céu
    "#151c22", // 1 vazio / piso raso
    "#1b232a", // 2 estrutura escura
    "#222c34", // 3
    "#2a353e", // 4 face principal
    "#34404a", // 5
    "#404d58", // 6 quina
    "#55646f", // 7 quina viva (rara)
    "#125e63", // 8 ciano apagado
    "#167a75", // 9 ciano de borda de piso
    "#2dd4bf", // 10 ciano vivo: lábio de plataforma
    "#a33b2c", // 11 coral apagado
    "#ff6b52", // 12 coral vivo
    "#f2b705", // 13 boss
    "#e8edf3", // 14 foco / flash
  ];

  const SOLID = 1;         // código sentinela: célula preenchida (fillRect)

  // Camadas do primeiro plano. put() só escreve se d < depth atual, então
  // empate não sobrescreve — cada camada precisa do próprio valor.
  const Z = { popup: -1, gun: -2, gunDetail: -3, muzzle: -4, overlay: -5 };

  // ----------------------------------------------------------------- mapa
  // Construído por operações em vez de arte ASCII: um pátio grande com a
  // arquitetura AFASTADA é o que cria linha de horizonte. Mapa apertado põe
  // parede na cara do jogador e mata a leitura de profundidade.
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const MAP = { w: 72, h: 72 };
  const height = new Float32Array(MAP.w * MAP.h);
  const spawns = [];
  let start = { x: 36.5, y: 58.5 };

  const inside = (x, y) => x >= 0 && y >= 0 && x < MAP.w && y < MAP.h;
  function rect(x0, y0, x1, y1, h) {
    for (let y = Math.max(0, y0); y <= Math.min(MAP.h - 1, y1); y++) {
      for (let x = Math.max(0, x0); x <= Math.min(MAP.w - 1, x1); x++) height[y * MAP.w + x] = h;
    }
  }
  function ring(x0, y0, x1, y1, h) {
    rect(x0, y0, x1, y0, h); rect(x0, y1, x1, y1, h);
    rect(x0, y0, x0, y1, h); rect(x1, y0, x1, y1, h);
  }
  /** Escada: cada passo sobe `rise`, ao longo de um eixo. */
  function stairs(x0, y0, x1, y1, from, rise, axis) {
    const n = (axis === "y" ? y1 - y0 : x1 - x0) + 1;
    for (let i = 0; i < n; i++) {
      const h = from + rise * i;
      if (axis === "y") rect(x0, y0 + i, x1, y0 + i, h);
      else rect(x0 + i, y0, x0 + i, y1, h);
    }
  }

  function buildLevel() {
    height.fill(0);
    ring(0, 0, MAP.w - 1, MAP.h - 1, 7);           // perímetro fechado e alto
    rect(1, 1, MAP.w - 2, 2, 6.2);

    // --- torres: dão a silhueta recortada da linha do horizonte
    const towers = [
      [6, 6, 15, 14, 4.6], [20, 4, 27, 11, 3.4], [33, 5, 41, 12, 5.2],
      [46, 4, 53, 10, 3.0], [57, 6, 65, 15, 4.2],
      [4, 22, 11, 30, 2.6], [61, 20, 67, 29, 3.2],
      [5, 44, 13, 52, 3.8], [58, 43, 66, 53, 4.4],
      [22, 60, 29, 67, 2.8], [43, 61, 50, 67, 3.6],
    ];
    for (const [x0, y0, x1, y1, h] of towers) {
      rect(x0, y0, x1, y1, h);
      rect(x0 + 1, y0 + 1, x1 - 1, y1 - 1, h * 0.78);   // recuo no topo
    }

    // --- passarela em L a 1.52. CADA lado precisa da própria escada: 1.52 de
    //     uma vez é intransponível (stepUp 0.42), e sem isso o mapa fica com
    //     região ilhada — inimigo nasce lá e nunca chega em você.
    rect(14, 18, 57, 19, 1.52);
    rect(14, 18, 15, 44, 1.52);
    stairs(18, 20, 21, 23, 1.14, -0.38, "y");    // sul, oeste
    stairs(50, 20, 53, 23, 1.14, -0.38, "y");    // sul, leste
    stairs(30, 14, 33, 17, 0.00, 0.38, "y");     // norte
    stairs(16, 45, 17, 48, 1.14, -0.38, "y");    // pé do braço oeste

    // --- plataforma central escalonada
    rect(30, 36, 41, 45, 1.14);
    ring(29, 35, 42, 46, 0.76);
    ring(28, 34, 43, 47, 0.38);

    // --- cobertura espalhada pelo pátio
    for (const [x, y] of [[20, 32], [51, 32], [20, 50], [51, 50], [36, 28], [36, 54],
                          [26, 41], [45, 41]]) {
      rect(x, y, x + 2, y + 2, 0.9);
      rect(x, y + 3, x + 2, y + 3, 0.45);            // degrau pra subir
    }

    start = { x: 36.5, y: 56.5 };
  }
  buildLevel();

  /** Células alcançáveis a pé a partir de uma origem, com as MESMAS regras de
   *  passo do jogo. Usada pra provar que todo spawn tem rota até o player. */
  function reachable(fromX, fromY) {
    const seen = new Uint8Array(MAP.w * MAP.h);
    const q = new Int32Array(MAP.w * MAP.h);
    const s0 = (fromY | 0) * MAP.w + (fromX | 0);
    seen[s0] = 1; q[0] = s0;
    let head = 0, tail = 1;
    while (head < tail) {
      const cur = q[head++];
      const cx = cur % MAP.w, cy = (cur / MAP.w) | 0, hc = height[cur];
      for (const [ox, oy] of N4) {
        const nx = cx + ox, ny = cy + oy;
        if (nx < 1 || ny < 1 || nx >= MAP.w - 1 || ny >= MAP.h - 1) continue;
        const ni = ny * MAP.w + nx;
        if (seen[ni]) continue;
        const hn = height[ni];
        if (hn >= 2 || Math.abs(hc - hn) > CFG.stepUp) continue;   // ida E volta
        seen[ni] = 1; q[tail++] = ni;
      }
    }
    return seen;
  }

  /** Spawns escolhidos entre as células comprovadamente conectadas ao início,
   *  as mais distantes primeiro. Nível editado nunca gera inimigo ilhado. */
  function placeSpawns() {
    const ok = reachable(start.x, start.y);
    const cand = [];
    for (let y = 2; y < MAP.h - 2; y++) {
      for (let x = 2; x < MAP.w - 2; x++) {
        const i = y * MAP.w + x;
        if (!ok[i] || height[i] > 0.05) continue;
        cand.push({ x: x + 0.5, y: y + 0.5, d: (x - start.x) ** 2 + (y - start.y) ** 2 });
      }
    }
    cand.sort((a, b) => b.d - a.d);
    spawns.length = 0;
    for (const c of cand) {
      if (spawns.length >= 10) break;
      // espalha: nada de dez spawns colados no mesmo canto
      if (spawns.every((s) => (s.x - c.x) ** 2 + (s.y - c.y) ** 2 > 100)) spawns.push(c);
    }
    if (!spawns.length) spawns.push({ x: start.x + 6, y: start.y });
  }

  placeSpawns();

  function heightAt(x, y) {
    const cx = x | 0, cy = y | 0;
    if (!inside(cx, cy)) return 7;
    return height[cy * MAP.w + cx];
  }

  // ----------------------------------------------------------------- tela
  const canvas = document.getElementById("screen");
  const ctx = canvas.getContext("2d", { alpha: false });
  const S = { cols: 0, rows: 0, charW: 0, charH: 0, hProj: 0, vProj: 0 };
  let chars, pal, depth;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    S.cols = Math.max(80, Math.min(CFG.cols, Math.round(rect.width / 5.4)));
    S.charW = canvas.width / S.cols;
    S.charH = S.charW * CFG.charAspect;
    S.rows = Math.max(30, Math.floor(canvas.height / S.charH));
    S.hProj = S.cols / 2 / Math.tan(CFG.fov / 2);
    S.vProj = S.hProj / CFG.charAspect;

    chars = new Uint8Array(S.cols * S.rows);
    pal = new Uint8Array(S.cols * S.rows);
    depth = new Float32Array(S.cols * S.rows);

    // corpo da fonte calibrado pelo avanço real do glifo
    const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    ctx.font = `100px ${FONT}`;
    const adv = ctx.measureText("M").width || 60;
    ctx.font = `${(S.charW / adv) * 100}px ${FONT}`;
    ctx.textBaseline = "top";
  }
  window.addEventListener("resize", resize);
  document.fonts?.ready?.then(resize).catch(() => {});

  function clear() { chars.fill(0); pal.fill(0); depth.fill(Infinity); }

  function put(c, r, code, p, d) {
    if (c < 0 || r < 0 || c >= S.cols || r >= S.rows) return;
    const i = r * S.cols + c;
    if (d >= depth[i]) return;
    chars[i] = code; pal[i] = p; depth[i] = d;
  }

  function text(c, r, str, p, d = Z.popup) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      put(c + i, r, code > 255 ? 63 : code, p, d);
    }
  }

  /** Grade -> canvas. Célula sólida vira retângulo; o resto vira texto. */
  function flush() {
    ctx.fillStyle = PALETTE[P.sky];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const buf = [];
    for (let r = 0; r < S.rows; r++) {
      const base = r * S.cols;
      const y = r * S.charH;
      let runStart = -1, runPal = -1, runSolid = false;

      const close = (end) => {
        if (runStart < 0) return;
        ctx.fillStyle = PALETTE[runPal];
        if (runSolid) {
          // +1px de folga evita costura entre colunas em dpr fracionário
          ctx.fillRect(runStart * S.charW, y, (end - runStart) * S.charW + 1, S.charH + 1);
        } else {
          ctx.fillText(buf.join(""), runStart * S.charW, y);
        }
        buf.length = 0; runStart = -1;
      };

      for (let c = 0; c <= S.cols; c++) {
        const code = c < S.cols ? chars[base + c] : 0;
        const p = c < S.cols ? pal[base + c] : -1;
        const solid = code === SOLID;
        const empty = code === 0;

        if (runStart >= 0 && (empty || p !== runPal || solid !== runSolid)) close(c);
        if (!empty) {
          if (runStart < 0) { runStart = c; runPal = p; runSolid = solid; }
          if (!solid) buf.push(String.fromCharCode(code));
        }
      }
      close(S.cols);
    }
  }

  // ------------------------------------------------------------- raycaster
  const hash = (a, b) => (((a * 73856093) ^ (b * 19349663)) >>> 0) % 997;

  /** Degraus de escurecimento por distância — grossos de propósito: gradiente
   *  fino vira ruído, degrau largo lê como plano de profundidade. */
  function fade(dist) {
    return dist < 11 ? 0 : dist < 20 ? 1 : dist < 30 ? 2 : dist < 40 ? 3 : 4;
  }

  function renderWorld(cam) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const vProj = S.vProj;
    const horizon = S.rows / 2 + cam.pitch;
    const eyeZ = cam.eyeZ;

    for (let c = 0; c < S.cols; c++) {
      const camX = (2 * c) / (S.cols - 1) - 1;
      const rayX = dirX + planeX * camX;
      const rayY = dirY + planeY * camX;

      let mapX = cam.x | 0, mapY = cam.y | 0;
      const deltaX = rayX === 0 ? 1e30 : Math.abs(1 / rayX);
      const deltaY = rayY === 0 ? 1e30 : Math.abs(1 / rayY);
      let stepX, stepY, sideX, sideY;
      if (rayX < 0) { stepX = -1; sideX = (cam.x - mapX) * deltaX; }
      else { stepX = 1; sideX = (mapX + 1 - cam.x) * deltaX; }
      if (rayY < 0) { stepY = -1; sideY = (cam.y - mapY) * deltaY; }
      else { stepY = 1; sideY = (mapY + 1 - cam.y) * deltaY; }

      let yBot = S.rows - 1;
      let prevH = heightAt(cam.x, cam.y);
      let prevT = 0.0001;
      let t = 0, side = 0;

      while (t < CFG.far && yBot >= 0) {
        if (sideX < sideY) { t = sideX; sideX += deltaX; mapX += stepX; side = 0; }
        else { t = sideY; sideY += deltaY; mapY += stepY; side = 1; }

        // ---- superfície horizontal da célula anterior (piso / topo)
        if (prevH < eyeZ - 0.001) {
          const dz = prevH - eyeZ;
          const yFar = horizon - (dz / t) * vProj;
          const yNear = prevT <= 0.001 ? S.rows : horizon - (dz / prevT) * vProj;
          const r0 = Math.max(0, Math.ceil(yFar));
          const r1 = Math.min(yBot, Math.floor(yNear));
          const raised = prevH > 0.05;
          for (let r = r1; r >= r0; r--) {
            const dist = (dz * vProj) / (horizon - r);
            if (dist <= 0 || dist > CFG.far) continue;
            const wx = cam.x + rayX * dist, wy = cam.y + rayY * dist;
            const f = fade(dist);
            if (raised) {
              // Plataforma: chapada e escura. O ciano marca só a BORDA REAL —
              // onde a célula vizinha tem outra altura. Marcar toda divisa de
              // célula transforma o piso num tabuleiro e engole a cena.
              const gx = Math.floor(wx), gy = Math.floor(wy);
              const fx = wx - gx, fy = wy - gy;
              const thr = Math.min(0.2, Math.max(0.02, dist * 0.01));
              const diff = (ox, oy) => heightAt(gx + ox + 0.5, gy + oy + 0.5) !== prevH;
              const edge =
                (fx < thr && diff(-1, 0)) || (fx > 1 - thr && diff(1, 0)) ||
                (fy < thr && diff(0, -1)) || (fy > 1 - thr && diff(0, 1));
              put(c, r, SOLID, edge ? Math.max(P.cy0, P.cy1 - (f >> 1)) : Math.max(P.void_, P.s0 - (f >> 1)), dist);
            } else {
              // pátio: praticamente vazio, só nós esparsos da malha
              const fx = wx - Math.floor(wx), fy = wy - Math.floor(wy);
              const thr = Math.min(0.3, Math.max(0.015, dist * 0.014));
              if (fx < thr && fy < thr) put(c, r, 43 /* + */, P.s2, dist);
            }
          }
          if (r0 <= yBot) yBot = Math.min(yBot, r0 - 1);
        }

        const nextH = heightAt(mapX + 0.5, mapY + 0.5);

        // ---- face vertical
        if (nextH > prevH + 0.001) {
          const yTop = horizon - ((nextH - eyeZ) / t) * vProj;
          const yBase = horizon - ((prevH - eyeZ) / t) * vProj;
          const r0 = Math.max(0, Math.ceil(yTop));
          const r1 = Math.min(yBot, Math.floor(yBase));
          const f = fade(t);
          const walk = nextH < 1.9;                       // dá pra pisar em cima
          // UMA cor por face: é o contraste entre faces que desenha o volume
          const tone = walk
            ? Math.max(P.s0, P.s1 - (f >> 1))
            : Math.max(P.s0, (side ? P.s1 : P.s2) - (f >> 1));
          const lip = walk ? Math.max(P.cy0, P.cy2 - f) : Math.max(P.s1, P.s4 - f);
          const capOn = Math.ceil(yTop) >= 0;

          const hitU = side ? cam.x + rayX * t : cam.y + rayY * t;
          const tv = t / vProj;

          for (let r = r1; r >= r0; r--) {
            if (r === r0 && capOn) { put(c, r, SOLID, lip, t); continue; }
            const worldZ = eyeZ + (horizon - r) * tv;
            // detalhe esparso: linha de painel, não textura contínua
            const mark = hash((hitU * 3) | 0, (worldZ * 4) | 0);
            if (mark < 42 && t < 30) {
              put(c, r, mark < 14 ? 45 /* - */ : mark < 28 ? 47 /* / */ : 61 /* = */,
                  Math.min(P.s4, tone + 2), t);
            } else {
              put(c, r, SOLID, tone, t);
            }
          }
          if (r0 <= yBot) yBot = Math.min(yBot, r0 - 1);
        }

        prevH = nextH;
        prevT = t;
      }
    }
  }

  // --------------------------------------------------------------- sprites
  const ART = {
    worm: [
      "   .---.   ",
      "  / o o \\  ",
      " |  ~~~  | ",
      "  \\_===_/  ",
      "  /|   |\\  ",
      "   ^   ^   ",
    ],
    trojan: [
      "  _______  ",
      " |o     o| ",
      " |   ^   | ",
      " |_=====_| ",
      " /|     |\\ ",
      "  |     |  ",
      "  L     J  ",
    ],
    ransom: [
      " ######### ",
      " #$     $# ",
      " #   _   # ",
      " ##[###]## ",
      " ######### ",
      "  /|   |\\  ",
      "  L     J  ",
    ],
    boss: [
      "    ///|\\\\\\    ",
      "   | O   O |   ",
      "   |  vvv  |   ",
      "  /#########\\  ",
      "  |#[=====]#|  ",
      "  \\###/ \\###/  ",
      "   //     \\\\   ",
    ],
    shot: ["*"],
  };

  function renderSprites(cam, list) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const horizon = S.rows / 2 + cam.pitch;
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    let aimed = null;

    const sorted = list
      .map((e) => ({ e, d: (e.x - cam.x) ** 2 + (e.y - cam.y) ** 2 }))
      .sort((a, b) => b.d - a.d);

    for (const { e } of sorted) {
      const relX = e.x - cam.x, relY = e.y - cam.y;
      const tx = invDet * (dirY * relX - dirX * relY);
      const ty = invDet * (-planeY * relX + planeX * relY);
      if (ty <= 0.2) continue;

      const art = ART[e.art];
      const midCol = (S.cols / 2) * (1 + tx / ty);
      const rowBottom = horizon - ((e.z - cam.eyeZ) / ty) * S.vProj;
      const rowTop = horizon - ((e.z + e.h - cam.eyeZ) / ty) * S.vProj;
      const spanRows = rowBottom - rowTop;
      if (spanRows < 1) continue;
      const spanCols = (e.w / ty) * S.hProj;

      const c0 = Math.max(0, Math.ceil(midCol - spanCols / 2));
      const c1 = Math.min(S.cols - 1, Math.floor(midCol + spanCols / 2));
      const r0 = Math.max(0, Math.ceil(rowTop));
      const r1 = Math.min(S.rows - 1, Math.floor(rowBottom));
      const artW = art[0].length, artH = art.length;
      const tone = e.hitFlash > 0 ? P.ink : e.boss ? P.boss : ty < 22 ? P.co1 : P.co0;

      if (e.def) {
        const mc = Math.round(midCol) - 1;
        if (mc > 0 && mc < S.cols - 3 && rowTop > 1) text(mc, Math.max(0, r0 - 1), "[v]", tone, ty - 0.01);
        if (Math.abs(midCol - S.cols / 2) < spanCols / 2 + 1 && (!aimed || ty < aimed.d)) {
          aimed = { d: ty, col: Math.round(midCol), row: Math.max(0, r0 - 2), e };
        }
      }

      for (let c = c0; c <= c1; c++) {
        const u = (((c - (midCol - spanCols / 2)) / spanCols) * artW) | 0;
        if (u < 0 || u >= artW) continue;
        for (let r = r0; r <= r1; r++) {
          const v = (((r - rowTop) / spanRows) * artH) | 0;
          if (v < 0 || v >= artH) continue;
          const ch = art[v].charCodeAt(u);
          if (!ch || ch === 32) continue;
          put(c, r, ch, tone, ty);
        }
      }
    }

    if (aimed) {
      const label = `${aimed.e.name} . ${aimed.d.toFixed(0)} m`;
      text(aimed.col - (label.length >> 1), aimed.row, label, P.s5);
    }
  }

  // ---------------------------------------------------------------- player
  const player = {
    x: start.x, y: start.y, z: 0, vz: 0, yaw: -Math.PI / 2, pitch: 0,
    hp: CFG.hpMax, ammo: CFG.mag, reserve: 150,
    fireCd: 0, reloadT: 0, slideT: 0, grounded: true,
    lastHit: -99, bob: 0, kick: 0, eyeZ: 0,
  };
  const keys = Object.create(null);
  const mouse = { down: false };
  const AIM = { mult: 1 };
  const game = {
    mode: "menu", t: 0, wave: 0, score: 0, combo: 0,
    enemies: [], shots: [], popups: [], banner: null,
    queue: [], nextSpawn: 0, gap: 3.5, shake: 0, hitMark: 0, muted: false,
  };

  const OFFS = [[0, 0], [-CFG.radius, -CFG.radius], [CFG.radius, -CFG.radius],
                [-CFG.radius, CFG.radius], [CFG.radius, CFG.radius]];
  function floorUnder(x, y) {
    let h = 0;
    for (let i = 0; i < OFFS.length; i++) {
      const v = heightAt(x + OFFS[i][0], y + OFFS[i][1]);
      if (v > h) h = v;
    }
    return h;
  }
  function slideAxis(a, nx, ny) {
    const h = floorUnder(nx, ny);
    if (h > a.z + CFG.stepUp) return false;
    a.x = nx; a.y = ny;
    if (h > a.z && a.grounded) { a.z = h; a.vz = 0; }
    return true;
  }
  function gravity(a, dt) {
    const g = floorUnder(a.x, a.y);
    a.vz -= CFG.gravity * dt;
    a.z += a.vz * dt;
    if (a.z <= g) { a.z = g; a.vz = 0; a.grounded = true; } else a.grounded = false;
  }

  function look(dx, dy) {
    const s = CFG.sens * AIM.mult;
    player.yaw += dx * s;
    player.pitch -= dy * s * S.vProj;   // pitch vive em linhas: converte pelo vProj
    const lim = S.rows * 0.85;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
  }

  function updatePlayer(dt) {
    const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const dx = Math.cos(player.yaw), dy = Math.sin(player.yaw);
    let wx = dx * fwd - dy * str, wy = dy * fwd + dx * str;
    const len = Math.hypot(wx, wy);
    if (len > 0) { wx /= len; wy /= len; }

    const sprint = (keys.ShiftLeft || keys.ShiftRight) && fwd > 0 && player.slideT <= 0;
    if ((keys.ControlLeft || keys.ControlRight || keys.KeyC) && sprint &&
        player.grounded && player.slideT <= 0 && len > 0) {
      player.slideT = CFG.slideTime; sfx("slide");
    }
    if (player.slideT > 0) player.slideT -= dt;

    let speed = CFG.speedWalk;
    if (player.slideT > 0) speed = CFG.speedSlide * (0.55 + (player.slideT / CFG.slideTime) * 0.45);
    else if (sprint) speed = CFG.speedSprint;
    if (!player.grounded) speed *= 0.92;

    if (len > 0) {
      slideAxis(player, player.x + wx * speed * dt, player.y);
      slideAxis(player, player.x, player.y + wy * speed * dt);
      player.bob += speed * dt * (player.slideT > 0 ? 0.4 : 1);
    }

    const lx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
    const ly = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0);
    if (lx || ly) look(lx * dt * 1200, ly * dt * 500);

    if (keys.Space && player.grounded && player.slideT <= 0) {
      player.vz = CFG.jumpV; player.grounded = false; sfx("jump");
    }
    gravity(player, dt);

    const base = player.slideT > 0 ? CFG.eyeSlide : CFG.eye;
    const bob = player.grounded && len > 0 ? Math.sin(player.bob * 9) * 0.02 : 0;
    player.eyeZ = player.z + base + bob - player.kick * 0.05;
    player.kick = Math.max(0, player.kick - dt * 6);

    if (game.t - player.lastHit > CFG.regenDelay && player.hp < CFG.hpMax) {
      player.hp = Math.min(CFG.hpMax, player.hp + CFG.regenRate * dt);
    }

    player.fireCd -= dt;
    if (player.reloadT > 0) {
      player.reloadT -= dt;
      if (player.reloadT <= 0) {
        const need = Math.min(CFG.mag - player.ammo, player.reserve);
        player.ammo += need; player.reserve -= need;
      }
    } else if (mouse.down && player.fireCd <= 0) {
      if (player.ammo > 0) fire(len > 0); else reload();
    }
    if (keys.KeyR) reload();
  }

  function reload() {
    if (player.reloadT > 0 || player.ammo >= CFG.mag || player.reserve <= 0) return;
    player.reloadT = CFG.reload;
    sfx("reload");
  }

  // ----------------------------------------------------------------- input
  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code.startsWith("Arrow") || e.code === "Space" || e.code === "Tab") e.preventDefault();
    if (e.code === "KeyP" && game.mode === "play") pause();
    if (e.code === "KeyM") game.muted = !game.muted;
    if (e.code === "BracketLeft") setSens(AIM.mult - 0.1, true);
    if (e.code === "BracketRight") setSens(AIM.mult + 0.1, true);
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; mouse.down = false; });
  canvas.addEventListener("mousedown", (e) => { if (e.button === 0) mouse.down = true; });
  window.addEventListener("mouseup", (e) => { if (e.button === 0) mouse.down = false; });

  document.addEventListener("mousemove", (e) => {
    const locked = document.pointerLockElement === canvas;
    // sem captura (iframe, permissão negada) ainda dá pra mirar arrastando
    if (!locked && !(mouse.down && game.mode === "play")) return;
    look(e.movementX || 0, e.movementY || 0);
  });
  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement !== canvas && game.mode === "play") pause();
  });
  function grabMouse() {
    const r = canvas.requestPointerLock?.();
    if (r && typeof r.catch === "function") r.catch(() => {});
  }

  function setSens(v, save) {
    AIM.mult = Math.min(2.5, Math.max(0.3, v || 1));
    for (const i of document.querySelectorAll(".sens")) i.value = String(AIM.mult);
    for (const o of document.querySelectorAll(".sensOut")) o.textContent = `${AIM.mult.toFixed(2)}x`;
    if (save) { try { localStorage.setItem("subnet.sens", String(AIM.mult)); } catch (_) {} }
  }

  // --------------------------------------------------------------- combate
  const TYPES = {
    worm:   { art: "worm",   hp: 42,  speed: 3.0,  dmg: 9,  w: 0.8,  h: 0.95, range: 1.1, rate: 0.9, score: 10 },
    trojan: { art: "trojan", hp: 80,  speed: 2.0,  dmg: 13, w: 0.9,  h: 1.15, range: 12,  rate: 1.8, score: 20, ranged: true },
    ransom: { art: "ransom", hp: 170, speed: 1.45, dmg: 22, w: 1.1,  h: 1.25, range: 1.4, rate: 1.4, score: 35 },
    boss:   { art: "boss",   hp: 950, speed: 1.7,  dmg: 26, w: 2.2,  h: 2.4,  range: 16,  rate: 1.1, score: 250, ranged: true, boss: true },
  };
  const BOSS_NAMES = ["MELISSA", "STUXNET", "BLASTER", "CONFICKER", "SLAMMER"];

  function hitscan(ox, oy, oz, yaw, slope, maxD, ignoreEnemies) {
    const dx = Math.cos(yaw), dy = Math.sin(yaw);
    for (let t = 0.3; t < maxD; t += 0.09) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + slope * t;
      if (z > 9 || heightAt(x, y) > z) return { type: "wall", x, y, z, t };
      if (!ignoreEnemies) {
        for (const e of game.enemies) {
          if (e.dead) continue;
          const ex = x - e.x, ey = y - e.y, rr = e.w * 0.55;
          if (ex * ex + ey * ey < rr * rr && z >= e.z && z <= e.z + e.h) return { type: "enemy", e, x, y, z, t };
        }
      }
    }
    return null;
  }

  const lineOfSight = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.hypot(dx, dy);
    return !hitscan(a.x, a.y, a.z, Math.atan2(dy, dx), (b.z - a.z) / Math.max(0.001, d), d, true);
  };

  function fire(moving) {
    player.ammo--;
    player.fireCd = CFG.fireDelay;
    player.kick = 1;
    game.shake = Math.max(game.shake, 0.6);
    sfx("shot");

    const spread = (moving ? CFG.spreadMove : CFG.spread) * (player.grounded ? 1 : 1.9);
    const yaw = player.yaw + (Math.random() - 0.5) * spread * 6;
    const slope = player.pitch / S.vProj + (Math.random() - 0.5) * spread * 6;
    const hit = hitscan(player.x, player.y, player.eyeZ, yaw, slope, CFG.far);
    if (!hit || hit.type === "wall") return;

    const e = hit.e;
    const head = hit.z >= e.z + e.h * CFG.headZone;
    e.hp -= CFG.dmg * (head ? CFG.headMult : 1);
    e.hitFlash = 0.07;
    game.hitMark = 0.12;
    sfx(head ? "head" : "hit");
    if (head) {
      game.score += 50;
      game.popups.push({ x: e.x, y: e.y, z: e.z + e.h + 0.4, txt: "HEADSHOT +50", life: 1.1, pal: P.ink });
    }
    if (e.hp <= 0) kill(e);
  }

  function kill(e) {
    e.dead = true;
    game.combo++;
    const pts = e.def.score + Math.min(50, game.combo * 2);
    game.score += pts;
    player.reserve = Math.min(200, player.reserve + (e.def.boss ? 60 : 10));
    game.popups.push({ x: e.x, y: e.y, z: e.z + e.h * 0.6, txt: `+${pts}`, life: 0.9, pal: P.cy2 });
    sfx(e.def.boss ? "boss" : "kill");
    if (e.def.boss) game.banner = { txt: `${e.name} PURGED`, sub: "", life: 3 };
  }

  function hurt(amount) {
    player.hp -= amount;
    player.lastHit = game.t;
    game.combo = 0;
    game.shake = Math.max(game.shake, 1.4);
    sfx("hurt");
    if (player.hp <= 0) { player.hp = 0; gameOver(); }
  }

  // -------------------------------------------------------- IA + navegação
  // Campo de fluxo BFS a partir da célula do player: cada inimigo só desce o
  // gradiente. É o que faz o bicho contornar torre e subir escada em vez de
  // empurrar parede.
  const flow = new Int32Array(MAP.w * MAP.h);
  const fq = new Int32Array(MAP.w * MAP.h);
  const N8 = [...N4, [1, 1], [1, -1], [-1, 1], [-1, -1]];
  let flowT = 0;

  function rebuildFlow() {
    flow.fill(-1);
    const sx = player.x | 0, sy = player.y | 0;
    if (!inside(sx, sy)) return;
    const s0 = sy * MAP.w + sx;
    if (height[s0] >= 2) return;
    flow[s0] = 0; fq[0] = s0;
    let head = 0, tail = 1;
    while (head < tail) {
      const cur = fq[head++];
      const cx = cur % MAP.w, cy = (cur / MAP.w) | 0;
      const hc = height[cur], d = flow[cur];
      for (let k = 0; k < 4; k++) {
        const nx = cx + N4[k][0], ny = cy + N4[k][1];
        if (nx < 1 || ny < 1 || nx >= MAP.w - 1 || ny >= MAP.h - 1) continue;
        const ni = ny * MAP.w + nx;
        if (flow[ni] !== -1) continue;
        const hn = height[ni];
        if (hn >= 2 || hc - hn > CFG.stepUp) continue;
        flow[ni] = d + 1; fq[tail++] = ni;
      }
    }
  }

  function flowStep(e) {
    const cx = e.x | 0, cy = e.y | 0;
    if (!inside(cx, cy)) return null;
    let best = flow[cy * MAP.w + cx];
    if (best < 0) best = Infinity;
    let bx = -1, by = -1;
    for (const [ox, oy] of N8) {
      const nx = cx + ox, ny = cy + oy;
      if (!inside(nx, ny)) continue;
      const v = flow[ny * MAP.w + nx];
      if (v < 0 || v >= best) continue;
      if (ox && oy && (flow[cy * MAP.w + nx] < 0 || flow[ny * MAP.w + cx] < 0)) continue;
      best = v; bx = nx; by = ny;
    }
    return bx < 0 ? null : { x: bx + 0.5, y: by + 0.5 };
  }

  function spawn(kind) {
    const def = TYPES[kind];
    let best = spawns[0], bestD = -1;
    for (const s of spawns) {
      const d = ((s.x - player.x) ** 2 + (s.y - player.y) ** 2) * (0.7 + Math.random() * 0.6);
      if (d > bestD) { bestD = d; best = s; }
    }
    const scale = 1 + (game.wave - 1) * 0.12;
    game.enemies.push({
      x: best.x, y: best.y, z: floorUnder(best.x, best.y), vz: 0, grounded: true,
      def, art: def.art, w: def.w, h: def.h, boss: !!def.boss,
      hp: def.hp * scale, cd: 0.7, hitFlash: 0, dead: false,
      name: def.boss ? BOSS_NAMES[((game.wave / 3 - 1) | 0) % BOSS_NAMES.length] : kind.toUpperCase(),
    });
  }

  function updateEnemies(dt) {
    if ((flowT -= dt) <= 0) { flowT = 0.25; rebuildFlow(); }
    for (const e of game.enemies) {
      if (e.dead) continue;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.cd -= dt;

      const dx = player.x - e.x, dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const sees = lineOfSight({ x: e.x, y: e.y, z: e.z + e.h * 0.6 },
                               { x: player.x, y: player.y, z: player.eyeZ });
      const want = e.def.ranged ? Math.min(e.def.range * 0.55, 8) : e.def.range * 0.8;
      let mv = dist > want ? 1 : e.def.ranged && dist < want * 0.5 ? -0.6 : 0;

      if (mv !== 0) {
        let tx = dx / dist, ty = dy / dist;
        if (mv > 0 && !(sees && dist < 5)) {
          const step = flowStep(e);
          if (step) {
            const l = Math.hypot(step.x - e.x, step.y - e.y) || 1;
            tx = (step.x - e.x) / l; ty = (step.y - e.y) / l;
          }
        }
        const sp = e.def.speed * mv * dt;
        const okX = slideAxis(e, e.x + tx * sp, e.y);
        const okY = slideAxis(e, e.x, e.y + ty * sp);
        if (!okX && !okY && !slideAxis(e, e.x - ty * sp, e.y + tx * sp)) {
          slideAxis(e, e.x + ty * sp, e.y - tx * sp);
        }
      }
      gravity(e, dt);

      if (e.cd <= 0 && sees && dist <= e.def.range) {
        e.cd = e.def.rate;
        if (e.def.ranged) {
          const n = e.boss ? 3 : 1;
          const tz = player.eyeZ - (e.z + e.h * 0.6);
          for (let i = 0; i < n; i++) {
            const ang = Math.atan2(dy, dx) + (i - (n - 1) / 2) * 0.09;
            game.shots.push({
              x: e.x, y: e.y, z: e.z + e.h * 0.6, art: "shot", w: 0.35, h: 0.35,
              vx: Math.cos(ang) * 11, vy: Math.sin(ang) * 11, vz: (tz / dist) * 11,
              dmg: e.def.dmg, life: 4, hitFlash: 0, boss: e.boss,
            });
          }
          sfx("enemyShot");
        } else hurt(e.def.dmg);
      }

      if (e.boss && (e.tick = (e.tick ?? 7) - dt) <= 0) { e.tick = 8; spawn("worm"); spawn("worm"); }
    }
    game.enemies = game.enemies.filter((e) => !e.dead);
  }

  function updateShots(dt) {
    for (const s of game.shots) {
      s.life -= dt;
      s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
      if (heightAt(s.x, s.y) > s.z || s.z < 0) s.life = 0;
      const dx = s.x - player.x, dy = s.y - player.y;
      if (dx * dx + dy * dy < 0.22 && Math.abs(s.z - (player.z + 0.5)) < 0.8) { hurt(s.dmg); s.life = 0; }
    }
    game.shots = game.shots.filter((s) => s.life > 0);
  }

  // ----------------------------------------------------------------- ondas
  function startWave(n) {
    game.wave = n;
    const q = [];
    const count = Math.min(28, 4 + n * 2);
    for (let i = 0; i < count; i++) {
      let k = "worm";
      if (n >= 2 && i % 3 === 1) k = "trojan";
      if (n >= 4 && i % 5 === 4) k = "ransom";
      q.push(k);
    }
    const boss = n % 3 === 0;
    if (boss) q.unshift("boss");
    game.queue = q;
    game.nextSpawn = 1;
    const name = BOSS_NAMES[((n / 3 - 1) | 0) % BOSS_NAMES.length];
    game.banner = {
      txt: boss ? `WAVE ${String(n).padStart(2, "0")} // BOSS // ${name}`
                : `WAVE ${String(n).padStart(2, "0")} // ${q.includes("ransom") ? "RANSOM ONLINE" : q.includes("trojan") ? "TROJAN ONLINE" : "WORMS INBOUND"}`,
      sub: boss ? `${name}: rajada a distancia e reforco constante. Use a passarela.`
                : "WORM: corpo a corpo. TROJAN: tiro a distancia. RANSOM: blindado.",
      life: 3.4,
    };
    sfx("wave");
  }

  function updateWaves(dt) {
    if (game.queue.length) {
      game.nextSpawn -= dt;
      if (game.nextSpawn <= 0) {
        spawn(game.queue.shift());
        game.nextSpawn = Math.max(0.35, 1.5 - game.wave * 0.06);
      }
    } else if (!game.enemies.length) {
      game.gap -= dt;
      if (game.gap <= 0) { game.gap = 3.5; startWave(game.wave + 1); }
    }
  }

  // ----------------------------------------------------------------- áudio
  let actx = null, noiseBuf = null;
  function audio() {
    if (actx) return actx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
    const len = Math.floor(actx.sampleRate * 0.3);
    noiseBuf = actx.createBuffer(1, len, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
    return actx;
  }
  function tone(f0, f1, dur, type, vol) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + dur);
    o.connect(g).connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  }
  function burst(dur, vol, cutoff) {
    const a = audio(); if (!a || !noiseBuf) return;
    const s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter();
    s.buffer = noiseBuf; f.type = "lowpass"; f.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + dur);
    s.connect(f).connect(g).connect(a.destination);
    s.start(); s.stop(a.currentTime + dur + 0.02);
  }
  function sfx(kind) {
    if (game.muted) return;
    switch (kind) {
      case "shot":      burst(0.09, 0.2, 2400); tone(210, 70, 0.09, "square", 0.06); break;
      case "hit":       tone(520, 380, 0.05, "square", 0.05); break;
      case "head":      tone(1250, 620, 0.12, "sawtooth", 0.09); break;
      case "kill":      tone(180, 60, 0.22, "triangle", 0.1); break;
      case "boss":      tone(90, 38, 0.9, "sawtooth", 0.18); break;
      case "hurt":      tone(140, 55, 0.24, "sawtooth", 0.13); break;
      case "reload":    tone(300, 460, 0.07, "square", 0.06); setTimeout(() => tone(460, 300, 0.07, "square", 0.06), 320); break;
      case "jump":      tone(420, 620, 0.07, "sine", 0.04); break;
      case "slide":     burst(0.28, 0.09, 900); break;
      case "wave":      tone(320, 640, 0.3, "square", 0.09); break;
      case "enemyShot": tone(180, 120, 0.1, "sawtooth", 0.045); break;
    }
  }

  // ------------------------------------------------------------------ arma
  // AK-47 em vista de primeira pessoa, montada como retângulos em coordenadas
  // de célula — arte linha a linha não acompanha a grade quando ela muda de
  // tamanho. A assinatura da arma são três coisas: carregador banana curvo
  // (feito de três blocos deslocados), tubo de gás acima do cano, e massa de
  // mira na ponta. Sem isso vira "fuzil genérico".
  //          [x0, x1, y0, y1, tom]   y negativo = pra cima
  const STEEL = 0, WOOD = 1, EDGE = 2;
  // ATENÇÃO à escala: a célula é 1.45x mais alta que larga, então altura em
  // LINHAS precisa ser dividida por isso pra proporção sair certa. Desenhar
  // como se a célula fosse quadrada deixa a arma com o dobro da altura.
  // Proporção alvo: 96 células de comprimento por ~19 linhas (~3.5:1, que é a
  // razão real de uma AK com carregador).
  const AK = [
    [-64, -58, -19, -17, STEEL],   // freio de boca
    [-59, -57, -22, -16, STEEL],   // massa de mira
    [-57, -34, -18, -17, STEEL],   // cano
    [-52, -34, -21, -20, STEEL],   // tubo de gás
    [-53, -49, -22, -19, STEEL],   // bloco de gás
    [-47, -33, -21, -16, WOOD],    // guarda-mão
    [-46, -34, -16, -15, WOOD],
    [-31, -3, -20, -13, STEEL],    // caixa da culatra
    [-31, -5, -21, -20, EDGE],     // tampa superior
    [-29, -25, -22, -21, STEEL],   // alça de mira
    [-21, -13, -13, -9, STEEL],    // carregador banana: três blocos que
    [-23, -15, -9, -6, STEEL],     //   avançam pra frente enquanto descem
    [-26, -18, -6, -3, STEEL],
    [-10, -3, -13, -8, WOOD],      // punho
    [-9, -4, -8, -4, WOOD],
    [-4, 7, -19, -15, STEEL],      // pescoço da coronha
    [6, 24, -19, -14, WOOD],       // coronha
    [22, 32, -21, -12, WOOD],      // soleira
  ];
  const AK_TONE = [P.s2, P.s3, P.s4];

  function renderGun() {
    const kick = Math.round(player.kick * 2.5);
    const sway = Math.round(Math.sin(player.bob * 9) * 1.6);
    const ax = ((S.cols * 0.47) | 0) + sway;
    const ay = S.rows - 1 + kick + (player.slideT > 0 ? 4 : 0);
    const dim = player.reloadT > 0 ? 1 : 0;
    const tilt = (x) => Math.round(x * 0.08);   // cano aponta pro centro da tela

    for (const [x0, x1, y0, y1, kind] of AK) {
      const t = AK_TONE[kind];
      for (let x = x0; x <= x1; x++) {
        const shear = tilt(x);
        for (let y = y0; y <= y1; y++) {
          const c = ax + x, r = ay + y + shear;
          if (c < 0 || r < 0 || c >= S.cols || r >= S.rows) continue;
          const tone = y === y0 ? Math.min(P.s5, t + 2)              // topo pega luz
                     : x === x0 || x === x1 ? Math.max(P.s0, t - 1)  // quina some
                     : t - dim;
          put(c, r, SOLID, Math.max(P.s0, tone), Z.gun);
        }
      }
    }

    // ventilação do guarda-mão: o detalhe que lê como AK de perto
    for (let x = -45; x <= -35; x += 3) {
      const r = ay + tilt(x) - 20;
      put(ax + x, r, 61 /* = */, P.s5, Z.gunDetail);
      put(ax + x, r + 1, 61, P.s4, Z.gunDetail);
    }
    // marca ciano na culatra: único ponto saturado do primeiro plano
    for (let x = -28; x <= -10; x += 5) {
      put(ax + x, ay + tilt(x) - 16, 46 /* . */, P.cy2, Z.gunDetail);
    }

    if (player.kick > 0.6) {
      const mr = ay + tilt(-66) - 18;
      text(ax - 67, mr - 1, "\\", P.ink, Z.muzzle);
      text(ax - 68, mr, "-", P.ink, Z.muzzle);
      text(ax - 67, mr + 1, "/", P.ink, Z.muzzle);
    }
  }

  // ------------------------------------------------------------------- HUD
  const ZONES = [
    { x0: 0, y0: 0, x1: 71, y1: 17, name: "NORTH TERRACE" },
    { x0: 0, y0: 18, x1: 17, y1: 53, name: "WEST GANTRY" },
    { x0: 54, y0: 18, x1: 71, y1: 53, name: "EAST GANTRY" },
    { x0: 27, y0: 33, x1: 44, y1: 48, name: "CORE STACK" },
    { x0: 0, y0: 54, x1: 71, y1: 71, name: "SOUTH DOCK" },
  ];
  const zoneName = () => {
    const x = player.x | 0, y = player.y | 0;
    for (const z of ZONES) if (x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) return z.name;
    return "CENTRAL COURTYARD";
  };

  const hud = {};
  for (const id of ["Wave", "Hostiles", "Compass", "Zone", "Pts", "Integrity", "IntegrityBar",
                    "Mag", "Reserve", "Reload", "Toast", "Slide", "Banner", "BannerSub"]) {
    hud[id] = document.getElementById("hud" + id);
  }
  const last = {};
  const setHud = (k, v) => { if (hud[k] && last[k] !== v) { last[k] = v; hud[k].textContent = v; } };
  const showHud = (k, on) => { if (hud[k] && last[k + "!"] !== on) { last[k + "!"] = on; hud[k].hidden = !on; } };
  const CARDINAL = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

  function updateHud() {
    const deg = ((((player.yaw * 180) / Math.PI + 90) % 360) + 360) % 360;
    setHud("Compass", `[ ${CARDINAL[Math.round(deg / 45) % 8]} ${String(Math.round(deg)).padStart(3, "0")}\u00B0 ]`);
    setHud("Zone", zoneName());
    setHud("Wave", String(game.wave).padStart(2, "0"));
    const alive = game.enemies.length + game.queue.length;
    setHud("Hostiles", alive === 1 ? "1 HOSTILE REMAINING" : `${alive} HOSTILES REMAINING`);
    setHud("Pts", String(game.score).padStart(6, "0"));

    const hp = Math.round(player.hp);
    setHud("Integrity", String(hp));
    const n = Math.max(0, Math.min(18, Math.round((hp / CFG.hpMax) * 18)));
    setHud("IntegrityBar", "|".repeat(n) + ".".repeat(18 - n));
    hud.Integrity?.classList.toggle("low", hp < 35);

    setHud("Mag", String(player.ammo).padStart(2, "0"));
    setHud("Reserve", String(player.reserve));
    setHud("Reload", player.reloadT > 0 ? "RELOADING" : "[R] RELOAD");
    showHud("Slide", game.mode === "play" && player.slideT <= 0 && player.grounded);
    showHud("Toast", game.mode === "play" && !document.pointerLockElement);
    showHud("Banner", !!game.banner);
    if (game.banner) { setHud("Banner", game.banner.txt); setHud("BannerSub", game.banner.sub || ""); }
  }

  /** Só o que pertence ao mundo fica na grade: mira, acerto, borda de dano. */
  function renderOverlay() {
    const cx = S.cols >> 1, cy = S.rows >> 1;
    const open = player.slideT > 0 ? 4 : 2;
    put(cx - open, cy, 45, P.ink, Z.overlay);
    put(cx + open, cy, 45, P.ink, Z.overlay);
    put(cx, cy - 1, 39, P.ink, Z.overlay);
    put(cx, cy + 1, 39, P.ink, Z.overlay);
    if (game.hitMark > 0) {
      text(cx - 3, cy - 2, "\\", P.co1, Z.overlay); text(cx + 3, cy - 2, "/", P.co1, Z.overlay);
      text(cx - 3, cy + 2, "/", P.co1, Z.overlay); text(cx + 3, cy + 2, "\\", P.co1, Z.overlay);
    }
    const since = game.t - player.lastHit;
    if (since < 0.45) {
      const p = since < 0.2 ? P.co1 : P.co0;
      for (let c = 0; c < S.cols; c += 2) { put(c, 0, 61, p, Z.overlay); put(c, S.rows - 1, 61, p, Z.overlay); }
      for (let r = 0; r < S.rows; r += 2) { put(0, r, 124, p, Z.overlay); put(S.cols - 1, r, 124, p, Z.overlay); }
    }
  }

  function renderPopups(cam) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    for (const p of game.popups) {
      const relX = p.x - cam.x, relY = p.y - cam.y;
      const ty = invDet * (-planeY * relX + planeX * relY);
      if (ty <= 0.25) continue;
      const tx = invDet * (dirY * relX - dirX * relY);
      const col = (S.cols / 2) * (1 + tx / ty);
      const row = S.rows / 2 + cam.pitch - ((p.z - cam.eyeZ) / ty) * S.vProj;
      text(Math.round(col - p.txt.length / 2), Math.round(row), p.txt, p.pal);
    }
  }

  // ------------------------------------------------------------------ loop
  function draw(dt) {
    clear();
    const sh = game.shake;
    const cam = {
      x: player.x, y: player.y, eyeZ: player.eyeZ,
      yaw: player.yaw + (Math.random() - 0.5) * sh * 0.012,
      pitch: player.pitch + (Math.random() - 0.5) * sh * 1.6,
    };
    renderWorld(cam);
    renderSprites(cam, game.enemies.concat(game.shots));
    renderPopups(cam);
    renderGun();
    renderOverlay();
    flush();
    updateHud();
    game.shake = Math.max(0, game.shake - dt * 4);
    game.hitMark = Math.max(0, game.hitMark - dt);
  }

  let prev = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, prev ? (ts - prev) / 1000 : 0.016);
    prev = ts;
    if (game.mode === "play") {
      game.t += dt;
      updatePlayer(dt);
      updateEnemies(dt);
      updateShots(dt);
      updateWaves(dt);
      for (const p of game.popups) { p.life -= dt; p.z += dt * 0.7; }
      game.popups = game.popups.filter((p) => p.life > 0);
      if (game.banner && (game.banner.life -= dt) <= 0) game.banner = null;
    }
    draw(dt);
  }

  // --------------------------------------------------------------- estados
  const el = (id) => document.getElementById(id);
  const boxed = (lines) => {
    const w = Math.max(...lines.map((l) => l.length)) + 8;
    const pad = (l) => "|" + l.padStart((w + l.length) >> 1).padEnd(w) + "|";
    return ["+" + "-".repeat(w) + "+", pad(""), ...lines.map(pad), pad(""), "+" + "-".repeat(w) + "+"].join("\n");
  };

  function reset() {
    player.x = start.x; player.y = start.y;
    player.z = floorUnder(player.x, player.y); player.vz = 0;
    player.yaw = -Math.PI / 2; player.pitch = 0;
    player.hp = CFG.hpMax; player.ammo = CFG.mag; player.reserve = 150;
    player.reloadT = 0; player.fireCd = 0; player.slideT = 0; player.lastHit = -99;
    Object.assign(game, {
      t: 0, wave: 0, score: 0, combo: 0, enemies: [], shots: [], popups: [],
      banner: null, queue: [], nextSpawn: 0, gap: 3.5, shake: 0, hitMark: 0,
    });
    startWave(1);
  }

  const panels = ["menu", "pause", "over"];
  const show = (id) => { for (const p of panels) el(p).hidden = p !== id; };

  function start_() {
    audio()?.resume?.();
    reset();
    game.mode = "play";
    show(null);
    grabMouse();
  }
  function pause() {
    if (game.mode !== "play") return;
    game.mode = "pause"; mouse.down = false; show("pause");
    if (document.pointerLockElement) document.exitPointerLock();
  }
  function resumeGame() { game.mode = "play"; show(null); grabMouse(); }
  function gameOver() {
    game.mode = "over"; mouse.down = false;
    el("finalScore").textContent = `SCORE ${String(game.score).padStart(6, "0")}  ·  WAVE ${String(game.wave).padStart(2, "0")}`;
    show("over");
    if (document.pointerLockElement) document.exitPointerLock();
  }

  // ------------------------------------------------------------------ init
  resize();
  el("logo").textContent = boxed(["A S C I I   ::   S U B N E T", "first-person ascii // wave defense"]);
  el("overLogo").textContent = boxed(["S Y S T E M   B R E A C H E D"]);
  el("start").addEventListener("click", start_);
  el("again").addEventListener("click", start_);
  el("resume").addEventListener("click", resumeGame);
  canvas.addEventListener("click", () => {
    if (game.mode === "pause") resumeGame();
    else if (game.mode === "play" && !document.pointerLockElement) grabMouse();
  });

  try {
    const saved = parseFloat(localStorage.getItem("subnet.sens"));
    if (saved > 0) AIM.mult = Math.min(2.5, Math.max(0.3, saved));
  } catch (_) {}
  for (const i of document.querySelectorAll(".sens")) {
    i.addEventListener("input", () => setSens(parseFloat(i.value), true));
  }
  setSens(AIM.mult, false);

  if (location.search.includes("debug")) {
    window.SUBNET = { CFG, P, PALETTE, game, player, MAP, height, spawn, startWave, TYPES, S };
  }

  player.z = floorUnder(player.x, player.y);
  player.eyeZ = player.z + CFG.eye;
  requestAnimationFrame(frame);
})();
