import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { cn } from "@/lib/util";
import { fetchGeoPoints } from "@/lib/api";
import Loader from "@/components/Loader";
import type { ClusterMapProps } from "@/types/ClusterMap";
import { clusterIcon, createPopup } from "./utils";
import { NYC_BOUNDS, NYC_CENTER, DEFAULT_ZOOM, REFRESH_INTERVAL } from "./constants";

export default function ClusterMap({ className }: ClusterMapProps) {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  const loadPoints = async () => {
    const points = await fetchGeoPoints();

    if (!clusterRef.current) return;
    clusterRef.current.clearLayers();

    points.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude]).bindPopup(createPopup(point));
      clusterRef.current!.addLayer(marker);
    });

    setLoading(false);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      maxBounds: NYC_BOUNDS,
      maxBoundsViscosity: 0.8,
      minZoom: 10,
      maxZoom: 18,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 80,
    }).setView(NYC_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    clusterRef.current = L.markerClusterGroup({ iconCreateFunction: clusterIcon });
    mapRef.current.addLayer(clusterRef.current);

    loadPoints();

    const interval = setInterval(loadPoints, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []);

  return (
    <div
      data-testid="cluster-map-wrapper"
      className={cn("relative h-[600px] w-full rounded-xl", className)}
    >
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-xl bg-white/80">
          <Loader label="Loading complaints…" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full rounded-xl" data-testid="cluster-map" />
    </div>
  );
}
