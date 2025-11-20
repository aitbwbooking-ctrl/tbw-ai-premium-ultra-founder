// TBW AI PREMIUM – GLOBAL BACKEND ULTRA (FULL FILE)
// =================================================
// 100% kompatibilno s novim index.html i app.js
// HERO LIVE KAMERE + AI + SINKRONIZACIJA + MULTIJEZIK
// GLOBAL FALLBACK + UNSPLASH + TRIAL + FOUNDER MODE
// =================================================

const OPENWEATHER = process.env.OPENWEATHER_API_KEY || null;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY || null;
const GOOGLE_DIRECTIONS = process.env.GOOGLE_DIRECTIONS_API_KEY || null;
const AVIATIONSTACK = process.env.AVIATIONSTACK_API_KEY || null;

// Founder & security
const FOUNDER_CODE = process.env.FOUNDER_ACCESS_CODE || "TBW-FOUNDER-777";
const KILL_SWITCH = process.env.APP_DISABLED || "false";

// GLOBAL LIVE CAMERA API (Windy webcams)
const WINDY_API_KEY = process.env.WINDY_API_KEY || null;

// Premium ručne kamere po gradovima
const MANUAL_CAMERAS = {
  split: [
    "https://webtv.uvcdn.net/hls-live/amlst:SPLIT_RIVA/playlist.m3u8",
    "https://webtv.uvcdn.net/hls-live/amlst:SPLIT_MATEJUSKA/playlist.m3u8"
  ],
  zadar: [
    "https://webtv.uvcdn.net/hls-live/amlst:ZADAR_RIVA/playlist.m3u8"
  ],
  zagreb: [
    "https://webtv.uvcdn.net/hls-live/amlst:ZAGREB_TRG/playlist.m3u8"
  ],
  tokyo: [
    "https://www.youtube.com/embed/luQ2w0cVn4U?autoplay=1&mute=1"
  ],
  london: [
    "https://www.youtube.com/embed/1OiQHcF1jd0?autoplay=1&mute=1"
  ],
  "new york": [
    "https://www.youtube.com/embed/Ad0Zq0mWYak?autoplay=1&mute=1"
  ]
};

// respond helper
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

// kill switch (global control)
function killSwitchCheck(res) {
  if (String(KILL_SWITCH).toLowerCase() === "true") {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "App is temporarily disabled by admin." }));
    return true;
  }
  return false;
}

// geocode fallback
async function geocodeCity(city) {
  const map = {
    split: { lat: 43.5081, lon: 16.4402 },
    zadar: { lat: 44.1194, lon: 15.2314 },
    zagreb: { lat: 45.815, lon: 15.9819 },
    london: { lat: 51.5074, lon: -0.1278 },
    tokyo: { lat: 35.6762, lon: 139.6503 },
    "new york": { lat: 40.7128, lon: -74.006 }
  };

  const key = city.toLowerCase();
  if (map[key]) return map[key];

  if (!OPENWEATHER) return { lat: 45.0, lon: 15.0 };

  try {
    const geo = await fetchJSON(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${OPENWEATHER}`
    );
    if (geo?.length) return { lat: geo[0].lat, lon: geo[0].lon };
  } catch {}

  return { lat: 45.0, lon: 15.0 };
}

// ============ HERO LIVE CAMERA SYSTEM ===================
async function handleHero(city) {
  const key = city.toLowerCase();

  // 1) manual premium cameras
  if (MANUAL_CAMERAS[key] && MANUAL_CAMERAS[key].length) {
    return {
      type: "live",
      source: "manual",
      city,
      url: MANUAL_CAMERAS[key][0]
    };
  }

  // 2) Windy webcams API
  if (WINDY_API_KEY) {
    try {
      const { lat, lon } = await geocodeCity(city);

      const data = await fetchJSON(
        `https://api.windy.com/api/webcams/v2/list/nearby=${lat},${lon},30?show=webcams:image,location&key=${WINDY_API_KEY}`
      );

      const cams = data?.result?.webcams || [];

      if (cams.length) {
        const c = cams[0];
        const player =
          c.player?.live?.embed || c.player?.day?.embed || null;

        if (player) {
          return {
            type: "live",
            source: "windy",
            city,
            url: player
          };
        }

        // snapshot fallback
        if (c.image?.current?.preview) {
          return {
            type: "snapshot",
            source: "windy",
            city,
            url: c.image.current.preview
          };
        }
      }
    } catch {}
  }

  // 3) Unsplash fallback
  const fallback = `https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1400`;

  if (!UNSPLASH)
    return { type: "image", source: "fallback", city, url: fallback };

  try {
    const data = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " city"
      )}&client_id=${UNSPLASH}&orientation=landscape&per_page=1`
    );
    const img = data.results?.[0]?.urls?.regular;
    return {
      type: "image",
      source: img ? "unsplash" : "fallback",
      city,
      url: img || fallback
    };
  } catch {
    return { type: "image", source: "fallback-error", city, url: fallback };
  }
}

// ============ TICKER / ALERTS ======================
async function handleAlerts(city) {
  try {
    const { lat, lon } = await geocodeCity(city);

    if (OPENWEATHER) {
      const ow = await fetchJSON(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER}`
      );
      const alerts = ow.alerts?.map((a) => a.event || a.description) || [];
      return { city, alerts };
    }
  } catch {}

  return { city, alerts: ["No active alerts."] };
}

// ============ WEATHER ===============================
async function handleWeather(city, lang = "en") {
  const { lat, lon } = await geocodeCity(city);

  if (!OPENWEATHER) {
    return {
      city,
      temp: 20,
      condition: "Clear (demo)",
      icon: "01d",
      lat,
      lon
    };
  }

  try {
    const w = await fetchJSON(
      `https://api.openweather
