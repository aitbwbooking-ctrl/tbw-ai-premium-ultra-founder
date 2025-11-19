// ==========================================================================
// TBW AI PREMIUM – ONE ROUTE BACKEND
// ==========================================================================

export default async function handler(req, res) {
  try {
    const q = req.query;
    const route = q.route || "";

    // GLOBALNO
    const city = q.city || "Split";
    const from = q.from || "";
    const to = q.to || "";
    const price = q.price || "50";

    // HELPER
    async function get(url) {
      const r = await fetch(url);
      if (!r.ok) return null;
      return await r.json();
    }

    // -----------------------------
    // 1) HERO – fallback slike grada
    // -----------------------------
    if (route === "hero") {
      return res.status(200).json({
        ok: true,
        images: [
          "https://images.unsplash.com/photo-1509531885749-8e8f56a0f01d",
          "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        ]
      });
    }

    // -----------------------------
    // 2) WEATHER (OpenWeather) + opis
    // -----------------------------
    if (route === "weather") {
      const API = process.env.OPENWEATHER_API_KEY;
      const w = await get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API}`);

      return res.status(200).json({
        ok: !!w,
        temp: w?.main?.temp || null,
        cond: w?.weather?.[0]?.description || "",
        city
      });
    }

    // -----------------------------
    // 3) TRAFFIC — dummy podaci
    // -----------------------------
    if (route === "traffic") {
      return res.status(200).json({
        ok: true,
        events: [
          "Nema većih zastoja",
          "Promet teče uredno",
          "Gužva na prilazu Splitu – 8 km/h"
        ]
      });
    }

    // -----------------------------
    // 4) ALERTS – dummy ili RSS
    // -----------------------------
    if (route === "alerts") {
      return res.status(200).json({
        ok: true,
        alerts: [
          "⚠️ Jak vjetar na obali",
          "🌧️ Moguća kiša poslijepodne"
        ]
      });
    }

    // -----------------------------
    // 5) BOOKING (vanjski link)
    // -----------------------------
    if (route === "booking") {
      return res.status(200).json({
        ok: true,
        url: `https://www.booking.com/searchresults.hr.html?ss=${encodeURIComponent(city)}&price_to=${price}`
      });
    }

    // -----------------------------
    // 6) ROUTE – navigacija (dummy)
    // -----------------------------
    if (route === "route") {
      return res.status(200).json({
        ok: true,
        summary: `Ruta od ${from || "trenutne lokacije"} do ${to}.`,
        distance: "27 km",
        duration: "31 min",
        steps: [
          "Kreni ravno",
          "Drži se desno",
          "Skreni lijevo nakon 500m"
        ]
      });
    }

    // -----------------------------
    // 7) AIRPORTS – dummy
    // -----------------------------
    if (route === "airports") {
      return res.status(200).json({
        ok: true,
        flights: [
          "OU445 – Zagreb → Split – 13:40",
          "FR231 – London → Split – 15:50"
        ]
      });
    }

    // -----------------------------
    // 8) SEA – stanje mora – dummy
    // -----------------------------
    if (route === "sea") {
      return res.status(200).json({
        ok: true,
        temp: "21°C",
        wave: "0.3 m",
        warning: "Nema"
      });
    }

    // -----------------------------
    // 9) SERVICES – dummy
    // -----------------------------
    if (route === "services") {
      return res.status(200).json({
        ok: true,
        list: [
          "Ljekarna – otvorena",
          "Benzinska – 0-24",
          "Automehaničar – zauzeto"
        ]
      });
    }

    // -----------------------------
    // 10) TRANSIT – dummy
    // -----------------------------
    if (route === "transit") {
      return res.status(200).json({
        ok: true,
        buses: [
          "Linija 3 — 6 min",
          "Linija 8 — 11 min"
        ]
      });
    }

    // -----------------------------
    // 11) EMERGENCY
    // -----------------------------
    if (route === "emergency") {
      return res.status(200).json({
        ok: true,
        numbers: {
          policija: 192,
          hitna: 194,
          vatrogasci: 193
        }
      });
    }

    // -----------------------------
    // 12) LANDMARKS – dummy
    // -----------------------------
    if (route === "landmarks") {
      return res.status(200).json({
        ok: true,
        spots: [
          "Dioklecijanova palača",
          "Riva",
          "Marjan"
        ]
      });
    }

    // -----------------------------
    // 13) PHOTOS – Unsplash API
    // -----------------------------
    if (route === "photos") {
      const API = process.env.UNSPLASH_ACCESS_KEY;
      const photos = await get(
        `https://api.unsplash.com/search/photos?query=${city}&per_page=9&client_id=${API}`
      );

      return res.status(200).json({
        ok: true,
        results: photos?.results || []
      });
    }

    // -----------------------------
    // DEFAULT
    // -----------------------------
    return res.status(400).json({ ok: false, error: "Unknown route" });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.toString() });
  }
}
