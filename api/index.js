export default async function handler(req, res) {
  const img = req.query.img;

  if (!img) {
    return res.status(400).json({ error: "img parameter missing" });
  }

  try {
    const url = `https://nsfw.drsudo.workers.dev/?img=${encodeURIComponent(img)}`;
    const response = await fetch(url);
    const text = await response.text();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
