import requests
import time
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

API_URL = "https://data.aizdzj.com/draw/text2image.php"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
    "Origin": "https://draw.freeforai.com",
    "Referer": "https://draw.freeforai.com/",
    "Accept-Language": "en-IN,en-US;q=0.9",
}

# ------------------------------
# Helpers
# ------------------------------
def create_image(prompt, size="1024*1024", model="flux-dev"):
    payload = {
        "prompt": prompt,
        "size": size,
        "model": model,
        "influence": "100",
        "image_name": f"img_{int(time.time())}"
    }

    r = requests.post(API_URL, data=payload, headers=HEADERS)
    data = r.json()

    return data.get("task_id")


def check_status(task_id):
    payload = {"task_id": task_id}
    r = requests.post(API_URL, data=payload, headers=HEADERS)
    return r.json()


def generate_image(prompt):
    task_id = create_image(prompt)
    if not task_id:
        return {"ok": False, "error": "Task creation failed"}

    for _ in range(20):  # ~60 seconds max (Vercel safe)
        time.sleep(3)
        status = check_status(task_id)

        if status.get("task_status") == "SUCCEEDED":
            return {
                "ok": True,
                "task_id": task_id,
                "image_url": status["result"]["data"][0]["url"]
            }

        if status.get("task_status") == "FAILED":
            return {"ok": False, "error": "Generation failed"}

    return {"ok": False, "error": "Timeout"}


# ------------------------------
# API Schema
# ------------------------------
class PromptRequest(BaseModel):
    prompt: str


# ------------------------------
# Routes
# ------------------------------
@app.get("/")
def root():
    return {"status": "API running 🚀"}


@app.post("/generate")
def generate(req: PromptRequest):
    return generate_image(req.prompt)
