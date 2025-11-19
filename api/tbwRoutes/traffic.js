import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      traffic: "Promet uredan. Nema zastoja."
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
