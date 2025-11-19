import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      police: "192",
      ambulance: "194",
      fire: "193"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
