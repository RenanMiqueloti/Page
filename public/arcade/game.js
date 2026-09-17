/* ============================================================================
 * ASCII SUBNET — FPS em ASCII, canvas 2D, zero dependência.
 *
 * O renderer é um raycaster de heightmap: cada célula do mapa tem UMA altura
 * (o topo do bloco sólido). Isso dá escadas, plataformas e passarelas sem o
 * custo de um engine 3D — e continua sendo Wolfenstein o suficiente pra rodar
 * a 60fps desenhando texto.
 *
 * Pipeline por frame:
 *   1. física do player -> 2. IA dos inimigos -> 3. raycast do cenário
 *   -> 4. sprites (billboard com teste de profundidade) -> 5. HUD
 *   -> 6. flush: a grade de chars vira fillText por run de cor.
 * ========================================================================== */
(() => {
  "use strict";

  // ---------------------------------------------------------------- config
  const CFG = {
    cols: 160,             // largura alvo da grade (o resto deriva do canvas)
    charAspect: 1.78,      // altura/largura de uma célula monoespaçada
    fov: (74 * Math.PI) / 180,
    far: 32,               // alcance do raycaster, em células
    eye: 0.62,             // olho acima do pé
    eyeSlide: 0.30,
    radius: 0.24,
    stepUp: 0.42,          // degrau que sobe só andando
    gravity: 15,
    jumpV: 4.7,
    speedWalk: 3.3,
    speedSprint: 5.5,
    speedSlide: 7.8,
    slideTime: 0.45,
    sens: 0.0022,
    hpMax: 100,
    regenDelay: 2.5,       // segundos sem tomar dano antes de regenerar
    regenRate: 25,         // hp por segundo
    mag: 30,
    reload: 1.5,
    fireDelay: 0.095,
    dmg: 26,
    headMult: 2.8,
    headZone: 0.72,        // fração da altura do inimigo que conta como cabeça
    spread: 0.010,
    spreadMove: 0.030,
  };

  // ------------------------------------------------------------------ mapa
  // '#' parede (3.2)  '1'..'4' plataforma (nível * 0.38)  '.' chão
  // 'P' spawn do player   'e' spawn de inimigo
  // Passarela norte em nível 4, com duas escadas descendo pro pátio.
  const MAP_SRC = [
    "############################################",
    "#444444444444444444444444444444444444444444#",
    "#444444444444444444444444444444444444444444#",
    "#.....3333.................3333............#",
    "#.....2222.................2222............#",
    "#.....1111.................1111............#",
    "#..........................................#",
    "#..........................................#",
    "#.########.................########........#",
    "#.#......#.................#......#........#",
    "#.#..e............................#........#",
    "#.#......#....11111111.....#......#........#",
    "#.########....11222211.....########........#",
    "#.............12333321.....................#",
    "#.............12333321.....................#",
    "#.............11222211.....................#",
    "#.............11111111.....................#",
    "#..........................................#",
    "#..........................................#",
    "#.......#.....#.................#.....#....#",
    "#..........................................#",
    "#...........2222.......2222................#",
    "#...........2222.......2222................#",
    "#..........................................#",
    "#.....###############...############.......#",
    "#..........................................#",
    "#...e.................e.............e......#",
    "#..........................................#",
    "#.....................P....................#",
    "############################################",
  ];

  const CELL_H = { "#": 3.2, "1": 0.38, "2": 0.76, "3": 1.14, "4": 1.52 };

  const map = (() => {
    const w = MAP_SRC.reduce((m, r) => Math.max(m, r.length), 0);
    const h = MAP_SRC.length;
    const height = new Float32Array(w * h);
    const spawns = [];
    let start = { x: w / 2, y: h - 2 };

    for (let y = 0; y < h; y++) {
      const row = MAP_SRC[y].padEnd(w, ".");
      for (let x = 0; x < w; x++) {
        const c = row[x];
        // borda sempre fechada, independente do que foi desenhado
        const edge = x === 0 || y === 0 || x === w - 1 || y === h - 1;
        if (edge) { height[y * w + x] = CELL_H["#"]; continue; }
        if (c === "P") start = { x: x + 0.5, y: y + 0.5 };
        else if (c === "e") spawns.push({ x: x + 0.5, y: y + 0.5 });
        height[y * w + x] = CELL_H[c] ?? 0;
      }
    }
    return { w, h, height, spawns, start };
  })();

  /** Altura do topo sólido da célula que contém (x, y). Fora do mapa = parede. */
  function heightAt(x, y) {
    const cx = x | 0, cy = y | 0;
    if (cx < 0 || cy < 0 || cx >= map.w || cy >= map.h) return CELL_H["#"];
    return map.height[cy * map.w + cx];
  }

  // ----------------------------------------------------------------- tela
  const canvas = document.getElementById("screen");
  const ctx = canvas.getContext("2d", { alpha: false });

  const PALETTE = [
    "#0a2b20", // 0 verde quase apagado (longe)
    "#10503c",
    "#17785a",
    "#22a37a",
    "#34d399", // 4 verde base
    "#6ee7b7",
    "#d1fae5", // 6 quase branco (perto)
    "#7f1d1d", // 7 inimigo longe
    "#dc2626",
    "#f87171", // 9 inimigo perto
    "#b45309", // 10 boss
    "#fbbf24", // 11 boss claro
    "#ecfdf5", // 12 HUD / flash
    "#1e3a8a", // 13 projétil inimigo
  ];
  // Dois conjuntos de caracteres que nunca se cruzam: qualquer coisa "pesada"
  // na tela é superfície vertical, qualquer coisa "leve" é piso. É esse
  // contraste — não a cor — que faz o relevo ser lido em ASCII.
  const RAMP = "-=+*#%@";              // paredes / faces verticais
  const FLOOR_RAMP = " ....::::;;;";   // pisos e plataformas

  // Névoa em LUT: evita um Math.pow por caractere desenhado.
  const FOG = new Float32Array(257);
  for (let i = 0; i <= 256; i++) FOG[i] = Math.pow(1 - i / 256, 0.62);
  const fogAt = (d) => FOG[Math.min(256, ((d / CFG.far) * 256) | 0)];

  const S = { cols: 0, rows: 0, charW: 0, charH: 0, dpr: 1 };
  let chars, pal, depth;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    S.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * S.dpr));
    canvas.height = Math.max(1, Math.round(rect.height * S.dpr));

    S.cols = Math.max(60, Math.min(CFG.cols, Math.round(rect.width / 5)));
    S.charW = canvas.width / S.cols;
    S.charH = S.charW * CFG.charAspect;
    S.rows = Math.max(24, Math.floor(canvas.height / S.charH));

    chars = new Uint8Array(S.cols * S.rows);
    pal = new Uint8Array(S.cols * S.rows);
    depth = new Float32Array(S.cols * S.rows);

    // calibra o corpo da fonte pelo avanço real do glifo: sem isso a grade
    // desalinha em telas com dpr fracionário
    const FONT = "ui-monospace, Menlo, Consolas, monospace";
    ctx.font = `100px ${FONT}`;
    const adv = ctx.measureText("M").width || 60;
    ctx.font = `${(S.charW / adv) * 100}px ${FONT}`;
    ctx.textBaseline = "top";
  }
  window.addEventListener("resize", resize);

  const clearScreen = () => {
    chars.fill(32);
    pal.fill(0);
    depth.fill(Infinity);
  };

  /** Escreve um char na grade se ele estiver mais perto do que o que já está lá. */
  function put(col, row, code, p, d) {
    if (col < 0 || row < 0 || col >= S.cols || row >= S.rows) return;
    const i = row * S.cols + col;
    if (d >= depth[i]) return;
    chars[i] = code;
    pal[i] = p;
    depth[i] = d;
  }

  function text(col, row, str, p) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      put(col + i, row, code > 255 ? 63 /* ? */ : code, p, -1);
    }
  }

  /** Grade -> canvas. Um fillText por run de mesma cor; espaços não custam nada. */
  function flush() {
    ctx.fillStyle = "#050706";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const buf = [];
    for (let r = 0; r < S.rows; r++) {
      const base = r * S.cols;
      const y = r * S.charH;
      let runStart = -1, runPal = -1;

      for (let c = 0; c <= S.cols; c++) {
        const code = c < S.cols ? chars[base + c] : 32;
        const p = c < S.cols ? pal[base + c] : -1;
        const blank = code === 32;

        if (runStart >= 0 && (blank || p !== runPal)) {
          ctx.fillStyle = PALETTE[runPal];
          ctx.fillText(buf.join(""), runStart * S.charW, y);
          buf.length = 0;
          runStart = -1;
        }
        if (!blank) {
          if (runStart < 0) { runStart = c; runPal = p; }
          buf.push(String.fromCharCode(code));
        }
      }
    }
  }

  // ------------------------------------------------------------- raycaster
  // Heightmap: pra cada coluna da tela caminhamos pelas células (DDA) de perto
  // pra longe mantendo uma "janela" de linhas ainda não pintadas. Cada célula
  // pinta o topo dela (chão/plataforma) e, se subiu em relação à anterior, a
  // face vertical. Quando a janela fecha, a coluna acabou — o resto é céu.
  function renderWorld(cam) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const hProj = S.cols / 2 / tanF;
    const vProj = hProj / CFG.charAspect;
    const horizon = S.rows / 2 + cam.pitch;
    const eyeZ = cam.eyeZ;
    const rampMax = RAMP.length - 1;
    const floorMax = FLOOR_RAMP.length - 1;

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
      let t = 0;
      let side = 0;

      while (t < CFG.far && yBot >= 0) {
        if (sideX < sideY) { t = sideX; sideX += deltaX; mapX += stepX; side = 0; }
        else { t = sideY; sideY += deltaY; mapY += stepY; side = 1; }

        // --- topo da célula anterior, de prevT até t (só se o olho está acima)
        if (prevH < eyeZ - 0.001) {
          const dz = prevH - eyeZ;                       // negativo
          const yFar = horizon - (dz / t) * vProj;
          const yNear = prevT <= 0.001 ? S.rows : horizon - (dz / prevT) * vProj;
          let r0 = Math.max(0, Math.ceil(yFar));
          let r1 = Math.min(yBot, Math.floor(yNear));
          for (let r = r1; r >= r0; r--) {
            const dist = (dz * vProj) / (horizon - r);   // inverso da projeção
            if (dist <= 0 || dist > CFG.far) continue;
            const wx = cam.x + rayX * dist;
            const wy = cam.y + rayY * dist;
            const fx = wx - Math.floor(wx), fy = wy - Math.floor(wy);
            const grid = fx < 0.055 || fy < 0.055 || fx > 0.945 || fy > 0.945;
            const fog = fogAt(dist);
            const checker = ((Math.floor(wx) + Math.floor(wy)) & 1) ? 0.12 : 0;
            const lit = fog * 0.88 + checker;
            const code = grid && fog > 0.35
              ? 43 /* + */
              : FLOOR_RAMP.charCodeAt(Math.min(floorMax, (lit * floorMax) | 0));
            put(c, r, code, 1 + Math.min(3, (lit * 4) | 0), dist);
          }
          if (r0 <= yBot) yBot = Math.min(yBot, r0 - 1);
        }

        const nextH = heightAt(mapX + 0.5, mapY + 0.5);

        // --- face vertical quando a próxima célula é mais alta
        if (nextH > prevH + 0.001) {
          const yTop = horizon - ((nextH - eyeZ) / t) * vProj;
          const yBase = horizon - ((prevH - eyeZ) / t) * vProj;
          const r0 = Math.max(0, Math.ceil(yTop));
          const r1 = Math.min(yBot, Math.floor(yBase));
          const base = Math.min(1, fogAt(t) * (side ? 0.78 : 1.06));
          const span = Math.max(1, r1 - r0);
          for (let r = r1; r >= r0; r--) {
            // topo da face mais claro: dá silhueta a degraus empilhados
            const lit = Math.min(1, base * (0.74 + 0.32 * (1 - (r - r0) / span)));
            const code = RAMP.charCodeAt(Math.min(rampMax, Math.max(0, (lit * rampMax) | 0)));
            put(c, r, code, 2 + Math.min(4, (lit * 5) | 0), t);
          }
          if (r0 <= yBot) yBot = Math.min(yBot, r0 - 1);
        }

        prevH = nextH;
        prevT = t;
      }

      // --- céu: pontinhos esparsos ancorados no mundo, pra leitura de rotação
      if (yBot >= 0) {
        const ang = (Math.atan2(rayY, rayX) * 57.2958) | 0;
        for (let r = 0; r <= yBot; r++) {
          const hash = ((ang * 131) ^ (r * 7919)) & 1023;
          if (hash < 9) put(c, r, 46 /* . */, 1, CFG.far + 10);
        }
      }
    }
  }

  // ---------------------------------------------------------------- sprites
  // Arte em char, amostrada por vizinho mais próximo. Espaço = transparente.
  const ART = {
    worm: [
      "  .---.  ",
      " ( o o ) ",
      "  \\ ~ /  ",
      " /|===|\\ ",
      "  ^   ^  ",
    ],
    trojan: [
      "  _____  ",
      " |o   o| ",
      " |  ^  | ",
      " |_===_| ",
      " /|   |\\ ",
      "  L   J  ",
    ],
    ransom: [
      " #######  ",
      " #$   $#  ",
      " #  _  #  ",
      " ##[#]##  ",
      "  /| |\\   ",
      "  L   J   ",
    ],
    boss: [
      "   ///|\\\\\\   ",
      "  | O   O |  ",
      "  |  vvv  |  ",
      " /#########\\ ",
      " |#[=====]#| ",
      " \\###/ \\###/ ",
      "  //     \\\\  ",
    ],
  };

  function renderSprites(cam, list) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const hProj = S.cols / 2 / tanF;
    const vProj = hProj / CFG.charAspect;
    const horizon = S.rows / 2 + cam.pitch;
    const invDet = 1 / (planeX * dirY - dirX * planeY);

    const sorted = list
      .map((e) => ({ e, d: (e.x - cam.x) ** 2 + (e.y - cam.y) ** 2 }))
      .sort((a, b) => b.d - a.d);

    for (const { e } of sorted) {
      const relX = e.x - cam.x, relY = e.y - cam.y;
      const tx = invDet * (dirY * relX - dirX * relY);
      const ty = invDet * (-planeY * relX + planeX * relY); // profundidade
      if (ty <= 0.18) continue;

      const art = ART[e.art];
      const midCol = (S.cols / 2) * (1 + tx / ty);
      const rowBottom = horizon - ((e.z - cam.eyeZ) / ty) * vProj;
      const rowTop = horizon - ((e.z + e.h - cam.eyeZ) / ty) * vProj;
      const spanRows = rowBottom - rowTop;
      if (spanRows < 1) continue;
      const spanCols = (e.w / ty) * hProj;

      const c0 = Math.max(0, Math.ceil(midCol - spanCols / 2));
      const c1 = Math.min(S.cols - 1, Math.floor(midCol + spanCols / 2));
      const r0 = Math.max(0, Math.ceil(rowTop));
      const r1 = Math.min(S.rows - 1, Math.floor(rowBottom));
      const artW = art[0].length, artH = art.length;
      const flash = e.hitFlash > 0;

      for (let c = c0; c <= c1; c++) {
        const u = (((c - (midCol - spanCols / 2)) / spanCols) * artW) | 0;
        if (u < 0 || u >= artW) continue;
        for (let r = r0; r <= r1; r++) {
          const v = (((r - rowTop) / spanRows) * artH) | 0;
          if (v < 0 || v >= artH) continue;
          const ch = art[v].charCodeAt(u);
          if (!ch || ch === 32) continue;
          const near = Math.max(0, 1 - ty / CFG.far);
          let p = e.boss ? 10 + (near > 0.55 ? 1 : 0) : 7 + Math.min(2, (near * 3) | 0);
          if (flash) p = 12;
          put(c, r, ch, p, ty);
        }
      }
    }
  }

  // ----------------------------------------------------------------- player
  const player = {
    x: map.start.x, y: map.start.y, z: 0, vz: 0,
    yaw: -Math.PI / 2, pitch: 0,
    hp: CFG.hpMax, ammo: CFG.mag, reserve: 150,
    fireCd: 0, reloadT: 0, slideT: 0, grounded: true,
    lastHit: -99, bob: 0, kick: 0, eyeZ: 0,
  };

  const keys = Object.create(null);
  const game = {
    mode: "menu", t: 0, wave: 0, score: 0, combo: 0,
    enemies: [], shots: [], popups: [], banner: null, spawnQueue: [], nextSpawn: 0,
    shake: 0, muted: false, hitMark: 0,
  };

  const RADIUS_OFFS = [[0, 0], [-CFG.radius, -CFG.radius], [CFG.radius, -CFG.radius],
                       [-CFG.radius, CFG.radius], [CFG.radius, CFG.radius]];

  /** Maior altura sob o "corpo" (círculo aproximado por 5 amostras). */
  function floorUnder(x, y) {
    let h = 0;
    for (let i = 0; i < RADIUS_OFFS.length; i++) {
      const v = heightAt(x + RADIUS_OFFS[i][0], y + RADIUS_OFFS[i][1]);
      if (v > h) h = v;
    }
    return h;
  }

  /** Move um ator no eixo pedido respeitando degrau; devolve true se andou. */
  function slideAxis(a, nx, ny) {
    const limit = a.z + CFG.stepUp;
    const h = floorUnder(nx, ny);
    if (h > limit) return false;
    a.x = nx; a.y = ny;
    if (h > a.z && a.grounded) { a.z = h; a.vz = 0; }
    return true;
  }

  function applyGravity(a, dt) {
    const ground = floorUnder(a.x, a.y);
    a.vz -= CFG.gravity * dt;
    a.z += a.vz * dt;
    if (a.z <= ground) { a.z = ground; a.vz = 0; a.grounded = true; }
    else a.grounded = false;
  }

  function updatePlayer(dt) {
    // --- direção desejada em espaço do mundo
    const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
    const str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const dirX = Math.cos(player.yaw), dirY = Math.sin(player.yaw);
    let wx = dirX * fwd - dirY * str;
    let wy = dirY * fwd + dirX * str;
    const len = Math.hypot(wx, wy);
    if (len > 0) { wx /= len; wy /= len; }

    const sprinting = (keys.ShiftLeft || keys.ShiftRight) && fwd > 0 && player.slideT <= 0;
    const wantSlide = (keys.ControlLeft || keys.ControlRight || keys.KeyC) && sprinting && player.grounded;
    if (wantSlide && player.slideT <= 0 && len > 0) { player.slideT = CFG.slideTime; sfx("slide"); }
    if (player.slideT > 0) player.slideT -= dt;

    let speed = CFG.speedWalk;
    if (player.slideT > 0) speed = CFG.speedSlide * (0.55 + player.slideT / CFG.slideTime * 0.45);
    else if (sprinting) speed = CFG.speedSprint;
    if (!player.grounded) speed *= 0.92;

    if (len > 0) {
      slideAxis(player, player.x + wx * speed * dt, player.y);
      slideAxis(player, player.x, player.y + wy * speed * dt);
      player.bob += speed * dt * (player.slideT > 0 ? 0.4 : 1);
    }

    if (keys.Space && player.grounded && player.slideT <= 0) {
      player.vz = CFG.jumpV; player.grounded = false; sfx("jump");
    }
    applyGravity(player, dt);

    // --- olho: agacha no slide, balança ao andar, recua ao atirar
    const base = player.slideT > 0 ? CFG.eyeSlide : CFG.eye;
    const bobAmp = player.grounded && len > 0 ? Math.sin(player.bob * 9) * 0.022 : 0;
    player.eyeZ = player.z + base + bobAmp - player.kick * 0.05;
    player.kick = Math.max(0, player.kick - dt * 6);

    // --- regeneração no estilo arena: tudo ou nada depois de 2.5s limpo
    if (game.t - player.lastHit > CFG.regenDelay && player.hp < CFG.hpMax) {
      player.hp = Math.min(CFG.hpMax, player.hp + CFG.regenRate * dt);
    }

    // --- tiro e recarga
    player.fireCd -= dt;
    if (player.reloadT > 0) {
      player.reloadT -= dt;
      if (player.reloadT <= 0) {
        const need = Math.min(CFG.mag - player.ammo, player.reserve);
        player.ammo += need; player.reserve -= need;
      }
    } else if (mouse.down && player.fireCd <= 0) {
      if (player.ammo > 0) fire(len > 0);
      else startReload();
    }
    if (keys.KeyR) startReload();
  }

  function startReload() {
    if (player.reloadT > 0 || player.ammo >= CFG.mag || player.reserve <= 0) return;
    player.reloadT = CFG.reload;
    sfx("reload");
  }

  // ------------------------------------------------------------------ input
  const mouse = { down: false };

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "Tab"].includes(e.code)) e.preventDefault();
    if (e.code === "KeyP" && game.mode === "play") pause();
    if (e.code === "KeyM") { game.muted = !game.muted; }
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });
  window.addEventListener("blur", () => { for (const k in keys) keys[k] = false; mouse.down = false; });

  canvas.addEventListener("mousedown", (e) => { if (e.button === 0) mouse.down = true; });
  window.addEventListener("mouseup", (e) => { if (e.button === 0) mouse.down = false; });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement !== canvas) return;
    player.yaw += e.movementX * CFG.sens;
    player.pitch -= e.movementY * CFG.sens * 220;
    const lim = S.rows * 0.85;
    player.pitch = Math.max(-lim, Math.min(lim, player.pitch));
  });

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement !== canvas && game.mode === "play") pause();
  });

  function grabMouse() {
    const r = canvas.requestPointerLock?.();
    if (r && typeof r.catch === "function") r.catch(() => {});
  }

  // ---------------------------------------------------------------- combate
  ART.shot = ["*"];
  ART.gun = [
    "              ____   ",
    "        _____/    \\_ ",
    "   ____|  o         |",
    "  |_____  ____ _____|",
    "        \\|    |      ",
    "         |____|      ",
  ];

  const TYPES = {
    worm:   { art: "worm",   hp: 42,  speed: 2.9,  dmg: 9,  w: 0.75, h: 0.9,  range: 1.0, rate: 0.9, score: 10 },
    trojan: { art: "trojan", hp: 80,  speed: 1.95, dmg: 13, w: 0.85, h: 1.1,  range: 9.5, rate: 1.8, score: 20, ranged: true },
    ransom: { art: "ransom", hp: 165, speed: 1.4,  dmg: 22, w: 1.05, h: 1.2,  range: 1.3, rate: 1.4, score: 35 },
    boss:   { art: "boss",   hp: 900, speed: 1.65, dmg: 26, w: 2.0,  h: 2.2,  range: 13,  rate: 1.15, score: 250, ranged: true, boss: true },
  };
  const BOSS_NAMES = ["MELISSA", "STUXNET", "BLASTER", "CONFICKER", "SLAMMER"];

  /** Marcha um raio pelo heightmap. Devolve parede, inimigo ou null. */
  function hitscan(ox, oy, oz, yaw, slope, maxD, ignoreEnemies) {
    const dx = Math.cos(yaw), dy = Math.sin(yaw);
    for (let t = 0.3; t < maxD; t += 0.08) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + slope * t;
      if (z > 6 || heightAt(x, y) > z) return { type: "wall", x, y, z, t };
      if (!ignoreEnemies) {
        for (const e of game.enemies) {
          if (e.dead) continue;
          const ex = x - e.x, ey = y - e.y;
          const rr = e.w * 0.55;
          if (ex * ex + ey * ey < rr * rr && z >= e.z && z <= e.z + e.h) {
            return { type: "enemy", e, x, y, z, t };
          }
        }
      }
    }
    return null;
  }

  function lineOfSight(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const slope = (b.z - a.z) / Math.max(0.001, dist);
    const hit = hitscan(a.x, a.y, a.z, Math.atan2(dy, dx), slope, dist, true);
    return !hit;
  }

  function fire(moving) {
    player.ammo--;
    player.fireCd = CFG.fireDelay;
    player.kick = 1;
    game.shake = Math.max(game.shake, 0.6);
    sfx("shot");

    const vProj = S.cols / 2 / Math.tan(CFG.fov / 2) / CFG.charAspect;
    const spread = (moving ? CFG.spreadMove : CFG.spread) * (player.grounded ? 1 : 1.9);
    const yaw = player.yaw + (Math.random() - 0.5) * spread * 6;
    const slope = player.pitch / vProj + (Math.random() - 0.5) * spread * 6;

    const hit = hitscan(player.x, player.y, player.eyeZ, yaw, slope, CFG.far);
    if (!hit) return;
    if (hit.type === "wall") {
      game.popups.push({ x: hit.x, y: hit.y, z: hit.z, txt: ".", life: 0.12, pal: 6 });
      return;
    }

    const e = hit.e;
    const head = hit.z >= e.z + e.h * CFG.headZone;
    const dmg = CFG.dmg * (head ? CFG.headMult : 1);
    e.hp -= dmg;
    e.hitFlash = 0.07;
    game.hitMark = 0.12;
    sfx(head ? "head" : "hit");

    if (head) {
      game.score += 50;
      game.popups.push({ x: e.x, y: e.y, z: e.z + e.h + 0.35, txt: "HEADSHOT +50", life: 1.1, pal: 12 });
    }
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    e.dead = true;
    game.combo++;
    const pts = e.def.score + Math.min(50, game.combo * 2);
    game.score += pts;
    player.reserve = Math.min(180, player.reserve + (e.def.boss ? 60 : 10));
    game.popups.push({ x: e.x, y: e.y, z: e.z + e.h * 0.6, txt: `+${pts}`, life: 0.9, pal: 5 });
    sfx(e.def.boss ? "boss" : "kill");
    if (e.def.boss) game.banner = { txt: `${e.name} PURGED`, life: 3 };
  }

  function hurtPlayer(amount) {
    player.hp -= amount;
    player.lastHit = game.t;
    game.combo = 0;
    game.shake = Math.max(game.shake, 1.4);
    sfx("hurt");
    if (player.hp <= 0) { player.hp = 0; gameOver(); }
  }

  // ------------------------------------------------------------- inimigos
  // Campo de fluxo: BFS a partir da célula do player. Cada inimigo só olha os
  // 8 vizinhos e desce o gradiente — navegação de nível inteiro por ~1300
  // células de custo, recalculada 4x por segundo.
  const flow = new Int32Array(map.w * map.h);
  const flowQueue = new Int32Array(map.w * map.h);
  const NEIGH = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  let flowT = 0;

  function rebuildFlow() {
    flow.fill(-1);
    const sx = player.x | 0, sy = player.y | 0;
    if (sx < 0 || sy < 0 || sx >= map.w || sy >= map.h) return;
    const start = sy * map.w + sx;
    if (map.height[start] >= 2) return;
    flow[start] = 0;
    flowQueue[0] = start;
    let head = 0, tail = 1;
    while (head < tail) {
      const cur = flowQueue[head++];
      const cx = cur % map.w, cy = (cur / map.w) | 0;
      const hc = map.height[cur], d = flow[cur];
      for (let k = 0; k < 4; k++) {
        const nx = cx + NEIGH[k][0], ny = cy + NEIGH[k][1];
        if (nx < 1 || ny < 1 || nx >= map.w - 1 || ny >= map.h - 1) continue;
        const ni = ny * map.w + nx;
        if (flow[ni] !== -1) continue;
        const hn = map.height[ni];
        if (hn >= 2) continue;                    // parede
        if (hc - hn > CFG.stepUp) continue;       // degrau alto demais de lá pra cá
        flow[ni] = d + 1;
        flowQueue[tail++] = ni;
      }
    }
  }

  /** Centro da célula vizinha mais próxima do player, ou null se sem rota. */
  function flowStep(e) {
    const cx = e.x | 0, cy = e.y | 0;
    if (cx < 0 || cy < 0 || cx >= map.w || cy >= map.h) return null;
    let best = flow[cy * map.w + cx];
    if (best < 0) best = Infinity;
    let bx = -1, by = -1;
    for (let k = 0; k < NEIGH.length; k++) {
      const nx = cx + NEIGH[k][0], ny = cy + NEIGH[k][1];
      if (nx < 0 || ny < 0 || nx >= map.w || ny >= map.h) continue;
      const v = flow[ny * map.w + nx];
      if (v < 0 || v >= best) continue;
      // diagonal só vale se os dois ortogonais também forem passáveis
      if (NEIGH[k][0] && NEIGH[k][1]) {
        if (flow[cy * map.w + nx] < 0 || flow[ny * map.w + cx] < 0) continue;
      }
      best = v; bx = nx; by = ny;
    }
    return bx < 0 ? null : { x: bx + 0.5, y: by + 0.5 };
  }

  function spawnEnemy(kind) {
    const def = TYPES[kind];
    // nasce no ponto de spawn mais longe do player, pra não brotar na cara
    let best = map.spawns[0], bestD = -1;
    for (const s of map.spawns) {
      const d = (s.x - player.x) ** 2 + (s.y - player.y) ** 2;
      const jitter = d * (0.7 + Math.random() * 0.6);
      if (jitter > bestD) { bestD = jitter; best = s; }
    }
    const hpScale = 1 + (game.wave - 1) * 0.12;
    game.enemies.push({
      x: best.x, y: best.y, z: floorUnder(best.x, best.y), vz: 0, grounded: true,
      def, art: def.art, w: def.w, h: def.h, boss: !!def.boss,
      hp: def.hp * hpScale, maxHp: def.hp * hpScale, cd: 0.6, hitFlash: 0, dead: false,
      name: def.boss ? BOSS_NAMES[(game.wave / 3 - 1) % BOSS_NAMES.length | 0] : kind.toUpperCase(),
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

      // aproxima até a distância de ataque; ranged mantém distância
      const want = e.def.ranged ? Math.min(e.def.range * 0.6, 6) : e.def.range * 0.8;
      let mv = 0;
      if (dist > want) mv = 1;
      else if (e.def.ranged && dist < want * 0.5) mv = -0.6;

      if (mv !== 0) {
        // perto e com visão limpa vai direto; senão segue o campo de fluxo —
        // é o que faz o bicho achar a porta e subir a escada em vez de ficar
        // empurrando parede pra sempre.
        let tx = dx / dist, ty = dy / dist;
        if (mv > 0 && !(sees && dist < 4.5)) {
          const step = flowStep(e);
          if (step) {
            const l = Math.hypot(step.x - e.x, step.y - e.y) || 1;
            tx = (step.x - e.x) / l; ty = (step.y - e.y) / l;
          }
        }
        const sp = e.def.speed * mv * dt;
        const okX = slideAxis(e, e.x + tx * sp, e.y);
        const okY = slideAxis(e, e.x, e.y + ty * sp);
        if (!okX && !okY) {
          // encostou numa quina: tenta contornar pelos lados
          const px = -ty, py = tx;
          if (!slideAxis(e, e.x + px * sp, e.y + py * sp)) {
            slideAxis(e, e.x - px * sp, e.y - py * sp);
          }
        }
      }
      applyGravity(e, dt);

      if (e.cd <= 0 && sees && dist <= e.def.range) {
        e.cd = e.def.rate;
        if (e.def.ranged) {
          const tz = player.eyeZ - (e.z + e.h * 0.6);
          const n = e.boss ? 3 : 1;
          for (let i = 0; i < n; i++) {
            const ang = Math.atan2(dy, dx) + (i - (n - 1) / 2) * 0.09;
            game.shots.push({
              x: e.x, y: e.y, z: e.z + e.h * 0.6, art: "shot", w: 0.3, h: 0.3,
              vx: Math.cos(ang) * 9, vy: Math.sin(ang) * 9, vz: (tz / dist) * 9,
              dmg: e.def.dmg, life: 3, hitFlash: 0, boss: e.boss,
            });
          }
          sfx("enemyShot");
        } else if (dist <= e.def.range) {
          hurtPlayer(e.def.dmg);
        }
      }

      // boss chama reforço
      if (e.boss && (e.bossTick = (e.bossTick ?? 6) - dt) <= 0) {
        e.bossTick = 7;
        spawnEnemy("worm"); spawnEnemy("worm");
      }
    }
    game.enemies = game.enemies.filter((e) => !e.dead);
  }

  function updateShots(dt) {
    for (const s of game.shots) {
      s.life -= dt;
      s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
      if (heightAt(s.x, s.y) > s.z || s.z < 0) s.life = 0;
      const dx = s.x - player.x, dy = s.y - player.y;
      if (dx * dx + dy * dy < 0.2 && Math.abs(s.z - (player.z + 0.5)) < 0.75) {
        hurtPlayer(s.dmg); s.life = 0;
      }
    }
    game.shots = game.shots.filter((s) => s.life > 0);
  }

  // ----------------------------------------------------------------- ondas
  function startWave(n) {
    game.wave = n;
    const q = [];
    const count = Math.min(26, 4 + n * 2);
    for (let i = 0; i < count; i++) {
      let t = "worm";
      if (n >= 2 && i % 3 === 1) t = "trojan";
      if (n >= 4 && i % 5 === 4) t = "ransom";
      q.push(t);
    }
    const boss = n % 3 === 0;
    if (boss) q.unshift("boss");
    game.spawnQueue = q;
    game.nextSpawn = 0.8;
    game.banner = {
      txt: boss ? `WAVE ${n} :: ${BOSS_NAMES[(n / 3 - 1) % BOSS_NAMES.length | 0]} INBOUND` : `WAVE ${n}`,
      life: 2.6,
    };
    sfx("wave");
  }

  function updateWaves(dt) {
    if (game.spawnQueue.length) {
      game.nextSpawn -= dt;
      if (game.nextSpawn <= 0) {
        spawnEnemy(game.spawnQueue.shift());
        game.nextSpawn = Math.max(0.35, 1.5 - game.wave * 0.06);
      }
    } else if (!game.enemies.length) {
      game.waveGap = (game.waveGap ?? 3.5) - dt;
      if (game.waveGap <= 0) { game.waveGap = 3.5; startWave(game.wave + 1); }
    }
  }

  // ------------------------------------------------------------------ áudio
  // Síntese na unha: um oscilador + envelope por efeito, nenhum asset.
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
    o.type = type; o.frequency.setValueAtTime(f0, a.currentTime);
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
      case "shot":      burst(0.09, 0.22, 2400); tone(220, 70, 0.09, "square", 0.07); break;
      case "hit":       tone(520, 380, 0.05, "square", 0.06); break;
      case "head":      tone(1250, 620, 0.12, "sawtooth", 0.1); break;
      case "kill":      tone(180, 60, 0.22, "triangle", 0.12); break;
      case "boss":      tone(90, 38, 0.9, "sawtooth", 0.2); break;
      case "hurt":      tone(140, 55, 0.24, "sawtooth", 0.14); break;
      case "reload":    tone(300, 460, 0.07, "square", 0.07); setTimeout(() => tone(460, 300, 0.07, "square", 0.07), 320); break;
      case "jump":      tone(420, 620, 0.07, "sine", 0.05); break;
      case "slide":     burst(0.28, 0.1, 900); break;
      case "wave":      tone(320, 640, 0.3, "square", 0.1); break;
      case "enemyShot": tone(180, 120, 0.1, "sawtooth", 0.05); break;
    }
  }

  // -------------------------------------------------------------- HUD / UI
  function project(cam, x, y, z) {
    const tanF = Math.tan(CFG.fov / 2);
    const dirX = Math.cos(cam.yaw), dirY = Math.sin(cam.yaw);
    const planeX = -dirY * tanF, planeY = dirX * tanF;
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    const relX = x - cam.x, relY = y - cam.y;
    const ty = invDet * (-planeY * relX + planeX * relY);
    if (ty <= 0.25) return null;
    const tx = invDet * (dirY * relX - dirX * relY);
    const hProj = S.cols / 2 / tanF;
    return {
      col: (S.cols / 2) * (1 + tx / ty),
      row: S.rows / 2 + cam.pitch - ((z - cam.eyeZ) / ty) * (hProj / CFG.charAspect),
      d: ty,
    };
  }

  function renderPopups(cam) {
    for (const p of game.popups) {
      const s = project(cam, p.x, p.y, p.z);
      if (!s) continue;
      text(Math.round(s.col - p.txt.length / 2), Math.round(s.row), p.txt, p.pal);
    }
  }

  function updatePopups(dt) {
    for (const p of game.popups) { p.life -= dt; p.z += dt * 0.7; }
    game.popups = game.popups.filter((p) => p.life > 0);
  }

  function renderGun() {
    const art = ART.gun;
    const kick = Math.round(player.kick * 2.2);
    const sway = Math.round(Math.sin(player.bob * 9) * 1.3);
    const c0 = Math.floor(S.cols * 0.52) + sway;
    const r0 = S.rows - art.length - 3 + kick + (player.slideT > 0 ? 2 : 0);
    for (let v = 0; v < art.length; v++) {
      for (let u = 0; u < art[v].length; u++) {
        const ch = art[v].charCodeAt(u);
        if (!ch || ch === 32) continue;
        put(c0 + u, r0 + v, ch, player.reloadT > 0 ? 2 : 4, -1);
      }
    }
    if (player.kick > 0.6) {
      text(c0 + 17, r0 - 1, "\\|/", 12);
      text(c0 + 17, r0, "-*-", 12);
    }
  }

  /** Apaga um trecho da linha pra o texto do HUD não brigar com o cenário.
   *  Profundidade 0: barra o mundo (sempre > 0) mas ainda deixa o texto do
   *  HUD (que escreve com -1) passar por cima. */
  function clearSpan(col, row, len) {
    for (let i = 0; i < len; i++) put(col + i, row, 32, 0, 0);
  }

  function bar(val, max, len) {
    const n = Math.max(0, Math.min(len, Math.round((val / max) * len)));
    return "[" + "|".repeat(n) + ".".repeat(len - n) + "]";
  }

  function renderHUD(cam) {
    const cx = S.cols >> 1, cy = S.rows >> 1;

    // bússola: ajuda a não se perder girando 360°
    const tanF = Math.tan(CFG.fov / 2);
    for (const [ang, label] of [[0, "E"], [Math.PI / 2, "S"], [Math.PI, "W"], [-Math.PI / 2, "N"]]) {
      let d = ang - player.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      if (Math.abs(d) > CFG.fov / 2) continue;
      text(Math.round(cx + (Math.tan(d) / tanF) * cx) , 1, label, 3);
    }

    // mira, com abertura reagindo ao movimento
    const open = player.slideT > 0 ? 4 : 2;
    text(cx - open - 1, cy, "-", 12); text(cx + open + 1, cy, "-", 12);
    put(cx, cy - 1, 124, 12, -1); put(cx, cy + 1, 124, 12, -1);
    if (game.hitMark > 0) {
      text(cx - 1, cy - 1, "\\", 9); text(cx + 1, cy - 1, "/", 9);
      text(cx - 1, cy + 1, "/", 9); text(cx + 1, cy + 1, "\\", 9);
    }

    // barra inferior
    const hp = Math.round(player.hp);
    const left = `HP ${bar(hp, CFG.hpMax, 18)} ${String(hp).padStart(3)}`;
    clearSpan(0, S.rows - 2, S.cols);
    text(2, S.rows - 2, left, hp < 35 ? 9 : 4);

    const reloading = player.reloadT > 0;
    const right = reloading
      ? `RELOADING ${bar(CFG.reload - player.reloadT, CFG.reload, 8)}   WAVE ${game.wave}   SCORE ${game.score}`
      : `AMMO ${String(player.ammo).padStart(2)}/${player.reserve}   WAVE ${game.wave}   SCORE ${game.score}`;
    text(S.cols - right.length - 2, S.rows - 2, right, reloading ? 11 : 4);

    const alive = game.enemies.length + game.spawnQueue.length;
    clearSpan(0, 1, 16);
    text(2, 1, `THREATS ${String(alive).padStart(2)}`, alive > 0 ? 3 : 2);
    if (game.combo > 2) text(2, 2, `COMBO x${game.combo}`, 5);

    // banner de onda
    if (game.banner) {
      const b = game.banner.txt;
      clearSpan(cx - (b.length >> 1) - 2, 4, b.length + 4);
      text(cx - (b.length >> 1), 4, b, 12);
    }

    // vinheta de dano: as bordas piscam vermelho logo depois de levar hit
    const since = game.t - player.lastHit;
    if (since < 0.45) {
      const p = since < 0.2 ? 9 : 8;
      for (let c = 0; c < S.cols; c += 2) { put(c, 0, 61, p, -1); put(c, S.rows - 1, 61, p, -1); }
      for (let r = 0; r < S.rows; r += 2) { put(0, r, 124, p, -1); put(S.cols - 1, r, 124, p, -1); }
    }
  }

  // ------------------------------------------------------------------ loop
  function draw(dt) {
    clearScreen();
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
    renderHUD(cam);
    flush();
    game.shake = Math.max(0, game.shake - dt * 4);
    game.hitMark = Math.max(0, game.hitMark - dt);
  }

  let last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (ts - last) / 1000 : 0.016);
    last = ts;

    if (game.mode === "play") {
      game.t += dt;
      updatePlayer(dt);
      updateEnemies(dt);
      updateShots(dt);
      updateWaves(dt);
      updatePopups(dt);
      if (game.banner && (game.banner.life -= dt) <= 0) game.banner = null;
    }
    draw(dt);
  }

  // -------------------------------------------------------------- estados
  const el = (id) => document.getElementById(id);
  const boxed = (lines) => {
    const w = Math.max(...lines.map((l) => l.length)) + 8;
    const pad = (l) => "|" + l.padStart((w + l.length) >> 1).padEnd(w) + "|";
    return ["+" + "-".repeat(w) + "+", pad(""), ...lines.map(pad), pad(""), "+" + "-".repeat(w) + "+"].join("\n");
  };

  function resetGame() {
    player.x = map.start.x; player.y = map.start.y;
    player.z = floorUnder(player.x, player.y); player.vz = 0;
    player.yaw = -Math.PI / 2; player.pitch = 0;
    player.hp = CFG.hpMax; player.ammo = CFG.mag; player.reserve = 150;
    player.reloadT = 0; player.fireCd = 0; player.slideT = 0; player.lastHit = -99;
    Object.assign(game, {
      t: 0, wave: 0, score: 0, combo: 0, enemies: [], shots: [], popups: [],
      banner: null, spawnQueue: [], nextSpawn: 0, waveGap: 3.5, shake: 0, hitMark: 0,
    });
    startWave(1);
  }

  function show(id) { for (const p of ["menu", "pause", "over"]) el(p).hidden = p !== id; }
  function hidePanels() { show(null); }

  function start() {
    audio()?.resume?.();
    resetGame();
    game.mode = "play";
    hidePanels();
    grabMouse();
  }
  function pause() {
    if (game.mode !== "play") return;
    game.mode = "pause";
    mouse.down = false;
    show("pause");
    if (document.pointerLockElement) document.exitPointerLock();
  }
  function resumeGame() {
    game.mode = "play";
    hidePanels();
    grabMouse();
  }
  function gameOver() {
    game.mode = "over";
    mouse.down = false;
    el("finalScore").textContent = `SCORE ${game.score}  ·  WAVE ${game.wave}`;
    show("over");
    if (document.pointerLockElement) document.exitPointerLock();
  }

  // ------------------------------------------------------------------ init
  resize();
  el("logo").textContent = boxed(["A S C I I   ::   S U B N E T", "first-person ascii // wave defense"]);
  el("overLogo").textContent = boxed(["S Y S T E M   B R E A C H E D"]);
  el("start").addEventListener("click", start);
  el("again").addEventListener("click", start);
  el("resume").addEventListener("click", resumeGame);
  canvas.addEventListener("click", () => {
    if (game.mode === "pause") resumeGame();
    // se o pointer lock caiu sem disparar pause (aba, permissão), recaptura
    else if (game.mode === "play" && !document.pointerLockElement) grabMouse();
  });

  // ?debug=1 abre o estado no console: window.SUBNET.spawnEnemy("boss") etc.
  if (location.search.includes("debug")) {
    window.SUBNET = { CFG, game, player, map, spawnEnemy, startWave, TYPES };
  }

  // câmera parada no menu, só pra tela de fundo não ficar preta
  player.z = floorUnder(player.x, player.y);
  player.eyeZ = player.z + CFG.eye;
  requestAnimationFrame(frame);
})();
