"use client";

import { useState, useEffect, use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatPanel from "@/components/ChatPanel";
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
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";

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
}

const statusIconMap = {
  completed: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  running: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
  pending: <Circle className="w-5 h-5 text-slate-600" />,
  failed: <AlertCircle className="w-5 h-5 text-red-400" />,
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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchJob = async () => {
      try {
        const [jobRes, stepsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/jobs/${id}`),
          fetch(`http://localhost:8000/api/v1/jobs/${id}/steps`)
        ]);
        if (jobRes.ok) setJob(await jobRes.json());
        if (stepsRes.ok) {
          const stepsData = await stepsRes.json();
          setSteps(stepsData);
        }
        
        // if completed, fetch result
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.status === "completed") {
            const resultRes = await fetch(`http://localhost:8000/api/v1/jobs/${id}/result`);
            if (resultRes.ok) {
              setResult(await resultRes.json());
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch job", e);
      }
    };

    fetchJob();
    intervalId = setInterval(() => {
      fetchJob();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [id]);

  const completedStepsCount = steps.filter((s) => s.status === "completed").length;
  const progress = job ? job.progress : 0;
  
  const handleCitationClick = (citations: string[], text: string) => {
    setShowCitations({
      title: "Citation Reference",
      text: text,
      citations: citations,
    });
  };

  const renderAgentResult = (agentName: string) => {
    if (!result) return <p className="text-slate-400 text-sm">No result available yet.</p>;
    
    // Attempt to find the specific state key for the agent
    let data = null;
    if (agentName.toLowerCase().includes("business")) data = result.business_analysis;
    else if (agentName.toLowerCase().includes("financial")) data = result.financial_analysis;
    else if (agentName.toLowerCase().includes("risk")) data = result.risk_assessment;
    else if (agentName.toLowerCase().includes("valuation")) data = result.valuation;
    else if (agentName.toLowerCase().includes("governance")) data = result.governance_analysis;
    else data = result[agentName];

    if (!data) return <p className="text-slate-400 text-sm">No specific output for this agent found in the final state.</p>;
    
    // Render dynamic JSON as readable UI with citations
    return (
      <div className="space-y-4">
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
          
          return (
            <div key={key} className="p-3 rounded-lg bg-white/5">
              <h5 className="text-xs text-slate-500 uppercase tracking-wider mb-1">{key.replace(/_/g, " ")}</h5>
              <p className="text-sm text-slate-200">{displayValue}</p>
              {citations.length > 0 && (
                <button 
                  onClick={() => handleCitationClick(citations, displayValue)}
                  className="mt-2 text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in relative">
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
                Analysis {id.substring(0, 8)}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                IPO Research Execution Pipeline
              </p>
            </div>
            {job && (
              <span className={`badge ${job.status === "completed" ? "badge-success" : job.status === "failed" ? "badge-error" : "badge-warning"} self-start`}>
                {job.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Progress bar */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-white">
                  Overall Progress
                </p>
                <p className="text-sm font-bold text-blue-400">{Math.round(progress)}%</p>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {completedStepsCount} of {steps.length > 0 ? steps.length : "-"} pipeline steps completed
              </p>
            </div>

            {/* Main Tabs/View: Timeline vs Output vs Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Steps timeline */}
              <div className="glass-card p-6 h-[500px] overflow-y-auto">
                <h3 className="text-sm font-semibold text-white mb-6 sticky top-0 bg-[#0f172a]/90 backdrop-blur pb-2 z-20">
                  Agent Pipeline Execution
                </h3>
                {steps.length === 0 && <p className="text-slate-500 text-sm">Initializing pipeline...</p>}
                
                <div className="space-y-0">
                  {steps.map((step, i) => (
                    <div key={step.id} className="relative flex gap-4">
                      {/* Vertical line */}
                      {i < steps.length - 1 && (
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
                        {statusIconMap[step.status] || <Circle className="w-5 h-5 text-slate-600" />}
                      </div>

                      {/* Content */}
                      <div
                        className={`flex-1 pb-6 ${
                          step.status === "running"
                            ? "glass-card-sm p-4 -ml-2 -mt-1"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-medium cursor-pointer hover:underline ${
                              step.status === "completed"
                                ? "text-white"
                                : step.status === "running"
                                ? "text-blue-300"
                                : "text-slate-500"
                            }`}
                            onClick={() => {
                              if (step.status === "completed") {
                                setSelectedAgentOutput(step.step_name);
                              }
                            }}
                          >
                            {step.step_name}
                          </h4>
                          {step.status === "completed" && (
                            <button 
                              onClick={() => setSelectedAgentOutput(step.step_name)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center"
                            >
                              View Output <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {step.error_message && (
                          <p className="text-xs text-red-400 mt-1.5 leading-relaxed">
                            {step.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Panel / Output Panel */}
              <div className="h-[500px]">
                {selectedAgentOutput ? (
                  <div className="glass-card h-full flex flex-col">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        {selectedAgentOutput} Output
                      </h3>
                      <button 
                        onClick={() => setSelectedAgentOutput(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                      {renderAgentResult(selectedAgentOutput)}
                    </div>
                  </div>
                ) : (
                  <ChatPanel documentId={id} />
                )}
              </div>
            </div>

          </div>

          {/* Metadata sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">
                Job Details
              </h3>
              {job ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Job ID
                      </p>
                      <p className="text-xs font-mono text-white">
                        {job.id.substring(0, 13)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Created
                      </p>
                      <p className="text-sm text-white">{new Date(job.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        Status
                      </p>
                      <p className="text-sm text-white capitalize">{job.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Loading details...</p>
              )}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3">
                Agent Caches
              </h3>
              <div className="space-y-2">
                {steps
                  .filter((s) => s.status === "completed" && result)
                  .map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedAgentOutput(step.step_name)}
                      className="w-full text-left p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group flex items-center justify-between"
                    >
                      <p className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                        {step.step_name}
                      </p>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                    </button>
                  ))}
                {(!steps.some(s => s.status === "completed") || !result) && (
                  <p className="text-xs text-slate-500">Waiting for agents to complete...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Citations Modal Overlay */}
        {showCitations && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-sm font-semibold text-white">{showCitations.title}</h3>
                <button 
                  onClick={() => setShowCitations(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Claim / Conclusion</h4>
                  <p className="text-sm text-slate-200 bg-black/20 p-3 rounded-lg border border-white/5">
                    {showCitations.text}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Evidence Chunks ({showCitations.citations.length})</h4>
                  <div className="space-y-3">
                    {showCitations.citations.map((cit, i) => (
                      <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                        {cit}
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
