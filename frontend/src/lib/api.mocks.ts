import type { DataRefresh } from "@/types/logs";
import { MOCK_POINTS } from "./api.constants";

export const MOCK_REFRESH: DataRefresh = {
  refreshCompletedAt: "2025-03-05T09:00:00Z",
  recordsProcessed: MOCK_POINTS.length,
  status: "completed",
};
