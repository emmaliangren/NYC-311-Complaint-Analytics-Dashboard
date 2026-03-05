import os
import time
from dataclasses import dataclass
from typing import Optional, cast
from datetime import datetime
from dotenv import load_dotenv
import pymysql
import requests
from constants import (
    HTTP,
    MAX_TIMEOUT,
    NYC_LAT_MAX,
    NYC_LAT_MIN,
    NYC_LNG_MAX,
    NYC_LNG_MIN,
    RETRY_CODES,
    ENDPOINTS,
)

load_dotenv()

APP_TOKEN = os.getenv("NYC_APP_TOKEN", "")
REFRESH_INTERVAL = int(os.getenv("REFRESH_INTERVAL_SECONDS", "3600"))
MAX_RETRIES = 3
RETRY_DELAY = 5
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "100"))


def fetch(page: int, page_size: int = BATCH_SIZE) -> list[dict]:
    print(f"Fetching complaint data: {page_size} complaints from page {page}")
    headers = {"Accept": "application/json", "X-App-Token": APP_TOKEN}
    data = {
        "query": "SELECT *",
        "page": {"pageNumber": page, "pageSize": page_size},
        "includeSynthetic": False,
    }

    for attempt in range(MAX_RETRIES):
        response = requests.post(
            ENDPOINTS["complaints"], headers=headers, json=data, timeout=MAX_TIMEOUT
        )

        print(f"API responded {response.status_code}")

        if response.status_code == HTTP["ok"]["code"]:
            return response.json()

        if response.status_code in RETRY_CODES:
            delay_time = RETRY_DELAY * (attempt + 1)
            print(f"Retrying in {delay_time}s")
            time.sleep(RETRY_DELAY * (attempt + 1))
            continue

        response.raise_for_status()

    raise RuntimeError(f"Max retries exceeded for {ENDPOINTS['complaints']}")


def connection() -> pymysql.connect:
    print("Opening DB connection")
    host = os.getenv("DB_HOST")
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")
    database = os.getenv("DB_NAME")
    port = os.getenv("DB_PORT")

    if None in (host, user, password, database, port):
        raise RuntimeError("DB connection parameters must be specified")

    return pymysql.connect(
        host=host,
        user=user,
        password=cast(str, password),
        database=database,
        port=int(cast(str, port)),
    )


@dataclass
class Complaint:
    unique_key: str
    created_date: Optional[datetime]
    closed_date: Optional[datetime]
    complaint_type: str
    borough: str
    status: str
    latitude: Optional[float]
    longitude: Optional[float]


def parse_datetime(val: str | None) -> Optional[datetime]:
    if not val:
        return None
    return datetime.strptime(val, "%Y-%m-%dT%H:%M:%S.%f")


def is_valid_coordinates(record: dict) -> bool:
    try:
        latitude = record.get("latitude")
        longitude = record.get("longitude")

        if not latitude or not longitude:
            return False

        return (NYC_LAT_MIN <= float(latitude) <= NYC_LAT_MAX) and (
            NYC_LNG_MIN <= float(longitude) <= NYC_LNG_MAX
        )
    except ValueError:
        return False


def parse_record(record: dict) -> Optional[Complaint]:
    if not is_valid_coordinates(record):
        return None

    return Complaint(
        unique_key=record["unique_key"],
        created_date=parse_datetime(record.get("created_date")),
        closed_date=parse_datetime(record.get("closed_date")),
        complaint_type=record["complaint_type"],
        borough=record["borough"],
        status=record["status"],
        latitude=float(record["latitude"]),
        longitude=float(record["longitude"]),
    )


def upsert(cursor: pymysql.cursors.Cursor, data: list[dict]) -> int:
    sql = """
    INSERT INTO complaints (
        unique_key,
        created_date,
        closed_date,
        complaint_type,
        borough,
        status,
        latitude,
        longitude
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        closed_date = IF(closed_date <=> VALUES(closed_date), closed_date, VALUES(closed_date)),
        status = IF(status <=> VALUES(status), status, VALUES(status))
    """

    records = [parse_record(x) for x in data]
    sql_data = [
        (
            r.unique_key,
            r.created_date,
            r.closed_date,
            r.complaint_type,
            r.borough,
            r.status,
            r.latitude,
            r.longitude,
        )
        for r in records
        if r is not None
    ]

    if not sql_data:
        print("No valid records to upsert")
        return 0

    cursor.executemany(sql, sql_data)
    print(
        f"Upserted {len(sql_data)} records ({len(data) - len(sql_data)} filtered out)"
    )
    return len(sql_data)


def run():
    while True:
        c = connection()
        page = 1
        with c:
            while True:
                data = fetch(page=page)
                with c.cursor() as cursor:
                    upsert(cursor, data)
                c.commit()

                if len(data) < BATCH_SIZE:
                    break

                page += 1
        print(f"Ingestion complete, sleeping for {REFRESH_INTERVAL}s")
        time.sleep(REFRESH_INTERVAL)


if __name__ == "__main__":
    print("INGESTOR UP")
    run()
