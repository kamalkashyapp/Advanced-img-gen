export default async function handler(req, res) {
  try {
    const img = req.query.img;

    if (!img) {
      return res.status(400).json({ error: "img parameter missing" });
    }

    const apiURL = `https://nsfw.drsudo.workers.dev/?img=${encodeURIComponent(img)}`;

    const response = await fetch(apiURL);

    if (!response.ok) {
      return res.status(500).json({ error: "Source API error" });
    }

    // API returns JSON/text, not binary
    const result = await response.text();

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
