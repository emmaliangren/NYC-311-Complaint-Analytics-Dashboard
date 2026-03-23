import { usePersistedState } from "@/hooks/usePersistedState";
import { AGENCY_STORAGE_KEY, isAgency } from "@/lib/agency";
import type { Agency } from "@/types/agency";

export const usePersistedAgency = () => {
  const { value, setValue } = usePersistedState(AGENCY_STORAGE_KEY);

  const agency: Agency | undefined = value !== undefined && isAgency(value) ? value : undefined;

  const setAgency = (next: Agency | undefined) => setValue(next);

  return { agency, setAgency };
};
