import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    const city = req.query.q || "Split";

    return send(res, {
      bookingUrl:
        "https://www.booking.com/searchresults.html?ss=" + encodeURIComponent(city)
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
