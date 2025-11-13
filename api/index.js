export default async function handler(req, res) {
  try {
    const img = req.query.img;

    if (!img) {
      return res.status(400).json({ error: "img parameter missing" });
    }

    const url = `https://nsfw.drsudo.workers.dev/?img=${encodeURIComponent(img)}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Source API error" });
    }

    const result = await response.text();

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(result);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
      }
