import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend: number;
  trendLabel?: string;
  accentColor?: string;
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel = "vs last month",
  accentColor = "blue",
}: StatsCardProps) {
  const isPositive = trend >= 0;

  const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
    blue: {
      bg: "from-blue-500/15 to-blue-600/5",
      icon: "text-blue-400",
      glow: "shadow-blue-500/10",
    },
    purple: {
      bg: "from-purple-500/15 to-purple-600/5",
      icon: "text-purple-400",
      glow: "shadow-purple-500/10",
    },
    emerald: {
      bg: "from-emerald-500/15 to-emerald-600/5",
      icon: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      bg: "from-amber-500/15 to-amber-600/5",
      icon: "text-amber-400",
      glow: "shadow-amber-500/10",
    },
  };

  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 glow-hover group">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}
        >
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}
          {trend}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">{trendLabel}</p>
    </div>
  );
}
