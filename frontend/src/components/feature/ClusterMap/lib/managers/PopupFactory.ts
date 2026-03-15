import { STATUS_FILLS } from "./constants";
import type { GeoPoint } from "@/types/geopoints";

export class PopupFactory {
  createHTML(point: GeoPoint): string {
    const { colour } = STATUS_FILLS[point.status] ?? STATUS_FILLS.default;
    return `<div style="font-size:13px;line-height:1.6">
  <span style="color:#1e1e2e;font-weight:700;display:block">${point.complaintType}</span>
  <span style="color:#6b7280;display:block">${point.borough}</span>
  <span style="color:#6b7280;display:block">${point.createdDate}</span>
  <span style="color:${colour};font-weight:600;display:block">${point.status}</span>
</div>`;
  }

  styleElement(popup: HTMLElement | undefined): void {
    const wrapper = popup?.querySelector<HTMLElement>(".leaflet-popup-content-wrapper");
    if (wrapper) wrapper.style.borderRadius = "2px";
  }
}
