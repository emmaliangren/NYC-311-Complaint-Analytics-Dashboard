import type { Map } from "leaflet";
import type { ComplaintType, Borough, Status } from "./api";
import type { GeoPoint } from "./geopoints";
import type { ReactNode } from "react";
import type { SummaryProps } from "@/components/feature/ClusterMap/components/FilterPanel/types";

export interface ClusterMapProps {
  className?: string;
}

export interface FilterOptionsResponse {
  complaintTypes: ComplaintType[];
  boroughs: Borough[];
  statuses: Status[];
}

export interface ZoomPanelProps {
  zoomIn: () => Map | undefined;
  zoomOut: () => Map | undefined;
  resetView: () => void;
  disableZoomIn: boolean;
  disableZoomOut: boolean;
}

export interface ActiveFilterBadgeProps {
  filterKey: string;
  label: string;
  onRemove: (filterKey: string) => void;
}

export interface FilterResetButtonProps {
  onClick: () => void;
}

export interface ActiveFilter {
  key: string;
  label: string;
}

export interface QueryFilters {
  borough: string;
  complaintType: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface QueryFilterOptions {
  boroughs: string[];
  complaintTypes: string[];
  statuses: string[];
}

export interface FilterPanelProps extends SummaryProps {
  children: ReactNode;
  isExpanded?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  spotlight?: boolean;
  activeTab?: "filters" | "active";
  onTabChange?: (tab: "filters" | "active") => void;
}

export interface TooltipProps {
  label: string;
}

export interface MarkerDetailPanelProps {
  point: GeoPoint;
  onClose: () => void;
}

export interface EmptyStateProps {
  onLoadMock: () => void;
}

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export interface EdgeFadeProps {
  colour: string;
}

export interface ActiveFilters {
  complaintType: ComplaintType | undefined;
  borough: Borough | undefined;
  status: Status | undefined;
  dateFrom: string | undefined;
  dateTo: string | undefined;
}

export interface FilterState extends ActiveFilters {
  setComplaintType: (value: ComplaintType | undefined) => void;
  setBorough: (value: Borough | undefined) => void;
  setStatus: (value: Status | undefined) => void;
  setDateFrom: (value: string | undefined) => void;
  setDateTo: (value: string | undefined) => void;
  reset: () => void;
  removeFilter: (key: keyof ActiveFilters) => void;
  activeEntries: { key: keyof ActiveFilters; value: string }[];
  options: FilterOptionsResponse;
  loading: boolean;
  error: boolean;
  filterPoints: (points: GeoPoint[]) => GeoPoint[];
}
