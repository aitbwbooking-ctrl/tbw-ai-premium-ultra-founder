// TBW AI PREMIUM ULTRA – front-end
const API_BASE = "/api/tbw";
let currentCity = "Split";
let isFounder = false;

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&auto=format&fit=crop&w=1400",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&auto=format&fit=crop&w=1400",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&auto=format&fit=crop&w=1400",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&auto=format&fit=crop&w=1400"
];

const $ = (s)=>document.querySelector(s);

async function callApi(route, extra = {}){
  const url = new URL(API_BASE, window.location.origin);
  url.searchParams.set("route", route);
  url.searchParams.set("city", currentCity);
  Object.entries(extra).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error("HTTP "+res.status);
  return res.json();
}

function setHero(){
  const img = $("#heroImg");
  img.src = HERO_IMAGES[Math.floor(Math.random()*HERO_IMAGES.length)];
}

function hideIntro(){
  setTimeout(()=>{
    const intro = $("#intro");
    if(!intro) return;
    intro.style.opacity = "0";
    setTimeout(()=>intro.remove(),400);
  }, 1900);
}

async function loadTicker(){
  try{
    const d = await callApi("tickerrt");
    const msgs = d.ticker || [];
    $("#ticker").textContent = msgs.length ? msgs.join(" · ") : "Nema aktivnih upozorenja. Sretan put!";
  }catch{
    $("#ticker").textContent = "Upozorenja nedostupna.";
  }
}

async function loadWeather(){
  try{
    const d = await callApi("weather");
    $("#wTemp").textContent = Math.round(d.temperature ?? 0) + "°C";
    $("#wCond").textContent = d.condition || "-";
    $("#wCity").textContent = d.city || currentCity;
  }catch{
    $("#weatherBox").textContent = "Greška.";
  }
}

async function loadTraffic(){
  try{
    const d = await callApi("traffic");
    $("#trafficBox").innerHTML =
      `<div>Status: <strong>${d.status || "normal"}</strong></div>`+
      `<div>Brzina: ${d.speed ?? "—"} km/h</div>`+
      `<div>Kašnjenje: ${d.delay_min ?? 0} min</div>`+
      (d.note?`<div class="muted" style="margin-top:4px">${d.note}</div>`:"");
  }catch{
    $("#trafficBox").textContent = "Greška.";
  }
}

async function loadSea(){
  try{
    const d = await callApi("sea");
    $("#seaBox").innerHTML =
      `<div>Temperatura mora: <strong>${d.temperature ?? "-"}°C</strong></div>`+
      `<div>${d.note || ""}</div>`;
  }catch{
    $("#seaBox").textContent = "Greška.";
  }
}

async function loadAirport(){
  try{
    const d = await callApi("airport");
    const flights = d.flights || [];
    $("#airportBox").innerHTML = flights.length
      ? flights.map(f=>`<div>${f.flight}: ${f.from} → ${f.to} · ${f.eta} <span class="muted">(${f.status})</span></div>`).join("")
      : "Nema podataka.";
  }catch{
    $("#airportBox").textContent = "Greška.";
  }
}

async function loadServices(){
  try{
    const d = await callApi("services");
    $("#servicesBox").innerHTML = (d.items||[]).map(
      s=>`${s.name} – ${s.status || "otvoreno"}${s.closes?` (zatvara ${s.closes})`:""}`
    ).join("<br>") || "Nema podataka.";
  }catch{
    $("#servicesBox").textContent = "Greška.";
  }
}

async function loadTransit(){
  try{
    const d = await callApi("transit");
    $("#transitBox").innerHTML = (d.lines||[]).map(
      l=>`${l.mode} ${l.line}: ${l.from} → ${l.to} · ${l.departure}`
    ).join("<br>") || "Nema podataka.";
  }catch{
    $("#transitBox").textContent = "Greška.";
  }
}

async function loadEmergency(){
  try{
    const d = await callApi("emergency");
    $("#emergencyBox").innerHTML = (d.items||[]).map(
      i=>`<div><strong>${i.name}</strong> – ${i.phone}</div>`
    ).join("") || "Nema podataka.";
  }catch{
    $("#emergencyBox").textContent = "Greška.";
  }
}

async function loadRDS(){
  try{
    const d = await callApi("rds");
    $("#rdsBox").innerHTML = (d.actions||[]).map(
      a=>`<div><strong>${a.type}</strong> – ${a.msg}</div>`
    ).join("") || "Nema podataka.";
  }catch{
    $("#rdsBox").textContent = "Greška.";
  }
}

async function loadLandmarks(){
  try{
    const d = await callApi("landmarks");
    $("#landmarksBox").innerHTML = (d.items||[]).map(
      lm=>`<div>${lm.name}</div>`
    ).join("") || "Nema podataka.";
  }catch{
    $("#landmarksBox").textContent = "Greška.";
  }
}

async function loadPhotos(){
  try{
    const d = await callApi("photos");
    $("#photosBox").innerHTML = (d.photos||[]).map(
      p=>`<img src="${p.thumb}" style="width:48%;border-radius:8px;margin:2px 1%;" />`
    ).join("") || "Nema slika.";
  }catch{
    $("#photosBox").textContent = "Greška.";
  }
}

async function loadNews(){
  try{
    const d = await callApi("news");
    $("#newsBox").innerHTML = (d.items||[]).map(
      n=>`<div style="margin-bottom:6px;">
      <strong>${n.title}</strong>
      <div class="muted">${n.source||""} · ${n.time||""}</div>
      </div>`
    ).join("") || "Nema vijesti.";
  }catch{
    $("#newsBox").textContent = "Greška.";
  }
}

async function loadSocial(){
  try{
    const d = await callApi("social");
    const items = d.items || [];
    $("#socialBox").innerHTML = items.length
      ? items.map(
          s=>`<div style="margin-bottom:6px;">
                <div><strong>${s.source||"izvor"}</strong></div>
                <div>${s.text||""}</div>
                <div class="muted">${s.time||""}</div>
              </div>`
        ).join("")
      : "Nema aktivnih objava.";
  }catch{
    $("#socialBox").textContent = "Greška.";
  }
}

async function startNav(){
  const from = $("#navFrom").value.trim() || currentCity;
  const to = $("#navTo").value.trim();
  if(!to){alert("Unesi odredište (Do).");return;}
  $("#navInfo").textContent = "Računam rutu…";
  try{
    const d = await callApi("nav",{from,to});
    const lines = [];
    lines.push(`Ruta: ${d.from} → ${d.to}`);
    lines.push(`Udaljenost: ${d.distance_km} km`);
    lines.push(`Trajanje: ${d.duration_min} min`);
    if(d.steps && d.steps.length) lines.push("Prve upute: "+d.steps[0]);
    $("#navInfo").innerHTML = lines.join("<br>");
  }catch{
    $("#navInfo").textContent = "Greška kod rute.";
  }
}

async function runAIQuery(){
  const q = $("#queryInput").value.trim();
  if(!q) return;
  try{
    const d = await callApi("aiquery",{q});
    alert("TBW AI: "+(d.reply||"Nema odgovora."));
  }catch{
    alert("Greška kod AI upita.");
  }
}

function initMic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return;
  const rec = new SR();
  rec.lang = "hr-HR";
  rec.onresult = (e)=>{
    const text = e.results[0][0].transcript;
    $("#queryInput").value = text;
    runAIQuery();
  };
  $("#micBtn").addEventListener("click", ()=>{
    try{rec.start();}catch{}
  });
}

function updateBookingLink(){
  const q = encodeURIComponent(currentCity);
  $("#bookLink").href = `https://www.booking.com/searchresults.html?ss=${q}`;
}

/* FOUNDER MODE */
async function tryFounderLogin(){
  const code = prompt("Founder access code:");
  if(!code) return;
  try{
    const d = await callApi("billing_status",{ fcode: code });
    if(d.founder){
      isFounder = true;
      localStorage.setItem("tbw_founder","1");
      alert("Founder mode aktiviran. Svi premium sadržaji su trajno otključani na ovom uređaju.");
      showFounderBadge();
    }else{
      alert("Pogrešan Founder kod.");
    }
  }catch(e){
    console.error(e);
    alert("Greška kod provjere Founder koda.");
  }
}

function showFounderBadge(){
  const brand = document.querySelector(".brand-title");
  if(!brand) return;
  if(isFounder){
    brand.textContent = "TBW AI PREMIUM – FOUNDER";
  }
}

/* CARD EXPAND */
function initCardExpand(){
  document.querySelectorAll(".card").forEach(card=>{
    card.addEventListener("click",(e)=>{
      // ne hvataj klik na button unutar kartice
      if(e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.closest("button") || e.target.closest("a")) return;
      card.classList.toggle("expanded");
    });
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  setHero();
  hideIntro();
  initMic();
  updateBookingLink();

  // Founder local
  if(localStorage.getItem("tbw_founder") === "1"){
    isFounder = true;
    showFounderBadge();
  }

  // tajni long-press na naslov za Founder login
  const brandTitle = document.querySelector(".brand-title");
  if(brandTitle){
    let pressTimer;
    const start = ()=>{
      pressTimer = setTimeout(()=>tryFounderLogin(),800);
    };
    const cancel = ()=>clearTimeout(pressTimer);
    brandTitle.addEventListener("mousedown", start);
    brandTitle.addEventListener("touchstart", start);
    ["mouseup","mouseleave","touchend","touchcancel"].forEach(ev=>{
      brandTitle.addEventListener(ev, cancel);
    });
  }

  loadTicker();
  loadWeather();
  loadTraffic();
  loadSea();
  loadAirport();
  loadServices();
  loadTransit();
  loadEmergency();
  loadRDS();
  loadLandmarks();
  loadPhotos();
  loadNews();
  loadSocial();
  initCardExpand();

  $("#navGo").addEventListener("click", startNav);
  $("#queryInput").addEventListener("keydown",(e)=>{
    if(e.key==="Enter") runAIQuery();
  });

  $("#cardBooking").addEventListener("click",()=>{
    window.open($("#bookLink").href,"_blank");
  });
});
