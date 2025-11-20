// TBW AI PREMIUM – ONE ROUTE BACKEND ULTRA
// Sve ide preko /api/tbw?route=...&city=...

// =============== ENV VARS =====================
const OPENWEATHER = process.env.OPENWEATHER_API_KEY || null;
const TOMTOM = process.env.TOMTOM_API_KEY || null;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY || null;
const OPENTRIPMAP = process.env.OPENTRIPMAP_API_KEY || null;
const AVIATIONSTACK = process.env.AVIATIONSTACK_API_KEY || null;

const GOOGLE_DIRECTIONS = process.env.GOOGLE_DIRECTIONS_API_KEY || null;
const GOOGLE_DISTANCE = process.env.GOOGLE_DISTANCE_MATRIX_KEY || null;
const GOOGLE_PLACES = process.env.GOOGLE_PLACES_API_KEY || null;

const AMPEL = process.env.AMPEL_ACCESS_TOKEN || null;

// =============== HELPERI ======================

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`);
  return res.json();
}

// Geocode
async function geocodeCity(city = "Split") {
  const staticMap = {
    split: { lat: 43.5081, lon: 16.4402 },
    zagreb: { lat: 45.815, lon: 15.9819 },
    zadar: { lat: 44.1194, lon: 15.2314 },
    rijeka: { lat: 45.3271, lon: 14.4422 },
    pula: { lat: 44.8666, lon: 13.8496 },
    dubrovnik: { lat: 42.6507, lon: 18.0944 }
  };

  if (!OPENWEATHER) return staticMap[city.toLowerCase()] || staticMap.zagreb;

  try {
    const geo = await fetchJSON(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${OPENWEATHER}`
    );

    if (geo?.length) return { lat: geo[0].lat, lon: geo[0].lon };
  } catch {}

  return staticMap[city.toLowerCase()] || staticMap.zagreb;
}

// =============== ROUTES ======================

// HERO
async function handleHero(city) {
  const fallback = [
    "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=1200",
    "https://images.unsplash.com/photo-1493558103817-58b6727a0408?w=1200",
    "https://images.unsplash.com/photo-1521545397978-5ea2c6688880?w=1200"
  ];

  if (!UNSPLASH) return { city, images: fallback, source: "fallback" };

  try {
    const data = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " travel"
      )}&orientation=landscape&client_id=${UNSPLASH}&per_page=6`
    );

    const images = data.results
      ?.map((p) => p.urls?.regular)
      .filter(Boolean);

    return {
      city,
      images: images?.length ? images : fallback,
      source: images?.length ? "unsplash" : "fallback-empty"
    };
  } catch {
    return { city, images: fallback, source: "fallback-error" };
  }
}

// ALERTS
async function handleAlerts(city) {
  try {
    if (OPENWEATHER) {
      const { lat, lon } = await geocodeCity(city);

      const ow = await fetchJSON(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER}&lang=hr`
      );

      if (ow.alerts?.length) {
        const a = ow.alerts[0];
        const msg = a.event || a.description || "Vremensko upozorenje.";
        return { city, alert: msg };
      }
    }
  } catch {}

  if (AMPEL) {
    try {
      const data = await fetchJSON(
        `https://api.ampelalert.com/v1/alerts?city=${encodeURIComponent(
          city
        )}&token=${AMPEL}`
      );
      if (data.message) return { city, alert: data.message };
    } catch {}
  }

  return {
    city,
    alert: "Nema posebnih sigurnosnih upozorenja za ovo područje. ✅"
  };
}

// WEATHER
async function handleWeather(city) {
  if (!OPENWEATHER)
    return {
      city,
      temp: 22,
      condition: "Sunčano (demo)",
      icon: "01d",
      source: "fallback"
    };

  try {
    const { lat, lon } = await geocodeCity(city);
    const data = await fetchJSON(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=hr&appid=${OPENWEATHER}`
    );

    return {
      city: data.name || city,
      temp: Math.round(data.main?.temp ?? 0),
      condition: data.weather?.[0]?.description || "Nepoznato",
      icon: data.weather?.[0]?.icon || "01d",
      source: "openweather"
    };
  } catch {
    return {
      city,
      temp: 0,
      condition: "Greška pri učitavanju prognoze.",
      icon: "01d",
      source: "fallback-error"
    };
  }
}

// SEA
async function handleSea(city) {
  try {
    const { lat, lon } = await geocodeCity(city);

    if (!OPENWEATHER)
      return { city, state: "Mirno more (demo fallback)." };

    const data = await fetchJSON(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=hr&appid=${OPENWEATHER}`
    );

    const wind = data.wind?.speed ?? 0;

    const state =
      wind < 3
        ? "More mirno, idealno za kupanje."
        : wind < 8
        ? "Lagani valovi, ugodno."
        : wind < 14
        ? "Umjereni valovi – oprez."
        : "Jako valovito – ne preporučuje se kupanje.";

    return { city, state };
  } catch {
    return { city, state: "Greška pri učitavanju stanja mora." };
  }
}

// TRAFFIC (❗ fixed syntax)
async function handleTraffic(city) {
  try {
    if (TOMTOM) {
      const { lat, lon } = await geocodeCity(city);

      const data = await fetchJSON(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM}&point=${lat},${lon}`
      );

      const cur = data.flowSegmentData?.currentSpeed ?? 1;
      const freeRaw = data.flowSegmentData?.freeFlowSpeed;
      const free = typeof freeRaw === "number" ? freeRaw : cur || 1;

      const ratio = cur / free;

      const level =
        ratio > 0.9
          ? "LOW"
          : ratio > 0.7
          ? "MEDIUM"
          : ratio > 0.4
          ? "HIGH"
          : "CRITICAL";

      const status =
        level === "LOW"
          ? "Promet teče normalno."
          : level === "MEDIUM"
          ? "Umjereno gust promet."
          : level === "HIGH"
          ? "Gusti promet, usporavanja."
          : "Vrlo gust promet i zastoji.";

      return { city, status, level, source: "tomtom" };
    }
  } catch {}

  return {
    city,
    status: "Nema dostupnih podataka o prometu.",
    level: "UNKNOWN",
    source: "fallback"
  };
}

// ROUTE
async function handleRoute(from, to) {
  if (!from || !to)
    return {
      from,
      to,
      distance: "Nepoznato",
      duration: "Nepoznato",
      source: "invalid"
    };

  // Google Directions
  if (GOOGLE_DIRECTIONS) {
    try {
      const data = await fetchJSON(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          from
        )}&destination=${encodeURIComponent(to)}&key=${GOOGLE_DIRECTIONS}`
      );

      const leg = data.routes?.[0]?.legs?.[0];
      if (leg)
        return {
          from,
          to,
          distance: leg.distance?.text,
          duration: leg.duration?.text,
          source: "google-directions"
        };
    } catch {}
  }

  // Distance Matrix fallback
  if (GOOGLE_DISTANCE) {
    try {
      const dm = await fetchJSON(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          from
        )}&destinations=${encodeURIComponent(to)}&key=${GOOGLE_DISTANCE}`
      );

      const el = dm.rows?.[0]?.elements?.[0];

      if (el?.status === "OK")
        return {
          from,
          to,
          distance: el.distance?.text,
          duration: el.duration?.text,
          source: "google-distance-matrix"
        };
    } catch {}
  }

  return {
    from,
    to,
    distance: "2–5 h (procjena)",
    duration: "Provjeri Google Maps.",
    source: "fallback"
  };
}

// BOOKING
async function handleBooking(city) {
  const today = new Date();
  const start = new Date(today.getTime() + 3 * 86400000);
  const end = new Date(today.getTime() + 6 * 86400000);

  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.`;

  return {
    city,
    dates: `${fmt(start)} – ${fmt(end)}`,
    price: "od 45 € / noć (procjena)",
    url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      city
    )}`,
    source: "booking-link"
  };
}

// AIRPORT
async function handleAirport(city) {
  const map = {
    split: "SPU",
    zagreb: "ZAG",
    zadar: "ZAD",
    rijeka: "RJK",
    pula: "PUY",
    dubrovnik: "DBV"
  };

  const iata = map[city.toLowerCase()];

  if (!AVIATIONSTACK || !iata)
    return {
      city,
      airport: iata || "N/A",
      status: "Informacije o letovima nisu dostupne.",
      source: "fallback"
    };

  try {
    const data = await fetchJSON(
      `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK}&dep_iata=${iata}&limit=5`
    );

    const flights = data.data || [];

    if (!flights.length)
      return {
        city,
        airport: iata,
        status: "Nema aktivnih odlaznih letova.",
        source: "aviationstack"
      };

    const f = flights[0];

    return {
      city,
      airport: iata,
      status: `Sljedeći let: ${f.flight?.iata} → ${
        f.arrival?.airport
      } u ${f.departure?.scheduled?.slice(11, 16)}`,
      source: "aviationstack"
    };
  } catch {
    return {
      city,
      airport: iata,
      status: "Greška pri učitavanju letova.",
      source: "fallback-error"
    };
  }
}

// SERVICES
async function handleServices(city) {
  if (!GOOGLE_PLACES)
    return {
      city,
      list: [
        "112 Hitne službe (24/7)",
        "Lokalne benzinske",
        "Taxi usluge dostupne"
      ],
      source: "fallback"
    };

  try {
    const query = `service stations in ${city}`;
    const data = await fetchJSON(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES}`
    );

    const list = data.results
      ?.slice(0, 6)
      .map((p) => p.name)
      .filter(Boolean);

    return {
      city,
      list: list?.length ? list : ["Nema rezultata."],
      source: "google-places"
    };
  } catch {
    return {
      city,
      list: ["Greška pri učitavanju podataka."],
      source: "fallback-error"
    };
  }
}

// EMERGENCY
async function handleEmergency(city) {
  const base =
    "U hitnim slučajevima nazovi 112 (europski broj za hitne službe).";

  try {
    const alerts = await handleAlerts(city);

    if (
      alerts.alert &&
      !alerts.alert.includes("Nema posebnih")
    ) {
      return {
        city,
        status: `${base} Trenutno upozorenje: ${alerts.alert}`
      };
    }
  } catch {}

  return { city, status: base + " Trenutno nema posebnih upozorenja." };
}

// TRANSIT
async function handleTransit(city) {
  return {
    city,
    status:
      "Javni prijevoz prometuje prema uobičajenom/izmijenjenom rasporedu.",
    source: "fallback"
  };
}

// LANDMARKS
async function handleLandmarks(city) {
  if (!OPENTRIPMAP) {
    const fb = {
      split: ["Dioklecijanova palača", "Riva", "Marjan"],
      zagreb: ["Ban Jelačić", "Katedrala", "Tkalča"],
      dubrovnik: ["Zidine", "Stradun", "Lokrum"]
    };

    return {
      city,
      list: fb[city.toLowerCase()] || ["Glavne znamenitosti."],
      source: "fallback"
    };
  }

  try {
    const geo = await fetchJSON(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
        city
      )}&apikey=${OPENTRIPMAP}`
    );

    const { lat, lon } = geo;

    const places = await fetchJSON(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=3000&lon=${lon}&lat=${lat}&rate=2&limit=10&format=json&apikey=${OPENTRIPMAP}`
    );

    const list = places
      ?.map((p) => p.name)
      .filter(Boolean)
      .slice(0, 8);

    return {
      city,
      list: list?.length ? list : ["Nema znamenitosti."],
      source: "opentripmap"
    };
  } catch {
    return {
      city,
      list: ["Greška kod OpenTripMap."],
      source: "fallback-error"
    };
  }
}

// PHOTOS
async function handlePhotos(city) {
  const fallback = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800",
    "https://images.unsplash.com/photo-1421809313281-48f03fa45e9f?w=800"
  ];

  if (!UNSPLASH) return { city, images: fallback, source: "fallback" };

  try {
    const data = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " city"
      )}&orientation=landscape&client_id=${UNSPLASH}&per_page=9`
    );

    const images = data.results
      ?.map((p) => p.urls?.small)
      .filter(Boolean);

    return {
      city,
      images: images?.length ? images : fallback,
      source: images?.length ? "unsplash" : "fallback-empty"
    };
  } catch {
    return { city, images: fallback, source: "fallback-error" };
  }
}

// =============== MAIN HANDLER =================

module.exports = async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  const route = url.searchParams.get("route") || "hero";
  const city =
    url.searchParams.get("city") ||
    url.searchParams.get("q") ||
    "Split";

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  try {
    let payload;

    switch (route) {
      case "hero":
        payload = await handleHero(city);
        break;
      case "alerts":
        payload = await handleAlerts(city);
        break;
      case "weather":
        payload = await handleWeather(city);
        break;
      case "sea":
        payload = await handleSea(city);
        break;
      case "traffic":
        payload = await handleTraffic(city);
        break;
      case "route":
        payload = await handleRoute(from || city, to || "Split");
        break;
      case "booking":
        payload = await handleBooking(city);
        break;
      case "airport":
        payload = await handleAirport(city);
        break;
      case "services":
        payload = await handleServices(city);
        break;
      case "emergency":
        payload = await handleEmergency(city);
        break;
      case "transit":
        payload = await handleTransit(city);
        break;
      case "landmarks":
        payload = await handleLandmarks(city);
        break;
      case "photos":
        payload = await handlePhotos(city);
        break;
      default:
        payload = {
          error: "Unknown route",
          route,
          supported:
            "hero, alerts, weather, sea, traffic, route, booking, airport, services, emergency, transit, landmarks, photos"
        };
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.statusCode = 200;
    res.end(JSON.stringify(payload));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "TBW backend error",
        message: err.message
      })
    );
  }
};
