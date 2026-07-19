"use client";

import { useState, useEffect, useRef, use } from "react";
import * as import_react from "react";
import { PageFrame } from "@/components/platform/platform-shell";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import InvestorCopilot from "@/components/copilot/InvestorCopilot";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";
import { useSearchParams } from "next/navigation";
import {
  Check,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  X
} from "lucide-react";
import apiClient from "@/lib/api";

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
  completed_at: string | null;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export default function AnalysisDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <import_react.Suspense fallback={<PageFrame>Loading...</PageFrame>}>
      <AnalysisDetailPageInner {...props} />
    </import_react.Suspense>
  );
}

function AnalysisDetailPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState<JobStep[]>([]);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"dashboard" | "copilot">(
    (searchParams.get("tab") as "dashboard" | "copilot") || "dashboard"
  );
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Refs for polling correctness
  const resultRequestedRef = useRef(false);
  const terminalRef = useRef(false);
  const inFlightRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const fetchJob = async () => {
      // Guard: don't fire if already in-flight or terminal
      if (inFlightRef.current || terminalRef.current) return;
      inFlightRef.current = true;

      const thisRequest = ++requestIdRef.current;

      try {
        const [jobResponse, stepsResponse, logsResponse] = await Promise.all([
          apiClient.get<Job>(`/jobs/${id}`),
          apiClient.get<JobStep[]>(`/jobs/${id}/steps`),
          apiClient.get<any[]>(`/jobs/${id}/logs`).catch(() => ({ data: [] }))
        ]);

        // Discard stale responses
        if (cancelled || thisRequest !== requestIdRef.current) return;

        const jobData = jobResponse.data;
        setJob((current) => {
          if (
            current &&
            current.status === jobData.status &&
            current.progress === jobData.progress &&
            current.started_at === jobData.started_at &&
            current.completed_at === jobData.completed_at
          ) {
            return current; // Referentially stable — no re-render
          }
          return jobData;
        });

        // Fetch result once on completion
        if (jobData.status === "completed" && !resultRequestedRef.current) {
          resultRequestedRef.current = true;
          const resultResponse = await apiClient.get(`/jobs/${id}/result`);
          if (!cancelled && thisRequest === requestIdRef.current) {
            setResult(resultResponse.data);
          }
        }

        const stepsData = stepsResponse.data;
        setSteps((current) => {
          // Compare by serializing only if lengths match to avoid unnecessary work
          if (current.length === stepsData.length) {
            const changed = stepsData.some(
              (s, i) =>
                s.status !== current[i].status ||
                s.progress !== current[i].progress ||
                s.started_at !== current[i].started_at ||
                s.completed_at !== current[i].completed_at
            );
            if (!changed) return current; // Referentially stable
          }
          return stepsData;
        });

        const logsData = logsResponse.data;
        setLogs((current) => {
          if (current.length === logsData.length) return current;
          return logsData;
        });

        // Stop polling on terminal state
        if (TERMINAL_STATUSES.has(jobData.status)) {
          terminalRef.current = true;
          if (intervalId) clearInterval(intervalId);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to fetch job", e);
          setError("Network error. Could not connect to the server.");
          if (intervalId) clearInterval(intervalId);
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    fetchJob();
    intervalId = setInterval(fetchJob, 2000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [id]);

  // -------------------------------------------------------------
  // ERROR VIEW
  // -------------------------------------------------------------
  if (error) {
    return (
      <PageFrame>
        <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-center">
          <div className="flex size-12 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10">
            <X className="size-6 text-destructive" />
          </div>
          <h1 className="mt-6 text-xl font-semibold tracking-tight">{error}</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">The requested analysis job could not be found or loaded. It may have been deleted or the server is unreachable.</p>
        </div>
      </PageFrame>
    );
  }

  // -------------------------------------------------------------
  // COMPLETED VIEW (Executive Dashboard or Copilot)
  // -------------------------------------------------------------
  if (job?.status === "completed" && result) {
    return (
      <PageFrame>
        <div className="space-y-6 animate-fade-in max-w-[1500px] mx-auto pt-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">IPO Analysis Result</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-11">Document ID: {id.substring(0,8)}...</p>
            </div>
            
            <div className="flex flex-col items-end mt-4 sm:mt-0">
              <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
                <Check className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-success uppercase tracking-wider">Analysis Completed</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "dashboard" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Executive Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "copilot" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
            >
              <MessageSquare className="w-4 h-4" />
              Investor Copilot
            </button>
          </div>

          {/* Content */}
          {activeTab === "dashboard" ? (
            <ExecutiveDashboard result={result} />
          ) : (
            <div className="h-[calc(100vh-210px)] w-full">
              <InvestorCopilot documentId={result.document_id} />
            </div>
          )}
        </div>
      </PageFrame>
    );
  }

  // -------------------------------------------------------------
  // RUNNING / LIVE VIEW
  // -------------------------------------------------------------
  return (
    <PageFrame>
      <div className="-mx-6 lg:-mx-8 -my-6 lg:-my-8">
        <AnalysisWorkspace
          job={job}
          steps={steps}
          logs={logs}
          startedAt={job?.started_at ?? null}
          completedAt={job?.completed_at ?? null}
        />
      </div>
    </PageFrame>
  );
}
