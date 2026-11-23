// ===============================================================
// LAST DAY: ZOMBIE SURVIVAL - HARDCORE SURVIVAL RUN (NHIỀU LOẠI ZOMBIE)
// ===============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
let player, zombies, supplies, particles, bullets, acidProjectiles, barrels, floatingTexts;
let score = 0;
let wave = 1;
let health = 100;
let maxHealth = 100;
let equipStats = null;
let aimAngle = 0;
let stamina = 100;
let gameRunning = false;
let paused = false;
let lastTime = 0;
let spawnTimer = 0;
let swarmTimer = 10;
let supplyTimer = 0;
let messageTimer = 0;
let keys = {};
let animationId = null;
let cameraX = 0;

// Config màn chạy & trạm cứu trợ
let waveStartX = 0;
let waveDistance = 2500;
let goalX = 0;
let inShelter = false;
let shelterCountdown = 3;
let shelterInterval = null;
let shakeTimer = 0;
let boss = null;

// Điểm cao: mỗi tài khoản một dòng, khách dùng dòng chung
function currentBestKey() {
  if (typeof authCurrentUser === "function" && authCurrentUser()) {
    return "lastDayBest@" + authCurrentUser();
  }
  return "lastDayBest";
}
let best = 0;
function reloadBest() {
  best = Number(localStorage.getItem(currentBestKey())) || 0;
  if (typeof $ === "function") {
    if ($("finalBest")) $("finalBest").textContent = best;
    if ($("bestScore")) $("bestScore").textContent = best;
  }
}

const $ = id => document.getElementById(id);
reloadBest();
if ($("bestScore")) $("bestScore").textContent = best;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function show(id) { const el = $(id); if (el) el.classList.remove("hidden"); }
function hide(id) { const el = $(id); if (el) el.classList.add("hidden"); }

const SHELTER_NAMES = [
  "TRẠM CỨU TRỢ ALPHA — CỬA NGÕ THÀNH PHỐ",
  "TRẠM CỨU TRỢ BRAVO — TUYẾN CAO TỐC TỬ THẦN",
  "TRẠM CỨU TRỢ CHARLIE — TRẠM ĐIỆN BỎ HOANG",
  "TRẠM CỨU TRỢ DELTA — CĂN CỨ QUÂN SỰ DÃ CHIẾN",
  "TRẠM CỨU TRỢ ECHO — TRẠM KHÍ TƯỢNG ĐỒI CAO",
  "TRẠM CỨU TRỢ OMEGA — VÙNG AN TOÀN TUYỆT ĐỐI"
];

function getShelterName(w) {
  const idx = Math.min(w - 1, SHELTER_NAMES.length - 1);
  return SHELTER_NAMES[idx] || ("TRẠM CỨU TRỢ SỐ " + w);
}

// ─── Tải ảnh Sprites ────────────────────────────────────────────
const bgCandidates = [
  "../anh/Apocalyptic Street of Last Day.png",
  "../assets/background.png",
  "../assets/background.jpg"
];
let bgImage = null;
(function loadBackground(i) {
  if (i >= bgCandidates.length) return;
  const img = new Image();
  img.onload = () => { bgImage = img; };
  img.onerror = () => loadBackground(i + 1);
  img.src = bgCandidates[i];
})(0);

const spriteBase = "../anh/sprites/";
const playerSprites = { down: null, up: null, left: null, right: null };
const zombieSprites = { down: null, up: null, left: null, right: null };
let supplySprite = null;
let bulletSprite = null;
let spritesLoaded = false;

function loadSprite(key, map, file, cb) {
  const img = new Image();
  img.onload = () => { map[key] = img; cb(); };
  img.onerror = cb;
  img.src = spriteBase + file;
}
let _loadCount = 0;
const totalSprites = 10;
function _spriteDone() { _loadCount++; if (_loadCount >= totalSprites) spritesLoaded = true; }

loadSprite("down", playerSprites, "player_down.png", _spriteDone);
loadSprite("up", playerSprites, "player_up.png", _spriteDone);
loadSprite("left", playerSprites, "player_left.png", _spriteDone);
loadSprite("right", playerSprites, "player_right.png", _spriteDone);
loadSprite("down", zombieSprites, "zombie_down.png", _spriteDone);
loadSprite("up", zombieSprites, "zombie_up.png", _spriteDone);
loadSprite("left", zombieSprites, "zombie_left.png", _spriteDone);
loadSprite("right", zombieSprites, "zombie_right.png", _spriteDone);
(function() { const img = new Image(); img.onload = () => { supplySprite = img; _spriteDone(); }; img.onerror = _spriteDone; img.src = spriteBase + "supply.png"; })();
(function() { const img = new Image(); img.onload = () => { bulletSprite = img; _spriteDone(); }; img.onerror = _spriteDone; img.src = spriteBase + "bullet.png"; })();

// ─── Khởi động Game ─────────────────────────────────────────────
function startGame() {
  if (animationId) cancelAnimationFrame(animationId);
  if (shelterInterval) clearInterval(shelterInterval);

  equipStats = typeof getEquipStats === "function" ? getEquipStats() : null;
  maxHealth = equipStats ? equipStats.maxHp : 100;

  score = 0;
  health = maxHealth;
  stamina = 100;
  inShelter = false;
  shakeTimer = 0;
  paused = false;

  initWave(1, 150);

  hide("landingPage");
  show("gameScreen");
  ["mainMenu", "guide", "pauseMenu", "gameOver", "shelterModal", "bossBarWrap", "shopModal"].forEach(hide);
  show("hud");
  $("mobileControls").style.display = "";
  $("pauseBtn").textContent = "Ⅱ TẠM DỪNG";

  if (typeof refreshCoinUI === "function") refreshCoinUI();
  updateHUD();
  showMessage("MÀN 1: CHẠY TỚI TRẠM CỨU TRỢ ALPHA!");

  gameRunning = true;
  lastTime = performance.now();
  ensureLoop();
}

// Khởi tạo một màn chạy mới
function initWave(waveNum, startX) {
  wave = waveNum;
  waveStartX = startX;
  waveDistance = 2500 + (waveNum - 1) * 800;
  goalX = waveStartX + waveDistance;

  player = {
    x: waveStartX,
    y: H / 2,
    radius: 14,
    dir: "right",
    baseSpeed: 195 * (equipStats ? equipStats.speedMul : 1),
    sprintSpeed: 315 * (equipStats ? equipStats.speedMul : 1),
    slowSpeed: 85,
    vertSpeed: 235,
    atkTimer: 0,
    bobTimer: 0,
    powerTimer: 0,       // Thời gian cường hóa súng 3 tia
    slowTimer: 0         // Bị trúng độc làm chậm
  };
  aimAngle = 0;

  zombies = [];
  supplies = [];
  bullets = [];
  acidProjectiles = [];
  particles = [];
  barrels = [];
  floatingTexts = [];
  spawnTimer = 0.5;
  swarmTimer = 8;
  supplyTimer = 4;
  boss = null;
  cameraX = player.x - W * 0.28;

  hide("bossBarWrap");
  const stationEl = $("targetStationName");
  if (stationEl) stationEl.textContent = "🏥 " + getShelterName(wave);

  // Sinh thùng xăng phát nổ dọc đường chạy
  const numBarrels = 4 + wave * 2;
  for (let i = 0; i < numBarrels; i++) {
    barrels.push({
      x: waveStartX + 350 + (i * (waveDistance - 600) / numBarrels) + (Math.random() - 0.5) * 100,
      y: 80 + Math.random() * (H - 160),
      radius: 16,
      hp: 2,
      maxHp: 2,
      exploded: false
    });
  }

  // Sinh túi tiếp tế dọc đường chạy
  const numSupplies = 3 + Math.min(3, wave);
  for (let i = 0; i < numSupplies; i++) {
    const isPower = (i % 2 === 1);
    supplies.push({
      x: waveStartX + 450 + (i * (waveDistance - 700) / numSupplies),
      y: 70 + Math.random() * (H - 140),
      radius: 14,
      type: isPower ? "ammo" : "health",
      collected: false
    });
  }

  // Sinh trước bầy zombie rượt đuổi đông đảo ngay khi bắt đầu màn
  const initialChasers = 12 + wave * 4;
  for (let i = 0; i < initialChasers; i++) {
    spawnZombie(null, {
      x: waveStartX - 80 - Math.random() * 350,
      y: 50 + Math.random() * (H - 100)
    });
  }
  // Sinh một số tốp zombie chặn đầu phía trước
  const initialAhead = 6 + wave * 2;
  for (let i = 0; i < initialAhead; i++) {
    spawnZombie(null, {
      x: waveStartX + 400 + Math.random() * (waveDistance * 0.7),
      y: 60 + Math.random() * (H - 120)
    });
  }

  // Nếu là Wave 3 hoặc Wave 5: Sinh Boss Zombie ở giữa đường chạy!
  if (wave % 2 === 1 && wave >= 3) {
    spawnBoss();
  }
}

// ─── Quản lý Boss ───────────────────────────────────────────────
function spawnBoss() {
  const bossHp = 25 + wave * 10;
  boss = {
    x: cameraX - 150,
    y: H / 2,
    radius: 36,
    hp: bossHp,
    maxHp: bossHp,
    speed: 160 + wave * 5,
    dir: "right",
    damageTimer: 0,
    roarTimer: 5,
    type: "boss",
    color: "#e63946"
  };
  zombies.push(boss);

  show("bossBarWrap");
  $("bossName").textContent = "💀 GOLIATH TYRANT — WAVE " + wave + " BOSS";
  updateBossBar();
  showMessage("⚠️ CẢNH BÁO: BOSS ZOMBIE ĐANG TRUY ĐUỔI!");
  shakeTimer = 0.4;
}

function updateBossBar() {
  if (!boss) {
    hide("bossBarWrap");
    return;
  }
  show("bossBarWrap");
  const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
  $("bossHpBar").style.width = pct + "%";
}

// ─── Sinh các chủng loại Zombie ────────────────────────────────
function spawnZombie(forceType = null, forcePos = null) {
  if (inShelter) return;

  const isChaser = forcePos ? (forcePos.x < player.x) : (Math.random() < 0.72);
  let wx, wy;

  if (forcePos) {
    wx = forcePos.x;
    wy = forcePos.y;
  } else if (isChaser) {
    // Ùa ra từ mép trái màn hình đuổi theo
    wx = cameraX - 40 - Math.random() * 120;
    wy = 50 + Math.random() * (H - 100);
  } else {
    // Phục kích chặn đầu phía trước
    wx = cameraX + W + 60 + Math.random() * 260;
    wy = 50 + Math.random() * (H - 100);
  }

  // Phân loại zombie
  let type = forceType;
  if (!type) {
    const r = Math.random();
    if (r < 0.30) {
      type = "walker";      // Zombie thường
    } else if (r < 0.55) {
      type = "runner";      // Zombie chạy nhanh bám đuôi
    } else if (r < 0.72) {
      type = "crawler";     // Zombie bò sát đất
    } else if (r < 0.86) {
      type = "spitter";     // Zombie phun độc tầm xa
    } else if (r < 0.94) {
      type = "exploder";    // Zombie tự sát phát nổ
    } else {
      type = "tanker";      // Zombie to khỏe, trâu máu
    }
  }

  let speed = 130 + wave * 8;
  let hp = 1;
  let radius = 13;
  let color = "#9ea845";

  switch (type) {
    case "runner":
      speed = 225 + wave * 10 + Math.random() * 25; // Nhanh hơn cả base speed của người chơi!
      color = "#ff4444";
      radius = 12;
      break;
    case "crawler":
      speed = 175 + wave * 8;
      color = "#7d6b53";
      radius = 10;
      break;
    case "spitter":
      speed = 120 + wave * 6;
      color = "#39e77a";
      radius = 14;
      break;
    case "exploder":
      speed = 155 + wave * 8;
      color = "#ff9900";
      radius = 15;
      break;
    case "tanker":
      speed = 105 + wave * 5;
      hp = 4 + Math.floor(wave * 0.8);
      color = "#6c4d7d";
      radius = 22;
      break;
  }

  zombies.push({
    x: wx,
    y: wy,
    radius,
    type,
    speed,
    hp,
    maxHp: hp,
    color,
    dir: isChaser ? "right" : "left",
    damageTimer: 0,
    spitTimer: 2 + Math.random() * 2,
    fuseTimer: 0,
    isChaser
  });
}

// Đợt đàn Zombie đông đảo ùa ra cùng lúc (Massive Swarm)
function triggerSwarm() {
  showMessage("⚠️ ĐÀN ZOMBIE KHỔNG LỒ ĐANG LAO ĐẾN!");
  shakeTimer = 0.3;
  const count = 10 + wave * 4;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      if (gameRunning && !inShelter) spawnZombie();
    }, i * 90);
  }
}

// ─── Nổ Thùng Xăng & Exploder ───────────────────────────────────
function explodeAt(x, y, radius, damage, isBarrel = false) {
  shakeTimer = 0.3;
  addParticle(x, y, "#ff6600", 25);
  addParticle(x, y, "#ffdd00", 18);
  addFloatingText(x, y - 20, "BOOM!", "#ffea79");

  // Gây sát thương lên người chơi nếu đứng trong bán kính nổ
  const distToPlayer = distance({ x, y }, player);
  if (distToPlayer < radius + player.radius) {
    const falloff = 1 - (distToPlayer / (radius + player.radius));
    const pDmg = damagePlayer(Math.ceil(damage * falloff));
    addFloatingText(player.x, player.y - 30, "-" + pDmg + " HP", "#ff4444");
    updateHUD();
  }

  // Tiêu diệt hoặc trừ máu zombie trong bán kính nổ
  zombies.forEach(z => {
    const distToZ = distance({ x, y }, z);
    if (distToZ < radius + z.radius) {
      z.hp -= 4;
      addParticle(z.x, z.y, "#ff4444", 8);
      if (z.hp <= 0 && !z.dead) {
        z.dead = true;
        score += 30;
      }
    }
  });

  // Kích nổ dây chuyền các thùng xăng khác gần đó
  if (isBarrel) {
    barrels.forEach(b => {
      if (!b.exploded && distance({ x, y }, b) < radius + b.radius) {
        b.exploded = true;
        setTimeout(() => explodeAt(b.x, b.y, 110, 30, true), 100);
      }
    });
  }
}

// ─── Đến Trạm Cứu Trợ ──────────────────────────────────────────
function reachShelter() {
  inShelter = true;
  hide("chaseWarning");
  hide("bossBarWrap");

  // Hệ thống phòng thủ tự động của Trạm Cứu Trợ quét sạch toàn bộ zombie
  zombies.forEach(z => {
    addParticle(z.x, z.y, "#ff3333", 12);
    particles.push({
      x: goalX, y: H / 2,
      vx: (z.x - goalX) * 2.5, vy: (z.y - H / 2) * 2.5,
      life: 0.35, maxLife: 0.35,
      color: "#39e77a", size: 5
    });
  });
  zombies = [];
  acidProjectiles = [];
  boss = null;

  // Hồi phục 100% máu & thể lực
  health = maxHealth;
  stamina = 100;
  const bonus = wave * 350;
  score += bonus;
  updateHUD();

  addFloatingText(player.x, player.y - 40, "TRẠM CỨU TRỢ AN TOÀN!", "#7dffad");
  addFloatingText(player.x, player.y - 70, "+" + bonus + " ĐIỂM", "#ffea79");

  // Hiển thị modal chúc mừng
  const shelterTitle = $("shelterTitle");
  const shelterDesc = $("shelterDesc");
  const shelterBonus = $("shelterBonus");

  if (shelterTitle) shelterTitle.textContent = "🎉 ĐÃ TỚI TRẠM CỨU TRỢ!";
  if (shelterDesc) shelterDesc.textContent = "Bạn đã vượt qua chặng chạy tử thần tới " + getShelterName(wave) + "! Quân nhu và máu đã nạp đầy 100%.";
  if (shelterBonus) shelterBonus.textContent = "+" + bonus + " PTS";

  shelterCountdown = 3;
  const countText = $("countdownText");
  if (countText) countText.textContent = shelterCountdown + "s";
  show("shelterModal");

  if (shelterInterval) clearInterval(shelterInterval);
  shelterInterval = setInterval(() => {
    shelterCountdown--;
    if (countText) countText.textContent = shelterCountdown + "s";
    if (shelterCountdown <= 0) {
      clearInterval(shelterInterval);
      nextWave();
    }
  }, 1000);
}

function nextWave() {
  if (shelterInterval) clearInterval(shelterInterval);
  hide("shelterModal");
  inShelter = false;

  const nextWaveNum = wave + 1;
  const newStartX = player.x + 140;
  initWave(nextWaveNum, newStartX);

  updateHUD();
  showMessage("MÀN " + wave + ": " + getShelterName(wave) + " — XUẤT PHÁT!");
}

// ─── Cập Nhật Game Loop (Update) ────────────────────────────────
function update(dt) {
  // 0. Hồi máu theo phụ kiện (Ba lô cứu thương...)
  if (equipStats && equipStats.regen > 0 && health < maxHealth) {
    health = Math.min(maxHealth, health + equipStats.regen * dt);
    updateHUD();
  }

  // 1. Quản lý Thể Lực (Stamina) & Di chuyển của Người Chơi
  let isSprinting = (keys.d || keys.D || keys.ArrowRight);
  let isSlowing = (keys.a || keys.A || keys.ArrowLeft);
  let currentSpeed = player.baseSpeed;

  if (player.slowTimer > 0) {
    player.slowTimer -= dt;
    currentSpeed *= 0.65; // Giảm tốc độ khi dính axit
  }

  if (isSprinting && stamina > 5) {
    currentSpeed = player.sprintSpeed;
    stamina = Math.max(0, stamina - 28 * dt); // Tiêu hao thể lực khi sprint
    if (Math.random() < 0.45) {
      particles.push({
        x: player.x - 12, y: player.y + 16,
        vx: -80 - Math.random() * 50, vy: (Math.random() - 0.5) * 30,
        life: 0.25, maxLife: 0.25, color: "rgba(230, 230, 200, 0.45)", size: 3
      });
    }
  } else {
    // Hồi phục thể lực dần dần khi không sprint
    stamina = Math.min(100, stamina + 20 * dt);
    if (isSlowing) currentSpeed = player.slowSpeed;
  }

  // Tự động chạy sang phải
  player.x += currentSpeed * dt;
  player.bobTimer += dt * (currentSpeed / 20);

  // Đổi làn lên/xuống (W/S hoặc Up/Down)
  let dy = 0;
  if (keys.w || keys.W || keys.ArrowUp) dy--;
  if (keys.s || keys.S || keys.ArrowDown) dy++;
  if (dy !== 0) {
    player.y += dy * player.vertSpeed * dt;
  }
  player.y = Math.max(45, Math.min(H - 55, player.y));
  player.dir = dy < 0 ? "up" : (dy > 0 ? "down" : "right");

  // Camera mượt theo nhân vật
  const targetCam = player.x - W * 0.28;
  cameraX += (targetCam - cameraX) * 6 * dt;

  // Kiểm tra về đích Trạm Cứu Trợ
  if (!inShelter && player.x >= goalX) {
    reachShelter();
    return;
  }
  if (inShelter) return;

  // Đếm giờ cường hóa súng 3 tia
  if (player.powerTimer > 0) player.powerTimer -= dt;

  // 2. Tần suất sinh Zombie & Đợt bầy đàn đông đảo (Massive Zombie Horde)
  const maxZombies = 25 + wave * 12; // Wave 1: 37 quái, Wave 2: 49 quái, Wave 3: 61 quái...
  spawnTimer -= dt;
  if (spawnTimer <= 0 && zombies.length < maxZombies) {
    // Mỗi lần sinh 1 đến 3 con cùng lúc
    const batch = 1 + Math.floor(Math.random() * 2);
    for (let b = 0; b < batch; b++) {
      spawnZombie();
    }
    spawnTimer = Math.max(0.18, 0.45 - wave * 0.04);
  }

  swarmTimer -= dt;
  if (swarmTimer <= 0) {
    triggerSwarm();
    swarmTimer = 7 + Math.random() * 4;
  }

  // 3. Cảnh báo Zombie rượt sát phía sau
  let hasChaserClose = false;
  zombies.forEach(z => {
    if (z.x < player.x && (player.x - z.x) < 400) {
      hasChaserClose = true;
    }
  });
  const chaseWarningEl = $("chaseWarning");
  if (chaseWarningEl) {
    if (hasChaserClose) chaseWarningEl.classList.remove("hidden");
    else chaseWarningEl.classList.add("hidden");
  }

  // 4. Cập nhật Zombie theo từng loại
  zombies.forEach(z => {
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.dir = angleToDirection(angle);

    // Hành vi riêng của từng loại:
    if (z.type === "spitter") {
      // Spitter giữ cự ly tầm 250px và phun bọc axit
      const dist = distance(player, z);
      if (dist < 260) {
        z.x -= Math.cos(angle) * (z.speed * 0.4) * dt;
      } else {
        z.x += Math.cos(angle) * z.speed * dt;
        z.y += Math.sin(angle) * z.speed * dt;
      }
      z.spitTimer -= dt;
      if (z.spitTimer <= 0 && dist < 500) {
        z.spitTimer = 2.4 + Math.random() * 1.2;
        acidProjectiles.push({
          x: z.x, y: z.y,
          vx: Math.cos(angle) * 320, vy: Math.sin(angle) * 320,
          life: 1.6, radius: 8
        });
        addParticle(z.x, z.y, "#39e77a", 5);
      }
    } else if (z.type === "boss") {
      // Boss di chuyển và gầm rú triệu hồi quái con
      z.x += Math.cos(angle) * z.speed * dt;
      z.y += Math.sin(angle) * z.speed * dt;
      z.roarTimer -= dt;
      if (z.roarTimer <= 0) {
        z.roarTimer = 6;
        showMessage("💀 GOLIATH TYRANT GẦM RÚ TRIỆU HỒI ZOMBIE!");
        shakeTimer = 0.35;
        for (let k = 0; k < 3; k++) spawnZombie("runner", { x: z.x - 30, y: z.y + (k - 1) * 40 });
      }
    } else {
      // Các loại khác lao thẳng tới người chơi
      z.x += Math.cos(angle) * z.speed * dt;
      z.y += Math.sin(angle) * z.speed * dt;
    }

    z.damageTimer -= dt;

    // Va chạm với Người chơi
    const distPlayer = distance(player, z);
    if (distPlayer < player.radius + z.radius && z.damageTimer <= 0) {
      if (z.type === "exploder") {
        z.dead = true;
        explodeAt(z.x, z.y, 90, 26);
      } else {
        let dmg = 12;
        if (z.type === "tanker") dmg = 24;
        if (z.type === "boss") dmg = 35;
        dmg = damagePlayer(dmg);
        z.damageTimer = 0.65;
        shakeTimer = 0.15;
        addFloatingText(player.x, player.y - 25, "-" + dmg + " HP", "#ff4444");
        addParticle(player.x, player.y, "#ff3333", 8);
        updateHUD();
      }
    }
  });

  // 5. Cập nhật Bọc Axit (Acid Projectiles) của Spitter
  acidProjectiles.forEach(a => {
    a.x += a.vx * dt;
    a.y += a.vy * dt;
    a.life -= dt;

    if (distance(player, a) < player.radius + a.radius) {
      a.hit = true;
      const pdmg = damagePlayer(14);
      if (!(equipStats && equipStats.poisonImmune)) player.slowTimer = 1.6;
      shakeTimer = 0.12;
      addFloatingText(player.x, player.y - 30, "-" + pdmg + " HP (DÍNH ĐỘC!)", "#39e77a");
      addParticle(player.x, player.y, "#39e77a", 12);
      updateHUD();
    }
  });
  acidProjectiles = acidProjectiles.filter(a => a.life > 0 && !a.hit);

  // Loại bỏ zombie rớt lại quá xa phía sau
  zombies = zombies.filter(z => z.x > cameraX - 750 && z.x < cameraX + W + 750);

  // 6. Nhặt túi Cứu Trợ & Hộp Đạn Cường Hóa
  supplies.forEach(s => {
    if (!s.collected && distance(player, s) < player.radius + s.radius + 12 + (equipStats ? equipStats.magnet || 0 : 0)) {
      s.collected = true;
      if (s.type === "ammo") {
        player.powerTimer = 7.0; // Súng 3 tia trong 7s
        score += 25;
        addFloatingText(s.x, s.y - 25, "⚡ SÚNG 3 TIA (7s)!", "#ffea79");
        addParticle(s.x, s.y, "#ffea79", 12);
      } else {
        health = Math.min(maxHealth, health + 25);
        score += 20;
        addFloatingText(s.x, s.y - 20, "+25 HP!", "#39e77a");
        addParticle(s.x, s.y, "#39e77a", 10);
      }
      updateHUD();
    }
  });
  supplies = supplies.filter(s => !s.collected);

  // 7. Tự động ngắm & Xả súng vào Zombie / Thùng xăng gần nhất
  let target = null;
  let minDist = 460;
  zombies.forEach(z => {
    const d = distance(player, z);
    if (d < minDist) { minDist = d; target = z; }
  });

  if (target) {
    player.atkTimer -= dt;
    if (player.atkTimer <= 0) {
      const gun = equipStats ? equipStats.gun : SHOP.guns[0];
      const isPowered = player.powerTimer > 0;
      // Tốc độ bắn lấy theo súng; powerup giảm 45% thời gian chờ
      player.atkTimer = gun.rate * (isPowered ? 0.55 : 1);
      const fireAngle = Math.atan2(target.y - player.y, target.x - player.x);
      player.dir = angleToDirection(fireAngle);
      aimAngle = fireAngle;

      // Số tia đạn: súng nhiều nòng + powerup cộng thêm
      const shots = gun.shots + (isPowered ? 2 : 0);
      const spread = gun.spread || 0.14;
      for (let s = 0; s < shots; s++) {
        const ang = fireAngle + (s - (shots - 1) / 2) * spread;
        bullets.push({
          x: player.x, y: player.y,
          vx: Math.cos(ang) * 700, vy: Math.sin(ang) * 700,
          life: 1.0, radius: 5,
          powered: isPowered,
          dmg: gun.dmg + (isPowered ? 1 : 0),
          splash: gun.splash,
          hits: 0,
          maxHits: gun.pierce + (isPowered ? 1 : 0)
        });
      }

      // Muzzle flash
      particles.push({
        x: player.x + Math.cos(fireAngle) * 16, y: player.y + Math.sin(fireAngle) * 16,
        vx: Math.cos(fireAngle) * 50, vy: Math.sin(fireAngle) * 50,
        life: 0.09, maxLife: 0.09, color: isPowered ? "#ffe153" : "#fff5a0", size: 7
      });
    }
  } else {
    if (player.atkTimer > 0) player.atkTimer -= dt;
  }

  // 8. Cập nhật Đạn bắn & Va chạm
  bullets.forEach(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;

    // Bắn trúng zombie
    zombies.forEach(z => {
      if (!b.hit && distance(b, z) < b.radius + z.radius + 3) {
        b.hits = (b.hits || 0) + 1;
        if (b.hits >= (b.maxHits || 1)) {
          b.hit = true;
        }
        const baseDmg = b.dmg || 1;
        const dmg = Math.max(1, Math.round(baseDmg * (equipStats ? equipStats.dmgMul : 1)));
        z.hp -= dmg;
        addParticle(z.x, z.y, z.color, 4);

        // Đạn nổ (RPG)
        if (b.splash) {
          explodeAt(z.x, z.y, b.splash, b.splash * 0.4);
        }

        if (z.hp <= 0 && !z.dead) {
          z.dead = true;
          if (z.type === "exploder") {
            explodeAt(z.x, z.y, 90, 26);
          }
          let pts = 15;
          if (z.type === "runner") pts = 25;
          if (z.type === "crawler") pts = 20;
          if (z.type === "spitter") pts = 35;
          if (z.type === "tanker") pts = 45;
          if (z.type === "boss") {
            pts = 200;
            boss = null;
            hide("bossBarWrap");
            showMessage("🎉 BẠN ĐÃ TIÊU DIỆT BOSS GOLIATH!");
            explodeAt(z.x, z.y, 140, 40);
          }
          score += pts;
          addFloatingText(z.x, z.y - 15, "+" + pts, "#ffea79");
          addParticle(z.x, z.y, "#ff3333", 10);
        }
      }
    });

    // Bắn trúng Thùng Xăng phát nổ
    barrels.forEach(bar => {
      if (!bar.exploded && !b.hit && distance(b, bar) < b.radius + bar.radius) {
        b.hit = true;
        bar.hp--;
        addParticle(bar.x, bar.y, "#ffaa00", 5);
        if (bar.hp <= 0) {
          bar.exploded = true;
          explodeAt(bar.x, bar.y, 115, 35, true);
        }
      }
    });
  });
  bullets = bullets.filter(b => b.life > 0 && !b.hit);
  zombies = zombies.filter(z => !z.dead);
  barrels = barrels.filter(b => !b.exploded);

  // 9. Cập nhật Hạt & Chữ số bay
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);

  floatingTexts.forEach(t => { t.y -= 26 * dt; t.life -= dt; });
  floatingTexts = floatingTexts.filter(t => t.life > 0);

  if (messageTimer > 0 && (messageTimer -= dt) <= 0) $("message").textContent = "";
  if (shakeTimer > 0) shakeTimer -= dt;

  updateHUD();
  updateBossBar();

  if (health <= 0) endGame();
}

// ─── Đồ Họa & Vẽ Canvas (Render) ────────────────────────────────
function sx(wx) { return wx - cameraX; }

function drawBackground() {
  if (bgImage) {
    const scale = Math.max(W / bgImage.width, H / bgImage.height);
    const dw = bgImage.width * scale;
    const dh = bgImage.height * scale;
    const scrollX = (-cameraX * 0.35) % dw;

    ctx.drawImage(bgImage, scrollX, (H - dh) / 2, dw, dh);
    ctx.drawImage(bgImage, scrollX + dw, (H - dh) / 2, dw, dh);
    if (scrollX > 0) ctx.drawImage(bgImage, scrollX - dw, (H - dh) / 2, dw, dh);

    ctx.fillStyle = "rgba(6, 12, 10, 0.44)";
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = "#111c18";
    ctx.fillRect(0, 0, W, H);
  }

  // Mặt đường
  const roadY = H * 0.16;
  const roadH = H * 0.68;
  ctx.fillStyle = "rgba(22, 28, 24, 0.55)";
  ctx.fillRect(0, roadY, W, roadH);

  // Viền đường
  ctx.strokeStyle = "rgba(120, 150, 120, 0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, roadY); ctx.lineTo(W, roadY);
  ctx.moveTo(0, roadY + roadH); ctx.lineTo(W, roadY + roadH);
  ctx.stroke();

  // Vạch đứt đoạn
  ctx.strokeStyle = "rgba(240, 240, 200, 0.22)";
  ctx.lineWidth = 3;
  ctx.setLineDash([35, 45]);
  const dashOff = (-cameraX) % 80;
  ctx.beginPath();
  ctx.moveTo(dashOff - 100, H * 0.5);
  ctx.lineTo(W + 100, H * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawShelterZone() {
  const gScreenX = sx(goalX);
  if (gScreenX > W + 400 || gScreenX < -800) return;

  const pulse = Math.sin(performance.now() / 250) * 0.2 + 0.8;

  // Vạch an toàn
  ctx.strokeStyle = `rgba(84, 233, 154, ${pulse * 0.9})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(gScreenX, 0); ctx.lineTo(gScreenX, H); ctx.stroke();

  // Ánh sáng an toàn
  const safeGrad = ctx.createLinearGradient(gScreenX, 0, gScreenX + 500, 0);
  safeGrad.addColorStop(0, `rgba(84, 233, 154, ${pulse * 0.25})`);
  safeGrad.addColorStop(1, "rgba(84, 233, 154, 0.02)");
  ctx.fillStyle = safeGrad;
  ctx.fillRect(gScreenX, 0, 500, H);

  // Biển báo trạm
  ctx.save();
  ctx.fillStyle = "#10281c"; ctx.strokeStyle = "#54e99a"; ctx.lineWidth = 2;
  const bx = gScreenX + 15, by = 40;
  ctx.fillRect(bx, by, 280, 46); ctx.strokeRect(bx, by, 280, 46);
  ctx.fillStyle = "#7dffad"; ctx.font = "bold 16px 'Barlow Condensed', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🏕️ TRẠM CỨU TRỢ AN TOÀN", bx + 140, by + 28);
  ctx.restore();

  // Lều cứu trợ chữ thập đỏ
  const tentX = gScreenX + 80, tentY = H * 0.28, tentW = 140, tentH = 90;
  ctx.fillStyle = "#264234";
  ctx.beginPath();
  ctx.moveTo(tentX, tentY + tentH);
  ctx.lineTo(tentX + tentW / 2, tentY);
  ctx.lineTo(tentX + tentW, tentY + tentH);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4ea87d"; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(tentX + tentW / 2 - 4, tentY + tentH / 2 - 14, 8, 28);
  ctx.fillRect(tentX + tentW / 2 - 14, tentY + tentH / 2 - 4, 28, 8);

  // Trực thăng
  const heliX = gScreenX + 260, heliY = H * 0.48;
  ctx.fillStyle = "#1e3028"; ctx.fillRect(heliX, heliY - 20, 90, 40);
  ctx.strokeStyle = "#54e99a"; ctx.strokeRect(heliX, heliY - 20, 90, 40);
  const propAngle = (performance.now() / 40);
  ctx.strokeStyle = "rgba(200, 240, 220, 0.7)"; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(heliX + 45 - Math.cos(propAngle) * 50, heliY - 26);
  ctx.lineTo(heliX + 45 + Math.cos(propAngle) * 50, heliY - 26);
  ctx.stroke();
}

function drawBarrels() {
  barrels.forEach(b => {
    const px = sx(b.x);
    if (px < -40 || px > W + 40) return;
    ctx.fillStyle = "#c82333";
    ctx.beginPath(); ctx.arc(px, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ffe153"; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center"; ctx.fillText("TNT", px, b.y + 4);
  });
}

function drawSupplies() {
  supplies.forEach(s => {
    const px = sx(s.x);
    if (px < -60 || px > W + 60) return;

    if (s.type === "ammo") {
      ctx.fillStyle = "#ffd13b";
      ctx.fillRect(px - 14, s.y - 14, 28, 28);
      ctx.strokeStyle = "#ffea79"; ctx.lineWidth = 2; ctx.strokeRect(px - 14, s.y - 14, 28, 28);
      ctx.fillStyle = "#000"; ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center"; ctx.fillText("⚡", px, s.y + 5);
    } else {
      if (supplySprite && spritesLoaded) {
        ctx.drawImage(supplySprite, px - 24, s.y - 24, 48, 48);
      } else {
        ctx.fillStyle = "#47e68b"; ctx.fillRect(px - 14, s.y - 14, 28, 28);
        ctx.fillStyle = "white"; ctx.fillRect(px - 3, s.y - 10, 6, 20); ctx.fillRect(px - 10, s.y - 3, 20, 6);
      }
    }
    const pulse = Math.sin(performance.now() / 200) * 3 + 18;
    ctx.strokeStyle = s.type === "ammo" ? "rgba(255, 230, 80, 0.5)" : "rgba(140, 240, 167, 0.45)";
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, s.y, pulse, 0, Math.PI * 2); ctx.stroke();
  });
}

function drawPlayer() {
  const px = sx(player.x);
  const bobY = Math.sin(player.bobTimer) * 3;
  const py = player.y + bobY;

  // Vẽ nhân vật từ Atlas theo nhân vật đang trang bị
  let drawn = false;
  if (typeof ATLAS !== "undefined" && ATLAS.ready && typeof charRect === "function") {
    const chIdx = equipStats && equipStats.character ? equipStats.character.idx : 0;
    const r = charRect(chIdx, player.dir);
    const sh = 62;
    const sw = sh * (r[2] / r[3]);
    ctx.drawImage(ATLAS.img, r[0], r[1], r[2], r[3], px - sw / 2, py - sh / 2, sw, sh);
    drawn = true;
  }

  if (!drawn) {
    const spr = playerSprites[player.dir] || playerSprites["right"];
    if (spr && spritesLoaded) {
      const scale = 54 / spr.height;
      ctx.drawImage(spr, px - (spr.width * scale) / 2, py - 27, spr.width * scale, 54);
    } else {
      ctx.fillStyle = "#56e88d";
      ctx.beginPath(); ctx.arc(px, py, player.radius, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#d4ffe1"; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  // Vẽ khẩu súng đang trang bị trên tay nhân vật
  if (typeof ATLAS !== "undefined" && ATLAS.ready && equipStats && equipStats.gun) {
    const g = equipStats.gun;
    const gr = g.rect;
    const gw = Math.max(18, Math.min(42, 16 + gr[2] * 0.09));
    const gh = gw * (gr[3] / gr[2]);
    ctx.save();
    ctx.translate(px + Math.cos(aimAngle) * 10, py + Math.sin(aimAngle) * 6 + 3);
    ctx.rotate(aimAngle);
    if (aimAngle > Math.PI / 2 || aimAngle < -Math.PI / 2) {
      ctx.scale(1, -1); // lật súng để không bị ngược khi ngắm sang trái
    }
    ctx.drawImage(ATLAS.img, gr[0], gr[1], gr[2], gr[3],
      -gw * 0.35, -gh / 2, gw, gh);
    ctx.restore();
  }

  // Hiệu ứng dính độc xanh quanh người chơi
  if (player.slowTimer > 0) {
    ctx.strokeStyle = "rgba(57, 231, 122, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(px, py, player.radius + 6, 0, Math.PI * 2); ctx.stroke();
  }

  // Tên & Vạch máu nhỏ
  ctx.fillStyle = "#7dffad"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("SURVIVOR", px, py - player.radius - 16);
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(px - 16, py - player.radius - 12, 32, 4);
  ctx.fillStyle = "#39e77a"; ctx.fillRect(px - 16, py - player.radius - 12, (health / maxHealth) * 32, 4);
}

function drawZombie(z) {
  const zx = sx(z.x);
  if (zx < -100 || zx > W + 100) return;

  const spr = zombieSprites[z.dir] || zombieSprites["left"];
  const isTankOrBoss = (z.type === "tanker" || z.type === "boss");
  const renderHeight = z.type === "boss" ? 85 : (z.type === "tanker" ? 64 : (z.type === "crawler" ? 28 : 46));

  ctx.save();
  // Quầng sáng theo loại quái
  if (z.type === "runner") {
    ctx.shadowColor = "#ff3333"; ctx.shadowBlur = 14;
  } else if (z.type === "spitter") {
    ctx.shadowColor = "#39e77a"; ctx.shadowBlur = 10;
  } else if (z.type === "exploder") {
    ctx.shadowColor = "#ff9900"; ctx.shadowBlur = 16;
  } else if (z.type === "boss") {
    ctx.shadowColor = "#ff0033"; ctx.shadowBlur = 25;
  }

  if (spr && spritesLoaded) {
    const scale = renderHeight / spr.height;
    const sw = spr.width * scale;
    ctx.drawImage(spr, zx - sw / 2, z.y - renderHeight / 2, sw, renderHeight);
  } else {
    ctx.fillStyle = z.color;
    ctx.beginPath(); ctx.arc(zx, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#331111"; ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.restore();

  // Nhãn loại quái & thanh máu
  if (z.maxHp > 1 && z.type !== "boss") {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(zx - 16, z.y - z.radius - 12, 32, 4);
    ctx.fillStyle = z.type === "tanker" ? "#af52de" : "#ff9500";
    ctx.fillRect(zx - 16, z.y - z.radius - 12, (z.hp / z.maxHp) * 32, 4);
  }
}

function drawAcid() {
  acidProjectiles.forEach(a => {
    const ax = sx(a.x);
    ctx.fillStyle = "#39e77a";
    ctx.beginPath(); ctx.arc(ax, a.y, a.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#a3ffca"; ctx.lineWidth = 2; ctx.stroke();
  });
}

function drawBullets() {
  bullets.forEach(b => {
    const bx = sx(b.x);
    if (bulletSprite && spritesLoaded) {
      ctx.drawImage(bulletSprite, bx - 8, b.y - 8, 16, 16);
    } else {
      ctx.fillStyle = b.powered ? "#ffe153" : "#fff570";
      ctx.beginPath(); ctx.arc(bx, b.y, b.powered ? 6 : 4, 0, Math.PI * 2); ctx.fill();
    }
  });
}

function drawParticles() {
  particles.forEach(p => {
    const px = sx(p.x);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.beginPath(); ctx.arc(px, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1.0;
}

function drawFloatingTexts() {
  floatingTexts.forEach(t => {
    const tx = sx(t.x);
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
    ctx.fillStyle = t.color;
    ctx.font = "bold 15px 'Rajdhani', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000"; ctx.shadowBlur = 4;
    ctx.fillText(t.text, tx, t.y);
    ctx.restore();
  });
}

function draw() {
  let shakeX = 0, shakeY = 0;
  if (shakeTimer > 0) {
    shakeX = (Math.random() - 0.5) * 12;
    shakeY = (Math.random() - 0.5) * 12;
  }
  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawShelterZone();
  drawBarrels();
  drawSupplies();
  drawAcid();
  zombies.forEach(drawZombie);
  drawBullets();
  drawPlayer();
  drawParticles();
  drawFloatingTexts();

  ctx.restore();
}

function loop(timestamp) {
  if (!gameRunning || paused) return;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  update(dt);
  draw();

  if (gameRunning && !paused) animationId = requestAnimationFrame(loop);
}

// ─── CHẠY NỀN KHI CHUYỂN TAB / ẨN CỬA SỔ ───────────────────────
// requestAnimationFrame ngừng hẳn khi tab ẩn -> dùng setInterval
// (trình duyệt cho chạy ~1 giây/lần khi ẩn) và bù lại đúng thời gian thực.
let bgTimer = null;

function backgroundTick() {
  if (!gameRunning || paused || inShelter) { stopBackgroundLoop(); return; }
  const now = performance.now();
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  if (dt <= 0) return;
  if (dt > 3) dt = 3; // máy ngủ / bị throttle quá lâu thì chỉ bù tối đa 3 giây
  while (dt > 0.0001) {
    update(Math.min(0.08, dt));
    if (!gameRunning || paused) break;
    dt -= 0.08;
  }
}

function startBackgroundLoop() {
  if (bgTimer) return;
  bgTimer = setInterval(backgroundTick, 500);
  backgroundTick();
}

function stopBackgroundLoop() {
  if (bgTimer) { clearInterval(bgTimer); bgTimer = null; }
}

// Bắt đầu / nối lại vòng lặp chính, tránh chạy trùng 2 vòng
function ensureLoop() {
  if (!gameRunning || paused) return;
  if (document.hidden) {
    stopBackgroundLoop();
    startBackgroundLoop();
    return;
  }
  stopBackgroundLoop();
  if (animationId) cancelAnimationFrame(animationId);
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (gameRunning && !paused && !inShelter) startBackgroundLoop();
  } else {
    stopBackgroundLoop();
    if (gameRunning && !paused && !inShelter) {
      lastTime = performance.now();
      animationId = requestAnimationFrame(loop);
    }
  }
});

function updateHUD() {
  $("score").textContent = score;
  $("wave").textContent = wave;
  $("hpText").textContent = Math.max(0, Math.ceil(health)) + "/" + maxHealth;
  $("healthBar").style.width = Math.max(0, Math.min(100, (health / maxHealth) * 100)) + "%";

  const staminaBar = $("staminaBar");
  if (staminaBar) staminaBar.style.width = Math.max(0, Math.min(100, stamina)) + "%";

  const distTotal = goalX - waveStartX;
  const currentDist = player.x - waveStartX;
  const progress = Math.max(0, Math.min(1, currentDist / distTotal));

  const barEl = $("runProgressBar");
  if (barEl) barEl.style.width = (progress * 100).toFixed(1) + "%";

  const remainingMeters = Math.max(0, Math.ceil((goalX - player.x) / 10));
  const distTextEl = $("distText");
  if (distTextEl) {
    if (remainingMeters <= 0) {
      distTextEl.textContent = "ĐÃ ĐẾN TRẠM CỨU TRỢ!";
      distTextEl.style.color = "#7dffad";
    } else if (remainingMeters < 50) {
      distTextEl.textContent = "SẮP TỚI! CÒN: " + remainingMeters + "m";
      distTextEl.style.color = "#ffea79";
    } else {
      distTextEl.textContent = "CÒN: " + remainingMeters + "m";
      distTextEl.style.color = "#c4d6cb";
    }
  }
}

function showMessage(text) { $("message").textContent = text; messageTimer = 2.4; }
function addFloatingText(x, y, text, color = "#7dffad") { floatingTexts.push({ x, y, text, color, life: 1.0, maxLife: 1.0 }); }
function addParticle(x, y, color = "#ff4444", count = 6) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 100;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.3, maxLife: 0.7, color, size: 2 + Math.random() * 3
    });
  }
}
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

// Áp dụng giáp giảm sát thương, trả về lượng máu thực nhận
function damagePlayer(amount) {
  const armor = equipStats ? equipStats.armor : 0;
  const reduced = Math.max(1, Math.round(amount * (1 - armor)));
  health -= reduced;
  return reduced;
}

// Áp dụng lại trang bị khi người chơi đổi đồ giữa ván
function refreshLoadout() {
  if (typeof getEquipStats !== "function") return;
  const oldMax = maxHealth || 100;
  equipStats = getEquipStats();
  maxHealth = equipStats.maxHp;
  // Chỉ cập nhật người chơi khi đang trong ván
  if (player) {
    health = Math.max(1, Math.min(maxHealth, Math.round((health / oldMax) * maxHealth)));
    player.baseSpeed = 195 * equipStats.speedMul;
    player.sprintSpeed = 315 * equipStats.speedMul;
    updateHUD();
  } else {
    health = maxHealth;
  }
}
function angleToDirection(angle) {
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  if (a >= Math.PI * 1.75 || a < Math.PI * 0.25) return "right";
  if (a >= Math.PI * 0.25 && a < Math.PI * 0.75) return "down";
  if (a >= Math.PI * 0.75 && a < Math.PI * 1.25) return "left";
  return "up";
}

function endGame() {
  gameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
  stopBackgroundLoop();
  if (shelterInterval) clearInterval(shelterInterval);
  hide("chaseWarning");
  hide("bossBarWrap");

  // Quy đổi điểm của ván chơi thành điểm tích lũy (cửa hàng)
  const coinMul = equipStats ? equipStats.coinMul : 1;
  const earned = Math.max(0, Math.floor((score / 5) * coinMul));
  if (typeof addCoins === "function") addCoins(earned);

  if (score > best) { best = score; localStorage.setItem(currentBestKey(), best); }
  $("finalScore").textContent = score;
  $("finalBest").textContent = best;
  if ($("bestScore")) $("bestScore").textContent = best;
  if ($("earnedCoins")) $("earnedCoins").textContent = earned.toLocaleString("vi-VN");
  if (typeof refreshCoinUI === "function") refreshCoinUI();
  show("gameOver");
  $("mobileControls").style.display = "none";
}

function backToMenu() {
  gameRunning = false;
  paused = false;
  if (animationId) cancelAnimationFrame(animationId);
  stopBackgroundLoop();
  if (shelterInterval) clearInterval(shelterInterval);
  ["guide", "pauseMenu", "gameOver", "hud", "shelterModal", "bossBarWrap"].forEach(hide);
  hide("gameScreen");
  show("landingPage");
  $("mobileControls").style.display = "none";
}

function togglePause() {
  if (!gameRunning || inShelter) return;
  paused = !paused;
  paused ? show("pauseMenu") : hide("pauseMenu");
  $("pauseBtn").textContent = paused ? "▶ TIẾP TỤC" : "Ⅱ TẠM DỪNG";
  if (paused) {
    stopBackgroundLoop();
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
  } else {
    ensureLoop();
  }
}

// ─── Input & Buttons ────────────────────────────────────────────
window.addEventListener("keydown", e => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  keys[e.key] = true;
  if (e.key === "Escape" && gameRunning) togglePause();
});
window.addEventListener("keyup", e => { keys[e.key] = false; });
window.addEventListener("blur", () => { keys = {}; });

document.querySelectorAll("[data-key]").forEach(btn => {
  const key = btn.dataset.key;
  btn.addEventListener("pointerdown", e => { e.preventDefault(); keys[key] = true; btn.setPointerCapture(e.pointerId); });
  const release = () => { keys[key] = false; };
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("lostpointercapture", release);
});

const on = (id, fn) => { const el = $(id); if (el) el.addEventListener("click", fn); };
on("playBtn", startGame);
on("landingPlayBtn", startGame);
on("aboutPlayBtn", startGame);
on("unusedPlayBtn", startGame);
on("retryBtn", startGame);
on("guideBtn", () => show("guide"));
on("landingGuideBtn", () => { show("gameScreen"); show("guide"); });
on("closeGuideBtn", () => {
  hide("guide");
  if (!gameRunning) { hide("gameScreen"); show("landingPage"); }
});
on("pauseBtn", togglePause);
on("resumeBtn", togglePause);
on("menuBtn", backToMenu);
on("gameOverMenuBtn", backToMenu);
on("nextWaveBtn", () => {
  if (inShelter) {
    if (shelterInterval) clearInterval(shelterInterval);
    nextWave();
  }
});

drawBackground();
