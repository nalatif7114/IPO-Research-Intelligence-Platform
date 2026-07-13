import { Target, TrendingUp, Award, Zap } from "lucide-react";

interface QualityMetricProps {
  title: string;
  value: string;
  icon: any;
  sentiment?: "positive" | "neutral" | "negative";
}

function QualityMetric({ title, value, icon: Icon, sentiment = "neutral" }: QualityMetricProps) {
  let colorClass = "text-slate-400";
  let bgClass = "bg-white/5";
  
  if (sentiment === "positive") {
    colorClass = "text-emerald-400";
    bgClass = "bg-emerald-500/10";
  } else if (sentiment === "negative") {
    colorClass = "text-red-400";
    bgClass = "bg-red-500/10";
  }

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className={`p-3 rounded-lg h-fit ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-sm text-slate-200 leading-relaxed">{value || "Insufficient data."}</p>
      </div>
    </div>
  );
}

interface BusinessQualityCardProps {
  businessModel: string;
  competitiveAdvantage: string;
  industryPosition: string;
  growthDrivers: string[];
}

export default function BusinessQualityCard({ businessModel, competitiveAdvantage, industryPosition, growthDrivers }: BusinessQualityCardProps) {
  // Simple heuristic for sentiment based on text length and positive keywords (mock implementation)
  const isPositive = (text: string) => text?.length > 50 && !text.includes("Insufficient");

  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-6">Business Quality</h3>
      
      <div className="space-y-4 flex-1">
        <QualityMetric 
          title="Business Model" 
          value={businessModel} 
          icon={Target} 
          sentiment={isPositive(businessModel) ? "positive" : "neutral"}
        />
        
        <QualityMetric 
          title="Competitive Advantage" 
          value={competitiveAdvantage} 
          icon={Award} 
          sentiment={isPositive(competitiveAdvantage) ? "positive" : "neutral"}
        />
        
        <QualityMetric 
          title="Market Position" 
          value={industryPosition} 
          icon={Zap} 
          sentiment={isPositive(industryPosition) ? "positive" : "neutral"}
        />
        
        <QualityMetric 
          title="Growth Potential" 
          value={growthDrivers?.length ? growthDrivers.join(" • ") : "No growth drivers identified."} 
          icon={TrendingUp} 
          sentiment={growthDrivers?.length > 1 ? "positive" : "neutral"}
        />
      </div>
    </div>
  );
}
