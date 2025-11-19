// TBW AI PREMIUM – FRONTEND ULTRA (Founder mode)

const API_BASE = "/api/tbw";
let currentCity = "Split";

// ----------- HERO FALLBACK SLIKE -----------
const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=1200",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200",
  "https://images.unsplash.com/photo-1526779259212-939e64788e3c?w=1200"
];

const $ = (sel) => document.querySelector(sel);

// ----------- GENERIČAN POZIV NA /api/tbw -----------
async function callAPI(route, params = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);

  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

function randomHero() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

// ============= HERO & TICKER =============

async function loadHero(city) {
  const img = $("#heroImg");
  const heroCity = $("#heroCity");

  heroCity.textContent = city || "Nepoznat grad";

  try {
    const data = await callAPI("hero", { city });
    img.src = data.images?.[0] || randomHero();
  } catch {
    img.src = randomHero();
  }
}

async function loadTicker() {
  try {
    const data = await callAPI("alerts", { city: currentCity });
    $("#alertTicker").textContent =
      data.alert || data.message || "Nema posebnih upozorenja.";
  } catch {
    $("#alertTicker").textContent =
      "Greška pri učitavanju upozorenja (fallback).";
  }
}

// --------- NAVIGACIJA ---------

async function loadRoute() {
  const from = $("#navFrom").value || currentCity;
  const to = $("#navTo").value;

  const out = $("#navInfo");

  if (!to.trim()) {
    out.textContent = "Unesi odredište...";
    return;
  }

  out.textContent = "Računam rutu...";

  try {
    const data = await callAPI("route", { from, to });
    out.textContent =
      (data.distance && data.duration
        ? `${data.distance} • ${data.duration}`
        : data.message || "Ruta izračunata.") + (data.note ? " " + data.note : "");
  } catch {
    out.textContent = "Greška u navigaciji.";
  }
}

$("#navGo").addEventListener("click", loadRoute);

// --------- BOOKING ---------

async function loadBooking(city) {
  const box = $("#bookingBox");
  try {
    const data = await callAPI("booking", { city });
    $("#bookCity").textContent = data.city || city;
    $("#bookDates").textContent = data.dates || "Prema potrebi";
    $("#bookPrice").textContent = data.price || "Na upit";
    $("#bookLink").href = data.url || "#";
  } catch {
    box.querySelector(".card-body").innerHTML =
      '<div class="small-output">Greška pri učitavanju smještaja.</div>';
  }
}

// --------- VRIJEME ---------

async function loadWeather(city) {
  try {
    const data = await callAPI("weather", { city });
    $("#wTemp").textContent = (data.temp != null ? data.temp : "--") + "°C";
    $("#wCond").textContent = data.condition || "Nema podataka";
    $("#wCity").textContent = city;
  } catch {
    $("#wTemp").textContent = "--°C";
    $("#wCond").textContent = "Greška";
    $("#wCity").textContent = city;
  }
}

// --------- PROMET / MORE / AIRPORT / SERVISI / EMERGENCY / TRANSIT / ALERTS / LANDMARKS / PHOTOS ---------

async function loadTraffic(city) {
  try {
    const data = await callAPI("traffic", { city });
    $("#trafficBox").textContent =
      data.status || data.message || "Nema posebnih zastoja.";
  } catch {
    $("#trafficBox").textContent = "Greška pri učitavanju prometa.";
  }
}

async function loadSea(city) {
  try {
    const data = await callAPI("sea", { city });
    $("#seaBox").textContent = data.state || data.message || "Nema podataka.";
  } catch {
    $("#seaBox").textContent = "Greška pri učitavanju stanja mora.";
  }
}

async function loadAirport(city) {
  try {
    const data = await callAPI("airport", { city });
    $("#airportBox").textContent =
      data.status || data.message || "Osnovne informacije o letovima.";
  } catch {
    $("#airportBox").textContent = "Greška pri učitavanju aerodroma.";
  }
}

async function loadServices(city) {
  try {
    const data = await callAPI("services", { city });
    const list = data.list || data.services;
    $("#servicesBox").textContent = list && list.length
      ? list.join(", ")
      : data.message || "Nema posebnih stavki.";
  } catch {
    $("#servicesBox").textContent = "Greška pri učitavanju servisa.";
  }
}

async function loadEmergency(city) {
  try {
    const data = await callAPI("emergency", { city });
    $("#emergencyBox").textContent =
      data.status || data.message || "Standardni brojevi: 112, 192, 193, 194.";
  } catch {
    $("#emergencyBox").textContent = "Greška pri učitavanju sigurnosnih info.";
  }
}

async function loadTransit(city) {
  try {
    const data = await callAPI("transit", { city });
    $("#transitBox").textContent =
      data.status || data.message || "Nema posebnih kašnjenja.";
  } catch {
    $("#transitBox").textContent = "Greška pri učitavanju javnog prijevoza.";
  }
}

async function loadAlerts(city) {
  try {
    const data = await callAPI("alerts", { city });
    $("#alertsBox").textContent =
      data.alert || data.message || "Nema aktivnih upozorenja.";
  } catch {
    $("#alertsBox").textContent = "Greška pri učitavanju alert sustava.";
  }
}

async function loadLandmarks(city) {
  try {
    const data = await callAPI("landmarks", { city });
    const list = data.list || data.landmarks;
    $("#landmarksBox").textContent = list && list.length
      ? list.join(", ")
      : data.message || "Nema podataka o znamenitostima.";
  } catch {
    $("#landmarksBox").textContent = "Greška pri učitavanju znamenitosti.";
  }
}

async function loadPhotos(city) {
  const box = $("#photosBox");
  try {
    const data = await callAPI("photos", { city });
    const images = data.images || [];
    if (!images.length) {
      box.textContent = data.message || "Nema fotografija.";
      return;
    }
    box.innerHTML = images
      .slice(0, 6)
      .map((src) => `<img src="${src}" class="photo-thumb" alt="Foto grada" />`)
      .join("");
  } catch {
    box.textContent = "Greška pri učitavanju fotografija.";
  }
}

// --------- SEARCH GUMB ---------

$("#searchBtn").addEventListener("click", () => {
  const city = $("#cityInput").value.trim();
  if (!city) return;
  currentCity = city;
  $("#heroCity").textContent = city;
  loadEverything();
});

// ENTER u inputu = klik na Traži
$("#cityInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("#searchBtn").click();
});

// --------- LOAD EVERYTHING ---------

function loadEverything() {
  const city = currentCity;
  loadHero(city);
  loadTicker();
  loadBooking(city);
  loadWeather(city);
  loadTraffic(city);
  loadSea(city);
  loadAirport(city);
  loadServices(city);
  loadEmergency(city);
  loadTransit(city);
  loadAlerts(city);
  loadLandmarks(city);
  loadPhotos(city);
}

// INIT
loadEverything();

// auto-refresh tickera svakih 60 sekundi
setInterval(loadTicker, 60000);
