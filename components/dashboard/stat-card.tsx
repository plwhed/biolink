interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatCard({
  label,
  value,
  change,
  trend = "neutral",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-pink-400"
      : trend === "down"
        ? "text-red-400"
        : "text-white/40";

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
      <p className="text-sm font-medium text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      {change && <p className={`mt-1 text-xs font-medium ${trendColor}`}>{change}</p>}
    </div>
  );
}
