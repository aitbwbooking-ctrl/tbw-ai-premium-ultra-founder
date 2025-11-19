// TBW AI PREMIUM - FRONTEND ULTRA
// Spojeno sa backendom: /api/tbwRoutes

const API = "/api/tbwRoutes";

// ===== helpers =====
const $ = (s) => document.querySelector(s);
async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error("API error");
  return await r.json();
}

// ===== HERO SECTION =====

const heroImg = $("#heroImg");

async function loadHero() {
  try {
    const data = await get("/hero");
    const pics = data.images;
    if (pics && pics.length > 0) {
      const img = pics[Math.floor(Math.random() * pics.length)];
      heroImg.src = img;
    }
  } catch (e) {
    heroImg.src =
      "https://images.unsplash.com/photo-1523510955272-081c85be4f59";
  }
}

// ===== TIKER =====

const tickerEl = $("#alertTicker");

async function loadTicker() {
  try {
    const data = await get("/alerts");
    if (data.alerts?.length) {
      tickerEl.innerText = data.alerts.join(" • ");
    } else {
      tickerEl.innerText = "Nema aktivnih upozorenja";
    }
  } catch (e) {
    tickerEl.innerText = "Greška pri učitavanju upozorenja";
  }
}

// automatsko osvježavanje
setInterval(loadTicker, 60000);

// ===== SEARCH BAR =====

$("#searchBtn").onclick = () => {
  const q = $("#cityInput").value.trim();
  if (!q) return alert("Upiši grad ili pojam");
  loadAll(q);
};

$("#micBtn").onclick = () => {
  if (!window.webkitSpeechRecognition) {
    alert("Glasovna pretraga nije podržana");
    return;
  }
  const rec = new webkitSpeechRecognition();
  rec.lang = "hr-HR";
  rec.start();
  rec.onresult = (e) => {
    const t = e.results[0][0].transcript;
    $("#cityInput").value = t;
    loadAll(t);
  };
};

// ===== NAVIGACIJA =====

$("#navGo").onclick = async () => {
  const from = $("#navFrom").value.trim();
  const to = $("#navTo").value.trim();

  if (!to) return alert("Upiši odredište");

  try {
    const data = await get(`/route?from=${from}&to=${to}`);
    $("#navInfo").innerHTML = `
      <strong>Ruta:</strong> ${data.from} → ${data.to}<br>
      <strong>Udaljenost:</strong> ${data.distance}<br>
      <strong>Trajanje:</strong> ${data.duration}
    `;
  } catch {
    $("#navInfo").innerText = "Greška u navigaciji";
  }
};

// ===== BOOKING =====

async function loadBooking(city) {
  try {
    const d = await get(`/booking?q=${city}`);
    $("#bookCity").innerText = city;
    $("#bookLink").href = d.link;
  } catch {
    $("#bookLink").innerText = "Greška";
  }
}

// ===== WEATHER =====

async function loadWeather(city) {
  try {
    const d = await get("/weather");
    $("#wTemp").innerText = d.temp + "°C";
    $("#wCond").innerText = d.cond;
    $("#wCity").innerText = city;
  } catch {
    $("#wCond").innerText = "Greška";
  }
}

// ===== TRAFFIC =====

async function loadTraffic() {
  try {
    const d = await get("/traffic");
    $("#trafficBox").innerText = d.traffic;
  } catch {
    $("#trafficBox").innerText = "Greška";
  }
}

// ===== ALL AT ONCE =====

async function loadAll(city) {
  loadHero();
  loadTicker();
  loadBooking(city);
  loadWeather(city);
  loadTraffic();
}

// Start
loadAll("Split");
loadHero();
loadTicker();
