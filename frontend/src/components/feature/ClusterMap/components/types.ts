export interface EdgeFadeProps {
  colour: string;
}

export interface TooltipProps {
  label: string;
}

export interface EmptyStateProps {
  onLoadMock?: () => void;
  filtersActive?: boolean;
}

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export interface Filter {
  key: string;
  label: string;
  active: boolean;
}

export interface FilterPanelProps {
  filters: Filter[];
  onAddFilter: (key: string) => void;
  onRemoveFilter: (key: string) => void;
  onResetFilters: () => void;
}
