import { forwardRef } from "react";
import { MAP_TESTID } from "@/components/feature/ClusterMap/lib/constants";

const MapContainer = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="h-full w-full rounded" data-testid={MAP_TESTID} />
));

MapContainer.displayName = "MapContainer";

export default MapContainer;
