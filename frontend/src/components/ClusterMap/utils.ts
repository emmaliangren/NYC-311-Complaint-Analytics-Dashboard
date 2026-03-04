import L from "leaflet";
import type { GeoPoint } from "@/types/geo";

export const clusterIcon = (cluster: L.MarkerCluster): L.DivIcon => {
  const count = cluster.getChildCount();
  let size: number;
  let color: string;

  if (count < 10) {
    size = 30;
    color = "rgba(34,197,94,0.7)";
  } else if (count < 100) {
    size = 40;
    color = "rgba(234,179,8,0.7)";
  } else {
    size = 50;
    color = "rgba(239,68,68,0.7)";
  }

  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      border-radius:50%;
      background:${color};
      color:#fff;font-weight:700;font-size:13px;
    ">${count}</div>`,
    className: "",
    iconSize: L.point(size, size),
  });
};

export const createPopup = (point: GeoPoint): string =>
  `<div style="font-size:13px;line-height:1.5">
    <strong>${point.complaintType}</strong><br/>
    ${point.borough}<br/>
    ${point.createdDate}<br/>
    <span style="color:${point.status === "Closed" ? "#16a34a" : "#ea580c"}">${point.status}</span>
  </div>`;
