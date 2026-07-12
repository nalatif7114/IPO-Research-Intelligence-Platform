import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, HelpCircle } from "lucide-react";

interface RecommendationCardProps {
  recommendation: string;
  confidence: number;
  healthScore: number;
}

export default function RecommendationCard({ recommendation, confidence, healthScore }: RecommendationCardProps) {
  // Normalize recommendation string
  const rec = recommendation?.toUpperCase() || "UNKNOWN";
  
  let recColor = "text-slate-400";
  let recBg = "bg-slate-500/10 border-slate-500/20";
  let Icon = HelpCircle;

  if (rec.includes("BUY")) {
    recColor = "text-emerald-400";
    recBg = "bg-emerald-500/10 border-emerald-500/20";
    Icon = TrendingUp;
  } else if (rec.includes("HOLD")) {
    recColor = "text-yellow-400";
    recBg = "bg-yellow-500/10 border-yellow-500/20";
    Icon = AlertTriangle;
  } else if (rec.includes("SELL")) {
    recColor = "text-red-400";
    recBg = "bg-red-500/10 border-red-500/20";
    Icon = XCircle;
  }

  // Health score circle circumference (r=36, c=2*pi*36 ~= 226)
  const circumference = 226;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;
  
  let scoreColor = "text-slate-400";
  if (healthScore >= 80) scoreColor = "text-emerald-400";
  else if (healthScore >= 60) scoreColor = "text-yellow-400";
  else if (healthScore > 0) scoreColor = "text-red-400";

  return (
    <div className="glass-card p-6 flex flex-col sm:flex-row items-center gap-8 justify-between">
      {/* Recommendation Side */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Investment Recommendation</h3>
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border ${recBg}`}>
          <Icon className={`w-8 h-8 ${recColor}`} />
          <div>
            <p className={`text-2xl font-bold tracking-tight ${recColor}`}>{rec}</p>
            <p className="text-xs text-slate-500 font-medium">Confidence: {Math.round(confidence * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Health Score Gauge */}
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">IPO Health Score</h3>
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90 transform absolute">
            <circle
              cx="64"
              cy="64"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-white/5"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${scoreColor} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="text-center z-10 flex flex-col items-center justify-center mt-1">
            <span className={`text-3xl font-bold ${scoreColor}`}>{Math.round(healthScore)}</span>
            <span className="text-[10px] text-slate-500 font-medium -mt-1">/ 100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
