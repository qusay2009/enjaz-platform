// Google Apps Script — واجهة الحجز (API) للموقع على GitHub
// غيّر كلمة السر قبل النشر (اجعلها طويلة)
const ADMIN_PASSWORD = "CHANGE_ME";

const SHEET = "Bookings";
const BOOTHS = {b1:"م. وسام مرعي",b2:"د. موسى صالح",b3:"أ. خضر عباسي",b4:"أ. أحمد غباري",b5:"أ. وائل عياد",b6:"أ. لجين سيوري",b7:"ASEZA"};
const T = ["10:30–10:45","10:50–11:05","11:10–11:25","11:30–11:45","11:50–12:05","12:10–12:25","12:30–12:45","12:50–1:05","1:10–1:25","BREAK","1:40–1:55","2:00–2:15","2:20–2:35","2:40–2:55","3:00–3:15","3:20–3:35","3:40–3:55","4:00–4:15","4:20–4:35","4:40–4:55","5:00–5:15"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(["وقت الحجز","البوث","الموعد","الاسم","الهاتف","المفتاح"]);
    sh.setFrozenRows(1);
  }
  return sh;
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function keys_() {
  const sh = sheet_(), n = sh.getLastRow();
  return n > 1 ? sh.getRange(2, 6, n - 1, 1).getValues().map(r => String(r[0])).filter(String) : [];
}

// للزوار: المواعيد المحجوزة فقط، بدون أسماء أو أرقام
function doGet() { return json_({ taken: keys_() }); }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return json_({ ok: false, error: "invalid" }); }
  if (d.action === "adminList") return json_(adminList_(d.pw));
  if (d.action === "adminCancel") return json_(adminCancel_(d.pw, d.key));
  return json_(book_(d));
}

function book_(d) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const i = Number(d.slot), b = String(d.booth);
    const name = String(d.name || "").trim().slice(0, 80), phone = String(d.phone || "").trim().slice(0, 20);
    if (!BOOTHS[b] || !Number.isInteger(i) || i < 0 || i >= T.length || T[i] === "BREAK") return { ok: false, error: "invalid" };
    if (name.length < 2 || !/^[0-9+\s-]{7,16}$/.test(phone)) return { ok: false, error: "invalid" };
    const sh = sheet_(), key = b + "_s" + i, n = sh.getLastRow();
    if (keys_().indexOf(key) !== -1) return { ok: false, error: "taken" };
    const rg = sh.getRange(n + 1, 1, 1, 6);
    rg.setNumberFormat("@"); // نص فقط، لمنع تنفيذ أي صيغة
    rg.setValues([[Utilities.formatDate(new Date(), "Asia/Amman", "yyyy-MM-dd HH:mm"), BOOTHS[b], T[i], name, phone, key]]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: "busy" };
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function auth_(pw) {
  if (ADMIN_PASSWORD !== "CHANGE_ME" && String(pw) === ADMIN_PASSWORD) return true;
  Utilities.sleep(1500); // تبطيء محاولات التخمين
  return false;
}

function adminList_(pw) {
  if (!auth_(pw)) return { ok: false };
  const sh = sheet_(), n = sh.getLastRow();
  const rows = n > 1 ? sh.getRange(2, 1, n - 1, 6).getValues().map(r => ({ booth: String(r[1]), slot: String(r[2]), name: String(r[3]), phone: String(r[4]), key: String(r[5]) })) : [];
  const order = k => { const m = k.key.match(/^b(\d)_s(\d+)$/); return m ? Number(m[1]) * 100 + Number(m[2]) : 9999; };
  rows.sort((a, b) => order(a) - order(b));
  return { ok: true, rows: rows };
}

function adminCancel_(pw, key) {
  if (!auth_(pw)) return { ok: false };
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sh = sheet_(), n = sh.getLastRow();
    if (n < 2) return { ok: true };
    const idx = sh.getRange(2, 6, n - 1, 1).getValues().map(r => String(r[0])).indexOf(String(key));
    if (idx !== -1) sh.deleteRow(idx + 2);
    return { ok: true };
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
