import { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { fetchGeoPoints, fetchGeoPointsMock } from "@/lib/api";
import type { ClusterMapProps } from "@/types/ClusterMap";
import type { GeoPoint } from "@/types/geopoints";
import { isDark } from "@/scripts/theme";
import {
  createPopup,
  clearIconCache,
  debounce,
  markerKey,
  getMarkerColours,
  createTileLayer,
  panTo,
  setBgForTheme,
  stylePopup,
  diffMarkers,
  getFade,
  tryRefreshIcons,
} from "./lib/utils";
import {
  NYC_CENTER,
  DEFAULT_ZOOM,
  REFRESH_INTERVAL,
  MAX_ZOOM,
  MIN_ZOOM,
  CHUNK_SIZE,
  PAN_RERANK_DEBOUNCE,
  RECOLOUR_DELAY,
  MAP_OPTIONS,
  ZOOM_DELTA,
  MIN_LOAD_MS,
} from "./lib/constants";
import {
  MapContainer,
  MapWrapper,
  LoadingOverlay,
  ZoomPanel,
  EmptyState,
  MarkerDetailPanel,
  EdgeFade,
} from "./components";
import useSyncRef from "@/hooks/useSyncRef";
import useRefs from "@/hooks/useRefs";
import useSettings from "@/hooks/useSettings";
import { CLUSTER_OPTIONS } from "./lib/data";

// used to associate the geopoint data with markers without mutating Leaflet objects
const markerGeoPoints = new WeakMap<L.Marker, GeoPoint>();

type ClusterMouseEvent = L.LeafletEvent & { layer: L.MarkerCluster };

const ClusterMap = ({ className }: ClusterMapProps) => {
  const refs = useRefs();
  const settings = useSettings();
  const [dark, setDark] = useState(isDark);
  const isDarkRef = useSyncRef(dark);

  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const buildMarkers = useCallback((points: GeoPoint[], colourByStatus: boolean) => {
    if (!refs.cluster.current || !refs.map.current) return;

    const pane = refs.clusterPane.current;
    if (pane) pane.style.opacity = "0";

    let i = 0;
    const nextMap = new Map<string, L.Marker>();
    const toAdd: L.Marker[] = [];

    const processChunk = () => {
      const end = Math.min(i + CHUNK_SIZE, points.length);
      for (; i < end; i++) {
        const p = points[i];
        if (p.latitude == null || p.longitude == null) continue;
        const key = markerKey(p.latitude, p.longitude, p.complaintType);

        const existing = refs.markers.current.get(key);
        if (existing) {
          existing.setIcon(getMarkerColours(p.status, colourByStatus).normal);
          nextMap.set(key, existing);
        } else {
          const icons = getMarkerColours(p.status, colourByStatus);
          const marker = L.marker([p.latitude, p.longitude], { icon: icons.normal }).bindPopup(
            createPopup(p, isDarkRef.current),
            { autoPan: false }
          );
          markerGeoPoints.set(marker, p);

          marker.on("mouseover", () => {
            marker.setIcon(getMarkerColours(p.status, settings.colourByStatusRef.current).hovered);
            marker.openPopup();
            stylePopup(marker.getPopup()?.getElement(), isDarkRef.current);
          });

          marker.on("mouseout", () => {
            marker.setIcon(getMarkerColours(p.status, settings.colourByStatusRef.current).normal);
            marker.closePopup();
          });

          marker.on("click", () => {
            if (settings.panOnMarkerRef.current) panTo(refs.map.current, [p.latitude, p.longitude]);
          });

          nextMap.set(key, marker);
          toAdd.push(marker);
        }
      }

      if (i < points.length) {
        setTimeout(processChunk, 0);
        return;
      }

      if (!refs.cluster.current || !refs.map.current) return;
      diffMarkers(refs.cluster.current, refs.map.current, refs.markers.current, nextMap, toAdd);
      refs.markers.current = nextMap;
      if (pane) {
        requestAnimationFrame(() => {
          pane.style.transition = "opacity 0.15s ease";
          pane.style.opacity = "1";
        });
      }
      const elapsed = Date.now() - refs.loadStartRef.current;
      setTimeout(() => setLoading(false), Math.max(0, MIN_LOAD_MS - elapsed));
    };

    setTimeout(processChunk, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPoints = useCallback(async () => {
    if (refs.fetching.current) return;
    refs.fetching.current = true;

    try {
      const fetchFn = settings.useMockRef.current ? fetchGeoPointsMock : fetchGeoPoints;
      const points = await fetchFn();
      if (!refs.cluster.current || !refs.map.current) {
        setLoading(false);
        return;
      }

      setIsEmpty(points.length === 0 && !settings.useMockRef.current);
      refs.cachedPoints.current = points;
      buildMarkers(points, settings.colourByStatusRef.current);
    } finally {
      refs.fetching.current = false;
    }
  }, [buildMarkers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!refs.map.current || !refs.cluster.current) return;
    setLoading(true);
    let id: ReturnType<typeof setTimeout>;
    const raf = requestAnimationFrame(() => {
      id = setTimeout(() => {
        if (!refs.cluster.current || !refs.map.current) return;
        buildMarkers(refs.cachedPoints.current, settings.colourByStatus);
      }, RECOLOUR_DELAY);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [settings.colourByStatus, buildMarkers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!refs.map.current || !refs.cluster.current) return;
    setLoading(true);
    refs.cluster.current.clearLayers();
    refs.markers.current.clear();
    clearIconCache();
    loadPoints();
  }, [settings.useMock, loadPoints]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!refs.container.current || refs.map.current) return;

    refs.map.current = L.map(refs.container.current, MAP_OPTIONS).setView(NYC_CENTER, DEFAULT_ZOOM);
    setBgForTheme(refs.container.current, dark);
    refs.tileLayer.current = createTileLayer(dark).addTo(refs.map.current);
    refs.cluster.current = L.markerClusterGroup(CLUSTER_OPTIONS);
    refs.map.current.addLayer(refs.cluster.current);

    refs.cluster.current.on("clusterclick", (e: ClusterMouseEvent) => {
      L.DomEvent.stop(e);
      if (!refs.map.current) return;

      const center = e.layer.getLatLng();
      const nextZoom = refs.map.current.getZoom() + ZOOM_DELTA;

      if (settings.panOnClusterRef.current) {
        refs.map.current.flyTo(center, nextZoom, {
          duration: 0.6,
          easeLinearity: 0.15,
        });
      } else {
        refs.map.current.setZoom(nextZoom, { animate: true });
      }
    });

    refs.cluster.current.on("clustermouseover", (e: ClusterMouseEvent) => {
      if (!refs.map.current) return;

      const children = e.layer.getAllChildMarkers();
      const counts = new Map<string, number>();
      for (const m of children) {
        const point = markerGeoPoints.get(m as L.Marker);
        const type = point?.complaintType;
        if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
      }
    });

    refs.clusterPane.current = refs.cluster.current.getPane() ?? null;
    const clusterPane = refs.clusterPane.current;
    if (clusterPane) clusterPane.style.transition = "opacity 0.15s ease";

    refs.map.current.on("zoomanim", () => {
      if (clusterPane) {
        clusterPane.style.transition = "opacity 0.25s ease-out";
        clusterPane.style.opacity = "0";
      }
    });

    refs.map.current.on("zoomend", () => {
      tryRefreshIcons(refs.cluster.current, refs.map.current);
      if (clusterPane) {
        clusterPane.style.opacity = "0";
        requestAnimationFrame(() => {
          clusterPane.style.transition = "opacity 0.5s ease-in";
          clusterPane.style.opacity = "1";
        });
      }
      setZoom(refs.map.current!.getZoom());
    });

    const debouncedPanRerank = debounce(() => {
      tryRefreshIcons(refs.cluster.current, refs.map.current);
    }, PAN_RERANK_DEBOUNCE);

    refs.map.current.on("click", () => setSelectedPoint(null));
    refs.map.current.on("moveend", debouncedPanRerank);

    loadPoints();
    const interval = setInterval(loadPoints, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      debouncedPanRerank.cancel();
      refs.markers.current.clear();
      clearIconCache();
      refs.map.current?.remove();
      refs.map.current = null;
      refs.cluster.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetView = () => {
    if (!refs.map.current) return;
    refs.map.current.setView(NYC_CENTER, DEFAULT_ZOOM, { animate: false });
  };

  return (
    <MapWrapper className={className}>
      <LoadingOverlay visible={loading} />
      <ZoomPanel
        zoomIn={() => refs.map.current?.zoomIn()}
        zoomOut={() => refs.map.current?.zoomOut()}
        resetView={resetView}
        disableZoomIn={zoom >= MAX_ZOOM}
        disableZoomOut={zoom <= MIN_ZOOM}
      />
      {!loading && isEmpty && <EmptyState onLoadMock={() => settings.setUseMock(true)} />}
      {selectedPoint && (
        <MarkerDetailPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
      <MapContainer ref={refs.container} />
      <EdgeFade colour={getFade(dark)} />
    </MapWrapper>
  );
};

export default ClusterMap;
