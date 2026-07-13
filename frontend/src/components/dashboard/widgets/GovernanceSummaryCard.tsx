import { CheckCircle2, AlertTriangle, AlertCircle, Scale, FileText, Users, Building, Leaf } from "lucide-react";

interface Metric {
  value: string;
  confidence: number;
}

interface GovernanceSummaryProps {
  metrics: {
    board: Metric;
    commissioners: Metric;
    auditCommittee: Metric;
    transparency: Metric;
    compliance: Metric;
    esg: Metric;
    overall: Metric;
  };
}

export default function GovernanceSummaryCard({ metrics }: GovernanceSummaryProps) {
  const getIcon = (key: string) => {
    switch (key) {
      case 'board': return Users;
      case 'commissioners': return Building;
      case 'auditCommittee': return FileText;
      case 'transparency': return Scale;
      case 'compliance': return Scale;
      case 'esg': return Leaf;
      default: return Scale;
    }
  };

  const rows = [
    { key: 'board', label: "Board of Directors", data: metrics.board },
    { key: 'commissioners', label: "Commissioners", data: metrics.commissioners },
    { key: 'auditCommittee', label: "Audit Committee", data: metrics.auditCommittee },
    { key: 'transparency', label: "Transparency", data: metrics.transparency },
    { key: 'compliance', label: "Compliance", data: metrics.compliance },
    { key: 'esg', label: "ESG Initiatives", data: metrics.esg },
    { key: 'overall', label: "Overall Governance", data: metrics.overall },
  ];

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-6">Governance Summary</h3>
      
      <div className="space-y-4 overflow-y-auto pr-2 max-h-[400px]">
        {rows.map((row) => {
          const Icon = getIcon(row.key);
          const val = row.data?.value || "Insufficient data";
          const conf = row.data?.confidence || 0;
          let confColor = "text-red-400";
          if (conf >= 0.8) confColor = "text-emerald-400";
          else if (conf >= 0.5) confColor = "text-yellow-400";

          return (
            <div key={row.key} className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{row.label}</h4>
                <span className={`ml-auto text-[10px] font-bold ${confColor}`}>
                  {Math.round(conf * 100)}% CONF
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-2" title={val}>
                {val}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
