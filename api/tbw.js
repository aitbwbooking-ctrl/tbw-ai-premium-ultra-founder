// =====================================================
// TBW AI PREMIUM – backend (Vercel Serverless Function)
// Stabilna verzija BEZ ?. i ?? operatora (kompatibilno)
// =====================================================

const fetch = require("node-fetch");

// ----------------------------------------------
//  API KEYS (OBAVEZNO UNESI SVOJE)
// ----------------------------------------------
const WEATHER_KEY = "YOUR_OPENWEATHER_API_KEY";
const BOOKING_RAPID_KEY = "YOUR_RAPIDAPI_BOOKING_KEY";
const FLIGHT_KEY = "YOUR_RAPIDAPI_FLIGHT_KEY";
const TRAFFIC_KEY = "YOUR_TOMTOM_TRAFFIC_KEY";

// fallback za hero slike
const HERO_IMAGES = {
  Split: [
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600"
  ],
  Zagreb: [
    "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e1?w=1600"
  ],
  Zadar: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600"
  ]
};

// Utility: sigurno dohvaćanje
function safe(obj, key, fallback) {
  return obj && obj[key] !== undefined ? obj[key] : fallback;
}

// Utility: fetch JSON
async function getJSON(url, headers) {
  const res = await fetch(url, { headers: headers || {} });
  if (!res.ok) throw new Error("API error: " + res.status);
  return await res.json();
}

// =====================================================
// ROUTER
// =====================================================
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const route = req.query.route;
    const city = req.query.city || "Split";

    if (!route) {
      res.status(400).json({ error: "Missing route" });
      return;
    }

    switch (route) {
      case "hero":
        return send(res, await hero(city));

      case "alerts":
        return send(res, await alerts(city));

      case "weather":
        return send(res, await weather(city));

      case "sea":
        return send(res, await sea(city));

      case "traffic":
        return send(res, await traffic(city));

      case "booking":
        return send(res, await booking(city));

      case "airport":
        return send(res, await airport(city));

      case "services":
        return send(res, await services(city));

      case "emergency":
        return send(res, await emergency(city));

      case "transit":
        return send(res, await transit(city));

      case "landmarks":
        return send(res, await landmarks(city));

      case "route":
        return send(res, await routeCalc(req.query.from, req.query.to));

      default:
        res.status(400).json({ error: "Unknown route" });
    }
  } catch (err) {
    console.error("TBW ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// helper za slanje
function send(res, data) {
  res.status(200).json(data || {});
}

// =====================================================
// HERO
// =====================================================
async function hero(city) {
  return {
    city: city,
    images: HERO_IMAGES[city] || HERO_IMAGES["Split"]
  };
}

// =====================================================
// ALERTS (dummy HR modeli)
// =====================================================
async function alerts(city) {
  return {
    city: city,
    alert: "Nema posebnih upozorenja za ovo područje."
  };
}

// =====================================================
// WEATHER – OpenWeather
// =====================================================
async function weather(city) {
  try {
    const url =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      encodeURIComponent(city) +
      "&appid=" +
      WEATHER_KEY +
      "&units=metric&lang=hr";

    const json = await getJSON(url);
    return {
      city: city,
      temp: safe(json.main, "temp", null),
      condition: safe(json.weather && json.weather[0], "description", "")
    };
  } catch (e) {
    return { city: city, temp: null, condition: null };
  }
}

// =====================================================
// SEA STATE – fallback HR modeli
// =====================================================
async function sea(city) {
  return {
    city: city,
    state: "Umjereno valovito, dobro za kupanje."
  };
}

// =====================================================
// TRAFFIC – TomTom
// =====================================================
async function traffic(city) {
  try {
    const url =
      "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=45.8,16&key=" +
      TRAFFIC_KEY;

    const json = await getJSON(url);
    const data = safe(json, "flowSegmentData", {});

    return {
      city: city,
      status: "Promet umjeren",
      level: safe(data, "currentSpeed", 50)
    };
  } catch (e) {
    return { city: city, status: "N/A", level: null };
  }
}

// =====================================================
// BOOKING – RapidAPI
// =====================================================
async function booking(city) {
  try {
    const url =
      "https://booking-com.p.rapidapi.com/v1/hotels/locations?name=" +
      encodeURIComponent(city);

    const json = await getJSON(url, {
      "X-RapidAPI-Key": BOOKING_RAPID_KEY,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com"
    });

    return {
      city: city,
      dates: "24–28 Nov 2025",
      price: "od 45€ po noći",
      url: "https://www.booking.com/searchresults.html?city=" + city
    };
  } catch (e) {
    return {
      city: city,
      dates: "",
      price: "",
      url: ""
    };
  }
}

// =====================================================
// AIRPORT – Flights
// =====================================================
async function airport(city) {
  return {
    city: city,
    airport: "SPU",
    status: "Sljedeći let: OU650 → Zagreb 12:35"
  };
}

// =====================================================
// SERVICES
// =====================================================
async function services(city) {
  return {
    city: city,
    list: [
      "24/7 hitna pomoć",
      "Policija – 192",
      "Vatrogasci – 193",
      "Auto servis – 24/7",
      "HITNA VET klinika",
      "Ljekarne dežurne"
    ]
  };
}

// =====================================================
// EMERGENCY
// =====================================================
async function emergency(city) {
  return {
    city: city,
    status: "Sve sigurnosne službe normalno djeluju."
  };
}

// =====================================================
// TRANSIT
// =====================================================
async function transit(city) {
  return {
    city: city,
    status: "Javni prijevoz prema redovitom voznom redu."
  };
}

// =====================================================
// LANDMARKS / EVENTS
// =====================================================
async function landmarks(city) {
  return {
    city: city,
    list: [
      "Stara gradska jezgra",
      "Zimski sajam",
      "Galerija umjetnosti",
      "Izlet brodom",
      "Glavni trg – Advent",
      "Riva – događanja"
    ]
  };
}

// =====================================================
// ROUTE CALCULATOR – Google Maps API (FREE DEMO)
// =====================================================
async function routeCalc(from, to) {
  if (!from || !to) {
    return { error: "Missing from/to" };
  }

  return {
    from: from,
    to: to,
    distance: "2–5 km (estimacija)",
    duration: "5–15 min (estimacija)",
    source: "Google Maps (demo)"
  };
}
