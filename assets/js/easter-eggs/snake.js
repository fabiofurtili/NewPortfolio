(() => {
  const sequence = ["ArrowUp", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowDown"];
  let index = 0;
  let active = false;

  const overlay = document.createElement("div");
  overlay.className = "snake-overlay";
  overlay.innerHTML = `
    <div class="snake-panel">
      <div class="snake-header">
        <strong>Snake</strong>
        <div class="snake-score">
          <span>Pontos: <strong data-score>0</strong></span>
          <span>Recorde: <strong data-high>0</strong></span>
        </div>
        <button type="button" class="snake-close" aria-label="Fechar">Fechar</button>
      </div>
      <canvas class="snake-canvas" width="420" height="420" aria-label="Jogo da cobrinha"></canvas>
      <div class="snake-hint">Use as setas do teclado. Esc para sair.</div>
    </div>
  `;

  const openGame = () => {
    if (active) return;
    active = true;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    initAudio();
    playBg();
    startGame();
  };

  const closeGame = () => {
    active = false;
    overlay.classList.remove("is-open");
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      document.body.style.overflow = "";
      stopGame();
      stopBg();
    }, 250);
  };

  const closeBtn = () => overlay.querySelector(".snake-close");

  let loopId = null;
  let tick = 0;
  let grid = 21;
  let snake = [{ x: 10, y: 10 }];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = { x: 15, y: 10 };
  let score = 0;
  let highScore = 0;
  let bgAudio = null;
  let collectAudio = null;
  let loopTimer = null;

  const scoreEl = () => overlay.querySelector("[data-score]");
  const highEl = () => overlay.querySelector("[data-high]");
  const loadHigh = () => Number(localStorage.getItem("snake_high_score") || 0);
  const saveHigh = value => localStorage.setItem("snake_high_score", String(value));

  const updateScoreUI = () => {
    const s = scoreEl();
    const h = highEl();
    if (s) s.textContent = String(score);
    if (h) h.textContent = String(highScore);
  };

  const initAudio = () => {
    if (bgAudio && collectAudio) return;
    bgAudio = new Audio("assets/sound/8bit-sound.mp3");
    bgAudio.volume = 0.35;
    bgAudio.addEventListener("ended", () => {
      loopTimer = setTimeout(() => {
        if (active && bgAudio) {
          bgAudio.currentTime = 0;
          bgAudio.play().catch(() => {});
        }
      }, 1000);
    });

    collectAudio = new Audio("assets/sound/collect-points.mp3");
    collectAudio.volume = 0.6;
  };

  const playBg = () => {
    if (!bgAudio) return;
    bgAudio.currentTime = 0;
    bgAudio.play().catch(() => {});
  };

  const stopBg = () => {
    if (!bgAudio) return;
    bgAudio.pause();
    bgAudio.currentTime = 0;
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
  };

  const reset = () => {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    food = spawnFood();
    score = 0;
    updateScoreUI();
  };

  const spawnFood = () => {
    let pos = { x: 0, y: 0 };
    let ok = false;
    while (!ok) {
      pos = {
        x: Math.floor(Math.random() * grid),
        y: Math.floor(Math.random() * grid),
      };
      ok = !snake.some(s => s.x === pos.x && s.y === pos.y);
    }
    return pos;
  };

  const startGame = () => {
    highScore = loadHigh();
    reset();
    tick = 0;
    loopId = requestAnimationFrame(loop);
  };

  const stopGame = () => {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
  };

  const loop = () => {
    if (!active) return;
    tick++;
    if (tick % 8 === 0) {
      step();
      draw();
    }
    loopId = requestAnimationFrame(loop);
  };

  const step = () => {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= grid || head.y < 0 || head.y >= grid) {
      reset();
      return;
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      reset();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      food = spawnFood();
      score += 1;
      if (score > highScore) {
        highScore = score;
        saveHigh(highScore);
      }
      updateScoreUI();
      if (collectAudio) {
        collectAudio.currentTime = 0;
        collectAudio.play().catch(() => {});
      }
    } else {
      snake.pop();
    }
  };

  const draw = () => {
    const canvas = overlay.querySelector(".snake-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width / grid;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0c0f14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.07)";
    for (let i = 0; i <= grid; i++) {
      ctx.fillRect(i * size, 0, 1, canvas.height);
      ctx.fillRect(0, i * size, canvas.width, 1);
    }

    ctx.fillStyle = "#f6c945";
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * size, (food.y + 0.5) * size, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#00c2ff";
    snake.forEach((seg, i) => {
      const pad = i === 0 ? 0.15 : 0.2;
      ctx.fillRect(
        (seg.x + pad) * size,
        (seg.y + pad) * size,
        size * (1 - pad * 2),
        size * (1 - pad * 2)
      );
    });
  };

  document.addEventListener("keydown", event => {
    if (active) {
      if (event.key === "Escape") {
        closeGame();
        return;
      }

      const keyMap = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      if (keyMap[event.key]) {
        const next = keyMap[event.key];
        if (next.x !== -dir.x || next.y !== -dir.y) {
          nextDir = next;
        }
      }
      return;
    }

    if (event.key === sequence[index]) {
      index++;
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
  });
})();
