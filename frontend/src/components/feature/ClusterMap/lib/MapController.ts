import type { Map, MarkerClusterGroup } from "leaflet";
import L from "leaflet";
import {
  IconFactory,
  PopupFactory,
  MarkerManager,
  hidePaneImmediately,
  fadePaneIn,
  PANE_TRANSITION_EASE,
} from "./managers";
import {
  CLUSTER_OPTIONS,
  INITIAL_LOAD_TIMEOUT_MS,
  LOAD_START,
  MAP_OPTIONS,
  MAX_ZOOM,
  MIN_LOAD_MS,
  MIN_ZOOM,
  NYC_CENTER,
  PAN_RERANK_DEBOUNCE,
  REFRESH_INTERVAL,
  TEN_SECONDS,
  TILE_ATTRIBUTION,
  TILE_OPTIONS,
  TILE_URL,
} from "./constants";
import { CLUSTER_ZOOM_OPTIONS, FLY_TO_OPTIONS, RESET_VIEW_OPTIONS } from "./managers";
import type { ClusterMouseEvent, FilterParams, MapControllerCallbacks } from "./types";
import type { GeoPoint } from "@/types/geopoints";
import { DataService } from "./DataService";

export class MapController {
  private iconFactory: IconFactory;
  private popupFactory: PopupFactory;
  private markerManager: MarkerManager;
  private dataService: DataService;

  private map: Map | null = null;
  private cluster: MarkerClusterGroup | null = null;
  private clusterPane: HTMLElement | null = null;

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private throttledRefresh: ((() => void) & { cancel(): void }) | null = null;
  private loadStart = LOAD_START;
  private disposed = false;
  private flying = false;
  private resetting = false;
  private unfilteredTotal = 0;
  private callbacks: MapControllerCallbacks;
  private filterParams: FilterParams = {};

  constructor(callbacks: MapControllerCallbacks) {
    this.callbacks = callbacks;
    this.iconFactory = new IconFactory();
    this.popupFactory = new PopupFactory();
    this.dataService = new DataService();

    this.markerManager = new MarkerManager(this.iconFactory, this.popupFactory, {
      getColourByStatus: callbacks.getColourByStatus,
      getPanOnMarker: callbacks.getPanOnMarker,

      getMap: () => this.map,
    });
  }

  async mount(container: HTMLElement): Promise<void> {
    if (this.map) return;

    const [{ default: L }] = await Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
      import("leaflet.markercluster/dist/MarkerCluster.css"),
      import("leaflet.markercluster/dist/MarkerCluster.Default.css"),
      import("leaflet.markercluster"),
    ]);

    if (this.disposed) return;

    const leafletContainer = container as HTMLElement & { _leaflet_id?: number };
    if (leafletContainer._leaflet_id) {
      leafletContainer._leaflet_id = undefined;
      container.innerHTML = "";
    }

    this.map = L.map(container, MAP_OPTIONS).setView(NYC_CENTER, MIN_ZOOM);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, ...TILE_OPTIONS }).addTo(this.map);

    CLUSTER_OPTIONS.iconCreateFunction = this.iconFactory.createClusterIcon;
    this.cluster = L.markerClusterGroup(CLUSTER_OPTIONS) as unknown as MarkerClusterGroup;
    this.map.addLayer(this.cluster);

    this.clusterPane = this.cluster.getPane() ?? null;
    if (this.clusterPane) this.clusterPane.style.transition = PANE_TRANSITION_EASE;

    this.bindMapEvents(L);
    await this.loadPointsWithFallback(); // this.loadPoints()
    this.refreshTimer = setInterval(() => this.loadPoints(), REFRESH_INTERVAL);
  }

  destroy(): void {
    this.disposed = true;
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    this.throttledRefresh?.cancel();
    this.dataService.cancelPending();
    this.markerManager.clear();
    this.iconFactory.clearAll();
    this.map?.remove();
    this.map = null;
    this.cluster = null;
  }

  zoomIn(): void {
    this.map?.zoomIn();
  }

  zoomOut(): void {
    this.map?.zoomOut();
  }

  resetView(): void {
    if (!this.map) return;
    this.map.stop();
    this.flying = false;
    this.resetting = true;
    this.throttledRefresh?.cancel();
    this.map.setView(NYC_CENTER, MIN_ZOOM, RESET_VIEW_OPTIONS);
  }

  setUseMock(value: boolean): void {
    this.dataService.setUseMock(value);
    this.reload();
  }

  applyFilters(params: FilterParams): void {
    this.filterParams = params;
    this.reload();
  }

  reload(): void {
    this.dataService.cancelPending();
    this.callbacks.onLoadingChange(true);
    if (!this.cluster) return;
    this.cluster.clearLayers();
    this.markerManager.clear();
    this.iconFactory.clearAll();
    this.loadPoints();
  }

  getMaxZoom(): number {
    return MAX_ZOOM;
  }

  getMinZoom(): number {
    return MIN_ZOOM;
  }

  getUseMock(): boolean {
    return this.dataService.getUseMock();
  }

  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  private pollForLiveData(): void {
    const poll = async () => {
      if (this.disposed) return;
      try {
        const response = await fetch("/api/complaints/geopoints?limit=1");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Real data is available — switch automatically
            this.dataService.setUseMock(false);
            this.reload();
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setTimeout(poll, TEN_SECONDS);
    };
    setTimeout(poll, TEN_SECONDS);
  }

  async switchToLive(): Promise<void> {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.dataService.cancelPending();
    this.dataService.setUseMock(false);
    this.callbacks.onLoadingChange(true);
    if (this.cluster) {
      this.cluster.clearLayers();
      this.markerManager.clear();
      this.iconFactory.clearAll();
    }
    await this.loadPoints();
    this.refreshTimer = setInterval(() => this.loadPoints(), REFRESH_INTERVAL);
  }

  private async loadPointsWithFallback(): Promise<void> {
    this.loadStart = Date.now();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), INITIAL_LOAD_TIMEOUT_MS)
    );

    const fetchPromise = this.dataService.fetchPoints(this.filterParams);
    const raw = await Promise.race([fetchPromise, timeoutPromise]);

    if (!raw || raw.length === 0) {
      this.dataService.setUseMock(true);
      await this.loadPoints();
      this.pollForLiveData();
      return;
    }

    const points = this.applyClientFilters(raw);
    const hasFilters = Object.values(this.filterParams).some(Boolean);
    if (!hasFilters) this.unfilteredTotal = raw.length;
    this.callbacks.onPointsChange?.(this.unfilteredTotal, points.length);
    if (!this.cluster || !this.map) {
      this.callbacks.onLoadingChange(false);
      return;
    }
    this.callbacks.onEmptyChange(points.length === 0);
    await this.markerManager.buildMarkers(points, this.cluster, this.map, this.clusterPane);
    this.fireViewportCount();
    const elapsed = Date.now() - this.loadStart;
    setTimeout(() => this.callbacks.onLoadingChange(false), Math.max(0, MIN_LOAD_MS - elapsed));
  }

  private fireViewportCount(): void {
    if (!this.map || !this.cluster) return;
    const bounds = this.map.getBounds();
    let count = 0;

    type FGLayer = L.FeatureGroup & { _featureGroup: L.FeatureGroup };
    const fg = (this.cluster as unknown as FGLayer)._featureGroup;
    if (!fg) return;

    fg.eachLayer((layer: L.Layer) => {
      const asCluster = layer as L.Layer & {
        getChildCount?: () => number;
        getLatLng: () => L.LatLng;
      };
      if (typeof asCluster.getChildCount === "function") {
        if (bounds.contains(asCluster.getLatLng())) {
          count += asCluster.getChildCount();
        }
      } else {
        const marker = layer as L.Marker;
        if (bounds.contains(marker.getLatLng())) {
          count++;
        }
      }
    });

    this.callbacks.onViewportCountChange?.(count);
  }

  private bindMapEvents(L: typeof import("leaflet")): void {
    if (!this.map || !this.cluster) return;
    const map = this.map;
    const cluster = this.cluster;
    const pane = this.clusterPane;

    const isAtDefault = () => map.getZoom() === MIN_ZOOM;

    cluster.on("clusterclick", (e: ClusterMouseEvent) => {
      map.stop();
      this.flying = false;
      this.throttledRefresh?.cancel();
      const currentZoom = map.getZoom();

      if (currentZoom >= MAX_ZOOM) {
        e.layer.spiderfy();
        return;
      }

      L.DomEvent.stop(e);
      const center = e.layer.getLatLng();
      const nextZoom = currentZoom + 1;

      if (this.callbacks.getPanOnCluster()) {
        this.flying = true;
        map.setView(center, nextZoom, FLY_TO_OPTIONS);
      } else {
        map.setZoom(nextZoom, CLUSTER_ZOOM_OPTIONS);
      }
    });

    map.on("zoomstart", () => {
      if (pane) hidePaneImmediately(pane);
    });

    map.on("zoomend", () => {
      this.callbacks.onZoomChange?.(map.getZoom());
      this.tryRefreshIcons();
      fadePaneIn(pane);
    });

    this.throttledRefresh = MapController.debounce(
      () => this.tryRefreshIcons(),
      PAN_RERANK_DEBOUNCE
    );

    map.on("moveend", () => {
      if (this.resetting) {
        this.resetting = false;
        this.callbacks.onViewChange?.(true);
        this.tryRefreshIcons();
        this.fireViewportCount();
        return;
      }
      if (this.flying) {
        this.flying = false;
        this.tryRefreshIcons();
        this.callbacks.onViewChange?.(isAtDefault());
        this.fireViewportCount();
        return;
      }
      this.callbacks.onViewChange?.(isAtDefault());
      this.throttledRefresh!();
      this.fireViewportCount();
    });
  }

  private async loadPoints(): Promise<void> {
    this.loadStart = Date.now();
    const raw = await this.dataService.fetchPoints(this.filterParams);
    if (raw === null) return;

    const points = this.applyClientFilters(raw);
    this.callbacks.onPointsChange?.(this.unfilteredTotal, points.length);

    if (!this.cluster || !this.map) {
      this.callbacks.onLoadingChange(false);
      return;
    }

    this.callbacks.onEmptyChange(points.length === 0 && !this.dataService.getUseMock());
    await this.markerManager.buildMarkers(points, this.cluster, this.map, this.clusterPane);
    this.fireViewportCount(); // ← add

    const elapsed = Date.now() - this.loadStart;
    setTimeout(() => this.callbacks.onLoadingChange(false), Math.max(0, MIN_LOAD_MS - elapsed));
  }

  private applyClientFilters(points: GeoPoint[]): GeoPoint[] {
    const { borough, complaintType, status, dateFrom, dateTo } = this.filterParams;
    if (!borough && !complaintType && !status && !dateFrom && !dateTo) return points;
    const norm = (s?: string) => s?.trim().toLowerCase();
    return points.filter((p) => {
      if (borough && norm(p.borough) !== norm(borough)) return false;
      if (complaintType && norm(p.complaintType) !== norm(complaintType)) return false;
      if (status && norm(p.status) !== norm(status)) return false;
      if (dateFrom && p.createdDate < dateFrom) return false;
      if (dateTo && p.createdDate > dateTo) return false;
      return true;
    });
  }

  private tryRefreshIcons(): void {
    if (!this.cluster || !this.map || this.flying) return;
    const counts = MarkerManager.collectVisibleClusterCounts(this.cluster, this.map);
    this.iconFactory.clearClusterCache();
    this.iconFactory.computeRankCutoffs(counts);
    this.cluster.refreshClusters();
  }

  static debounce<T extends (...args: Parameters<T>) => void>(
    fn: T,
    ms: number
  ): T & { cancel(): void } {
    let id: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<T>) => {
      if (id !== null) clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
    debounced.cancel = () => {
      if (id !== null) clearTimeout(id);
    };
    return debounced as T & { cancel(): void };
  }
}
