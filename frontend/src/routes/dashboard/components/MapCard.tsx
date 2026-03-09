import ClusterMap from "@/components/feature/ClusterMap";

const MapCard = () => (
  <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:backdrop-blur-sm">
    <ClusterMap className="h-[calc(100vh-220px)] min-h-[500px]" />
  </div>
);

export default MapCard;
