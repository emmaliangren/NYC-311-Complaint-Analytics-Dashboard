interface StatusDotProps {
  status: string;
}

const StatusDot = ({ status }: StatusDotProps) => {
  const colour =
    status === "completed" ? "bg-emerald-500" : status === "error" ? "bg-red-500" : "bg-amber-400";
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${colour}`}
      />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${colour}`} />
    </span>
  );
};

export default StatusDot;
