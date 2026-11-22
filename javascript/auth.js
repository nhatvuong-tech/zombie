// ===============================================================
// AUTH - ĐĂNG NHẬP / ĐĂNG KÝ + "DATABASE" (localStorage)
// Mỗi tài khoản có: tên, salt, mật khẩu băm SHA-256, hồ sơ riêng
// (điểm tích lũy, đồ đã mua, trang bị). Khách dùng hồ sơ cũ.
// ===============================================================

const AUTH_DB_KEY = "lastDayAccounts_v1";      // "database" tài khoản
const AUTH_SESSION_KEY = "lastDaySession_v1";  // phiên đăng nhập hiện tại

// ─── Đọc / ghi database ────────────────────────────────────────
function readAccounts() {
  try {
    const a = JSON.parse(localStorage.getItem(AUTH_DB_KEY));
    if (a && a.users) return a;
  } catch (e) {}
  return { users: {} };
}

function writeAccounts(a) {
  try { localStorage.setItem(AUTH_DB_KEY, JSON.stringify(a)); } catch (e) {}
}

// ─── Phiên đăng nhập ───────────────────────────────────────────
function setSession(usernameKey) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username: usernameKey, at: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

// Tên tài khoản đang đăng nhập (khóa chữ thường) hoặc null nếu là khách
function authCurrentUser() {
  try {
    const s = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
    return (s && s.username) || null;
  } catch (e) {
    return null;
  }
}

function authDisplayName() {
  const key = authCurrentUser();
  if (!key) return null;
  const u = readAccounts().users[key];
  return u ? (u.name || key) : key;
}

// ─── Băm mật khẩu (SHA-256 + salt) ──────────────────────────────
async function sha256Hex(text) {
  if (window.crypto && crypto.subtle && window.isSecureContext !== false) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (e) { /* rơi xuống fallback */ }
  }
  // Fallback không phụ thuộc WebCrypto (kết quả 64 ký tự hex)
  let out = "";
  for (let r = 0; r < 8; r++) {
    let h = 5381 + r * 7919;
    for (let i = 0; i < text.length; i++) {
      h = (((h << 5) + h) ^ text.charCodeAt(i)) >>> 0;
      h = (h + r * 31 + i) >>> 0;
    }
    out += ("00000000" + h.toString(16)).slice(-8);
  }
  return out;
}

function randomSalt() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
}

// ─── Hồ sơ của tài khoản ────────────────────────────────────────
function authGetProfile(usernameKey) {
  const u = readAccounts().users[usernameKey];
  return u ? u.profile : null;
}

function authSetProfile(usernameKey, prof) {
  const a = readAccounts();
  if (a.users[usernameKey]) {
    a.users[usernameKey].profile = prof;
    writeAccounts(a);
  }
}

// ─── ĐĂNG KÝ ────────────────────────────────────────────────────
async function registerUser(username, password, cb) {
  username = (username || "").trim();
  if (username.length < 3) return cb({ ok: false, msg: "Tên đăng nhập cần ít nhất 3 ký tự!" });
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return cb({ ok: false, msg: "Tên chỉ gồm: chữ, số, dấu _ và ." });
  if ((password || "").length < 4) return cb({ ok: false, msg: "Mật khẩu cần ít nhất 4 ký tự!" });

  const key = username.toLowerCase();
  const a = readAccounts();
  if (a.users[key]) return cb({ ok: false, msg: "Tên đăng nhập đã tồn tại!" });

  // mang theo hồ sơ khách (điểm/đồ đang có) sang tài khoản mới
  let prof = null;
  try {
    const guest = JSON.parse(localStorage.getItem("lastDayProfile_v1"));
    if (guest && typeof guest === "object" && (guest.owned || guest.coins > 0)) prof = guest;
  } catch (e) {}
  if (!prof || typeof prof !== "object") {
    prof = { version: 1, coins: 0, owned: { boy: true, pistol: true }, equipped: { character: "boy", gun: "pistol", accessories: [] } };
  }

  const salt = randomSalt();
  const hash = await sha256Hex(salt + "::" + password);
  a.users[key] = { name: username, salt, hash, createdAt: Date.now(), profile: prof };
  writeAccounts(a);
  setSession(key);
  cb({ ok: true, msg: "Đã tạo tài khoản & đăng nhập!" });
}

// ─── ĐĂNG NHẬP ─────────────────────────────────────────────────
async function loginUser(username, password, cb) {
  const key = (username || "").trim().toLowerCase();
  const a = readAccounts();
  const u = a.users[key];
  if (!u) return cb({ ok: false, msg: "Tài khoản không tồn tại!" });

  const hash = await sha256Hex(u.salt + "::" + (password || ""));
  if (hash !== u.hash) return cb({ ok: false, msg: "Sai mật khẩu!" });

  setSession(key);
  cb({ ok: true, msg: "Đăng nhập thành công!" });
}

// ─── ĐĂNG XUẤT ──────────────────────────────────────────────────
function logoutUser() {
  clearSession();
  onAuthChanged("Đã đăng xuất, chơi chế độ Khách.");
}

// ─── Giao diện Auth ─────────────────────────────────────────────
let authMode = "login";

function openAuth(mode) {
  const m = document.getElementById("authModal");
  if (!m) return;
  authMode = mode === "register" ? "register" : "login";
  updateAuthForm();
  m.classList.remove("hidden");
  setTimeout(() => { const i = document.getElementById("authUser"); if (i) i.focus(); }, 50);
}

function closeAuth() {
  const m = document.getElementById("authModal");
  if (m) m.classList.add("hidden");
}

function updateAuthForm() {
  const isReg = authMode === "register";
  document.querySelectorAll(".auth-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.atab === (isReg ? "register" : "login")));
  const row = document.getElementById("authConfirmRow");
  if (row) row.classList.toggle("hidden", !isReg);
  const btn = document.getElementById("authSubmitBtn");
  if (btn) btn.textContent = isReg ? "🆕 TẠO TÀI KHOẢN" : "🔓 ĐĂNG NHẬP";
  const msg = document.getElementById("authMsg");
  if (msg) { msg.textContent = ""; msg.className = "auth-msg"; }
  const pass2 = document.getElementById("authPass2");
  if (pass2) pass2.value = "";
}

// Cập nhật mọi chỗ hiển thị trạng thái đăng nhập
function updateAuthUI() {
  const name = authDisplayName();
  const isLogged = !!name;

  const btn = document.getElementById("navAuthBtn");
  if (btn) {
    btn.textContent = isLogged ? "🚪 ĐĂNG XUẤT" : "👤 ĐĂNG NHẬP";
    btn.dataset.mode = isLogged ? "logout" : "login";
  }
  const nu = document.getElementById("navUser");
  if (nu) {
    nu.textContent = isLogged ? ("👤 " + name) : "👤 Khách";
    nu.title = isLogged ? "Đã đăng nhập: " + name : "Đang chơi chế độ Khách";
  }
  const su = document.getElementById("shopUser");
  if (su) su.textContent = isLogged ? ("👤 " + name) : "👤 Khách (không lưu cloud)";
  const hud = document.getElementById("hudUser");
  if (hud) hud.textContent = isLogged ? ("👤 " + name) : "👤 Khách";
}

// Gọi sau khi đăng nhập/đăng ký/đăng xuất để nạp lại hồ sơ & làm mới UI
function onAuthChanged(toastMsg) {
  if (typeof reloadProfile === "function") reloadProfile();
  if (typeof reloadBest === "function") reloadBest();
  updateAuthUI();
  closeAuth();
  if (toastMsg) authToast(toastMsg);
}

function authToast(text) {
  let el = document.getElementById("authToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "authToast";
    el.className = "auth-toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
}

// ─── Gắn sự kiện ────────────────────────────────────────────────
function initAuthUI() {
  const modal = document.getElementById("authModal");
  if (!modal) return;

  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      authMode = tab.dataset.atab === "register" ? "register" : "login";
      updateAuthForm();
    });
  });

  const closeBtn = document.getElementById("authCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeAuth);
  modal.addEventListener("click", e => { if (e.target === modal) closeAuth(); });

  const submit = () => {
    const u = document.getElementById("authUser").value;
    const p = document.getElementById("authPass").value;
    const p2 = document.getElementById("authPass2") ? document.getElementById("authPass2").value : "";
    const msgEl = document.getElementById("authMsg");

    const fail = t => {
      msgEl.textContent = t;
      msgEl.className = "auth-msg error";
    };
    const ok = res => {
      if (!res.ok) return fail(res.msg);
      onAuthChanged("Chào " + (document.getElementById("authUser").value.trim() || "bạn") + "! " + res.msg);
    };

    const btn = document.getElementById("authSubmitBtn");
    btn.disabled = true;
    const done = res => { btn.disabled = false; ok(res); };

    if (authMode === "register") {
      if (p !== p2) { btn.disabled = false; return fail("Mật khẩu nhập lại không khớp!"); }
      registerUser(u, p, done);
    } else {
      loginUser(u, p, done);
    }
  };

  const btn = document.getElementById("authSubmitBtn");
  if (btn) btn.addEventListener("click", submit);
  modal.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
  });

  const guest = document.getElementById("authGuestBtn");
  if (guest) guest.addEventListener("click", () => { closeAuth(); authToast("Đang chơi chế độ Khách!"); });

  const navBtn = document.getElementById("navAuthBtn");
  if (navBtn) {
    navBtn.addEventListener("click", () => {
      if (navBtn.dataset.mode === "logout") logoutUser();
      else openAuth("login");
    });
  }

  updateAuthUI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuthUI);
} else {
  initAuthUI();
}
