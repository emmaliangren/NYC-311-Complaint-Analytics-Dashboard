import type { DataRefresh } from "@/types/logs";
import { MOCK_POINTS } from "./util";

export const MOCK_REFRESH: DataRefresh = {
  refreshStartedAt: new Date().toISOString(),
  refreshCompletedAt: new Date().toISOString(),
  recordsProcessed: MOCK_POINTS.length,
  status: "completed",
};
