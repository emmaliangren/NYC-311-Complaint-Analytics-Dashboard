import type { GeoPoint, FilterState, ActiveFilters, ComplaintType, Borough, Status } from "@/types";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import useFilterOptions from "@/components/feature/ClusterMap/components/CategoryFilter/useFilterOptions";
import { usePersistedAgency, useResolutionTime } from "@/api/resolutionTime";
import { usePersistedState } from "@/hooks/usePersistedState";
import { MOCK_RESOLUTION_TIME } from "@/api/resolutionTime/mock";
import type { MapFilterKey } from "@/types/ClusterMap";

const FilterContext = createContext<FilterState | null>(null);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const { options, loading: FilterLoading, error: FilterError } = useFilterOptions();
  const {
    data: fetchedData,
    isLoading: ResolutionLoading,
    isError: ResolutionError,
  } = useResolutionTime(undefined);

  const { value: complaintType, setValue: setComplaintType } =
    usePersistedState<ComplaintType>("filter:complaintType");
  const { value: borough, setValue: setBorough } = usePersistedState<Borough>("filter:borough");
  const { value: status, setValue: setStatus } = usePersistedState<Status>("filter:status");
  const { value: dateFrom, setValue: setDateFrom } = usePersistedState("filter:dateFrom");
  const { value: dateTo, setValue: setDateTo } = usePersistedState("filter:dateTo");
  const { agency, setAgency } = usePersistedAgency();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const allData = fetchedData.length > 0 ? fetchedData : MOCK_RESOLUTION_TIME;

  const reset = () => {
    setComplaintType(undefined);
    setBorough(undefined);
    setStatus(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setAgency(undefined);
  };

  const isLoading = ResolutionLoading || FilterLoading;
  const isError = ResolutionError || FilterError;

  const activeAgencies = useMemo(() => new Set(allData.map((d) => d.agency)), [allData]);

  const activeEntries = (
    Object.keys({
      complaintType,
      borough,
      status,
      dateFrom,
      dateTo,
    }) as MapFilterKey[]
  )
    .map((key) => ({
      key,
      value: { complaintType, borough, status, dateFrom, dateTo }[key],
    }))
    .filter(
      (e): e is { key: MapFilterKey; value: string } =>
        typeof e.value === "string" && e.value.length > 0
    );

  const setters: Record<keyof ActiveFilters, (v: undefined) => void> = {
    complaintType: setComplaintType,
    borough: setBorough,
    status: setStatus,
    dateFrom: setDateFrom,
    dateTo: setDateTo,
    agency: setAgency,
  };

  const removeFilter = (key: keyof ActiveFilters) => setters[key](undefined);

  const filterPoints = (points: GeoPoint[]): GeoPoint[] =>
    points.filter((p) => {
      if (complaintType && p.complaintType !== complaintType) return false;
      if (borough && p.borough !== borough) return false;
      if (status && p.status !== status) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      if (agency && p.agency !== agency) return false;
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
        setAgency,
        agency,
        reset,
        removeFilter,
        activeAgencies,
        activeEntries,
        data: allData,
        options,
        isLoading,
        isError,
        filterPoints,
        isWalkthroughOpen,
        setIsWalkthroughOpen,
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
