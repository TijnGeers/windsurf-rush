// ═══════════════════════════════════════════════════════════════
//  WINDSURF RUSH — upgraded edition
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// DOM refs
const hudScore = document.getElementById("hud-score");
const hudCombo = document.getElementById("hud-combo");
const hudCoins = document.getElementById("hud-coins");
const hudHearts = document.getElementById("hud-hearts");
const dashBar = document.getElementById("dash-bar");
const hudPowerup = document.getElementById("hud-powerup");
const overlayEl = document.getElementById("overlay");
const gameoverEl = document.getElementById("gameoverOverlay");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const shopOverlay = document.getElementById("shopOverlay");
const muteBtn = document.getElementById("muteBtn");

// ═══════════════════════════════════════════════════════════════
//  BACKGROUND MUSIC
// ═══════════════════════════════════════════════════════════════
const musicTracks = [
  document.getElementById("music1"),
  document.getElementById("music2")
];
let currentTrack = 0;
let musicMuted = false;

for (const track of musicTracks) {
  track.volume = 0.35;
  track.preload = "auto";
}

musicTracks[0].addEventListener("ended", () => { playTrack(1); });
musicTracks[1].addEventListener("ended", () => { playTrack(0); });

function playTrack(index) {
  musicTracks[1 - index].pause();
  currentTrack = index;
  if (!musicMuted) {
    musicTracks[index].currentTime = 0;
    musicTracks[index].play().catch(() => {});
  }
}

function startMusic() {
  if (!musicMuted) {
    musicTracks[currentTrack].play().catch(() => {});
  }
}

function pauseMusic() {
  musicTracks[currentTrack].pause();
}

function resumeMusic() {
  if (!musicMuted) {
    musicTracks[currentTrack].play().catch(() => {});
  }
}

function toggleMute() {
  musicMuted = !musicMuted;
  if (musicMuted) {
    musicTracks[currentTrack].pause();
    muteBtn.textContent = "🔇";
  } else {
    musicTracks[currentTrack].play().catch(() => {});
    muteBtn.textContent = "🔊";
  }
}

if (muteBtn) muteBtn.addEventListener("click", toggleMute);

// Auto-start music on first user interaction (browsers block autoplay)
let musicStarted = false;
function tryAutoStartMusic() {
  if (!musicStarted && !musicMuted) {
    musicTracks[currentTrack].play().then(() => { musicStarted = true; }).catch(() => {});
  }
}
document.addEventListener("click", tryAutoStartMusic, { once: false });
document.addEventListener("touchstart", tryAutoStartMusic, { once: false });

// Pause music when leaving page, resume when coming back
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseMusic();
  } else if (!musicMuted && musicStarted) {
    resumeMusic();
  }
});

// ═══════════════════════════════════════════════════════════════
//  SAVE SYSTEM (localStorage)
// ═══════════════════════════════════════════════════════════════
const SAVE_KEY = "windsurf_rush_save";

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (!s.username) s.username = "";
      if (!s.highScore) s.highScore = 0;
      if (!s.totalCoinsEarned) s.totalCoinsEarned = s.coins || 0;
      if (!s.ownedWorlds) s.ownedWorlds = ["ocean"];
      if (!s.activeWorld) s.activeWorld = "ocean";
      return s;
    }
  } catch (_) {}
  return { coins: 0, ownedSkins: ["default"], activeSkin: "default", username: "", highScore: 0, totalCoinsEarned: 0, ownedWorlds: ["ocean"], activeWorld: "ocean" };
}

function writeSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

let save = loadSave();

// ═══════════════════════════════════════════════════════════════
//  SKINS
// ═══════════════════════════════════════════════════════════════
const SKINS = [
  {
    id: "default", name: "Classic", price: 0, coinMultiplier: 1.0,
    board: ["#ffd43b", "#ffe066", "#ff922b"],
    sail: ["rgba(255,255,255,0.92)", "rgba(77,217,255,0.7)", "rgba(255,107,157,0.6)"],
    body: "#ff6b9d", trail: "#4dd9ff"
  },
  {
    id: "fire", name: "Inferno", price: 50, coinMultiplier: 1.1,
    board: ["#ff4500", "#ff6a00", "#ff0000"],
    sail: ["rgba(255,100,0,0.92)", "rgba(255,200,0,0.7)", "rgba(255,50,0,0.6)"],
    body: "#ff3333", trail: "#ff6600"
  },
  {
    id: "ice", name: "Frostbite", price: 80, coinMultiplier: 1.2,
    board: ["#a5d8ff", "#d0ebff", "#74c0fc"],
    sail: ["rgba(208,235,255,0.92)", "rgba(116,192,252,0.7)", "rgba(77,171,247,0.6)"],
    body: "#74c0fc", trail: "#d0ebff"
  },
  {
    id: "neon", name: "Neon Rider", price: 120, coinMultiplier: 1.3,
    board: ["#00ff88", "#00ffcc", "#00ff44"],
    sail: ["rgba(0,255,136,0.92)", "rgba(0,255,204,0.7)", "rgba(255,0,255,0.6)"],
    body: "#ff00ff", trail: "#00ff88"
  },
  {
    id: "sunset", name: "Sunset Surf", price: 180, coinMultiplier: 1.4,
    board: ["#ff6b6b", "#ffa94d", "#ffd43b"],
    sail: ["rgba(255,169,77,0.92)", "rgba(255,107,107,0.7)", "rgba(255,212,59,0.6)"],
    body: "#ff8c42", trail: "#ffa94d"
  },
  {
    id: "gold", name: "Golden Wave", price: 250, coinMultiplier: 1.5,
    board: ["#fcc419", "#ffe066", "#f59f00"],
    sail: ["rgba(252,196,25,0.92)", "rgba(255,224,102,0.7)", "rgba(245,159,0,0.6)"],
    body: "#fcc419", trail: "#ffe066"
  },
  {
    id: "toxic", name: "Toxic Tide", price: 350, coinMultiplier: 1.6,
    board: ["#2b8a3e", "#51cf66", "#087f23"],
    sail: ["rgba(81,207,102,0.92)", "rgba(43,138,62,0.7)", "rgba(8,127,35,0.6)"],
    body: "#40c057", trail: "#69db7c"
  },
  {
    id: "shadow", name: "Shadow Phantom", price: 450, coinMultiplier: 1.8,
    board: ["#5c2d91", "#7c3aed", "#3b0764"],
    sail: ["rgba(124,58,237,0.92)", "rgba(92,45,145,0.7)", "rgba(59,7,100,0.6)"],
    body: "#7c3aed", trail: "#a855f7"
  },
  {
    id: "coral", name: "Coral Reef", price: 600, coinMultiplier: 2.0,
    board: ["#ff6b6b", "#ff8787", "#e64980"],
    sail: ["rgba(255,135,135,0.92)", "rgba(230,73,128,0.7)", "rgba(255,107,107,0.6)"],
    body: "#e64980", trail: "#ff8787"
  },
  {
    id: "ocean", name: "Ocean King", price: 800, coinMultiplier: 2.2,
    board: ["#0077b6", "#00b4d8", "#023e8a"],
    sail: ["rgba(0,180,216,0.92)", "rgba(0,119,182,0.7)", "rgba(2,62,138,0.6)"],
    body: "#0096c7", trail: "#48cae4"
  },
  {
    id: "galaxy", name: "Galaxy Rider", price: 1000, coinMultiplier: 2.5,
    board: ["#240046", "#7b2cbf", "#e0aaff"],
    sail: ["rgba(224,170,255,0.92)", "rgba(123,44,191,0.7)", "rgba(36,0,70,0.6)"],
    body: "#9d4edd", trail: "#e0aaff"
  },
  {
    id: "storm", name: "Storm Chaser", price: 1200, coinMultiplier: 2.7,
    board: ["#343a40", "#868e96", "#212529"],
    sail: ["rgba(134,142,150,0.92)", "rgba(52,58,64,0.7)", "rgba(33,37,41,0.6)"],
    body: "#495057", trail: "#ced4da"
  },
  {
    id: "diamond", name: "Diamond", price: 1500, coinMultiplier: 3.0,
    board: ["#b8f2e6", "#e8fffe", "#89d0c7"],
    sail: ["rgba(232,255,254,0.92)", "rgba(184,242,230,0.7)", "rgba(137,208,199,0.6)"],
    body: "#b8f2e6", trail: "#e8fffe"
  },
  {
    id: "phantomgold", name: "Phantom Gold", price: 2000, coinMultiplier: 3.2,
    board: ["#1a1a2e", "#ffd700", "#1a1a2e"],
    sail: ["rgba(255,215,0,0.92)", "rgba(26,26,46,0.7)", "rgba(255,215,0,0.6)"],
    body: "#ffd700", trail: "#ffed4a"
  },
  {
    id: "dragon", name: "Dragon", price: 2500, coinMultiplier: 3.5,
    board: ["#8b0000", "#ff2400", "#4a0000"],
    sail: ["rgba(255,36,0,0.92)", "rgba(139,0,0,0.7)", "rgba(74,0,0,0.6)"],
    body: "#c41e3a", trail: "#ff4500"
  }
];

function getActiveSkin() {
  return SKINS.find(s => s.id === save.activeSkin) || SKINS[0];
}

// ═══════════════════════════════════════════════════════════════
//  WORLDS
// ═══════════════════════════════════════════════════════════════
const WORLDS = [
  {
    id: "ocean", name: "Oceaan", price: 0, coinMultiplier: 1,
    description: "De klassieke blauwe oceaan",
    sky: { start: ["#ffa94d", "#ff6b9d", "#4dabf7"], end: ["#1a1040", "#0d1b3e", "#0a2540"] },
    ocean: { start: ["#4dabf7", "#1c7ed6", "#0b4d8a"], end: ["#0a3060", "#072040", "#030d1a"] },
    sunColor: "#ffe066", sunGlow: "rgba(255,224,102,0.15)",
    waveAlpha: 0.06, buoyColor: "#ff6b35", rockColor: "#4a4a5a",
    sharkColor: "#555570", sharkGlow: ""
  },
  {
    id: "lava", name: "Vulkaan", price: 5000, coinMultiplier: 2,
    description: "Surf over gloeiende lava! (x2 coins)",
    sky: { start: ["#4a0000", "#8b0000", "#1a0000"], end: ["#0a0000", "#050000", "#020000"] },
    ocean: { start: ["#ff4500", "#cc3700", "#8b0000"], end: ["#4a0000", "#2d0000", "#1a0000"] },
    sunColor: "#ff6600", sunGlow: "rgba(255,102,0,0.2)",
    waveAlpha: 0.08, buoyColor: "#ffd43b", rockColor: "#1a1a1a",
    sharkColor: "#ff4500", sharkGlow: "#ff6600"
  }
];

function getActiveWorld() {
  return WORLDS.find(w => w.id === save.activeWorld) || WORLDS[0];
}

// ═══════════════════════════════════════════════════════════════
//  SHOP UI
// ═══════════════════════════════════════════════════════════════
function renderShop() {
  const grid = document.getElementById("skin-grid");
  grid.innerHTML = "";
  document.getElementById("shop-coins").textContent = save.coins;

  for (const skin of SKINS) {
    const owned = save.ownedSkins.includes(skin.id);
    const active = save.activeSkin === skin.id;

    const card = document.createElement("div");
    card.className = "skin-card" + (active ? " active" : "");

    // Mini preview canvas
    const preview = document.createElement("canvas");
    preview.className = "skin-preview";
    preview.width = 60;
    preview.height = 60;
    drawSkinPreview(preview, skin);

    const name = document.createElement("div");
    name.className = "skin-name";
    name.textContent = skin.name;

    const multiplier = document.createElement("div");
    multiplier.className = "skin-multiplier";
    multiplier.textContent = `x${skin.coinMultiplier} coins`;

    const price = document.createElement("div");
    price.className = "skin-price" + (owned ? " owned" : "");
    price.textContent = owned ? "Unlocked" : `${skin.price} coins`;

    const btn = document.createElement("button");
    btn.className = "skin-buy-btn";

    if (active) {
      btn.textContent = "ACTIEF";
      btn.disabled = true;
      btn.className += " equip";
    } else if (owned) {
      btn.textContent = "GEBRUIK";
      btn.className += " equip";
      btn.addEventListener("click", () => {
        save.activeSkin = skin.id;
        writeSave(save);
        renderShop();
      });
    } else {
      btn.textContent = "KOOP";
      btn.disabled = save.coins < skin.price;
      btn.addEventListener("click", () => {
        if (save.coins >= skin.price) {
          save.coins -= skin.price;
          save.ownedSkins.push(skin.id);
          save.activeSkin = skin.id;
          writeSave(save);
          updateCoinDisplays();
          renderShop();
        }
      });
    }

    card.append(preview, name, multiplier, price, btn);
    grid.appendChild(card);
  }
}

function drawSkinPreview(cvs, skin) {
  const c = cvs.getContext("2d");
  c.clearRect(0, 0, 60, 60);
  // Board
  const bg = c.createLinearGradient(5, 30, 55, 30);
  bg.addColorStop(0, skin.board[0]);
  bg.addColorStop(0.5, skin.board[1]);
  bg.addColorStop(1, skin.board[2]);
  c.fillStyle = bg;
  c.beginPath();
  c.ellipse(30, 38, 24, 7, 0, 0, TAU);
  c.fill();
  // Body
  c.fillStyle = skin.body;
  c.beginPath();
  c.arc(30, 26, 7, 0, TAU);
  c.fill();
  // Head
  c.fillStyle = skin.head || "#fce4c4";
  c.beginPath();
  c.arc(30, 16, 5, 0, TAU);
  c.fill();
  // Sail
  const sg = c.createLinearGradient(33, 4, 50, 24);
  sg.addColorStop(0, skin.sail[0]);
  sg.addColorStop(0.5, skin.sail[1]);
  sg.addColorStop(1, skin.sail[2]);
  c.fillStyle = sg;
  c.beginPath();
  c.moveTo(33, 5);
  c.lineTo(52, 24);
  c.lineTo(33, 24);
  c.closePath();
  c.fill();
  // Mast
  c.strokeStyle = "#1a1a2e";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(33, 24);
  c.lineTo(33, 5);
  c.stroke();
}

let shopOpenedFromGameOver = false;

function openShop() {
  renderShop();
  shopOpenedFromGameOver = !gameoverEl.classList.contains("hidden");
  gameoverEl.classList.add("hidden");
  shopOverlay.classList.remove("hidden");
}

function closeShop() {
  shopOverlay.classList.add("hidden");
  if (shopOpenedFromGameOver) {
    gameoverEl.classList.remove("hidden");
    shopOpenedFromGameOver = false;
  }
}

function updateCoinDisplays() {
  document.getElementById("menu-coins").textContent = save.coins;
  document.getElementById("shop-coins").textContent = save.coins;
  hudCoins.textContent = save.coins;
}

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener("resize", resize);
resize();

// ── Input ──
const keys = new Set();
window.addEventListener("keydown", e => {
  keys.add(e.key.toLowerCase());
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase()) ||
      e.key === " ") e.preventDefault();
  if (e.key === "Escape" && G && G.running !== undefined) togglePause();
});
window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));

// ── Touch Input ──
const touch = { active: false, startX: 0, startY: 0, dx: 0, dy: 0, dashRequested: false };
const TOUCH_DEAD_ZONE = 10;
const TOUCH_MAX_DIST = 80;

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  const t = e.touches[0];
  touch.active = true;
  touch.startX = t.clientX;
  touch.startY = t.clientY;
  touch.dx = 0;
  touch.dy = 0;
}, { passive: false });

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!touch.active) return;
  const t = e.touches[0];
  touch.dx = t.clientX - touch.startX;
  touch.dy = t.clientY - touch.startY;
}, { passive: false });

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  touch.active = false;
  touch.dx = 0;
  touch.dy = 0;
}, { passive: false });

// Dash button for mobile
const dashBtnEl = document.getElementById("dashBtn");
if (dashBtnEl) {
  dashBtnEl.addEventListener("touchstart", e => {
    e.preventDefault();
    e.stopPropagation();
    touch.dashRequested = true;
  }, { passive: false });
}

// ── Helpers ──
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, t) => a + (b - a) * t;

// ═══════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════
let G;

function initGame() {
  G = {
    running: false,
    t: 0,
    score: 0,
    combo: 1,
    bestCombo: 1,
    comboTimer: 0,
    baseSpeed: ("ontouchstart" in window) ? 1.7 : 1.2,
    speed: ("ontouchstart" in window) ? 1.7 : 1.2,
    spawnTimer: 0,
    orbTimer: 40,
    coinOrbTimer: 200,
    powerupTimer: 600,

    // Sky gradient shift
    dayPhase: 0,

    shake: { x: 0, y: 0, intensity: 0 },

    paused: false,

    player: {
      x: 180,
      y: canvas.height * 0.65,
      radius: 18,
      vx: 0,
      vy: 0,
      hp: 3,
      maxHp: 3,
      invincible: 0,
      // Dash
      dashCooldown: 0,
      dashMaxCooldown: 90,
      dashing: 0,
      dashVx: 0,
      dashVy: 0,
      // Powerups
      shieldTimer: 0,
      magnetTimer: 0,
      turboTimer: 0,
      doubleTimer: 0,
      trail: []
    },

    coinsThisRound: 0,

    obstacles: [],
    orbs: [],
    powerups: [],
    particles: [],
    splashes: [],
    texts: [],
    clouds: [],
    waveLines: []
  };

  // Pre-generate clouds
  for (let i = 0; i < 8; i++) {
    G.clouds.push({
      x: rand(0, canvas.width * 1.5),
      y: rand(10, canvas.height * 0.25),
      w: rand(80, 200),
      h: rand(24, 50),
      speed: rand(0.3, 0.8),
      opacity: rand(0.04, 0.12)
    });
  }
}

// ── Screenshake ──
function addShake(n) { G.shake.intensity = Math.min(G.shake.intensity + n, 20); }
function updateShake() {
  if (G.shake.intensity > 0.2) {
    G.shake.x = rand(-1, 1) * G.shake.intensity;
    G.shake.y = rand(-1, 1) * G.shake.intensity;
    G.shake.intensity *= 0.85;
  } else { G.shake.x = 0; G.shake.y = 0; G.shake.intensity = 0; }
}

// ── Particles ──
function burst(x, y, color, count = 14, speed = 4) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, TAU);
    const v = rand(0.5, speed);
    G.particles.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      life: rand(20, 45), maxLife: 45,
      radius: rand(2, 5), color
    });
  }
}

function splash(x, y) {
  for (let i = 0; i < 6; i++) {
    G.splashes.push({
      x, y: y + rand(-4, 4),
      vx: rand(-3, -0.5),
      vy: rand(-3, 1),
      life: rand(15, 30),
      maxLife: 30,
      radius: rand(2, 4)
    });
  }
}

function floatingText(x, y, text, color) {
  G.texts.push({ x, y, text, color, life: 55, maxLife: 55 });
}

// ═══════════════════════════════════════════════════════════════
//  OBSTACLE TYPES
// ═══════════════════════════════════════════════════════════════
// type: "buoy" | "rock" | "shark"
function spawnObstacle() {
  const types = ["buoy", "buoy", "buoy", "rock", "rock"];
  if (G.t > 600) types.push("shark", "shark");
  if (G.t > 1200) types.push("shark");
  const type = types[randInt(0, types.length - 1)];

  let radius, speed;
  if (type === "buoy") { radius = rand(16, 28); speed = 0; }
  else if (type === "rock") { radius = rand(22, 38); speed = 0; }
  else { radius = 18; speed = rand(0.6, 1.6); }

  const oceanTop = canvas.height * 0.48;
  G.obstacles.push({
    x: canvas.width + radius + 40,
    y: rand(oceanTop + 20, canvas.height - 60),
    radius, type, speed,
    wobble: rand(0, TAU),
    angle: 0,
    passed: false
  });
}

// ═══════════════════════════════════════════════════════════════
//  ORBS & POWERUPS
// ═══════════════════════════════════════════════════════════════
function spawnOrb() {
  const oceanTop = canvas.height * 0.48;
  G.orbs.push({
    x: canvas.width + 20,
    y: rand(oceanTop + 15, canvas.height - 50),
    radius: 12, pulse: rand(0, TAU), type: "score"
  });
}

function spawnCoinOrb() {
  const oceanTop = canvas.height * 0.48;
  G.orbs.push({
    x: canvas.width + 20,
    y: rand(oceanTop + 15, canvas.height - 50),
    radius: 14, pulse: rand(0, TAU), type: "coin"
  });
}

const PU_TYPES = ["shield", "magnet", "turbo", "double", "heal"];
const PU_COLORS = { shield: "#4dd9ff", magnet: "#c084fc", turbo: "#ffd43b", double: "#69db7c", heal: "#ff6b9d" };
const PU_ICONS = { shield: "🛡", magnet: "🧲", turbo: "⚡", double: "✖2", heal: "❤" };

function spawnPowerup() {
  const type = PU_TYPES[randInt(0, PU_TYPES.length - 1)];
  const oceanTop = canvas.height * 0.48;
  G.powerups.push({
    x: canvas.width + 20,
    y: rand(oceanTop + 15, canvas.height - 60),
    radius: 16, type,
    color: PU_COLORS[type],
    pulse: 0
  });
}

function collectPowerup(pu) {
  const p = G.player;
  switch (pu.type) {
    case "shield": p.shieldTimer = 360; break;
    case "magnet": p.magnetTimer = 420; break;
    case "turbo": p.turboTimer = 300; G.baseSpeed += 0.5; break;
    case "double": p.doubleTimer = 360; break;
    case "heal": p.hp = Math.min(p.hp + 1, p.maxHp); break;
  }
  floatingText(pu.x, pu.y - 20, PU_ICONS[pu.type] + " " + pu.type.toUpperCase(), pu.color);
  burst(pu.x, pu.y, pu.color, 16, 5);
  addShake(2);
}

// ═══════════════════════════════════════════════════════════════
//  DASH
// ═══════════════════════════════════════════════════════════════
function tryDash() {
  const p = G.player;
  if (p.dashCooldown > 0 || p.dashing > 0) return;
  let dx = 0, dy = 0;
  if (keys.has("d") || keys.has("arrowright")) dx += 1;
  if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
  if (keys.has("s") || keys.has("arrowdown")) dy += 1;
  if (keys.has("w") || keys.has("arrowup")) dy -= 1;
  // Use touch direction if available
  if (dx === 0 && dy === 0 && touch.active) {
    const len = Math.hypot(touch.dx, touch.dy);
    if (len > TOUCH_DEAD_ZONE) { dx = touch.dx / len; dy = touch.dy / len; }
  }
  if (dx === 0 && dy === 0) dx = 1; // default forward
  const len = Math.hypot(dx, dy) || 1;
  p.dashVx = (dx / len) * 18;
  p.dashVy = (dy / len) * 18;
  p.dashing = 10;
  p.dashCooldown = p.dashMaxCooldown;
  p.invincible = Math.max(p.invincible, 12);
  addShake(4);
  burst(p.x, p.y, "#4dd9ff", 10, 6);
}

// ═══════════════════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════════════════
let dashKeyReleased = true;

function update() {
  G.t += 1;
  G.dayPhase = Math.min(1, G.t / 4000);
  G.speed = G.baseSpeed + G.t * 0.001;

  const p = G.player;

  // ── Player movement ──
  let ax = 0, ay = 0;
  if (keys.has("d") || keys.has("arrowright")) ax += 1;
  if (keys.has("a") || keys.has("arrowleft")) ax -= 1;
  if (keys.has("s") || keys.has("arrowdown")) ay += 1;
  if (keys.has("w") || keys.has("arrowup")) ay -= 1;

  // Touch input (virtual joystick)
  if (touch.active) {
    const len = Math.hypot(touch.dx, touch.dy);
    if (len > TOUCH_DEAD_ZONE) {
      const norm = Math.min(len, TOUCH_MAX_DIST) / TOUCH_MAX_DIST;
      ax += (touch.dx / len) * norm;
      ay += (touch.dy / len) * norm;
    }
  }

  // Dash input (keyboard)
  if (keys.has(" ")) {
    if (dashKeyReleased) { tryDash(); dashKeyReleased = false; }
  } else { dashKeyReleased = true; }

  // Dash input (touch)
  if (touch.dashRequested) {
    tryDash();
    touch.dashRequested = false;
  }

  if (p.dashing > 0) {
    p.vx = p.dashVx;
    p.vy = p.dashVy;
    p.dashing -= 1;
    // Dash trail
    for (let i = 0; i < 3; i++) {
      G.particles.push({
        x: p.x + rand(-8, 8), y: p.y + rand(-8, 8),
        vx: rand(-2, -0.5), vy: rand(-1, 1),
        life: 15, maxLife: 15, radius: rand(3, 6), color: getActiveSkin().trail
      });
    }
  } else {
    p.vx = (p.vx + ax * 0.6) * 0.86;
    p.vy = (p.vy + ay * 0.6) * 0.86;
  }

  const oceanTop = canvas.height * 0.48;
  p.x = clamp(p.x + p.vx, 30, canvas.width - 30);
  p.y = clamp(p.y + p.vy, oceanTop, canvas.height - 40);

  if (p.dashCooldown > 0) p.dashCooldown -= 1;
  if (p.invincible > 0) p.invincible -= 1;
  if (p.shieldTimer > 0) p.shieldTimer -= 1;
  if (p.magnetTimer > 0) p.magnetTimer -= 1;
  if (p.turboTimer > 0) { p.turboTimer -= 1; if (p.turboTimer <= 0) G.baseSpeed = Math.max(1.5, G.baseSpeed - 0.5); }
  if (p.doubleTimer > 0) p.doubleTimer -= 1;

  // Trail
  if (G.t % 2 === 0) {
    p.trail.push({ x: p.x - 10, y: p.y + 8, life: 18 });
    splash(p.x - 20, p.y + 12);
  }
  for (const t of p.trail) t.life -= 1;
  p.trail = p.trail.filter(t => t.life > 0);

  // Combo decay
  if (G.comboTimer > 0) { G.comboTimer -= 1; if (G.comboTimer <= 0) G.combo = 1; }

  // ── Spawning ──
  G.spawnTimer -= 1;
  if (G.spawnTimer <= 0) {
    spawnObstacle();
    G.spawnTimer = Math.max(22, 70 - G.t / 80);
  }
  G.orbTimer -= 1;
  if (G.orbTimer <= 0) { spawnOrb(); G.orbTimer = rand(60, 120); }
  G.coinOrbTimer -= 1;
  if (G.coinOrbTimer <= 0) { spawnCoinOrb(); G.coinOrbTimer = rand(180, 350); }
  G.powerupTimer -= 1;
  if (G.powerupTimer <= 0) { spawnPowerup(); G.powerupTimer = rand(500, 800); }

  // ── Update obstacles ──
  for (const o of G.obstacles) {
    o.x -= G.speed;
    if (o.type === "buoy") o.y += Math.sin(G.t / 16 + o.wobble) * 0.8;
    if (o.type === "shark") {
      o.y += Math.sin(G.t / 12 + o.wobble) * 1.8;
      o.angle = Math.sin(G.t / 20 + o.wobble) * 0.2;
      o.x -= o.speed;
    }

    // Near-miss detection
    if (!o.passed && o.x < p.x - p.radius - o.radius) {
      o.passed = true;
      const gap = dist(p, o) - p.radius - o.radius;
      if (gap < 20 && gap > -5 && p.invincible <= 0) {
        const bonus = 25 * G.combo;
        G.score += bonus;
        G.combo += 1;
        G.comboTimer = 120;
        if (G.combo > G.bestCombo) G.bestCombo = G.combo;
        G.coinsThisRound += 1;
        floatingText(p.x, p.y - 30, `CLOSE! +${bonus}`, "#ffd43b");
        burst(p.x, p.y, "#ffd43b", 6, 2);
      }
    }
  }
  G.obstacles = G.obstacles.filter(o => o.x > -80);

  // ── Update orbs ──
  for (const o of G.orbs) {
    o.x -= G.speed * 0.9;
    o.pulse += 0.1;
    // Magnet effect
    if (p.magnetTimer > 0) {
      const d = dist(o, p);
      if (d < 200) {
        const pull = 4 * (1 - d / 200);
        const a = Math.atan2(p.y - o.y, p.x - o.x);
        o.x += Math.cos(a) * pull;
        o.y += Math.sin(a) * pull;
      }
    }
  }
  G.orbs = G.orbs.filter(o => o.x > -30);

  // ── Update powerups ──
  for (const pu of G.powerups) { pu.x -= G.speed * 0.7; pu.pulse += 0.06; }
  G.powerups = G.powerups.filter(pu => pu.x > -30);

  // ── Collisions: obstacles ──
  if (p.invincible <= 0) {
    for (const o of G.obstacles) {
      if (dist(p, o) < p.radius + o.radius - 4) {
        if (p.shieldTimer > 0) {
          p.shieldTimer = 0;
          burst(p.x, p.y, "#4dd9ff", 20, 6);
          addShake(6);
          floatingText(p.x, p.y - 30, "SHIELD BREAK!", "#4dd9ff");
          p.invincible = 40;
        } else {
          p.hp -= 1;
          p.invincible = 60;
          G.combo = 1;
          addShake(10);
          burst(p.x, p.y, "#ff6b6b", 20, 6);
          if (p.hp <= 0) { gameOver(); return; }
        }
        break;
      }
    }
  }

  // ── Collect orbs ──
  G.orbs = G.orbs.filter(o => {
    if (dist(p, o) < p.radius + o.radius + 4) {
      if (o.type === "coin") {
        const coins = 5;
        G.coinsThisRound += coins;
        G.combo += 1;
        G.comboTimer = 120;
        if (G.combo > G.bestCombo) G.bestCombo = G.combo;
        floatingText(o.x, o.y - 16, `+${coins} 🪙`, "#4dabf7");
        burst(o.x, o.y, "#4dabf7", 12, 4);
      } else {
        const pts = (p.doubleTimer > 0 ? 20 : 10) * G.combo;
        G.score += pts;
        G.combo += 1;
        G.comboTimer = 120;
        G.coinsThisRound += 1;
        if (G.combo > G.bestCombo) G.bestCombo = G.combo;
        floatingText(o.x, o.y - 16, `+${pts}`, "#69db7c");
        burst(o.x, o.y, "#69db7c", 10, 4);
      }
      return false;
    }
    return true;
  });

  // ── Collect powerups ──
  G.powerups = G.powerups.filter(pu => {
    if (dist(p, pu) < p.radius + pu.radius + 6) {
      collectPowerup(pu);
      return false;
    }
    return true;
  });

  // ── Particles ──
  for (const pt of G.particles) {
    pt.x += pt.vx; pt.y += pt.vy;
    pt.vx *= 0.95; pt.vy *= 0.95;
    pt.life -= 1;
  }
  G.particles = G.particles.filter(pt => pt.life > 0);

  for (const s of G.splashes) {
    s.x += s.vx; s.y += s.vy; s.vy += 0.12;
    s.life -= 1;
  }
  G.splashes = G.splashes.filter(s => s.life > 0);

  for (const ft of G.texts) { ft.y -= 0.8; ft.life -= 1; }
  G.texts = G.texts.filter(ft => ft.life > 0);

  // Clouds
  for (const c of G.clouds) {
    c.x -= c.speed + G.speed * 0.15;
    if (c.x + c.w < 0) { c.x = canvas.width + rand(20, 200); c.y = rand(10, canvas.height * 0.25); }
  }

  // Passive score
  if (G.t % 60 === 0) G.score += 1;

  // ── HUD ──
  hudScore.textContent = G.score.toLocaleString();
  hudCombo.textContent = `x${G.combo}`;
  hudCoins.textContent = save.coins + G.coinsThisRound;
  dashBar.style.width = `${Math.max(0, (1 - p.dashCooldown / p.dashMaxCooldown) * 100)}%`;

  let hearts = "";
  for (let i = 0; i < p.maxHp; i++) hearts += i < p.hp ? "❤️" : "🖤";
  hudHearts.innerHTML = hearts;

  const active = [];
  if (p.shieldTimer > 0) active.push("🛡 Shield");
  if (p.magnetTimer > 0) active.push("🧲 Magnet");
  if (p.turboTimer > 0) active.push("⚡ Turbo");
  if (p.doubleTimer > 0) active.push("x2 Double");
  hudPowerup.textContent = active.join("  ");

  updateShake();
}

// ═══════════════════════════════════════════════════════════════
//  DRAWING
// ═══════════════════════════════════════════════════════════════

function drawSky() {
  const world = getActiveWorld();
  // Transition from sunset to night
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.55);
  const phase = G.dayPhase;
  if (phase < 0.5) {
    grad.addColorStop(0, lerpColor(world.sky.start[0], world.sky.end[0], phase * 2));
    grad.addColorStop(0.5, lerpColor(world.sky.start[1], world.sky.end[1], phase * 2));
    grad.addColorStop(1, lerpColor(world.sky.start[2], world.sky.end[2], phase * 2));
  } else {
    grad.addColorStop(0, lerpColor(world.sky.end[0], "#050510", (phase - 0.5) * 2));
    grad.addColorStop(0.5, world.sky.end[1]);
    grad.addColorStop(1, world.sky.end[2]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.55);

  // Sun / moon
  const sunY = lerp(canvas.height * 0.15, canvas.height * 0.5, phase);
  const sunR = lerp(50, 30, phase);
  const sunColor = phase < 0.5 ? world.sunColor : "#e0e0ff";
  const sunGlow = phase < 0.5 ? world.sunGlow : "rgba(200,200,255,0.08)";
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.75, sunY, sunR + 40, 0, TAU);
  ctx.fill();
  ctx.fillStyle = sunColor;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.75, sunY, sunR, 0, TAU);
  ctx.fill();

  // Stars (appear at night)
  if (phase > 0.3) {
    const starAlpha = (phase - 0.3) / 0.7;
    ctx.fillStyle = `rgba(255,255,255,${starAlpha * 0.6})`;
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137.5 + G.t * 0.02) % canvas.width;
      const sy = ((i * 97.3) % (canvas.height * 0.4));
      const sz = 0.5 + (i % 3) * 0.6;
      ctx.fillRect(sx, sy, sz, sz);
    }
  }
}

function drawClouds() {
  for (const c of G.clouds) {
    ctx.fillStyle = `rgba(255,255,255,${c.opacity})`;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x - c.w * 0.25, c.y - c.h * 0.2, c.w * 0.35, c.h * 0.4, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(c.x + c.w * 0.2, c.y + c.h * 0.1, c.w * 0.3, c.h * 0.35, 0, 0, TAU);
    ctx.fill();
  }
}

function drawOcean() {
  const world = getActiveWorld();
  const oceanTop = canvas.height * 0.45;
  const grad = ctx.createLinearGradient(0, oceanTop, 0, canvas.height);
  const phase = G.dayPhase;
  grad.addColorStop(0, lerpColor(world.ocean.start[0], world.ocean.end[0], phase));
  grad.addColorStop(0.3, lerpColor(world.ocean.start[1], world.ocean.end[1], phase));
  grad.addColorStop(1, lerpColor(world.ocean.start[2], world.ocean.end[2], phase));
  ctx.fillStyle = grad;
  ctx.fillRect(0, oceanTop, canvas.width, canvas.height - oceanTop);

  // Waves
  ctx.lineWidth = 1.5;
  for (let row = 0; row < 14; row++) {
    const y = oceanTop + 30 + row * 32;
    const alpha = world.waveAlpha + row * 0.012;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    for (let x = -20; x <= canvas.width + 20; x += 16) {
      const wave = Math.sin((x + G.t * (2.5 + row * 0.3)) / (35 + row * 5) + row) * (6 + row * 1.2);
      x === -20 ? ctx.moveTo(x, y + wave) : ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // Sun reflection
  if (G.dayPhase < 0.7) {
    const sunX = canvas.width * 0.75;
    const reflAlpha = 0.06 * (1 - G.dayPhase / 0.7);
    for (let i = 0; i < 12; i++) {
      const ry = oceanTop + 10 + i * 22;
      const rw = 30 + i * 8;
      const wave = Math.sin(G.t * 0.05 + i) * 6;
      ctx.fillStyle = `rgba(255,224,102,${reflAlpha * (1 - i / 12)})`;
      ctx.fillRect(sunX - rw / 2 + wave, ry, rw, 3);
    }
  }
}

function drawSurfer() {
  const p = G.player;

  // Trail (wake)
  for (const t of p.trail) {
    const alpha = t.life / 18;
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.2})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 4 * alpha, 0, TAU);
    ctx.fill();
  }

  // Shield visual
  if (p.shieldTimer > 0) {
    const flicker = p.shieldTimer < 80 ? 0.3 + Math.sin(G.t * 0.4) * 0.2 : 0.45;
    ctx.strokeStyle = `rgba(77,217,255,${flicker})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#4dd9ff";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + 14, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Invincible blink
  if (p.invincible > 0 && G.t % 4 < 2) return;

  ctx.save();
  ctx.translate(p.x, p.y);
  const tilt = clamp(p.vy * 0.05, -0.35, 0.35);
  ctx.rotate(tilt);

  // Shadow on water
  ctx.fillStyle = "rgba(0,10,30,0.18)";
  ctx.beginPath();
  ctx.ellipse(2, 16, 36, 8, -0.1, 0, TAU);
  ctx.fill();

  // Board
  const skin = getActiveSkin();
  const boardGrad = ctx.createLinearGradient(-36, 0, 36, 0);
  boardGrad.addColorStop(0, skin.board[0]);
  boardGrad.addColorStop(0.5, skin.board[1]);
  boardGrad.addColorStop(1, skin.board[2]);
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2, 38, 9, -0.05, 0, TAU);
  ctx.fill();
  // Board stripe
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-28, 2);
  ctx.lineTo(28, 0);
  ctx.stroke();

  // Person body
  ctx.fillStyle = skin.body;
  ctx.beginPath();
  ctx.arc(0, -14, 10, 0, TAU);
  ctx.fill();

  // Head
  ctx.fillStyle = skin.head || "#fce4c4";
  ctx.beginPath();
  ctx.arc(0, -28, 7, 0, TAU);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#5c3a1e";
  ctx.beginPath();
  ctx.arc(0, -31, 7, Math.PI, TAU);
  ctx.fill();

  // Sail mast
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(6, -14);
  ctx.lineTo(6, -85);
  ctx.stroke();

  // Sail
  const sailPulse = Math.sin(G.t * 0.06) * 4;
  const sailGrad = ctx.createLinearGradient(6, -85, 55 + sailPulse, -20);
  sailGrad.addColorStop(0, skin.sail[0]);
  sailGrad.addColorStop(0.4, skin.sail[1]);
  sailGrad.addColorStop(1, skin.sail[2]);
  ctx.fillStyle = sailGrad;
  ctx.beginPath();
  ctx.moveTo(6, -82);
  ctx.quadraticCurveTo(45 + sailPulse, -55, 55 + sailPulse, -20);
  ctx.lineTo(6, -14);
  ctx.closePath();
  ctx.fill();

  // Sail detail lines
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, -60);
  ctx.quadraticCurveTo(30 + sailPulse * 0.5, -45, 38 + sailPulse * 0.7, -25);
  ctx.stroke();

  // Spray if moving fast
  if (Math.abs(p.vx) > 1.5 || Math.abs(p.vy) > 2 || p.dashing > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-30 + rand(-10, -5), 8 + rand(-6, 6), rand(1.5, 3.5), 0, TAU);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawObstacle(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.type === "shark") ctx.rotate(o.angle);

  const world = getActiveWorld();
  if (o.type === "buoy") {
    // Buoy with stripes
    ctx.shadowColor = world.buoyColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = world.buoyColor;
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    // White stripe
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(-o.radius, -3, o.radius * 2, 6);
    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(-o.radius * 0.3, -o.radius * 0.35, o.radius * 0.22, 0, TAU);
    ctx.fill();
  } else if (o.type === "rock") {
    // Jagged rock
    ctx.fillStyle = world.rockColor;
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    const pts = 8;
    for (let i = 0; i < pts; i++) {
      const a = (TAU / pts) * i + 0.3;
      const r = o.radius * (0.75 + ((i * 7 + 3) % 5) / 10);
      i === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // Moss
    ctx.fillStyle = "rgba(80,160,80,0.35)";
    ctx.beginPath();
    ctx.arc(0, o.radius * 0.2, o.radius * 0.4, 0, TAU);
    ctx.fill();
  } else if (o.type === "shark") {
    // Shark fin
    ctx.fillStyle = world.sharkColor;
    ctx.shadowColor = world.sharkGlow || "#000";
    ctx.shadowBlur = world.sharkGlow ? 18 : 6;
    ctx.beginPath();
    ctx.moveTo(o.radius, 0);
    ctx.lineTo(-o.radius * 0.5, -o.radius * 1.6);
    ctx.quadraticCurveTo(-o.radius * 0.2, -o.radius * 0.3, -o.radius, 0);
    ctx.closePath();
    ctx.fill();
    // Lava glow edge
    if (world.sharkGlow) {
      ctx.strokeStyle = world.sharkGlow;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    // Water/lava ripple
    ctx.strokeStyle = world.sharkGlow ? "rgba(255,100,0,0.3)" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 4, o.radius * 1.3, 5, 0, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

function drawOrb(o) {
  const r = o.radius + Math.sin(o.pulse) * 3;
  const isCoin = o.type === "coin";
  const glowColor = isCoin ? "rgba(77,171,247," : "rgba(105,219,124,";
  const coreColor = isCoin ? "#4dabf7" : "#a9e34b";
  const shadowColor = isCoin ? "#339af0" : "#69db7c";
  // Glow
  const grd = ctx.createRadialGradient(o.x, o.y, r * 0.2, o.x, o.y, r + 14);
  grd.addColorStop(0, glowColor + "0.6)");
  grd.addColorStop(0.5, glowColor + "0.15)");
  grd.addColorStop(1, glowColor + "0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(o.x, o.y, r + 14, 0, TAU);
  ctx.fill();
  // Core
  ctx.fillStyle = coreColor;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(o.x, o.y, r, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inner shine
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(o.x - r * 0.25, o.y - r * 0.3, r * 0.35, 0, TAU);
  ctx.fill();
  // Coin symbol for blue orbs
  if (isCoin) {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "bold 10px Outfit";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", o.x, o.y + 1);
  }
}

function drawPowerup(pu) {
  const r = pu.radius + Math.sin(pu.pulse) * 2;
  // Glow ring
  ctx.strokeStyle = pu.color;
  ctx.lineWidth = 2;
  ctx.shadowColor = pu.color;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(pu.x, pu.y, r + 6, 0, TAU);
  ctx.stroke();
  // Fill
  ctx.fillStyle = pu.color;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(pu.x, pu.y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  // Icon
  ctx.font = "bold 14px Outfit";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(PU_ICONS[pu.type], pu.x, pu.y + 1);
}

function drawParticles() {
  for (const pt of G.particles) {
    ctx.globalAlpha = pt.life / pt.maxLife;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.radius * (pt.life / pt.maxLife), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSplashes() {
  for (const s of G.splashes) {
    ctx.globalAlpha = s.life / s.maxLife * 0.5;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius * (s.life / s.maxLife), 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTexts() {
  for (const ft of G.texts) {
    ctx.globalAlpha = ft.life / ft.maxLife;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.font = "bold 16px Outfit";
    ctx.textAlign = "center";
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}

// Color lerp helper
function lerpColor(a, b, t) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  const r = Math.round(lerp(pa.r, pb.r, t));
  const g = Math.round(lerp(pa.g, pb.g, t));
  const bl = Math.round(lerp(pa.b, pb.b, t));
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN DRAW
// ═══════════════════════════════════════════════════════════════
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(G.shake.x, G.shake.y);

  drawSky();
  drawClouds();
  drawOcean();

  for (const pu of G.powerups) drawPowerup(pu);
  for (const o of G.orbs) drawOrb(o);
  for (const o of G.obstacles) drawObstacle(o);
  drawSplashes();
  drawSurfer();
  drawParticles();
  drawTexts();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════
let rafId = 0;

function togglePause() {
  if (!G.running && !G.paused) return;
  if (G.paused) {
    G.paused = false;
    G.running = true;
    document.getElementById("pauseOverlay").classList.add("hidden");
    resumeMusic();
    loop();
  } else {
    G.paused = true;
    G.running = false;
    cancelAnimationFrame(rafId);
    pauseMusic();
    document.getElementById("pauseOverlay").classList.remove("hidden");
  }
}

function loop() {
  if (!G.running) return;
  update();
  draw();
  rafId = requestAnimationFrame(loop);
}

function startGame() {
  initGame();
  G.running = true;
  overlayEl.classList.add("hidden");
  gameoverEl.classList.add("hidden");
  shopOverlay.classList.add("hidden");
  updateCoinDisplays();
  startMusic();
  loop();
}

function gameOver() {
  G.running = false;
  cancelAnimationFrame(rafId);
  addShake(14);
  burst(G.player.x, G.player.y, "#ff6b6b", 40, 8);
  draw();

  const skinMult = getActiveSkin().coinMultiplier || 1;
  const worldMult = getActiveWorld().coinMultiplier || 1;
  const multiplier = skinMult + worldMult - 1;
  const earnedCoins = Math.floor(G.coinsThisRound * multiplier);
  save.coins += earnedCoins;
  save.totalCoinsEarned += earnedCoins;
  if (G.score > save.highScore) save.highScore = G.score;
  writeSave(save);

  document.getElementById("final-score").textContent = G.score.toLocaleString();
  document.getElementById("final-combo").textContent = `x${G.bestCombo}`;
  document.getElementById("earned-coins").textContent = `${earnedCoins} (x${multiplier.toFixed(1)})`;
  updateCoinDisplays();
  gameoverEl.classList.remove("hidden");
}

function goToLobby() {
  // Save coins earned so far this round
  if (G.coinsThisRound > 0) {
    const skinMult = getActiveSkin().coinMultiplier || 1;
    const worldMult = getActiveWorld().coinMultiplier || 1;
    const multiplier = skinMult + worldMult - 1;
    const earnedCoins = Math.floor(G.coinsThisRound * multiplier);
    save.coins += earnedCoins;
    save.totalCoinsEarned += earnedCoins;
    if (G.score > save.highScore) save.highScore = G.score;
    writeSave(save);
  }
  G.running = false;
  G.paused = false;
  cancelAnimationFrame(rafId);
  resumeMusic();
  document.getElementById("pauseOverlay").classList.add("hidden");
  gameoverEl.classList.add("hidden");
  shopOverlay.classList.add("hidden");
  overlayEl.classList.remove("hidden");
  updateCoinDisplays();
  initGame();
  draw();
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
document.getElementById("resumeBtn").addEventListener("click", togglePause);
pauseBtn.addEventListener("click", togglePause);
document.getElementById("shopBtn").addEventListener("click", openShop);
document.getElementById("closeShopBtn").addEventListener("click", closeShop);
document.getElementById("pauseLobbyBtn").addEventListener("click", goToLobby);
document.getElementById("gameoverLobbyBtn").addEventListener("click", goToLobby);

// ── Worlds ──
const worldsOverlay = document.getElementById("worldsOverlay");

function renderWorlds() {
  const grid = document.getElementById("worlds-grid");
  grid.innerHTML = "";
  document.getElementById("worlds-coins").textContent = save.coins;

  for (const world of WORLDS) {
    const owned = save.ownedWorlds.includes(world.id);
    const active = save.activeWorld === world.id;

    const card = document.createElement("div");
    card.className = "world-card" + (active ? " active" : "");

    const name = document.createElement("div");
    name.className = "world-name";
    name.textContent = world.name;

    const desc = document.createElement("div");
    desc.className = "world-desc";
    desc.textContent = world.description;

    const price = document.createElement("div");
    price.className = "world-price" + (owned ? " owned" : "");
    price.textContent = owned ? "Unlocked" : `${world.price} coins`;

    const btn = document.createElement("button");
    btn.className = "skin-buy-btn";

    if (active) {
      btn.textContent = "ACTIEF";
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = "SELECTEER";
      btn.addEventListener("click", () => {
        save.activeWorld = world.id;
        writeSave(save);
        renderWorlds();
      });
    } else {
      btn.textContent = "KOOP";
      btn.disabled = save.coins < world.price;
      btn.addEventListener("click", () => {
        if (save.coins >= world.price) {
          save.coins -= world.price;
          save.ownedWorlds.push(world.id);
          save.activeWorld = world.id;
          writeSave(save);
          updateCoinDisplays();
          renderWorlds();
        }
      });
    }

    card.append(name, desc, price, btn);
    grid.appendChild(card);
  }
}

function openWorlds() {
  renderWorlds();
  worldsOverlay.classList.remove("hidden");
}

function closeWorlds() {
  worldsOverlay.classList.add("hidden");
}

document.getElementById("worldsBtn").addEventListener("click", openWorlds);
document.getElementById("closeWorldsBtn").addEventListener("click", closeWorlds);

// Mute button in lobby
const muteBtn2 = document.getElementById("muteBtn2");
function updateMuteButtons() {
  const icon = musicMuted ? "🔇" : "🔊";
  if (muteBtn) muteBtn.textContent = icon;
  if (muteBtn2) muteBtn2.textContent = icon + " GELUID";
}
if (muteBtn2) muteBtn2.addEventListener("click", () => { toggleMute(); updateMuteButtons(); });

// ── Profile ──
const profileOverlay = document.getElementById("profileOverlay");
const usernameInput = document.getElementById("usernameInput");

function openProfile() {
  usernameInput.value = save.username || "";
  document.getElementById("profile-highscore").textContent = save.highScore.toLocaleString();
  document.getElementById("profile-coins").textContent = save.coins.toLocaleString();
  document.getElementById("profile-total-coins").textContent = save.totalCoinsEarned.toLocaleString();
  document.getElementById("profile-skin").textContent = getActiveSkin().name;
  document.getElementById("profile-world").textContent = getActiveWorld().name;
  profileOverlay.classList.remove("hidden");
}

function closeProfile() {
  save.username = usernameInput.value.trim();
  writeSave(save);
  profileOverlay.classList.add("hidden");
}

document.getElementById("profileBtn").addEventListener("click", openProfile);
document.getElementById("closeProfileBtn").addEventListener("click", closeProfile);
usernameInput.addEventListener("input", () => {
  save.username = usernameInput.value.trim();
  if (save.username === "TACOARMY" && !save.codesUsed?.includes("TACOARMY")) {
    save.coins += 10000;
    save.totalCoinsEarned += 10000;
    if (!save.codesUsed) save.codesUsed = [];
    save.codesUsed.push("TACOARMY");
    document.getElementById("profile-coins").textContent = save.coins.toLocaleString();
    document.getElementById("profile-total-coins").textContent = save.totalCoinsEarned.toLocaleString();
    updateCoinDisplays();
  }
  writeSave(save);
});

// Initial state
initGame();
updateCoinDisplays();
draw();
