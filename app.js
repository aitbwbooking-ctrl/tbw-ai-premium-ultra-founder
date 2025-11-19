// TBW AI PREMIUM – FRONTEND ULTRA
// Radi s backendom /api/tbw?route=...

const API_BASE = "/api/tbw";
let currentCity = "Split";

const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
];

// ---------------- HELPERS ----------------
const $ = (sel) => document.querySelector(sel);

async function callApi(route, extra = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);
  url.searchParams.set("city", currentCity);
  Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function randomHeroFallback() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

async function setHero(city) {
  const img = $("#heroImg");
  try {
    const d = await callApi("photos");
    const first = (d.photos || [])[0];
    img.src = first?.thumb || randomHeroFallback();
  } catch {
    img.src = randomHeroFallback();
  }
  img.alt = `Pozadina za ${city}`;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "hr-HR";
  window.speechSynthesis.speak(u);
}

// ---------------- STATUS + TIKER ----------------
async function checkBackend() {
  const el = $("#backendStatus");
  try {
    await callApi("health");
    el.classList.remove("err");
    el.classList.add("ok");
    el.textContent = "Backend: online";
  } catch {
    el.classList.remove("ok");
    el.classList.add("err");
    el.textContent = "Backend: offline";
  }
}

async function loadTicker() {
  try {
    const d = await callApi("tickerrt");
    const txts = d.ticker || [];
    $("#alertTicker").textContent =
      txts.length ? txts.join(" · ") : "Nema aktivnih upozorenja. Sretan put!";
  } catch {
    $("#alertTicker").textContent = "Upozorenja nedostupna.";
  }

  // RDS kartica
  try {
    const rds = await callApi("rds");
    const items = rds.actions || [];
    $("#alertsBox").innerHTML = items.length
      ? "<ul>" + items.map((a) => `<li>${a.msg}</li>`).join("") + "</ul>"
      : "Nema aktivnih alarma.";
  } catch {
    $("#alertsBox").textContent = "Greška kod učitavanja alarma.";
  }
}

// ---------------- LOADERS ----------------
async function loadWeather() {
  try {
    const d = await callApi("weather");
    $("#wTemp").textContent = `${Math.round(d.temperature ?? 0)}°C`;
    $("#wCond").textContent = d.condition || "-";
    $("#wCity").textContent = d.city || currentCity;
  } catch {
    $("#weatherBox").textContent = "Greška.";
  }
}

async function loadTraffic() {
  try {
    const d = await callApi("traffic");
    $("#trafficBox").innerHTML =
      `<div>Status: <strong>${d.status || "normalno"}</strong></div>` +
      `<div>Brzina: ${d.speed ?? "—"} km/h</div>` +
      `<div>Kašnjenje: ${d.delay_min ?? 0} min</div>` +
      (d.note ? `<div class="muted" style="margin-top:6px">${d.note}</div>` : "");
  } catch {
    $("#trafficBox").textContent = "Greška.";
  }
}

async function loadSea() {
  try {
    const d = await callApi("sea");
    $("#seaBox").innerHTML =
      `<div>Temperatura: <strong>${d.temperature ?? "-"}°C</strong></div>` +
      `<div class="muted">${d.note || ""}</div>`;
  } catch {
    $("#seaBox").textContent = "Greška.";
  }
}

async function loadAirport() {
  try {
    const d = await callApi("airport");
    const items = d.flights || [];
    $("#airportBox").innerHTML = items.length
      ? `<ul>${items
          .slice(0, 4)
          .map(
            (f) =>
              `<li>${(f.flight || "").toString()} — ${f.from} → ${f.to} · ${f.eta || ""} <span class="muted">(${f.status || ""})</span></li>`
          )
          .join("")}</ul>`
      : "Nema podataka o letovima.";
  } catch {
    $("#airportBox").textContent = "Greška.";
  }
}

async function loadServices() {
  try {
    const d = await callApi("services");
    const items = d.items || [];
    $("#servicesBox").innerHTML = items.length
      ? items
          .slice(0, 4)
          .map(
            (s) =>
              `${s.name} – ${s.status || "otvoreno"}${
                s.closes ? ` (zatvara ${s.closes})` : ""
              }`
          )
          .join("<br>")
      : "Nema podataka o servisima.";
  } catch {
    $("#servicesBox").textContent = "Greška.";
  }
}

async function loadTransit() {
  try {
    const d = await callApi("transit");
    const items = d.lines || [];
    $("#transitBox").innerHTML = items.length
      ? `<ul>${items
          .slice(0, 4)
          .map(
            (t) =>
              `<li>${t.mode || "Bus"} ${t.line}: ${t.from} → ${t.to} · polazak ${
                t.departure || t.next || ""
              }</li>`
          )
          .join("")}</ul>`
      : "Nema podataka o javnom prijevozu.";
  } catch {
    $("#transitBox").textContent = "Greška.";
  }
}

async function loadEmergency() {
  try {
    const d = await callApi("emergency");
    const items = d.items || [];
    $("#emergencyBox").innerHTML = items.length
      ? `<ul>${items
          .map((e) => `<li><strong>${e.name}</strong> – tel: ${e.phone}</li>`)
          .join("")}</ul>`
      : "Nema podataka o službama.";
  } catch {
    $("#emergencyBox").textContent = "Greška.";
  }
}

async function loadLandmarks() {
  try {
    const d = await callApi("landmarks");
    const items = d.items || [];
    $("#landmarksBox").innerHTML = items.length
      ? `<ul>${items
          .slice(0, 5)
          .map(
            (l) =>
              `<li>${l.name} <span class="muted">(${l.kind || ""}${
                l.dist_m ? ` · ${Math.round(l.dist_m)} m` : ""
              })</span></li>`
          )
          .join("")}</ul>`
      : "Nema podataka o znamenitostima.";
  } catch {
    $("#landmarksBox").textContent = "Greška.";
  }
}

async function loadPhotos() {
  try {
    const d = await callApi("photos");
    const items = d.photos || [];
    $("#photosBox").innerHTML = items.length
      ? `<div class="photo-row">${items
          .slice(0, 4)
          .map(
            (p) =>
              `<img src="${p.thumb}" alt="${p.author || ""}" class="thumb" loading="lazy" />`
          )
          .join("")}</div>`
      : "Nema fotografija.";
  } catch {
    $("#photosBox").textContent = "Greška.";
  }
}

// ---------------- NAVIGACIJA ----------------
async function startNav() {
  const from = $("#navFrom").value.trim() || currentCity;
  const to = $("#navTo").value.trim();
  if (!to) {
    alert("Unesi odredište (Do).");
    return;
  }
  $("#navInfo").textContent = "Računam rutu…";
  try {
    const d = await callApi("nav", { from, to });
    const lines = [];
    lines.push(`Ruta: ${d.from} → ${d.to}`);
    if (d.distance_km != null)
      lines.push(`Udaljenost: ${d.distance_km} km`);
    if (d.duration_min != null)
      lines.push(`Trajanje: ${d.duration_min} min`);
    if (d.warnings && d.warnings.length) {
      lines.push("Upozorenja:");
      d.warnings.forEach((w) => lines.push("- " + w));
    }
    if (d.steps && d.steps.length) {
      lines.push("Prve upute: " + d.steps[0]);
      speak(`Krećemo iz ${d.from} prema ${d.to}. ${d.steps[0]}`);
    }
    $("#navInfo").innerHTML = lines.join("<br>");
  } catch (e) {
    console.error(e);
    $("#navInfo").textContent = "Greška kod rute.";
  }
}

// ---------------- MIC ----------------
let rec = null;
function initMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  rec = new SR();
  rec.lang = "hr-HR";
  rec.onresult = (e) => {
    const text = e.results[0][0].transcript;
    $("#cityInput").value = text;
  };
  $("#micBtn").addEventListener("click", () => {
    try {
      rec.start();
    } catch {}
  });
}

// ---------------- CITY / SEARCH ----------------
function applyCity(city) {
  currentCity = city || currentCity;
  $("#cityInput").value = currentCity;
  $("#bookCity").textContent = currentCity;
  updateBookingLink();
  setHero(currentCity);
  refreshAll();
}

function handleSearch() {
  const v = $("#cityInput").value.trim();
  if (!v) return;

  const parts = v.split(" ");
  const guessedCity = parts[0] || v;
  applyCity(guessedCity);
}

function refreshAll() {
  checkBackend();
  loadTicker();
  loadWeather();
  loadTraffic();
  loadSea();
  loadAirport();
  loadServices();
  loadTransit();
  loadEmergency();
  loadLandmarks();
  loadPhotos();
}

function updateBookingLink() {
  const q = encodeURIComponent(currentCity);
  $("#bookLink").href = `https://www.booking.com/searchresults.html?ss=${q}`;
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", () => {
  applyCity(currentCity);
  initMic();

  $("#searchBtn").addEventListener("click", handleSearch);

  $("#cardBooking").addEventListener("click", () => {
    window.open($("#bookLink").href, "_blank");
  });

  $("#navGo").addEventListener("click", startNav);
  $("#navVoice").addEventListener("click", () => {
    const txt = $("#navInfo").innerText.trim();
    if (txt) speak(txt);
  });

  // auto osvježavanje tikera svakih 60 sekundi
  setInterval(loadTicker, 60000);
});
