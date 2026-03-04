import type { GeoPoint, DataRefresh } from "@/types/geo";

const point = (id: number, lat: number, lng: number): GeoPoint => ({
  uniqueKey: String(id),
  latitude: lat,
  longitude: lng,
  complaintType: "Noise",
  borough: "Manhattan",
  createdDate: "2025-03-01",
  status: "Open",
});

const cluster = (
  centerLat: number,
  centerLng: number,
  count: number,
  startId: number
): GeoPoint[] =>
  Array.from({ length: count }, (_, i) => {
    const offset = (i / count - 0.5) * 0.005;
    return point(startId + i, centerLat + offset, centerLng + offset * 0.8);
  });

export const MOCK_POINTS: GeoPoint[] = [
  ...cluster(40.5795, -74.1502, 5, 1), // green
  ...cluster(40.6782, -73.9442, 50, 100), // yellow
  ...cluster(40.7128, -74.006, 150, 200), // red
];

export const MOCK_REFRESH: DataRefresh = {
  refreshCompletedAt: "2025-03-04T12:00:00Z",
  recordsProcessed: MOCK_POINTS.length,
  status: "completed",
};
