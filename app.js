// TBW AI PREMIUM — FRONTEND ULTRA
const API_BASE = "/api/tbw";
let currentCity = "Split";

// ---------------- HERO FALLBACKS ----------------
const HERO_FALLBACKS = [
  "https://images.unsplash.com/photo-1505853085567-b58d89ba3e23?w=1200",
  "https://images.unsplash.com/photo-1493558103817-58b6727a0408?w=1200",
  "https://images.unsplash.com/photo-1521545397978-5ea2c6688880?w=1200"
];

// ---------------- HELPERS ----------------
const $ = (sel) => document.querySelector(sel);

async function callAPI(route, params = {}) {
  const url = new URL(API_BASE, window.location.origin);

  url.searchParams.set("route", route);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("HTTP " + res.status);

  const json = await res.json();
  return json.data;   // << KLJUČNO — vraćamo *unutarnje* podatke
}

function randomHero() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

// ---------------- HERO IMAGE + TIKER ----------------
async function loadHero(city) {
  try {
    const d = await callAPI("hero", { city });
    $("#heroImg").src = d.images?.[0] || randomHero();
  } catch {
    $("#heroImg").src = randomHero();
  }
}

async function loadTicker() {
  try {
    const d = await callAPI("alerts", { city: currentCity });
    $("#alertTicker").textContent = d.message || "Nema upozorenja.";
  } catch {
    $("#alertTicker").textContent = "Greška pri učitavanju upozorenja.";
  }
}

setInterval(loadTicker, 60000);

// ---------------- NAVIGACIJA ----------------
async function loadRoute() {
  const from = $("#navFrom").value || currentCity;
  const to = $("#navTo").value || "";

  if (!to.trim()) {
    $("#navInfo").textContent = "Unesi odredište...";
    return;
  }

  try {
    const d = await callAPI("route", { from, to });
    $("#navInfo").textContent = `${d.distance} – ${d.duration}`;
  } catch {
    $("#navInfo").textContent = "Greška u navigaciji.";
  }
}

$("#navGo").onclick = loadRoute;

// ---------------- BOOKING ----------------
async function loadBooking(city) {
  try {
    const d = await callAPI("booking", { city });
    $("#bookCity").textContent = d.city;
    $("#bookDates").textContent = d.dates;
    $("#bookPrice").textContent = d.price;
    $("#bookLink").href = d.url;
  } catch {
    $("#bookingBox").innerHTML = "Greška.";
  }
}

// ---------------- WEATHER ----------------
async function loadWeather(city) {
  try {
    const d = await callAPI("weather", { city });
    $("#wTemp").textContent = d.temp + "°C";
    $("#wCond").textContent = d.condition;
    $("#wCity").textContent = city;
  } catch {
    $("#wTemp").textContent = "-";
    $("#wCond").textContent = "Greška";
  }
}

// ---------------- TRAFFIC ----------------
async function loadTraffic(city) {
  try {
    const d = await callAPI("traffic", { city });
    $("#trafficBox").textContent = d.status;
  } catch {
    $("#trafficBox").textContent = "Greška.";
  }
}

// ---------------- SEA ----------------
async function loadSea(city) {
  try {
    const d = await callAPI("sea", { city });
    $("#seaBox").textContent = d.state;
  } catch {
    $("#seaBox").textContent = "Greška.";
  }
}

// ---------------- AIRPORT ----------------
async function loadAirport(city) {
  try {
    const d = await callAPI("airport", { city });
    $("#airportBox").textContent = d.status;
  } catch {
    $("#airportBox").textContent = "Greška.";
  }
}

// ---------------- SERVICES ----------------
async function loadServices(city) {
  try {
    const d = await callAPI("services", { city });
    $("#servicesBox").textContent = d.list.join(", ");
  } catch {
    $("#servicesBox").textContent = "Greška.";
  }
}

// ---------------- EMERGENCY ----------------
async function loadEmergency(city) {
  try {
    const d = await callAPI("emergency", { city });
    $("#emergencyBox").textContent = d.status;
  } catch {
    $("#emergencyBox").textContent = "Greška.";
  }
}

// ---------------- TRANSIT ----------------
async function loadTransit(city) {
  try {
    const d = await callAPI("transit", { city });
    $("#transitBox").textContent = d.status;
  } catch {
    $("#transitBox").textContent = "Greška.";
  }
}

// ---------------- ALERTS ----------------
async function loadAlerts(city) {
  try {
    const d = await callAPI("alerts", { city });
    $("#alertsBox").textContent = d.message;
  } catch {
    $("#alertsBox").textContent = "Greška.";
  }
}

// ---------------- LANDMARKS ----------------
async function loadLandmarks(city) {
  try {
    const d = await callAPI("landmarks", { city });
    $("#landmarksBox").textContent = d.list.join(", ");
  } catch {
    $("#landmarksBox").textContent = "Greška.";
  }
}

// ---------------- PHOTOS ----------------
async function loadPhotos(city) {
  try {
    const d = await callAPI("photos", { city });
    $("#photosBox").innerHTML = d.images
      .map((img) => `<img src="${img}" class="photo-thumb">`)
      .join("");
  } catch {
    $("#photosBox").textContent = "Greška.";
  }
}

// ---------------- SEARCH ----------------
$("#searchBtn").onclick = async () => {
  const city = $("#cityInput").value.trim();
  if (!city) return;

  currentCity = city;
  loadEverything();
};

// ---------------- LOAD EVERYTHING ----------------
function loadEverything() {
  loadHero(currentCity);
  loadTicker();
  loadBooking(currentCity);
  loadWeather(currentCity);
  loadTraffic(currentCity);
  loadSea(currentCity);
  loadAirport(currentCity);
  loadServices(currentCity);
  loadEmergency(currentCity);
  loadTransit(currentCity);
  loadAlerts(currentCity);
  loadLandmarks(currentCity);
  loadPhotos(currentCity);
}

// INIT
loadEverything();
loadTicker();
