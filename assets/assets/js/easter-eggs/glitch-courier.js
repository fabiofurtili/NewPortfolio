(() => {
  const sequence = ["ArrowUp", "ArrowDown", "ArrowUp", "ArrowRight", "ArrowRight"];
  let index = 0;
  let active = false;

  const overlay = document.createElement("div");
  overlay.className = "glitch-overlay";
  overlay.innerHTML = `
    <div class="glitch-panel">
      <div class="glitch-header">
        <strong class="glitch-title">Glitch Courier</strong>
        <div class="glitch-score">
          <span>Pontos: <strong data-score>0</strong></span>
          <span>Recorde: <strong data-high>0</strong></span>
          <span>Fase: <strong data-stage>1</strong></span>
          <span>Entregas: <strong data-deliveries>0/5</strong></span>
          <span>Tempo: <strong data-time>20s</strong></span>
          <span>Glitch: <strong data-glitch>Normal</strong></span>
        </div>
        <button type="button" class="glitch-close" aria-label="Fechar">Fechar</button>
      </div>
      <canvas class="glitch-canvas" width="512" height="512" aria-label="Glitch Courier"></canvas>
      <div class="glitch-hint">Entregue 5 pacotes antes do tempo. Glitch muda a cada 7s.</div>
      <div class="glitch-start" data-start>
        <div class="glitch-start-title">Pressione uma seta para iniciar</div>
        <div class="glitch-start-sub">Use os glitches para ganhar bonus.</div>
      </div>
      <div class="glitch-legend" data-legend>
        <span>Invert: controles invertidos</span>
        <span>Stutter: passos falham</span>
        <span>Warp: teleporte curto</span>
      </div>
      <div class="glitch-status" data-status>
        <span data-status-text></span>
        <button type="button" data-status-action>Jogar novamente</button>
      </div>
      <button class="glitch-leaderboard-toggle" type="button" data-leaderboard-toggle>Ranking local</button>
      <div class="glitch-leaderboard" data-leaderboard>
        <ol data-leaderboard-list></ol>
      </div>
    </div>
  `;

  const state = {
    grid: 16,
    player: { x: 1, y: 1 },
    target: { x: 13, y: 13 },
    walls: new Set(),
    dir: { x: 0, y: 0 },
    pendingDir: { x: 0, y: 0 },
    delivered: 0,
    deliveriesTarget: 5,
    score: 0,
    highScore: 0,
    stage: 1,
    timeLimit: 20,
    timeRemaining: 20,
    glitchPhase: "off",
    glitchName: "Normal",
    glitchTimer: 0,
    stepTimer: 0,
    lastTime: 0,
    accTime: 0,
    stutterToggle: false,
    isGameOver: false,
    isStarted: false,
  };

  const glitches = ["Invert", "Stutter", "Warp"];
  const baseInterval = 160;
  const glitchOnDuration = 4000;
  const glitchOffDuration = 3000;

  const scoreEl = () => overlay.querySelector("[data-score]");
  const highEl = () => overlay.querySelector("[data-high]");
  const stageEl = () => overlay.querySelector("[data-stage]");
  const deliveriesEl = () => overlay.querySelector("[data-deliveries]");
  const timeEl = () => overlay.querySelector("[data-time]");
  const glitchEl = () => overlay.querySelector("[data-glitch]");
  const statusEl = () => overlay.querySelector("[data-status]");
  const statusTextEl = () => overlay.querySelector("[data-status-text]");
  const statusActionEl = () => overlay.querySelector("[data-status-action]");
  const startEl = () => overlay.querySelector("[data-start]");
  const leaderboardToggleEl = () => overlay.querySelector("[data-leaderboard-toggle]");
  const leaderboardListEl = () => overlay.querySelector("[data-leaderboard-list]");

  const loadHigh = () => Number(localStorage.getItem("glitch_courier_high_score") || 0);
  const saveHigh = value => localStorage.setItem("glitch_courier_high_score", String(value));
  const loadBoard = () => {
    try {
      return JSON.parse(localStorage.getItem("glitch_courier_board") || "[]");
    } catch {
      return [];
    }
  };
  const saveBoard = list => localStorage.setItem("glitch_courier_board", JSON.stringify(list));

  const openGame = () => {
    if (active) return;
    active = true;
    document.body.appendChild(overlay);
    document.body.dataset.arcade = "glitch";
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    initGame();
    loopId = requestAnimationFrame(loop);
  };

  const closeGame = () => {
    active = false;
    overlay.classList.remove("is-open");
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      document.body.style.overflow = "";
      delete document.body.dataset.arcade;
      stopGame();
    }, 250);
  };

  const closeBtn = () => overlay.querySelector(".glitch-close");

  let loopId = null;

  const initGame = () => {
    state.highScore = loadHigh();
    state.score = 0;
    state.stage = 1;
    state.delivered = 0;
    state.timeRemaining = state.timeLimit;
    state.dir = { x: 0, y: 0 };
    state.pendingDir = { x: 0, y: 0 };
    state.glitchPhase = "off";
    state.glitchName = "Normal";
    state.glitchTimer = 0;
    state.accTime = 0;
    state.lastTime = performance.now();
    state.stutterToggle = false;
    state.isGameOver = false;
    state.isStarted = false;
    buildStage();
    spawnTarget();
    updateUI();
    renderLeaderboard(loadBoard());
    hideStatus();
    showStart();
    draw();
  };

  const stopGame = () => {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
  };

  const buildStage = () => {
    state.walls.clear();
    const wallCoords = [
      [3, 2], [3, 3], [3, 4], [3, 5],
      [6, 6], [7, 6], [8, 6], [9, 6],
      [10, 9], [10, 10], [10, 11],
      [5, 12], [6, 12], [7, 12],
      [12, 3], [12, 4], [12, 5],
    ];
    wallCoords.forEach(([x, y]) => state.walls.add(`${x},${y}`));
    state.player = { x: 1, y: 1 };
  };

  const spawnTarget = () => {
    let pos = { x: 0, y: 0 };
    let ok = false;
    while (!ok) {
      pos = {
        x: Math.floor(Math.random() * state.grid),
        y: Math.floor(Math.random() * state.grid),
      };
      const key = `${pos.x},${pos.y}`;
      ok =
        !state.walls.has(key) &&
        !(pos.x === state.player.x && pos.y === state.player.y);
    }
    state.target = pos;
  };

  const updateUI = () => {
    const s = scoreEl();
    const h = highEl();
    const st = stageEl();
    const d = deliveriesEl();
    const t = timeEl();
    const g = glitchEl();
    if (s) s.textContent = String(state.score);
    if (h) h.textContent = String(state.highScore);
    if (st) st.textContent = String(state.stage);
    if (d) d.textContent = `${state.delivered}/${state.deliveriesTarget}`;
    if (t) t.textContent = `${Math.max(0, Math.ceil(state.timeRemaining))}s`;
    if (g) g.textContent = state.glitchName;
  };

  const showStatus = (message, actionText = "Jogar novamente") => {
    const status = statusEl();
    const text = statusTextEl();
    const action = statusActionEl();
    if (!status || !text || !action) return;
    text.textContent = message;
    action.textContent = actionText;
    status.classList.add("is-visible");
  };

  const hideStatus = () => {
    const status = statusEl();
    if (status) status.classList.remove("is-visible");
  };

  const showStart = () => {
    const start = startEl();
    if (start) start.classList.add("is-visible");
  };

  const hideStart = () => {
    const start = startEl();
    if (start) start.classList.remove("is-visible");
  };

  const renderLeaderboard = list => {
    const el = leaderboardListEl();
    if (!el) return;
    el.innerHTML = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.textContent = "Sem registros";
      el.appendChild(li);
      return;
    }
    list.forEach((entry, idx) => {
      const li = document.createElement("li");
      li.textContent = `${idx + 1}. ${entry.score} pts`;
      el.appendChild(li);
    });
  };

  const updateLeaderboard = () => {
    const list = loadBoard();
    list.push({ score: state.score, ts: Date.now() });
    list.sort((a, b) => b.score - a.score);
    const trimmed = list.slice(0, 5);
    saveBoard(trimmed);
    renderLeaderboard(trimmed);
  };

  const setDirection = key => {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    if (!map[key]) return;
    if (!state.isStarted) {
      state.isStarted = true;
      hideStart();
    }
    state.pendingDir = map[key];
  };

  const applyGlitchToDir = dir => {
    if (state.glitchPhase !== "on") return dir;
    if (state.glitchName === "Invert") {
      return { x: -dir.x, y: -dir.y };
    }
    return dir;
  };

  const glitchStep = () => {
    if (state.glitchPhase !== "on") return false;
    if (state.glitchName === "Stutter") {
      state.stutterToggle = !state.stutterToggle;
      return state.stutterToggle;
    }
    if (state.glitchName === "Warp") {
      return Math.random() < 0.25;
    }
    return false;
  };

  const movePlayer = () => {
    let dir = state.pendingDir;
    if (dir.x === 0 && dir.y === 0) return;
    dir = applyGlitchToDir(dir);

    if (state.glitchName === "Stutter" && state.glitchPhase === "on") {
      if (glitchStep()) return;
    }

    if (state.glitchName === "Warp" && state.glitchPhase === "on") {
      if (glitchStep()) {
        randomWarp();
        return;
      }
    }

    const next = { x: state.player.x + dir.x, y: state.player.y + dir.y };
    if (next.x < 0 || next.x >= state.grid || next.y < 0 || next.y >= state.grid) {
      return;
    }
    if (state.walls.has(`${next.x},${next.y}`)) {
      return;
    }
    state.player = next;
    state.dir = dir;
    checkDelivery();
  };

  const randomWarp = () => {
    let pos = { x: 0, y: 0 };
    let ok = false;
    while (!ok) {
      pos = {
        x: Math.floor(Math.random() * state.grid),
        y: Math.floor(Math.random() * state.grid),
      };
      const key = `${pos.x},${pos.y}`;
      ok =
        !state.walls.has(key) &&
        !(pos.x === state.player.x && pos.y === state.player.y);
    }
    state.player = pos;
    checkDelivery();
  };

  const checkDelivery = () => {
    if (state.player.x !== state.target.x || state.player.y !== state.target.y) return;
    const basePoints = 100;
    const timeBonus = Math.max(0, Math.floor(state.timeRemaining * 2));
    const glitchBonus = state.glitchPhase === "on" ? 50 : 0;
    state.score += basePoints + timeBonus + glitchBonus;
    state.delivered += 1;
    state.timeRemaining = state.timeLimit;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveHigh(state.highScore);
    }
    if (state.delivered >= state.deliveriesTarget) {
      state.isGameOver = true;
      showStatus("Fase 1 concluida. Demo finalizada!", "Jogar novamente");
      updateLeaderboard();
      updateUI();
      stopGame();
      return;
    }
    spawnTarget();
  };

  const updateGlitch = delta => {
    state.glitchTimer += delta;
    if (state.glitchPhase === "off" && state.glitchTimer >= glitchOffDuration) {
      state.glitchPhase = "on";
      state.glitchTimer = 0;
      state.glitchName = glitches[Math.floor(Math.random() * glitches.length)];
      return;
    }
    if (state.glitchPhase === "on" && state.glitchTimer >= glitchOnDuration) {
      state.glitchPhase = "off";
      state.glitchTimer = 0;
      state.glitchName = "Normal";
    }
  };

  const loop = now => {
    if (!active) return;
    const delta = now - state.lastTime;
    state.lastTime = now;
    state.accTime += delta;
    if (state.isStarted) {
      state.timeRemaining -= delta / 1000;
    }
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      state.isGameOver = true;
      showStatus("Tempo esgotado!", "Tentar novamente");
      updateLeaderboard();
      updateUI();
      stopGame();
      return;
    }

    if (state.isStarted) {
      updateGlitch(delta);
    }

    while (state.accTime >= baseInterval) {
      if (state.isStarted) {
        movePlayer();
      }
      state.accTime -= baseInterval;
    }

    updateUI();
    draw();
    loopId = requestAnimationFrame(loop);
  };

  const draw = () => {
    const canvas = overlay.querySelector(".glitch-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width / state.grid;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#090c10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= state.grid; i++) {
      ctx.fillRect(i * size, 0, 1, canvas.height);
      ctx.fillRect(0, i * size, canvas.width, 1);
    }

    ctx.fillStyle = "#1f2937";
    state.walls.forEach(key => {
      const [x, y] = key.split(",").map(Number);
      ctx.fillRect(x * size, y * size, size, size);
    });

    ctx.fillStyle = state.glitchPhase === "on" ? "#f6c945" : "#00c2ff";
    ctx.fillRect(state.target.x * size + 4, state.target.y * size + 4, size - 8, size - 8);

    ctx.fillStyle = "#e8edf7";
    ctx.fillRect(state.player.x * size + 3, state.player.y * size + 3, size - 6, size - 6);
  };

  document.addEventListener("keydown", event => {
    if (!active && document.body.dataset.arcade) return;
    if (active) {
      if (event.key === "Escape") {
        closeGame();
        return;
      }
      setDirection(event.key);
      return;
    }

    if (event.key === sequence[index]) {
      index += 1;
      if (index === sequence.length) {
        index = 0;
        openGame();
      }
    } else {
      index = 0;
    }
  });

  document.addEventListener("click", event => {
    if (!active) return;
    if (event.target === closeBtn()) closeGame();
    if (event.target && event.target.hasAttribute("data-status-action")) {
      initGame();
      loopId = requestAnimationFrame(loop);
    }
    if (event.target && event.target.hasAttribute("data-leaderboard-toggle")) {
      const board = overlay.querySelector("[data-leaderboard]");
      if (board) board.classList.toggle("is-open");
    }
  });
})();
