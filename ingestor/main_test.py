from unittest.mock import patch, MagicMock
from constants import HTTP
from main import fetch


def _mock_response(status_code: int, json_data=None):
    response = MagicMock()
    response.status_code = status_code
    response.json.return_value = json_data or []
    response.raise_for_status = MagicMock()
    return response


def test_fetch_returns_data():
    data = [{"id": 1, "complaint": "Noise"}]
    mock_get = _mock_response(HTTP["ok"]["code"], data)
    with patch("main.requests.get", return_value=mock_get):
        assert fetch() == data


def test_fetch_retries_on_processing():
    processing = _mock_response(HTTP["processing"]["code"])
    success = _mock_response(HTTP["ok"]["code"], [{"id": 1}])
    with patch("main.requests.get", side_effect=[processing, success]):
        with patch("main.time.sleep"):
            assert fetch() == [{"id": 1}]


def test_fetch_retries_on_rate_limit():
    limited = _mock_response(HTTP["rate_limited"]["code"])
    success = _mock_response(HTTP["ok"]["code"], [])
    with patch("main.requests.get", side_effect=[limited, success]):
        with patch("main.time.sleep"):
            assert fetch() == []


def test_fetch_raises_on_bad_request():
    bad = _mock_response(HTTP["bad_request"]["code"])
    bad.raise_for_status.side_effect = Exception("400 Bad Request")
    with patch("main.requests.get", return_value=bad):
        try:
            fetch()
            assert False, "Should have raised"
        except Exception as e:
            assert "400" in str(e)
