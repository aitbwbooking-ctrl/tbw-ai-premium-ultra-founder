// TBW AI PREMIUM — FRONTEND ULTRA
// Radi s jednim backend endpointom: /api/tbw

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

// *** FIXED VERSION – OVO JE KLJUČNI DIO ***
async function callAPI(route, params = {}) {
  const url = new URL(API_BASE, window.location.origin);

  url.searchParams.set("route", route);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error("HTTP " + res.status);

  return await res.json();
}

function randomHero() {
  return HERO_FALLBACKS[Math.floor(Math.random() * HERO_FALLBACKS.length)];
}

// ---------------- HERO IMAGE + TIKER ----------------
async function loadHero(city) {
  try {
    const data = await callAPI("hero", { city });
    $("#heroImg").src = data.images?.[0] || randomHero();
  } catch {
    $("#heroImg").src = randomHero();
  }
}

async function loadTicker() {
  try {
    const data = await callAPI("alerts", { city: currentCity });
    $("#alertTicker").textContent = data.alert || "Nema upozorenja.";
  } catch {
    $("#alertTicker").textContent = "Greška pri učitavanju upozorenja.";
  }
}

// Auto-refresh ticker svakih 60s
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
    const data = await callAPI("route", { from, to });
    $("#navInfo").textContent = `${data.distance} – ${data.duration}`;
  } catch {
    $("#navInfo").textContent = "Greška u navigaciji.";
  }
}

$("#navGo").onclick = loadRoute;

// ---------------- BOOKING ----------------
async function loadBooking(city) {
  try {
    const data = await callAPI("booking", { city });
    $("#bookCity").textContent = data.city;
    $("#bookDates").textContent = data.dates;
    $("#bookPrice").textContent = data.price;
    $("#bookLink").href = data.url;
  } catch {
    $("#bookingBox").innerHTML = "Greška.";
  }
}

// ---------------- WEATHER ----------------
async function loadWeather(city) {
  try {
    const data = await callAPI("weather", { city });
    $("#wTemp").textContent = data.temp + "°C";
    $("#wCond").textContent = data.condition;
    $("#wCity").textContent = city;
  } catch {
    $("#wTemp").textContent = "-";
    $("#wCond").textContent = "Greška";
  }
}

// ---------------- TRAFFIC ----------------
async function loadTraffic(city) {
  try {
    const data = await callAPI("traffic", { city });
    $("#trafficBox").textContent = data.status;
  } catch {
    $("#trafficBox").textContent = "Greška.";
  }
}

// ---------------- SEA ----------------
async function loadSea(city) {
  try {
    const data = await callAPI("sea", { city });
    $("#seaBox").textContent = data.state;
  } catch {
    $("#seaBox").textContent = "Greška.";
  }
}

// ---------------- AIRPORT ----------------
async function loadAirport(city) {
  try {
    const data = await callAPI("airport", { city });
    $("#airportBox").textContent = data.status;
  } catch {
    $("#airportBox").textContent = "Greška.";
  }
}

// ---------------- SERVICES ----------------
async function loadServices(city) {
  try {
    const data = await callAPI("services", { city });
    $("#servicesBox").textContent = data.list.join(", ");
  } catch {
    $("#servicesBox").textContent = "Greška.";
  }
}

// ---------------- EMERGENCY ----------------
async function loadEmergency(city) {
  try {
    const data = await callAPI("emergency", { city });
    $("#emergencyBox").textContent = data.status;
  } catch {
    $("#emergencyBox").textContent = "Greška.";
  }
}

// ---------------- TRANSIT ----------------
async function loadTransit(city) {
  try {
    const data = await callAPI("transit", { city });
    $("#transitBox").textContent = data.status;
  } catch {
    $("#transitBox").textContent = "Greška.";
  }
}

// ---------------- ALERTS ----------------
async function loadAlerts(city) {
  try {
    const data = await callAPI("alerts", { city });
    $("#alertsBox").textContent = data.alert;
  } catch {
    $("#alertsBox").textContent = "Greška.";
  }
}

// ---------------- LANDMARKS ----------------
async function loadLandmarks(city) {
  try {
    const data = await callAPI("landmarks", { city });
    $("#landmarksBox").textContent = data.list.join(", ");
  } catch {
    $("#landmarksBox").textContent = "Greška.";
  }
}

// ---------------- PHOTOS ----------------
async function loadPhotos(city) {
  try {
    const data = await callAPI("photos", { city });
    $("#photosBox").innerHTML = data.images
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

// ---------------- LOAD ALL SECTIONS ----------------
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
