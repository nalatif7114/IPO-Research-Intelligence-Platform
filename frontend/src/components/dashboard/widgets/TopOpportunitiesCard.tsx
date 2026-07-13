import { Lightbulb, Check } from "lucide-react";

interface TopOpportunitiesCardProps {
  opportunities: string[];
}

export default function TopOpportunitiesCard({ opportunities }: TopOpportunitiesCardProps) {
  return (
    <div className="glass-card p-6 flex flex-col h-full bg-gradient-to-br from-emerald-900/10 to-teal-900/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Lightbulb className="w-5 h-5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">Top Opportunities</h3>
      </div>
      
      <div className="space-y-3 flex-1">
        {opportunities.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No major opportunities identified.</p>
        ) : (
          opportunities.map((opp, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">{opp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
