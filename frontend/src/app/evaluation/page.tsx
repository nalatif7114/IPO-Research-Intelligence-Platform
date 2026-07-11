"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Target,
  ShieldCheck,
  BookCheck,
  BarChart3,
  FileText,
  Star,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react";

/* ── Mock Data ────────────────────────────────────────────────── */
const overallScore = 87.4;

const metrics = [
  {
    label: "Groundedness",
    score: 91.2,
    trend: 3.4,
    icon: ShieldCheck,
    color: "from-emerald-500 to-emerald-600",
    description: "Claims supported by cited sources",
  },
  {
    label: "Completeness",
    score: 84.6,
    trend: 1.8,
    icon: BookCheck,
    color: "from-blue-500 to-blue-600",
    description: "Coverage of required analysis areas",
  },
  {
    label: "Consistency",
    score: 89.1,
    trend: -0.5,
    icon: Target,
    color: "from-purple-500 to-purple-600",
    description: "Internal coherence across sections",
  },
  {
    label: "Readability",
    score: 85.0,
    trend: 2.1,
    icon: FileText,
    color: "from-amber-500 to-amber-600",
    description: "Clarity and professional language use",
  },
];

const recentEvaluations = [
  {
    id: "EVL-001",
    reportId: "RPT-001",
    company: "TechCorp Global",
    score: 94,
    groundedness: 96,
    consistency: 93,
    evaluator: "Sarah Chen",
    date: "2026-07-10",
  },
  {
    id: "EVL-002",
    reportId: "RPT-002",
    company: "NanoMaterials Ltd",
    score: 88,
    groundedness: 90,
    consistency: 87,
    evaluator: "James Miller",
    date: "2026-07-09",
  },
  {
    id: "EVL-003",
    reportId: "RPT-003",
    company: "AeroSpace Dynamics",
    score: 91,
    groundedness: 94,
    consistency: 89,
    evaluator: "Alex Kumar",
    date: "2026-07-08",
  },
  {
    id: "EVL-004",
    reportId: "RPT-004",
    company: "CloudScale AI",
    score: 76,
    groundedness: 72,
    consistency: 80,
    evaluator: "Sarah Chen",
    date: "2026-07-08",
  },
  {
    id: "EVL-005",
    reportId: "RPT-005",
    company: "GreenEnergy Inc",
    score: 82,
    groundedness: 85,
    consistency: 79,
    evaluator: "James Miller",
    date: "2026-07-07",
  },
  {
    id: "EVL-006",
    reportId: "RPT-006",
    company: "FinLedger Systems",
    score: 89,
    groundedness: 91,
    consistency: 88,
    evaluator: "Alex Kumar",
    date: "2026-07-06",
  },
];

const feedbackHistory = [
  {
    id: 1,
    company: "TechCorp Global",
    evaluator: "Sarah Chen",
    date: "2026-07-10",
    feedback:
      "Excellent report with comprehensive financial analysis. Minor improvement needed in competitive landscape section — suggest adding more direct comparisons with top 3 competitors.",
    rating: 5,
  },
  {
    id: 2,
    company: "CloudScale AI",
    evaluator: "Sarah Chen",
    date: "2026-07-08",
    feedback:
      "Risk section lacks detail on regulatory compliance in EU markets. Revenue projections should include sensitivity analysis. Sources need stronger verification for market size claims.",
    rating: 3,
  },
  {
    id: 3,
    company: "NanoMaterials Ltd",
    evaluator: "James Miller",
    date: "2026-07-09",
    feedback:
      "Strong technical analysis of product differentiation. Recommend expanding the management team assessment section and adding historical IPO comparisons from the materials sector.",
    rating: 4,
  },
  {
    id: 4,
    company: "AeroSpace Dynamics",
    evaluator: "Alex Kumar",
    date: "2026-07-08",
    feedback:
      "Well-structured report. The TAM analysis is particularly thorough. Consider adding a section on government contract dependencies and geopolitical risk factors.",
    rating: 4,
  },
];

/* ── Score Ring ────────────────────────────────────────────────── */
function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90
      ? "#22c55e"
      : score >= 80
      ? "#3b82f6"
      : score >= 70
      ? "#eab308"
      : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 10px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

/* ── Metric Bar ───────────────────────────────────────────────── */
function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function EvaluationPage() {
  function scoreColor(s: number) {
    if (s >= 90) return "text-emerald-400";
    if (s >= 80) return "text-blue-400";
    if (s >= 70) return "text-amber-400";
    return "text-red-400";
  }

  function scoreBadge(s: number) {
    if (s >= 90) return "badge-success";
    if (s >= 80) return "badge-info";
    if (s >= 70) return "badge-warning";
    return "badge-error";
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluation Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor report quality, review scores, and track feedback.
          </p>
        </div>

        {/* ── Top Section: Overall + Metrics ─────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Overall score */}
          <div className="xl:col-span-1 glass-card p-6 flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Overall Score
            </h3>
            <ScoreRing score={overallScore} />
            <div className="flex items-center gap-1 mt-4 text-xs">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">+2.1%</span>
              <span className="text-slate-500 ml-1">vs last month</span>
            </div>
          </div>

          {/* Quality metric cards */}
          <div className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const isPositive = metric.trend >= 0;
              return (
                <div
                  key={metric.label}
                  className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 glow-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-xs font-semibold ${
                        isPositive ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isPositive ? "+" : ""}
                      {metric.trend}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {metric.score}
                    <span className="text-sm text-slate-500 font-normal ml-0.5">
                      %
                    </span>
                  </p>
                  <p className="text-xs font-semibold text-slate-300 mt-0.5">
                    {metric.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {metric.description}
                  </p>
                  <div className="mt-3">
                    <MetricBar value={metric.score} color={metric.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Evaluations Table ────────────────────────── */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Recent Evaluations
            </h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-3 text-left font-medium">Report</th>
                  <th className="px-6 py-3 text-left font-medium">Company</th>
                  <th className="px-6 py-3 text-left font-medium">Score</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Groundedness
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Consistency
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Evaluator</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentEvaluations.map((ev) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-blue-400">
                        {ev.reportId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {ev.company}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${scoreBadge(ev.score)}`}>
                        {ev.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${scoreColor(ev.groundedness)}`}>
                        {ev.groundedness}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${scoreColor(ev.consistency)}`}>
                        {ev.consistency}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {ev.evaluator}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{ev.date}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Feedback History ────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            Feedback History
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
            {feedbackHistory.map((fb) => (
              <div
                key={fb.id}
                className="glass-card p-5 hover:scale-[1.01] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {fb.company}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {fb.evaluator}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fb.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < fb.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {fb.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
