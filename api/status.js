const API_URL = "https://data.aizdzj.com/draw/text2image.php";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
  "Origin": "https://draw.freeforai.com",
  "Referer": "https://draw.freeforai.com/",
  "Accept-Language": "en-IN,en-US;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded",
};

export default async function handler(req, res) {
  try {
    const { task_id } = req.query;
    if (!task_id) return res.status(400).json({ ok: false, error: "Missing task_id" });

    const payload = new URLSearchParams({ task_id });
    const statusRes = await fetch(API_URL, { method: "POST", headers: HEADERS, body: payload });
    const data = await statusRes.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
