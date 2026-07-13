import { ShieldAlert, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RiskHeatmapProps {
  risks: {
    description: string;
    severity: string;
    likelihood: string;
    category?: string;
  }[];
}

const severityConfig: Record<string, { color: string; bg: string; icon: any; weight: number }> = {
  CRITICAL: { color: "text-red-500", bg: "bg-red-500/20 border-red-500/30", icon: ShieldAlert, weight: 4 },
  HIGH: { color: "text-orange-500", bg: "bg-orange-500/20 border-orange-500/30", icon: AlertTriangle, weight: 3 },
  MEDIUM: { color: "text-yellow-500", bg: "bg-yellow-500/20 border-yellow-500/30", icon: AlertCircle, weight: 2 },
  LOW: { color: "text-emerald-500", bg: "bg-emerald-500/20 border-emerald-500/30", icon: Info, weight: 1 },
};

export default function RiskHeatmap({ risks }: RiskHeatmapProps) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  
  risks.forEach(r => {
    if (counts[r.severity as keyof typeof counts] !== undefined) {
      counts[r.severity as keyof typeof counts]++;
    }
  });

  const topRisks = [...risks]
    .sort((a, b) => (severityConfig[b.severity]?.weight || 0) - (severityConfig[a.severity]?.weight || 0))
    .slice(0, 5);

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-6">Risk Profile Heatmap</h3>
      
      {/* Heatmap Blocks */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {Object.entries(counts).map(([sev, count]) => {
          const cfg = severityConfig[sev];
          const Icon = cfg.icon;
          return (
            <div key={sev} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${cfg.bg}`}>
              <Icon className={`w-6 h-6 mb-2 ${cfg.color}`} />
              <span className={`text-2xl font-bold ${cfg.color}`}>{count}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300 mt-1">{sev} Risks</span>
            </div>
          );
        })}
      </div>

      {/* Top Risks List */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Top Identified Risks</h4>
        <div className="space-y-3">
          {topRisks.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No significant risks identified.</p>
          ) : topRisks.map((risk, i) => {
            const cfg = severityConfig[risk.severity] || severityConfig.MEDIUM;
            return (
              <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/5 border border-white/5">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.bg.split(' ')[0].replace('/20', '')}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${cfg.bg} ${cfg.color}`}>
                      {risk.severity}
                    </span>
                    {risk.category && (
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {risk.category.replace('_risk', '')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2" title={risk.description}>
                    {risk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
