// TBW AI PREMIUM – Vercel backend ULTRA + Founder mode

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // FRONTEND šalje ?route=... ili ?routes=...
  const route = req.query.route || req.query.routes || "health";
  const city = req.query.city || "Split";

  const send = (data) =>
    res.status(200).json({ ok: true, route, city, ...data });

  async function getJSON(url, opts = {}) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return r.json();
  }

  async function getText(url, opts = {}) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return r.text();
  }

  try {
    switch (route) {
      // -------------------------------------------------------------------
      //  HEALTH
      // -------------------------------------------------------------------
      case "health": {
        return send({
          status: "running",
          service: "TBW AI PREMIUM BACKEND",
          time: new Date().toISOString(),
        });
      }

      // -------------------------------------------------------------------
      //  TICKER / ALERTI
      // -------------------------------------------------------------------
      case "tickerrt": {
        const msgs = [];
        msgs.push(`Promet ${city}: pojačan u jutarnjim i popodnevnim satima.`);
        msgs.push("RDS demo: nesreća na D1 – promet preusmjeren.");
        msgs.push("Sigurna vožnja: držite razmak i prilagodite brzinu.");
        return send({ ticker: msgs });
      }

      // -------------------------------------------------------------------
      //  VRIJEME (OPENWEATHER ili DEMO)
      // -------------------------------------------------------------------
      case "weather": {
        const key = process.env.OPENWEATHER_API_KEY;
        if (!key) {
          return send({
            temperature: 21,
            condition: "sunčano (demo – nema OPENWEATHER_API_KEY)",
            city,
          });
        }
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${key}&units=metric&lang=hr`;
        const data = await getJSON(url);
        return send({
          temperature: data.main?.temp ?? 0,
          condition: data.weather?.[0]?.description || "",
          city: data.name || city,
        });
      }

      // -------------------------------------------------------------------
      //  PROMET (demo – kasnije HAK / TomTom)
      // -------------------------------------------------------------------
      case "traffic": {
        return send({
          status: "gust",
          speed: 48,
          delay_min: 6,
          note: `Gužve pri ulazu u ${city}. Vozite oprezno.`,
        });
      }

      // -------------------------------------------------------------------
      //  MORE / MARINE
      // -------------------------------------------------------------------
      case "sea": {
        return send({
          temperature: 18,
          note: "More mirno, slabi valovi, uvjeti dobri za plovidbu. (demo)",
        });
      }

      // -------------------------------------------------------------------
      //  SERVISI (gorivo, autoservis, trgovine)
      // -------------------------------------------------------------------
      case "services": {
        return send({
          items: [
            { name: "INA – City", status: "otvoreno", closes: "22:00" },
            { name: "Auto servis TBW", status: "radi", closes: "18:00" },
            { name: "Ljekarna Centar", status: "otvoreno", closes: "20:00" },
          ],
        });
      }

      // -------------------------------------------------------------------
      //  JAVNI PRIJEVOZ (demo)
      // -------------------------------------------------------------------
      case "transit": {
        return send({
          lines: [
            { mode: "Bus", line: "1", from: city, to: "Centar", departure: "8 min" },
            { mode: "Bus", line: "4", from: city, to: "Kolodvor", departure: "15 min" },
            { mode: "Vlak", line: "R201", from: city, to: "Zagreb", departure: "40 min" },
          ],
        });
      }

      // -------------------------------------------------------------------
      //  AERODROMI (AVIATIONSTACK ili DEMO)
      // -------------------------------------------------------------------
      case "airport": {
        const key = process.env.AVIATIONSTACK_API_KEY;
        if (!key) {
          return send({
            flights: [
              {
                flight: "OU4455",
                from: "Frankfurt",
                to: city,
                eta: "14:30",
                status: "na vrijeme",
              },
              {
                flight: "FR1234",
                from: "London",
                to: city,
                eta: "15:10",
                status: "kasni 20 min",
              },
            ],
            demo: true,
          });
        }
        const url = `http://api.aviationstack.com/v1/flights?access_key=${key}&arr_iata=${encodeURIComponent(
          city
        )}&limit=5`;
        const data = await getJSON(url);
        const flights = (data.data || []).map((f) => ({
          flight: f.flight?.iata || f.flight?.number,
          from: f.departure?.airport,
          to: f.arrival?.airport,
          eta: f.arrival?.estimated || f.arrival?.scheduled,
          status: f.flight_status,
        }));
        return send({ flights });
      }

      // -------------------------------------------------------------------
      //  NAVIGACIJA (GOOGLE DIRECTIONS ili DEMO)
      // -------------------------------------------------------------------
      case "nav": {
        const from = req.query.from || city;
        const to = req.query.to;
        if (!to) {
          return res
            .status(400)
            .json({ ok: false, error: "Missing 'to' param", route: "nav" });
        }

        const key = process.env.GOOGLE_DIRECTIONS_API_KEY;
        if (!key) {
          return send({
            from,
            to,
            distance_km: 250,
            duration_min: 160,
            steps: [
              "Krenite ravno 2 km, zatim držite desnu traku prema autocesti.",
              "Nastavite autocestom 120 km.",
              "Pratite putokaze za centar grada.",
            ],
            warnings: ["Demo – nema GOOGLE_DIRECTIONS_API_KEY."],
          });
        }

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          from
        )}&destination=${encodeURIComponent(
          to
        )}&departure_time=now&language=hr&units=metric&key=${key}`;
        const data = await getJSON(url);
        const route0 = data.routes?.[0];
        const leg0 = route0?.legs?.[0];

        if (!route0 || !leg0) {
          return res.status(502).json({
            ok: false,
            error: "Nije pronađena ruta (Google Directions).",
            route: "nav",
          });
        }

        const distance_km = (leg0.distance?.value || 0) / 1000;
        const duration_min = (leg0.duration_in_traffic?.value ||
          leg0.duration?.value ||
          0) / 60;
        const steps = (leg0.steps || []).map((s) =>
          (s.html_instructions || "").replace(/<[^>]+>/g, "")
        );

        return send({
          from,
          to,
          distance_km: Math.round(distance_km * 10) / 10,
          duration_min: Math.round(duration_min),
          steps,
          warnings: route0.warnings || [],
        });
      }

      // -------------------------------------------------------------------
      //  HITNE SLUŽBE
      // -------------------------------------------------------------------
      case "emergency": {
        return send({
          items: [
            { type: "policija", phone: "192", name: "Policijska postaja " + city },
            { type: "hitna", phone: "194", name: "Hitna pomoć " + city },
            { type: "vatrogasci", phone: "193", name: "Vatrogasna postrojba " + city },
            { type: "eu", phone: "112", name: "EU hitni broj" },
          ],
        });
      }

      // -------------------------------------------------------------------
      //  RDS / NESREĆE / RADARI (demo)
      // -------------------------------------------------------------------
      case "rds": {
        return send({
          actions: [
            {
              type: "nesreća",
              msg: "Teža prometna nesreća na D1 – cesta zatvorena (demo).",
            },
            {
              type: "radar",
              msg: "Fiksna kamera na A1 (112+500) – ograničenje 130.",
            },
            {
              type: "radovi",
              msg: "Radovi na ulazu u " + city + " – moguća zadržavanja.",
            },
          ],
        });
      }

      // -------------------------------------------------------------------
      //  ZNAMENITOSTI (demo, spremno za OpenTripMap)
      // -------------------------------------------------------------------
      case "landmarks": {
        return send({
          items: [
            { id: "demo1", name: "Stari grad " + city, kind: "historic", dist_m: 500 },
            { id: "demo2", name: "Gradski park", kind: "park", dist_m: 1200 },
          ],
          demo: true,
        });
      }

      // -------------------------------------------------------------------
      //  FOTOGRAFIJE GRADA (UNSPLASH ili DEMO)
      // -------------------------------------------------------------------
      case "photos": {
        const key = process.env.UNSPLASH_ACCESS_KEY;
        if (!key) {
          return send({
            photos: [
              {
                id: "demo1",
                thumb:
                  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80",
                author: "Unsplash demo",
              },
            ],
            demo: true,
          });
        }

        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          city
        )}&client_id=${key}&per_page=6`;
        const data = await getJSON(url);
        const photos = (data.results || []).map((p) => ({
          id: p.id,
          thumb: p.urls?.small,
          author: p.user?.name,
        }));
        return send({ photos });
      }

      // -------------------------------------------------------------------
      //  VIJESTI (NEWSAPI + HR RSS)
      // -------------------------------------------------------------------
      case "news": {
        const items = [];
        const newsKey = process.env.NEWSAPI_KEY;

        if (newsKey) {
          try {
            const urlHr = `https://newsapi.org/v2/top-headlines?country=hr&pageSize=5&apiKey=${newsKey}`;
            const dataHr = await getJSON(urlHr);
            (dataHr.articles || []).forEach((a) =>
              items.push({
                title: a.title,
                source: a.source?.name || "Hrvatska",
                time: a.publishedAt,
              })
            );

            const urlGlobal = `https://newsapi.org/v2/top-headlines?language=en&pageSize=5&apiKey=${newsKey}`;
            const dataG = await getJSON(urlGlobal);
            (dataG.articles || []).forEach((a) =>
              items.push({
                title: a.title,
                source: a.source?.name || "Global",
                time: a.publishedAt,
              })
            );
          } catch (e) {
            console.error("NewsAPI error:", e);
          }
        }

        const rssList =
          (process.env.HR_NEWS_RSS || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [];

        for (const rssUrl of rssList) {
          try {
            const xml = await getText(rssUrl);
            const parts = xml.split("<item>").slice(1, 3);
            for (const chunk of parts) {
              const m = chunk.match(/<title>([^<]+)<\/title>/);
              const title = m ? m[1] : "Vijest";
              items.push({ title, source: rssUrl, time: "" });
            }
          } catch (e) {
            console.error("RSS error:", rssUrl, e);
          }
        }

        if (!items.length) {
          return send({
            items: [
              {
                title: "Promjene u prometu kroz " + city,
                source: "TBW demo",
                time: "prije 20 min",
              },
              {
                title: "Događanja ovog vikenda",
                source: "TBW demo",
                time: "prije 2 h",
              },
            ],
            demo: true,
          });
        }

        return send({ items });
      }

      // -------------------------------------------------------------------
      //  SOCIAL FEED (placeholder)
      // -------------------------------------------------------------------
      case "social": {
        return send({
          items: [
            {
              source: "demo",
              text:
                "Social feed demo – za Twitter/Reddit dodaj TWITTER_BEARER_TOKEN ili REDDIT_FEED_ENABLED=1.",
              time: new Date().toISOString(),
            },
          ],
          demo: true,
        });
      }

      // -------------------------------------------------------------------
      //  AI QUERY (OpenAI ili DEMO)
      // -------------------------------------------------------------------
      case "aiquery": {
        const q = req.query.q || "";
        const key = process.env.OPENAI_API_KEY;
        if (!key) {
          return send({
            reply: `TBW AI (demo): zaprimio sam pitanje: "${q}". Dodaj OPENAI_API_KEY u Vercel da aktiviraš pravi GPT model.`,
          });
        }
        // Ovdje kasnije možeš staviti pravi OpenAI poziv
        return send({ reply: "AI odgovor (placeholder) za: " + q });
      }

      // -------------------------------------------------------------------
      //  BILLING / FOUNDER MODE
      // -------------------------------------------------------------------
      case "billing_status": {
        const founderCode = process.env.FOUNDER_ACCESS_CODE || "";
        const providedCode = (req.query.fcode || "").toString().trim();
        const isFounder = founderCode && providedCode && providedCode === founderCode;

        if (isFounder) {
          return send({
            founder: true,
            premium: true,
            trial: false,
            trial_days_left: 0,
            plan: "FOUNDER_LIFETIME",
          });
        }

        return send({
          founder: false,
          premium: false,
          trial: true,
          trial_days_left: 7,
          plan: null,
        });
      }

      // -------------------------------------------------------------------
      //  DEFAULT – NEPOZNATA RUTA
      // -------------------------------------------------------------------
      default: {
        return res.status(404).json({
          ok: false,
          error: "Nepoznata ruta",
          route,
        });
      }
    }
  } catch (err) {
    console.error("TBW backend error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message || "Internal error",
      route,
    });
  }
}
