"use client";

import { useState, useEffect, use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatPanel from "@/components/ChatPanel";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import {
  CheckCircle2,
  Loader2,
  Circle,
  AlertCircle,
  Clock,
  ChevronRight,
  Search,
  Activity,
  FileText,
  BrainCircuit,
  Zap
} from "lucide-react";

interface JobStep {
  id: string;
  step_name: string;
  step_order: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface Job {
  id: string;
  job_type: string;
  status: string;
  progress: number;
  created_at: string;
  started_at: string | null;
}

const statusIconMap = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  running: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  pending: <Circle className="w-5 h-5 text-slate-600/50" />,
  failed: <AlertCircle className="w-5 h-5 text-red-400" />,
};

const getStatusMessage = (status: string, stepName: string) => {
  if (status === "completed") return `Successfully completed ${stepName.toLowerCase()}.`;
  if (status === "running") return `AI is actively processing ${stepName.toLowerCase()}...`;
  if (status === "failed") return `Error encountered during ${stepName.toLowerCase()}.`;
  return `Waiting to start ${stepName.toLowerCase()}...`;
};

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState<JobStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [selectedAgentOutput, setSelectedAgentOutput] = useState<string | null>(null);
  const [showCitations, setShowCitations] = useState<{title: string; text: string; citations: string[]} | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"dashboard" | "chat">("dashboard");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchJob = async () => {
      try {
        const [jobRes, stepsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/jobs/${id}`),
          fetch(`http://localhost:8000/api/v1/jobs/${id}/steps`)
        ]);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          setJob(jobData);
          if (jobData.started_at && jobData.status !== "completed" && jobData.status !== "failed") {
            const start = new Date(jobData.started_at).getTime();
            setElapsedTime(Math.floor((Date.now() - start) / 1000));
          }
          if (jobData.status === "completed" && !result) {
            const resultRes = await fetch(`http://localhost:8000/api/v1/jobs/${id}/result`);
            if (resultRes.ok) {
              setResult(await resultRes.json());
            }
          }
        }
        if (stepsRes.ok) {
          const stepsData = await stepsRes.json();
          setSteps(stepsData);
          // Auto-select latest completed step if nothing selected
          if (!selectedAgentOutput) {
            const completed = [...stepsData].reverse().find(s => s.status === "completed");
            if (completed) setSelectedAgentOutput(completed.step_name);
          }
        }
      } catch (e) {
        console.error("Failed to fetch job", e);
      }
    };

    fetchJob();
    intervalId = setInterval(fetchJob, 2000);

    return () => clearInterval(intervalId);
  }, [id, result, selectedAgentOutput]);

  const handleCitationClick = (citations: string[], text: string) => {
    setShowCitations({
      title: "Citation Reference",
      text: text,
      citations: citations,
    });
  };

  const renderAgentResult = (agentName: string | null) => {
    if (!result || !agentName) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 p-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-blue-400/50" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">AI Analysis Engine</p>
            <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed">
              Real-time insights will appear here as the LangGraph agents process the document.
            </p>
          </div>
        </div>
      );
    }
    
    let data = null;
    const nameLower = agentName.toLowerCase();
    if (nameLower.includes("business")) data = result.business_analysis;
    else if (nameLower.includes("financial")) data = result.financial_analysis;
    else if (nameLower.includes("risk")) data = result.risk_assessment;
    else if (nameLower.includes("valuation")) data = result.valuation;
    else if (nameLower.includes("governance")) data = result.governance_analysis;
    else data = result[agentName];

    if (!data) return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-400">Data for {agentName} is being formatted...</p>
      </div>
    );
    
    return (
      <div className="space-y-4 p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{agentName} Findings</h3>
            <p className="text-xs text-slate-400">Extracted by AI Agent</p>
          </div>
        </div>
        {Object.entries(data).map(([key, val]: [string, any]) => {
          if (!val) return null;
          let displayValue = "";
          let citations: string[] = [];
          if (typeof val === "object" && val !== null) {
            if (val.value !== undefined) displayValue = String(val.value);
            if (val.citations && Array.isArray(val.citations)) citations = val.citations;
          } else {
            displayValue = String(val);
          }
          if (!displayValue || displayValue === "Insufficient evidence.") return null;
          
          return (
            <div key={key} className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
              <h5 className="text-xs font-medium text-blue-300/80 uppercase tracking-wider mb-2">{key.replace(/_/g, " ")}</h5>
              <p className="text-sm text-slate-200 leading-relaxed">{displayValue}</p>
              {citations.length > 0 && (
                <button 
                  onClick={() => handleCitationClick(citations, displayValue)}
                  className="mt-3 text-xs flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Search className="w-3 h-3" /> View {citations.length} Citations
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // If completed, show dashboard
  if (job?.status === "completed" && result) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h1 className="text-2xl font-bold text-white tracking-tight">Investment Analysis</h1>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "dashboard" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Executive Summary
              </button>
              <button 
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "chat" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
              >
                Investor Copilot
              </button>
            </div>
          </div>
          {activeTab === "dashboard" ? (
            <ExecutiveDashboard result={result} />
          ) : (
            <div className="h-[calc(100vh-180px)]">
              <ChatPanel documentId={id} />
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Live Analysis View
  const currentStep = steps.find(s => s.status === "running") || steps.find(s => s.status === "pending");
  const progress = job ? job.progress : 0;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <Activity className="w-6 h-6 text-blue-400 animate-pulse" />
              AI Analysis in Progress
            </h1>
            <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Document ID: {id.split("-")[0]}
            </p>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Elapsed Time</p>
              <p className="text-lg font-mono text-white flex items-center gap-2 justify-end">
                <Clock className="w-4 h-4 text-blue-400" />
                {formatTime(elapsedTime)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Progress</p>
              <p className="text-lg font-mono text-emerald-400">{Math.round(progress)}%</p>
            </div>
          </div>
        </div>

        {/* Main Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Left: Timeline */}
          <div className="col-span-1 lg:col-span-4 flex flex-col min-h-0 bg-[#0B1121] rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white">LangGraph Execution</h3>
              <p className="text-xs text-slate-400 mt-1">Multi-Agent Orchestration</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {steps.map((step, i) => (
                <div key={step.id} className="relative flex gap-4 group cursor-pointer" onClick={() => step.status === "completed" && setSelectedAgentOutput(step.step_name)}>
                  {i < steps.length - 1 && (
                    <div className={`absolute left-[11px] top-7 w-[2px] h-full ${step.status === "completed" ? "bg-emerald-500/50" : "bg-white/5"}`} />
                  )}
                  <div className="flex-shrink-0 relative z-10 bg-[#0B1121] py-1">
                    {statusIconMap[step.status]}
                  </div>
                  <div className={`flex-1 pb-2 transition-all ${step.status === "running" ? "transform translate-x-1" : ""}`}>
                    <h4 className={`text-sm font-medium ${step.status === "completed" ? "text-white" : step.status === "running" ? "text-blue-400 font-semibold" : "text-slate-500"}`}>
                      {step.step_name}
                    </h4>
                    <p className={`text-xs mt-1 ${step.status === "running" ? "text-blue-300/80" : "text-slate-500"}`}>
                      {getStatusMessage(step.status, step.step_name)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Findings */}
          <div className="col-span-1 lg:col-span-8 flex flex-col min-h-0 bg-[#0B1121] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {renderAgentResult(selectedAgentOutput || (currentStep ? currentStep.step_name : null))}
            </div>
          </div>

        </div>

        {/* Citations Modal */}
        {showCitations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md">
            <div className="bg-[#0B1121] max-w-2xl w-full max-h-[80vh] flex flex-col rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  {showCitations.title}
                </h3>
                <button 
                  onClick={() => setShowCitations(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Extracted Finding</h4>
                  <p className="text-sm text-slate-200 bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                    {showCitations.text}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">Supporting Evidence ({showCitations.citations.length})</h4>
                  <div className="space-y-3">
                    {showCitations.citations.map((cit, i) => (
                      <div key={i} className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-sm text-slate-300 leading-relaxed font-serif italic">
                        "{cit}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
