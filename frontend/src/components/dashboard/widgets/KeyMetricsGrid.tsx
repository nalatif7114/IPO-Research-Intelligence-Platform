import { DollarSign, Percent, PieChart, TrendingUp, Briefcase, Activity } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  icon: any;
  subtext?: string;
}

function KPICard({ label, value, icon: Icon, subtext }: KPICardProps) {
  return (
    <div className="glass-card p-5 flex flex-col justify-between h-full bg-white/[0.02]">
      <div className="flex items-start justify-between mb-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</h4>
        <div className="p-2 rounded bg-white/5 text-slate-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-white mb-1 line-clamp-1" title={value}>{value || "N/A"}</p>
        {subtext && <p className="text-[10px] text-slate-500 uppercase tracking-wider">{subtext}</p>}
      </div>
    </div>
  );
}

interface KeyMetricsGridProps {
  metrics: {
    revenue: string;
    profitMargin: string;
    marketShare: string;
    growth: string;
    debtRatio: string;
    currentRatio: string;
    quickRatio: string;
  };
}

export default function KeyMetricsGrid({ metrics }: KeyMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
      <KPICard label="Revenue" value={metrics.revenue} icon={DollarSign} subtext="LTM Revenue" />
      <KPICard label="Profit Margin" value={metrics.profitMargin} icon={Percent} subtext="Net Margin" />
      <KPICard label="Market Share" value={metrics.marketShare} icon={PieChart} subtext="Estimated" />
      <KPICard label="Growth" value={metrics.growth} icon={TrendingUp} subtext="YoY Growth" />
      <KPICard label="Debt Ratio" value={metrics.debtRatio} icon={Briefcase} subtext="Total Debt / Assets" />
      <KPICard label="Current Ratio" value={metrics.currentRatio} icon={Activity} subtext="Liquidity" />
      <KPICard label="Quick Ratio" value={metrics.quickRatio} icon={Activity} subtext="Acid Test" />
    </div>
  );
}
