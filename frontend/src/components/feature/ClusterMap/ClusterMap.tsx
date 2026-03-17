import { useEffect, useRef, useState, useCallback } from "react";
import { MapController } from "./lib/MapController";
import {
  MapContainer,
  MapWrapper,
  LoadingOverlay,
  ZoomPanel,
  EmptyState,
  EdgeFade,
  LoadingBar,
} from "./components";
import { MAX_ZOOM, MIN_ZOOM, TOAST_MESSAGE, TOAST_TIMER } from "./lib/constants";
import { FilterPanel } from "./components/FilterPanel";
import { useFilters } from "@/context/FilterProvider";
import DateRangeFilter from "@/components/feature/ClusterMap/components/DateRangeFilter";
import { CategoryFilter } from "./components/CategoryFilter";
import type { ActiveTab, ClusterMapProps } from "@/types/ClusterMap";
import ToastMessage from "@/components/ui/Popup";
import SpotlightTip from "./components/Spotlight";

const ClusterMap = ({ className, walkthroughOpen, setWalkthroughOpen }: ClusterMapProps) => {
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<MapController | null>(null);

  const isReloadingRef = useRef(false);
  const hasEverHadDataRef = useRef(false);

  const isInitialLoadRef = useRef(true);
  const colourByStatusRef = useRef(true);
  const panOnClusterRef = useRef(true);
  const panOnMarkerRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [softLoading, setSoftLoading] = useState(false);

  const [isEmpty, setIsEmpty] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterActiveTab, setFilterActiveTab] = useState<ActiveTab>("filters");
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isAtDefault, setIsAtDefault] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [viewportCount, setViewportCount] = useState(0);
  const [showNoResults, setShowNoResults] = useState(false);

  const filters = useFilters();

  useEffect(() => {
    if (filteredCount === 0 && filters.activeEntries.length > 0) {
      setShowNoResults(true);
    }
  }, [filteredCount, filters.activeEntries.length]);

  useEffect(() => {
    if (!isEmpty || softLoading || loading) {
      setShowEmpty(false);
      return;
    }
    const timer = setTimeout(() => setShowEmpty(true), 150);
    return () => clearTimeout(timer);
  }, [isEmpty, softLoading, loading]);

  const handleEmptyChange = useCallback((empty: boolean) => {
    if (empty && isReloadingRef.current) return;
    if (!empty) hasEverHadDataRef.current = true;
    setIsEmpty(empty);
  }, []);

  const handleLoadingChange = useCallback((isLoading: boolean) => {
    if (isInitialLoadRef.current) {
      setLoading(isLoading);
      if (!isLoading) isInitialLoadRef.current = false;
    } else {
      isReloadingRef.current = isLoading;
      setSoftLoading(isLoading);
      if (isLoading) setIsEmpty(false);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || controllerRef.current) return;
    const controller = new MapController({
      onLoadingChange: handleLoadingChange,
      onEmptyChange: handleEmptyChange,
      onZoomChange: setZoom,
      onPointsChange: (total, filtered) => {
        setTotalCount(total);
        setFilteredCount(filtered);
      },
      onViewportCountChange: setViewportCount,
      onViewChange: (atDefault) => setIsAtDefault(atDefault),
      getColourByStatus: () => colourByStatusRef.current,
      getPanOnMarker: () => panOnMarkerRef.current,
      getPanOnCluster: () => panOnClusterRef.current,
    });
    controllerRef.current = controller;
    controller.mount(el);
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [handleEmptyChange, handleLoadingChange]);

  useEffect(() => {
    controllerRef.current?.applyFilters({
      borough: filters.borough,
      complaintType: filters.complaintType,
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }, [filters.borough, filters.complaintType, filters.status, filters.dateFrom, filters.dateTo]);

  const handleZoomIn = useCallback(() => controllerRef.current?.zoomIn(), []);

  const handleZoomOut = useCallback(() => controllerRef.current?.zoomOut(), []);

  const handleReset = useCallback(() => {
    controllerRef.current?.resetView();
    setIsAtDefault(true);
  }, []);

  const handleLoadMock = useCallback(() => {
    controllerRef.current?.setUseMock(true);
  }, []);

  return (
    <MapWrapper className={className}>
      <MapContainer ref={containerRef} />
      {walkthroughOpen && <div className="absolute inset-0 z-[9997]" />}
      <EdgeFade />
      <LoadingOverlay visible={loading} />
      <LoadingBar visible={softLoading} />
      {showEmpty && filters.activeEntries.length === 0 && (
        <EmptyState onLoadMock={hasEverHadDataRef.current ? undefined : handleLoadMock} />
      )}
      <ToastMessage
        variant="info"
        visible={filteredCount === 0 && showNoResults}
        onClose={() => setShowNoResults(false)}
        message={TOAST_MESSAGE}
        duration={TOAST_TIMER}
      />
      <ZoomPanel
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetView={handleReset}
        disableZoomIn={zoom >= MAX_ZOOM || walkthroughOpen}
        disableZoomOut={zoom <= MIN_ZOOM || walkthroughOpen}
        disableReset={isAtDefault || walkthroughOpen}
      />
      <FilterPanel
        ref={filterPanelRef}
        isExpanded={filterOpen}
        onExpand={() => setFilterOpen(true)}
        onCollapse={() => {
          if (!walkthroughOpen) setFilterOpen(false);
        }}
        spotlight={walkthroughOpen}
        activeTab={filterActiveTab}
        onTabChange={setFilterActiveTab}
        totalCount={totalCount}
        filteredCount={filteredCount}
        viewportCount={viewportCount}
      >
        <div data-walkthrough="category-filter">
          <CategoryFilter />
        </div>

        <div data-walkthrough="date-range-filter">
          <DateRangeFilter />
        </div>
      </FilterPanel>
      <SpotlightTip
        id="filter-panel-v1"
        targetRef={filterPanelRef}
        onOpenChange={setWalkthroughOpen}
        steps={[
          {
            title: "Open the filter panel",
            description: "Click the filter icon in the top-left of the map to open the panel.",
            onEnter: () => {
              setFilterOpen(false);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='toggle-button']",
          },
          {
            title: "Filter by group",
            description: "Use the dropdowns to filter by complaint type, borough, and/or status.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='category-filter']",
          },
          {
            title: "Filter by date range",
            description:
              "Pick a start and/or end date to narrow complaints to a specific time period.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='date-range-filter']",
          },
          {
            title: "Review active filters",
            description:
              "Switch to the Active tab to see all applied filters and reset them individually.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("active");
            },
            highlightSelector: "[data-walkthrough='active-filters']",
          },
        ]}
        onDismiss={() => setFilterOpen(false)}
      />
    </MapWrapper>
  );
};

export default ClusterMap;
