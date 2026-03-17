import DashboardTitle from "./DashboardTitle";
import BackButton from "./BackButton";

interface DashboardHeaderProps {
  walkthroughOpen: boolean;
}

const DashboardHeader = ({ walkthroughOpen }: DashboardHeaderProps) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <BackButton disabled={walkthroughOpen} />
      <DashboardTitle />
    </div>
  </header>
);

export default DashboardHeader;
