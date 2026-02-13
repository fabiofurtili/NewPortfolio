import { LEVELS } from "./levels.js";

const tileDefs = [
  { key: ".", label: "Vazio", thumb: "thumb-empty" },
  { key: "1", label: "PisoA topo esquerda", thumb: "thumb-floor-a-top-left" },
  { key: "2", label: "PisoA topo centro", thumb: "thumb-floor-a-top-center" },
  { key: "3", label: "PisoA topo direita", thumb: "thumb-floor-a-top-right" },
  { key: "4", label: "PisoA meio esquerda", thumb: "thumb-floor-a-mid-left" },
  { key: "5", label: "PisoA meio centro", thumb: "thumb-floor-a-mid-center" },
  { key: "6", label: "PisoA meio direita", thumb: "thumb-floor-a-mid-right" },
  { key: "7", label: "PisoA base esquerda", thumb: "thumb-floor-a-bottom-left" },
  { key: "8", label: "PisoA base centro", thumb: "thumb-floor-a-bottom-center" },
  { key: "9", label: "PisoA base direita", thumb: "thumb-floor-a-bottom-right" },
  { key: "P", label: "AguaA esquerda", thumb: "thumb-water-a-left" },
  { key: "Q", label: "AguaA meio", thumb: "thumb-water-a-mid" },
  { key: "U", label: "AguaA direita", thumb: "thumb-water-a-right" },
  { key: "Z", label: "Lava", thumb: "thumb-lava" },
  { key: "a", label: "ParedeA topo esquerda", thumb: "thumb-wall-a-top-left" },
  { key: "b", label: "ParedeA topo meio", thumb: "thumb-wall-a-top-center" },
  { key: "c", label: "ParedeA topo direita", thumb: "thumb-wall-a-top-right" },
  { key: "d", label: "ParedeA meio esquerda", thumb: "thumb-wall-a-mid-left" },
  { key: "e", label: "ParedeA meio A", thumb: "thumb-wall-a-mid-center-a" },
  { key: "f", label: "ParedeA meio B", thumb: "thumb-wall-a-mid-center-b" },
  { key: "g", label: "ParedeA meio direita", thumb: "thumb-wall-a-mid-right" },
  { key: "h", label: "ParedeA base esquerda", thumb: "thumb-wall-a-bottom-left" },
  { key: "i", label: "ParedeA base meio", thumb: "thumb-wall-a-bottom-center" },
  { key: "j", label: "ParedeA base direita", thumb: "thumb-wall-a-bottom-right" },
  { key: "#", label: "Piso/Parede base", thumb: "thumb-ground" },
  { key: "=", label: "Ponte", thumb: "thumb-bridge" },
  { key: "(", label: "Ponte A (subida)", thumb: "thumb-bridge-a" },
  { key: ")", label: "Ponte B (descida)", thumb: "thumb-bridge-b" },
  { key: "^", label: "Espinho / Dano", thumb: "thumb-spike" },
  { key: "C", label: "Moeda", thumb: "thumb-coin" },
  { key: "V", label: "Vida", thumb: "thumb-life" },
  { key: "N", label: "Checkpoint", thumb: "thumb-checkpoint" },
  { key: "E", label: "Inimigo", thumb: "thumb-enemy" },
  { key: "D", label: "Porta trancada", thumb: "thumb-door" },
  { key: "B", label: "Bau com chave", thumb: "thumb-chest" },
  { key: "Y", label: "Bau aberto (vazio)", thumb: "thumb-chest-open" },
  { key: "K", label: "Chave", thumb: "thumb-key" },
  { key: "L", label: "Alavanca", thumb: "thumb-switch" },
  { key: "S", label: "Spawn (unico)", thumb: "thumb-spawn" },
  { key: "G", label: "Goal (unico)", thumb: "thumb-goal" },
];

const classByTile = {
  ".": "cell-empty",
  "1": "cell-floor-a-top-left",
  "2": "cell-floor-a-top-center",
  "3": "cell-floor-a-top-right",
  "4": "cell-floor-a-mid-left",
  "5": "cell-floor-a-mid-center",
  "6": "cell-floor-a-mid-right",
  "7": "cell-floor-a-bottom-left",
  "8": "cell-floor-a-bottom-center",
  "9": "cell-floor-a-bottom-right",
  P: "cell-water-a-left",
  Q: "cell-water-a-mid",
  U: "cell-water-a-right",
  Z: "cell-lava",
  a: "cell-wall-a-top-left",
  b: "cell-wall-a-top-center",
  c: "cell-wall-a-top-right",
  d: "cell-wall-a-mid-left",
  e: "cell-wall-a-mid-center-a",
  f: "cell-wall-a-mid-center-b",
  g: "cell-wall-a-mid-right",
  h: "cell-wall-a-bottom-left",
  i: "cell-wall-a-bottom-center",
  j: "cell-wall-a-bottom-right",
  "#": "cell-ground",
  "^": "cell-spike",
  C: "cell-coin",
  V: "cell-life",
  N: "cell-checkpoint",
  E: "cell-enemy",
  D: "cell-door",
  B: "cell-chest",
  Y: "cell-chest-open",
  K: "cell-key",
  L: "cell-switch",
  "=": "cell-bridge",
  "(": "cell-bridge-a",
  ")": "cell-bridge-b",
  S: "cell-spawn",
  G: "cell-goal",
};

const gridEl = document.querySelector("#grid");
const paletteEl = document.querySelector("#palette");
const nameEl = document.querySelector("#level-name");
const timeEl = document.querySelector("#level-time");
const widthEl = document.querySelector("#grid-width");
const heightEl = document.querySelector("#grid-height");
const existingLevelEl = document.querySelector("#existing-level");
const loadExistingLevelEl = document.querySelector("#load-existing-level");
const statusEl = document.querySelector("#load-status");
const saveSelectedLevelEl = document.querySelector("#save-selected-level");
const saveNewLevelEl = document.querySelector("#save-new-level");
const deleteSelectedLevelEl = document.querySelector("#delete-selected-level");
const moveSelectedLevelEl = document.querySelector("#move-selected-level");
const moveTargetIndexEl = document.querySelector("#move-target-index");
const resetLocalLevelsEl = document.querySelector("#reset-local-levels");
const resizeGridEl = document.querySelector("#resize-grid");
const clearGridEl = document.querySelector("#clear-grid");

let selectedTile = "#";
let mouseDown = false;
let grid = [];
let editorBusy = false;
const LEVELS_STORAGE_KEY = "pixel_platformer_levels_v1";
const defaultLevels = LEVELS.map(level => ({
  name: level.name,
  timeLimit: level.timeLimit,
  map: [...level.map],
}));

const createGrid = (w, h) => {
  grid = Array.from({ length: h }, () => Array.from({ length: w }, () => "."));
  grid[h - 1] = Array.from({ length: w }, () => "#");
  grid[0][0] = "S";
  grid[h - 2][w - 1] = "G";
};

const setUniqueTile = (tile, x, y) => {
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === tile) {
        grid[row][col] = ".";
      }
    }
  }
  grid[y][x] = tile;
};

const paintCell = (x, y) => {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return;
  if (selectedTile === "S" || selectedTile === "G") {
    setUniqueTile(selectedTile, x, y);
  } else {
    grid[y][x] = selectedTile;
  }
  renderGrid();
};

const cellClass = tile => classByTile[tile] || "cell-empty";

const renderGrid = () => {
  const h = grid.length;
  const w = grid[0].length;
  gridEl.style.gridTemplateColumns = `repeat(${w}, 24px)`;
  gridEl.innerHTML = "";
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const tile = grid[y][x];
      const btn = document.createElement("button");
      btn.type = "button";
      const isGroundTop = tile === "#" && (y === 0 || grid[y - 1][x] !== "#");
      const extraClass = tile === "#" ? (isGroundTop ? "cell-ground-top" : "cell-ground-wall") : "";
      btn.className = `cell ${cellClass(tile)} ${extraClass}`.trim();
      btn.textContent = tile;
      btn.dataset.x = String(x);
      btn.dataset.y = String(y);
      gridEl.appendChild(btn);
    }
  }
};

const renderPalette = () => {
  paletteEl.innerHTML = "";
  tileDefs.forEach(def => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tile-btn${selectedTile === def.key ? " is-active" : ""}`;
    btn.dataset.tile = def.key;
    btn.title = `${def.key} - ${def.label}`;
    btn.innerHTML = `
      <span class="tile-key">${def.key}</span>
      <span class="tile-thumb ${def.thumb || "thumb-empty"}" aria-hidden="true"></span>
      <span class="sr-only">${def.label}</span>
    `;
    paletteEl.appendChild(btn);
  });
};

const sanitizeRows = rows => {
  const width = rows.reduce((acc, row) => Math.max(acc, row.length), 1);
  const result = rows.map(row => {
    const chars = row.split("");
    while (chars.length < width) chars.push(".");
    return chars.map(c => (classByTile[c] ? c : "."));
  });
  return result;
};

const isMapArray = value =>
  Array.isArray(value) && value.length > 0 && value.every(row => typeof row === "string");

const isLevelObject = value =>
  Boolean(value) &&
  typeof value === "object" &&
  isMapArray(value.map);

const setStatus = (message, isError = false) => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
};

const applyLevelToEditor = level => {
  grid = sanitizeRows(level.map);
  ensureUnique("S");
  ensureUnique("G");
  nameEl.value = typeof level.name === "string" ? level.name : "Fase Nova";
  timeEl.value = String(Number(level.timeLimit) || 90);
  widthEl.value = String(grid[0].length);
  heightEl.value = String(grid.length);
  renderGrid();
};

const normalizeLooseJson = raw =>
  raw
    .trim()
    .replace(/^\s*export\s+const\s+\w+\s*=\s*/, "")
    .replace(/;\s*$/, "")
    .replace(/,\s*$/, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_][\w-]*)\s*:/g, '$1"$2":')
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) =>
      `"${value.replace(/"/g, '\\"')}"`
    );

const parseImportPayload = raw => {
  const value = raw.trim();
  if (!value) throw new Error("Vazio");
  try {
    return JSON.parse(value);
  } catch {
    return JSON.parse(normalizeLooseJson(value));
  }
};

const normalizeLevel = level => ({
  name: typeof level.name === "string" && level.name.trim() ? level.name.trim() : "Fase Nova",
  timeLimit: Number(level.timeLimit) || 90,
  map: sanitizeRows(level.map).map(row => row.join("")),
});

const syncInMemoryLevels = levels => {
  LEVELS.length = 0;
  levels.forEach(level => LEVELS.push(normalizeLevel(level)));
  populateExistingLevels();
};

const parseLevelsPayload = payload => {
  if (!Array.isArray(payload)) return null;
  const invalidIndex = payload.findIndex(level => !isLevelObject(level));
  if (invalidIndex !== -1) return null;
  return payload.map(normalizeLevel);
};

const loadLocalLevels = () => {
  try {
    const raw = localStorage.getItem(LEVELS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseImportPayload(raw);
    return parseLevelsPayload(parsed);
  } catch {
    return null;
  }
};

const saveLocalLevels = levels => {
  localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify(levels));
};

const getWorkingLevels = () => LEVELS.map(level => normalizeLevel(level));

const saveAsNewLevel = async () => {
  const levels = getWorkingLevels();
  levels.push(normalizeLevel(exportLevelObject()));
  saveLocalLevels(levels);
  syncInMemoryLevels(levels);
  existingLevelEl.value = String(levels.length - 1);
};

const saveSelectedLevel = async () => {
  const index = Number(existingLevelEl.value);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Selecione uma fase existente para sobrescrever.");
  }
  const levels = getWorkingLevels();
  if (!levels[index]) {
    throw new Error("Indice de fase invalido.");
  }
  levels[index] = normalizeLevel(exportLevelObject());
  saveLocalLevels(levels);
  syncInMemoryLevels(levels);
  existingLevelEl.value = String(index);
};

const deleteSelectedLevel = async () => {
  const index = Number(existingLevelEl.value);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Selecione uma fase existente para excluir.");
  }
  const levels = getWorkingLevels();
  if (levels.length <= 1) {
    throw new Error("Nao e possivel excluir a ultima fase.");
  }
  if (!levels[index]) {
    throw new Error("Indice de fase invalido.");
  }
  const removed = levels[index];
  levels.splice(index, 1);
  saveLocalLevels(levels);
  syncInMemoryLevels(levels);
  const nextIndex = Math.min(index, levels.length - 1);
  existingLevelEl.value = String(nextIndex);
  return removed?.name || `#${index + 1}`;
};

const moveSelectedLevel = async () => {
  const fromIndex = Number(existingLevelEl.value);
  if (!Number.isInteger(fromIndex) || fromIndex < 0) {
    throw new Error("Selecione uma fase existente para mover.");
  }
  const rawTarget = Number(moveTargetIndexEl?.value);
  if (!Number.isInteger(rawTarget)) {
    throw new Error("Informe a posicao de destino (ex.: 4).");
  }
  const levels = getWorkingLevels();
  if (!levels[fromIndex]) {
    throw new Error("Indice de fase invalido.");
  }
  const toIndex = Math.max(0, Math.min(levels.length - 1, rawTarget - 1));
  if (toIndex === fromIndex) {
    return { moved: false, toDisplay: toIndex + 1 };
  }
  const [movedLevel] = levels.splice(fromIndex, 1);
  levels.splice(toIndex, 0, movedLevel);
  saveLocalLevels(levels);
  syncInMemoryLevels(levels);
  existingLevelEl.value = String(toIndex);
  return { moved: true, toDisplay: toIndex + 1 };
};

const populateExistingLevels = () => {
  if (!existingLevelEl) return;
  existingLevelEl.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecione uma fase";
  existingLevelEl.appendChild(placeholder);

  LEVELS.forEach((level, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index + 1}. ${level.name} (${level.map[0].length}x${level.map.length})`;
    existingLevelEl.appendChild(option);
  });
};

const ensureUnique = tile => {
  const points = [];
  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x] === tile) points.push({ x, y });
    }
  }
  if (points.length === 0) {
    if (tile === "S") grid[0][0] = "S";
    if (tile === "G") grid[grid.length - 2][grid[0].length - 1] = "G";
    return;
  }
  const keep = points[0];
  for (let i = 1; i < points.length; i += 1) {
    grid[points[i].y][points[i].x] = ".";
  }
  grid[keep.y][keep.x] = tile;
};

const exportMapArray = () => grid.map(row => row.join(""));

const exportLevelObject = () => {
  const level = {
    name: nameEl.value.trim() || "Fase Nova",
    timeLimit: Number(timeEl.value) || 90,
    map: exportMapArray(),
  };
  return level;
};

const actionButtons = [
  resizeGridEl,
  clearGridEl,
  loadExistingLevelEl,
  saveSelectedLevelEl,
  saveNewLevelEl,
  deleteSelectedLevelEl,
  moveSelectedLevelEl,
  resetLocalLevelsEl,
].filter(Boolean);

const setButtonsDisabled = disabled => {
  actionButtons.forEach(button => {
    if (button.classList.contains("is-loading")) return;
    button.disabled = disabled;
  });
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const withButtonLoading = async (button, loadingText, action) => {
  if (!button || editorBusy) return;
  editorBusy = true;
  const originalLabel = button.textContent;
  const startedAt = performance.now();
  button.classList.add("is-loading");
  button.disabled = true;
  button.textContent = loadingText;
  setButtonsDisabled(true);
  try {
    await action();
  } finally {
    const elapsed = performance.now() - startedAt;
    if (elapsed < 260) {
      await wait(260 - elapsed);
    }
    button.classList.remove("is-loading");
    button.textContent = originalLabel;
    editorBusy = false;
    setButtonsDisabled(false);
  }
};

paletteEl.addEventListener("click", event => {
  const btn = event.target.closest("[data-tile]");
  if (!btn) return;
  selectedTile = btn.dataset.tile;
  renderPalette();
});

gridEl.addEventListener("mousedown", event => {
  const cell = event.target.closest(".cell");
  if (!cell) return;
  mouseDown = true;
  paintCell(Number(cell.dataset.x), Number(cell.dataset.y));
});

gridEl.addEventListener("mouseover", event => {
  if (!mouseDown) return;
  const cell = event.target.closest(".cell");
  if (!cell) return;
  paintCell(Number(cell.dataset.x), Number(cell.dataset.y));
});

window.addEventListener("mouseup", () => {
  mouseDown = false;
});

if (resizeGridEl) {
  resizeGridEl.addEventListener("click", () => {
    withButtonLoading(resizeGridEl, "Redimensionando...", async () => {
      const w = Math.max(16, Math.min(120, Number(widthEl.value) || 52));
      const h = Math.max(10, Math.min(40, Number(heightEl.value) || 18));
      const next = Array.from({ length: h }, (_, y) =>
        Array.from({ length: w }, (_, x) => (grid[y] && grid[y][x] ? grid[y][x] : "."))
      );
      grid = next;
      ensureUnique("S");
      ensureUnique("G");
      renderGrid();
    });
  });
}

if (clearGridEl) {
  clearGridEl.addEventListener("click", () => {
    withButtonLoading(clearGridEl, "Limpando...", async () => {
      createGrid(grid[0].length, grid.length);
      renderGrid();
    });
  });
}

if (loadExistingLevelEl) {
  loadExistingLevelEl.addEventListener("click", () => {
    withButtonLoading(loadExistingLevelEl, "Carregando...", async () => {
      const index = Number(existingLevelEl.value);
      if (!Number.isInteger(index) || !LEVELS[index]) {
        setStatus("Selecione uma fase existente para carregar.", true);
        return;
      }
      applyLevelToEditor(LEVELS[index]);
      setStatus(`Fase carregada: ${LEVELS[index].name}`);
    });
  });
}

if (saveNewLevelEl) {
  saveNewLevelEl.addEventListener("click", () => {
    withButtonLoading(saveNewLevelEl, "Salvando...", async () => {
      try {
        await saveAsNewLevel();
        setStatus("Nova fase criada e salva localmente.");
      } catch (error) {
        setStatus(error.message || "Falha ao salvar nova fase.", true);
      }
    });
  });
}

if (saveSelectedLevelEl) {
  saveSelectedLevelEl.addEventListener("click", () => {
    withButtonLoading(saveSelectedLevelEl, "Salvando...", async () => {
      try {
        await saveSelectedLevel();
        setStatus("Fase selecionada atualizada e salva localmente.");
      } catch (error) {
        setStatus(error.message || "Falha ao atualizar fase selecionada.", true);
      }
    });
  });
}

if (deleteSelectedLevelEl) {
  deleteSelectedLevelEl.addEventListener("click", () => {
    withButtonLoading(deleteSelectedLevelEl, "Excluindo...", async () => {
      try {
        const removedName = await deleteSelectedLevel();
        setStatus(`Fase excluida: ${removedName}.`);
      } catch (error) {
        setStatus(error.message || "Falha ao excluir fase.", true);
      }
    });
  });
}

if (moveSelectedLevelEl) {
  moveSelectedLevelEl.addEventListener("click", () => {
    withButtonLoading(moveSelectedLevelEl, "Movendo...", async () => {
      try {
        const result = await moveSelectedLevel();
        if (result.moved) {
          setStatus(`Fase movida para a posicao ${result.toDisplay}.`);
        } else {
          setStatus(`A fase ja esta na posicao ${result.toDisplay}.`);
        }
      } catch (error) {
        setStatus(error.message || "Falha ao mover fase.", true);
      }
    });
  });
}

if (resetLocalLevelsEl) {
  resetLocalLevelsEl.addEventListener("click", () => {
    withButtonLoading(resetLocalLevelsEl, "Restaurando...", async () => {
      localStorage.removeItem(LEVELS_STORAGE_KEY);
      syncInMemoryLevels(defaultLevels);
      existingLevelEl.value = "";
      setStatus("Fases padrao restauradas. Salvamentos locais removidos.");
    });
  });
}

const localLevels = loadLocalLevels();
if (localLevels && localLevels.length) {
  syncInMemoryLevels(localLevels);
  setStatus("Fases locais carregadas automaticamente.");
} else {
  syncInMemoryLevels(defaultLevels);
}

createGrid(52, 18);
renderPalette();
renderGrid();
