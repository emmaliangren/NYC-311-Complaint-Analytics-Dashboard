from typing import TypedDict


class HttpStatus(TypedDict):
    code: int
    message: str


HTTP = {
    "ok": {"code": 200, "message": "OK"},
    "processing": {"code": 202, "message": "Request Processing"},
    "bad_request": {"code": 400, "message": "Bad Request"},
    "unauthorized": {"code": 401, "message": "Unauthorized"},
    "forbidden": {"code": 403, "message": "Forbidden"},
    "not_found": {"code": 404, "message": "Not Found"},
    "rate_limited": {"code": 429, "message": "Too Many Requests"},
    "server_error": {"code": 500, "message": "Server Error"},
}

RETRY_CODES = {HTTP["processing"]["code"], HTTP["rate_limited"]["code"]}
ENDPOINTS = {
    "complaints": "https://data.cityofnewyork.us/api/v3/views/erm2-nwe9/query.json",
}
MAX_TIMEOUT = 60

NYC_LAT_MIN = 40.35
NYC_LAT_MAX = 41.0
NYC_LNG_MIN = -74.4
NYC_LNG_MAX = -73.55
