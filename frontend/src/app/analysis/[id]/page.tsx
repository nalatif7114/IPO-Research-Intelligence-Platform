"use client";

import { useState, useEffect, use } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ChatPanel from "@/components/ChatPanel";
import DocumentViewer from "@/components/DocumentViewer";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import {
  Check,
  Loader2,
  Clock,
  Activity,
  FileText,
  Database,
  Layers,
  Search,
  Sparkles,
  Zap,
  LayoutDashboard,
  MessageSquare
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

const PIPELINE_STEPS = [
  "Document Intake",
  "OCR & Parsing",
  "Chunking",
  "Embedding",
  "Business Analysis",
  "Financial Analysis",
  "Risk Assessment",
  "Governance Analysis",
  "Valuation",
  "Report Synthesis",
  "Final Evaluation"
];

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState<JobStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"dashboard" | "copilot">("dashboard");
  const [selectedPage, setSelectedPage] = useState<number>(1);

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
        }
      } catch (e) {
        console.error("Failed to fetch job", e);
      }
    };

    fetchJob();
    intervalId = setInterval(fetchJob, 2000);

    return () => clearInterval(intervalId);
  }, [id, result]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // COMPLETED VIEW (Executive Dashboard or Copilot)
  // -------------------------------------------------------------
  if (job?.status === "completed" && result) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-glass)] flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h1 className="text-[20px] font-bold text-white tracking-tight">PT GoTo Gojek Tokopedia Tbk</h1>
              </div>
              <p className="text-[12px] text-[var(--text-muted)] ml-11">IDX: GOTO • Technology • E-Commerce</p>
            </div>
            
            <div className="flex flex-col items-end mt-4 sm:mt-0">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-[var(--success)]" />
                <span className="text-[13px] font-medium text-[var(--success)]">Analysis Completed</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">Jul 12, 2026 14:32</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 border-b border-[var(--border-glass)] pb-4">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-[10px] transition-all ${activeTab === "dashboard" ? "bg-[var(--bg-card)] text-white border border-[var(--border-glass)] shadow-md" : "text-[var(--text-secondary)] hover:text-white"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Executive Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-[10px] transition-all ${activeTab === "copilot" ? "bg-[var(--bg-card)] text-white border border-[var(--border-glass)] shadow-md" : "text-[var(--text-secondary)] hover:text-white"}`}
            >
              <MessageSquare className="w-4 h-4" />
              Investor Copilot
            </button>
          </div>

          {/* Content */}
          {activeTab === "dashboard" ? (
            <ExecutiveDashboard result={result} />
          ) : (
            <div className="h-[calc(100vh-210px)] flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-[40%] min-w-[350px]">
                <ChatPanel documentId={id} onSelectPage={(pg) => setSelectedPage(pg)} />
              </div>
              <div className="hidden lg:block lg:flex-1">
                <DocumentViewer documentId={id} pageNumber={selectedPage} />
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // RUNNING / LIVE VIEW
  // -------------------------------------------------------------
  const currentStepIndex = PIPELINE_STEPS.findIndex(s => {
    const runningStep = steps.find(st => st.status === "running");
    return runningStep?.step_name === s;
  });
  const currentAgentName = currentStepIndex !== -1 ? PIPELINE_STEPS[currentStepIndex] + " Agent" : "AI Agent";
  const progress = job ? job.progress : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-white tracking-tight">Analyzing: PT GoTo Gojek Tokopedia Tbk</h1>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">ID: {id}</p>
            </div>
          </div>
          
          <div className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-glass)] flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Elapsed Time</span>
            <span className="text-[16px] font-mono text-white font-medium">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
          
          {/* COLUMN 1: Pipeline Timeline */}
          <div className="col-span-1 lg:col-span-3 flex flex-col min-h-0 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-glass)]">
              <h3 className="text-[14px] font-semibold text-white">Analysis Pipeline</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <div className="space-y-0 relative">
                {PIPELINE_STEPS.map((stepName, index) => {
                  const stepData = steps.find(s => s.step_name === stepName);
                  const status = stepData?.status || "pending";
                  const isLast = index === PIPELINE_STEPS.length - 1;
                  
                  return (
                    <div key={index} className="relative flex gap-4 pb-6 group">
                      {!isLast && (
                        <div className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${status === "completed" ? "bg-[var(--primary)]" : "bg-[var(--border-glass)]"}`} />
                      )}
                      
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 bg-[var(--bg-card)] ${
                        status === "completed" ? "border-[var(--primary)] text-[var(--primary)]" :
                        status === "running" ? "border-[var(--accent)] text-white bg-[var(--accent)]" :
                        "border-[var(--text-muted)]/30 text-[var(--text-muted)]"
                      }`}>
                        {status === "completed" ? <Check className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center -mt-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-[13px] font-medium ${status === "running" ? "text-white" : "text-[var(--text-secondary)]"}`}>
                            {stepName}
                          </h4>
                          {status === "completed" && <span className="text-[10px] font-mono text-[var(--text-muted)]">00:01:12</span>}
                        </div>
                        <span className={`text-[11px] ${
                          status === "completed" ? "text-[var(--success)]" :
                          status === "running" ? "text-[var(--accent)]" :
                          "text-[var(--text-muted)]"
                        }`}>
                          {status === "running" ? "In Progress" : status === "pending" ? "Queued" : "Completed"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Current Agent & Findings */}
          <div className="col-span-1 lg:col-span-6 flex flex-col gap-5 min-h-0">
            
            {/* Current Agent Card */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 shadow-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Current Agent</p>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[var(--success)]" />
                  <h3 className="text-[16px] font-semibold text-white">{currentAgentName}</h3>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" /> Active
              </div>
            </div>

            {/* Live Findings Preview */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 shadow-xl">
              <h3 className="text-[14px] font-semibold text-white mb-4">Live Findings (Preview)</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                  Revenue grew 24.5% CAGR (2021-2023)
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                  Gross margin improvement to 28.7%
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                  EBITDA margin expanded to 6.1%
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mt-1.5 flex-shrink-0" />
                  Operating cash flow turned positive in 2023
                </li>
              </ul>
              <p className="text-[12px] text-[var(--text-muted)] italic mt-4">Extracting more insights...</p>
            </div>

            {/* Agent Output Live */}
            <div className="flex-1 bg-[#0a0e17] rounded-[24px] border border-[var(--border-glass)] p-5 shadow-xl flex flex-col min-h-0 relative overflow-hidden">
              <h3 className="text-[14px] font-semibold text-white mb-3">Agent Output (Live)</h3>
              <div className="flex-1 overflow-y-auto font-mono text-[11px] text-[var(--text-secondary)] leading-relaxed">
                <pre className="whitespace-pre-wrap">
{`{
  "revenue": {
    "2021": 11357,
    "2022": 14476,
    "2023": 18123,
    "cagr": 24.5
  },
  "gross_margin": {
    "2021": 22.1,
    "2022": 26.3,
    "2023": 28.7
  }
}`}
                </pre>
                <div className="flex items-center gap-2 mt-4 text-[var(--accent)] animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Streaming...
                </div>
              </div>
            </div>
            
          </div>

          {/* COLUMN 3: Progress & Stats */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-5 min-h-0">
            
            {/* Analysis Progress */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-xl flex flex-col items-center justify-center text-center">
              <h3 className="text-[13px] font-medium text-white mb-6 w-full text-left">Analysis Progress</h3>
              
              {/* Fake Circular Progress */}
              <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] font-bold text-white leading-none">{Math.round(progress)}%</span>
                  <span className="text-[9px] text-[var(--text-muted)] uppercase mt-1">Overall Progress</span>
                </div>
              </div>

              <div className="w-full">
                <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Estimated Time Remaining</p>
                <p className="text-[16px] font-mono text-white">00:16:35</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex-1 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 shadow-xl flex flex-col">
              <h3 className="text-[13px] font-medium text-white mb-4">Statistics</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-glass)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Pages Processed</p>
                    <p className="text-[13px] font-semibold text-white">156 / 486</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-glass)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Tokens Used</p>
                    <p className="text-[13px] font-semibold text-white">1.2M / 4.0M</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20">
                  <div className="w-8 h-8 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--success)] uppercase">Chunks Retrieved</p>
                    <p className="text-[13px] font-semibold text-[var(--success)]">512</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20">
                  <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 flex items-center justify-center">
                    <Search className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#0EA5E9] uppercase">Sources Found</p>
                    <p className="text-[13px] font-semibold text-[#0EA5E9]">132</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 shadow-xl">
              <h3 className="text-[13px] font-medium text-white mb-3">System Status</h3>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--success)]">
                <Check className="w-4 h-4" /> All Systems Operational
              </div>
            </div>

          </div>

        </div>

        <div className="text-center mt-6">
          <p className="text-[12px] text-[var(--text-muted)] animate-pulse flex items-center justify-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI agents are working... This may take a few minutes.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
