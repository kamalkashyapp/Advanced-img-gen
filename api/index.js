const API_URL = "https://data.aizdzj.com/draw/text2image.php";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
  "Origin": "https://draw.freeforai.com",
  "Referer": "https://draw.freeforai.com/",
  "Accept-Language": "en-IN,en-US;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1️⃣ Create image task
async function createImage(prompt, size = "1024*1024", model = "flux-dev") {
  const payload = new URLSearchParams({
    prompt,
    size,
    model,
    influence: "100",
    image_name: `img_${Date.now()}`,
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: payload,
  });

  const data = await res.json();
  return data.task_id || null;
}

// 2️⃣ Check task status
async function checkStatus(taskId) {
  const payload = new URLSearchParams({ task_id: taskId });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: payload,
  });

  return res.json();
}

// 3️⃣ Full generation flow
async function generateImage(prompt) {
  const taskId = await createImage(prompt);

  if (!taskId) {
    return { ok: false, error: "Task creation failed" };
  }

  while (true) {
    await sleep(3000);
    const status = await checkStatus(taskId);

    if (status.task_status === "SUCCEEDED") {
      return {
        ok: true,
        task_id: taskId,
        image_url: status.result.data[0].url,
      };
    }

    if (status.task_status === "FAILED") {
      return { ok: false, error: "Generation failed" };
    }
  }
}

// ==============================
// VERCEL HANDLER
// ==============================
export default async function handler(req, res) {
  try {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "Missing ?prompt parameter",
      });
    }

    const result = await generateImage(prompt);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
