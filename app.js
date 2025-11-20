// ================== KONFIG =====================

// backend endpoint
const API_BASE = "/api/tbw";

// Street View – OVDJE STAVI SVOJ BROWSER API KEY
const GOOGLE_MAPS_EMBED_KEY = "435a849b822b425baba54ee97f13394b";

// osnovne koordinate za HR gradove (za street view)
const CITY_COORDS = {
  split: { lat: 43.5081, lon: 16.4402 },
  zagreb: { lat: 45.815, lon: 15.9819 },
  zadar: { lat: 44.1194, lon: 15.2314 },
  rijeka: { lat: 45.3271, lon: 14.4422 },
  pula: { lat: 44.8666, lon: 13.8496 },
  dubrovnik: { lat: 42.6507, lon: 18.0944 }
};

// prijevod samo za naslove i etikete – backend vraća tekst na HR
const I18N = {
  hr: {
    nav: "Navigacija",
    booking: "Rezervacija smještaja",
    weather: "Vrijeme",
    traffic: "Promet uživo",
    airport: "Aerodromi",
    sea: "Stanje mora",
    services: "Servisi i hitne službe",
    emergency: "Sigurnost i hitne službe",
    transit: "Javni prijevoz",
    landmarks: "Znamenitosti i eventi",
    alerts: "Alerti po gradu",
    trialLeft: d => `Trial aktivan – preostalo ${d} dana`,
    trialExpired: "Trial je istekao – rute u DEMO modu",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  en: {
    nav: "Navigation",
    booking: "Accommodation",
    weather: "Weather",
    traffic: "Live traffic",
    airport: "Airports",
    sea: "Sea state",
    services: "Services & emergency",
    emergency: "Security & emergency",
    transit: "Public transport",
    landmarks: "Landmarks & events",
    alerts: "City alerts",
    trialLeft: d => `Trial active – ${d} days left`,
    trialExpired: "Trial expired – routes in DEMO mode",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  de: {
    nav: "Navigation",
    booking: "Unterkunft",
    weather: "Wetter",
    traffic: "Verkehr",
    airport: "Flughäfen",
    sea: "Meerzustand",
    services: "Services & Notdienste",
    emergency: "Sicherheit & Notruf",
    transit: "ÖPNV",
    landmarks: "Sehenswürdigkeiten & Events",
    alerts: "Stadtwarnungen",
    trialLeft: d => `Test aktiv – ${d} Tage übrig`,
    trialExpired: "Test abgelaufen – Routen im DEMO-Modus",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  fr: {
    nav: "Navigation",
    booking: "Hébergement",
    weather: "Météo",
    traffic: "Trafic",
    airport: "Aéroports",
    sea: "État de la mer",
    services: "Services & urgences",
    emergency: "Sécurité & urgences",
    transit: "Transports publics",
    landmarks: "Sites & événements",
    alerts: "Alertes",
    trialLeft: d => `Essai actif – ${d} jours restants`,
    trialExpired: "Essai expiré – itinéraires en mode DEMO",
    tickerLabel: "LIVE",
    backendOnline: "Backend : en ligne"
  },
  it: {
    nav: "Navigazione",
    booking: "Alloggio",
    weather: "Meteo",
    traffic: "Traffico",
    airport: "Aeroporti",
    sea: "Mare",
    services: "Servizi & emergenza",
    emergency: "Sicurezza & emergenza",
    transit: "Trasporto pubblico",
    landmarks: "Luoghi & eventi",
    alerts: "Allerte",
    trialLeft: d => `Prova attiva – ${d} giorni rimanenti`,
    trialExpired: "Prova scaduta – rotte in modalità DEMO",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  cs: {
    nav: "Navigace",
    booking: "Ubytování",
    weather: "Počasí",
    traffic: "Doprava",
    airport: "Letiště",
    sea: "Moře",
    services: "Servisy & pohotovost",
    emergency: "Bezpečnost & pohotovost",
    transit: "MHD",
    landmarks: "Památky & akce",
    alerts: "Městská upozornění",
    trialLeft: d => `Zkušební verze – zbývá ${d} dní`,
    trialExpired: "Zkušební verze skončila – trasy DEMO",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  hu: {
    nav: "Navigáció",
    booking: "Szállás",
    weather: "Időjárás",
    traffic: "Forgalom",
    airport: "Repterek",
    sea: "Tengerállapot",
    services: "Szervizek & segély",
    emergency: "Biztonság & segély",
    transit: "Tömegközlekedés",
    landmarks: "Látnivalók & események",
    alerts: "Városi riasztások",
    trialLeft: d => `Próba aktív – ${d} nap van hátra`,
    trialExpired: "Próba lejárt – útvonalak DEMO módban",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  },
  es: {
    nav: "Navegación",
    booking: "Alojamiento",
    weather: "Tiempo",
    traffic: "Tráfico",
    airport: "Aeropuertos",
    sea: "Estado del mar",
    services: "Servicios & emergencia",
    emergency: "Seguridad & emergencia",
    transit: "Transporte público",
    landmarks: "Lugares & eventos",
    alerts: "Alertas de ciudad",
    trialLeft: d => `Prueba activa – quedan ${d} días`,
    trialExpired: "Prueba finalizada – rutas en modo DEMO",
    tickerLabel: "LIVE",
    backendOnline: "Backend: online"
  }
};

// global state
const state = {
  city: "Split",
  lang: "hr",
  trialExpired: false
};

// ================ HELPERI =======================

function $(id) {
  return document.getElementById(id);
}

function daysBetween(tsStart, tsNow) {
  const diff = tsNow - tsStart;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function buildUrl(route, params) {
  let url = API_BASE + "?route=" + encodeURIComponent(route);
  if (params) {
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        url += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }
    }
  }
  return url;
}

async function callTBW(route, params) {
  const url = buildUrl(route, params);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("HTTP " + res.status + " for " + url);
  }
  return await res.json();
}

// ================ TRIAL LOGIKA ===================

function initTrial() {
  try {
    const key = "tbw_trial_start";
    let start = localStorage.getItem(key);
    if (!start) {
      start = String(Date.now());
      localStorage.setItem(key, start);
    }
    const days = daysBetween(parseInt(start, 10), Date.now());
    const i18n = I18N[state.lang] || I18N.hr;
    const trialLabel = $("trial-status");

    if (days >= 7) {
      state.trialExpired = true;
      trialLabel.textContent = i18n.trialExpired;
      trialLabel.style.color = "#ffb347";
      lockPremiumCards();
    } else {
      state.trialExpired = false;
      trialLabel.textContent = i18n.trialLeft(7 - days);
      unlockPremiumCards();
    }
  } catch (e) {
    console.error("trial error", e);
  }
}

function lockPremiumCards() {
  $("card-nav").classList.add("card-locked");
  $("nav-btn").disabled = true;
  $("nav-mode-pill").textContent = "DEMO";
}

function unlockPremiumCards() {
  $("card-nav").classList.remove("card-locked");
  $("nav-btn").disabled = false;
  $("nav-mode-pill").textContent = "Full";
}

// ================ STREET VIEW ====================

function getCoordsForCity(city) {
  if (!city) return null;
  const key = city.toLowerCase().trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  return CITY_COORDS["split"];
}

function buildStreetUrl(city) {
  const coords = getCoordsForCity(city);
  if (!coords || !GOOGLE_MAPS_EMBED_KEY || GOOGLE_MAPS_EMBED_KEY === "YOUR_GOOGLE_MAPS_EMBED_KEY") {
    // fallback – normal map search
    return (
      "https://www.google.com/maps/embed/v1/search?key=" +
      encodeURIComponent(GOOGLE_MAPS_EMBED_KEY || "AIza") +
      "&q=" +
      encodeURIComponent(city)
    );
  }
  return (
    "https://www.google.com/maps/embed/v1/streetview?key=" +
    encodeURIComponent(GOOGLE_MAPS_EMBED_KEY) +
    "&location=" +
    coords.lat +
    "," +
    coords.lon +
    "&heading=210&pitch=10&fov=80"
  );
}

function updateStreetView(city) {
  const mini = $("street-iframe");
  const full = $("street-full-iframe");
  const url = buildStreetUrl(city);
  mini.src = url;
  full.src = url;
  $("street-title").textContent = "Street View – " + city;
  $("street-full-title").textContent = "Street View – " + city;
}

// ================ HERO + CARDS ===================

async function refreshAll() {
  const city = state.city;
  $("hero-city").textContent = city;
  $("footer-city").textContent = "Grad: " + city;
  $("hero-city-label").textContent = "Odabrani grad";

  updateStreetView(city);

  try {
    $("backend-status").textContent = I18N[state.lang].backendOnline;

    const [
      hero,
      alerts,
      weather,
      sea,
      traffic,
      booking,
      airport,
      services,
      emergency,
      transit,
      landmarks
    ] = await Promise.all([
      callTBW("hero", { city }),
      callTBW("alerts", { city }),
      callTBW("weather", { city }),
      callTBW("sea", { city }),
      callTBW("traffic", { city }),
      callTBW("booking", { city }),
      callTBW("airport", { city }),
      callTBW("services", { city }),
      callTBW("emergency", { city }),
      callTBW("transit", { city }),
      callTBW("landmarks", { city })
    ]);

    updateHero(hero, city);
    updateTickerFromData(alerts, traffic, weather);
    updateWeatherCard(weather);
    updateSeaCard(sea);
    updateTrafficCard(traffic);
    updateBookingCard(booking);
    updateAirportCard(airport);
    updateServicesCard(services);
    updateEmergencyCard(emergency);
    updateTransitCard(transit);
    updateLandmarksCard(landmarks);
    updateAlertsCard(alerts);
  } catch (e) {
    console.error("refreshAll error", e);
    $("backend-status").textContent = "Backend: error";
    $("ticker-track").textContent = "Greška pri spajanju na backend.";
  }
}

function updateHero(hero, city) {
  try {
    const heroEl = $("hero");
    let url = null;
    if (hero && hero.images && hero.images.length > 0) {
      url = hero.images[0];
    }
    if (!url) {
      url =
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80";
    }
    heroEl.style.backgroundImage = "url('" + url + "')";
    $("hero-tagline").textContent =
      "Personalizirana upozorenja, status i sigurnost za " + city + ".";
  } catch (e) {
    console.error("updateHero error", e);
  }
}

// ================ TICKER =========================

let tickerTimer = null;

function updateTickerFromData(alerts, traffic, weather) {
  const parts = [];

  if (alerts && alerts.alert) {
    parts.push("ALERT: " + alerts.alert);
  }
  if (traffic && traffic.status) {
    parts.push("PROMET (" + (traffic.level || "") + "): " + traffic.status);
  }
  if (weather && typeof weather.temp === "number") {
    parts.push(
      "VRIJEME: " +
        weather.city +
        " " +
        weather.temp +
        "°C, " +
        (weather.condition || "")
    );
  }

  if (parts.length === 0) {
    parts.push("Nema posebnih upozorenja za odabrani grad. Ugodan put! ✅");
  }

  $("ticker-track").textContent = "  •  " + parts.join("   •   ");

  // restart animacije
  const track = $("ticker-track");
  track.style.animation = "none";
  // force reflow
  void track.offsetWidth;
  track.style.animation = null;
}

async function refreshTickerOnly() {
  try {
    const city = state.city;
    const [alerts, traffic, weather] = await Promise.all([
      callTBW("alerts", { city }),
      callTBW("traffic", { city }),
      callTBW("weather", { city })
    ]);
    updateTickerFromData(alerts, traffic, weather);
  } catch (e) {
    console.error("ticker refresh error", e);
  }
}

function startTickerLoop() {
  if (tickerTimer) clearInterval(tickerTimer);
  tickerTimer = setInterval(refreshTickerOnly, 60000); // 60 s
}

// ================ KARTICE – UPDATE ==============

function updateWeatherCard(data) {
  const body = $("weather-body");
  if (!data || typeof data.temp !== "number") {
    body.textContent = "Greška pri učitavanju prognoze.";
    return;
  }
  body.innerHTML =
    "<strong>" +
    data.city +
    "</strong><br/>" +
    data.temp +
    "°C – " +
    (data.condition || "Nepoznato");
}

function updateSeaCard(data) {
  const body = $("sea-body");
  if (!data || !data.state) {
    body.textContent = "Greška pri učitavanju stanja mora.";
    return;
  }
  body.textContent = data.state;
}

function updateTrafficCard(data) {
  const body = $("traffic-body");
  if (!data || !data.status) {
    body.textContent = "Nema podataka o prometu.";
    return;
  }
  body.innerHTML =
    "<strong>Status:</strong> " +
    data.status +
    "<br/><span style='color:#9ca3af;font-size:0.78rem'>Razina: " +
    (data.level || "UNKNOWN") +
    "</span>";
}

function updateBookingCard(data) {
  if (!data) return;
  $("booking-city").textContent = data.city || state.city;
  $("booking-dates").textContent = data.dates || "";
  $("booking-price").textContent = data.price || "";
  const btn = $("booking-open-btn");
  btn.onclick = function () {
    if (data.url) {
      window.open(data.url, "_blank");
    }
  };
}

function updateAirportCard(data) {
  const body = $("airport-body");
  if (!data || !data.status) {
    body.textContent = "Nema aktivnih informacija o letovima.";
    return;
  }
  body.innerHTML =
    "<strong>ICAO/IATA:</strong> " +
    (data.airport || "") +
    "<br/>" +
    data.status;
}

function updateServicesCard(data) {
  const body = $("services-body");
  if (!data || !data.list) {
    body.textContent = "Nema dostupnih servisnih informacija.";
    return;
  }
  body.innerHTML =
    "<ul>" +
    data.list
      .slice(0, 6)
      .map(function (x) {
        return "<li>" + x + "</li>";
      })
      .join("") +
    "</ul>";
}

function updateEmergencyCard(data) {
  const body = $("emergency-body");
  if (!data || !data.status) {
    body.textContent = "Greška pri učitavanju sigurnosnih informacija.";
    return;
  }
  body.textContent = data.status;
}

function updateTransitCard(data) {
  const body = $("transit-body");
  if (!data || !data.status) {
    body.textContent = "Informacije o javnom prijevozu nisu dostupne.";
    return;
  }
  body.textContent = data.status;
}

function updateLandmarksCard(data) {
  const body = $("landmarks-body");
  if (!data || !data.list) {
    body.textContent = "Nema pronađenih znamenitosti.";
    return;
  }
  body.innerHTML =
    "<ul>" +
    data.list
      .slice(0, 6)
      .map(function (x) {
        return "<li>" + x + "</li>";
      })
      .join("") +
    "</ul>";
}

function updateAlertsCard(data) {
  const body = $("alerts-body");
  if (!data || !data.alert) {
    body.textContent = "Nema posebnih upozorenja za ovaj grad. ✅";
    return;
  }
  body.textContent = data.alert;
}

// ================ NAVIGACIJA ====================

async function handleRouteRequest() {
  if (state.trialExpired) {
    // u DEMO modu ne zovemo backend
    $("nav-summary").textContent =
      "DEMO način: dostupna je samo procjena. Otključaj rute nakon triala.";
    return;
  }

  const from = $("nav-from").value.trim() || state.city;
  const to = $("nav-to").value.trim() || state.city;

  $("nav-summary").textContent = "Računam rutu...";

  try {
    const data = await callTBW("route", { from: from, to: to });
    if (!data) {
      $("nav-summary").textContent = "Greška pri izračunu rute.";
      return;
    }
    $("nav-summary").innerHTML =
      "<strong>" +
      from +
      " → " +
      to +
      "</strong><br/>Udaljenost: " +
      (data.distance || "Nepoznato") +
      "<br/>Trajanje: " +
      (data.duration || "Nepoznato") +
      "<br/><span style='font-size:0.78rem;color:#9ca3af'>Izvor: " +
      (data.source || "n/a") +
      " – detalje provjeri u Google Maps.</span>";
  } catch (e) {
    console.error("route error", e);
    $("nav-summary").textContent =
      "Greška pri izračunu rute. Pokušaj ponovno.";
  }
}

// ================ JEZICI ========================

function applyLanguage() {
  const lang = state.lang;
  const i = I18N[lang] || I18N.hr;

  $("card-nav-title").textContent = i.nav;
  $("card-booking-title").textContent = i.booking;
  $("card-weather-title").textContent = i.weather;
  $("card-traffic-title").textContent = i.traffic;
  $("card-airport-title").textContent = i.airport;
  $("card-sea-title").textContent = i.sea;
  $("card-services-title").textContent = i.services;
  $("card-emergency-title").textContent = i.emergency;
  $("card-transit-title").textContent = i.transit;
  $("card-landmarks-title").textContent = i.landmarks;
  $("card-alerts-title").textContent = i.alerts;
  $("ticker-label").textContent = i.tickerLabel;
  $("backend-status").textContent = i.backendOnline;

  initTrial(); // da osvježi tekst triala na jeziku
}

// ================ VOICE SEARCH (basic) ==========

function initVoiceSearch() {
  const btn = $("voice-btn");
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    btn.style.display = "none";
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition();
  rec.lang = "hr-HR";
  rec.continuous = false;
  rec.interimResults = false;

  rec.onresult = function (ev) {
    const text = ev.results[0][0].transcript;
    $("main-search-input").value = text;
    handleMainSearchSubmit();
  };

  rec.onerror = function (e) {
    console.error("speech error", e);
  };

  btn.addEventListener("click", function () {
    try {
      rec.start();
    } catch (e) {
      console.error("speech start error", e);
    }
  });
}

// ================ MAIN SEARCH ===================

async function handleMainSearchSubmit(evt) {
  if (evt) evt.preventDefault();
  const q = $("main-search-input").value.trim();
  if (!q) return;

  // najjednostavnije: zadnja riječ kao grad
  const parts = q.split(/\s+/);
  const city = parts[parts.length - 1];
  state.city = city.charAt(0).toUpperCase() + city.slice(1);
  $("nav-to").value = state.city;
  $("booking-city").textContent = state.city;

  await refreshAll();
}

// ================ INIT ==========================

function initStreetViewOverlay() {
  $("street-expand").addEventListener("click", function () {
    $("street-overlay").style.display = "flex";
  });
  $("street-close").addEventListener("click", function () {
    $("street-overlay").style.display = "none";
  });
}

function initEvents() {
  $("nav-btn").addEventListener("click", handleRouteRequest);
  $("main-search-form").addEventListener("submit", handleMainSearchSubmit);

  $("language-select").addEventListener("change", function () {
    state.lang = this.value;
    applyLanguage();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  state.city = "Split";
  $("nav-to").value = "Split";

  initEvents();
  initTrial();
  initStreetViewOverlay();
  initVoiceSearch();
  applyLanguage();
  refreshAll();
  startTickerLoop();
});
