import type { GeoPoint } from "@/types/GeoPoint";
import { logError } from "./util";

const MOCK_POINTS: GeoPoint[] = [
  {
    id: "1",
    lat: 40.7128,
    lng: -74.006,
    complaintType: "Noise",
    borough: "Manhattan",
    date: "2025-03-01",
    status: "Open",
  },
  {
    id: "2",
    lat: 40.6782,
    lng: -73.9442,
    complaintType: "Pothole",
    borough: "Brooklyn",
    date: "2025-03-02",
    status: "Closed",
  },
  {
    id: "3",
    lat: 40.7282,
    lng: -73.7949,
    complaintType: "Graffiti",
    borough: "Queens",
    date: "2025-02-28",
    status: "Open",
  },
  {
    id: "4",
    lat: 40.8448,
    lng: -73.8648,
    complaintType: "Heat/Hot Water",
    borough: "Bronx",
    date: "2025-03-01",
    status: "In Progress",
  },
  {
    id: "5",
    lat: 40.5795,
    lng: -74.1502,
    complaintType: "Street Light",
    borough: "Staten Island",
    date: "2025-02-27",
    status: "Closed",
  },
];

export async function fetchGeoPointsMock(): Promise<GeoPoint[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_POINTS;
}

export async function fetchGeoPoints(): Promise<GeoPoint[]> {
  try {
    const response = await fetch("/api/points");
    if (!response.ok) {
      throw new Error(`Failed to fetch geo points: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logError(error);
    return [];
  }
}
