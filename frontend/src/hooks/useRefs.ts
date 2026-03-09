import { useRef } from "react";
import type L from "leaflet";
import type { GeoPoint } from "@/types/geopoints";

const useMapRefs = () => {
  const map = useRef<L.Map | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const cluster = useRef<L.MarkerClusterGroup | null>(null);
  const clusterPane = useRef<HTMLElement | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const markers = useRef<Map<string, L.Marker>>(new Map());
  const cachedPoints = useRef<GeoPoint[]>([]);
  const loadStartRef = useRef(Date.now());

  const fetching = useRef(false);

  return {
    map,
    container,
    cluster,
    clusterPane,
    tileLayer,
    markers,
    cachedPoints,
    fetching,
    loadStartRef,
  };
};

export default useMapRefs;
