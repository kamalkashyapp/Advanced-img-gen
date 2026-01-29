const API_URL = "https://data.aizdzj.com/draw/text2image.php";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
  "Origin": "https://draw.freeforai.com",
  "Referer": "https://draw.freeforai.com/",
  "Accept-Language": "en-IN,en-US;q=0.9",
  "Content-Type": "application/x-www-form-urlencoded",
};

// sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1️⃣ Create Image Task
async function createImage(prompt, size = "1024*1024", model = "flux-dev") {
  const payload = new URLSearchParams({
    prompt,
    size,
    model,
    influence: "100",
    image_name: `img_${Date.now()}`,
  });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: payload,
  });

  const data = await response.json();
  return data.task_id || null;
}

// 2️⃣ Check Task Status
async function checkStatus(taskId) {
  const payload = new URLSearchParams({ task_id: taskId });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: payload,
  });

  return response.json();
}

// 3️⃣ Generate & Wait Until Done
async function generateImageAndWait(prompt) {
  const taskId = await createImage(prompt);

  if (!taskId) {
    return { ok: false, error: "Task creation failed" };
  }

  // Poll until done or failed
  while (true) {
    // Wait a bit before checking
    await sleep(2000);

    const status = await checkStatus(taskId);

    if (status.task_status === "SUCCEEDED") {
      const imageUrl = status.result.data[0].url;
      return { ok: true, image_url: imageUrl, task_id: taskId };
    }

    if (status.task_status === "FAILED") {
      return { ok: false, error: "Image generation failed" };
    }

    // else continue polling
  }
}

export default async function handler(req, res) {
  try {
    const { prompt } = req.query;

    if (!prompt) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing ?prompt parameter" });
    }

    const result = await generateImageAndWait(prompt);
    res.status(200).json(result);
  } catch (err) {
    res
      .status(500)
      .json({ ok: false, error: "Server error: " + err.message });
  }
}
