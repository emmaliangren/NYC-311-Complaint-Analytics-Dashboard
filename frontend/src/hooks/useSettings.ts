import { useState } from "react";
import useSyncRef from "./useSyncRef";

const useSettings = () => {
  const [useMock, setUseMock] = useState(false);
  const [colourByStatus, setColourByStatus] = useState(true);
  const [panOnCluster, setPanOnCluster] = useState(true);
  const [panOnMarker, setPanOnMarker] = useState(true);
  const useMockRef = useSyncRef(useMock);
  const colourByStatusRef = useSyncRef(colourByStatus);
  const panOnClusterRef = useSyncRef(panOnCluster);
  const panOnMarkerRef = useSyncRef(panOnMarker);

  return {
    useMock,
    setUseMock,
    useMockRef,
    colourByStatus,
    setColourByStatus,
    colourByStatusRef,
    panOnCluster,
    setPanOnCluster,
    panOnClusterRef,
    panOnMarker,
    setPanOnMarker,
    panOnMarkerRef,
  };
};

export default useSettings;
