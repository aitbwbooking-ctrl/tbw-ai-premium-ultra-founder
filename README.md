# TBW AI PREMIUM – Travel Navigator ULTRA (Founder mode)

Ovaj projekt je spreman za deploy na **Vercel** i kasnije pakiranje u **APK**.

## Struktura

- `index.html` – zaključana početna stranica (TBW AI PREMIUM dizajn + hero avion + grid kartica)
- `style.css` – premium tamni stil + intro animacija (komet + TBW AI Navigator logo) + ticker
- `app.js` – front-end logika, pozivi na backend, glasovna tražilica, Founder mode (skriveni long-press)
- `api/tbw.js` – Vercel serverless backend sa svim rutama + Founder mode
- `vercel.json` – mapiranje rute `/api/tbw`

## Environment varijable (Vercel → Project → Settings → Environment Variables)

Postavi po potrebi:

- `OPENWEATHER_API_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_DIRECTIONS_API_KEY`
- `AVIATIONSTACK_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `NEWSAPI_KEY`
- `HR_NEWS_RSS` (lista RSS URL-ova, npr. Index, 24sata...)
- `TWITTER_BEARER_TOKEN` (opcionalno)
- `REDDIT_FEED_ENABLED` = `1` (opcionalno)
- `FOUNDER_ACCESS_CODE` (npr. `TBW-DRZ-777`)

Bez ključeva – backend vraća demo podatke (aplikacija i dalje radi).

## Founder mode

- DODAJ u Vercel ENV: `FOUNDER_ACCESS_CODE`
- U aplikaciji: dugo pritisni TBW naslov gore (oko 0.8 s) → pojavi se prompt
- Unesi Founder kod → uređaj postaje **FOUNDER LIFETIME PREMIUM**
- U tom modu se naslov mijenja u: `TBW AI PREMIUM – FOUNDER`

## Deploy na Vercel

1. Napravi novi GitHub repo i u njega stavi sadržaj ovog ZIP-a.
2. Na Vercel-u izaberi taj repo kao novi projekt.
3. Dodaj env varijable.
4. Deploy.

Na kraju dobiješ:

- web app na Vercel domeni
- spremno za PWA / WebView / APK generiranje za Android.
<!-- force redeploy -->
