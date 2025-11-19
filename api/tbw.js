// TBW AI PREMIUM – ONE ROUTE BACKEND ULTRA
// Sve ide preko /api/tbw?route=...&city=...

// ================ ENV VARIJE ==================

const OPENWEATHER = process.env.OPENWEATHER_API_KEY;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;
const TOMTOM = process.env.TOMTOM_API_KEY;
const OPENTRIPMAP = process.env.OPENTRIPMAP_API_KEY;
const AVIATIONSTACK = process.env.AVIATIONSTACK_API_KEY;
const GEODB = process.env.GEODB_API_KEY;
const SAFETY = process.env.SAFETY_API_KEY || ""; // opcionalno

const GOOGLE_DIRECTIONS = process.env.GOOGLE_DIRECTIONS_API_KEY;
const GOOGLE_DISTANCE = process.env.GOOGLE_DISTANCE_MATRIX_KEY;

// ================ HELPERI ==================

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return await res.json();
}

// grubo dobij lat/lon za grad preko OpenWeather ili GeoDB
async function getGeoForCity(city) {
  // 1) OpenWeather ako imamo ključ
  if (OPENWEATHER) {
    try {
      const j = await fetchJSON(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${OPENWEATHER}`
      );
      if (j && j.coord) {
        return {
          lat: j.coord.lat,
          lon: j.coord.lon,
          name: j.name || city,
          country: j.sys?.country || "–",
        };
      }
    } catch (e) {
      console.error("Geo via OpenWeather error:", e.message);
    }
  }

  // 2) GeoDB (RapidAPI) ako postoji key
  if (GEODB) {
    try {
      const j = await fetchJSON(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
          city
        )}&limit=1`,
        {
          headers: {
            "X-RapidAPI-Key": GEODB,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );
      const c = j.data && j.data[0];
      if (c) {
        return {
          lat: c.latitude,
          lon: c.longitude,
          name: c.city,
          country: c.countryCode,
        };
      }
    } catch (e) {
      console.error("Geo via GeoDB error:", e.message);
    }
  }

  // fallback – Split centar
  return {
    lat: 43.5081,
    lon: 16.4402,
    name: city,
    country: "HR",
  };
}

// ================ POJEDINČNI MODULI ==================

// HERO + UNSPLASH slika grada
async function getHero(city) {
  const fallbacks = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
    "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1200",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
  ];

  // ako nema UNSPLASH ključa – samo fallback
  if (!UNSPLASH) {
    return {
      ok: true,
      source: "fallback",
      image: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      title: city,
      subtitle: "TBW pozadina (demo bez Unsplash API ključa).",
    };
  }

  try {
    const j = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " skyline night"
      )}&orientation=landscape&per_page=1&client_id=${UNSPLASH}`
    );
    const hit = j.results && j.results[0];
    if (hit) {
      return {
        ok: true,
        source: "unsplash",
        image: hit.urls.regular,
        title: city,
        subtitle: hit.alt_description || "TBW pozadina",
      };
    }
  } catch (e) {
    console.error("Hero/Unsplash error:", e.message);
  }

  return {
    ok: true,
    source: "fallback",
    image: fallbacks[Math.floor(Math.random() * fallbacks.length)],
    title: city,
    subtitle: "TBW pozadina (fallback slika).",
  };
}

// VRIJEME + more lat/lon
async function getWeatherAndGeo(city) {
  const geo = await getGeoForCity(city);

  if (!OPENWEATHER) {
    return {
      ok: true,
      source: "demo",
      geo,
      temp: 21,
      feels_like: 22,
      cond: "Djelomično oblačno",
      icon: "02d",
      text: "Demo vrijeme (nema OPENWEATHER_API_KEY).",
    };
  }

  try {
    const j = await fetchJSON(
      `https://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${OPENWEATHER}`
    );
    const w = j.weather && j.weather[0];
    return {
      ok: true,
      source: "openweather",
      geo,
      temp: Math.round(j.main.temp),
      feels_like: Math.round(j.main.feels_like),
      cond: w ? w.description : "–",
      icon: w ? w.icon : "",
      text: `Temperatura ${Math.round(
        j.main.temp
      )}°C, osjeća se kao ${Math.round(j.main.feels_like)}°C.`,
    };
  } catch (e) {
    console.error("Weather error:", e.message);
    return {
      ok: true,
      source: "fallback",
      geo,
      temp: 23,
      feels_like: 23,
      cond: "Sunčano",
      icon: "01d",
      text: "Neuspjelo dohvaćanje vremena – fallback podaci.",
    };
  }
}

// PROMET – TomTom + fallback
async function getTraffic(geo) {
  if (!geo) return { ok: false, error: "Nema geo podataka." };

  if (!TOMTOM) {
    return {
      ok: true,
      source: "demo",
      summary: "Prometne informacije dostupne nakon dodavanja TOMTOM_API_KEY.",
      details: ["Okolne ceste: normalan protok", "Nema većih zastoja."],
    };
  }

  try {
    const j = await fetchJSON(
      `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${geo.lat},${geo.lon}&key=${TOMTOM}`
    );
    const f = j.flowSegmentData;
    return {
      ok: true,
      source: "tomtom",
      currentSpeed: f.currentSpeed,
      freeFlowSpeed: f.freeFlowSpeed,
      confidence: f.confidence,
      summary:
        f.currentSpeed < f.freeFlowSpeed * 0.6
          ? "Zastoji u prometu"
          : "Promet uglavnom teče normalno",
    };
  } catch (e) {
    console.error("Traffic error:", e.message);
    return {
      ok: true,
      source: "fallback",
      summary: "Prometne informacije privremeno nedostupne.",
      details: [],
    };
  }
}

// MORE – Open-Meteo Marine (bez ključa)
async function getSea(geo) {
  if (!geo) return { ok: false, error: "Nema geo podataka." };
  try {
    const j = await fetchJSON(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${geo.lat}&longitude=${geo.lon}&hourly=wave_height,water_temperature&timezone=auto`
    );
    const h = j.hourly;
    let latest = "-";
    let wave = "-";
    if (h && h.time && h.time.length) {
      const idx = h.time.length - 1;
      latest = h.water_temperature?.[idx];
      wave = h.wave_height?.[idx];
    }
    return {
      ok: true,
      source: "open-meteo",
      water_temp: latest,
      wave_height: wave,
    };
  } catch (e) {
    console.error("Sea error:", e.message);
    return {
      ok: true,
      source: "fallback",
      water_temp: 18,
      wave_height: 0.5,
    };
  }
}

// LANDMARKS – OpenTripMap
async function getLandmarks(geo, city) {
  if (!OPENTRIPMAP) {
    return {
      ok: true,
      source: "demo",
      items: [
        { name: `Stari centar ${city}`, kind: "historic" },
        { name: "Glavna gradska šetnica", kind: "urban" },
      ],
    };
  }

  try {
    // prvo geoname (za svaki slučaj)
    const baseLat = geo?.lat;
    const baseLon = geo?.lon;

    const j = await fetchJSON(
      `https://api.opentripmap.com/0.1/en/places/radius?radius=5000&lon=${baseLon}&lat=${baseLat}&rate=2&limit=8&apikey=${OPENTRIPMAP}`
    );
    const items =
      j.features?.map((f) => ({
        name: f.properties.name,
        kind: f.properties.kinds,
      })) || [];
    return {
      ok: true,
      source: "opentripmap",
      items,
    };
  } catch (e) {
    console.error("Landmarks error:", e.message);
    return {
      ok: true,
      source: "fallback",
      items: [
        { name: `Povijesna jezgra ${city}`, kind: "historic" },
        { name: "Glavna gradska riva", kind: "urban" },
      ],
    };
  }
}

// FOTKE – Unsplash grid
async function getPhotos(city) {
  if (!UNSPLASH) {
    return {
      ok: true,
      source: "demo",
      items: [],
    };
  }
  try {
    const j = await fetchJSON(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        city + " travel"
      )}&orientation=landscape&per_page=6&client_id=${UNSPLASH}`
    );
    const items =
      j.results?.map((r) => ({
        url: r.urls.small,
        alt: r.alt_description || city,
      })) || [];
    return { ok: true, source: "unsplash", items };
  } catch (e) {
    console.error("Photos error:", e.message);
    return { ok: true, source: "fallback", items: [] };
  }
}

// SIGURNOSNI / RDS ALERTI – Travel Advisory (bez ključa)
async function getAlerts(geo) {
  try {
    // detektiraj državu (HR, DE…)
    const country = geo?.country || "HR";
    const j = await fetchJSON(
      `https://www.travel-advisory.info/api?countrycode=${country}`
    );
    const info = j.data?.[country]?.advisory;
    if (info) {
      return {
        ok: true,
        source: "travel-advisory",
        score: info.score,
        message: info.message,
      };
    }
  } catch (e) {
    console.error("Alerts error:", e.message);
  }

  return {
    ok: true,
    source: "fallback",
    score: 1,
    message: "Nema posebnih sigurnosnih upozorenja za ovo područje.",
  };
}

// AERODROMI – AviationStack DEMO (ograničeno)
const CITY_TO_IATA = {
  split: "SPU",
  zagreb: "ZAG",
  zadar: "ZAD",
  frankfurt: "FRA",
  munich: "MUC",
  wien: "VIE",
  vienna: "VIE",
};

async function getAirport(city) {
  const code = CITY_TO_IATA[city.toLowerCase()] || "SPU";

  if (!AVIATIONSTACK) {
    return {
      ok: true,
      source: "demo",
      code,
      arrivals: [
        {
          flight: "TBW100",
          from: "Frankfurt",
          time: "15:00",
          status: "Na vrijeme",
        },
      ],
    };
  }

  try {
    const j = await fetchJSON(
      `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK}&arr_iata=${code}&limit=5`
    );
    const flights =
      j.data?.map((f) => ({
        flight: f.flight?.iata || f.flight?.number,
        from: f.departure?.airport,
        time: f.arrival?.scheduled?.slice(11, 16),
        status: f.flight_status,
      })) || [];
    return { ok: true, source: "aviationstack", code, arrivals: flights };
  } catch (e) {
    console.error("Airport error:", e.message);
    return {
      ok: true,
      source: "fallback",
      code,
      arrivals: [],
    };
  }
}

// NAVIGACIJA – Google Directions / fallback tekst
async function getRoute(from, to) {
  const origin = from || "Trenutna lokacija";
  const dest = to || "Zračna luka";

  if (!GOOGLE_DIRECTIONS || !GOOGLE_DISTANCE) {
    return {
      ok: true,
      source: "demo",
      origin,
      dest,
      distance_km: 30,
      duration_min: 35,
      summary:
        "Demo ruta (dodaj GOOGLE_DIRECTIONS_API_KEY i GOOGLE_DISTANCE_MATRIX_KEY za pravu navigaciju).",
    };
  }

  try {
    const dir = await fetchJSON(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        dest
      )}&mode=driving&key=${GOOGLE_DIRECTIONS}`
    );
    const route = dir.routes?.[0];
    const leg = route?.legs?.[0];

    let distance_km = 0;
    let duration_min = 0;
    if (leg) {
      distance_km = Math.round((leg.distance.value / 1000) * 10) / 10;
      duration_min = Math.round(leg.duration.value / 60);
    }

    return {
      ok: true,
      source: "google",
      origin,
      dest,
      distance_km,
      duration_min,
      summary: `Ruta ${distance_km} km, oko ${duration_min} min vožnje.`,
    };
  } catch (e) {
    console.error("Route error:", e.message);
    return {
      ok: true,
      source: "fallback",
      origin,
      dest,
      distance_km: 25,
      duration_min: 30,
      summary: "Navigacija privremeno nedostupna – prikazana procjena rute.",
    };
  }
}

// BOOKING – samo link + parametri
function getBooking(city, maxPrice) {
  const c = city || "Split";
  const price = maxPrice || 50;
  const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
    c
  )}&nflt=price%3D${price}`;
  return {
    ok: true,
    city: c,
    maxPrice: price,
    url,
  };
}

// SERVISI / EMERGENCY / TRANSIT – demo podaci sada
function getServices(city) {
  return {
    ok: true,
    items: [
      { name: "Auto servis 24/7", desc: `${city} – glavna obilaznica` },
      { name: "Vulkanizer", desc: "Hitna zamjena guma" },
    ],
  };
}
function getEmergency(city) {
  return {
    ok: true,
    police: "192",
    fire: "193",
    ambulance: "194",
    text: `Hitne službe za područje: ${city}`,
  };
}
function getTransit(city) {
  return {
    ok: true,
    items: [
      { line: "Autobus 1", desc: "Centar – Kolodvor" },
      { line: "Autobus 2", desc: "Kolodvor – Aerodrom shuttle" },
    ],
  };
}

// ================ GLAVNI HANDLER ==================

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const route = url.searchParams.get("route") || "all";
    const city = url.searchParams.get("city") || "Split";
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";
    const maxPrice = parseInt(url.searchParams.get("price") || "50", 10);

    // prvo geo + weather da možemo dijeliti dalje
    const weather = await getWeatherAndGeo(city);
    const geo = weather.geo;

    // pojedinačni route – koristi iste funkcije
    if (route !== "all") {
      let payload;

      switch (route) {
        case "hero":
          payload = await getHero(city);
          break;
        case "weather":
          payload = weather;
          break;
        case "traffic":
          payload = await getTraffic(geo);
          break;
        case "sea":
          payload = await getSea(geo);
          break;
        case "landmarks":
          payload = await getLandmarks(geo, city);
          break;
        case "photos":
          payload = await getPhotos(city);
          break;
        case "alerts":
          payload = await getAlerts(geo);
          break;
        case "airport":
          payload = await getAirport(city);
          break;
        case "route":
          payload = await getRoute(from || city, to);
          break;
        case "booking":
          payload = getBooking(city, maxPrice);
          break;
        case "services":
          payload = getServices(city);
          break;
        case "emergency":
          payload = getEmergency(city);
          break;
        case "transit":
          payload = getTransit(city);
          break;
        default:
          return res
            .status(400)
            .json({ ok: false, error: `Unknown route '${route}'` });
      }

      return res.status(200).json({
        ok: true,
        route,
        city,
        data: payload,
      });
    }

    // "all" – vrati sve odjednom
    const [hero, traffic, sea, landmarks, photos, alerts, airport, nav, serv,
      emerg, transit] = await Promise.all([
      getHero(city),
      getTraffic(geo),
      getSea(geo),
      getLandmarks(geo, city),
      getPhotos(city),
      getAlerts(geo),
      getAirport(city),
      getRoute(from || city, to),
      getServices(city),
      getEmergency(city),
      getTransit(city),
    ]);

    return res.status(200).json({
      ok: true,
      city,
      hero,
      weather,
      traffic,
      sea,
      landmarks,
      photos,
      alerts,
      airport,
      route: nav,
      booking: getBooking(city, maxPrice),
      services: serv,
      emergency: emerg,
      transit,
    });
  } catch (err) {
    console.error("TBW backend fatal error:", err);
    return res
      .status(200)
      .json({ ok: false, error: "TBW backend error: " + err.message });
  }
}
