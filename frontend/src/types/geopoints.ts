import type { Status } from "./api";

export interface GeoPoint {
  uniqueKey: string;
  latitude: number;
  longitude: number;
  complaintType: string;
  borough: string;
  createdDate: string;
  status: Status;
}
