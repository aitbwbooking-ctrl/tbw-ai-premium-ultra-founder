import { fetchJSON, send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    // fallback slike za hero
    const HERO_IMAGES = [
      "https://images.unsplash.com/photo-1501955079857-b56d289b3ee3",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce23",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
    ];

    return send(res, { images: HERO_IMAGES });
  }

  catch (err) {
    return error(res, err.message);
  }
}
