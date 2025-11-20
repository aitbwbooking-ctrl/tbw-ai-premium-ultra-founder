// TBW AI PREMIUM – FINAL APP.JS
// Potpuno kompatibilno s tvojim index.html, style.css i api/tbw.js
// Bez ikakvih dodatnih dodavanja – sve radi odmah.

// ==========================================
// GLOBAL
// ==========================================
let currentCity = "Split";
let currentLang = "hr";

// ==========================================
// ELEMENTS
// ==========================================
const searchInput = document.getElementById("main-search");
const searchBtn = document.getElementById("main-search-btn");
const tickerStrip = document.getElementById("ticker-strip");
const heroContainer = document.getElementById("hero-camera");

// ==========================================
// HELPER – API CALL
// ==========================================
async function api(route, params = {}) {
  const url = new URL("/api/tbw", window.location.origin);
  url.searchParams.set("route", route);
  url.searchParams.set("city", currentCity);
  url.searchParams.set("lang", currentLang);

  for (let k in params) {
    url.searchParams.set(k, params[k]);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ==========================================
// DETEKCIJA JEZIKA UPITA
// ==========================================
function detectLanguage(text) {
  text = text.toLowerCase();

  if (/[čćšđž]/.test(text)) return "hr";
  if (/\b(the|what|how|where|is)\b/.test(text)) return "en";
  if (/\b(comment|pourquoi|quel|quelle)\b/.test(text)) return "fr";
  if (/\b(wie|was|warum)\b/.test(text)) return "de";
  if (/\b(como|que|donde)\b/.test(text)) return "es";
  if (/\b(come|perche)\b/.test(text)) return "it";
  if (/\b(jak|proč|kde)\b/.test(text)) return "cs";
  if (/\b(hogyan|miért|hol)\b/.test(text)) return "hu";

  return "en";
}

// ==========================================
// DETEKCIJA GRADA IZ UPITA
// ==========================================
function detectCityFromQuery(q) {
  const words = q.split(/\s+/);
  return words[words.length - 1] || "Split";
}

// ==========================================
// HERO – LIVE KAMERA
// ==========================================
async function loadHeroCamera() {
  try {
    const data = await api("hero");

    heroContainer.innerHTML = "";

    if (data.type === "live") {
      const iframe = document.createElement("iframe");
      iframe.src = data.url;
      iframe.allow = "autoplay";
      iframe.setAttribute("frameborder", "0");
      iframe.className = "hero-live";
      heroContainer.appendChild(iframe);
    } else if (data.type === "snapshot") {
      const img = document.createElement("img");
      img.src = data.url + "?t=" + Date.now();
      img.className = "hero-img";
      heroContainer.appendChild(img);

      setInterval(() => {
        img.src = data.url + "?t=" + Date.now();
      }, 15000);
    } else {
      const img = document.createElement("img");
      img.src = data.url;
      img.className = "hero-img";
      heroContainer.appendChild(img);
    }
  } catch (err) {
    heroContainer.innerHTML = "Camera error";
  }
}

// ==========================================
// TICKER – REALTIME BESKONAČNO SKROLANJE
// ==========================================
let tickerMessages = [];
let tickerPos = 0;

async function loadTicker() {
  try {
    const data = await api("alerts");
    tickerMessages.push(data.alert);

    updateTickerUI();
  } catch (err) {}
}

function updateTickerUI() {
  tickerStrip.innerHTML = tickerMessages
    .map((msg) => `<span class="ticker-msg">${msg}</span>`)
    .join(" • ");

  tickerStrip.style.animation = "ticker-scroll 25s linear infinite";
}

setInterval(loadTicker, 7000);

// ==========================================
// SYNC SVAKOG PROZORA U APP-u
// ==========================================
async function syncAllCards() {
  loadHeroCamera();
  loadTicker();
  loadCard("nav");
  loadCard("booking");
  loadCard("weather");
  loadCard("traffic");
  loadCard("airport");
  loadCard("sea");
  loadCard("services");
  loadCard("emergency");
  loadCard("transit");
  loadCard("landmarks");
  loadCard("photos");
}

// ==========================================
// UČITAVANJE POJEDINE KARTICE
// ==========================================
async function loadCard(type) {
  const el = document.getElementById(`card-${type}`);

  try {
    const data = await api(type);
    el.innerHTML = formatData(type, data);
  } catch (err) {
    el.innerHTML = "Error loading.";
  }
}

// FORMATIRANJE PODATAKA
function formatData(type, d) {
  switch (type) {
    case "weather":
      return `${d.temp}°C • ${d.condition}`;
    case "traffic":
      return `${d.status}`;
    case "airport":
      return `${d.status}`;
    case "booking":
      return `Best stay: <br>${d.price}<br><a href="${d.url}" target="_blank">Open Booking</a>`;
    default:
      return JSON.stringify(d, null, 2);
  }
}

// ==========================================
// SEARCH – GLAVNI BRAIN
// ==========================================
async function runSearch() {
  const text = searchInput.value.trim();
  if (!text) return;

  currentLang = detectLanguage(text);
  currentCity = detectCityFromQuery(text);

  // Sync svega
  syncAllCards();

  // AI NAVIGACIJA
  const ai = await api("nav_ai", { q: text });

  const nav = document.getElementById("card-nav");
  nav.innerHTML =
    `<strong>${ai.summary}</strong><br><br>` +
    `Route: ${ai.route.distance}, ${ai.route.duration}`;
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

// ==========================================
// INITIAL LOAD
// ==========================================
syncAllCards();
loadTicker();
loadHeroCamera();
