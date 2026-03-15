import { createContext, useContext, useState, type ReactNode } from "react";
import useFilterOptions from "@/components/feature/ClusterMap/components/CategoryFilter/useFilterOptions";
import type { GeoPoint } from "@/types/geopoints";
import type { ComplaintType, Borough, Status } from "@/types/api";
import type { FilterState, ActiveFilters } from "@/types/ClusterMap";

const FilterContext = createContext<FilterState | null>(null);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const { options, loading, error } = useFilterOptions();
  const [complaintType, setComplaintType] = useState<ComplaintType>();
  const [borough, setBorough] = useState<Borough>();
  const [status, setStatus] = useState<Status>();
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);

  const reset = () => {
    setComplaintType(undefined);
    setBorough(undefined);
    setStatus(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const activeEntries = (
    Object.keys({ complaintType, borough, status, dateFrom, dateTo }) as (keyof ActiveFilters)[]
  )
    .map((key) => ({ key, value: { complaintType, borough, status, dateFrom, dateTo }[key] }))
    .filter(
      (e): e is { key: keyof ActiveFilters; value: string } =>
        typeof e.value === "string" && e.value.length > 0
    );

  const setters: Record<keyof ActiveFilters, (v: undefined) => void> = {
    complaintType: setComplaintType,
    borough: setBorough,
    status: setStatus,
    dateFrom: setDateFrom,
    dateTo: setDateTo,
  };

  const removeFilter = (key: keyof ActiveFilters) => setters[key](undefined);

  const filterPoints = (points: GeoPoint[]): GeoPoint[] =>
    points.filter((p) => {
      if (complaintType && p.complaintType !== complaintType) return false;
      if (borough && p.borough !== borough) return false;
      if (status && p.status !== status) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      return true;
    });

  return (
    <FilterContext.Provider
      value={{
        complaintType,
        borough,
        status,
        dateFrom,
        dateTo,
        setComplaintType,
        setBorough,
        setStatus,
        setDateFrom,
        setDateTo,
        reset,
        removeFilter,
        activeEntries,
        options,
        loading,
        error,
        filterPoints,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = (): FilterState => {
  const c = useContext(FilterContext);
  if (!c) throw new Error("useFilters must be used within a FilterProvider");
  return c;
};
