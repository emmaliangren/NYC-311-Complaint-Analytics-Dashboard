import type { DataRefresh } from "@/types/logs";
import { formatDate, formatTime } from "@/lib/util";
import { Link } from "react-router";

interface DashboardFooterProps {
  refresh: DataRefresh | null;
}

const DashboardFooter = ({ refresh }: DashboardFooterProps) => {
  const lastRefresh = refresh?.refreshCompletedAt
    ? `${formatDate(refresh.refreshCompletedAt)} at ${formatTime(refresh.refreshCompletedAt)}`
    : refresh
      ? "In progress..."
      : "N/A";

  return (
    <footer className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
      <span>
        Data source:{" "}
        <Link to="https://opendata.cityofnewyork.us/" className="hover:text-emerald-500/50">
          NYC Open Data
        </Link>
      </span>

      <span>Last refresh: {lastRefresh}</span>
    </footer>
  );
};

export default DashboardFooter;
