export default async function handler(req, res) {
    const { route, city } = req.query;

    try {
        if (route === "alerts") {
            return res.status(200).json({
                city,
                alert: "Ovo je testni alert – API RADI!!!"
            });
        }

        return res.status(400).json({ error: "Nepodržana ruta." });
    } catch (err) {
        return res.status(500).json({ error: "Server error." });
    }
}
