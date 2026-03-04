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
  Array.from({ length: count }, (_, i) =>
    point(
      startId + i,
      centerLat + (Math.random() - 0.5) * 0.005,
      centerLng + (Math.random() - 0.5) * 0.005
    )
  );

export const MOCK_POINTS: GeoPoint[] = [
  ...cluster(40.5795, -74.1502, 5, 1), // green
  ...cluster(40.6782, -73.9442, 50, 100), // yellow
  ...cluster(40.7128, -74.006, 150, 200), // red
];

export const MOCK_REFRESH: DataRefresh = {
  refreshCompletedAt: new Date().toISOString(),
  recordsProcessed: MOCK_POINTS.length,
  status: "completed",
};
