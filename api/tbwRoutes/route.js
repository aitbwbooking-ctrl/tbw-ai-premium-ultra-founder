import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    const from = req.query.from || "Split";
    const to   = req.query.to || "Zagreb";

    return send(res, {
      route: `${from} → ${to}`,
      duration: "3h 45min",
      distance: "410 km"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
