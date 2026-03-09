import type { DataRefresh } from "@/types/logs";
import { formatDate, formatTime } from "@/lib/util";
import Stat from "./Stat";
import StatusDot from "./StatusDot";

interface RefreshStatusProps {
  refresh: DataRefresh;
}

const RefreshStatus = ({ refresh }: RefreshStatusProps) => (
  <div className="flex items-center gap-4 rounded border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:backdrop-blur-md">
    <StatusDot status={refresh.status} />
    <Stat label="Last refresh" value={formatTime(refresh.refreshCompletedAt)} />
    <div className="h-7 w-px bg-slate-100 dark:bg-white/10" />
    <Stat label="Date" value={formatDate(refresh.refreshCompletedAt)} />
    <div className="h-7 w-px bg-slate-100 dark:bg-white/10" />
    <Stat label="Records" value={refresh.recordsProcessed.toLocaleString()} />
  </div>
);

export default RefreshStatus;
