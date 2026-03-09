import type { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";
import type { MarkerDetailPanelProps } from "@/types/ClusterMap";
import Button from "@/components/ui/Button";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{children}</span>
  </div>
);

const MarkerDetailPanel = ({ point, onClose }: MarkerDetailPanelProps) => (
  <div className="absolute bottom-4 left-1/2 z-[900] w-[300px] rounded border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#0d0d0d]/95">
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10">
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {point.complaintType}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{point.borough}</p>
      </div>
      <Button
        onClick={onClose}
        variant="icon"
        size="sm"
        className="mt-0.5 shrink-0 rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
      >
        <FaTimes />
      </Button>
    </div>
    <div className="px-4 py-3 space-y-2">
      <Row label="Status">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium">
          {point.status}
        </span>
      </Row>
      <Row label="Opened">{point.createdDate}</Row>
      <Row label="Coordinates">
        {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
      </Row>
    </div>
  </div>
);

export default MarkerDetailPanel;
