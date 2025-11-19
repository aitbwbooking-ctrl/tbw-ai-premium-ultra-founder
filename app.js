// =======================
// TBW — FRONTEND ULTRA
// =======================

const API_URL = "/api/tbw";
let currentCity = "Split";

// -----------------------
// INTRO
// -----------------------
window.onload = () => {
    setTimeout(() => {
        document.getElementById("intro").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");
    }, 1500);
};

// -----------------------
// FETCH FUNKCIJA
// -----------------------
async function callTBW(route, city) {
    const url = `${API_URL}?route=${route}&city=${city}`;
    const res = await fetch(url);
    return await res.json();
}

// -----------------------
// TIKER (svakih 60 sek)
// -----------------------
async function loadTiker() {
    try {
        const data = await callTBW("alerts", currentCity);
        document.getElementById("tikerText").textContent =
            data?.alerts?.join(", ") || "Nema upozorenja";
    } catch {
        document.getElementById("tikerText").textContent = "Greška pri dohvaćanju tikera";
    }
}

setInterval(loadTiker, 60000);

// -----------------------
// KLIK NA TRAŽI
// -----------------------
document.getElementById("searchBtn").addEventListener("click", async () => {
    const c = document.getElementById("cityInput").value.trim();
    if (!c) return;

    currentCity = c;
    loadAll(c);
});

// -----------------------
// SVE KARTICE
// -----------------------
async function loadAll(city) {

    // VRIJEME
    callTBW("weather", city).then(d => {
        document.getElementById("weatherCard").textContent =
            `Vrijeme: ${d.temp}°C, ${d.desc}`;
    });

    // PROGNOZA
    callTBW("forecast", city).then(d => {
        document.getElementById("forecastCard").textContent =
            `Prognoza: ${d.join(" | ")}`;
    });

    // ZRAK
    callTBW("air", city).then(d => {
        document.getElementById("airCard").textContent =
            `AQI: ${d.aqi} (${d.desc})`;
    });

    // ALERTS
    loadTiker();

    // OSTALO
    callTBW("extra", city).then(d => {
        document.getElementById("extraCard").textContent =
            d.text || "Nema podataka";
    });
}

// PRVO UČITANJE
loadAll(currentCity);
