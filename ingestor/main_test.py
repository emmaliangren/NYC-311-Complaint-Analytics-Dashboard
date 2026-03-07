from unittest.mock import _Call, call, patch, MagicMock
import pytest
from constants import HTTP, NYC_LAT_MAX, NYC_LAT_MIN, NYC_LNG_MAX, NYC_LNG_MIN
from main import BATCH_SIZE, fetch, is_valid_coordinates, parse_record, run, upsert
from test_constants import (
    EXPECTED_BOROUGH,
    EXPECTED_CLOSED_DATE,
    EXPECTED_COMPLAINT_TYPE,
    EXPECTED_CREATED_DATE,
    EXPECTED_LATITUDE,
    EXPECTED_LONGITUDE,
    EXPECTED_STATUS,
    EXPECTED_UNIQUE_KEY,
    VALID_RECORD,
    INVALID_LONGITUDE,
)


def make_record(**overrides) -> dict:
    return {**VALID_RECORD, **overrides}


class TestIsValidCoordinate:
    def test_succeeds_on_valid_coordinates(self):
        assert is_valid_coordinates(make_record()) is True

    def test_null_latitude(self):
        assert is_valid_coordinates(make_record(latitude=None)) is False

    def test_null_longitude(self):
        assert is_valid_coordinates(make_record(latitude=None)) is False

    def test_missing_coordinates(self):
        record = make_record()
        del record["latitude"]
        del record["longitude"]
        assert is_valid_coordinates(record) is False

    def test_latitude_too_large(self):
        assert (
            is_valid_coordinates(make_record(latitude=f"{NYC_LAT_MAX + 100}")) is False
        )

    def test_latitude_too_small(self):
        assert (
            is_valid_coordinates(make_record(latitude=f"{NYC_LAT_MIN - 100}")) is False
        )

    def test_longitude_too_large(self):
        assert (
            is_valid_coordinates(make_record(longitude=f"{NYC_LNG_MAX + 100}")) is False
        )

    def test_longitude_too_small(self):
        assert (
            is_valid_coordinates(make_record(longitude=f"{NYC_LNG_MIN - 100}")) is False
        )

    def test_latitude_non_numeric(self):
        assert is_valid_coordinates(make_record(latitude="a")) is False

    def test_longitude_non_numeric(self):
        assert is_valid_coordinates(make_record(longitude="a")) is False


class TestParseRecord:
    def test_valid_record(self):
        result = parse_record(make_record())
        assert result is not None
        assert result.unique_key == EXPECTED_UNIQUE_KEY
        assert result.complaint_type == EXPECTED_COMPLAINT_TYPE
        assert result.borough == EXPECTED_BOROUGH
        assert result.status == EXPECTED_STATUS

    def test_float_casting(self):
        result = parse_record(make_record())
        assert result is not None
        assert isinstance(result.latitude, float)
        assert isinstance(result.longitude, float)
        assert result.latitude == pytest.approx(EXPECTED_LATITUDE)
        assert result.longitude == pytest.approx(EXPECTED_LONGITUDE)

    def test_datetime_parsing(self):
        result = parse_record(make_record())
        assert result is not None
        assert result.created_date == EXPECTED_CREATED_DATE
        assert result.closed_date == EXPECTED_CLOSED_DATE

    def test_closed_date_none(self):
        result = parse_record(make_record(closed_date=None))
        assert result is not None
        assert result.closed_date is None

    def test_invalid_coordinates_returns_none(self):
        assert parse_record(make_record(latitude=None)) is None


class TestUpsert:
    def test_filters_invalid_records(self):
        cursor = MagicMock()
        valid = make_record()
        invalid = make_record(longitude=INVALID_LONGITUDE)
        count = upsert(cursor, [valid, invalid])
        assert count == 1

    def test_returns_correct_count(self):
        cursor = MagicMock()
        count = upsert(cursor, [make_record(), make_record(unique_key="2")])
        assert count == 2

    def test_db_insert_with_correct_data(self):
        cursor = MagicMock()
        upsert(cursor, [make_record()])
        c: _Call = cursor.executemany.mock_calls[0]
        sql_data = c.args[1]
        assert len(sql_data) == 1
        row = sql_data[0]
        assert row[0] == EXPECTED_UNIQUE_KEY
        assert row[4] == EXPECTED_BOROUGH
        assert isinstance(row[6], float)
        assert isinstance(row[7], float)

    def test_no_valid_records_skips_db_insert(self):
        cursor = MagicMock()
        count = upsert(cursor, [make_record(longitude=INVALID_LONGITUDE)])
        cursor.executemany.assert_not_called()
        assert count == 0

    def test_empty_input_skips_db_insert(self):
        cursor = MagicMock()
        count = upsert(cursor, [])
        cursor.executemany.assert_not_called()
        assert count == 0


class TestFetch:
    def _mock_response(self, status_code: int, json_data=None):
        response = MagicMock()
        response.status_code = status_code
        response.json.return_value = json_data or []
        response.raise_for_status = MagicMock()
        return response

    def test_fetch_returns_data(self):
        mock_get = self._mock_response(HTTP["ok"]["code"], VALID_RECORD)
        with patch("main.requests.post", return_value=mock_get):
            assert fetch(page=1) == VALID_RECORD

    def test_fetch_retries_on_processing(self):
        processing = self._mock_response(HTTP["processing"]["code"])
        success = self._mock_response(HTTP["ok"]["code"], [{"id": 1}])
        with patch("main.requests.post", side_effect=[processing, success]):
            with patch("main.time.sleep"):
                assert fetch(page=1) == [{"id": 1}]

    def test_fetch_retries_on_rate_limit(self):
        limited = self._mock_response(HTTP["rate_limited"]["code"])
        success = self._mock_response(HTTP["ok"]["code"], [])
        with patch("main.requests.post", side_effect=[limited, success]):
            with patch("main.time.sleep"):
                assert fetch(page=1) == []

    def test_fetch_raises_on_bad_request(self):
        bad = self._mock_response(HTTP["bad_request"]["code"])
        bad.raise_for_status.side_effect = RuntimeError("400 Bad Request")
        with patch("main.requests.post", return_value=bad):
            try:
                fetch(page=1)
                assert False, "Should have raised"
            except RuntimeError as e:
                assert "400" in str(e)


@pytest.fixture
def mock_conn():
    mock_cursor = MagicMock()
    mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
    mock_cursor.__exit__ = MagicMock(return_value=False)

    conn = MagicMock()
    conn.__enter__ = MagicMock(return_value=conn)
    conn.__exit__ = MagicMock(return_value=False)
    conn.cursor.return_value = mock_cursor

    return conn


class TestRun:
    @patch("main.connection")
    @patch("main.fetch")
    def test_full_page(self, mock_fetch, mock_connection, mock_conn):
        mock_fetch.return_value = [make_record()]
        mock_connection.return_value = mock_conn

        with patch("main.time.sleep", side_effect=StopIteration):
            with pytest.raises(StopIteration):
                run()

        mock_fetch.assert_called_once_with()
        mock_conn.commit.assert_called_once()
