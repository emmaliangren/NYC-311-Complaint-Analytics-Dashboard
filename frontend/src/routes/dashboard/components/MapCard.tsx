import { FilterProvider } from "@/context/FilterProvider";
import { lazy, Suspense } from "react";

const ClusterMap = lazy(() => import("@/components/feature/ClusterMap"));

const MapCard = () => (
  <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:backdrop-blur-sm">
    <Suspense
      fallback={
        <div className="h-[calc(100vh-220px)] min-h-[500px] animate-pulse bg-slate-100 dark:bg-slate-800" />
      }
    >
      <FilterProvider>
        <ClusterMap className="h-[calc(100vh-220px)] min-h-[500px]" />
      </FilterProvider>
    </Suspense>
  </div>
);

export default MapCard;
