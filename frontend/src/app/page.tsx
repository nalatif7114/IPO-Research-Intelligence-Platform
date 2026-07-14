"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Upload as UploadIcon,
  FileText,
  X,
  Building2,
  Calendar,
  ArrowRight,
  Sparkles,
  Loader2
} from "lucide-react";

interface AnalysisJob {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  created_at: string;
}

export default function DocumentFirstHomePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<AnalysisJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/jobs?page_size=4");
        if (res.ok) {
          const data = await res.json();
          setRecentJobs(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent jobs", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRecentJobs();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };
  
  const uploadFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError("Currently only PDF files are supported.");
      return;
    }
    
    setUploadProgress(15);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setUploadProgress(45);
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(85);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      
      const data = await res.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        router.push(`/analysis/${data.job_id}`);
      }, 400);
      
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-2">
        
        {/* Top greeting */}
        <div>
          <p className="text-[13px] text-[var(--text-secondary)] mb-2">Welcome back, Analyst 👋</p>
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
            <div className="max-w-lg">
              <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mb-4">
                AI-Powered IPO Research
              </h1>
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                Upload a prospectus and let our AI agents deliver deep, actionable investment insights.
              </p>
            </div>
            
            {/* Mockup Graphic (simplified CSS version) */}
            <div className="relative w-full md:w-[300px] h-[160px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[var(--primary)]/20 blur-[60px] rounded-full"></div>
              <div className="relative z-10 p-5 rounded-2xl border border-[var(--primary)]/30 bg-[var(--bg-glass)] shadow-[0_0_30px_rgba(124,58,237,0.2)]">
                <FileText className="w-12 h-12 text-[var(--primary)]" />
                <div className="absolute -top-3 -right-6 px-3 py-1 rounded-full border border-[var(--border-glass)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-secondary)]">Multi-Agent AI</div>
                <div className="absolute top-8 -left-10 px-3 py-1 rounded-full border border-[var(--border-glass)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-secondary)]">LangGraph</div>
                <div className="absolute bottom-4 -left-6 px-3 py-1 rounded-full border border-[var(--border-glass)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-secondary)]">RAG</div>
                <div className="absolute -bottom-3 right-0 px-3 py-1 rounded-full border border-[var(--border-glass)] bg-[var(--bg-secondary)] text-[10px] text-[var(--text-secondary)]">Gemini</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative overflow-hidden p-12 rounded-[24px] border border-dashed transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center bg-[var(--bg-card)] shadow-xl ${
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]"
                : "border-[var(--border-glass)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg-card-hover)]"
            }`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
            />
            
            <CloudUploadIcon className={`w-10 h-10 mb-4 ${isDragging ? "text-[var(--primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--primary)]"}`} />

            <h3 className="text-[18px] font-semibold text-white mb-4">
              Drop IPO Prospectus PDF here<br/>
              <span className="text-[14px] text-[var(--text-muted)] font-normal">or click to browse</span>
            </h3>

            <button className="px-6 py-2.5 rounded-[12px] bg-[var(--primary)] hover:bg-[var(--accent)] text-white text-[13px] font-medium transition-all pointer-events-none mb-6">
              Choose PDF File
            </button>
            
            <p className="text-[12px] text-[var(--text-muted)]">
              Supports PDF up to 50MB • Indonesian & Global filings
            </p>
          </div>

          {uploadProgress !== null && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-glass)] p-5 rounded-[24px] animate-fade-in shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Uploading Prospectus...
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {uploadProgress}% completed
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadProgress(null); }}
                  className="p-1 rounded-lg hover:bg-white/10 text-[var(--text-muted)] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recent Analyses List */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-white">
              Recent Analyses
            </h2>
            <button
              onClick={() => router.push("/analysis")}
              className="text-[12px] text-[var(--primary)] hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)] mb-3" />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="py-10 text-center border border-[var(--border-glass)] rounded-[24px] bg-[var(--bg-card)]">
              <p className="text-[13px] text-[var(--text-muted)]">No previous prospectus analyses</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-glass)] hover:bg-[var(--bg-card-hover)] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-glass)] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-white group-hover:text-[var(--primary)] transition-colors">
                        PT GoTo Gojek Tokopedia Tbk {/* Replace with dynamic name later if available */}
                      </h4>
                      <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                        GoTo_Prospectus.pdf
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span
                      className={`text-[11px] px-3 py-1 rounded-full font-medium ${
                        job.status === "completed"
                          ? "text-[var(--success)] bg-[var(--success)]/10"
                          : job.status === "running"
                          ? "text-[var(--warning)] bg-[var(--warning)]/10"
                          : job.status === "failed"
                          ? "text-[var(--error)] bg-[var(--error)]/10"
                          : "text-[var(--text-secondary)] bg-[var(--bg-secondary)]"
                      }`}
                    >
                      {job.status === "running" ? "In Progress - 75%" : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                    
                    <span className="text-[12px] text-[var(--text-secondary)] min-w-[100px] text-right">
                      Jul 12, 2026
                    </span>

                    <button 
                      onClick={() => router.push(`/analysis/${job.id}`)}
                      className="px-4 py-1.5 rounded-[8px] bg-transparent border border-[var(--border-glass)] text-white text-[12px] font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      {job.status === "failed" ? "Retry" : "Open"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Simple cloud upload icon component to match the mockup exactly
function CloudUploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 13v8" />
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="m8 17 4-4 4 4" />
    </svg>
  );
}
