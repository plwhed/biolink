interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral" | "positive" | "negative";
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
}: StatCardProps) {
  const trendColor =
    trend === "up" || trend === "positive"
      ? "text-green-400"
      : trend === "down" || trend === "negative"
        ? "text-red-400"
        : "text-white/40";

  return (
    <div className="rounded-2xl border border-[#1b1b1b] bg-[#0d0d0d] p-5 flex items-center gap-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex flex-col">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
          {trend !== "neutral" && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/10 ${trendColor}`}>
              ▲ 0%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight text-white truncate">
          {value}
        </p>
        {change && <p className={`mt-1 text-xs font-medium ${trendColor}`}>{change}</p>}
      </div>
    </div>
  );
}
