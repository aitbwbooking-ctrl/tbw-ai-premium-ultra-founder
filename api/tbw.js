module.exports = (req, res) => {
    const { route, city, city2 } = req.query;

    if (!route) {
        return res.status(400).json({ error: "Missing route parameter" });
    }

    // --- TESTNI API – uvijek radi ---
    if (route === "alert") {
        return res.json({ 
            city: city || "unknown", 
            alert: "Ovo je testni alert - API RADI!!!" 
        });
    }

    // --- NAVIGACIJA (fallback demo) ---
    if (route === "navigacija") {
        return res.json({
            from: city,
            to: city2,
            route: [
                "Kreni ravno 2 km",
                "Skreni lijevo kod kružnog toka",
                "Nastavi 5 km prema moru",
                "Stigao si!"
            ]
        });
    }

    // --- STANJE MORA ---
    if (route === "more") {
        return res.json({
            city,
            uv_index: "3 — umjereno",
            valovi: "0.4 m",
            temperatura: "18°C"
        });
    }

    // --- PROMET ---
    if (route === "promet") {
        return res.json({
            city,
            stanje: "Gužva u centru",
            preporuka: "Izbjegavati između 16–18h"
        });
    }

    // --- WEBSHOPS DEMO ---
    if (route === "webshop") {
        return res.json({
            items: [
                { name: "Mapa Hrvatske", price: "9.99€" },
                { name: "Putna torba", price: "49.99€" }
            ]
        });
    }

    // fallback
    res.json({ error: "Unknown route" });
};
