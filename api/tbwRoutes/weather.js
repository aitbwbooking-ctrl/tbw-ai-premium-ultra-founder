import { fetchJSON, send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    const city = req.query.city || "Split";

    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=43.51&longitude=16.44&current_weather=true";

    const data = await fetchJSON(url);

    return send(res, {
      city,
      temp: data.current_weather.temperature,
      cond: "Vedro"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
