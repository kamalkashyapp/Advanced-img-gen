export default async function handler(req, res) {
  try {
    const img = req.query.img;

    if (!img) {
      return res.status(400).json({ error: "img query missing" });
    }

    const apiURL = `https://nsfw.drsudo.workers.dev/?img=${encodeURIComponent(img)}`;

    const response = await fetch(apiURL);

    if (!response.ok) {
      return res.status(500).json({ error: "Third-party API error" });
    }

    const data = await response.text(); // API returns text, not JSON

    // Pass-through response
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
      }
