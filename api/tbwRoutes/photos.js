import { send, error } from "./_helpers.js";

export default async function handler(req, res) {
  try {
    return send(res, {
      photos: [
        "https://images.unsplash.com/photo-1556229162-5c63f243e90d",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077"
      ]
    });
  }
  catch (err) {
    return error(res, err.message);
  }
}
