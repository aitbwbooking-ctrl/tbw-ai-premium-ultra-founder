// TBW AI PREMIUM – FRONTEND ULTRA (kompletan app.js)

// === GLOBAL VARS =====================================================

const API_BASE = "/api/tbw";

let currentCity = "Split";
let currentLang = "hr";

let trialExpired = false;

let streetViewMap = null;
let streetViewPanorama = null;
let streetViewGeocoder = null;
let mapsApiReady = false;
let lastCoords = { lat: 43.5081, lon: 16.4402 }; // default Split

// === MALI HELPERI ====================================================

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

function buildURL(route, params) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);
  if (params) {
    Object.keys(params).forEach((k) => {
      const v = params[k];
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, v);
      }
    });
  }
  return url.toString();
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function getSearchCityFromQuery() {
  const qEl = $("main-query");
  if (!qEl) return "Split";
  const q = qEl.value.trim();
  if (!q) return "Split";
  return q.split(",")[0].split(" ")[0] || "Split";
}

// === TRIAL LOGIKA ====================================================

function initTrial() {
  const key = "tbw_trial_started_at";
  const now = Date.now();
  const existing = localStorage.getItem(key);

  if (!existing) {
    localStorage.setItem(key, String(now));
  }

  const start = Number(existing || now);
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const info = $("trial-info");

  if (!info) return;

  if (diffDays >= 7) {
    trialExpired = true;
    info.textContent =
      "Free trial je istekao – rute rade u DEMO modu, smještaj i ostale informacije su aktivne.";
  } else {
    const left = 7 - diffDays;
    info.textContent =
      "Free trial: preostalo " +
      left +
      " dan(a) punih ruta i real-time navigacije.";
  }
}

// === TICKER (LIVE ALERTS) ============================================

async function updateTicker() {
  try {
    const url = buildURL("alerts", { city: currentCity, lang: currentLang });
    const data = await fetchJSON(url);
    const strip = $("ticker-strip");
    if (!strip) return;

    const msg = data && data.alert ? data.alert : "Nema posebnih upozorenja.";
    // ponovi poruku da ima što skrolati
    strip.textContent = (msg + "   •   ").repeat(10);
  } catch (err) {
    console.error("ticker error", err);
  }
}

function startTickerLoop() {
  updateTicker();
  // svake 30 sekundi osvježi poruku
  setInterval(updateTicker, 30000);
}

// === HERO + FOTKE ====================================================

async function loadHero(city) {
  try {
    const url = buildURL("hero", { city });
    const data = await fetchJSON(url);
    const heroImg = $("hero-image");
    if (heroImg && data.images && data.images.length) {
      heroImg.src = data.images[0];
    }
  } catch (err) {
    console.error("hero error", err);
  }
}

async function loadPhotos(city) {
  try {
    const url = buildURL("photos", { city });
    const data = await fetchJSON(url);
    const grid = $("photos-grid");
    if (!grid) return;

    grid.innerHTML = "";
    const images = (data && data.images) || [];
    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = city;
      grid.appendChild(img);
    });
  } catch (err) {
    console.error("photos error", err);
    setText("photos-city-label", city);
  }
}

// === STREET VIEW =====================================================

function updateStreetView(lat, lon) {
  lastCoords = { lat, lon };

  if (!mapsApiReady || !window.google || !streetViewPanorama) return;

  const loc = { lat, lng: lon };
  streetViewPanorama.setPosition(loc);
}

window.initStreetViewMap = function () {
  try {
    if (!window.google) return;
    mapsApiReady = true;

    streetViewGeocoder = new google.maps.Geocoder();

    const container = $("streetview-container");
    if (!container) return;

    streetViewPanorama = new google.maps.StreetViewPanorama(container, {
      position: { lat: lastCoords.lat, lng: lastCoords.lon },
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      visible: true,
      disableDefaultUI: true,
    });

    // toggle expand
    const shell = $("streetview-shell");
    const toggleBtn = $("streetview-toggle");
    if (shell && toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        shell.classList.toggle("expanded");
      });
    }
  } catch (err) {
    console.error("streetview init error", err);
  }
};

// === WEATHER + SEA + TRAFFIC + AIRPORT + OSTALO ======================

async function loadWeather(city) {
  try {
    const url = buildURL("weather", { city, lang: currentLang });
    const data = await fetchJSON(url);

    setText("weather-city-label", data.city || city);

    const outEl = $("weather-output");
    if (outEl) {
      outEl.innerHTML = `
        <div><strong>${Math.round(data.temp)}°C</strong> – ${
        data.condition
      }</div>
        <div style="margin-top:4px;font-size:11px;opacity:0.85;">
          Izvor: ${data.source || "n/a"}
        </div>
      `;
    }

    if (typeof data.lat === "number" && typeof data.lon === "number") {
      updateStreetView(data.lat, data.lon);
    }
  } catch (err) {
    console.error("weather error", err);
    setText("weather-output", "Greška pri dohvaćanju vremena.");
  }
}

async function loadTraffic(city) {
  try {
    const url = buildURL("traffic", { city });
    const data = await fetchJSON(url);
    setText("traffic-city-label", data.city || city);

    const out = $("traffic-output");
    if (out) {
      out.innerHTML = `
        <div>${data.status}</div>
        <div style="margin-top:4px;font-size:11px;opacity:0.85;">
          Razina: <strong>${data.level}</strong>, izvor: ${
        data.source || "n/a"
      }
        </div>
      `;
    }
  } catch (err) {
    console.error("traffic error", err);
    setText("traffic-output", "Greška pri dohvaćanju prometa.");
  }
}

async function loadAirport(city) {
  try {
    const url = buildURL("airport", { city });
    const data = await fetchJSON(url);
    setText("airport-city-label", data.city || city);

    const out = $("airport-output");
    if (out) {
      out.innerHTML = `
        <div>Aerodrom: <strong>${data.airport || "-"}</strong></div>
        <div style="margin-top:4px;font-size:11px;opacity:0.85;">
          ${data.status || "Nema informacija."}
        </div>
      `;
    }
  } catch (err) {
    console.error("airport error", err);
    setText("airport-output", "Greška pri dohvaćanju aerodroma.");
  }
}

async function loadServices(city) {
  try {
    const url = buildURL("services", { city });
    const data = await fetchJSON(url);
    setText("services-city-label", data.city || city);

    const out = $("services-output");
    if (out) {
      out.innerHTML = (data.list || [])
        .map((item) => `<div>• ${item}</div>`)
        .join("");
    }
  } catch (err) {
    console.error("services error", err);
    setText("services-output", "Greška pri dohvaćanju servisa.");
  }
}

async function loadEmergency(city) {
  try {
    const url = buildURL("emergency", { city, lang: currentLang });
    const data = await fetchJSON(url);
    setText("emergency-city-label", data.city || city);
    setText("emergency-output", data.status || "");
  } catch (err) {
    console.error("emergency error", err);
    setText("emergency-output", "Greška pri dohvaćanju hitnih informacija.");
  }
}

async function loadTransit(city) {
  try {
    const url = buildURL("transit", { city });
    const data = await fetchJSON(url);
    setText("transit-city-label", data.city || city);
    setText("transit-output", data.status || "");
  } catch (err) {
    console.error("transit error", err);
    setText("transit-output", "Greška pri dohvaćanju prijevoza.");
  }
}

async function loadLandmarks(city) {
  try {
    const url = buildURL("landmarks", { city });
    const data = await fetchJSON(url);
    setText("landmarks-city-label", data.city || city);

    const out = $("landmarks-output");
    if (out) {
      out.innerHTML = (data.list || [])
        .map((name) => `<div>• ${name}</div>`)
        .join("");
    }
  } catch (err) {
    console.error("landmarks error", err);
    setText("landmarks-output", "Greška pri dohvaćanju znamenitosti.");
  }
}

// === BOOKING =========================================================

async function loadBooking(city) {
  try {
    const url = buildURL("booking", { city });
    const data = await fetchJSON(url);
    setText("booking-city-label", data.city || city);

    const out = $("booking-output");
    if (out) {
      out.innerHTML = `
        <div>Grad: <strong>${data.city}</strong></div>
        <div>Datumi: ${data.dates}</div>
        <div style="margin-top:4px;">${data.price}</div>
      `;
    }

    const btn = $("booking-btn");
    if (btn) {
      btn.onclick = () => {
        window.open(data.url, "_blank");
      };
    }
  } catch (err) {
    console.error("booking error", err);
    setText("booking-output", "Greška pri učitavanju smještaja.");
  }
}

// === NAVIGACIJA ======================================================

async function loadRoute(from, to) {
  try {
    const url = buildURL("route", { from, to });
    const data = await fetchJSON(url);

    const out = $("nav-output");
    if (!out) return;

    out.innerHTML = `
      <div><strong>${data.from || from}</strong> → <strong>${
      data.to || to
    }</strong></div>
      <div style="margin-top:4px;">
        Udaljenost: <strong>${data.distance}</strong><br/>
        Vrijeme puta: <strong>${data.duration}</strong>
      </div>
      <div style="margin-top:4px;font-size:11px;opacity:0.85;">
        Izvor: ${data.source}
      </div>
    `;
  } catch (err) {
    console.error("route error", err);
    setText("nav-output", "Greška pri računanju rute.");
  }
}

function initNavigationUI() {
  const navBtn = $("nav-btn");
  const gmapsBtn = $("nav-gmaps-btn");
  const fromInput = $("nav-from");
  const toInput = $("nav-to");

  if (navBtn && fromInput && toInput) {
    navBtn.addEventListener("click", () => {
      const from = fromInput.value.trim() || "Split";
      const to = toInput.value.trim() || currentCity || "Split";
      loadRoute(from, to);
    });
  }

  if (gmapsBtn && fromInput && toInput) {
    gmapsBtn.addEventListener("click", () => {
      const from = encodeURIComponent(fromInput.value.trim() || "Split");
      const to = encodeURIComponent(toInput.value.trim() || currentCity || "Split");
      const url = `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}`;
      window.open(url, "_blank");
    });
  }
}

// === GLAVNA TRAŽILICA + VOICE =======================================

function detectLangFromNavigator() {
  try {
    const navLang = (navigator.language || "hr").slice(0, 2).toLowerCase();
    return navLang || "hr";
  } catch {
    return "hr";
  }
}

function updateCityLabels(city) {
  const labels = [
    "nav-city-label",
    "booking-city-label",
    "weather-city-label",
    "traffic-city-label",
    "airport-city-label",
    "alerts-city-label",
    "services-city-label",
    "emergency-city-label",
    "transit-city-label",
    "events-city-label",
    "landmarks-city-label",
    "photos-city-label",
  ];
  labels.forEach((id) => setText(id, city));
}

async function runFullUpdateForCity(city) {
  currentCity = city;
  updateCityLabels(city);

  await Promise.allSettled([
    loadHero(city),
    loadPhotos(city),
    loadWeather(city),
    loadTraffic(city),
    loadAirport(city),
    loadBooking(city),
    loadServices(city),
    loadEmergency(city),
    loadTransit(city),
    loadLandmarks(city),
  ]);

  updateTicker();
}

function initMainSearch() {
  const input = $("main-query");
  const btn = $("search-btn");

  if (!input) return;

  input.placeholder = "Split apartmani";

  const triggerSearch = () => {
    const city = getSearchCityFromQuery();
    runFullUpdateForCity(city);
  };

  if (btn) btn.addEventListener("click", triggerSearch);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      triggerSearch();
    }
  });

  // VOICE (ako postoji)
  const voiceBtn = $("voice-toggle");
  if (voiceBtn && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "hr-HR";
    rec.interimResults = false;

    let listening = false;

    rec.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      input.value = text;
      const city = getSearchCityFromQuery();
      runFullUpdateForCity(city);
    };

    rec.onend = () => {
      listening = false;
      voiceBtn.textContent = "🎙";
    };

    voiceBtn.addEventListener("click", () => {
      if (!listening) {
        listening = true;
        voiceBtn.textContent = "⏹";
        rec.start();
      } else {
        rec.stop();
      }
    });
  } else if (voiceBtn) {
    // nema podrške za speech
    voiceBtn.disabled = true;
    voiceBtn.style.opacity = "0.4";
  }
}

// === INIT ============================================================

function initTBW() {
  try {
    currentLang = detectLangFromNavigator();
  } catch {
    currentLang = "hr";
  }

  initTrial();
  initNavigationUI();
  initMainSearch();
  startTickerLoop();

  // inicijalni load za Split
  runFullUpdateForCity(currentCity);
}

document.addEventListener("DOMContentLoaded", initTBW);
