import type L from "leaflet";
import { clusterIcon } from "./utils";
import { MAX_ZOOM } from "./constants";

export const CLUSTER_OPTIONS: L.MarkerClusterGroupOptions = {
  iconCreateFunction: clusterIcon,
  chunkedLoading: false,
  animate: false,
  showCoverageOnHover: false,
  disableClusteringAtZoom: MAX_ZOOM,
  zoomToBoundsOnClick: false,
};
