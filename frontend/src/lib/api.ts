import type { HealthCheck } from "../types/api";
import { logError } from "./util";

export const checkHealth = async (): Promise<HealthCheck> => {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logError(error);
    return { status: "error" };
  }
};
