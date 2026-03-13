import { useEffect, useState } from "react";
import { fetchLastRefresh } from "@/lib/api";
import type { DataRefresh } from "@/types/logs";
import {
  CornerGlow,
  PageBackground,
  PageContainer,
  DashboardHeader,
  MapCard,
  DashboardFooter,
} from "./components";

const Dashboard = () => {
  const [refresh, setRefresh] = useState<DataRefresh | null>(null);

  useEffect(() => {
    fetchLastRefresh().then(setRefresh);
  }, []);

  return (
    <PageBackground>
      <CornerGlow />
      <PageContainer>
        <DashboardHeader refresh={refresh} />
        <MapCard />
        <DashboardFooter />
      </PageContainer>
    </PageBackground>
  );
};

export default Dashboard;
