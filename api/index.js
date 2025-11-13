export default async function handler(req, res) {
  try {
    // Forward all query params exactly
    const query = req.url.split("?")[1] || "";

    if (!query.includes("img=")) {
      return res.status(400).json({ error: "img parameter missing" });
    }

    const apiURL = "https://nsfw.drsudo.workers.dev/?" + query;

    const response = await fetch(apiURL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(text);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
