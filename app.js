// TBW AI PREMIUM — FRONTEND ULTRA
const API_BASE = "/api/tbw";
let currentCity = "Split";

// ---------------- HELPERS ----------------
const $ = (sel) => document.querySelector(sel);

async function callAPI(route, params = {}) {
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);

  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  return await res.json();
}

// ---------------- TIKER ----------------
async function loadTicker() {
  try {
    const data = await callAPI("alerts", { city: currentCity });

    $("#alertTicker").textContent =
      data?.data?.message || "Nema upozorenja.";
  } catch {
    $("#alertTicker").textContent = "Greška pri učitavanju.";
  }
}

// ---------------- ALERTS BOX ----------------
async function loadAlerts(city) {
  try {
    const data = await callAPI("alerts", { city });

    $("#alertsBox").textContent =
      data?.data?.message || "Nema upozorenja.";
  } catch {
    $("#alertsBox").textContent = "Greška.";
  }
}

// Auto refresh
setInterval(loadTicker, 60000);

// ---------------- LOADER ----------------
function loadEverything() {
  loadTicker();
  loadAlerts(currentCity);
}

loadEverything();
