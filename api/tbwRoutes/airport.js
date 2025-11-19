import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      departures: "Letovi uredni",
      arrivals: "Dolazni letovi uredni"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
