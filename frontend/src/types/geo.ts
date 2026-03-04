export interface GeoPoint {
  uniqueKey: string;
  latitude: number;
  longitude: number;
  complaintType: string;
  borough: string;
  createdDate: string;
  status: string;
}

export interface DataRefresh {
  refreshCompletedAt: string;
  recordsProcessed: number;
  status: string;
}
