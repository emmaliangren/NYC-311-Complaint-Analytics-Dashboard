import { useEffect, useState, type RefObject } from "react";
import type L from "leaflet";
import { DEFAULT_ZOOM } from "@/components/feature/ClusterMap/lib/constants";

const useZoomTracker = (mapRef: RefObject<L.Map | null>) => {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateZoom = () => setZoom(map.getZoom());
    map.on("zoomend", updateZoom);

    return () => {
      map.off("zoomend", updateZoom);
    };
  }, [mapRef]);

  return zoom;
};

export default useZoomTracker;
