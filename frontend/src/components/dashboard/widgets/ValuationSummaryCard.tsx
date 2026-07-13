import { DollarSign, TrendingUp, Percent, ShieldCheck, Activity } from "lucide-react";

interface Metric {
  value: string;
  confidence: number;
}

interface ValuationSummaryProps {
  metrics: {
    fairValue: Metric;
    ipoPrice: Metric;
    upside: Metric;
    marginOfSafety: Metric;
    expectedReturn: Metric;
    thesis: Metric;
  };
}

export default function ValuationSummaryCard({ metrics }: ValuationSummaryProps) {
  const getIcon = (key: string) => {
    switch (key) {
      case 'fairValue': return DollarSign;
      case 'ipoPrice': return DollarSign;
      case 'upside': return TrendingUp;
      case 'marginOfSafety': return ShieldCheck;
      case 'expectedReturn': return Percent;
      case 'thesis': return Activity;
      default: return Activity;
    }
  };

  const rows = [
    { key: 'fairValue', label: "Estimated Fair Value", data: metrics.fairValue },
    { key: 'ipoPrice', label: "IPO Pricing", data: metrics.ipoPrice },
    { key: 'upside', label: "Upside Potential", data: metrics.upside },
    { key: 'marginOfSafety', label: "Margin of Safety", data: metrics.marginOfSafety },
    { key: 'expectedReturn', label: "Expected Return", data: metrics.expectedReturn },
  ];

  return (
    <div className="glass-card p-6 flex flex-col h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
      <h3 className="text-sm font-semibold text-white mb-6">Valuation Summary</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {rows.map((row) => {
          const Icon = getIcon(row.key);
          const val = row.data?.value || "N/A";
          return (
            <div key={row.key} className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-indigo-400" />
                <h4 className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">{row.label}</h4>
              </div>
              <p className="text-sm font-bold text-white mt-1 line-clamp-1" title={val}>
                {val}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex-1 p-4 rounded-xl border border-white/5 bg-white/5">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Investment Thesis</h4>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "{metrics.thesis?.value || "No investment thesis provided."}"
        </p>
      </div>
    </div>
  );
}
