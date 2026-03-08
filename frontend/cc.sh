#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  restructure-clustermap.sh
#
#  Extracts all sub-components out of ClusterMap.tsx into a clean
#  components/ subfolder structure.
#
#  Usage:
#    chmod +x restructure-clustermap.sh
#    ./restructure-clustermap.sh path/to/ClusterMap   # folder that contains ClusterMap.tsx
#
#  What it does:
#    1. Backs up ClusterMap.tsx → ClusterMap.tsx.bak
#    2. Creates components/ and components/SettingsModal/
#    3. Writes each extracted component as its own file
#    4. Rewrites ClusterMap.tsx to import from the new locations
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="${1:-.}"

if [[ ! -f "$DIR/ClusterMap.tsx" ]]; then
  echo "❌  ClusterMap.tsx not found in $DIR"
  exit 1
fi

echo "📦  Backing up ClusterMap.tsx → ClusterMap.tsx.bak"
cp "$DIR/ClusterMap.tsx" "$DIR/ClusterMap.tsx.bak"

echo "📁  Creating directory structure"
mkdir -p "$DIR/components/SettingsModal"

# ═══════════════════════════════════════════════════════════════
#  components/ZoomPanel.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/ZoomPanel.tsx" << 'EOF'
import { FiPlus, FiMinus, FiCompass } from "react-icons/fi";
import type { ZoomPanelProps } from "@/types/ClusterMap";
import Button from "../../Button";

export default function ZoomPanel({ zoomIn, zoomOut, resetView, disableZoomIn, disableZoomOut }: ZoomPanelProps) {
  return (
    <div className="absolute right-3 top-3 z-[800] flex flex-col gap-2">
      <div className="flex flex-col overflow-hidden rounded border border-slate-200 bg-white/85 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/80">
        <Button
          onClick={zoomIn}
          disabled={disableZoomIn}
          variant="icon"
          className="bg-transparent transition hover:bg-white/40 active:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-white/10 dark:active:bg-white/20 dark:disabled:hover:bg-transparent"
        >
          <FiPlus size={18} className="text-slate-700 dark:text-slate-200" />
        </Button>
        <div className="h-px bg-slate-200 dark:bg-white/10" />
        <Button
          onClick={zoomOut}
          disabled={disableZoomOut}
          variant="icon"
          className="bg-transparent transition hover:bg-white/40 active:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-white/10 dark:active:bg-white/20 dark:disabled:hover:bg-transparent"
        >
          <FiMinus size={18} className="text-slate-700 dark:text-slate-200" />
        </Button>
      </div>
      <div className="group relative">
        <div className="overflow-hidden rounded border border-slate-200 bg-white/85 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/80">
          <Button
            onClick={resetView}
            variant="icon"
            className="bg-transparent transition hover:bg-white/40 active:bg-white/60 dark:hover:bg-white/10 dark:active:bg-white/20"
          >
            <FiCompass size={18} className="text-slate-700 dark:text-slate-200" />
          </Button>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-full mt-1 rounded bg-slate-50 dark:bg-[#0d0d0d]/70 px-2 py-1 text-xs font-black text-gray-600 dark:text-gray-100 opacity-0 transition group-hover:opacity-100">
          Reset
        </div>
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/LoadingOverlay.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/LoadingOverlay.tsx" << 'EOF'
import Loader from "@/components/Loader";
import type { LoadingOverlayProps } from "@/types/ClusterMap";
import { LOADING_LABEL } from "../constants";

const LoadingOverlay = ({ visible, label = LOADING_LABEL }: LoadingOverlayProps) => (
  <div
    className="absolute inset-0 z-[1000] flex items-center justify-center rounded bg-white/80 dark:bg-[#0a1628]/80 transition-opacity duration-200"
    style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
  >
    {visible && <Loader size="md" label={label} />}
  </div>
);

export default LoadingOverlay;
EOF

# ═══════════════════════════════════════════════════════════════
#  components/EdgeFade.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/EdgeFade.tsx" << 'EOF'
import type { EdgeFadeProps } from "@/types/ClusterMap";

const EdgeFade = ({ colour }: EdgeFadeProps) => (
  <div
    className="pointer-events-none absolute inset-0 rounded"
    style={{
      background: `
        linear-gradient(to bottom, ${colour} 0%, transparent 18%),
        linear-gradient(to top,    ${colour} 0%, transparent 18%),
        linear-gradient(to right,  ${colour} 0%, transparent 14%),
        linear-gradient(to left,   ${colour} 0%, transparent 14%)
      `,
    }}
  />
);

export default EdgeFade;
EOF

# ═══════════════════════════════════════════════════════════════
#  components/MarkerDetailPanel.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/MarkerDetailPanel.tsx" << 'EOF'
import type { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";
import type { MarkerDetailPanelProps } from "@/types/ClusterMap";
import Button from "../../Button";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{children}</span>
    </div>
  );
}

export default function MarkerDetailPanel({ point, onClose }: MarkerDetailPanelProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-[900] w-[300px] -translate-x-1/2 rounded border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/95">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {point.complaintType}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{point.borough}</p>
        </div>
        <Button
          onClick={onClose}
          variant="icon"
          size="sm"
          className="mt-0.5 shrink-0 rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
        >
          <FaTimes />
        </Button>
      </div>

      <div className="px-4 py-3 space-y-2">
        <Row label="Status">
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium">
            {point.status}
          </span>
        </Row>
        <Row label="Opened">{point.createdDate}</Row>
        <Row label="Coordinates">
          {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
        </Row>
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsButton.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsButton.tsx" << 'EOF'
import { FaTimes } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import type { SettingsButtonProps } from "@/types/ClusterMap";
import Button from "../../Button";

export default function SettingsButton({ onClick, isOpen }: SettingsButtonProps) {
  return (
    <div className="absolute bottom-3 left-3 z-[800] flex flex-col gap-2">
      <div className="flex flex-col overflow-hidden rounded border border-slate-200 bg-white/85 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/80">
        <Button
          onClick={onClick}
          variant="icon"
          size="sm"
          className="bg-transparent transition hover:bg-white/40 active:bg-white/60 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-white/10 dark:active:bg-white/20 dark:disabled:hover:bg-transparent"
          aria-label="Map settings"
        >
          {isOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
        </Button>
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/Toggle.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/Toggle.tsx" << 'EOF'
import { cn } from "@/lib/util";
import type { ToggleProps } from "@/types/ClusterMap";

const Toggle = ({ enabled }: ToggleProps) => (
  <div
    className={cn(
      "relative h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
      enabled ? "bg-slate-900 dark:bg-white" : "bg-slate-200 dark:bg-white/20"
    )}
  >
    <div
      className={cn(
        "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 dark:bg-slate-900",
        enabled ? "translate-x-3.5" : "translate-x-0.5"
      )}
    />
  </div>
);

export default Toggle;
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/SettingsRow.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/SettingsRow.tsx" << 'EOF'
import { cn } from "@/lib/util";
import type { SettingsRowProps } from "@/types/ClusterMap";
import Button from "../../../Button";
import Toggle from "./Toggle";

const SettingsRow = ({
  label,
  description,
  isActive,
  loading,
  showToggle,
  onClick,
}: SettingsRowProps) => (
  <Button
    onClick={onClick}
    disabled={loading}
    variant="ghost"
    className={cn(
      "flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-all duration-150",
      "hover:bg-slate-50 dark:hover:bg-white/5",
      loading && isActive && "cursor-not-allowed",
      loading && !isActive && "opacity-40"
    )}
  >
    <span className="flex-1 min-w-0">
      <span className="block text-xs font-semibold leading-tight text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <span className="block text-[10px] leading-tight mt-0.5 text-slate-400 dark:text-slate-500">
        {description}
      </span>
    </span>
    {showToggle && <Toggle enabled={isActive} />}
  </Button>
);

export default SettingsRow;
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/DataSourceSection.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/DataSourceSection.tsx" << 'EOF'
import type { DataSourceSectionProps } from "@/types/ClusterMap";
import SettingsRow from "./SettingsRow";

export default function DataSourceSection({ useMock, loading, onDataSourceChange }: DataSourceSectionProps) {
  const options = [
    { label: "Live", value: false, description: "Real-time NYC 311" },
    { label: "Mock", value: true, description: "Preloaded" },
  ];
  return (
    <div className="px-4 py-3">
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Data Source
      </p>
      <div className="flex flex-col gap-1.5">
        {options.map(({ label, value, description }) => (
          <SettingsRow
            key={label}
            label={label}
            description={description}
            isActive={useMock === value}
            loading={loading}
            onClick={() => !loading && onDataSourceChange(value)}
          />
        ))}
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/AccessibilitySection.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/AccessibilitySection.tsx" << 'EOF'
import type { AccessibilitySectionProps } from "@/types/ClusterMap";
import SettingsRow from "./SettingsRow";

export default function AccessibilitySection({
  colourByStatus,
  loading,
  onColourByStatusChange,
}: AccessibilitySectionProps) {
  return (
    <div className="px-4 py-3">
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Display
      </p>
      <SettingsRow
        label="Colour by status"
        description="Pin colour reflects status"
        isActive={colourByStatus}
        loading={loading}
        showToggle
        onClick={() => !loading && onColourByStatusChange(!colourByStatus)}
      />
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/MovementSection.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/MovementSection.tsx" << 'EOF'
import type { MovementSectionProps } from "@/types/ClusterMap";
import SettingsRow from "./SettingsRow";

export default function MovementSection({
  panOnMarker,
  onPanOnMarkerChange,
  panOnCluster,
  onPanOnClusterChange,
}: MovementSectionProps) {
  return (
    <div className="px-4 py-3">
      <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Accessibility
      </p>
      <div className="flex flex-col gap-1.5">
        <SettingsRow
          label="Pan on marker click"
          description="Camera centres on marker"
          isActive={panOnMarker}
          showToggle
          onClick={() => onPanOnMarkerChange(!panOnMarker)}
        />
        <SettingsRow
          label="Pan on cluster click"
          description="Camera centres on cluster"
          isActive={panOnCluster}
          showToggle
          onClick={() => onPanOnClusterChange(!panOnCluster)}
        />
      </div>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/SettingsModalHeader.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/SettingsModalHeader.tsx" << 'EOF'
import { FaTimes } from "react-icons/fa";
import type { SettingsModalHeaderProps } from "@/types/ClusterMap";
import Button from "../../../Button";

export default function SettingsModalHeader({ onClose }: SettingsModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        Map Settings
      </span>
      <Button
        onClick={onClose}
        variant="icon"
        size="sm"
        className="rounded-full transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300 text-slate-700 dark:text-slate-200"
      >
        <FaTimes size={13} />
      </Button>
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/SettingsModalBackdrop.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/SettingsModalBackdrop.tsx" << 'EOF'
import type { SettingsModalBackdropProps } from "@/types/ClusterMap";

export default function SettingsModalBackdrop({ onClose }: SettingsModalBackdropProps) {
  return <div className="absolute inset-0 z-[850]" onClick={onClose} />;
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/SettingsModalPanel.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/SettingsModalPanel.tsx" << 'EOF'
import type { SettingsModalPanelProps } from "@/types/ClusterMap";
import SettingsModalBackdrop from "./SettingsModalBackdrop";

export default function SettingsModalPanel({ onClose, children }: SettingsModalPanelProps) {
  return (
    <>
      <SettingsModalBackdrop onClose={onClose} />
      <div
        className="absolute bottom-14 left-3 z-[900] w-64 overflow-hidden rounded border border-slate-200/80 bg-white/97 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0d0d0d]/97"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 1.5px 6px rgba(0,0,0,0.08)" }}
      >
        {children}
      </div>
    </>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/SettingsModal.tsx
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/SettingsModal.tsx" << 'EOF'
import type { SettingsModalProps } from "@/types/ClusterMap";
import SettingsModalPanel from "./SettingsModalPanel";
import SettingsModalHeader from "./SettingsModalHeader";
import DataSourceSection from "./DataSourceSection";
import AccessibilitySection from "./AccessibilitySection";
import MovementSection from "./MovementSection";

export default function SettingsModal({
  open,
  onClose,
  useMock,
  onDataSourceChange,
  colourByStatus,
  onColourByStatusChange,
  panOnMarker,
  onPanOnMarkerChange,
  panOnCluster,
  onPanOnClusterChange,
  loading,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <SettingsModalPanel onClose={onClose}>
      <SettingsModalHeader onClose={onClose} />
      <DataSourceSection
        useMock={useMock}
        loading={loading}
        onDataSourceChange={onDataSourceChange}
      />
      <div className="mx-4 h-px bg-slate-100 dark:bg-white/10" />
      <div className="mx-4 h-px bg-slate-100 dark:bg-white/10" />
      <AccessibilitySection
        colourByStatus={colourByStatus}
        loading={loading}
        onColourByStatusChange={onColourByStatusChange}
      />
      <div className="mx-4 h-px bg-slate-100 dark:bg-white/10" />
      <MovementSection
        panOnMarker={panOnMarker}
        onPanOnMarkerChange={onPanOnMarkerChange}
        panOnCluster={panOnCluster}
        onPanOnClusterChange={onPanOnClusterChange}
      />
    </SettingsModalPanel>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  components/SettingsModal/index.ts
# ═══════════════════════════════════════════════════════════════
cat > "$DIR/components/SettingsModal/index.ts" << 'EOF'
export { default } from "./SettingsModal";
EOF

# ═══════════════════════════════════════════════════════════════
#  Rewrite ClusterMap.tsx  (map logic only)
# ═══════════════════════════════════════════════════════════════
echo "✏️   Rewriting ClusterMap.tsx"

cat > "$DIR/ClusterMap.tsx" << 'EOF'
import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { cn } from "@/lib/util";
import { fetchGeoPointsReal, fetchGeoPointsMock } from "@/lib/api";
import type { ClusterMapProps } from "@/types/ClusterMap";
import type { GeoPoint } from "@/types/geo";
import {
  clusterIcon,
  createPopup,
  clearIconCache,
  refreshRankedIcons,
  debounce,
  markerKey,
  getMarkerColours,
  TILE_OPTIONS,
} from "./utils";
import {
  NYC_BOUNDS,
  NYC_CENTER,
  DEFAULT_ZOOM,
  REFRESH_INTERVAL,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_ATTRIBUTION_DARK,
  TILE_ATTRIBUTION_LIGHT,
  TILE_DARK,
  TILE_LIGHT,
} from "./constants";
import Button from "../Button";
import ZoomPanel from "./components/ZoomPanel";
import LoadingOverlay from "./components/LoadingOverlay";
import EdgeFade from "./components/EdgeFade";
import SettingsButton from "./components/SettingsButton";
import SettingsModal from "./components/SettingsModal";
import MarkerDetailPanel from "./components/MarkerDetailPanel";

export default function ClusterMap({ className, isDark = false }: ClusterMapProps) {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [useMock, setUseMock] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [recolouring, setRecolouring] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GeoPoint | null>(null);
  const [colourByStatus, setColourByStatus] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panOnCluster, setPanOnCluster] = useState(true);
  const panOnClusterRef = useRef(panOnCluster);
  const [panOnMarker, setPanOnMarker] = useState(true);
  const panOnMarkerRef = useRef(panOnMarker);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const cachedPointsRef = useRef<GeoPoint[]>([]);
  const fetchingRef = useRef(false);
  const useMockRef = useRef(useMock);
  const colourByStatusRef = useRef(colourByStatus);

  useEffect(() => {
    useMockRef.current = useMock;
  }, [useMock]);
  useEffect(() => {
    colourByStatusRef.current = colourByStatus;
  }, [colourByStatus]);
  useEffect(() => {
    panOnClusterRef.current = panOnCluster;
  }, [panOnCluster]);
  useEffect(() => {
    panOnMarkerRef.current = panOnMarker;
  }, [panOnMarker]);
  const isDarkRef = useRef(isDark);
  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  const buildMarkers = useCallback((points: GeoPoint[], colourByStatus: boolean) => {
    if (!clusterRef.current || !mapRef.current) return;

    const CHUNK = 200;
    let i = 0;
    const nextMap = new Map<string, L.Marker>();
    const toAdd: L.Marker[] = [];

    const processChunk = () => {
      const end = Math.min(i + CHUNK, points.length);
      for (; i < end; i++) {
        const p = points[i];
        if (p.latitude == null || p.longitude == null) continue;
        const key = markerKey(p.latitude, p.longitude, p.complaintType);

        const existing = markerMapRef.current.get(key);
        if (existing) {
          existing.setIcon(getMarkerColours(p.status, colourByStatus).normal);
          nextMap.set(key, existing);
        } else {
          const icons = getMarkerColours(p.status, colourByStatus);
          const marker = L.marker([p.latitude, p.longitude], { icon: icons.normal }).bindPopup(
            createPopup(p, isDarkRef.current),
            { autoPan: false }
          );
          (marker as any)._geoPoint = p;
          marker.on("mouseover", () => {
            marker.setIcon(getMarkerColours(p.status, colourByStatusRef.current).hovered);
            marker.openPopup();

            const popup = marker.getPopup()?.getElement();
            const wrapper = popup?.querySelector<HTMLElement>(".leaflet-popup-content-wrapper");
            const tip = popup?.querySelector<HTMLElement>(".leaflet-popup-tip");

            if (wrapper) {
              wrapper.style.borderRadius = "2px";
              if (isDarkRef.current) {
                wrapper.style.background = "#1e1e2e";
                wrapper.style.color = "#e2e8f0";
                wrapper.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
              }
            }
            if (tip && isDarkRef.current) {
              tip.style.background = "#1e1e2e";
            }
          });
          marker.on("mouseout", () => {
            marker.setIcon(getMarkerColours(p.status, colourByStatusRef.current).normal);
            marker.closePopup();
          });
          marker.on("click", () => {
            if (panOnMarkerRef.current) {
              mapRef.current?.panTo([p.latitude, p.longitude], {
                animate: true,
                duration: 0.5,
                easeLinearity: 0.25,
              });
            }
          });

          marker.on("dblclick", (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedPoint((prev) =>
              prev && markerKey(prev.latitude, prev.longitude, prev.complaintType) === key
                ? null
                : p
            );
          });

          nextMap.set(key, marker);
          toAdd.push(marker);
        }
      }

      if (i < points.length) {
        setTimeout(processChunk, 0);
        return;
      }

      // all chunks done — commit
      if (!clusterRef.current || !mapRef.current) return;
      const nextKeys = new Set(nextMap.keys());
      const toRemove: L.Marker[] = [];
      for (const [key, marker] of markerMapRef.current) {
        if (!nextKeys.has(key)) toRemove.push(marker);
      }

      if (toRemove.length > 0) clusterRef.current.removeLayers(toRemove);
      if (toAdd.length > 0) clusterRef.current.addLayers(toAdd);
      markerMapRef.current = nextMap;

      refreshRankedIcons(clusterRef.current, mapRef.current);
      setLoading(false);
      setRecolouring(false);
    };

    setTimeout(processChunk, 0);
  }, []);

  const loadPoints = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const fetchFn = useMockRef.current ? fetchGeoPointsMock : fetchGeoPointsReal;
      const points = await fetchFn();
      if (!clusterRef.current || !mapRef.current) return;

      setIsEmpty(points.length === 0 && !useMockRef.current);
      cachedPointsRef.current = points;
      buildMarkers(points, colourByStatusRef.current);
    } finally {
      fetchingRef.current = false;
    }
  }, [buildMarkers]);

  useEffect(() => {
    if (!mapRef.current || !clusterRef.current) return;
    setRecolouring(true);
    let id: ReturnType<typeof setTimeout>;
    const raf = requestAnimationFrame(() => {
      id = setTimeout(() => {
        if (!clusterRef.current || !mapRef.current) return;
        clusterRef.current.clearLayers();
        markerMapRef.current.clear();
        buildMarkers(cachedPointsRef.current, colourByStatus);
      }, 50);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [colourByStatus, buildMarkers]);

  useEffect(() => {
    if (!mapRef.current || !clusterRef.current) return;
    setLoading(true);
    clusterRef.current.clearLayers();
    markerMapRef.current.clear();
    clearIconCache();
    loadPoints();
  }, [useMock, loadPoints]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      maxBounds: NYC_BOUNDS,
      maxBoundsViscosity: 0.8,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelDebounceTime: 80,
    }).setView(NYC_CENTER, DEFAULT_ZOOM);

    containerRef.current.style.background = isDark ? "#0d0d0d" : "#f2efe9";

    tileLayerRef.current = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
      attribution: isDark ? TILE_ATTRIBUTION_DARK : TILE_ATTRIBUTION_LIGHT,
      ...TILE_OPTIONS,
    }).addTo(mapRef.current);

    clusterRef.current = L.markerClusterGroup({
      iconCreateFunction: clusterIcon,
      chunkedLoading: false,
      animate: false,
      showCoverageOnHover: true,
      disableClusteringAtZoom: MAX_ZOOM,
    });

    mapRef.current.addLayer(clusterRef.current);

    clusterRef.current.on("clusterclick", (e: any) => {
      if (!panOnClusterRef.current) return;
      mapRef.current?.panTo(e.layer.getLatLng(), {
        animate: true,
        duration: 0.5,
        easeLinearity: 0.25,
      });
    });

    const clusterPane = clusterRef.current.getPane();

    mapRef.current.on("zoomstart", () => {
      if (clusterPane) clusterPane.style.opacity = "0";
    });

    mapRef.current.on("zoomend", () => {
      if (clusterRef.current && mapRef.current) {
        refreshRankedIcons(clusterRef.current, mapRef.current);
      }
      if (clusterPane) clusterPane.style.opacity = "1";
    });

    const debouncedPanRerank = debounce(() => {
      if (clusterRef.current && mapRef.current) {
        refreshRankedIcons(clusterRef.current, mapRef.current);
      }
    }, 200);

    mapRef.current.on("click", () => setSelectedPoint(null));

    mapRef.current.on("moveend", debouncedPanRerank);

    loadPoints();

    const interval = setInterval(loadPoints, REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
      debouncedPanRerank.cancel();
      markerMapRef.current.clear();
      clearIconCache();
      mapRef.current?.remove();
      mapRef.current = null;
      clusterRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mapRef.current) return;
    tileLayerRef.current?.remove();
    tileLayerRef.current = L.tileLayer(isDark ? TILE_DARK : TILE_LIGHT, {
      attribution: isDark ? TILE_ATTRIBUTION_DARK : TILE_ATTRIBUTION_LIGHT,
      ...TILE_OPTIONS,
    }).addTo(mapRef.current);
    clusterRef.current?.bringToFront();
    if (containerRef.current) {
      containerRef.current.style.background = isDark ? "#0d0d0d" : "#f2efe9";
    }
  }, [isDark]);

  const fade = isDark ? "#0d0d0d" : "#f8f9fb";

  useEffect(() => {
    if (!mapRef.current) return;

    const updateZoom = () => setZoom(mapRef.current!.getZoom());
    mapRef.current.on("zoomend", updateZoom);

    return () => {
      mapRef.current?.off("zoomend", updateZoom);
    };
  }, []);

  const resetView = () => {
    if (!mapRef.current) return;
    mapRef.current.setView(NYC_CENTER, DEFAULT_ZOOM, {
      animate: false,
    });
  };

  return (
    <div
      data-testid="cluster-map-wrapper"
      className={cn("relative h-[600px] w-full rounded", className)}
    >
      <LoadingOverlay visible={loading} />
      <LoadingOverlay visible={recolouring} />

      <ZoomPanel
        zoomIn={() => mapRef.current?.zoomIn()}
        zoomOut={() => mapRef.current?.zoomOut()}
        resetView={resetView}
        disableZoomIn={zoom >= MAX_ZOOM}
        disableZoomOut={zoom <= MIN_ZOOM}
      />

      {!loading && isEmpty && (
        <div className="absolute inset-0 z-[900] flex flex-col items-center justify-center gap-3 rounded bg-white/70 dark:bg-[#0a1628]/70 backdrop-blur-[2px]">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            No complaint data available
          </p>
          <Button
            onClick={() => setUseMock(true)}
            variant="ghost"
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg dark:bg-stone-800 dark:text-gray-100 dark:hover:bg-stone-800/80"
          >
            Load mock data
          </Button>
        </div>
      )}

      <SettingsButton onClick={() => setSettingsOpen((o) => !o)} isOpen={settingsOpen} />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        useMock={useMock}
        onDataSourceChange={(mock) => {
          if (mock !== useMock) setUseMock(mock);
        }}
        colourByStatus={colourByStatus}
        onColourByStatusChange={(val) => setColourByStatus(val)}
        panOnMarker={panOnMarker}
        onPanOnMarkerChange={(val) => setPanOnMarker(val)}
        panOnCluster={panOnCluster}
        onPanOnClusterChange={(val) => setPanOnCluster(val)}
        loading={loading}
      />

      {selectedPoint && (
        <MarkerDetailPanel point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}

      <div ref={containerRef} className="h-full w-full rounded" data-testid="cluster-map" />
      <EdgeFade colour={fade} />
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════════════
#  Summary
# ═══════════════════════════════════════════════════════════════
echo ""
echo "✅  Done! New structure:"
echo ""
find "$DIR/components" -type f | sort | sed "s|^$DIR/||" | while read -r f; do echo "    $f"; done
echo "    ClusterMap.tsx  (rewritten)"
echo "    ClusterMap.tsx.bak  (backup)"
echo ""
echo "📝  Notes:"
echo "    • Your tests, constants.ts, utils.ts, and index.ts are untouched."
echo "    • Make sure EdgeFadeProps and LoadingOverlayProps are exported from @/types/ClusterMap."
echo "    • Delete ClusterMap.tsx.bak once you've verified everything works."
