// ============ GLOBAL =====================
const API_BASE = "/api/tbw";
const DEFAULT_CITY = "Split";

let currentCity = DEFAULT_CITY;
let tickerMessages = [];
let geocoder = null;
let streetMiniPano = null;
let streetFullPano = null;

// ============ DOM ELEMENTI ===============
const elHeroImg     = document.getElementById("hero-img");
const elSearchInput = document.getElementById("search-input");
const elVoiceBtn    = document.getElementById("voice-btn");
const elTikerText   = document.getElementById("tiker-text");

const elNavFrom   = document.getElementById("nav-from");
const elNavTo     = document.getElementById("nav-to");
const elNavSearch = document.getElementById("nav-search");
const elNavResult = document.getElementById("nav-result");

const elBookingData = document.getElementById("booking-data");
const elBookingLink = document.getElementById("booking-link");

const elWeatherData  = document.getElementById("weather-data");
const elTrafficData  = document.getElementById("traffic-data");
const elAirportData  = document.getElementById("airport-data");
const elServicesData = document.getElementById("services-data");
const elAlertsData   = document.getElementById("alerts-data");
const elLandData     = document.getElementById("landmarks-data");
const elPhotosGrid   = document.getElementById("photos-grid");

// street view
const elStreetMini   = document.getElementById("street-mini-map");
const elStreetExpand = document.getElementById("street-expand");
const elStreetFull   = document.getElementById("street-full");
const elStreetFullMap = document.getElementById("street-full-map");
const elStreetClose  = document.getElementById("street-close");

// top nav
const topNavItems = document.querySelectorAll("#top-nav span");

// ============ HELPERI =====================

async function api(route, params = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, v);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`API ${route} HTTP ${res.status}`);
  }
  return await res.json();
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function createListHTML(items) {
  if (!items || !items.length) return "<p>Nema podataka.</p>";
  return "<ul>" + items.map((i) => `<li>${i}</li>`).join("") + "</ul>";
}

// ====== GOOGLE MAPS / AUTOCOMPLETE / STREETVIEW ======

function initMapsStuff() {
  if (!window.google || !google.maps) {
    console.warn("Google Maps JS nije dostupan.");
    return;
  }

  geocoder = new google.maps.Geocoder();

  // autocomplete za polja
  const options = { types: ["(cities)"] };

  try {
    new google.maps.places.Autocomplete(elSearchInput, options);
  } catch (e) {}

  try {
    new google.maps.places.Autocomplete(elNavFrom);
    new google.maps.places.Autocomplete(elNavTo);
  } catch (e) {}

  // mini street view
  streetMiniPano = new google.maps.StreetViewPanorama(elStreetMini, {
    pov: { heading: 34, pitch: 10 },
    zoom: 1
  });

  // fullscreen street view
  streetFullPano = new google.maps.StreetViewPanorama(elStreetFullMap, {
    pov: { heading: 34, pitch: 10 },
    zoom: 1
  });
}

function geocodeCity(city) {
  return new Promise((resolve) => {
    if (!geocoder) {
      // fallback: Split
      return resolve({ lat: 43.5081, lng: 16.4402 });
    }
    geocoder.geocode({ address: city }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        // fallback Split
        resolve({ lat: 43.5081, lng: 16.4402 });
      }
    });
  });
}

async function updateStreetView(city) {
  if (!streetMiniPano || !streetFullPano) return;
  const { lat, lng } = await geocodeCity(city);

  const pos = { lat, lng };
  streetMiniPano.setPosition(pos);
  streetFullPano.setPosition(pos);
}

// ============ TIKER =======================

function updateTickerFromData(alerts, weather, sea, traffic, emergency, transit) {
  tickerMessages = [];

  if (alerts && alerts.alert) {
    tickerMessages.push(`ALERT: ${alerts.alert}`);
  }

  if (weather && weather.condition && typeof weather.temp !== "undefined") {
    tickerMessages.push(
      `Vrijeme: ${weather.condition}, ${weather.temp}°C u ${weather.city || currentCity}`
    );
  }

  if (sea && sea.state) {
    tickerMessages.push(`More: ${sea.state}`);
  }

  if (traffic && traffic.status) {
    tickerMessages.push(`Promet: ${traffic.status}`);
  }

  if (emergency && emergency.status) {
    tickerMessages.push(`Sigurnost: ${emergency.status}`);
  }

  if (transit && transit.status) {
    tickerMessages.push(`Prijevoz: ${transit.status}`);
  }

  if (!tickerMessages.length) {
    tickerMessages.push("Nema posebnih upozorenja. Ugodan put! ✅");
  }

  elTikerText.textContent = tickerMessages.join("  •  ");
  // CSS animacija već radi scroll – nema potrebe za dodatnim intervalom
}

// ============ POPUNJAVANJE KARTICA ========

async function loadHero(city) {
  try {
    const data = await api("hero", { city });
    if (data.images && data.images.length) {
      elHeroImg.src = data.images[0];
    }
  } catch (e) {
    console.warn("hero error", e.message);
  }
}

async function loadAlerts(city) {
  try {
    const data = await api("alerts", { city });
    setText(elAlertsData, data.alert || "Nema posebnih upozorenja.");
    return data;
  } catch (e) {
    console.warn("alerts error", e.message);
    setText(elAlertsData, "Greška pri učitavanju upozorenja.");
    return null;
  }
}

async function loadWeather(city) {
  try {
    const data = await api("weather", { city });
    elWeatherData.innerHTML = `
      <p><strong>${data.city || city}</strong></p>
      <p>${data.condition || ""}</p>
      <p style="font-size:32px;">${typeof data.temp === "number" ? data.temp + "°C" : ""}</p>
    `;
    return data;
  } catch (e) {
    console.warn("weather error", e.message);
    setText(elWeatherData, "Greška pri učitavanju vremena.");
    return null;
  }
}

async function loadSea(city) {
  try {
    const data = await api("sea", { city });
    // nema posebnu karticu – koristimo samo za tiker
    return data;
  } catch (e) {
    console.warn("sea error", e.message);
    return null;
  }
}

async function loadTraffic(city) {
  try {
    const data = await api("traffic", { city });
    elTrafficData.innerHTML = `
      <p>${data.status || "Nema podataka."}</p>
      <p><small>Razina: ${data.level || "?"}</small></p>
    `;
    return data;
  } catch (e) {
    console.warn("traffic error", e.message);
    setText(elTrafficData, "Greška pri učitavanju prometa.");
    return null;
  }
}

async function loadBooking(city) {
  try {
    const data = await api("booking", { city });
    elBookingData.innerHTML = `
      <p><strong>Grad:</strong> ${data.city}</p>
      <p><strong>Datumi:</strong> ${data.dates}</p>
      <p><strong>Cijena:</strong> ${data.price}</p>
    `;
    elBookingLink.href = data.url;
    return data;
  } catch (e) {
    console.warn("booking error", e.message);
    setText(elBookingData, "Greška pri učitavanju smještaja.");
    elBookingLink.removeAttribute("href");
    return null;
  }
}

async function loadAirport(city) {
  try {
    const data = await api("airport", { city });
    elAirportData.innerHTML = `
      <p><strong>Aerodrom:</strong> ${data.airport || "N/A"}</p>
      <p>${data.status || ""}</p>
    `;
    return data;
  } catch (e) {
    console.warn("airport error", e.message);
    setText(elAirportData, "Greška pri učitavanju aerodroma.");
    return null;
  }
}

async function loadServices(city) {
  try {
    const data = await api("services", { city });
    elServicesData.innerHTML = createListHTML(data.list);
    return data;
  } catch (e) {
    console.warn("services error", e.message);
    setText(elServicesData, "Greška pri učitavanju servisa.");
    return null;
  }
}

async function loadEmergency(city) {
  try {
    const data = await api("emergency", { city });
    // nema posebnu karticu – koristimo za tiker
    return data;
  } catch (e) {
    console.warn("emergency error", e.message);
    return null;
  }
}

async function loadTransit(city) {
  try {
    const data = await api("transit", { city });
    // samo za tiker
    return data;
  } catch (e) {
    console.warn("transit error", e.message);
    return null;
  }
}

async function loadLandmarks(city) {
  try {
    const data = await api("landmarks", { city });
    elLandData.innerHTML = createListHTML(data.list);
    return data;
  } catch (e) {
    console.warn("landmarks error", e.message);
    setText(elLandData, "Greška pri učitavanju znamenitosti.");
    return null;
  }
}

async function loadPhotos(city) {
  try {
    const data = await api("photos", { city });
    elPhotosGrid.innerHTML = "";
    const images = data.images || [];
    if (!images.length) {
      elPhotosGrid.innerHTML = "<p>Nema dostupnih fotografija.</p>";
      return data;
    }
    images.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = city;
      elPhotosGrid.appendChild(img);
    });
    return data;
  } catch (e) {
    console.warn("photos error", e.message);
    elPhotosGrid.innerHTML = "<p>Greška pri učitavanju fotografija.</p>";
    return null;
  }
}

// ============ NAVIGACIJA ===================

async function loadRoute(from, to) {
  try {
    const data = await api("route", { from, to });
    elNavResult.innerHTML = `
      <p><strong>${from}</strong> → <strong>${to}</strong></p>
      <p>Udaljenost: ${data.distance}</p>
      <p>Trajanje: ${data.duration}</p>
      <p><small>Izvor: ${data.source}</small></p>
    `;
  } catch (e) {
    console.warn("route error", e.message);
    elNavResult.textContent = "Greška pri izračunu rute.";
  }
}

// ============ GLAVNI UPDATE ===============

async function updateAll(newCity) {
  currentCity = newCity || DEFAULT_CITY;
  if (elSearchInput) elSearchInput.value = currentCity;

  // hero + street view
  loadHero(currentCity);
  updateStreetView(currentCity);

  // paralelno dohvaćanje svega
  const [
    alerts,
    weather,
    sea,
    traffic,
    booking,
    airport,
    services,
    emergency,
    transit,
    landmarks,
    photos
  ] = await Promise.all([
    loadAlerts(currentCity),
    loadWeather(currentCity),
    loadSea(currentCity),
    loadTraffic(currentCity),
    loadBooking(currentCity),
    loadAirport(currentCity),
    loadServices(currentCity),
    loadEmergency(currentCity),
    loadTransit(currentCity),
    loadLandmarks(currentCity),
    loadPhotos(currentCity)
  ]);

  updateTickerFromData(alerts, weather, sea, traffic, emergency, transit);
}

// ============ EVENT LISTENERS =============

// search input ENTER
if (elSearchInput) {
  elSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const value = elSearchInput.value.trim();
      updateAll(value || DEFAULT_CITY);
    }
  });
}

// voice search (ako browser podržava)
if (elVoiceBtn && "webkitSpeechRecognition" in window) {
  const rec = new webkitSpeechRecognition();
  rec.lang = "hr-HR";
  rec.onresult = (e) => {
    const text = e.results[0][0].transcript;
    elSearchInput.value = text;
    updateAll(text);
  };
  elVoiceBtn.addEventListener("click", () => {
    rec.start();
  });
} else if (elVoiceBtn) {
  elVoiceBtn.addEventListener("click", () => {
    alert("Glasovno pretraživanje nije podržano u ovom pregledniku.");
  });
}

// nav search
if (elNavSearch) {
  elNavSearch.addEventListener("click", () => {
    const from = elNavFrom.value.trim() || currentCity;
    const to = elNavTo.value.trim() || DEFAULT_CITY;
    loadRoute(from, to);
  });
}

// top nav scroll to cards
topNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    const box = item.getAttribute("data-box");
    let targetId = null;
    switch (box) {
      case "alerts":
        targetId = "card-alerts";
        break;
      case "weather":
        targetId = "card-weather";
        break;
      case "sea":
        targetId = "card-weather"; // nemamo posebnu karticu, scroll na vrijeme
        break;
      case "emergency":
        targetId = "card-services";
        break;
      case "alert":
        targetId = "card-alerts";
        break;
    }
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// streetview expand / close
if (elStreetExpand && elStreetFull && elStreetClose) {
  elStreetExpand.addEventListener("click", () => {
    elStreetFull.classList.remove("hidden");
  });
  elStreetClose.addEventListener("click", () => {
    elStreetFull.classList.add("hidden");
  });
}

// ============ INIT =========================

window.addEventListener("load", () => {
  initMapsStuff();
  updateAll(DEFAULT_CITY);
});
