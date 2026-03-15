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

const Dashboard = () => {
  const { refresh } = useLoaderData<typeof clientLoader>();

  return (
    <PageBackground>
      <CornerGlow />
      <PageContainer>
        <DashboardHeader refresh={refresh} />
        <MapCard />
        <DashboardFooter refresh={refresh} />
      </PageContainer>
    </PageBackground>
  );
};

export default Dashboard;
