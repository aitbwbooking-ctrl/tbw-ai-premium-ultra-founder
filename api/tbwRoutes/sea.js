import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      temp: "18°C",
      waves: "Malo valovito",
      wind: "Blagi vjetar"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
