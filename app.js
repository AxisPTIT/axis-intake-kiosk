/* Axis PT Intake Kiosk — app logic
   Privacy: patient name and progress live in page memory. While the WebPT step is open,
   a copy is kept in sessionStorage (this tab only, never localStorage/cookies) so the
   patient can come back and continue even if the browser reloaded the page. Every reset
   clears it and reloads the page. */
(function () {
  "use strict";
  const C = window.KIOSK_CONFIG;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let S = freshState();
  function freshState() { return { first: "", last: "", steps: [], idx: 0, webptUrl: "", status: {} }; }

  /* ---------- Branding ---------- */
  document.querySelectorAll("[data-logo]").forEach((i) => {
    i.onerror = () => (i.style.visibility = "hidden"); // never show a broken-image icon to patients
    i.src = C.logo;
  });
  document.querySelectorAll("[data-clinic]").forEach((e) => (e.textContent = C.clinicName));

  /* ---------- Screen routing ---------- */
  let current = "idle";
  function show(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $("s-" + name).classList.add("active");
    current = name;
    armIdle();
  }
  document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => show(b.dataset.go)));

  /* ---------- Modal ---------- */
  function confirmBox(title, body, yes, no) {
    return new Promise((res) => {
      $("modalTitle").textContent = title; $("modalBody").textContent = body;
      $("modalYes").textContent = yes; $("modalNo").textContent = no;
      $("modal").classList.remove("hidden");
      const done = (v) => { $("modal").classList.add("hidden"); $("modalYes").onclick = $("modalNo").onclick = null; res(v); };
      $("modalYes").onclick = () => done(true); $("modalNo").onclick = () => done(false);
    });
  }

  /* ---------- Staff PIN ---------- */
  let pin = "", pinNext = "setup", fails = 0, lockUntil = 0;
  const keys = ["1","2","3","4","5","6","7","8","9","⌫","0","OK"];
  $("keypad").innerHTML = keys.map((k) => `<button data-k="${k}" aria-label="${k === "⌫" ? "Delete" : k}">${k}</button>`).join("");
  $("keypad").addEventListener("click", async (e) => {
    const k = e.target.dataset.k; if (!k) return;
    if (Date.now() < lockUntil) { $("pinError").textContent = "Too many tries. Wait a minute."; return; }
    if (k === "⌫") pin = pin.slice(0, -1);
    else if (k === "OK") return checkPin();
    else if (pin.length < 8) pin += k;
    drawPin();
  });
  function drawPin() { $("pinDots").innerHTML = "<span></span>".repeat(pin.length); }
  async function sha256(t) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
    return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  async function checkPin() {
    const ok = (await sha256(pin)) === C.staffPinSha256;
    pin = ""; drawPin();
    if (ok) { fails = 0; $("pinError").textContent = ""; enterStaff(pinNext); }
    else { fails++; $("pinError").textContent = "Incorrect PIN"; if (fails >= 5) { lockUntil = Date.now() + 60000; fails = 0; } }
  }
  document.querySelectorAll("[data-staff]").forEach((b) => b.addEventListener("click", () => {
    pinNext = (current === "idle") ? "setup" : "summary";
    pin = ""; drawPin(); $("pinError").textContent = ""; show("pin");
  }));
  function enterStaff(next) { if (next === "setup") openSetup(); else openSummary(); }

  /* ---------- Setup ---------- */
  function openSetup() {
    S = freshState();
    $("firstName").value = ""; $("lastName").value = ""; $("webptUrl").value = "";
    $("webptStatus").textContent = ""; $("setupError").textContent = "";
    $("webptCard").classList.toggle("hidden", !C.webpt.enabled);
    $("formChecklist").innerHTML = C.forms.map((f) => {
      const ready = !!f.url;
      const price = ready && f.priceParam
        ? `<div class="price hidden" data-price-row="${esc(f.id)}"><label>${esc(f.pricePrompt || "Price")}
             <input data-price="${esc(f.id)}" inputmode="decimal" autocomplete="off" placeholder="e.g. 45"></label></div>` : "";
      return `<label><input type="checkbox" value="${esc(f.id)}" ${ready && f.checkedByDefault ? "checked" : ""} ${ready ? "" : "disabled"}>
        <span class="ftitle">${esc(f.title)}${f.desc ? `<small>${esc(f.desc)}</small>` : ""}</span>
        <span class="muted">${ready ? "~" + (f.minutes || 3) + " min" : "not set up yet"}</span></label>${price}`;
    }).join("") || '<p class="muted">No forms configured.</p>';
    syncPriceRows();
    show("setup");
    setTimeout(() => $("firstName").focus(), 150);
  }

  function syncPriceRows() {
    document.querySelectorAll("#formChecklist input[type=checkbox]").forEach((cb) => {
      const row = document.querySelector(`[data-price-row="${cb.value}"]`);
      if (row) row.classList.toggle("hidden", !cb.checked);
    });
  }
  $("formChecklist").addEventListener("change", syncPriceRows);

  function validWebpt(u) {
    try {
      const url = new URL(u.trim());
      if (url.protocol !== "https:") return false;
      const hosts = C.webpt.allowedHosts || [];
      return hosts.length === 0 || hosts.some((h) => url.hostname === h || url.hostname.endsWith("." + h));
    } catch { return false; }
  }
  $("webptUrl").addEventListener("input", () => {
    const v = $("webptUrl").value.trim();
    $("webptStatus").textContent = !v ? "" : validWebpt(v) ? "✓ WebPT link ready" : "That doesn't look like a WebPT link";
  });

  $("setupDone").addEventListener("click", () => {
    const first = $("firstName").value.trim(), last = $("lastName").value.trim();
    const chosen = [...document.querySelectorAll("#formChecklist input:checked")].map((i) => i.value);
    const wurl = $("webptUrl").value.trim();
    if (!first || !last) return ($("setupError").textContent = "Enter the patient's first and last name.");
    if (wurl && !validWebpt(wurl)) return ($("setupError").textContent = "The WebPT link isn't valid. Rescan or clear it.");
    if (!chosen.length && !wurl) return ($("setupError").textContent = "Pick at least one form or add the WebPT intake.");
    const prices = {};
    for (const id of chosen) {
      const inp = document.querySelector(`[data-price="${id}"]`);
      if (!inp) continue;
      const v = inp.value.trim().replace(/^\$/, "");
      if (!/^\d+(\.\d{1,2})?$/.test(v)) {
        const f = C.forms.find((x) => x.id === id);
        return ($("setupError").textContent = `Enter the ${f.pricePrompt || "price"} for ${f.title} (numbers only).`);
      }
      prices[id] = v;
    }
    stopScan();
    S.first = first; S.last = last; S.webptUrl = wurl;
    const forms = C.forms.filter((f) => chosen.includes(f.id));
    S.steps = forms.map((f) => ({ type: "form", id: f.id, title: f.title, url: f.url,
      nameParam: f.nameParam || "", priceParam: f.priceParam || "", price: prices[f.id] || "" }));
    if (wurl) {
      const w = { type: "webpt", id: "webpt", title: "WebPT patient intake" };
      C.webpt.position === "last" ? S.steps.push(w) : S.steps.unshift(w);
    }
    S.steps.forEach((st) => (S.status[st.id] = "pending"));
    const n = S.steps.length;
    const mins = forms.reduce((a, f) => a + (f.minutes || 3), 0) + (wurl ? 10 : 0);
    $("helloName").textContent = first;
    $("helloSummary").textContent = `You have ${n} form${n > 1 ? "s" : ""} to complete. It takes about ${mins} minutes.`;
    $("helloYes").textContent = `Yes, I'm ${first} ${last.charAt(0)}. — Start`;
    show("hello");
  });

  /* ---------- QR scanning (BarcodeDetector; falls back to paste) ---------- */
  let stream = null, scanTimer = null;
  $("scanBtn").addEventListener("click", async () => {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices) {
      $("webptStatus").textContent = "Camera scanning isn't supported on this browser — paste the link instead.";
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const v = $("scanVideo"); v.srcObject = stream; await v.play();
      $("scanner").classList.remove("hidden");
      const det = new BarcodeDetector({ formats: ["qr_code"] });
      scanTimer = setInterval(async () => {
        try {
          const codes = await det.detect(v);
          if (codes.length) {
            const val = codes[0].rawValue;
            if (validWebpt(val)) { $("webptUrl").value = val; $("webptStatus").textContent = "✓ WebPT link scanned"; stopScan(); }
            else $("webptStatus").textContent = "Scanned a QR code, but it isn't a WebPT link.";
          }
        } catch (_) {}
      }, 400);
    } catch (e) {
      $("webptStatus").textContent = "Couldn't open the camera. Allow camera access for this page in Chrome.";
    }
  });
  function stopScan() {
    clearInterval(scanTimer); scanTimer = null;
    if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null;
    $("scanner").classList.add("hidden");
  }
  $("scanCancel").addEventListener("click", stopScan);

  /* ---------- Patient flow ---------- */
  $("helloNo").addEventListener("click", () => show("wrong"));
  $("helloYes").addEventListener("click", () => { S.idx = 0; nextStep(); });

  function nextStep() {
    const st = S.steps[S.idx];
    if (!st) { clearResume(); return show("done"); }
    if (st.type === "webpt") return showWebpt(false);
    loadForm(st);
  }
  function advance(status) { S.status[S.steps[S.idx].id] = status; S.idx++; nextStep(); }

  function buildFormUrl(f) {
    const full = `${S.first} ${S.last}`;
    let u = f.url.split(encodeURIComponent(C.namePlaceholder)).join(encodeURIComponent(full))
                 .split(C.namePlaceholder).join(encodeURIComponent(full));
    const add = (k, v) => { u += (u.includes("?") ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(v); };
    if (f.nameParam) add(f.nameParam, full);          // pre-fill by question ID
    if (f.priceParam && f.price) add(f.priceParam, f.price);
    if (!/[?&]embed=true/.test(u)) add("embed", "true");
    return u;
  }

  let slowTimer = null;
  function loadForm(f) {
    const total = S.steps.length;
    $("stepLabel").textContent = `Step ${S.idx + 1} of ${total}`;
    $("formTitle").textContent = f.title;
    $("progressFill").style.width = (S.idx / total) * 100 + "%";
    $("frameLoading").classList.remove("hidden"); $("frameSlow").classList.add("hidden");
    clearTimeout(slowTimer);
    slowTimer = setTimeout(() => $("frameSlow").classList.remove("hidden"), C.timeouts.iframeLoadSec * 1000);
    $("formFrame").src = buildFormUrl(f);
    show("form");
  }
  $("formFrame").addEventListener("load", () => {
    if ($("formFrame").src && $("formFrame").src !== "about:blank") { clearTimeout(slowTimer); $("frameLoading").classList.add("hidden"); }
  });
  $("frameRetry").addEventListener("click", () => loadForm(S.steps[S.idx]));

  $("nextBtn").addEventListener("click", async () => {
    const ok = await confirmBox("Did you tap Submit?",
      "Make sure you tapped Submit at the bottom of the form and saw the confirmation message.",
      "Yes, I submitted", "Go back");
    if (!ok) return;
    $("formFrame").src = "about:blank"; advance("done");
  });
  $("skipBtn").addEventListener("click", async () => {
    const ok = await confirmBox("Skip this form?", "Our staff will go over it with you instead.", "Skip it", "Go back");
    if (!ok) return;
    $("formFrame").src = "about:blank"; advance("skipped");
  });

  /* ---------- WebPT step ----------
     WebPT is another website, so it opens on top of this page (new tab / Chrome
     custom tab). This page stays underneath with a Continue button. If the browser
     won't open a new tab, it navigates in place and resumes from sessionStorage
     when the patient comes back (back arrow / swipe back). */
  function showWebpt(waiting) {
    const total = S.steps.length;
    $("webptStep").textContent = `Step ${S.idx + 1} of ${total}`;
    $("webptIntro").classList.toggle("hidden", !!waiting);
    $("webptWait").classList.toggle("hidden", !waiting);
    show("webpt");
  }
  function saveResume() { try { sessionStorage.setItem("axisResume", JSON.stringify(S)); } catch (_) {} }
  function clearResume() { try { sessionStorage.removeItem("axisResume"); } catch (_) {} }

  $("webptGo").addEventListener("click", () => {
    S.status.webpt = "opened";
    saveResume();
    const w = window.open(S.webptUrl, "_blank");
    if (w) { try { w.opener = null; } catch (_) {} showWebpt(true); }
    else location.href = S.webptUrl; // fallback: same tab, resume on return
  });
  $("webptSkip").addEventListener("click", () => { clearResume(); advance("skipped"); });
  $("webptReopen").addEventListener("click", () => { const w = window.open(S.webptUrl, "_blank"); if (!w) location.href = S.webptUrl; });
  $("webptDone").addEventListener("click", () => { clearResume(); advance("done"); });
  $("webptNotDone").addEventListener("click", async () => {
    const ok = await confirmBox("Move on without finishing?", "Our staff will help you finish your intake.", "Move on", "Go back");
    if (ok) { clearResume(); advance("incomplete"); }
  });

  $("textSize").addEventListener("click", () => document.documentElement.classList.toggle("large"));

  /* ---------- Staff summary / reset ---------- */
  function summaryRows() { return S.steps.map((st) => [st.title, S.status[st.id]]); }
  function openSummary() {
    const rows = summaryRows();
    const label = { done: "Done", skipped: "Skipped", pending: "Not reached", opened: "Opened, not confirmed", incomplete: "Not finished" };
    const cls = { done: "done", skipped: "skipped", pending: "pending", opened: "pending", incomplete: "skipped" };
    $("summaryList").innerHTML = rows.length
      ? rows.map(([t, s]) => `<li><span>${esc(t)}</span><span class="tag ${cls[s] || "pending"}">${label[s] || s}</span></li>`).join("")
      : "<li>No session data.</li>";
    show("summary");
  }
  $("resetBtn").addEventListener("click", hardReset);
  function hardReset() {
    try { sessionStorage.clear(); } catch (_) {}
    stopScan();
    $("formFrame").src = "about:blank";
    location.replace(location.pathname); // full reload wipes everything in memory
  }

  /* ---------- Inactivity ---------- */
  let idleTimer = null, warnTimer = null;
  function armIdle() {
    clearTimeout(idleTimer); clearTimeout(warnTimer);
    if (current === "idle" || current === "pin") return;
    if (current === "done") { idleTimer = setTimeout(hardReset, C.timeouts.doneAutoResetSec * 1000); return; }
    const long = current === "form" || current === "webpt";
    const sec = long ? C.timeouts.formStepSec : C.timeouts.idleScreenSec;
    idleTimer = setTimeout(warn, sec * 1000);
  }
  async function warn() {
    warnTimer = setTimeout(hardReset, C.timeouts.warningSec * 1000);
    const stay = await confirmBox("Are you still there?",
      `For your privacy this screen will reset in ${C.timeouts.warningSec} seconds.`, "I'm still here", "Start over");
    clearTimeout(warnTimer);
    stay ? armIdle() : hardReset();
  }
  // While WebPT is on top, this page is hidden: pause timers so it can't reset mid-intake.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearTimeout(idleTimer); clearTimeout(warnTimer); } else armIdle();
  });
  ["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, () => { if ($("modal").classList.contains("hidden")) armIdle(); }, { passive: true }));

  /* ---------- Connectivity ---------- */
  const net = () => $("offline").classList.toggle("hidden", navigator.onLine);
  addEventListener("online", net); addEventListener("offline", net); net();

  /* Returning from WebPT after a same-tab hop? Restore and show the Continue screen. */
  let resumed = null;
  try { resumed = JSON.parse(sessionStorage.getItem("axisResume") || "null"); } catch (_) {}
  if (resumed && resumed.steps && resumed.steps[resumed.idx] && resumed.steps[resumed.idx].type === "webpt") {
    S = resumed; showWebpt(true);
  } else { clearResume(); show("idle"); }
})();
