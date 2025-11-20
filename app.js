// TBW AI PREMIUM – FRONTEND ULTRA
// Radi s backendom /api/tbw (route param)

const API_BASE = "/api/tbw";

let currentCity = "Split";
let currentLang = "hr";

const FOUNDER_DEFAULT = true; // osnivač = uvijek Premium u founder modu
const TRIAL_DAYS_DEFAULT = 7;

const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-1505853085567-b58d89ba3e23?w=1200",
  "https://images.unsplash.com/photo-1493558103817-58b6727a0408?w=1200",
  "https://images.unsplash.com/photo-1521545397978-5ea2c6688880?w=1200"
];

const LANG_VOICE = {
  hr: "hr-HR",
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  cs: "cs-CZ",
  hu: "hu-HU"
};

const $ = (sel) => document.querySelector(sel);

// ---------------- I18N (osnovne etikete) ----------------
const I18N = {
  nav_alerts: {
    hr: "Prometna upozorenja",
    en: "Traffic alerts",
    de: "Verkehrswarnungen",
    fr: "Alertes trafic",
    it: "Allerte traffico",
    es: "Alertas de tráfico",
    cs: "Dopravní upozornění",
    hu: "Forgalmi riasztások"
  },
  nav_weather: {
    hr: "Vrijeme",
    en: "Weather",
    de: "Wetter",
    fr: "Météo",
    it: "Meteo",
    es: "Tiempo",
    cs: "Počasí",
    hu: "Időjárás"
  },
  nav_sea: {
    hr: "Stanje mora",
    en: "Sea state",
    de: "Meerzustand",
    fr: "État de la mer",
    it: "Stato del mare",
    es: "Estado del mar",
    cs: "Stav moře",
    hu: "Tenger állapota"
  },
  nav_incidents: {
    hr: "Nesreće",
    en: "Incidents",
    de: "Unfälle",
    fr: "Incidents",
    it: "Incidenti",
    es: "Incidentes",
    cs: "Nehody",
    hu: "Balesetek"
  },
  nav_alert: {
    hr: "Alert!",
    en: "Alert!",
    de: "Alarm!",
    fr: "Alerte !",
    it: "Allerta!",
    es: "¡Alerta!",
    cs: "Výstraha!",
    hu: "Riasztás!"
  },
  btn_search: {
    hr: "Traži",
    en: "Search",
    de: "Suche",
    fr: "Rechercher",
    it: "Cerca",
    es: "Buscar",
    cs: "Hledat",
    hu: "Keresés"
  },
  card_nav: {
    hr: "Navigacija",
    en: "Navigation",
    de: "Navigation",
    fr: "Navigation",
    it: "Navigazione",
    es: "Navegación",
    cs: "Navigace",
    hu: "Navigáció"
  },
  card_booking: {
    hr: "Rezervacija smještaja",
    en: "Accommodation booking",
    de: "Unterkunft buchen",
    fr: "Réservation hébergement",
    it: "Prenotazione alloggio",
    es: "Reserva de alojamiento",
    cs: "Rezervace ubytování",
    hu: "Szállásfoglalás"
  },
  card_weather: {
    hr: "Vrijeme",
    en: "Weather",
    de: "Wetter",
    fr: "Météo",
    it: "Meteo",
    es: "Tiempo",
    cs: "Počasí",
    hu: "Időjárás"
  },
  card_traffic: {
    hr: "Promet uživo",
    en: "Live traffic",
    de: "Live-Verkehr",
    fr: "Trafic en direct",
    it: "Traffico live",
    es: "Tráfico en vivo",
    cs: "Doprava živě",
    hu: "Élő forgalom"
  },
  card_sea: {
    hr: "Stanje mora",
    en: "Sea state",
    de: "Meerzustand",
    fr: "État de la mer",
    it: "Stato del mare",
    es: "Estado del mar",
    cs: "Stav moře",
    hu: "Tenger állapota"
  },
  card_airport: {
    hr: "Aerodromi",
    en: "Airports",
    de: "Flughäfen",
    fr: "Aéroports",
    it: "Aeroporti",
    es: "Aeropuertos",
    cs: "Letiště",
    hu: "Repülőterek"
  },
  card_services: {
    hr: "Servisi",
    en: "Services",
    de: "Dienste",
    fr: "Services",
    it: "Servizi",
    es: "Servicios",
    cs: "Služby",
    hu: "Szolgáltatások"
  },
  card_transit: {
    hr: "Javni prijevoz",
    en: "Public transport",
    de: "ÖPNV",
    fr: "Transports publics",
    it: "Trasporto pubblico",
    es: "Transporte público",
    cs: "MHD",
    hu: "Tömegközlekedés"
  },
  card_emergency: {
    hr: "Hitne službe",
    en: "Emergency",
    de: "Notdienste",
    fr: "Urgences",
    it: "Emergenza",
    es: "Emergencias",
    cs: "Pohotovost",
    hu: "Sürgősségi"
  },
  card_rds: {
    hr: "RDS alarmi",
    en: "RDS alerts",
    de: "RDS-Alarme",
    fr: "Alertes RDS",
    it: "Allarmi RDS",
    es: "Alertas RDS",
    cs: "RDS výstrahy",
    hu: "RDS riasztások"
  },
  card_landmarks: {
    hr: "Znamenitosti",
    en: "Landmarks",
    de: "Sehenswürdigkeiten",
    fr: "Monuments",
    it: "Luoghi d'interesse",
    es: "Lugares de interés",
    cs: "Památky",
    hu: "Látnivalók"
  },
  card_photos: {
    hr: "Slike",
    en: "Photos",
    de: "Fotos",
    fr: "Photos",
    it: "Foto",
    es: "Fotos",
    cs: "Fotky",
    hu: "Fotók"
  },
  streetview_title: {
    hr: "LIVE Street View",
    en: "LIVE Street View",
    de: "LIVE Street View",
    fr: "LIVE Street View",
    it: "LIVE Street View",
    es: "LIVE Street View",
    cs: "LIVE Street View",
    hu: "LIVE Street View"
  },
  btn_go: {
    hr: "Kreni",
    en: "Go",
    de: "Los",
    fr: "Go",
    it: "Vai",
    es: "Ir",
    cs: "Start",
    hu: "Indul"
  },
  btn_open_booking: {
    hr: "Otvori Booking",
    en: "Open Booking",
    de: "Booking öffnen",
    fr: "Ouvrir Booking",
    it: "Apri Booking",
    es: "Abrir Booking",
    cs: "Otevřít Booking",
    hu: "Booking megnyitása"
  }
};

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const map = I18N[key];
    if (map && map[currentLang]) {
      el.textContent = map[currentLang];
    }
  });
}

// ---------------- API helper ----------------
async function callApi(route, extra = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);
  url.searchParams.set("city", currentCity);
  url.searchParams.set("lang", currentLang);
  Object.entries(extra).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------------- HERO ----------------
function randomHero() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

async function loadHero() {
  try {
    const data = await callApi("hero");
    const img = $("#heroImg");
    img.src = (data.images && data.images[0]) || randomHero();
    img.alt = `Pozadina za ${currentCity}`;
  } catch {
    $("#heroImg").src = randomHero();
  }
}

// ---------------- TICKER ----------------
async function loadTicker() {
  try {
    const data = await callApi("alerts");
    $("#alertTicker").textContent = data.alert || "Nema upozorenja.";
  } catch {
    $("#alertTicker").textContent = "Greška pri učitavanju upozorenja.";
  }
}

setInterval(loadTicker, 60000);

// ---------------- BACKEND STATUS ----------------
async function checkBackend() {
  const el = $("#backendStatus");
  try {
    await callApi("meta");
    el.classList.remove("err");
    el.classList.add("ok");
    el.textContent = "Backend: online";
  } catch {
    el.classList.remove("ok");
    el.classList.add("err");
    el.textContent = "Backend: offline";
  }
}

// ---------------- WEATHER ----------------
async function loadWeather() {
  try {
    const d = await callApi("weather");
    $("#wTemp").textContent = `${Math.round(d.temp ?? 0)}°C`;
    $("#wCond").textContent = d.condition || "-";
    $("#wCity").textContent = d.city || currentCity;
  } catch {
    $("#weatherBox").textContent = "Greška.";
  }
}

// ---------------- TRAFFIC ----------------
async function loadTraffic() {
  try {
    const d = await callApi("traffic");
    $("#trafficBox").innerHTML =
      `<div>Status: <strong>${d.status || "–"}</strong></div>` +
      `<div class="muted">Razina: ${d.level || "–"}</div>`;
  } catch {
    $("#trafficBox").textContent = "Greška.";
  }
}

// ---------------- SEA ----------------
async function loadSea() {
  try {
    const d = await callApi("sea");
    $("#seaBox").textContent = d.state || "–";
  } catch {
    $("#seaBox").textContent = "Greška.";
  }
}

// ---------------- AIRPORT ----------------
async function loadAirport() {
  try {
    const d = await callApi("airport");
    $("#airportBox").textContent = d.status || "–";
  } catch {
    $("#airportBox").textContent = "Greška.";
  }
}

// ---------------- SERVICES ----------------
async function loadServices() {
  try {
    const d = await callApi("services");
    $("#servicesBox").innerHTML = (d.list || []).join("<br>") || "–";
  } catch {
    $("#servicesBox").textContent = "Greška.";
  }
}

// ---------------- TRANSIT ----------------
async function loadTransit() {
  try {
    const d = await callApi("transit");
    $("#transitBox").textContent = d.status || "–";
  } catch {
    $("#transitBox").textContent = "Greška.";
  }
}

// ---------------- EMERGENCY ----------------
async function loadEmergency() {
  try {
    const d = await callApi("emergency");
    $("#emergencyBox").textContent = d.status || "–";
  } catch {
    $("#emergencyBox").textContent = "Greška.";
  }
}

// ---------------- LANDMARKS ----------------
async function loadLandmarks() {
  try {
    const d = await callApi("landmarks");
    $("#landmarksBox").innerHTML = (d.list || []).join("<br>") || "–";
  } catch {
    $("#landmarksBox").textContent = "Greška.";
  }
}

// ---------------- PHOTOS ----------------
async function loadPhotos() {
  try {
    const d = await callApi("photos");
    $("#photosBox").innerHTML = (d.images || [])
      .map((src) => `<img src="${src}" class="photo-thumb">`)
      .join("");
  } catch {
    $("#photosBox").textContent = "Greška.";
  }
}

// ---------------- BOOKING ----------------
async function loadBooking() {
  try {
    const d = await callApi("booking");
    $("#bookCity").textContent = d.city || currentCity;
    $("#bookDates").textContent = d.dates || "-";
    $("#bookPrice").textContent = d.price || "-";
    $("#bookLink").href = d.url || "#";
  } catch {
    $("#bookingBox").textContent = "Greška.";
  }
}

// ---------------- NAVIGATION ----------------
function buildGMapsRouteURL(from, to) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    from
  )}&destination=${encodeURIComponent(to)}&travelmode=driving`;
}

async function startNav() {
  const from = $("#navFrom").value.trim() || currentCity;
  const to = $("#navTo").value.trim();
  if (!to) {
    alert("Unesi odredište (Do).");
    return;
  }
  $("#navInfo").textContent = "Računam rutu…";
  try {
    const d = await callApi("route", { from, to });
    const lines = [];
    lines.push(`Ruta: ${d.from} → ${d.to}`);
    lines.push(`Udaljenost: ${d.distance}`);
    lines.push(`Trajanje: ${d.duration}`);
    $("#navInfo").innerHTML = lines.join("<br>");

    // GMaps gumb
    const gmapsUrl = buildGMapsRouteURL(d.from || from, d.to || to);
    const navOpenBtn = document.getElementById("navOpenMaps");
    if (navOpenBtn) {
      navOpenBtn.onclick = () => window.open(gmapsUrl, "_blank");
    }

    // govorna ruta
    speakRoute(d);

    // jednostavni "realtime" refresh svakih 30s
    if (window._navInterval) clearInterval(window._navInterval);
    window._navInterval = setInterval(() => {
      callApi("route", { from, to })
        .then((dd) => {
          const l2 = [];
          l2.push(`Ruta: ${dd.from} → ${dd.to}`);
          l2.push(`Udaljenost: ${dd.distance}`);
          l2.push(`Trajanje: ${dd.duration}`);
          $("#navInfo").innerHTML = l2.join("<br>");
        })
        .catch(() => {});
    }, 30000);
  } catch {
    $("#navInfo").textContent = "Greška kod rute.";
  }
}

function speakRoute(d) {
  if (!("speechSynthesis" in window)) return;
  const langCode = LANG_VOICE[currentLang] || "en-US";
  const text = `Krećemo iz ${d.from} prema ${d.to}. Udaljenost ${d.distance}, trajanje ${d.duration}.`;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = langCode;
  window.speechSynthesis.speak(u);
}

// ---------------- STREET VIEW ----------------
function buildStreetViewURL(city) {
  return `https://www.google.com/maps?q=${encodeURIComponent(city)}&layer=c`;
}

function renderStreetViewPreview() {
  const box = document.getElementById("streetViewPreview");
  if (!box) return;
  const url = buildStreetViewURL(currentCity);
  box.innerHTML = `<iframe src="${url}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
}

function openStreetViewFullscreen() {
  const url = buildStreetViewURL(currentCity);
  const overlay = document.createElement("div");
  overlay.className = "sv-modal-overlay";

  overlay.innerHTML = `
    <div class="sv-modal-header">
      <button id="svCloseBtn">✕ Close</button>
    </div>
    <div class="sv-modal-body">
      <iframe src="${url}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("svCloseBtn").onclick = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  const escHandler = (e) => {
    if (e.key === "Escape") {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

// ---------------- TRIAL / PREMIUM (lokalni) ----------------
function getTrialInfo() {
  const raw = localStorage.getItem("tbw_trial");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setTrialInfo(obj) {
  localStorage.setItem("tbw_trial", JSON.stringify(obj));
}

function initTrial(meta) {
  const founderToggle = $("#founderToggle");
  if (founderToggle) founderToggle.checked = FOUNDER_DEFAULT;

  let info = getTrialInfo();
  if (!info) {
    info = {
      start: Date.now(),
      days: meta?.trialDays || TRIAL_DAYS_DEFAULT,
      premium: true
    };
    setTrialInfo(info);
  }
  updateTrialUI(info);
}

function updateTrialUI(info) {
  const trialEl = $("#trialInfo");
  const founderToggle = $("#founderToggle");
  if (!trialEl || !founderToggle) return;

  const msPassed = Date.now() - info.start;
  const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
  const daysLeft = info.days - daysPassed;

  const isFounder = founderToggle.checked;
  const isPremium = isFounder || daysLeft > 0 || info.premium;

  if (isFounder) {
    trialEl.textContent = "Founder mode: uvijek PREMIUM aktivan.";
  } else if (daysLeft > 0) {
    trialEl.textContent = `Free trial: još ${daysLeft} dana Premium.`;
  } else if (!info.premium) {
    trialEl.textContent = "Trial završen – aktiviraj Premium za sve funkcije.";
  } else {
    trialEl.textContent = "Premium aktivan.";
  }

  // Za sada samo informacija – ne zaključavamo ništa vizualno
}

// ---------------- LANGUAGE INIT ----------------
function initLang() {
  const select = $("#langSelect");
  if (!select) return;
  select.value = currentLang;
  select.addEventListener("change", () => {
    currentLang = select.value;
    applyI18n();
    refreshAll();
    // mic i TTS će koristiti novi jezik
    if (rec) {
      rec.lang = LANG_VOICE[currentLang] || "en-US";
    }
  });
}

// ---------------- MIC (glas za tražilicu) ----------------
let rec = null;
function initMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  rec = new SR();
  rec.lang = LANG_VOICE[currentLang] || "hr-HR";
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

// ---------------- REFRESH ALL ----------------
function refreshAll() {
  checkBackend();
  loadHero();
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
  loadBooking();
  renderStreetViewPreview();
}

// ---------------- INIT ----------------
document.addEventListener("DOMContentLoaded", async () => {
  initLang();
  applyI18n();

  // meta / trial
  let meta = null;
  try {
    meta = await callApi("meta");
  } catch {}
  initTrial(meta);

  currentCity = "Split";
  $("#cityInput").value = currentCity;

  refreshAll();
  initMic();

  $("#searchBtn").addEventListener("click", () => {
    const v = $("#cityInput").value.trim();
    if (!v) return;
    currentCity = v;
    refreshAll();
  });

  $("#navGo").addEventListener("click", startNav);
  $("#navVoice").addEventListener("click", () => {
    const txt = $("#navInfo").innerText.trim();
    if (!txt) return;
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = LANG_VOICE[currentLang] || "en-US";
    window.speechSynthesis.speak(u);
  });

  const svBtn = document.getElementById("streetViewOpenBtn");
  if (svBtn) {
    svBtn.addEventListener("click", openStreetViewFullscreen);
  }

  $("#founderToggle").addEventListener("change", () => {
    const info = getTrialInfo();
    if (!info) return;
    updateTrialUI(info);
  });

  $("#upgradeBtn").addEventListener("click", () => {
    const info =
      getTrialInfo() || { start: Date.now(), days: TRIAL_DAYS_DEFAULT };
    info.premium = true;
    setTrialInfo(info);
    updateTrialUI(info);
    alert(
      "Premium aktiviran (demo). Za pravu naplatu treba Google Play Billing integracija."
    );
  });

  const navOpenBtn = document.getElementById("navOpenMaps");
  if (navOpenBtn) {
    navOpenBtn.onclick = () => {
      const from = $("#navFrom").value.trim() || currentCity;
      const to = $("#navTo").value.trim();
      if (!to) return;
      window.open(buildGMapsRouteURL(from, to), "_blank");
    };
  }
});
