import type { GeoPoint } from "@/types/geopoints";

type Status = "Open" | "Closed" | "In Progress" | "Assigned" | "Started" | "Pending";

// seeded PRNG (mulberry32) for deterministic mock data
let _seed = 42;
function rng(): number {
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function gauss(stddev: number): number {
  const u = 1 - rng();
  const v = rng();
  return stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const COMPLAINT_TYPES = [
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
] as const;

const STATUSES: Status[] = [
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

export const BOROUGHS = ["MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "STATEN ISLAND"] as const;
export type Borough = (typeof BOROUGHS)[number];

function randomDate(): string {
  const now = new Date("2025-03-05");
  const past = new Date("2024-09-01");
  const ms = past.getTime() + rng() * (now.getTime() - past.getTime());
  return new Date(ms).toISOString().slice(0, 10);
}

const NEIGHBOURHOODS: {
  name: string;
  borough: Borough;
  lat: number;
  lng: number;
  spread: number;
  weight: number;
}[] = [
  // Manhattan — very dense
  { name: "Midtown", borough: "MANHATTAN", lat: 40.7549, lng: -73.984, spread: 0.018, weight: 18 },
  {
    name: "Lower East Side",
    borough: "MANHATTAN",
    lat: 40.7157,
    lng: -73.9863,
    spread: 0.012,
    weight: 14,
  },
  { name: "Harlem", borough: "MANHATTAN", lat: 40.8116, lng: -73.9465, spread: 0.016, weight: 13 },
  {
    name: "Washington Heights",
    borough: "MANHATTAN",
    lat: 40.8448,
    lng: -73.9393,
    spread: 0.014,
    weight: 10,
  },
  {
    name: "Upper West Side",
    borough: "MANHATTAN",
    lat: 40.787,
    lng: -73.9754,
    spread: 0.013,
    weight: 10,
  },
  {
    name: "Greenwich Village",
    borough: "MANHATTAN",
    lat: 40.7336,
    lng: -74.0027,
    spread: 0.01,
    weight: 9,
  },
  {
    name: "Financial District",
    borough: "MANHATTAN",
    lat: 40.7074,
    lng: -74.0113,
    spread: 0.009,
    weight: 7,
  },
  {
    name: "East Village",
    borough: "MANHATTAN",
    lat: 40.7265,
    lng: -73.9815,
    spread: 0.009,
    weight: 8,
  },
  // Brooklyn
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
  // Queens
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
  // Bronx
  { name: "South Bronx", borough: "BRONX", lat: 40.8166, lng: -73.9166, spread: 0.015, weight: 11 },
  { name: "Fordham", borough: "BRONX", lat: 40.862, lng: -73.8987, spread: 0.013, weight: 9 },
  { name: "Morris Park", borough: "BRONX", lat: 40.8448, lng: -73.8648, spread: 0.012, weight: 7 },
  { name: "Riverdale", borough: "BRONX", lat: 40.8965, lng: -73.9121, spread: 0.011, weight: 5 },
  // Staten Island
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

const totalWeight = NEIGHBOURHOODS.reduce((s, n) => s + n.weight, 0);
function pickNeighbourhood() {
  let r = rng() * totalWeight;
  for (const n of NEIGHBOURHOODS) {
    r -= n.weight;
    if (r <= 0) return n;
  }
  return NEIGHBOURHOODS[NEIGHBOURHOODS.length - 1];
}

const TOTAL = 1800;

export const MOCK_POINTS: GeoPoint[] = Array.from({ length: TOTAL }, (_, i) => {
  const n = pickNeighbourhood();

  const isOutlier = rng() < 0.06;
  const spread = isOutlier ? n.spread * 4.5 : n.spread;

  const lat = n.lat + gauss(spread);
  const lng = n.lng + gauss(spread * 1.1);

  const colocated = rng() < 0.08;
  const snapJitter = 0.00005;

  return {
    uniqueKey: String(i + 1),
    latitude: colocated ? Math.round(lat / snapJitter) * snapJitter : lat,
    longitude: colocated ? Math.round(lng / snapJitter) * snapJitter : lng,
    complaintType: pick(COMPLAINT_TYPES),
    borough: n.borough,
    status: pick(STATUSES),
    createdDate: randomDate(),
  };
});
