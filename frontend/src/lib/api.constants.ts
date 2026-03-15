import type { Borough, ComplaintType, Neighbourhood, Status } from "@/types/api";

export const API_HEALTH_URL = "/api/health";
export const API_GEO_POINTS_URL = "/api/complaints/geopoints";
export const API_FILTER_OPTIONS_URL = "/api/complaints/filter-options";
export const API_LAST_REFRESH_URL = "/api/refreshlogs/latest";

export const TOTAL_MOCK_POINTS = 1800;
export const MOCK_DELAY_MS = 500;

export const COMPLAINT_TYPES: ComplaintType[] = [
  "Noise - Residential",
  "Noise - Commercial",
  "Noise - Street/Sidewalk",
  "Illegal Parking",
  "Blocked Driveway",
  "Heat/Hot Water",
  "Street Condition",
  "Water System",
  "Rodent",
  "Unsanitary Condition",
  "Traffic Signal Condition",
  "Homeless Encampment",
  "Graffiti",
  "Air Quality",
  "Sewer",
];

export const STATUSES: Status[] = [
  "Open",
  "Open",
  "Open",
  "Closed",
  "Closed",
  "Closed",
  "In Progress",
  "In Progress",
  "Assigned",
  "Started",
  "Pending",
];

export const BOROUGHS: Borough[] = ["MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "STATEN ISLAND"];

const MANHATTAN: Neighbourhood[] = [];

const BROOKLYN: Neighbourhood[] = [
  {
    name: "Williamsburg",
    borough: "BROOKLYN",
    lat: 40.7081,
    lng: -73.9571,
    spread: 0.013,
    weight: 12,
  },
  {
    name: "South Brooklyn",
    borough: "BROOKLYN",
    lat: 40.608,
    lng: -73.9525,
    spread: 0.018,
    weight: 11,
  },
  { name: "Bushwick", borough: "BROOKLYN", lat: 40.6944, lng: -73.9213, spread: 0.012, weight: 10 },
  {
    name: "Crown Heights",
    borough: "BROOKLYN",
    lat: 40.6694,
    lng: -73.9422,
    spread: 0.014,
    weight: 9,
  },
  {
    name: "Bedford-Stuyvesant",
    borough: "BROOKLYN",
    lat: 40.6872,
    lng: -73.9418,
    spread: 0.013,
    weight: 9,
  },
  { name: "Bay Ridge", borough: "BROOKLYN", lat: 40.6359, lng: -74.0195, spread: 0.011, weight: 6 },
  { name: "Flatbush", borough: "BROOKLYN", lat: 40.6501, lng: -73.9496, spread: 0.015, weight: 8 },
];

const QUEENS: Neighbourhood[] = [
  { name: "Flushing", borough: "QUEENS", lat: 40.7675, lng: -73.833, spread: 0.013, weight: 9 },
  {
    name: "Jackson Heights",
    borough: "QUEENS",
    lat: 40.7557,
    lng: -73.8831,
    spread: 0.012,
    weight: 8,
  },
  {
    name: "South Queens",
    borough: "QUEENS",
    lat: 40.6413,
    lng: -73.7781,
    spread: 0.014,
    weight: 7,
  },
  { name: "Astoria", borough: "QUEENS", lat: 40.7721, lng: -73.9301, spread: 0.012, weight: 8 },
  { name: "Jamaica", borough: "QUEENS", lat: 40.6943, lng: -73.8068, spread: 0.015, weight: 7 },
];

const BRONX: Neighbourhood[] = [
  { name: "South Bronx", borough: "BRONX", lat: 40.8166, lng: -73.9166, spread: 0.015, weight: 11 },
  { name: "Fordham", borough: "BRONX", lat: 40.862, lng: -73.8987, spread: 0.013, weight: 9 },
  { name: "Morris Park", borough: "BRONX", lat: 40.8448, lng: -73.8648, spread: 0.012, weight: 7 },
  { name: "Riverdale", borough: "BRONX", lat: 40.8965, lng: -73.9121, spread: 0.011, weight: 5 },
];

const STATEN_ISLAND: Neighbourhood[] = [
  {
    name: "St. George",
    borough: "STATEN ISLAND",
    lat: 40.6438,
    lng: -74.0739,
    spread: 0.012,
    weight: 4,
  },
  {
    name: "Central SI",
    borough: "STATEN ISLAND",
    lat: 40.5795,
    lng: -74.1502,
    spread: 0.016,
    weight: 4,
  },
  {
    name: "South Shore SI",
    borough: "STATEN ISLAND",
    lat: 40.515,
    lng: -74.2094,
    spread: 0.013,
    weight: 3,
  },
];

export const NEIGHBOURHOODS: Neighbourhood[] = [
  ...MANHATTAN,
  ...BROOKLYN,
  ...QUEENS,
  ...BRONX,
  ...STATEN_ISLAND,
];
