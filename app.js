// =========================================
// TBW AI PREMIUM – FRONTEND
// =========================================

const API_BASE = "/api/tbw";

// Universal function to call backend
async function callAPI(route, params = {}) {
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.set("route", route);

    for (const key in params) {
        url.searchParams.set(key, params[key]);
    }

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`API Error ${res.status}`);
    }
    return res.json();
}

// =========================================
// LOADERS
// =========================================

async function loadWeather(city) {
    const box = document.getElementById("weatherBox");
    box.innerHTML = "Učitavam...";

    try {
        const data = await callAPI("weather", { city });
        box.innerHTML = `
            <p>🌡️ Temp: ${data.temp}°C</p>
            <p>${data.description}</p>
            <p>💨 Vjetar: ${data.wind} km/h</p>
        `;
    } catch {
        box.innerHTML = "Greška kod vremena.";
    }
}

async function loadSea(city) {
    const box = document.getElementById("seaBox");
    box.innerHTML = "Učitavam...";

    try {
        const data = await callAPI("sea", { city });
        box.innerHTML = `
            <p>🌊 Temperatura mora: ${data.seaTemp}°C</p>
            <p>🌬️ Valovi: ${data.waves}</p>
        `;
    } catch {
        box.innerHTML = "Greška kod mora.";
    }
}

async function loadNavigation(city) {
    const box = document.getElementById("navBox");
    box.innerHTML = "Učitavam...";

    try {
        const data = await callAPI("nav", { city });
        box.innerHTML = `
            <p>🚘 Rute: ${data.routes}</p>
            <p>⏱️ Vrijeme: ${data.time}</p>
        `;
    } catch {
        box.innerHTML = "Greška kod navigacije.";
    }
}

async function loadAlerts(city) {
    const box = document.getElementById("alertBox");
    box.innerHTML = "Učitavam...";

    try {
        const data = await callAPI("alerts", { city });
        box.innerHTML = `<p>${data.alerts}</p>`;
    } catch {
        box.innerHTML = "Greška kod upozorenja.";
    }
}

async function loadPhotos(city) {
    const box = document.getElementById("photoBox");
    box.innerHTML = "Učitavam...";

    try {
        const data = await callAPI("photos", { city });

        box.innerHTML = `
            <img src="${data.photo}" style="width:100%;border-radius:10px;" />
        `;
    } catch {
        box.innerHTML = "Greška kod slika.";
    }
}

// =========================================
// MASTER FUNCTION — loads everything
// =========================================

async function loadAll() {
    const city = document.getElementById("cityInput").value.trim();

    if (!city) {
        alert("Unesi grad!");
        return;
    }

    loadWeather(city);
    loadSea(city);
    loadNavigation(city);
    loadAlerts(city);
    loadPhotos(city);
}
