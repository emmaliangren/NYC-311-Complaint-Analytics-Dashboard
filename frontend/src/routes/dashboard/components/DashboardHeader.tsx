import type { DataRefresh } from "@/types/logs";
import DashboardTitle from "./DashboardTitle";
import RefreshStatus from "./RefreshStatus";
import BackButton from "./BackButton";

interface DashboardHeaderProps {
  refresh: DataRefresh | null;
}

const DashboardHeader = ({ refresh }: DashboardHeaderProps) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <BackButton />
      <DashboardTitle />
    </div>
    {refresh && <RefreshStatus refresh={refresh} />}
  </header>
);

export default DashboardHeader;
