"use client";

import { use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  Clock,
  Building2,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface Step {
  name: string;
  displayName: string;
  status: "completed" | "in_progress" | "pending" | "failed";
  duration?: string;
  output?: string;
}

const agentSteps: Step[] = [
  {
    name: "document_parser",
    displayName: "Document Parsing",
    status: "completed",
    duration: "45s",
    output: "Successfully parsed 3 documents (S-1 filing, prospectus, financial statements). Extracted 847 text blocks.",
  },
  {
    name: "company_profiler",
    displayName: "Company Profiling",
    status: "completed",
    duration: "32s",
    output: "Identified company as a mid-cap SaaS provider. Founded 2019, HQ: San Francisco. 450 employees.",
  },
  {
    name: "financial_analyzer",
    displayName: "Financial Analysis",
    status: "completed",
    duration: "1m 12s",
    output: "Revenue: $180M (YoY +42%). Gross margin: 72%. Net loss: -$28M. Burn rate improving. Cash runway: 18 months.",
  },
  {
    name: "market_researcher",
    displayName: "Market Research",
    status: "completed",
    duration: "58s",
    output: "TAM: $45B. SAM: $12B. Current market share: 1.5%. Key competitors: Salesforce, HubSpot, Zendesk.",
  },
  {
    name: "risk_assessor",
    displayName: "Risk Assessment",
    status: "completed",
    duration: "41s",
    output: "Identified 12 risk factors. High: customer concentration (top 5 = 35% revenue). Medium: regulatory, competition.",
  },
  {
    name: "valuation_modeler",
    displayName: "Valuation Modeling",
    status: "completed",
    duration: "1m 5s",
    output: "DCF valuation range: $2.1B - $2.8B. Comparable analysis: $2.4B median. Implied price range: $18 - $24/share.",
  },
  {
    name: "sentiment_analyzer",
    displayName: "Sentiment Analysis",
    status: "in_progress",
    duration: "Running...",
    output: "Analyzing 1,247 news articles and 89 analyst mentions. Processing social media sentiment...",
  },
  {
    name: "management_evaluator",
    displayName: "Management Evaluation",
    status: "pending",
    output: undefined,
  },
  {
    name: "regulatory_reviewer",
    displayName: "Regulatory Review",
    status: "pending",
    output: undefined,
  },
  {
    name: "competitive_analyzer",
    displayName: "Competitive Analysis",
    status: "pending",
    output: undefined,
  },
  {
    name: "synthesis_agent",
    displayName: "Report Synthesis",
    status: "pending",
    output: undefined,
  },
  {
    name: "quality_checker",
    displayName: "Quality Check",
    status: "pending",
    output: undefined,
  },
];

const statusIconMap = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  in_progress: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  pending: <Circle className="w-5 h-5 text-slate-600" />,
  failed: <AlertCircle className="w-5 h-5 text-red-400" />,
};

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const completedSteps = agentSteps.filter(
    (s) => s.status === "completed"
  ).length;
  const progress = Math.round((completedSteps / agentSteps.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back + header */}
        <div>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Analysis {id}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                GreenEnergy Inc — IPO Research Analysis
              </p>
            </div>
            <span className="badge badge-warning self-start">
              <Loader2 className="w-3 h-3 animate-spin" />
              In Progress
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Timeline — 3 cols */}
          <div className="xl:col-span-3 space-y-4">
            {/* Progress bar */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">
                  Overall Progress
                </p>
                <p className="text-sm font-bold text-blue-400">{progress}%</p>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {completedSteps} of {agentSteps.length} agents completed
              </p>
            </div>

            {/* Steps timeline */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-6">
                Agent Pipeline
              </h3>
              <div className="space-y-0">
                {agentSteps.map((step, i) => (
                  <div key={step.name} className="relative flex gap-4">
                    {/* Vertical line */}
                    {i < agentSteps.length - 1 && (
                      <div
                        className={`absolute left-[9px] top-6 w-0.5 h-full ${
                          step.status === "completed"
                            ? "bg-emerald-500/30"
                            : "bg-white/5"
                        }`}
                      />
                    )}

                    {/* Icon */}
                    <div className="flex-shrink-0 z-10 mt-0.5">
                      {statusIconMap[step.status]}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 pb-6 ${
                        step.status === "in_progress"
                          ? "glass-card-sm p-4 -ml-2 -mt-1"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <h4
                          className={`text-sm font-medium ${
                            step.status === "completed"
                              ? "text-white"
                              : step.status === "in_progress"
                              ? "text-blue-300"
                              : "text-slate-500"
                          }`}
                        >
                          {step.displayName}
                        </h4>
                        {step.duration && (
                          <span className="text-[10px] text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.duration}
                          </span>
                        )}
                      </div>
                      {step.output && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
                          {step.output}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                Job Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Company
                    </p>
                    <p className="text-sm text-white font-medium">
                      GreenEnergy Inc
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Analyst
                    </p>
                    <p className="text-sm text-white">James Miller</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Started
                    </p>
                    <p className="text-sm text-white">Jul 10, 2026 09:14</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                      Documents
                    </p>
                    <p className="text-sm text-white">3 files</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Agent Outputs
              </h3>
              <div className="space-y-2">
                {agentSteps
                  .filter((s) => s.status === "completed")
                  .map((step) => (
                    <button
                      key={step.name}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                        {step.displayName}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        View output →
                      </p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
