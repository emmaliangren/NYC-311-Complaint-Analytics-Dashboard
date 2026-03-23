import type { Agency, UseResolutionTimeResult, ResolutionTimeDto } from "@/types/agency";
import { useState, useEffect } from "react";
import { parseResolutionTime } from "@/lib/agency";
import { ENDPOINTS } from "@/lib/api.constants";

export const useResolutionTime = (agency: Agency | undefined): UseResolutionTimeResult => {
  const [data, setData] = useState<ResolutionTimeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      setIsError(false);
      try {
        const url = agency
          ? `${ENDPOINTS.resolutionTime}?agency=${encodeURIComponent(agency)}`
          : ENDPOINTS.resolutionTime;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(parseResolutionTime(json).filter((d) => d.medianMinutes > 0));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setIsError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [agency]);

  return { data, isLoading, isError };
};
