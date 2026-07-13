import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface Metric {
  value: string;
  confidence: number;
}

interface FinancialSummaryTableProps {
  metrics: {
    revenue: Metric;
    netIncome: Metric;
    ebitda: Metric;
    operatingMargin: Metric;
    cashFlow: Metric;
    debt: Metric;
    roe?: Metric;
    roa?: Metric;
  };
}

export default function FinancialSummaryTable({ metrics }: FinancialSummaryTableProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> High
        </span>
      );
    }
    if (confidence >= 0.5) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
          <AlertTriangle className="w-3 h-3" /> Med
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
        <AlertCircle className="w-3 h-3" /> Low
      </span>
    );
  };

  const rows = [
    { label: "Revenue", data: metrics.revenue },
    { label: "Net Income", data: metrics.netIncome },
    { label: "EBITDA", data: metrics.ebitda },
    { label: "Operating Margin", data: metrics.operatingMargin },
    { label: "Cash Flow", data: metrics.cashFlow },
    { label: "Debt Structure", data: metrics.debt },
    ...(metrics.roe ? [{ label: "Return on Equity (ROE)", data: metrics.roe }] : []),
    ...(metrics.roa ? [{ label: "Return on Assets (ROA)", data: metrics.roa }] : []),
  ];

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-6">Financial Summary</h3>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Metric</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Extracted Value</th>
              <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-4 pr-4 text-sm font-medium text-slate-200 whitespace-nowrap align-top">
                  {row.label}
                </td>
                <td className="py-4 pr-4 text-sm text-slate-400 leading-relaxed align-top">
                  {row.data?.value || "Insufficient evidence."}
                </td>
                <td className="py-4 text-right align-top">
                  {getConfidenceBadge(row.data?.confidence || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
