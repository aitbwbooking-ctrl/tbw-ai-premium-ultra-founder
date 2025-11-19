import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      police: "Policija dostupna 0-24",
      hospital: "KBC Split – hitni prijem",
      taxi: "Taxi 24/7"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
