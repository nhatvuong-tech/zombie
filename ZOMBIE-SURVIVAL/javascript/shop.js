// ===============================================================
// SHOP / CỬA HÀNG SINH TỒN - Mua nhân vật, súng, phụ kiện bằng điểm
// ===============================================================

const ATLAS_SRC = "../anh/Zombie Survival Game Asset Atlas.png";

const ATLAS = { img: new Image(), ready: false };
ATLAS.img.onload = () => { ATLAS.ready = true; };
ATLAS.img.src = ATLAS_SRC;

// ─── Dữ liệu Cửa hàng ───────────────────────────────────────────
// rect = [sx, sy, sw, sh] cắt từ atlas 1536x1024
const SHOP = {
  characters: [
    {
      id: "boy", name: "NAM SINH TỒN", price: 0, idx: 0,
      desc: "Chàng trai áo hoodie, cân bằng mọi chỉ số. Phù hợp cho người mới.",
      hp: 100, speed: 1.0, dmg: 1.0, tag: "CÂN BẰNG"
    },
    {
      id: "girl", name: "NỮ XẠ THỦ", price: 900, idx: 1,
      desc: "Cô gái tóc đuôi ngựa nhanh nhẹn, chạy nhanh hơn 18% nhưng máu mỏng hơn.",
      hp: 90, speed: 1.18, dmg: 1.0, tag: "TỐC ĐỘ"
    },
    {
      id: "swat", name: "BIỆT KÍCH SWAT", price: 2200, idx: 2,
      desc: "Lính đặc nhiệm bọc giáp toàn thân. Máu cực trâu nhưng hơi nặng nề.",
      hp: 150, speed: 0.92, dmg: 1.05, tag: "PHÒNG THỦ"
    },
    {
      id: "cowboy", name: "CAO BỒI HOANG DÃ", price: 3200, idx: 3,
      desc: "Tay súng hoang dã với sát thương cực mạnh, chạy nhanh vừa phải.",
      hp: 100, speed: 1.05, dmg: 1.35, tag: "SÁT THƯƠNG"
    }
  ],
  guns: [
    {
      id: "pistol", name: "SÚNG LỤC CŨ", price: 0,
      rect: [18, 566, 78, 48],
      desc: "Khẩu lục cũ kỹ nhưng bền bỉ. Bắn nhanh, xuyên 2 quái.",
      dmg: 1, rate: 0.20, pierce: 2, shots: 1, splash: 0, tag: "KHỞI ĐẦU"
    },
    {
      id: "pistol2", name: "SÚNG LỤC IM LẶNG", price: 650,
      rect: [102, 566, 66, 48],
      desc: "Lục nòng giảm thanh, mỗi phát mạnh gấp đôi lục thường.",
      dmg: 2, rate: 0.18, pierce: 2, shots: 1, splash: 0, tag: "NÂNG CẤP"
    },
    {
      id: "smg", name: "SMG TINH XẢO", price: 1300,
      rect: [430, 558, 84, 64],
      desc: "Súng tiểu liên bắn xối xả, tốc độ bắn cực nhanh.",
      dmg: 1, rate: 0.09, pierce: 2, shots: 1, splash: 0, tag: "LIÊN THANH"
    },
    {
      id: "carbine", name: "SÚNG TRƯỜNG CŨ", price: 1800,
      rect: [518, 564, 134, 56],
      desc: "Súng trường quân đội cũ. Cân bằng giữa sát thương và tốc độ.",
      dmg: 2, rate: 0.16, pierce: 3, shots: 1, splash: 0, tag: "CÂN BẰNG"
    },
    {
      id: "ak", name: "AK-47 HOANG TÀN", price: 3000,
      rect: [1033, 566, 212, 56],
      desc: "Huyền thoại chiến tranh. Sát thương gấp đôi, xuyên 3 quái.",
      dmg: 2, rate: 0.14, pierce: 3, shots: 1, splash: 0, tag: "SÁT THƯƠNG"
    },
    {
      id: "bullpup", name: "BULLPUP CHIẾN THUẬT", price: 4200,
      rect: [836, 564, 184, 58],
      desc: "Súng trường bullpup gọn nhẹ, bắn nhanh và xuyên 4 quái.",
      dmg: 2, rate: 0.10, pierce: 4, shots: 1, splash: 0, tag: "TỐC ĐỘ"
    },
    {
      id: "smg2", name: "SÚNG ĐẶC NHIỆM", price: 4500,
      rect: [1421, 564, 108, 58],
      desc: "Tiểu liên đặc nhiệm, nhả đạn dày đặc như mưa.",
      dmg: 1, rate: 0.05, pierce: 2, shots: 1, splash: 0, tag: "LIÊN THANH"
    },
    {
      id: "sniper", name: "SNIPER BÓNG ĐÊM", price: 4600,
      rect: [302, 630, 220, 68],
      desc: "Súng bắn tỉa hạng nặng. Một phát xuyên 5 quái, sát thương cực lớn.",
      dmg: 4, rate: 0.34, pierce: 5, shots: 1, splash: 0, tag: "XUYÊN THẤU"
    },
    {
      id: "burst", name: "SÚNG BURST CHIẾN THUẬT", price: 5000,
      rect: [318, 700, 186, 72],
      desc: "Súng trường bắn loạt 3 phát cực nhanh, quét sạch hàng đầu.",
      dmg: 2, rate: 0.42, pierce: 2, shots: 3, spread: 0.10, splash: 0, tag: "BURST 3"
    },
    {
      id: "dmr", name: "SÚNG TỈA HẠNG NẶNG", price: 5600,
      rect: [766, 628, 230, 72],
      desc: "Súng tỉa bán tự động. Sát thương khủng, xuyên 6 quái một phát.",
      dmg: 5, rate: 0.50, pierce: 6, shots: 1, splash: 0, tag: "XUYÊN THẤU"
    },
    {
      id: "crossbow", name: "NỎ XUYÊN PHÁ", price: 6000,
      rect: [960, 710, 122, 62],
      desc: "Nỏ chiến đấu bắn mũi tên nặng, xuyên thủng cả bầy zombie.",
      dmg: 4, rate: 0.45, pierce: 5, shots: 1, splash: 0, tag: "XUYÊN THẤU"
    },
    {
      id: "minigun", name: "MINIGUN HỦY DIỆT", price: 7200,
      rect: [1100, 710, 126, 76],
      desc: "Súng máy 6 nòng xoay. Bắn 2 tia mỗi phát với tốc độ điên cuồng.",
      dmg: 1, rate: 0.055, pierce: 2, shots: 2, spread: 0.10, splash: 0, tag: "HỦY DIỆT"
    },
    {
      id: "pulse", name: "SÚNG XUNG KÍCH", price: 8200,
      rect: [1006, 632, 160, 58],
      desc: "Súng trường năng lượng thử nghiệm. Bắn cực nhanh, sát thương cao.",
      dmg: 3, rate: 0.07, pierce: 3, shots: 1, splash: 0, tag: "NĂNG LƯỢNG"
    },
    {
      id: "rpg", name: "RPG DIỆT BẦY", price: 9800,
      rect: [1191, 634, 254, 58],
      desc: "Rốc-két chống tăng. Đạn nổ diện rộng quét sạch cả bầy zombie.",
      dmg: 3, rate: 0.85, pierce: 1, shots: 1, splash: 95, tag: "NỔ DIỆN RỘNG"
    }
  ],
  accessories: [
    {
      id: "vest", name: "GIÁP CHỐNG ĐẠN", price: 900,
      rect: [318, 930, 72, 72],
      desc: "Áo giáp Kevlar dày. Tăng 30 máu tối đa.",
      stats: { maxHp: 30 }, tag: "+30 MÁU"
    },
    {
      id: "helmet", name: "MŨ BẢO HỘ", price: 1100,
      rect: [12, 928, 68, 74],
      desc: "Mũ sắt quân đội. Giảm 20% sát thương nhận vào.",
      stats: { armor: 0.2 }, tag: "-20% SÁT THƯƠNG"
    },
    {
      id: "jacket", name: "ÁO KHOÁC DA", price: 1200,
      rect: [968, 936, 66, 80],
      desc: "Áo khoác da dày, vừa ấm vừa nhẹ. Tăng 15 máu và 5% tốc độ.",
      stats: { maxHp: 15, speedMul: 1.05 }, tag: "+MÁU +TỐC ĐỘ"
    },
    {
      id: "backpack", name: "BA LÔ TIẾP TẾ", price: 1400,
      rect: [412, 928, 72, 76],
      desc: "Ba lô đựng quân nhu. Nhận thêm 20% điểm sau mỗi ván.",
      stats: { coinMul: 1.2 }, tag: "+20% ĐIỂM"
    },
    {
      id: "strawhat", name: "MŨ RƠM MAY MẮN", price: 1500,
      rect: [1051, 940, 66, 64],
      desc: "Mũ rơm của kẻ lang bạt. Nhận thêm 15% điểm sau mỗi ván.",
      stats: { coinMul: 1.15 }, tag: "+15% ĐIỂM"
    },
    {
      id: "boots", name: "GIÀY CHẠY NHANH", price: 1600,
      rect: [833, 932, 56, 74],
      desc: "Giày thể thao quân sự. Tăng 12% tốc độ chạy.",
      stats: { speedMul: 1.12 }, tag: "+12% TỐC ĐỘ"
    },
    {
      id: "gasmask", name: "MẶT NẠ PHÒNG ĐỘC", price: 1800,
      rect: [155, 930, 74, 74],
      desc: "Lọc khí chuyên dụng. Miễn nhiễm hiệu ứng làm chậm của axit.",
      stats: { poisonImmune: true }, tag: "MIỄN NHIỄM ĐỘC"
    },
    {
      id: "goggles", name: "KÍNH XẠ THỦ", price: 2000,
      rect: [1208, 944, 44, 62],
      desc: "Kính ngắm chiến thuật. Tăng 12% sát thương gây ra.",
      stats: { dmgMul: 1.12 }, tag: "+12% SÁT THƯƠNG"
    },
    {
      id: "medbag", name: "BA LÔ CỨU THƯƠNG", price: 2400,
      rect: [503, 930, 76, 80],
      desc: "Ba lô y tế hồi 2 máu mỗi giây và hút quân nhu từ xa.",
      stats: { regen: 2, magnet: 55 }, tag: "HỒI MÁU + HÚT ĐỒ"
    },
    {
      id: "heavyvest", name: "GIÁP HẠNG NẶNG", price: 2600,
      rect: [693, 930, 62, 76],
      desc: "Giáp chiến thuật hạng nặng. Giảm 30% sát thương nhận vào nhưng hơi nặng.",
      stats: { armor: 0.3, speedMul: 0.95 }, tag: "-30% SÁT THƯƠNG"
    },
    {
      id: "tacmask", name: "MẶT NẠ CHIẾN THUẬT", price: 2800,
      rect: [1127, 940, 72, 74],
      desc: "Mặt nạ lọc độc kiêm giáp mặt. Miễn nhiễm độc và giảm 10% sát thương.",
      stats: { poisonImmune: true, armor: 0.1 }, tag: "ĐỘC + GIÁP"
    },
    {
      id: "boots2", name: "GIÀY DA VIỄN CHINH", price: 3000,
      rect: [774, 940, 54, 66],
      desc: "Bốt da bền bỉ của dân viễn chinh. Tăng 18% tốc độ chạy.",
      stats: { speedMul: 1.18 }, tag: "+18% TỐC ĐỘ"
    }
  ]
};

// ─── Hồ sơ người chơi (lưu LocalStorage) ────────────────────────
const PROFILE_KEY = "lastDayProfile_v1";

function defaultProfile() {
  return {
    version: 1,
    coins: 0,
    owned: { boy: true, pistol: true },
    equipped: { character: "boy", gun: "pistol", accessories: [] }
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const p = JSON.parse(raw);
    const d = defaultProfile();
    return {
      version: 1,
      coins: Number(p.coins) || 0,
      owned: Object.assign({}, d.owned, p.owned || {}),
      equipped: {
        character: (p.equipped && p.equipped.character) || "boy",
        gun: (p.equipped && p.equipped.gun) || "pistol",
        accessories: Array.isArray(p.equipped && p.equipped.accessories)
          ? p.equipped.accessories.slice(0, 2) : []
      }
    };
  } catch (e) {
    return defaultProfile();
  }
}

let profile = loadProfile();

function saveProfile() {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (e) {}
}

function addCoins(amount) {
  profile.coins = Math.max(0, Math.floor(profile.coins + amount));
  saveProfile();
  refreshCoinUI();
}

function refreshCoinUI() {
  const ids = ["shopCoins", "hudCoins", "menuCoins", "gameOverCoins"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = profile.coins.toLocaleString("vi-VN");
  });
  const shopCoins = document.getElementById("shopCoins");
  if (shopCoins) shopCoins.textContent = profile.coins.toLocaleString("vi-VN");
}

// ─── Tính chỉ số từ trang bị đang dùng ──────────────────────────
function getEquipStats() {
  const ch = SHOP.characters.find(c => c.id === profile.equipped.character) || SHOP.characters[0];
  const gun = SHOP.guns.find(g => g.id === profile.equipped.gun) || SHOP.guns[0];

  let maxHp = ch.hp;
  let speedMul = ch.speed;
  let dmgMul = ch.dmg;
  let coinMul = 1;
  let armor = 0;
  let poisonImmune = false;
  let regen = 0;
  let magnet = 0;

  profile.equipped.accessories.forEach(id => {
    const a = SHOP.accessories.find(x => x.id === id);
    if (!a || !a.stats) return;
    if (a.stats.maxHp) maxHp += a.stats.maxHp;
    if (a.stats.speedMul) speedMul *= a.stats.speedMul;
    if (a.stats.dmgMul) dmgMul *= a.stats.dmgMul;
    if (a.stats.coinMul) coinMul *= a.stats.coinMul;
    if (a.stats.armor) armor += a.stats.armor;
    if (a.stats.poisonImmune) poisonImmune = true;
    if (a.stats.regen) regen += a.stats.regen;
    if (a.stats.magnet) magnet += a.stats.magnet;
  });

  armor = Math.min(0.7, armor);

  return { maxHp, speedMul, dmgMul, coinMul, armor, poisonImmune, regen, magnet, character: ch, gun };
}

// ─── Rect sprite nhân vật trong atlas ───────────────────────────
// Mỗi nhân vật chiếm 4 cột (384px), mỗi hướng 1 hàng (135px)
function charRect(charIdx, dir) {
  const row = dir === "down" ? 0 : dir === "left" ? 1 : dir === "up" ? 2 : 3;
  return [charIdx * 384 + 5, row * 135 + 3, 86, 132];
}

function atlasIconStyle(rect, boxW, boxH) {
  const sx = rect[0], sy = rect[1], sw = rect[2], sh = rect[3];
  const k = Math.min(boxW / sw, boxH / sh);
  const w = 1536 * k;
  const h = 1024 * k;
  const ox = -(sx * k) + (boxW - sw * k) / 2;
  const oy = -(sy * k) + (boxH - sh * k) / 2;
  return "background-image:url('" + ATLAS_SRC + "');" +
    "background-size:" + w + "px " + h + "px;" +
    "background-position:" + ox + "px " + oy + "px;" +
    "background-repeat:no-repeat;";
}

// ─── Giao diện Cửa hàng ─────────────────────────────────────────
let shopTab = "characters";
let previousGameState = null;

function isOwned(item) { return !!profile.owned[item.id]; }

function isEquipped(item) {
  if (shopTab === "characters") return profile.equipped.character === item.id;
  if (shopTab === "guns") return profile.equipped.gun === item.id;
  return profile.equipped.accessories.indexOf(item.id) !== -1;
}

function canEquipAccessory() {
  return profile.equipped.accessories.length < 2;
}

function shopAction(item) {
  const isAcc = shopTab === "accessories";
  const equippedNow = isEquipped(item);
  const buying = !isOwned(item);
  const noSlot = isAcc && !equippedNow && !canEquipAccessory();

  if (buying) {
    if (profile.coins < item.price) {
      flashShopMessage("Không đủ điểm! Cần thêm " + (item.price - profile.coins).toLocaleString("vi-VN") + " điểm.");
      return;
    }
    profile.coins -= item.price;
    profile.owned[item.id] = true;
    saveProfile();
    refreshCoinUI();
    // Mua xong mà hết chỗ thì chỉ sở hữu, chưa trang bị
    if (noSlot) {
      renderShop();
      flashShopMessage("Đã mua " + item.name + "! Tháo bớt phụ kiện để trang bị.");
      return;
    }
  } else if (noSlot) {
    flashShopMessage("Chỉ được trang bị tối đa 2 phụ kiện! Hãy tháo bớt một món.");
    return;
  }

  // Trang bị
  if (shopTab === "characters") {
    profile.equipped.character = item.id;
  } else if (shopTab === "guns") {
    profile.equipped.gun = item.id;
  } else {
    const idx = profile.equipped.accessories.indexOf(item.id);
    if (idx >= 0) {
      profile.equipped.accessories.splice(idx, 1);
      if (!buying) flashShopMessage("Đã tháo " + item.name);
    } else {
      profile.equipped.accessories.push(item.id);
      if (!buying) flashShopMessage("Đã trang bị " + item.name);
    }
  }

  saveProfile();
  renderShop();
  refreshCoinUI();
  if (buying) flashShopMessage("Đã mua và trang bị " + item.name + "!");
}

function flashShopMessage(text) {
  const el = document.getElementById("shopMsg");
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function shopItemRect(item) {
  if (shopTab === "characters") return charRect(item.idx, "down");
  return item.rect;
}

function renderShop() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const items = SHOP[shopTab] || [];
  const maxOwned = isOwned;

  // Sắp xếp: đang trang bị trước, rồi sở hữu, rồi chưa sở hữu
  const sorted = items.slice().sort((a, b) => {
    const ea = isEquipped(a) ? 0 : (isOwned(a) ? 1 : 2);
    const eb = isEquipped(b) ? 0 : (isOwned(b) ? 1 : 2);
    return ea - eb;
  });

  grid.innerHTML = sorted.map(item => {
    const owned = maxOwned(item);
    const equipped = isEquipped(item);
    const rect = shopItemRect(item);
    const iconStyle = atlasIconStyle(rect, 92, 100);

    let statsHtml = "";
    if (shopTab === "characters") {
      statsHtml = '<div class="si-stats">' +
        '<span>❤️ ' + item.hp + ' HP</span>' +
        '<span>🏃 ' + Math.round(item.speed * 100) + '%</span>' +
        '<span>💥 ' + Math.round(item.dmg * 100) + '%</span></div>';
    } else if (shopTab === "guns") {
      statsHtml = '<div class="si-stats">' +
        '<span>💥 DMG ' + item.dmg + '</span>' +
        '<span>⚡ ' + (1 / item.rate).toFixed(1) + '/s</span>' +
        '<span>🎯 Xuyên ' + item.pierce + '</span></div>';
    } else {
      statsHtml = '<div class="si-stats"><span class="green">' + (item.tag || "") + '</span></div>';
    }

    let btnLabel = "MUA " + item.price.toLocaleString("vi-VN") + " 💰";
    let btnClass = "shop-buy";
    const slotsFull = shopTab === "accessories" && !equipped &&
      profile.equipped.accessories.length >= 2;
    if (owned) {
      if (equipped) {
        btnLabel = shopTab === "accessories" ? "✔ ĐANG DÙNG (BẤM ĐỂ THÁO)" : "✔ ĐANG DÙNG";
        btnClass = "shop-owned";
      }
      else if (slotsFull) { btnLabel = "HẾT CHỖ - THÁO BỚT"; btnClass = "shop-locked"; }
      else { btnLabel = "TRANG BỊ"; btnClass = "shop-equip"; }
    } else if (slotsFull) {
      btnLabel = "MUA " + item.price.toLocaleString("vi-VN") + " 💰 (HẾT CHỖ)";
      btnClass = "shop-locked";
    } else if (profile.coins < item.price) {
      btnClass = "shop-locked";
    }

    return '<div class="shop-item' + (equipped ? " equipped" : "") + '">' +
      '<div class="si-icon" style="' + iconStyle + '"></div>' +
      '<div class="si-name">' + item.name + '</div>' +
      '<div class="si-tag">' + (item.tag || "") + '</div>' +
      '<div class="si-desc">' + item.desc + '</div>' +
      statsHtml +
      '<button class="' + btnClass + '" data-id="' + item.id + '">' + btnLabel + '</button>' +
      '</div>';
  }).join("");

  grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = items.find(x => x.id === btn.dataset.id);
      if (item) shopAction(item);
    });
  });

  // Tab active
  document.querySelectorAll(".shop-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === shopTab);
  });

  // Hiển thị tổng quan trang bị
  const loadout = document.getElementById("shopLoadout");
  if (loadout) {
    const st = getEquipStats();
    const accNames = profile.equipped.accessories
      .map(id => (SHOP.accessories.find(a => a.id === id) || {}).name)
      .filter(Boolean);
    loadout.innerHTML =
      '<span>🧍 ' + st.character.name + '</span>' +
      '<span>🔫 ' + st.gun.name + '</span>' +
      '<span>🎒 ' + (accNames.length ? accNames.join(" + ") : "Chưa có") + '</span>' +
      '<span>❤️ ' + st.maxHp + ' HP</span>';
  }
}

function openShop(fromGame) {
  const modal = document.getElementById("shopModal");
  if (!modal) return;

  if (fromGame && typeof gameRunning !== "undefined" && gameRunning) {
    previousGameState = { running: true, wasPaused: paused };
    if (!paused) paused = true;
    const pm = document.getElementById("pauseMenu");
    if (pm) pm.classList.add("hidden");
  } else {
    previousGameState = null;
  }

  renderShop();
  refreshCoinUI();
  modal.classList.remove("hidden");
}

function closeShop() {
  const modal = document.getElementById("shopModal");
  if (modal) modal.classList.add("hidden");

  if (previousGameState && previousGameState.running) {
    if (typeof refreshLoadout === "function") refreshLoadout();
    if (previousGameState.wasPaused) {
      const pm = document.getElementById("pauseMenu");
      if (pm) pm.classList.remove("hidden");
    } else {
      paused = false;
      const pb = document.getElementById("pauseBtn");
      if (pb) pb.textContent = "Ⅱ TẠM DỪNG";
      if (typeof lastTime !== "undefined") lastTime = performance.now();
      if (typeof loop === "function") animationId = requestAnimationFrame(loop);
    }
  }
  previousGameState = null;
}

// ─── Khởi tạo sự kiện Shop ──────────────────────────────────────
function initShop() {
  const modal = document.getElementById("shopModal");
  if (!modal) return;

  document.querySelectorAll(".shop-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      shopTab = tab.dataset.tab;
      renderShop();
    });
  });

  const closeBtn = document.getElementById("shopCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeShop);

  modal.addEventListener("click", e => {
    if (e.target === modal) closeShop();
  });

  document.querySelectorAll("[data-open-shop]").forEach(btn => {
    btn.addEventListener("click", () => openShop(btn.dataset.openShop === "game"));
  });

  refreshCoinUI();
  renderShop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initShop);
} else {
  initShop();
}
