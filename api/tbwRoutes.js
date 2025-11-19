export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace("/api/tbwRoutes", "");

  // HERO SLIKE – FALLBACK
  if (path === "/hero") {
    return res.status(200).json({
      ok: true,
      images: [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
      ]
    });
  }

  // VRIJEME – FAKE DATA (dok ne dodaš API)
  if (path === "/weather") {
    return res.status(200).json({
      ok: true,
      temp: 21,
      cond: "Vedro",
      city: "Split"
    });
  }

  // PROMET – DEMO
  if (path === "/traffic") {
    return res.status(200).json({
      ok: true,
      traffic: "Nema većih zastoja"
    });
  }

  // NAVIGACIJA – DEMO
  if (path === "/route") {
    return res.status(200).json({
      ok: true,
      from: url.searchParams.get("from") || "Lokacija",
      to: url.searchParams.get("to") || "Odredište",
      distance: "12 km",
      duration: "19 min"
    });
  }

  // BOOKING LINK
  if (path === "/booking") {
    const q = url.searchParams.get("q") || "Split";
    return res.status(200).json({
      ok: true,
      link: `https://www.booking.com/searchresults.hr.html?ss=${encodeURIComponent(q)}`
    });
  }

  // ALERTI – DEMO + ticker
  if (path === "/alerts") {
    return res.status(200).json({
      ok: true,
      alerts: [
        "Prometna nesreća – Solin",
        "Zatvorena cesta – Omiš–Makarska",
        "Pojačan vjetar na A1",
        "Moguće kiše u poslijepodnevnim satima"
      ]
    });
  }

  // DEFAULT 404 API
  return res.status(404).json({
    ok: false,
    error: "Ruta ne postoji"
  });
}
