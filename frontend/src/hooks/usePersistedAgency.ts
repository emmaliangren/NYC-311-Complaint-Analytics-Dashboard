import { useState, useEffect } from "react";
import { AGENCY_STORAGE_KEY } from "./constants";
import type { Agency } from "@/types";

export const usePersistedAgency = () => {
  const [agency, setAgencyState] = useState<Agency | undefined>(() => {
    return (localStorage.getItem(AGENCY_STORAGE_KEY) as Agency) ?? undefined;
  });

  useEffect(() => {
    if (agency !== undefined) {
      localStorage.setItem(AGENCY_STORAGE_KEY, agency);
    } else {
      localStorage.removeItem(AGENCY_STORAGE_KEY);
    }
  }, [agency]);

  const setAgency = (value: Agency | undefined) => setAgencyState(value);

  return { agency, setAgency };
};
