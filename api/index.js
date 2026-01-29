const API_URL = "https://data.aizdzj.com/draw/text2image.php";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
  "Origin": "https://draw.freeforai.com",
  "Referer": "https://draw.freeforai.com/",
  "Accept-Language": "en-IN,en-US;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded",
};

async function createImage(prompt, size = "1024*1024", model = "flux-dev") {
  const payload = new URLSearchParams({
    prompt,
    size,
    model,
    influence: "100",
    image_name: `img_${Date.now()}`,
  });

  const res = await fetch(API_URL, { method: "POST", headers: HEADERS, body: payload });
  const data = await res.json();
  return data.task_id || null;
}

export default async function handler(req, res) {
  try {
    const { prompt } = req.query;
    if (!prompt) return res.status(400).json({ ok: false, error: "Missing ?prompt parameter" });

    const taskId = await createImage(prompt);
    if (!taskId) return res.status(500).json({ ok: false, error: "Task creation failed" });

    res.status(200).json({
      ok: true,
      task_id: taskId,
      message: "Task created! Poll /api/status?task_id=TASK_ID to get the image.",
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
