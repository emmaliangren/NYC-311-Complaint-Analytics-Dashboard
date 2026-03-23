import { useState, useEffect } from "react";
import { fetchFilterOptions } from "@/lib/api";
import { FALLBACK_OPTIONS } from "./constants";
import type { UseFilterOptionsResult } from "./types";

const useFilterOptions = (): UseFilterOptionsResult => {
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchFilterOptions()
      .then((data) => {
        if (!cancelled) {
          const isEmpty =
            data.complaintTypes.length === 0 &&
            data.boroughs.length === 0 &&
            data.agency.length === 0 &&
            data.statuses.length === 0;
          setOptions(isEmpty ? FALLBACK_OPTIONS : data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOptions(FALLBACK_OPTIONS);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
};

export default useFilterOptions;
