import type L from "leaflet";
import { clusterIcon } from "./utils";

export const CLUSTER_OPTIONS: L.MarkerClusterGroupOptions = {
  iconCreateFunction: clusterIcon,

  chunkedLoading: false,

  animate: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: false,

  spiderfyOnMaxZoom: false,
  spiderfyDistanceMultiplier: 1.8,

  maxClusterRadius: (zoom: number) => {
    if (zoom >= 16) return 25;
    if (zoom >= 14) return 40;
    if (zoom >= 12) return 55;
    return 80;
  },
};
