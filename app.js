// TBW AI PREMIUM – FRONTEND ULTRA (single backend route)

const API = "/api/tbw";

// helper
async function api(route, extra = {}) {
  const url = new URL(API, window.location.origin);
  url.searchParams.set("route", route);

  for (const [k, v] of Object.entries(extra)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(res.status);
  return await res.json();
}

// HERO
async function loadHero() {
  const box = document.getElementById("heroImg");
  try {
    const data = await api("hero");
    box.src = data.images[0];
  } catch {
    box.src = "";
  }
}

// WEATHER
async function loadWeather(city = "Split") {
  try {
    const data = await api("weather", { city });
    document.getElementById("wTemp").textContent = data.temp + "°C";
    document.getElementById("wCond").textContent = data.cond;
    document.getElementById("wCity").textContent = city;
  } catch {
    document.getElementById("wTemp").textContent = "--";
  }
}

// ALERT TICKER
async function loadAlerts() {
  try {
    const data = await api("alerts");
    document.getElementById("alertTicker").textContent =
      data.alerts.join(" | ");
  } catch {
    document.getElementById("alertTicker").textContent =
      "Nema dostupnih upozorenja.";
  }
}

// NAVIGATION
async function goNav() {
  const from = document.getElementById("navFrom").value || "Split";
  const to = document.getElementById("navTo").value;

  const info = document.getElementById("navInfo");

  if (!to) {
    info.textContent = "Unesi odredište.";
    return;
  }

  try {
    const data = await api("route", { from, to });
    info.textContent =
      data.duration +
      " min | " +
      data.distance +
      " km – " +
      data.summary;
  } catch {
    info.textContent = "Greška u navigaciji.";
  }
}

// BOOKINGS
async function loadBooking(city = "Split") {
  const link = document.getElementById("bookLink");

  try {
    const data = await api("booking", { city });
    link.href = data.url;
  } catch {
    link.href = "#";
  }
}

// PHOTOS
async function loadPhotos(city = "Split") {
  const box = document.getElementById("photosBox");
  try {
    const data = await api("photos", { city });
    box.innerHTML = data.photos
      .map((p) => `<img src="${p}" class="thumb"/>`)
      .join("");
  } catch {
    box.textContent = "Nema slika.";
  }
}

// TRAFFIC
async function loadTraffic(city = "Split") {
  try {
    const data = await api("traffic", { city });
    document.getElementById("trafficBox").textContent = data.status;
  } catch {
    document.getElementById("trafficBox").textContent = "–";
  }
}

// SEA
async function loadSea(city = "Split") {
  try {
    const data = await api("sea", { city });
    document.getElementById("seaBox").textContent =
      "Temp: " + data.temp + "°C";
  } catch {
    document.getElementById("seaBox").textContent = "–";
  }
}

// INIT
loadHero();
loadAlerts();
loadWeather();
loadTraffic();
loadSea();
loadBooking();
loadPhotos();

// ticker refresh
setInterval(loadAlerts, 60000);

// navigation click
document.getElementById("navGo").onclick = goNav;
