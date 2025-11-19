async function loadCity() {
    const city = document.getElementById("city-input").value;
    const output = document.getElementById("output");

    output.innerHTML = "Tražim podatke...";

    try {
        const res = await fetch(`/api/tbw?route=alerts&city=${encodeURIComponent(city)}`);
        const data = await res.json();

        output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    } catch (err) {
        output.innerHTML = "Greška u pozivu API-ja.";
    }
}
