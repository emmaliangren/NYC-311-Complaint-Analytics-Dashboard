import type { ActiveFilters } from "@/types/ClusterMap";
import type { ReactNode } from "react";

export interface ButtonProps {
  onClick: () => void;
  isExpanded: boolean;
}

export interface ActiveFilterBadgeProps {
  filterKey: keyof ActiveFilters;
  label: string;
  onRemove: (key: keyof ActiveFilters) => void;
}

export interface SummaryProps {
  totalCount: number;
  filteredCount: number;
  viewportCount: number;
}

type ValidTabs = "filters" | "active";

export interface FilterPanelBodyProps {
  isExpanded: boolean;
  activeTab: ValidTabs;
  children: ReactNode;
  totalCount: number;
  filteredCount: number;
  viewportCount: number;
  onTabChange: (tab: ValidTabs) => void;
  onHide: () => void;
}

export interface FilterPanelProps extends SummaryProps {
  children: ReactNode;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  spotlight?: boolean;
  activeTab: "filters" | "active";
  onTabChange: (tab: "filters" | "active") => void;
}

export interface PanelButtonsProps {
  isExpanded: boolean;
  onClick: () => void;
}
