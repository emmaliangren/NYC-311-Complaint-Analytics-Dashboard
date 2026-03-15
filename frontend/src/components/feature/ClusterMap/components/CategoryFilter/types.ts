import type { Borough, ComplaintType, Status } from "@/types/api";
import type { FilterOptionsResponse } from "@/types/ClusterMap";

export type FilterKey = keyof FilterOptionsResponse;
export type FilterValue = ComplaintType | Borough | Status;

export interface FilterProps<T extends FilterValue = FilterValue> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  loading: boolean;
  error: boolean;
}

export interface UseFilterOptionsResult {
  options: FilterOptionsResponse;
  loading: boolean;
  error: boolean;
}

export interface FilterDropdownProps<T extends FilterValue> {
  id: string;
  label: string;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  options: readonly T[];
  loading: boolean;
  error: boolean;
  defaultLabel?: string;
}
