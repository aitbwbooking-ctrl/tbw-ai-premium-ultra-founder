import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      buses: "Autobusi voze po redu vožnje",
      ferries: "Trajekti uredno plove"
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
