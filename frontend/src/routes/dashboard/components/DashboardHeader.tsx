import type { DataRefresh } from "@/types/logs";
import DashboardTitle from "./DashboardTitle";
import RefreshStatus from "./RefreshStatus";

interface DashboardHeaderProps {
  refresh: DataRefresh | null;
}

const DashboardHeader = ({ refresh }: DashboardHeaderProps) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <DashboardTitle />
    {refresh && <RefreshStatus refresh={refresh} />}
  </header>
);

export default DashboardHeader;
