import { LEVELS } from "./levels.js";

(() => {
  const sequence = ["ArrowUp", "ArrowUp", "ArrowUp", "ArrowDown"];
  const rankStorageKey = "pixel_platformer_rank";

  const TILE = 32;
  const FIXED_DT = 1 / 60;

  const MOVE_ACCEL = 2200;
  const AIR_ACCEL = 1300;
  const MAX_SPEED = 250;
  const GROUND_FRICTION = 2100;
  const GRAVITY = 1900;
  const MAX_FALL = 980;
  const JUMP_VELOCITY = -620;
  const COYOTE_TIME = 0.12;
  const JUMP_BUFFER = 0.14;
  const LANDING_TIME = 0.12;
  const DEATH_ANIM_BUFFER = 0.12;
  const MAX_LIVES = 5;
  const PLAYER_RENDER_TOP_TRIM = 2;
  const WATER_SPLASH_COOLDOWN = 0.14;

  const defaultPlayerSpriteConfig = {
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: { row: 0, from: 0, to: 4, fps: 6, loop: true },
      walk: { row: 1, from: 0, to: 4, fps: 10, loop: true },
      run: { row: 2, from: 0, to: 4, fps: 14, loop: true },
      jump: { row: 3, from: 0, to: 4, fps: 8, loop: false },
      crouch: { row: 4, from: 0, to: 4, fps: 6, loop: true },
      landing: { row: 5, from: 0, to: 1, fps: 10, loop: false },
    },
  };

  const overlay = document.createElement("div");
  overlay.className = "pixel-platformer-overlay";
  overlay.innerHTML = `
    <div class="pixel-platformer-panel">
      <div class="pixel-platformer-header">
        <strong class="pixel-platformer-title">Pixel Rush</strong>
        <div class="pixel-platformer-stats">
          <span>Fase: <strong data-level>1</strong>/2</span>
          <span>Vidas: <strong data-lives></strong></span>
          <span class="pixel-platformer-key-chip" data-key-chip><span class="pixel-platformer-key-icon" aria-hidden="true"></span>Chaves: <strong data-keys>0</strong></span>
          <span>Moedas: <strong data-coins>0</strong></span>
          <span>Pontos: <strong data-score>0</strong></span>
          <span>Tempo: <strong data-time>0:00</strong></span>
        </div>
        <button type="button" class="pixel-platformer-close" aria-label="Fechar">Fechar</button>
      </div>
      <canvas class="pixel-platformer-canvas" width="960" height="540" aria-label="Jogo de plataforma em pixel art"></canvas>
      <div class="pixel-platformer-hint">Setas ou A/D para andar. Espaco, W ou Cima para pular. Q interage (bau/porta). P pausa. Esc fecha.</div>
      <div class="pixel-platformer-status" data-status>
        <div class="pixel-platformer-status-title" data-status-title></div>
        <div class="pixel-platformer-status-sub" data-status-sub></div>
        <button type="button" data-status-action></button>
        <div class="pixel-platformer-rank" data-rank-wrap>
          <strong>Ranking local</strong>
          <ol data-rank-list></ol>
        </div>
      </div>
    </div>
  `;

  const canvas = () => overlay.querySelector(".pixel-platformer-canvas");
  const closeBtn = () => overlay.querySelector(".pixel-platformer-close");
  const levelEl = () => overlay.querySelector("[data-level]");
  const livesEl = () => overlay.querySelector("[data-lives]");
  const coinsEl = () => overlay.querySelector("[data-coins]");
  const keysEl = () => overlay.querySelector("[data-keys]");
  const keyChipEl = () => overlay.querySelector("[data-key-chip]");
  const scoreEl = () => overlay.querySelector("[data-score]");
  const timeEl = () => overlay.querySelector("[data-time]");
  const statusEl = () => overlay.querySelector("[data-status]");
  const statusTitleEl = () => overlay.querySelector("[data-status-title]");
  const statusSubEl = () => overlay.querySelector("[data-status-sub]");
  const statusActionEl = () => overlay.querySelector("[data-status-action]");
  const rankWrapEl = () => overlay.querySelector("[data-rank-wrap]");
  const rankListEl = () => overlay.querySelector("[data-rank-list]");

  let active = false;
  let sequenceIndex = 0;
  let loopId = null;
  let lastTime = 0;
  let acc = 0;
  let actionType = "";
  const keys = new Set();
  let spriteLoadStarted = false;

  const playerSprite = {
    image: new Image(),
    loaded: false,
    config: defaultPlayerSpriteConfig,
  };

  const enemySprite = {
    image: new Image(),
    loaded: false,
    frameWidth: 32,
    frameHeight: 25,
    animations: {
      move: { row: 0, from: 0, to: 7, fps: 7, loop: true },
      attack: { row: 1, from: 0, to: 7, fps: 8, loop: true },
      death: { row: 2, from: 0, to: 4, fps: 9, loop: false },
    },
  };

  const tileSprites = {
    wall: new Image(),
    floor: new Image(),
    loadedWall: false,
    loadedFloor: false,
    floorA: {
      "1": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/top_left.png", loaded: false },
      "2": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/top_center.png", loaded: false },
      "3": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/top_right.png", loaded: false },
      "4": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/mid_left.png", loaded: false },
      "5": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/mid_center.png", loaded: false },
      "6": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/mid_right.png", loaded: false },
      "7": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/bottom_left.png", loaded: false },
      "8": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/bottom_center.png", loaded: false },
      "9": { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_a/bottom_right.png", loaded: false },
    },
    wallA: {
      a: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/top_left.png", loaded: false },
      b: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/top_center.png", loaded: false },
      c: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/top_right.png", loaded: false },
      d: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/mid_left.png", loaded: false },
      e: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/mid_center_a.png", loaded: false },
      f: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/mid_center_b.png", loaded: false },
      g: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/mid_right.png", loaded: false },
      h: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/bottom_left.png", loaded: false },
      i: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/bottom_center.png", loaded: false },
      j: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_a/bottom_right.png", loaded: false },
    },
    bridges: {
      up: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/bridge_a/up.png", loaded: false },
      mid: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/bridge_a/mid.png", loaded: false },
      down: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/bridge_a/down.png", loaded: false },
    },
    waterA: {
      left: [
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/left_0.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/left_1.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/left_2.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/left_3.png", loaded: false },
      ],
      mid: [
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/mid_0.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/mid_1.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/mid_2.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/mid_3.png", loaded: false },
      ],
      right: [
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/right_0.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/right_1.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/right_2.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/water_a/right_3.png", loaded: false },
      ],
    },
    hazards: {
      spike: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/hazards/spike.png", loaded: false },
      lava: [
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/hazards/lava_0.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/hazards/lava_1.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/hazards/lava_2.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/tiles/hazards/lava_3.png", loaded: false },
      ],
    },
    collectibles: {
      key: { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/ui/key.png", loaded: false },
      coin: [
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_0.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_1.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_2.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_3.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_4.png", loaded: false },
        { image: new Image(), src: "assets/js/easter-eggs/pixel-platformer/images/items/coin/coin_5.png", loaded: false },
      ],
    },
  };

  const game = {
    mode: "idle",
    started: false,
    levelIndex: 0,
    lives: MAX_LIVES,
    score: 0,
    totalTime: 0,
    levelTime: 0,
    coins: 0,
    world: null,
    player: null,
    cameraX: 0,
    cameraY: 0,
    effects: [],
    waterSplashes: [],
    deathReason: "",
    finalDeath: false,
  };

  const openGame = () => {
    if (active) return;
    if (!spriteLoadStarted) loadPlayerSprite();
    loadEnemySprite();
    loadTileSprites();
    active = true;
    document.body.appendChild(overlay);
    document.body.dataset.arcade = "pixel-platformer";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    startRun();
    lastTime = performance.now();
    acc = 0;
    loopId = requestAnimationFrame(loop);
  };

  const loadPlayerSprite = async () => {
    spriteLoadStarted = true;
    playerSprite.image.src = "assets/js/easter-eggs/pixel-platformer/images/player/player_sheet.png";
    playerSprite.image.onload = () => {
      playerSprite.loaded = true;
    };
    playerSprite.image.onerror = () => {
      playerSprite.loaded = false;
    };

    try {
      const response = await fetch("assets/js/easter-eggs/pixel-platformer/images/player/player_sheet.json");
      if (!response.ok) return;
      const json = await response.json();
      if (
        typeof json.frameWidth === "number" &&
        typeof json.frameHeight === "number" &&
        json.animations &&
        typeof json.animations === "object"
      ) {
        playerSprite.config = json;
      }
    } catch {
      playerSprite.config = defaultPlayerSpriteConfig;
    }
  };

  const loadEnemySprite = () => {
    if (enemySprite.image.src) return;
    enemySprite.image.src = "assets/js/easter-eggs/pixel-platformer/images/enemies/slime-Sheet.png";
    enemySprite.image.onload = () => {
      enemySprite.loaded = true;
    };
    enemySprite.image.onerror = () => {
      enemySprite.loaded = false;
    };
  };

  const loadTileSprites = () => {
    if (!tileSprites.wall.src) {
      tileSprites.wall.src = "assets/js/easter-eggs/pixel-platformer/images/tiles/wall_tile.png";
      tileSprites.wall.onload = () => {
        tileSprites.loadedWall = true;
      };
      tileSprites.wall.onerror = () => {
        tileSprites.loadedWall = false;
      };
    }
    if (!tileSprites.floor.src) {
      tileSprites.floor.src = "assets/js/easter-eggs/pixel-platformer/images/tiles/floor_tile.png";
      tileSprites.floor.onload = () => {
        tileSprites.loadedFloor = true;
      };
      tileSprites.floor.onerror = () => {
        tileSprites.loadedFloor = false;
      };
    }
    Object.values(tileSprites.floorA).forEach(sprite => {
      if (sprite.image.src) return;
      sprite.image.src = sprite.src;
      sprite.image.onload = () => {
        sprite.loaded = true;
      };
      sprite.image.onerror = () => {
        sprite.loaded = false;
      };
    });
    Object.values(tileSprites.wallA).forEach(sprite => {
      if (sprite.image.src) return;
      sprite.image.src = sprite.src;
      sprite.image.onload = () => {
        sprite.loaded = true;
      };
      sprite.image.onerror = () => {
        sprite.loaded = false;
      };
    });
    Object.values(tileSprites.bridges).forEach(sprite => {
      if (sprite.image.src) return;
      sprite.image.src = sprite.src;
      sprite.image.onload = () => {
        sprite.loaded = true;
      };
      sprite.image.onerror = () => {
        sprite.loaded = false;
      };
    });

    Object.values(tileSprites.waterA).forEach(frames => {
      frames.forEach(sprite => {
        if (sprite.image.src) return;
        sprite.image.src = sprite.src;
        sprite.image.onload = () => {
          sprite.loaded = true;
        };
        sprite.image.onerror = () => {
          sprite.loaded = false;
        };
      });
    });

    if (!tileSprites.hazards.spike.image.src) {
      tileSprites.hazards.spike.image.src = tileSprites.hazards.spike.src;
      tileSprites.hazards.spike.image.onload = () => {
        tileSprites.hazards.spike.loaded = true;
      };
      tileSprites.hazards.spike.image.onerror = () => {
        tileSprites.hazards.spike.loaded = false;
      };
    }
    tileSprites.hazards.lava.forEach(sprite => {
      if (sprite.image.src) return;
      sprite.image.src = sprite.src;
      sprite.image.onload = () => {
        sprite.loaded = true;
      };
      sprite.image.onerror = () => {
        sprite.loaded = false;
      };
    });

    if (!tileSprites.collectibles.key.image.src) {
      tileSprites.collectibles.key.image.src = tileSprites.collectibles.key.src;
      tileSprites.collectibles.key.image.onload = () => {
        tileSprites.collectibles.key.loaded = true;
      };
      tileSprites.collectibles.key.image.onerror = () => {
        tileSprites.collectibles.key.loaded = false;
      };
    }
    tileSprites.collectibles.coin.forEach(sprite => {
      if (sprite.image.src) return;
      sprite.image.src = sprite.src;
      sprite.image.onload = () => {
        sprite.loaded = true;
      };
      sprite.image.onerror = () => {
        sprite.loaded = false;
      };
    });
  };

  const closeGame = () => {
    active = false;
    overlay.classList.remove("is-open");
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      document.body.style.overflow = "";
      delete document.body.dataset.arcade;
      stopLoop();
      clearInputs();
    }, 220);
  };

  const stopLoop = () => {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
  };

  const startRun = () => {
    game.levelIndex = 0;
    game.lives = MAX_LIVES;
    game.score = 0;
    game.totalTime = 0;
    game.coins = 0;
    loadLevel(0);
    showStatus({
      title: "Pixel Rush",
      sub: "Fase 1 pronta. Pressione esquerda, direita ou pulo para iniciar.",
      actionLabel: "Iniciar",
      action: "start-level",
      showRanking: false,
    });
  };

  const loadLevel = index => {
    const def = LEVELS[index];
    const world = parseLevel(def);
    game.levelIndex = index;
    game.world = world;
    game.levelTime = def.timeLimit;
    game.started = false;
    game.mode = "ready";
    game.player = {
      x: world.spawn.x,
      y: world.spawn.y,
      prevX: world.spawn.x,
      prevY: world.spawn.y,
      w: 22,
      h: 30,
      vx: 0,
      vy: 0,
      onGround: false,
      coyote: 0,
      jumpBuffer: 0,
      invuln: 0,
      facing: 1,
      crouching: false,
      animName: "idle",
      animFrame: 0,
      animElapsed: 0,
      landingTimer: 0,
      dustTimer: 0,
      isDying: false,
      deathTimer: 0,
      keys: 0,
      inWater: false,
      waterSplashCooldown: 0,
    };
    game.cameraX = 0;
    game.cameraY = 0;
    game.effects = [];
    game.waterSplashes = [];
    updateCamera();
    hideStatus();
    updateHud();
  };

  const parseLevel = def => {
    const rows = def.map;
    const height = rows.length;
    const width = rows.reduce((m, row) => Math.max(m, row.length), 0);
    const solids = new Set();
    const solidMoss = new Set();
    const solidCrack = new Set();
    const solidBridge = new Set();
    const solidCrate = new Set();
    const bridgeTiles = new Map();
    const floorATiles = new Map();
    const wallATiles = new Map();
    const waterTiles = [];
    const spikes = [];
    const lavas = [];
    const coins = [];
    const enemies = [];
    const doors = [];
    const chests = [];
    const looseKeys = [];
    const switches = [];
    const decors = [];
    let spawn = { x: TILE * 1.2, y: TILE * 10 };
    let goal = { x: TILE * 2, y: TILE * 2, w: TILE * 0.9, h: TILE * 1.4, progress: 0, unlocking: false, completed: false };

    for (let y = 0; y < height; y += 1) {
      const row = rows[y];
      for (let x = 0; x < width; x += 1) {
        const cell = row[x] || ".";
        const key = `${x},${y}`;
        if (
          cell === "#" ||
          cell === "%" ||
          cell === "@" ||
          cell === "=" ||
          cell === "(" ||
          cell === ")" ||
          cell === "X" ||
          "123456789".includes(cell) ||
          "abcdefghij".includes(cell)
        ) {
          solids.add(key);
          if (cell === "%") solidMoss.add(key);
          if (cell === "@") solidCrack.add(key);
          if (cell === "=" || cell === "(" || cell === ")") {
            solidBridge.add(key);
            bridgeTiles.set(key, cell === "(" ? "up" : cell === ")" ? "down" : "mid");
          }
          if (cell === "X") solidCrate.add(key);
          if ("123456789".includes(cell)) floorATiles.set(key, cell);
          if ("abcdefghij".includes(cell)) wallATiles.set(key, cell);
        } else if (cell === "^") {
          spikes.push({
            x: x * TILE,
            y: y * TILE + TILE * 0.35,
            w: TILE,
            h: TILE * 0.65,
          });
        } else if (cell === "Z") {
          lavas.push({
            x: x * TILE,
            y: y * TILE + TILE * 0.2,
            w: TILE,
            h: TILE * 0.8,
          });
        } else if (cell === "D") {
          doors.push({
            tileX: x,
            tileY: y,
            x: x * TILE,
            y: y * TILE,
            w: TILE,
            h: TILE,
            open: false,
            progress: 0,
            solidKey: key,
          });
          solids.add(key);
        } else if (cell === "B") {
          chests.push({
            x: x * TILE + 2,
            y: y * TILE + 6,
            w: TILE - 4,
            h: TILE - 8,
            opened: false,
            hasKey: true,
          });
        } else if (cell === "Y") {
          chests.push({
            x: x * TILE + 2,
            y: y * TILE + 6,
            w: TILE - 4,
            h: TILE - 8,
            opened: true,
            hasKey: false,
          });
        } else if (cell === "K") {
          looseKeys.push({
            x: x * TILE + TILE * 0.5,
            y: y * TILE + TILE * 0.5,
            r: TILE * 0.2,
            collected: false,
            pulse: Math.random() * Math.PI * 2,
          });
        } else if (cell === "L") {
          switches.push({
            x: x * TILE + 8,
            y: y * TILE + 8,
            w: TILE - 16,
            h: TILE - 16,
            activated: false,
          });
        } else if (cell === "P" || cell === "Q" || cell === "U") {
          waterTiles.push({
            x: x * TILE,
            y: y * TILE,
            variant: cell === "P" ? "left" : cell === "Q" ? "mid" : "right",
          });
        } else if (cell === "C") {
          coins.push({
            x: x * TILE + TILE * 0.5,
            y: y * TILE + TILE * 0.5,
            r: TILE * 0.2,
            collected: false,
            pulse: Math.random() * Math.PI * 2,
          });
        } else if (cell === "S") {
          spawn = { x: x * TILE + 4, y: y * TILE - 2 };
        } else if (cell === "G") {
          goal = {
            x: x * TILE + 4,
            y: y * TILE - TILE * 0.45,
            w: TILE * 0.8,
            h: TILE * 1.45,
            progress: 0,
            unlocking: false,
            completed: false,
          };
        } else if (cell === "E") {
          enemies.push({
            x: x * TILE + 5,
            y: y * TILE,
            w: 22,
            h: 22,
            dir: 1,
            speed: 68 + Math.random() * 18,
            alive: true,
            dead: false,
            deathDone: false,
            state: "move",
            animFrame: 0,
            animElapsed: 0,
            attackCooldown: 0,
          });
        } else if ("TOHVWMRI".includes(cell)) {
          decors.push({
            type: cell,
            x: x * TILE,
            y: y * TILE,
            w: TILE,
            h: TILE,
          });
        }
      }
    }

    enemies.forEach(enemy => {
      const standTileY = findStandTileY(enemy.x + enemy.w * 0.5, enemy.y / TILE, solids, height);
      enemy.y = standTileY * TILE + (TILE - enemy.h);
    });

    return {
      name: def.name,
      width,
      height,
      pixelWidth: width * TILE,
      pixelHeight: height * TILE,
      solids,
      solidMoss,
      solidCrack,
      solidBridge,
      solidCrate,
      bridgeTiles,
      floorATiles,
      wallATiles,
      waterTiles,
      spikes,
      lavas,
      coins,
      enemies,
      doors,
      chests,
      looseKeys,
      switches,
      decors,
      goal,
      spawn,
    };
  };

  const findStandTileY = (xPx, startTileY, solids, height) => {
    const tx = Math.floor(xPx / TILE);
    let ty = Math.max(0, Math.floor(startTileY));
    while (ty < height - 2 && !solids.has(`${tx},${ty + 1}`)) {
      ty += 1;
    }
    return ty;
  };

  const updateHud = () => {
    const l = levelEl();
    const lv = livesEl();
    const c = coinsEl();
    const k = keysEl();
    const s = scoreEl();
    const t = timeEl();
    if (l) l.textContent = String(game.levelIndex + 1);
    if (lv) {
      const hearts = [];
      for (let i = 0; i < MAX_LIVES; i += 1) {
        hearts.push(`<span class="pixel-platformer-heart${i < game.lives ? " is-full" : ""}"></span>`);
      }
      lv.innerHTML = `<span class="pixel-platformer-hearts">${hearts.join("")}</span>`;
    }
    if (c) c.textContent = String(game.coins);
    const keyCount = game.player?.keys || 0;
    if (k) k.textContent = String(keyCount);
    const chip = keyChipEl();
    if (chip) {
      chip.classList.toggle("has-key", keyCount > 0);
      chip.title = keyCount > 0 ? "Voce tem chave para abrir a porta" : "Sem chave";
    }
    if (s) s.textContent = String(game.score);
    if (t) t.textContent = formatClock(game.levelTime);
  };

  const showStatus = ({ title, sub, actionLabel, action, showRanking }) => {
    const status = statusEl();
    const titleNode = statusTitleEl();
    const subNode = statusSubEl();
    const actionNode = statusActionEl();
    const rankWrap = rankWrapEl();
    if (!status || !titleNode || !subNode || !actionNode || !rankWrap) return;
    titleNode.textContent = title;
    subNode.textContent = sub;
    actionNode.textContent = actionLabel;
    actionType = action;
    if (showRanking) {
      rankWrap.classList.add("is-visible");
      renderRanking();
    } else {
      rankWrap.classList.remove("is-visible");
    }
    status.classList.add("is-visible");
  };

  const hideStatus = () => {
    const status = statusEl();
    if (status) status.classList.remove("is-visible");
  };

  const handleStatusAction = () => {
    if (actionType === "start-level") {
      if (game.mode === "paused") {
        game.mode = "playing";
      } else if (game.mode === "ready") {
        game.mode = "playing";
        game.started = true;
      }
      hideStatus();
      return;
    }
    if (actionType === "next-level") {
      const next = game.levelIndex + 1;
      loadLevel(next);
      showStatus({
        title: LEVELS[next].name,
        sub: "Nova fase carregada. Inicie com esquerda, direita ou pulo.",
        actionLabel: "Iniciar",
        action: "start-level",
        showRanking: false,
      });
      return;
    }
    if (actionType === "restart-level") {
      loadLevel(game.levelIndex);
      showStatus({
        title: LEVELS[game.levelIndex].name,
        sub: "Fase reiniciada.",
        actionLabel: "Iniciar",
        action: "start-level",
        showRanking: false,
      });
      return;
    }
    if (actionType === "restart-run") {
      startRun();
    }
  };

  const saveRanking = () => {
    const list = loadRanking();
    list.push({
      score: game.score,
      time: Math.max(1, Math.round(game.totalTime)),
      at: Date.now(),
    });
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time - b.time;
    });
    localStorage.setItem(rankStorageKey, JSON.stringify(list.slice(0, 5)));
  };

  const loadRanking = () => {
    try {
      return JSON.parse(localStorage.getItem(rankStorageKey) || "[]");
    } catch {
      return [];
    }
  };

  const renderRanking = () => {
    const listNode = rankListEl();
    if (!listNode) return;
    const list = loadRanking();
    listNode.innerHTML = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.textContent = "Sem registros";
      listNode.appendChild(li);
      return;
    }
    list.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.textContent = `${idx + 1}. ${entry.score} pts - ${formatClock(entry.time)}`;
      listNode.appendChild(li);
    });
  };

  const formatClock = secs => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const rectOverlap = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;

  const spawnEffect = (name, x, y, facing = 1) => {
    const animation = getAnimationMeta(name);
    if (!animation) return;
    game.effects.push({
      name,
      x,
      y,
      facing,
      frame: animation.from,
      elapsed: 0,
      done: false,
    });
  };

  const updateEffects = dt => {
    if (!game.effects.length) return;
    for (const effect of game.effects) {
      if (effect.done) continue;
      const animation = getAnimationMeta(effect.name);
      if (!animation) {
        effect.done = true;
        continue;
      }
      const frameDuration = 1 / Math.max(1, animation.fps || 8);
      effect.elapsed += dt;
      while (effect.elapsed >= frameDuration) {
        effect.elapsed -= frameDuration;
        if (effect.frame < animation.to) {
          effect.frame += 1;
        } else if (animation.loop) {
          effect.frame = animation.from;
        } else {
          effect.done = true;
          break;
        }
      }
    }
    game.effects = game.effects.filter(effect => !effect.done);
  };

  const updateWaterSplashes = dt => {
    if (!game.waterSplashes.length) return;
    for (const p of game.waterSplashes) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vy += 410 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;
    }
    game.waterSplashes = game.waterSplashes.filter(p => p.life > 0);
  };

  const getDustSpawn = player => {
    const fx = player.facing < 0 ? player.x + player.w - 10 : player.x - 6;
    const fy = player.y + player.h - 32;
    return { x: fx, y: fy };
  };

  const isPlayerInWater = player => {
    const world = game.world;
    if (!world || !player) return false;
    for (const tile of world.waterTiles) {
      if (
        player.x < tile.x + TILE &&
        player.x + player.w > tile.x &&
        player.y < tile.y + TILE &&
        player.y + player.h > tile.y
      ) {
        return true;
      }
    }
    return false;
  };

  const spawnWaterSplash = (player, type = "enter") => {
    const count = type === "enter" ? 8 : 6;
    const baseX = player.x + player.w * 0.5;
    const baseY = player.y + player.h * 0.72;
    const dirBoost = clamp(player.vx / 220, -1, 1);
    for (let i = 0; i < count; i += 1) {
      const spread = (Math.random() - 0.5) * 1.9;
      const vx = spread * 65 + dirBoost * 40;
      const vy = (type === "enter" ? -1 : -0.8) * (70 + Math.random() * 85);
      game.waterSplashes.push({
        x: baseX + (Math.random() - 0.5) * player.w * 0.7,
        y: baseY + (Math.random() - 0.5) * 5,
        vx,
        vy,
        life: 0.34 + Math.random() * 0.22,
        maxLife: 0.56 + Math.random() * 0.22,
        size: 2 + Math.floor(Math.random() * 2),
      });
    }
  };

  const isSolidTile = (tx, ty) => {
    const world = game.world;
    if (!world) return false;
    if (tx < 0 || tx >= world.width) return true;
    if (ty < 0) return false;
    if (ty >= world.height) return false;
    return world.solids.has(`${tx},${ty}`);
  };

  const resolveHorizontal = player => {
    const left = Math.floor(player.x / TILE);
    const right = Math.floor((player.x + player.w - 1) / TILE);
    const top = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty += 1) {
      for (let tx = left; tx <= right; tx += 1) {
        if (!isSolidTile(tx, ty)) continue;
        const tile = { x: tx * TILE, y: ty * TILE, w: TILE, h: TILE };
        if (!rectOverlap(player, tile)) continue;
        if (player.vx > 0) {
          player.x = tile.x - player.w;
        } else if (player.vx < 0) {
          player.x = tile.x + tile.w;
        }
        player.vx = 0;
      }
    }
  };

  const resolveVertical = player => {
    player.onGround = false;
    const left = Math.floor(player.x / TILE);
    const right = Math.floor((player.x + player.w - 1) / TILE);
    const top = Math.floor(player.y / TILE);
    const bottom = Math.floor((player.y + player.h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty += 1) {
      for (let tx = left; tx <= right; tx += 1) {
        if (!isSolidTile(tx, ty)) continue;
        const tile = { x: tx * TILE, y: ty * TILE, w: TILE, h: TILE };
        if (!rectOverlap(player, tile)) continue;
        if (player.vy > 0) {
          player.y = tile.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = tile.y + tile.h;
          player.vy = 0;
        }
      }
    }
  };

  const refreshGroundState = player => {
    // Keeps grounded state stable when the player is resting exactly on tile top.
    if (player.vy < 0) return;
    const footY = Math.floor((player.y + player.h + 1) / TILE);
    const left = Math.floor((player.x + 1) / TILE);
    const right = Math.floor((player.x + player.w - 2) / TILE);
    for (let tx = left; tx <= right; tx += 1) {
      if (isSolidTile(tx, footY)) {
        player.onGround = true;
        return;
      }
    }
  };

  const damagePlayer = reason => {
    if (game.mode !== "playing") return;
    const player = game.player;
    if (!player || player.invuln > 0) return;
    game.lives -= 1;
    game.score = Math.max(0, game.score - 80);
    if (game.lives <= 0) {
      startPlayerDeath(reason, true);
      updateHud();
      return;
    }
    startPlayerDeath(reason, false);
    updateHud();
  };

  const getAnimationDuration = name => {
    const animation = getAnimationMeta(name);
    if (!animation) return 0.7;
    const clipFrames = getClipFrames(name);
    const frameCount = clipFrames
      ? clipFrames.length
      : Math.max(1, (animation.to - animation.from + 1) || 1);
    const fps = Math.max(1, animation.fps || 8);
    return frameCount / fps;
  };

  const startPlayerDeath = (reason = "enemy", isFinal = false) => {
    const player = game.player;
    if (!player) return;
    game.deathReason = reason;
    game.finalDeath = isFinal;
    player.isDying = true;
    player.deathTimer = getAnimationDuration("death") + DEATH_ANIM_BUFFER;
    player.vx = 0;
    player.vy = 0;
    player.crouching = false;
    player.landingTimer = 0;
    player.animName = "death";
    player.animFrame = getAnimationMeta("death")?.from || 0;
    player.animElapsed = 0;
    game.mode = "dying";
    game.started = false;
  };

  const respawnPlayer = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    player.x = world.spawn.x;
    player.y = world.spawn.y;
    player.prevX = world.spawn.x;
    player.prevY = world.spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.invuln = 1.1;
    player.coyote = 0;
    player.jumpBuffer = 0;
    player.crouching = false;
    player.animName = "idle";
    player.animFrame = 0;
    player.animElapsed = 0;
    player.landingTimer = 0;
    player.dustTimer = 0;
    player.inWater = false;
    player.waterSplashCooldown = 0;
    player.isDying = false;
    player.deathTimer = 0;
    game.waterSplashes = [];
    game.deathReason = "";
    game.finalDeath = false;
    game.started = false;
    game.mode = "ready";
    showStatus({
      title: "Continue",
      sub: "Voce perdeu uma vida. Pressione esquerda, direita ou pulo.",
      actionLabel: "Voltar",
      action: "start-level",
      showRanking: false,
    });
  };

  const finishLevel = () => {
    const timeBonus = Math.floor(game.levelTime) * 12;
    game.score += 250 + timeBonus;
    if (game.levelIndex < LEVELS.length - 1) {
      game.mode = "level-clear";
      showStatus({
        title: "Fase concluida",
        sub: `Bonus de tempo: +${timeBonus}.`,
        actionLabel: "Proxima fase",
        action: "next-level",
        showRanking: false,
      });
      updateHud();
      return;
    }
    game.mode = "game-clear";
    saveRanking();
    showStatus({
      title: "Vitoria",
      sub: `Pontuacao final ${game.score} em ${formatClock(game.totalTime)}.`,
      actionLabel: "Jogar novamente",
      action: "restart-run",
      showRanking: true,
    });
    updateHud();
  };

  const updateEnemies = dt => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    const enemyAnim = enemySprite.animations;
    const updateEnemyAnim = (enemy, state) => {
      const anim = enemyAnim[state] || enemyAnim.move;
      if (enemy.state !== state) {
        enemy.state = state;
        enemy.animFrame = anim.from;
        enemy.animElapsed = 0;
      }
      const frameDuration = 1 / Math.max(1, anim.fps || 8);
      enemy.animElapsed += dt;
      while (enemy.animElapsed >= frameDuration) {
        enemy.animElapsed -= frameDuration;
        if (enemy.animFrame < anim.to) {
          enemy.animFrame += 1;
        } else if (anim.loop) {
          enemy.animFrame = anim.from;
        }
      }
    };

    world.enemies.forEach(enemy => {
      if (!enemy.alive || enemy.deathDone) return;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);

      if (enemy.dead) {
        const before = enemy.animFrame;
        updateEnemyAnim(enemy, "death");
        if (before === enemy.animFrame && enemy.animFrame >= enemyAnim.death.to) {
          enemy.deathDone = true;
        }
        return;
      }

      const pCenterX = player.x + player.w * 0.5;
      const pCenterY = player.y + player.h * 0.5;
      const eCenterX = enemy.x + enemy.w * 0.5;
      const eCenterY = enemy.y + enemy.h * 0.5;
      const dist = Math.hypot(pCenterX - eCenterX, pCenterY - eCenterY);
      const inAttackRange = dist <= TILE * 1.6;

      if (inAttackRange) {
        enemy.dir = pCenterX >= eCenterX ? 1 : -1;
        updateEnemyAnim(enemy, "attack");
      } else {
        updateEnemyAnim(enemy, "move");
        const nextX = enemy.x + enemy.dir * enemy.speed * dt;
        const frontX = enemy.dir > 0 ? nextX + enemy.w + 2 : nextX - 2;
        const footY = enemy.y + enemy.h + 2;
        const frontTile = Math.floor(frontX / TILE);
        const feetTile = Math.floor(footY / TILE);
        const wallAhead = isSolidTile(frontTile, Math.floor((enemy.y + enemy.h * 0.5) / TILE));
        const hasGround = isSolidTile(frontTile, feetTile);
        if (wallAhead || !hasGround) {
          enemy.dir *= -1;
        } else {
          enemy.x = nextX;
        }
      }

      if (!rectOverlap(player, enemy)) return;
      const prevCenterX = (player.prevX ?? player.x) + player.w * 0.5;
      const playerCenterX = player.x + player.w * 0.5;
      const centerX = (prevCenterX + playerCenterX) * 0.5;
      const prevBottom = (player.prevY ?? player.y) + player.h;
      const cameFromAbove = prevBottom <= enemy.y + enemy.h * 0.7;
      const descending = player.vy > 35;
      const centerAbove = player.y + player.h * 0.5 <= enemy.y + enemy.h * 0.72;
      const horizontalAligned = centerX >= enemy.x - 4 && centerX <= enemy.x + enemy.w + 4;
      const stomp =
        descending &&
        cameFromAbove &&
        centerAbove &&
        horizontalAligned;
      if (stomp) {
        enemy.dead = true;
        enemy.state = "death";
        enemy.animFrame = enemyAnim.death.from;
        enemy.animElapsed = 0;
        enemy.attackCooldown = 0;
        player.vy = -360;
        game.score += 120;
        return;
      }
      if (player.invuln <= 0 && enemy.attackCooldown <= 0) {
        damagePlayer("enemy");
        enemy.attackCooldown = 0.7;
      }
    });
  };

  const updateCoins = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    world.coins.forEach(coin => {
      if (coin.collected) return;
      const hit = rectOverlap(player, {
        x: coin.x - coin.r,
        y: coin.y - coin.r,
        w: coin.r * 2,
        h: coin.r * 2,
      });
      if (!hit) return;
      coin.collected = true;
      game.score += 45;
      game.coins += 1;
    });
  };

  const updateLooseKeys = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    world.looseKeys.forEach(item => {
      if (item.collected) return;
      const hit = rectOverlap(player, {
        x: item.x - item.r,
        y: item.y - item.r,
        w: item.r * 2,
        h: item.r * 2,
      });
      if (!hit) return;
      item.collected = true;
      player.keys += 1;
      game.score += 35;
    });
  };

  const updateDoors = dt => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    const playerCenter = { x: player.x + player.w * 0.5, y: player.y + player.h * 0.5 };
    const hasActivatedSwitch = world.switches.some(sw => sw.activated);
    world.doors.forEach(door => {
      const dist = Math.hypot(playerCenter.x - (door.x + door.w * 0.5), playerCenter.y - (door.y + door.h * 0.5));
      const shouldOpen = hasActivatedSwitch || (player.keys > 0 && dist < TILE * 1.9);
      door.open = shouldOpen;
      const target = shouldOpen ? 1 : 0;
      const speed = 4.4;
      if (door.progress < target) {
        door.progress = Math.min(target, door.progress + dt * speed);
      } else if (door.progress > target) {
        door.progress = Math.max(target, door.progress - dt * speed);
      }
      if (door.progress > 0.98) {
        world.solids.delete(door.solidKey);
      } else {
        world.solids.add(door.solidKey);
      }
    });
  };

  const pointInRect = (x, y, rect) =>
    x >= rect.x &&
    x <= rect.x + rect.w &&
    y >= rect.y &&
    y <= rect.y + rect.h;

  const isPlayerNearRect = (player, rect, rangeTiles = 2.2) => {
    const pCenter = { x: player.x + player.w * 0.5, y: player.y + player.h * 0.5 };
    const rCenter = { x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.5 };
    return Math.hypot(pCenter.x - rCenter.x, pCenter.y - rCenter.y) <= TILE * rangeTiles;
  };

  const tryInteractWithPlayer = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player || game.mode !== "playing") return false;

    for (const chest of world.chests) {
      if (chest.opened) continue;
      if (!isPlayerNearRect(player, chest, 2.4)) continue;
      chest.opened = true;
      game.score += 80;
      if (chest.hasKey) {
        player.keys += 1;
        chest.hasKey = false;
        game.score += 40;
      }
      updateHud();
      return true;
    }

    const goal = world.goal;
    if (goal && !goal.unlocking && !goal.completed && isPlayerNearRect(player, goal, 2.2)) {
      if (player.keys > 0) {
        player.keys -= 1;
        goal.unlocking = true;
        game.score += 120;
        updateHud();
        return true;
      }
      return false;
    }

    return false;
  };

  const tryInteractAt = (worldX, worldY) => {
    const world = game.world;
    const player = game.player;
    if (!world || !player || game.mode !== "playing") return false;
    const pCenter = { x: player.x + player.w * 0.5, y: player.y + player.h * 0.5 };

    for (const sw of world.switches) {
      if (!pointInRect(worldX, worldY, sw)) continue;
      const dist = Math.hypot(pCenter.x - (sw.x + sw.w * 0.5), pCenter.y - (sw.y + sw.h * 0.5));
      if (dist > TILE * 2.6) return false;
      sw.activated = !sw.activated;
      game.score += 30;
      return true;
    }
    return false;
  };

  const updateHazards = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    for (const spike of world.spikes) {
      if (rectOverlap(player, spike)) {
        damagePlayer("spike");
        return;
      }
    }
    for (const lava of world.lavas) {
      if (rectOverlap(player, lava)) {
        damagePlayer("lava");
        return;
      }
    }
    if (player.y > world.pixelHeight + 120) {
      damagePlayer("fall");
    }
  };

  const updateGoal = dt => {
    const world = game.world;
    if (!world) return;
    const goal = world.goal;
    if (!goal || goal.completed || !goal.unlocking) return;
    goal.progress = Math.min(1, goal.progress + dt * 2.6);
    if (goal.progress >= 1 && !goal.completed) {
      goal.completed = true;
      finishLevel();
    }
  };

  const updatePlayer = dt => {
    const player = game.player;
    if (!player) return;
    player.prevX = player.x;
    player.prevY = player.y;
    const wasOnGround = player.onGround;

    const left = keys.has("ArrowLeft") || keys.has("KeyA");
    const right = keys.has("ArrowRight") || keys.has("KeyD");
    const down = keys.has("ArrowDown") || keys.has("KeyS");

    if (left) player.facing = -1;
    if (right) player.facing = 1;
    player.crouching = down && player.onGround;

    if (left === right) {
      if (player.onGround) {
        const drop = GROUND_FRICTION * dt;
        if (Math.abs(player.vx) <= drop) {
          player.vx = 0;
        } else {
          player.vx -= Math.sign(player.vx) * drop;
        }
      }
    } else {
      const accel = player.onGround ? MOVE_ACCEL : AIR_ACCEL;
      player.vx += (left ? -1 : 1) * accel * dt;
      player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);
    }

    player.vy = clamp(player.vy + GRAVITY * dt, -1200, MAX_FALL);

    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    if (player.onGround) {
      player.coyote = COYOTE_TIME;
    } else {
      player.coyote = Math.max(0, player.coyote - dt);
    }

    if (player.jumpBuffer > 0 && player.coyote > 0) {
      player.vy = JUMP_VELOCITY;
      const dust = getDustSpawn(player);
      spawnEffect("doubleJumpDust", dust.x, dust.y, player.facing);
      player.jumpBuffer = 0;
      player.coyote = 0;
      player.onGround = false;
      player.landingTimer = 0;
    }

    player.x += player.vx * dt;
    resolveHorizontal(player);

    player.y += player.vy * dt;
    resolveVertical(player);
    refreshGroundState(player);
    if (!wasOnGround && player.onGround) {
      player.landingTimer = LANDING_TIME;
      const dust = getDustSpawn(player);
      spawnEffect("moveDust", dust.x, dust.y, player.facing);
    }
    if (player.landingTimer > 0) {
      player.landingTimer = Math.max(0, player.landingTimer - dt);
    }

    if (player.invuln > 0) {
      player.invuln = Math.max(0, player.invuln - dt);
    }
    if (player.onGround && Math.abs(player.vx) > 120 && game.mode === "playing") {
      player.dustTimer = Math.max(0, player.dustTimer - dt);
      if (player.dustTimer === 0) {
        const dust = getDustSpawn(player);
        spawnEffect("moveDust", dust.x, dust.y, player.facing);
        player.dustTimer = 0.16;
      }
    } else {
      player.dustTimer = 0;
    }

    player.waterSplashCooldown = Math.max(0, player.waterSplashCooldown - dt);
    const inWaterNow = isPlayerInWater(player);
    if (inWaterNow !== player.inWater && player.waterSplashCooldown <= 0) {
      spawnWaterSplash(player, inWaterNow ? "enter" : "exit");
      player.waterSplashCooldown = WATER_SPLASH_COOLDOWN;
    }
    player.inWater = inWaterNow;
    updatePlayerAnimation(player, dt);
  };

  const hasAnimation = name => Boolean(playerSprite.config.animations?.[name]);

  const getAnimationMeta = name => playerSprite.config.animations?.[name] || null;

  const getClipFrames = name => {
    const frames = playerSprite.config.clips?.[name];
    return Array.isArray(frames) && frames.length ? frames : null;
  };

  const chooseAnimation = player => {
    if (player.isDying && hasAnimation("death")) return "death";
    if (game.mode === "ready" && !game.started && player.onGround) return hasAnimation("idle") ? "idle" : "walk";
    if (!player.onGround) return hasAnimation("jump") ? "jump" : "idle";
    if (player.landingTimer > 0 && hasAnimation("landing")) return "landing";
    if (player.crouching && hasAnimation("crouch")) return "crouch";
    const speed = Math.abs(player.vx);
    if (speed > 150 && hasAnimation("run")) return "run";
    if (speed > 8 && hasAnimation("walk")) return "walk";
    return "idle";
  };

  const updatePlayerAnimation = (player, dt) => {
    const animationName = chooseAnimation(player);
    const animation = getAnimationMeta(animationName);
    if (!animation) return;
    const clipFrames = getClipFrames(animationName);

    if (player.animName !== animationName) {
      player.animName = animationName;
      player.animFrame = clipFrames ? 0 : animation.from;
      player.animElapsed = 0;
    }

    // When crouching in place, hold the middle crouch frame instead of looping
    // through the full crouch transition animation.
    if (animationName === "crouch" && Math.abs(player.vx) <= 8) {
      if (clipFrames) {
        player.animFrame = Math.floor((clipFrames.length - 1) * 0.5);
      } else {
        player.animFrame = Math.floor((animation.from + animation.to) * 0.5);
      }
      player.animElapsed = 0;
      return;
    }

    const frameDuration = 1 / Math.max(1, animation.fps || 8);
    player.animElapsed += dt;
    while (player.animElapsed >= frameDuration) {
      player.animElapsed -= frameDuration;
      const next = player.animFrame + 1;
      if (clipFrames) {
        const last = clipFrames.length - 1;
        if (next > last) {
          player.animFrame = animation.loop ? 0 : last;
        } else {
          player.animFrame = next;
        }
      } else {
        if (next > animation.to) {
          player.animFrame = animation.loop ? animation.from : animation.to;
        } else {
          player.animFrame = next;
        }
      }
    }
  };

  const updateGame = dt => {
    if (!game.world || !game.player) return;
    if (game.mode === "paused") return;
    if (game.mode === "dying") {
      const player = game.player;
      player.deathTimer = Math.max(0, player.deathTimer - dt);
      updatePlayerAnimation(player, dt);
      updateEffects(dt);
      updateWaterSplashes(dt);
      if (player.deathTimer <= 0) {
        if (game.finalDeath || game.lives <= 0) {
          game.mode = "game-over";
          saveRanking();
          showStatus({
            title: "Game Over",
            sub: game.deathReason === "time" ? "O tempo acabou." : "Voce perdeu todas as vidas.",
            actionLabel: "Reiniciar corrida",
            action: "restart-run",
            showRanking: true,
          });
          game.deathReason = "";
          game.finalDeath = false;
        } else {
          respawnPlayer();
        }
      }
      updateHud();
      return;
    }
    if (game.mode !== "playing" && game.mode !== "ready") return;

    if (game.started && game.mode === "playing") {
      game.levelTime -= dt;
      game.totalTime += dt;
      if (game.levelTime <= 0) {
        game.levelTime = 0;
        damagePlayer("time");
        updateHud();
        return;
      }
    }

    updatePlayer(dt);
    updateEffects(dt);
    updateWaterSplashes(dt);

    updateCamera();

    if (game.mode !== "playing") {
      updateHud();
      return;
    }

    updateEnemies(dt);
    updateCoins();
    updateLooseKeys();
    updateDoors(dt);
    updateHazards();
    if (game.mode === "playing") {
      updateGoal(dt);
    }
    updateHud();
  };

  const drawEffects = ctx => {
    if (!game.effects.length || !playerSprite.loaded) return;
    const fw = playerSprite.config.frameWidth || 32;
    const fh = playerSprite.config.frameHeight || 32;
    const cameraX = Math.floor(game.cameraX);
    const cameraY = Math.floor(game.cameraY);
    for (const effect of game.effects) {
      const animation = getAnimationMeta(effect.name);
      if (!animation) continue;
      const sx = effect.frame * fw;
      const sy = animation.row * fh;
      const dx = effect.x - cameraX;
      const dy = effect.y - cameraY;
      if (effect.facing < 0) {
        ctx.save();
        ctx.translate(dx + fw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(playerSprite.image, sx, sy, fw, fh, 0, 0, fw, fh);
        ctx.restore();
      } else {
        ctx.drawImage(playerSprite.image, sx, sy, fw, fh, dx, dy, fw, fh);
      }
    }
  };

  const drawWaterSplashes = ctx => {
    if (!game.waterSplashes.length) return;
    const cameraX = Math.floor(game.cameraX);
    const cameraY = Math.floor(game.cameraY);
    for (const p of game.waterSplashes) {
      const lifeRatio = clamp(p.life / p.maxLife, 0, 1);
      const x = Math.round(p.x - cameraX);
      const y = Math.round(p.y - cameraY);
      const size = Math.max(1, Math.round(p.size * (0.8 + lifeRatio * 0.4)));
      ctx.globalAlpha = 0.28 + lifeRatio * 0.58;
      ctx.fillStyle = "#bae6fd";
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = 0.2 + lifeRatio * 0.45;
      ctx.fillStyle = "#67e8f9";
      ctx.fillRect(x + 1, y, Math.max(1, size - 1), Math.max(1, size - 1));
    }
    ctx.globalAlpha = 1;
  };

  const updateCamera = () => {
    const world = game.world;
    const player = game.player;
    if (!world || !player) return;
    const c = canvas();
    const targetX = player.x + player.w * 0.5 - c.width * 0.5;
    const targetY = player.y + player.h * 0.5 - c.height * 0.5;
    game.cameraX = clamp(targetX, 0, Math.max(0, world.pixelWidth - c.width));
    game.cameraY = clamp(targetY, 0, Math.max(0, world.pixelHeight - c.height));
  };

  const drawBackground = ctx => {
    const c = canvas();
    ctx.fillStyle = "#090d14";
    ctx.fillRect(0, 0, c.width, c.height);

    const bands = [
      { y: 350, h: 120, speed: 0.2, color: "#101a27" },
      { y: 390, h: 90, speed: 0.35, color: "#132233" },
      { y: 440, h: 100, speed: 0.5, color: "#163049" },
    ];
    bands.forEach(b => {
      const x = -Math.floor(game.cameraX * b.speed) % 160;
      for (let i = -1; i < 10; i += 1) {
        ctx.fillStyle = b.color;
        ctx.fillRect(x + i * 160, b.y, 120, b.h);
      }
    });

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 0; i < 120; i += 1) {
      const sx = ((i * 97) - Math.floor(game.cameraX * 0.1)) % c.width;
      const sy = (i * 53) % 240;
      ctx.fillRect(sx, sy, 2, 2);
    }
  };

  const drawWorld = ctx => {
    const world = game.world;
    if (!world) return;
    const cameraX = Math.floor(game.cameraX);
    const cameraY = Math.floor(game.cameraY);
    const c = canvas();
    const startX = Math.max(0, Math.floor(cameraX / TILE) - 1);
    const endX = Math.min(world.width - 1, Math.ceil((cameraX + c.width) / TILE) + 1);
    const startY = Math.max(0, Math.floor(cameraY / TILE) - 1);
    const endY = Math.min(world.height - 1, Math.ceil((cameraY + c.height) / TILE) + 1);
    const drawKey = (x, y, size = 11) => {
      if (tileSprites.collectibles.key.loaded) {
        ctx.drawImage(tileSprites.collectibles.key.image, Math.round(x), Math.round(y), size, size);
        return;
      }
      ctx.fillStyle = "#facc15";
      ctx.fillRect(Math.round(x), Math.round(y + size * 0.35), Math.round(size * 0.72), Math.max(2, Math.round(size * 0.22)));
      ctx.fillRect(Math.round(x + size * 0.48), Math.round(y), Math.max(2, Math.round(size * 0.24)), Math.round(size * 0.72));
    };

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (!world.solids.has(`${x},${y}`)) continue;
        const px = x * TILE - cameraX;
        const py = y * TILE - cameraY;
        const key = `${x},${y}`;
        const floorCode = world.floorATiles.get(key);
        if (floorCode) {
          const sprite = tileSprites.floorA[floorCode];
          if (sprite && sprite.loaded) {
            ctx.drawImage(sprite.image, px, py, TILE, TILE);
          } else {
            ctx.fillStyle = "#4b5563";
            ctx.fillRect(px, py, TILE, TILE);
          }
          continue;
        }
        const wallCode = world.wallATiles.get(key);
        if (wallCode) {
          const sprite = tileSprites.wallA[wallCode];
          if (sprite && sprite.loaded) {
            ctx.drawImage(sprite.image, px, py, TILE, TILE);
          } else {
            ctx.fillStyle = "#293342";
            ctx.fillRect(px, py, TILE, TILE);
          }
          continue;
        }
        if (world.solidBridge.has(key)) {
          const variant = world.bridgeTiles.get(key) || "mid";
          const sprite = tileSprites.bridges[variant] || tileSprites.bridges.mid;
          if (sprite && sprite.loaded) {
            ctx.drawImage(sprite.image, px, py, TILE, TILE);
          } else {
            ctx.fillStyle = "#5b3c22";
            ctx.fillRect(px, py + 12, TILE, 8);
            ctx.fillStyle = "#8b5a2b";
            ctx.fillRect(px, py + 10, TILE, 3);
            for (let i = 2; i < TILE; i += 8) {
              ctx.fillStyle = "#3b2514";
              ctx.fillRect(px + i, py + 10, 2, 10);
            }
          }
          continue;
        }
        if (world.solidCrate.has(key)) {
          ctx.fillStyle = "#7c5a3b";
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = "#4a2f1f";
          ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
          ctx.fillStyle = "#9f7a57";
          ctx.fillRect(px + 4, py + 4, TILE - 8, 3);
          continue;
        }
        const isSurface = !world.solids.has(`${x},${y - 1}`);
        if (world.solidMoss.has(key)) {
          ctx.fillStyle = "#355449";
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = "#3f7a54";
          ctx.fillRect(px + 1, py + 1, TILE - 2, 6);
          ctx.fillStyle = "#1f2937";
          ctx.fillRect(px, py + TILE - 6, TILE, 6);
          continue;
        }
        if (world.solidCrack.has(key)) {
          ctx.fillStyle = "#3f4f60";
          ctx.fillRect(px, py, TILE, TILE);
          ctx.strokeStyle = "#0f172a";
          ctx.beginPath();
          ctx.moveTo(px + 3, py + 6);
          ctx.lineTo(px + 15, py + 12);
          ctx.lineTo(px + 10, py + 22);
          ctx.moveTo(px + 20, py + 5);
          ctx.lineTo(px + 24, py + 18);
          ctx.stroke();
          continue;
        }
        if (isSurface && tileSprites.loadedFloor) {
          ctx.drawImage(tileSprites.floor, px, py, TILE, TILE);
        } else if (!isSurface && tileSprites.loadedWall) {
          ctx.drawImage(tileSprites.wall, px, py, TILE, TILE);
        } else {
          ctx.fillStyle = isSurface ? "#2f4f72" : "#2a3547";
          ctx.fillRect(px, py, TILE, TILE);
          ctx.fillStyle = "#3d516c";
          ctx.fillRect(px + 2, py + 2, TILE - 4, 6);
        }
      }
    }

    const waterFrame = Math.floor(performance.now() / 160) % 4;
    world.waterTiles.forEach(tile => {
      const wx = tile.x - cameraX;
      const wy = tile.y - cameraY;
      if (wx + TILE < 0 || wx > c.width || wy + TILE < 0 || wy > c.height) return;
      const frames = tileSprites.waterA[tile.variant] || tileSprites.waterA.mid;
      const sprite = frames[waterFrame];
      if (sprite && sprite.loaded) {
        ctx.drawImage(sprite.image, wx, wy, TILE, TILE);
      } else {
        ctx.fillStyle = "#1d4f7a";
        ctx.fillRect(wx, wy, TILE, TILE);
        ctx.fillStyle = "rgba(147, 197, 253, 0.65)";
        ctx.fillRect(wx, wy + 8, TILE, 3);
      }
    });

    world.decors.forEach(item => {
      const dx = item.x - cameraX;
      const dy = item.y - cameraY;
      if (dx + item.w < 0 || dx > c.width || dy + item.h < 0 || dy > c.height) return;
      if (item.type === "T") {
        const flicker = Math.sin(performance.now() * 0.02 + item.x) * 2;
        ctx.fillStyle = "#7c2d12";
        ctx.fillRect(dx + 14, dy + 10, 4, 16);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(dx + 12, dy + 4 + flicker, 8, 8);
        ctx.fillStyle = "#fde68a";
        ctx.fillRect(dx + 14, dy + 6 + flicker, 4, 4);
      } else if (item.type === "H") {
        ctx.fillStyle = "#9ca3af";
        for (let i = 0; i < 4; i += 1) {
          ctx.fillRect(dx + 14, dy + i * 8, 4, 4);
          ctx.fillRect(dx + 13, dy + i * 8 + 4, 6, 2);
        }
      } else if (item.type === "W") {
        ctx.strokeStyle = "rgba(226,232,240,0.7)";
        ctx.beginPath();
        ctx.moveTo(dx + 2, dy + 2);
        ctx.lineTo(dx + 30, dy + 30);
        ctx.moveTo(dx + 30, dy + 2);
        ctx.lineTo(dx + 2, dy + 30);
        ctx.moveTo(dx + 16, dy + 0);
        ctx.lineTo(dx + 16, dy + 32);
        ctx.moveTo(dx + 0, dy + 16);
        ctx.lineTo(dx + 32, dy + 16);
        ctx.stroke();
      } else if (item.type === "R") {
        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(dx + 8, dy + 2, 16, 26);
        ctx.fillStyle = "#fca5a5";
        ctx.fillRect(dx + 14, dy + 8, 4, 12);
      } else if (item.type === "O") {
        ctx.fillStyle = "#7c4a1d";
        ctx.fillRect(dx + 7, dy + 5, 18, 22);
        ctx.fillStyle = "#4a2e1a";
        ctx.fillRect(dx + 8, dy + 8, 16, 3);
      } else if (item.type === "V") {
        ctx.fillStyle = "#b45309";
        ctx.fillRect(dx + 12, dy + 6, 8, 3);
        ctx.fillRect(dx + 9, dy + 9, 14, 17);
      } else if (item.type === "M") {
        ctx.fillStyle = "#166534";
        ctx.fillRect(dx + 4, dy + 20, 24, 8);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(dx + 8, dy + 14, 6, 4);
        ctx.fillRect(dx + 17, dy + 12, 7, 5);
      } else if (item.type === "I") {
        ctx.fillStyle = "#334155";
        ctx.fillRect(dx + 5, dy + 4, 22, 24);
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(dx + 8, dy + 7, 16, 18);
      }
    });

    world.switches.forEach(sw => {
      const sx = sw.x - cameraX;
      const sy = sw.y - cameraY;
      if (sx + sw.w < 0 || sx > c.width || sy + sw.h < 0 || sy > c.height) return;
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(sx, sy, sw.w, sw.h);
      ctx.fillStyle = sw.activated ? "#22c55e" : "#94a3b8";
      ctx.fillRect(sx + 2, sy + 2, sw.w - 4, sw.h - 4);
    });

    world.chests.forEach(chest => {
      const cx = chest.x - cameraX;
      const cy = chest.y - cameraY;
      if (cx + chest.w < 0 || cx > c.width || cy + chest.h < 0 || cy > c.height) return;
      const w = Math.round(chest.w);
      const h = Math.round(chest.h);
      const x = Math.round(cx);
      const y = Math.round(cy);
      const lidHeight = Math.max(8, Math.floor(h * 0.42));
      const bodyY = y + Math.max(7, Math.floor(h * 0.34));
      const bodyH = h - (bodyY - y);

      ctx.fillStyle = "#1d130c";
      ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

      if (chest.opened) {
        const openLidY = y - Math.max(4, Math.floor(h * 0.2));
        const openLidH = Math.max(7, Math.floor(h * 0.35));
        ctx.fillStyle = "#4a2f19";
        ctx.fillRect(x + 1, openLidY, w - 2, openLidH);
        ctx.fillStyle = "#8a5a30";
        ctx.fillRect(x + 2, openLidY + 1, w - 4, openLidH - 3);
        ctx.fillStyle = "#2a1b10";
        ctx.fillRect(x + 3, openLidY + openLidH - 2, w - 6, 2);
        ctx.fillStyle = "#120d08";
        ctx.fillRect(x + 2, y + 2, w - 4, bodyY - y + 2);
      } else {
        ctx.fillStyle = "#5a3a20";
        ctx.fillRect(x, y, w, lidHeight);
        ctx.fillStyle = "#8f5f33";
        ctx.fillRect(x + 2, y + 1, w - 4, lidHeight - 3);
        ctx.fillStyle = "#d1a25f";
        ctx.fillRect(x + 3, y + 2, w - 6, 2);
      }

      ctx.fillStyle = "#5c3b21";
      ctx.fillRect(x, bodyY, w, bodyH);
      ctx.fillStyle = "#855730";
      ctx.fillRect(x + 2, bodyY + 1, w - 4, bodyH - 2);

      ctx.fillStyle = "#c99b57";
      ctx.fillRect(x + 3, bodyY + 2, 2, bodyH - 5);
      ctx.fillRect(x + w - 5, bodyY + 2, 2, bodyH - 5);
      ctx.fillRect(x + Math.floor(w * 0.5) - 1, bodyY + 1, 2, bodyH - 3);

      if (!chest.opened) {
        ctx.fillStyle = "#e8bf74";
        ctx.fillRect(x + Math.floor(w * 0.5) - 2, bodyY - 1, 4, 5);
        ctx.fillStyle = "#6b4b1f";
        ctx.fillRect(x + Math.floor(w * 0.5) - 1, bodyY + 1, 2, 3);
      }

      if (chest.hasKey && chest.opened) {
        const keyY = y - 5 + Math.sin(performance.now() / 160) * 1.4;
        const keyX = x + Math.floor(w * 0.5) - 3;
        drawKey(keyX, keyY, 8);
      }
    });

    world.looseKeys.forEach(item => {
      if (item.collected) return;
      const kx = item.x - cameraX;
      const ky = item.y - cameraY;
      if (kx + item.r < 0 || kx - item.r > c.width || ky + item.r < 0 || ky - item.r > c.height) return;
      item.pulse += 0.05;
      const glow = Math.sin(item.pulse) * 1.5;
      drawKey(kx - 5, ky - 6 + glow, 11);
    });

    world.doors.forEach(door => {
      const dx = door.x - cameraX;
      const dy = door.y - cameraY;
      const panelX = dx + Math.round(door.progress * (door.w + 4));
      if (dx + door.w < 0 || dx > c.width || dy + door.h < 0 || dy > c.height) return;

      ctx.fillStyle = "#161d28";
      ctx.fillRect(dx - 2, dy - 2, door.w + 4, door.h + 4);
      ctx.fillStyle = "#0e141d";
      ctx.fillRect(dx, dy, door.w, door.h);
      ctx.fillStyle = "#253041";
      ctx.fillRect(dx + 2, dy + 2, door.w - 4, door.h - 4);

      if (panelX + door.w < 0 || panelX > c.width) return;
      ctx.fillStyle = "#3f2b1e";
      ctx.fillRect(panelX, dy, door.w, door.h);
      ctx.fillStyle = "#7c4a2e";
      ctx.fillRect(panelX + 3, dy + 3, door.w - 6, door.h - 6);
      ctx.fillStyle = "#cda56b";
      ctx.fillRect(panelX + 5, dy + 5, 2, door.h - 10);
    });

    world.spikes.forEach((spike, idx) => {
      const sx = spike.x - cameraX;
      const sy = spike.y - cameraY;
      if (sx + spike.w < 0 || sx > c.width || sy + spike.h < 0 || sy > c.height) return;
      if (tileSprites.hazards.spike.loaded) {
        ctx.drawImage(tileSprites.hazards.spike.image, sx, sy, spike.w, spike.h);
      } else {
        ctx.fillStyle = idx % 2 === 0 ? "#f97316" : "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(sx, sy + spike.h);
        ctx.lineTo(sx + spike.w * 0.5, sy);
        ctx.lineTo(sx + spike.w, sy + spike.h);
        ctx.closePath();
        ctx.fill();
      }
    });

    const lavaFrame = Math.floor(performance.now() / 140) % 4;
    world.lavas.forEach(lava => {
      const lx = lava.x - cameraX;
      const ly = lava.y - cameraY;
      if (lx + lava.w < 0 || lx > c.width || ly + lava.h < 0 || ly > c.height) return;
      const sprite = tileSprites.hazards.lava[lavaFrame];
      if (sprite && sprite.loaded) {
        ctx.drawImage(sprite.image, lx, ly, lava.w, lava.h);
      } else {
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(lx, ly, lava.w, lava.h);
      }
    });

    world.coins.forEach(coin => {
      if (coin.collected) return;
      const cx = coin.x - cameraX;
      const cy = coin.y - cameraY;
      if (cx + coin.r < 0 || cx - coin.r > c.width || cy + coin.r < 0 || cy - coin.r > c.height) return;
      const frame = Math.floor(performance.now() / 90) % tileSprites.collectibles.coin.length;
      const sprite = tileSprites.collectibles.coin[frame];
      const size = TILE * 1.02;
      const dx = cx - size * 0.5;
      const dy = cy - size * 0.55 + Math.sin(performance.now() * 0.008 + coin.pulse) * 0.8;
      if (sprite && sprite.loaded) {
        ctx.drawImage(sprite.image, dx, dy, size, size);
      } else {
        coin.pulse += 0.06;
        const pulse = Math.sin(coin.pulse) * 1.2;
        ctx.fillStyle = "#facc15";
        ctx.fillRect(cx - coin.r + pulse, cy - coin.r + pulse, coin.r * 2, coin.r * 2);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(cx - coin.r * 0.5, cy - coin.r * 0.5, coin.r, coin.r);
      }
    });

    world.enemies.forEach(enemy => {
      if (!enemy.alive || enemy.deathDone) return;
      const ex = enemy.x - cameraX;
      const ey = enemy.y - cameraY;
      if (ex + enemy.w < 0 || ex > c.width || ey + enemy.h < 0 || ey > c.height) return;

      if (enemySprite.loaded) {
        const anim = enemySprite.animations[enemy.state] || enemySprite.animations.move;
        const frame = clamp(enemy.animFrame, anim.from, anim.to);
        const sx = frame * enemySprite.frameWidth;
        const sy = anim.row * enemySprite.frameHeight;
        const dw = enemySprite.frameWidth;
        const dh = enemySprite.frameHeight;
        const dx = ex + enemy.w * 0.5 - dw * 0.5;
        const dy = ey + enemy.h - dh;

        if (enemy.dir < 0) {
          ctx.save();
          ctx.translate(dx + dw, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(enemySprite.image, sx, sy, enemySprite.frameWidth, enemySprite.frameHeight, 0, 0, dw, dh);
          ctx.restore();
        } else {
          ctx.drawImage(enemySprite.image, sx, sy, enemySprite.frameWidth, enemySprite.frameHeight, dx, dy, dw, dh);
        }
      } else {
        ctx.fillStyle = enemy.state === "attack" ? "#fb7185" : "#ef4444";
        ctx.fillRect(ex, ey, enemy.w, enemy.h);
        ctx.fillStyle = "#0f172a";
        if (enemy.dir > 0) {
          ctx.fillRect(ex + 14, ey + 7, 3, 3);
        } else {
          ctx.fillRect(ex + 5, ey + 7, 3, 3);
        }
      }
    });

    const goal = world.goal;
    const gx = goal.x - cameraX;
    const gy = goal.y - cameraY - Math.round(goal.progress * (goal.h - 2));
    ctx.fillStyle = "#334155";
    ctx.fillRect(gx - 2, goal.y - cameraY - 2, goal.w + 4, goal.h + 4);
    ctx.fillStyle = "#5b3a22";
    ctx.fillRect(gx, gy, goal.w, goal.h);
    ctx.fillStyle = "#f5d08a";
    ctx.fillRect(gx + goal.w * 0.45, gy + goal.h * 0.45, 4, 4);
  };

  const drawPlayer = ctx => {
    const player = game.player;
    if (!player) return;
    if (player.invuln > 0 && Math.floor(player.invuln * 15) % 2 === 0) return;
    const px = player.x - Math.floor(game.cameraX);
    const py = player.y - Math.floor(game.cameraY);
    const animation = getAnimationMeta(player.animName);
    if (playerSprite.loaded && animation) {
      const source = playerSprite.image;
      const clipFrames = getClipFrames(player.animName);
      let sx = 0;
      let sy = 0;
      let fw = 0;
      let fh = 0;
      if (clipFrames) {
        const idx = clamp(player.animFrame, 0, clipFrames.length - 1);
        const clip = clipFrames[idx];
        sx = clip[0];
        sy = clip[1];
        fw = clip[2];
        fh = clip[3];
      } else {
        fw = playerSprite.config.frameWidth;
        fh = playerSprite.config.frameHeight;
        sx = player.animFrame * fw;
        sy = animation.row * fh;
      }
      const safeTrim = Math.min(PLAYER_RENDER_TOP_TRIM, Math.max(0, fh - 2));
      sy += safeTrim;
      fh -= safeTrim;
      const targetHeight = player.h * 1.9;
      const scale = targetHeight / fh;
      const dw = fw * scale;
      const dh = fh * scale;
      const dx = px + player.w * 0.5 - dw * 0.5;
      const dy = py + player.h - dh;

      if (player.facing < 0) {
        ctx.save();
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(source, sx, sy, fw, fh, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.drawImage(source, sx, sy, fw, fh, dx, dy, dw, dh);
      }
      return;
    }

    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(px, py, player.w, player.h);
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(px + 3, py + player.h - 8, player.w - 6, 6);
    ctx.fillStyle = "#0f172a";
    if (player.facing > 0) {
      ctx.fillRect(px + player.w - 8, py + 8, 3, 3);
    } else {
      ctx.fillRect(px + 4, py + 8, 3, 3);
    }
  };

  const drawWaterForeground = ctx => {
    const world = game.world;
    const player = game.player;
    const c = canvas();
    if (!world || !player || !c) return;
    const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    const cameraX = Math.floor(game.cameraX);
    const cameraY = Math.floor(game.cameraY);
    const waterFrame = Math.floor(performance.now() / 160) % 4;

    world.waterTiles.forEach(tile => {
      const overlapX = Math.max(playerRect.x, tile.x);
      const overlapY = Math.max(playerRect.y, tile.y);
      const overlapR = Math.min(playerRect.x + playerRect.w, tile.x + TILE);
      const overlapB = Math.min(playerRect.y + playerRect.h, tile.y + TILE);
      if (overlapR <= overlapX || overlapB <= overlapY) return;

      const wx = tile.x - cameraX;
      const wy = tile.y - cameraY;
      if (wx + TILE < 0 || wx > c.width || wy + TILE < 0 || wy > c.height) return;

      const clipX = overlapX - cameraX;
      const clipY = overlapY - cameraY;
      const clipW = overlapR - overlapX;
      const clipH = overlapB - overlapY;

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipW, clipH);
      ctx.clip();
      ctx.globalAlpha = 0.62;

      const frames = tileSprites.waterA[tile.variant] || tileSprites.waterA.mid;
      const sprite = frames[waterFrame];
      if (sprite && sprite.loaded) {
        ctx.drawImage(sprite.image, wx, wy, TILE, TILE);
      } else {
        ctx.fillStyle = "#1d4f7a";
        ctx.fillRect(wx, wy, TILE, TILE);
      }

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#93c5fd";
      ctx.fillRect(wx, wy + 4, TILE, 3);
      ctx.restore();
    });
  };

  const drawTopBar = ctx => {
    const world = game.world;
    if (!world) return;
    ctx.fillStyle = "rgba(8,12,18,0.72)";
    ctx.fillRect(14, 14, 390, 34);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(14, 14, 390, 34);
    ctx.fillStyle = "#93c5fd";
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(world.name, 24, 36);
  };

  const drawPause = ctx => {
    if (game.mode !== "paused") return;
    const c = canvas();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.fillText("PAUSE", c.width / 2 - 45, c.height / 2);
  };

  const render = () => {
    const c = canvas();
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawBackground(ctx);
    drawWorld(ctx);
    drawEffects(ctx);
    drawPlayer(ctx);
    drawWaterSplashes(ctx);
    drawWaterForeground(ctx);
    drawTopBar(ctx);
    drawPause(ctx);
  };

  const loop = now => {
    if (!active) return;
    const delta = Math.min(60, now - lastTime);
    lastTime = now;
    acc += delta / 1000;
    while (acc >= FIXED_DT) {
      updateGame(FIXED_DT);
      acc -= FIXED_DT;
    }
    render();
    loopId = requestAnimationFrame(loop);
  };

  const clearInputs = () => {
    keys.clear();
    if (game.player) {
      game.player.jumpBuffer = 0;
    }
  };

  const beginPlayIfNeeded = () => {
    if (game.mode !== "ready") return;
    game.mode = "playing";
    game.started = true;
    hideStatus();
  };

  const queueJump = () => {
    if (!game.player) return;
    game.player.jumpBuffer = JUMP_BUFFER;
    beginPlayIfNeeded();
  };

  const setMoveKey = (code, enabled) => {
    if (enabled) {
      keys.add(code);
      if (code === "ArrowLeft" || code === "ArrowRight" || code === "KeyA" || code === "KeyD") {
        beginPlayIfNeeded();
      }
    } else {
      keys.delete(code);
    }
  };

  document.addEventListener("keydown", event => {
    if (!active && document.body.dataset.arcade) return;

    if (active) {
      if (event.key === "Escape") {
        closeGame();
        return;
      }
      if (event.code === "KeyP") {
        if (game.mode === "playing") {
          game.mode = "paused";
          showStatus({
            title: "Pausado",
            sub: "Pressione continuar para voltar ao jogo.",
            actionLabel: "Continuar",
            action: "start-level",
            showRanking: false,
          });
        } else if (game.mode === "paused") {
          hideStatus();
          game.mode = "playing";
        }
        return;
      }

      if (event.key.startsWith("Arrow") || event.code === "Space") {
        event.preventDefault();
      }

      if (event.code === "Space" || event.code === "KeyW" || event.key === "ArrowUp") {
        queueJump();
      }
      if (event.code === "KeyQ") {
        event.preventDefault();
        tryInteractWithPlayer();
      }

      if (event.key === "ArrowLeft" || event.code === "KeyA") setMoveKey("ArrowLeft", true);
      if (event.key === "ArrowRight" || event.code === "KeyD") setMoveKey("ArrowRight", true);
      if (event.key === "ArrowDown" || event.code === "KeyS") setMoveKey("ArrowDown", true);

      if (event.key === "Enter" && statusEl()?.classList.contains("is-visible")) {
        handleStatusAction();
      }
      return;
    }

    if (event.key === sequence[sequenceIndex]) {
      sequenceIndex += 1;
      if (sequenceIndex === sequence.length) {
        sequenceIndex = 0;
        openGame();
      }
    } else {
      sequenceIndex = 0;
    }
  });

  document.addEventListener("keyup", event => {
    if (!active) return;
    if (event.key === "ArrowLeft" || event.code === "KeyA") setMoveKey("ArrowLeft", false);
    if (event.key === "ArrowRight" || event.code === "KeyD") setMoveKey("ArrowRight", false);
    if (event.key === "ArrowDown" || event.code === "KeyS") setMoveKey("ArrowDown", false);
  });

  document.addEventListener("click", event => {
    if (!active) return;
    if (event.target === canvas()) {
      const c = canvas();
      const rect = c.getBoundingClientRect();
      const sx = ((event.clientX - rect.left) / rect.width) * c.width;
      const sy = ((event.clientY - rect.top) / rect.height) * c.height;
      const worldX = sx + game.cameraX;
      const worldY = sy + game.cameraY;
      if (tryInteractAt(worldX, worldY)) {
        updateHud();
      }
      return;
    }
    if (event.target === closeBtn()) closeGame();
    if (event.target && event.target.hasAttribute("data-status-action")) {
      handleStatusAction();
    }
  });
})();
