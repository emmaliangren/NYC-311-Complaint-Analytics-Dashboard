import type { Map, MarkerClusterGroup } from "leaflet";
import {
  IconFactory,
  PopupFactory,
  MarkerManager,
  hidePaneImmediately,
  PANE_TRANSITION_EASE,
  fadePaneIn,
  PANE_TRANSITION_EASE_IN,
} from "./managers";
import { DataService } from "./DataService";
import {
  CLUSTER_OPTIONS,
  LOAD_START,
  MAP_OPTIONS,
  MAX_ZOOM,
  MIN_LOAD_MS,
  MIN_ZOOM,
  NYC_CENTER,
  PAN_RERANK_DEBOUNCE,
  REFRESH_INTERVAL,
  TILE_ATTRIBUTION,
  TILE_OPTIONS,
  TILE_URL,
} from "./constants";
import { CLUSTER_ZOOM_OPTIONS, FLY_TO_OPTIONS, RESET_VIEW_OPTIONS } from "./managers";
import type { ClusterMouseEvent, MapControllerCallbacks } from "./types";

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
  private callbacks: MapControllerCallbacks;

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

  /** mount the map onto a container element. call once. */
  async mount(container: HTMLElement): Promise<void> {
    if (this.map) return;

    const [{ default: L }] = await Promise.all([
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
      import("leaflet.markercluster/dist/MarkerCluster.css"),
      import("leaflet.markercluster/dist/MarkerCluster.Default.css"),
      import("leaflet.markercluster"),
    ]);

    this.map = L.map(container, MAP_OPTIONS).setView(NYC_CENTER, MIN_ZOOM);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, ...TILE_OPTIONS }).addTo(this.map);

    CLUSTER_OPTIONS.iconCreateFunction = this.iconFactory.createClusterIcon;
    this.cluster = L.markerClusterGroup(CLUSTER_OPTIONS) as unknown as MarkerClusterGroup;
    this.map.addLayer(this.cluster);

    this.clusterPane = this.cluster.getPane() ?? null;
    if (this.clusterPane) this.clusterPane.style.transition = PANE_TRANSITION_EASE;

    this.bindMapEvents(L);
    this.loadPoints();
    this.refreshTimer = setInterval(() => this.loadPoints(), REFRESH_INTERVAL);
  }

  /** this will release all resources. */
  destroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.throttledRefresh?.cancel();
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
    this.map.setView(NYC_CENTER, MIN_ZOOM, RESET_VIEW_OPTIONS);
  }

  setUseMock(value: boolean): void {
    this.dataService.setUseMock(value);
    this.reload();
  }

  reload(): void {
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

  private bindMapEvents(L: typeof import("leaflet")): void {
    if (!this.map || !this.cluster) return;
    const map = this.map;
    const cluster = this.cluster;
    const pane = this.clusterPane;

    cluster.on("clusterclick", (e: ClusterMouseEvent) => {
      map.stop();
      const currentZoom = map.getZoom();

      if (currentZoom >= MAX_ZOOM) {
        e.layer.spiderfy();
        return;
      }

      L.DomEvent.stop(e);
      const center = e.layer.getLatLng();
      const nextZoom = currentZoom + 1;

      if (this.callbacks.getPanOnCluster()) {
        map.flyTo(center, nextZoom, FLY_TO_OPTIONS);
      } else {
        map.setZoom(nextZoom, CLUSTER_ZOOM_OPTIONS);
      }
    });

    map.on("zoomstart", () => {
      if (pane) hidePaneImmediately(pane);
    });

    map.on("zoomend", () => {
      this.tryRefreshIcons();
      if (pane) {
        requestAnimationFrame(() => fadePaneIn(pane, PANE_TRANSITION_EASE_IN));
      }
      this.callbacks.onZoomChange(map.getZoom());
    });

    this.throttledRefresh = MapController.debounce(
      () => this.tryRefreshIcons(),
      PAN_RERANK_DEBOUNCE
    );
    map.on("moveend", this.throttledRefresh);
  }

  private async loadPoints(): Promise<void> {
    this.loadStart = Date.now();
    const points = await this.dataService.fetchPoints();

    if (!this.cluster || !this.map) {
      this.callbacks.onLoadingChange(false);
      return;
    }

    this.callbacks.onEmptyChange(points.length === 0 && !this.dataService.getUseMock());
    await this.markerManager.buildMarkers(points, this.cluster, this.map, this.clusterPane);

    const elapsed = Date.now() - this.loadStart;
    setTimeout(() => this.callbacks.onLoadingChange(false), Math.max(0, MIN_LOAD_MS - elapsed));
  }

  private tryRefreshIcons(): void {
    if (!this.cluster || !this.map) return;
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
