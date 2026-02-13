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
  { key: "%", label: "Parede musgo", thumb: "thumb-ground-moss" },
  { key: "@", label: "Parede rachada", thumb: "thumb-ground-crack" },
  { key: "=", label: "Ponte", thumb: "thumb-bridge" },
  { key: "(", label: "Ponte A (subida)", thumb: "thumb-bridge-a" },
  { key: ")", label: "Ponte B (descida)", thumb: "thumb-bridge-b" },
  { key: "^", label: "Espinho / Dano", thumb: "thumb-spike" },
  { key: "C", label: "Moeda", thumb: "thumb-coin" },
  { key: "E", label: "Inimigo", thumb: "thumb-enemy" },
  { key: "D", label: "Porta trancada", thumb: "thumb-door" },
  { key: "B", label: "Bau com chave", thumb: "thumb-chest" },
  { key: "Y", label: "Bau aberto (vazio)", thumb: "thumb-chest-open" },
  { key: "K", label: "Chave", thumb: "thumb-key" },
  { key: "L", label: "Alavanca", thumb: "thumb-switch" },
  { key: "T", label: "Tocha", thumb: "thumb-torch" },
  { key: "H", label: "Corrente", thumb: "thumb-chain" },
  { key: "W", label: "Teia", thumb: "thumb-web" },
  { key: "R", label: "Runa/Bandeira", thumb: "thumb-rune" },
  { key: "O", label: "Barril", thumb: "thumb-barrel" },
  { key: "X", label: "Caixote", thumb: "thumb-crate" },
  { key: "V", label: "Vaso", thumb: "thumb-vase" },
  { key: "M", label: "Cogumelos", thumb: "thumb-mushroom" },
  { key: "I", label: "Janela/Grade", thumb: "thumb-window" },
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
  E: "cell-enemy",
  D: "cell-door",
  B: "cell-chest",
  Y: "cell-chest-open",
  K: "cell-key",
  L: "cell-switch",
  T: "cell-torch",
  H: "cell-chain",
  W: "cell-web",
  R: "cell-rune",
  O: "cell-barrel",
  X: "cell-crate",
  V: "cell-vase",
  M: "cell-mushroom",
  I: "cell-window",
  "=": "cell-bridge",
  "(": "cell-bridge-a",
  ")": "cell-bridge-b",
  "%": "cell-ground-moss",
  "@": "cell-ground-crack",
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
const outputEl = document.querySelector("#output");
const inputEl = document.querySelector("#input");
const chooseLevelsFileEl = document.querySelector("#choose-levels-file");
const saveSelectedLevelEl = document.querySelector("#save-selected-level");
const saveNewLevelEl = document.querySelector("#save-new-level");

let selectedTile = "#";
let mouseDown = false;
let grid = [];
let levelsFileHandle = null;

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

const parseLevelsModuleText = text => {
  const match = text.match(/export\s+const\s+LEVELS\s*=\s*([\s\S]*?);?\s*$/);
  if (!match) throw new Error("Estrutura de levels.js nao reconhecida.");
  const payload = parseImportPayload(match[1]);
  if (!Array.isArray(payload)) throw new Error("LEVELS precisa ser um array.");
  const invalidIndex = payload.findIndex(level => !isLevelObject(level));
  if (invalidIndex !== -1) {
    throw new Error(`Fase invalida no arquivo (indice ${invalidIndex}).`);
  }
  return payload.map(normalizeLevel);
};

const levelsToModuleText = levels => `export const LEVELS = ${JSON.stringify(levels, null, 2)};\n`;

const syncInMemoryLevels = levels => {
  LEVELS.length = 0;
  levels.forEach(level => LEVELS.push(level));
  populateExistingLevels();
};

const ensureFileApiSupport = () => {
  if (typeof window.showOpenFilePicker !== "function") {
    throw new Error("Seu navegador nao suporta salvar direto em arquivo.");
  }
};

const ensureFilePermission = async (handle, mode = "readwrite") => {
  if (!handle) return false;
  const opts = { mode };
  const current = await handle.queryPermission(opts);
  if (current === "granted") return true;
  return (await handle.requestPermission(opts)) === "granted";
};

const chooseLevelsFile = async () => {
  ensureFileApiSupport();
  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: "JavaScript",
        accept: { "text/javascript": [".js"] },
      },
    ],
  });
  if (!handle) throw new Error("Nenhum arquivo selecionado.");
  levelsFileHandle = handle;
  return handle;
};

const getLevelsFileHandle = async () => {
  if (!levelsFileHandle) {
    await chooseLevelsFile();
  }
  const granted = await ensureFilePermission(levelsFileHandle, "readwrite");
  if (!granted) throw new Error("Permissao negada para editar o arquivo.");
  return levelsFileHandle;
};

const readLevelsFromFile = async () => {
  const handle = await getLevelsFileHandle();
  const file = await handle.getFile();
  const text = await file.text();
  return parseLevelsModuleText(text);
};

const writeLevelsToFile = async levels => {
  const handle = await getLevelsFileHandle();
  const writable = await handle.createWritable();
  await writable.write(levelsToModuleText(levels));
  await writable.close();
};

const saveAsNewLevel = async () => {
  const levels = await readLevelsFromFile();
  levels.push(normalizeLevel(exportLevelObject()));
  await writeLevelsToFile(levels);
  syncInMemoryLevels(levels);
  existingLevelEl.value = String(levels.length - 1);
};

const saveSelectedLevel = async () => {
  const index = Number(existingLevelEl.value);
  if (!Number.isInteger(index) || index < 0) {
    throw new Error("Selecione uma fase existente para sobrescrever.");
  }
  const levels = await readLevelsFromFile();
  if (!levels[index]) {
    throw new Error("Indice de fase invalido no arquivo.");
  }
  levels[index] = normalizeLevel(exportLevelObject());
  await writeLevelsToFile(levels);
  syncInMemoryLevels(levels);
  existingLevelEl.value = String(index);
};

const resolveImportedLevel = payload => {
  if (isMapArray(payload)) {
    return { name: nameEl.value.trim() || "Fase Nova", timeLimit: Number(timeEl.value) || 90, map: payload };
  }
  if (isLevelObject(payload)) {
    return payload;
  }
  if (Array.isArray(payload)) {
    const first = payload.find(isLevelObject);
    if (first) return first;
  }
  throw new Error("Formato invalido");
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

document.querySelector("#resize-grid").addEventListener("click", () => {
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

document.querySelector("#clear-grid").addEventListener("click", () => {
  createGrid(grid[0].length, grid.length);
  renderGrid();
});

document.querySelector("#export-map").addEventListener("click", () => {
  outputEl.value = JSON.stringify(exportMapArray(), null, 2);
});

document.querySelector("#export-level").addEventListener("click", () => {
  outputEl.value = `${JSON.stringify(exportLevelObject(), null, 2)},`;
});

document.querySelector("#copy-output").addEventListener("click", async () => {
  if (!outputEl.value.trim()) return;
  try {
    await navigator.clipboard.writeText(outputEl.value);
  } catch {
    outputEl.select();
    document.execCommand("copy");
  }
});

document.querySelector("#import-map").addEventListener("click", () => {
  const raw = inputEl.value.trim();
  if (!raw) return;
  try {
    const payload = parseImportPayload(raw);
    const level = resolveImportedLevel(payload);
    applyLevelToEditor(level);
    setStatus(`Fase carregada: ${nameEl.value}`);
  } catch {
    setStatus("Nao foi possivel importar. Use map[], objeto de fase ou array de fases.", true);
  }
});

if (loadExistingLevelEl) {
  loadExistingLevelEl.addEventListener("click", () => {
    const index = Number(existingLevelEl.value);
    if (!Number.isInteger(index) || !LEVELS[index]) {
      setStatus("Selecione uma fase existente para carregar.", true);
      return;
    }
    applyLevelToEditor(LEVELS[index]);
    setStatus(`Fase carregada de levels.js: ${LEVELS[index].name}`);
  });
}

if (chooseLevelsFileEl) {
  chooseLevelsFileEl.addEventListener("click", async () => {
    try {
      const handle = await chooseLevelsFile();
      setStatus(`Arquivo selecionado: ${handle.name}`);
    } catch (error) {
      setStatus(error.message || "Nao foi possivel selecionar levels.js.", true);
    }
  });
}

if (saveNewLevelEl) {
  saveNewLevelEl.addEventListener("click", async () => {
    try {
      await saveAsNewLevel();
      setStatus("Nova fase salva no levels.js.");
    } catch (error) {
      setStatus(error.message || "Falha ao salvar nova fase.", true);
    }
  });
}

if (saveSelectedLevelEl) {
  saveSelectedLevelEl.addEventListener("click", async () => {
    try {
      await saveSelectedLevel();
      setStatus("Fase selecionada atualizada no levels.js.");
    } catch (error) {
      setStatus(error.message || "Falha ao atualizar fase selecionada.", true);
    }
  });
}

createGrid(52, 18);
populateExistingLevels();
renderPalette();
renderGrid();
