export default async function handler(req, res) {
    const { route, city } = req.query;

    if (!route || !city) {
        return res.status(400).json({ error: "Missing route or city" });
    }

    try {
        // 1. Geo API – Koordinate grada (Open-Meteo)
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const geoRes = await fetch(geoURL);
        const geoJson = await geoRes.json();

        if (!geoJson.results || geoJson.results.length === 0) {
            return res.status(404).json({ error: "City not found" });
        }

        const { latitude, longitude, country } = geoJson.results[0];

        // 2. Weather API
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        const weatherRes = await fetch(weatherURL);
        const weatherJson = await weatherRes.json();

        // 3. Air Quality API
        const airURL = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5,carbon_monoxide`;
        const airRes = await fetch(airURL);
        const airJson = await airRes.json();

        // 4. UV Index API
        const uvURL = `https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`;
        let uvJson = { result: { uv: "N/A" } };

        try {
            const uvRes = await fetch(uvURL, {
                headers: { "x-access-token": "free" } 
            });
            uvJson = await uvRes.json();
        } catch (e) {
            // openuv ponekad blokira free pozive
        }

        // 5. Earthquakes API – Zadnjih 24h
        const eqURL = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson`;
        const eqRes = await fetch(eqURL);
        const eqJson = await eqRes.json();

        // 6. Currency (EUR → USD)
        const curRes = await fetch("https://open.er-api.com/v6/latest/EUR");
        const curJson = await curRes.json();

        // 7. Random fact (Wikipedia)
        const factRes = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
        const factJson = await factRes.json();

        // 8. Alert test
        const alertJson = {
            city,
            alert: "Ovo je testni alert - API RADI!!!"
        };

        let result = {
            city,
            country,
            coordinates: { latitude, longitude },
            weather: weatherJson,
            air_quality: airJson,
            uv_index: uvJson,
            earthquakes_last_24h: eqJson,
            currency: curJson,
            fun_fact: factJson.text,
            alert: alertJson
        };

        return res.status(200).json(result);

    } catch (err) {
        return res.status(500).json({ error: "Server error", details: err.toString() });
    }
}
