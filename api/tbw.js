// TBW AI PREMIUM – ONE ROUTE BACKEND ULTRA
// Sve ide preko /api/tbw?route=...&city=...

// =============== ENV VARS =====================
const OPENWEATHER = process.env.OPENWEATHER_API_KEY;
const TOMTOM = process.env.TOMTOM_API_KEY;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
const OPENTRIPMAP = process.env.OPENTRIPMAP_API_KEY;
const AVIATIONSTACK = process.env.AVIATIONSTACK_API_KEY;

const GOOGLE_DIRECTIONS = process.env.GOOGLE_DIRECTIONS_API_KEY;
const GOOGLE_DISTANCE = process.env.GOOGLE_DISTANCE_MATRIX_KEY;
const GOOGLE_PLACES = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_MAPS = process.env.GOOGLE_MAPS_API_KEY;

const AMPEL = process.env.AMPEL_ACCESS_TOKEN || null; // opcionalno – može biti null

// =============== HELPERI ======================

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return await res.json();
}

// Geo koordinate grada – prvo OpenWeather Geo, fallback na ručnu mapu
async function geocodeCity(city) {
  if (!city) city = "Split";

  // fallback za HR gradove ako nema API keya
  const staticMap = {
    split: { lat: 43.5081, lon: 16.4402 },
    zagreb: { lat: 45.815, lon: 15.9819 },
    zadar: { lat: 44.1194, lon: 15.2314 },
    rijeka: { lat: 45.3271, lon: 14.4422 },
    pula: { lat: 44.8666, lon: 13.8496 },
    dubrovnik: { lat: 42.6507, lon: 18.0944 }
  };

  if (!OPENWEATHER) {
    const key = city.toLowerCase();
    if (staticMap[key]) return staticMap[key];
    // default – Zagreb
    return staticMap.zagreb;
  }

  try {
    const geo = await fetchJSON(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${OPENWEATHER}`
    );
    if (geo && geo.length > 0) {
      return { lat: geo[0].lat, lon: geo[0].lon };
    }
  } catch (err) {
    console.error("geocodeCity error:", err.message);
  }

  const key = city.toLowerCase();
  return staticMap[key] || staticMap.zagreb;
}

// =============== ROUTE HANDLERS ===============

// --- HERO (velika slika) ---
async function handleHero(city) {
  const fallback = [
    "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=1200",
    "https://images.unsplash.com/photo-1493558103817-58b6727a0408?w=1200",
    "https://images.unsplash.com/photo-1521545397978-5ea2c6688880?w=1200"
  ];

  if (!UNSPLASH) {
    return { city, images: fallback, source: "fallback" };
  }

  try {
    const data = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " travel"
      )}&orientation=landscape&client_id=${UNSPLASH}&per_page=6`
    );

    const images =
      data.results?.map((p) => p.urls?.regular || p.urls?.small).filter(Boolean) ||
      [];

    if (!images.length) {
      return { city, images: fallback, source: "fallback-empty" };
    }

    return { city, images, source: "unsplash" };
  } catch (err) {
    console.error("hero error:", err.message);
    return { city, images: fallback, source: "fallback-error" };
  }
}

// --- ALERTS (ticker + box) ---
async function handleAlerts(city) {
  city = city || "Split";

  // Ako imamo OPENWEATHER, probaj OneCall alerts
  try {
    if (OPENWEATHER) {
      const { lat, lon } = await geocodeCity(city);
      const ow = await fetchJSON(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER}&lang=hr`
      );

      if (ow.alerts && ow.alerts.length > 0) {
        const a = ow.alerts[0];
        const msg =
          a.event && a.description
            ? `${a.event}: ${a.description}`
            : a.description || a.event;

        return {
          city,
          alert: msg || "Aktivna su vremenska upozorenja za ovo područje."
        };
      }
    }
  } catch (err) {
    console.error("alerts ow error:", err.message);
  }

  // Opcionalno – AMPEL / neki vlastiti servis (ako ga jednog dana dodaš)
  if (AMPEL) {
    try {
      const data = await fetchJSON(
        `https://api.ampelalert.com/v1/alerts?city=${encodeURIComponent(
          city
        )}&token=${AMPEL}`
      );
      if (data && data.message) {
        return { city, alert: data.message };
      }
    } catch (err) {
      console.error("alerts ampel error:", err.message);
    }
  }

  // Fallback – mirno stanje
  return {
    city,
    alert: "Nema posebnih sigurnosnih upozorenja za ovo područje. ✅"
  };
}

// --- WEATHER ---
async function handleWeather(city) {
  city = city || "Split";

  if (!OPENWEATHER) {
    return {
      city,
      temp: 22,
      condition: "Sunčano (demo)",
      icon: "01d",
      source: "fallback-no-key"
    };
  }

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
  } catch (err) {
    console.error("weather error:", err.message);
    return {
      city,
      temp: 0,
      condition: "Greška u preuzimanju vremenske prognoze.",
      icon: "01d",
      source: "fallback-error"
    };
  }
}

// --- SEA STATE ---
async function handleSea(city) {
  city = city || "Split";

  try {
    const { lat, lon } = await geocodeCity(city);
    if (!OPENWEATHER) {
      return { city, state: "Mirno more (demo fallback)." };
    }

    const data = await fetchJSON(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=hr&appid=${OPENWEATHER}`
    );

    const wind = data.wind?.speed ?? 0;
    let state;

    if (wind < 3) state = "More mirno, idealno za kupanje.";
    else if (wind < 8) state = "Lagani valovi, ugodno ali uz oprez.";
    else if (wind < 14) state = "Umjereni valovi – povećan oprez pri plivanju.";
    else state = "Jako valovito more – ne preporučuje se kupanje.";

    return { city: data.name || city, state };
  } catch (err) {
    console.error("sea error:", err.message);
    return { city, state: "Greška pri učitavanju stanja mora." };
  }
}

// --- TRAFFIC ---
async function handleTraffic(city) {
  city = city || "Zagreb";

  try {
    if (TOMTOM) {
      const { lat, lon } = await geocodeCity(city);
      const data = await fetchJSON(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM}&point=${lat},${lon}`
      );

      const cur = data.flowSegmentData?.currentSpeed ?? 0;
      const free = data.flowSegmentData?.freeFlowSpeed ?? cur || 1;
      const ratio = cur / free;

      let status;
      let level;

      if (ratio > 0.9) {
        status = "Promet teče normalno.";
        level = "LOW";
      } else if (ratio > 0.7) {
        status = "Umjereno gust promet, manja usporavanja.";
        level = "MEDIUM";
      } else if (ratio > 0.4) {
        status = "Gusti promet, očekuj zastoje.";
        level = "HIGH";
      } else {
        status = "Vrlo gust promet i veći zastoji.";
        level = "CRITICAL";
      }

      return { city, status, level, source: "tomtom" };
    }
  } catch (err) {
    console.error("traffic tomtom error:", err.message);
  }

  // Fallback – bez API-ja
  return {
    city,
    status: "Nema dostupnih podataka o prometu (fallback).",
    level: "UNKNOWN",
    source: "fallback"
  };
}

// --- NAVIGATION ROUTE ---
async function handleRoute(from, to) {
  if (!from || !to) {
    return {
      from,
      to,
      distance: "Nepoznata udaljenost",
      duration: "Nepoznata duljina putovanja",
      source: "invalid-input"
    };
  }

  // Google Directions
  if (GOOGLE_DIRECTIONS) {
    try {
      const data = await fetchJSON(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          from
        )}&destination=${encodeURIComponent(to)}&key=${GOOGLE_DIRECTIONS}`
      );

      const leg = data.routes?.[0]?.legs?.[0];
      if (leg) {
        return {
          from,
          to,
          distance: leg.distance?.text || "Nepoznato",
          duration: leg.duration?.text || "Nepoznato",
          source: "google-directions"
        };
      }
    } catch (err) {
      console.error("route google error:", err.message);
    }
  }

  // Fallback – Distance Matrix ako postoji
  if (GOOGLE_DISTANCE) {
    try {
      const dm = await fetchJSON(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          from
        )}&destinations=${encodeURIComponent(to)}&key=${GOOGLE_DISTANCE}`
      );
      const el = dm.rows?.[0]?.elements?.[0];
      if (el && el.status === "OK") {
        return {
          from,
          to,
          distance: el.distance?.text || "Nepoznato",
          duration: el.duration?.text || "Nepoznato",
          source: "google-distance-matrix"
        };
      }
    } catch (err) {
      console.error("route distance error:", err.message);
    }
  }

  // Total fallback
  return {
    from,
    to,
    distance: "Udaljenost otprilike 2–5 h vožnje (procjena).",
    duration: "Provjeri detalje na Google Maps.",
    source: "fallback"
  };
}

// --- BOOKING (link na Booking.com) ---
async function handleBooking(city) {
  city = city || "Split";

  const today = new Date();
  const start = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const end = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);

  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.`;

  return {
    city,
    dates: `${fmt(start)} – ${fmt(end)} (${Math.round(
      (end - start) / (1000 * 60 * 60 * 24)
    )} noći)`,
    price: "od 45 € / noć (procjena)",
    url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      city
    )}&group_adults=2&no_rooms=1&group_children=0`,
    source: "booking-link"
  };
}

// --- AIRPORT / FLIGHTS ---
async function handleAirport(city) {
  city = city || "Split";

  // Mapiranje grad -> IATA
  const cityToIata = {
    split: "SPU",
    zagreb: "ZAG",
    zadar: "ZAD",
    rijeka: "RJK",
    pula: "PUY",
    dubrovnik: "DBV"
  };

  const iata = cityToIata[city.toLowerCase()];
  if (!AVIATIONSTACK || !iata) {
    return {
      city,
      airport: iata || "N/A",
      status: "Osnovne informacije o letovima nisu dostupne (fallback).",
      source: "fallback"
    };
  }

  try {
    const data = await fetchJSON(
      `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK}&dep_iata=${iata}&limit=5`
    );

    const flights = data.data || [];
    if (!flights.length) {
      return {
        city,
        airport: iata,
        status: "Nema trenutno aktivnih odlaznih letova.",
        source: "aviationstack"
      };
    }

    const next = flights[0];
    const statusText = `Sljedeći let: ${next.flight?.iata || ""} za ${
      next.arrival?.airport || ""
    } u ${next.departure?.scheduled?.slice(11, 16) || "nepoznato"}.`;

    return {
      city,
      airport: iata,
      status: statusText,
      source: "aviationstack"
    };
  } catch (err) {
    console.error("airport error:", err.message);
    return {
      city,
      airport: iata || "N/A",
      status: "Greška pri učitavanju informacija o letovima.",
      source: "fallback-error"
    };
  }
}

// --- SERVICES (servisi, benzinske, 24/7) ---
async function handleServices(city) {
  city = city || "Split";

  if (!GOOGLE_PLACES) {
    return {
      city,
      list: [
        "Hitna pomoć 112 (24/7)",
        "Lokalne benzinske postaje",
        "Taxi & ride-sharing usluge"
      ],
      source: "fallback-no-key"
    };
  }

  try {
    const query = `service station in ${city}`;
    const data = await fetchJSON(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES}`
    );

    const list =
      data.results?.slice(0, 6).map((p) => p.name).filter(Boolean) || [];

    if (!list.length) {
      return {
        city,
        list: [
          "Servisi nisu pronađeni u blizini (API)",
          "Probaj pretražiti Google Maps ručno."
        ],
        source: "google-empty"
      };
    }

    return { city, list, source: "google-places" };
  } catch (err) {
    console.error("services error:", err.message);
    return {
      city,
      list: ["Greška pri učitavanju servisnih informacija."],
      source: "fallback-error"
    };
  }
}

// --- EMERGENCY ---
async function handleEmergency(city) {
  city = city || "Split";

  // Možemo kombinirati alerts + generičke info
  const base =
    "U hitnim slučajevima nazovi 112 (jedinstveni europski broj za hitne službe).";
  try {
    const alerts = await handleAlerts(city);
    if (
      alerts.alert &&
      !alerts.alert.includes("Nema posebnih sigurnosnih upozorenja")
    ) {
      return {
        city,
        status: `${base} Trenutno upozorenje: ${alerts.alert}`
      };
    }
  } catch (e) {
    console.error("emergency alerts error:", e.message);
  }

  return { city, status: base + " Trenutno nema posebnih upozorenja." };
}

// --- TRANSIT (javni prijevoz) ---
async function handleTransit(city) {
  city = city || "Zagreb";

  // Ovo za sada držimo kao pametni fallback
  return {
    city,
    status:
      "Javni prijevoz prometuje prema uobičajenom/izmijenjenom rasporedu. Za detalje provjeri lokalnog prijevoznika.",
    source: "fallback"
  };
}

// --- LANDMARKS (znamenitosti) ---
async function handleLandmarks(city) {
  city = city || "Split";

  if (!OPENTRIPMAP) {
    // fallback
    const fallback = {
      split: [
        "Dioklecijanova palača",
        "Riva",
        "Marjan",
        "Prokurative",
        "Žnjan"
      ],
      zagreb: ["Trg bana Jelačića", "Katedrala", "Tkalčićeva", "Maksimir"],
      dubrovnik: [
        "Gradske zidine",
        "Stradun",
        "Lokrum",
        "Tvrđava Lovrijenac"
      ]
    };

    const key = city.toLowerCase();
    return {
      city,
      list: fallback[key] || ["Glavne znamenitosti dostupne u turističkim vodičima."],
      source: "fallback-no-key"
    };
  }

  try {
    // prvo geoname
    const geo = await fetchJSON(
      `https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(
        city
      )}&apikey=${OPENTRIPMAP}`
    );

    const { lat, lon } = geo;

    const places = await fetchJSON(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=3000&lon=${lon}&lat=${lat}&rate=2&limit=10&format=json&apikey=${OPENTRIPMAP}`
    );

    const list =
      places
        ?.map((p) => p.name)
        .filter((n) => n && n.trim())
        .slice(0, 8) || [];

    if (!list.length) {
      return {
        city,
        list: ["Nije pronađena nijedna znamenitost (API)."],
        source: "opentripmap-empty"
      };
    }

    return { city, list, source: "opentripmap" };
  } catch (err) {
    console.error("landmarks error:", err.message);
    return {
      city,
      list: ["Greška pri učitavanju znamenitosti."],
      source: "fallback-error"
    };
  }
}

// --- PHOTOS (grid slika) ---
async function handlePhotos(city) {
  city = city || "Split";

  const fallback = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800",
    "https://images.unsplash.com/photo-1421809313281-48f03fa45e9f?w=800"
  ];

  if (!UNSPLASH) {
    return { city, images: fallback, source: "fallback-no-key" };
  }

  try {
    const data = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " city"
      )}&orientation=landscape&client_id=${UNSPLASH}&per_page=9`
    );

    const images =
      data.results?.map((p) => p.urls?.small || p.urls?.thumb).filter(Boolean) ||
      [];

    if (!images.length) {
      return { city, images: fallback, source: "unsplash-empty" };
    }

    return { city, images, source: "unsplash" };
  } catch (err) {
    console.error("photos error:", err.message);
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
          message: "Podržane route: hero, alerts, weather, sea, traffic, route, booking, airport, services, emergency, transit, landmarks, photos."
        };
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  } catch (err) {
    console.error("TBW API FATAL:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "TBW backend error",
        message: err.message || "Unknown error"
      })
    );
  }
};
