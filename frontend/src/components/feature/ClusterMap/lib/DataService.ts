import type { GeoPoint } from "@/types/geopoints";
import { fetchGeoPoints, fetchGeoPointsMock } from "@/lib/api";

/**
 * encapsulates data-fetching logic and guards against concurrent requests.
 */
export class DataService {
  private fetching = false;
  private useMock: boolean;

  constructor(useMock = false) {
    this.useMock = useMock;
  }

  setUseMock(value: boolean): void {
    this.useMock = value;
  }

  getUseMock(): boolean {
    return this.useMock;
  }

  isFetching(): boolean {
    return this.fetching;
  }

  async fetchPoints(): Promise<GeoPoint[]> {
    if (this.fetching) return [];
    this.fetching = true;

    try {
      const fetchFn = this.useMock ? fetchGeoPointsMock : fetchGeoPoints;
      return await fetchFn();
    } finally {
      this.fetching = false;
    }
  }
}
