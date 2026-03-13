import { useEffect, useRef, useState, useCallback } from "react";
import type { ClusterMapProps } from "@/types/ClusterMap";
import { MapController } from "./lib/MapController";
import {
  MapContainer,
  MapWrapper,
  LoadingOverlay,
  ZoomPanel,
  EmptyState,
  EdgeFade,
} from "./components";
import { MAX_ZOOM, MIN_ZOOM } from "./lib/constants";

const ClusterMap = ({ className }: ClusterMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MapController | null>(null);
  const colourByStatusRef = useRef(true);
  const panOnClusterRef = useRef(true);
  const panOnMarkerRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || controllerRef.current) return;

    const controller = new MapController({
      onLoadingChange: setLoading,
      onEmptyChange: setIsEmpty,
      onZoomChange: setZoom,
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
  }, []);

  const handleZoomIn = useCallback(() => {
    controllerRef.current?.zoomIn();
  }, []);
  const handleZoomOut = useCallback(() => {
    controllerRef.current?.zoomOut();
  }, []);
  const handleReset = useCallback(() => {
    controllerRef.current?.resetView();
  }, []);
  const handleLoadMock = useCallback(() => {
    controllerRef.current?.setUseMock(true);
  }, []);

  return (
    <MapWrapper className={className}>
      <LoadingOverlay visible={loading} />
      <ZoomPanel
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetView={handleReset}
        disableZoomIn={zoom >= MAX_ZOOM}
        disableZoomOut={zoom <= MIN_ZOOM}
      />
      {!loading && isEmpty && <EmptyState onLoadMock={handleLoadMock} />}
      <MapContainer ref={containerRef} />
      <EdgeFade />
    </MapWrapper>
  );
};

export default ClusterMap;
