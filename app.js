/* ============================================
   TBW AI PREMIUM – FRONTEND ULTRA
   Radi s backend endpointom: /api/tbwRoutes
   ============================================ */

const API_BASE = "/api/tbwRoutes";  
let currentCity = "Split";

// fallback hero slike
const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-15805130855697-b586d98ba3ee?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1493558103817-58b2b4878e3c?auto=format&fit=crop&w=1600&q=60",
  "https://images.unsplash.com/photo-1521543979798-5ea266f8882d?auto=format&fit=crop&w=1600&q=60"
];

// ----------------- HELPERS -----------------
const $ = (sel) => document.querySelector(sel);

// API poziv
async function callApi(route, extra = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);

  Object.entries(extra).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("HTTP " + res.status);

  return await res.json();
}

// random hero fallback
function randomHeroFallback() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

// ================================================
// CENTRALNA PRETRAGA
// ================================================
$("#searchBtn")?.addEventListener("click", () => {
  const q = $("#cityInput").value.trim();
  if (q.length < 2) return;

  currentCity = q;
  fullRefresh();
});

// mikrofon
$("#micBtn")?.addEventListener("click", () => {
  try {
    const r = new webkitSpeechRecognition();
    r.lang = "hr-HR";
    r.onresult = (e) => {
      $("#cityInput").value = e.results[0][0].transcript;
    };
    r.start();
  } catch (e) {
    alert("Glasovna pretraga nije podržana.");
  }
});

// ================================================
// HERO + TIKER (LIVE ALERTS)
// ================================================
async function loadHero() {
  try {
    const data = await callApi("hero", { city: currentCity });
    $("#heroImg").src = data.img || randomHeroFallback();
  } catch {
    $("#heroImg").src = randomHeroFallback();
  }
}

async function loadTicker() {
  try {
    const t = await callApi("alerts", { city: currentCity });
    $("#alertTicker").innerText = t.text || "Nema upozorenja.";
  } catch {
    $("#alertTicker").innerText = "Greška učitavanja upozorenja.";
  }
}

// auto refresh ticker svakih 60 sekundi
setInterval(loadTicker, 60000);

// ================================================
// VRIJEME
// ================================================
async function loadWeather() {
  try {
    const w = await callApi("weather", { city: currentCity });

    $("#wTemp").innerText = w.temp ?? "--";
    $("#wCond").innerText = w.condition ?? "-";
    $("#wCity").innerText = w.city ?? currentCity;
  } catch {
    $("#wTemp").innerText = "--";
    $("#wCond").innerText = "Greška";
    $("#wCity").innerText = currentCity;
  }
}

// ================================================
// PROMET
// ================================================
async function loadTraffic() {
  try {
    const t = await callApi("traffic", { city: currentCity });
    $("#trafficBox").innerText = t.text || "-";
  } catch {
    $("#trafficBox").innerText = "Greška";
  }
}

// ================================================
// MORE
// ================================================
async function loadSea() {
  try {
    const s = await callApi("sea", { city: currentCity });
    $("#seaBox").innerText = s.text || "-";
  } catch {
    $("#seaBox").innerText = "Greška";
  }
}

// ================================================
// AERODROMI
// ================================================
async function loadAirports() {
  try {
    const a = await callApi("airports", { city: currentCity });
    $("#airportBox").innerText = a.text || "-";
  } catch {
    $("#airportBox").innerText = "Greška";
  }
}

// ================================================
// ZNAMENITOSTI
// ================================================
async function loadLandmarks() {
  try {
    const z = await callApi("landmarks", { city: currentCity });
    $("#landmarksBox").innerHTML = z.items?.join("<br>") || "-";
  } catch {
    $("#landmarksBox").innerText = "Greška";
  }
}

// ================================================
// SERVISI
// ================================================
async function loadServices() {
  try {
    const s = await callApi("services", { city: currentCity });
    $("#servicesBox").innerHTML = s.items?.join("<br>") || "-";
  } catch {
    $("#servicesBox").innerText = "Greška";
  }
}

// ================================================
// HITNE
// ================================================
async function loadEmergency() {
  try {
    const e = await callApi("emergency", { city: currentCity });
    $("#emergencyBox").innerHTML = e.items?.join("<br>") || "-";
  } catch {
    $("#emergencyBox").innerText = "Greška";
  }
}

// ================================================
// FOTOGRAFIJE
// ================================================
async function loadPhotos() {
  try {
    const p = await callApi("photos", { city: currentCity });
    $("#photosBox").innerHTML = p.urls
      .map((u) => `<img src="${u}" class="imgSmall" />`)
      .join("");
  } catch {
    $("#photosBox").innerText = "Greška";
  }
}

// ================================================
// BOOKING
// ================================================
async function loadBooking() {
  try {
    const b = await callApi("booking", { city: currentCity });

    $("#bookCity").innerText = b.city;
    $("#bookPrice").innerText = b.maxPrice;
    $("#bookLink").href = b.url;
  } catch {
    $("#bookCity").innerText = currentCity;
    $("#bookLink").href = "#";
  }
}

// ================================================
// NAVIGACIJA
// ================================================
$("#navGo")?.addEventListener("click", async () => {
  const from = $("#navFrom").value || currentCity;
  const to = $("#navTo").value;

  if (!to.trim()) return alert("Unesite odredište.");

  try {
    const r = await callApi("route", { from, to });
    $("#navInfo").innerText = r.text || "Ruta pronađena.";
  } catch {
    $("#navInfo").innerText = "Greška u navigaciji.";
  }
});

// ================================================
// BACKEND STATUS
// ================================================
async function backendStatus() {
  try {
    await callApi("ping");
    $("#backendStatus").innerText = "Backend OK";
    $("#backendStatus").style.color = "#0f0";
  } catch {
    $("#backendStatus").innerText = "Backend ERROR";
    $("#backendStatus").style.color = "#f00";
  }
}

// ================================================
// FULL REFRESH
// ================================================
async function fullRefresh() {
  loadHero();
  loadTicker();
  loadWeather();
  loadTraffic();
  loadSea();
  loadAirports();
  loadLandmarks();
  loadServices();
  loadEmergency();
  loadPhotos();
  loadBooking();
  backendStatus();
}

// start
fullRefresh();
