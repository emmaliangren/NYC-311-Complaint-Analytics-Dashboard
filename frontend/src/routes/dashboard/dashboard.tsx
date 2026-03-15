import { useLoaderData } from "react-router";
import { clientLoader } from "./dashboard.clientLoader";
// eslint-disable-next-line react-refresh/only-export-components
export { clientLoader };
import {
  CornerGlow,
  PageBackground,
  PageContainer,
  DashboardHeader,
  MapCard,
  DashboardFooter,
} from "./components";
import { useEffect, useState } from "react";
import { fetchLastRefresh } from "@/lib/api";

const Dashboard = () => {
  const { refresh: initialRefresh } = useLoaderData<typeof clientLoader>();
  const [refresh, setRefresh] = useState(initialRefresh);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = await fetchLastRefresh();
      if (latest && latest.refreshCompletedAt !== refresh?.refreshCompletedAt) {
        setRefresh(latest);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refresh?.refreshCompletedAt]);

  return (
    <PageBackground>
      <CornerGlow />
      <PageContainer>
        <DashboardHeader />
        <MapCard />
        <DashboardFooter refresh={refresh} />
      </PageContainer>
    </PageBackground>
  );
};
export default Dashboard;
