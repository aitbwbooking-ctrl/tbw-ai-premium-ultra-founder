import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      list: [
        "Dioklecijanova palača",
        "Marjan",
        "Riva"
      ]
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
