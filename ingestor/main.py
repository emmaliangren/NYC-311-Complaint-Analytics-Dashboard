import os
import time
import requests
from dotenv import load_dotenv
from constants import HTTP, RETRY_CODES, ENDPOINTS

load_dotenv()

APP_TOKEN = os.getenv("NYC_APP_TOKEN")
REFRESH_INTERVAL = int(os.getenv("REFRESH_INTERVAL_SECONDS", 3600))
MAX_RETRIES = 3
RETRY_DELAY = 5


def fetch(offset: int = 0, limit: int = 1000) -> list[dict]:
    headers = {"X-App-Token": APP_TOKEN} if APP_TOKEN else {}
    params = {"$limit": limit, "$offset": offset}

    for attempt in range(MAX_RETRIES):
        response = requests.get(ENDPOINTS["complaints"], headers=headers, params=params)

        if response.status_code == HTTP["ok"]["code"]:
            return response.json()

        if response.status_code in RETRY_CODES:
            time.sleep(RETRY_DELAY * (attempt + 1))
            continue

        response.raise_for_status()

    raise RuntimeError(f"Max retries exceeded for {ENDPOINTS['complaints']}")


def connection():
    pass


def upsert():
    pass


def run():
    pass


if __name__ == "__main__":
    while True:
        run()
        time.sleep(REFRESH_INTERVAL)
