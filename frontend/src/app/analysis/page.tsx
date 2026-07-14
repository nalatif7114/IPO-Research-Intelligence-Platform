"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, 
  Search, 
  ChevronDown, 
  Calendar, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Job {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  created_at: string;
}

export default function AnalysisHistoryPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/jobs");
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setJobs(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", icon: Check, colorClass: "text-[var(--success)] bg-[var(--success)]/10 border-[var(--success)]/20" };
      case "running":
        return { label: "In Progress", icon: Clock, colorClass: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/20" };
      case "failed":
        return { label: "Failed", icon: XCircle, colorClass: "text-[var(--error)] bg-[var(--error)]/10 border-[var(--error)]/20" };
      case "pending":
      default:
        return { label: "Queued", icon: AlertCircle, colorClass: "text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-[var(--border-glass)]" };
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full animate-fade-in max-w-[1400px] mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Analysis History</h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1">
              All previously processed prospectus documents.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input 
                type="text" 
                placeholder="Search companies..." 
                className="w-full bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-[12px] py-2 pl-9 pr-4 text-[13px] text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            
            <button className="flex items-center justify-between gap-3 w-full sm:w-auto px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-[12px] text-[13px] text-[var(--text-secondary)] hover:text-white transition-colors">
              All Statuses <ChevronDown className="w-4 h-4" />
            </button>
            
            <button className="flex items-center justify-center p-2.5 bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-[12px] text-[var(--text-secondary)] hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-glass)] rounded-[24px] shadow-xl overflow-hidden flex flex-col min-h-[500px]">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] bg-[var(--bg-secondary)]">
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Company</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">File Name</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Progress</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Completed</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Score</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)] mx-auto mb-3" />
                      <span className="text-[13px] text-[var(--text-muted)]">Loading history...</span>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--error)] text-[13px]">
                      {error}
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[var(--text-muted)] text-[13px]">
                      No analysis history found.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job, idx) => {
                    const statusDisplay = getStatusDisplay(job.status);
                    const StatusIcon = statusDisplay.icon;
                    // Mockup specific score extraction logic, assuming completed jobs get a high score
                    const score = job.status === "completed" ? (80 + (idx % 15)) : null;

                    return (
                      <tr 
                        key={job.id} 
                        className="border-b border-[var(--border-glass)] hover:bg-[var(--bg-card-hover)] transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-glass)] flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
                            </div>
                            <span className="text-[13px] font-semibold text-white group-hover:text-[var(--primary)] transition-colors">
                              {/* Dynamic company name extraction would go here, fallback to job type or placeholder */}
                              PT GoTo Gojek Tokopedia Tbk
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-[13px] text-[var(--text-secondary)] truncate max-w-[200px]">GoTo_Prospektus.pdf</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${statusDisplay.colorClass}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${job.status === "failed" ? "bg-[var(--error)]" : "bg-[var(--primary)]"}`} 
                                style={{ width: `${Math.max(job.progress, 5)}%` }} 
                              />
                            </div>
                            <span className="text-[12px] font-mono text-[var(--text-secondary)]">{job.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[var(--text-secondary)]">
                          {job.status === "completed" ? formatDate(job.created_at) : "--"}
                        </td>
                        <td className="py-4 px-6">
                          {score ? (
                            <span className="text-[13px] font-semibold text-[var(--success)]">{score}<span className="text-[var(--text-muted)] font-normal text-[11px]">/100</span></span>
                          ) : (
                            <span className="text-[13px] text-[var(--text-muted)]">--</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => router.push(`/analysis/${job.id}`)}
                              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                              title="View Analysis"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-secondary)] transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-auto px-6 py-4 border-t border-[var(--border-glass)] flex items-center justify-between">
            <span className="text-[12px] text-[var(--text-muted)]">
              Showing <span className="text-white font-medium">{jobs.length > 0 ? 1 : 0}</span> to <span className="text-white font-medium">{jobs.length}</span> of <span className="text-white font-medium">{jobs.length}</span> entries
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-white disabled:opacity-50" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-7 h-7 rounded-md bg-[var(--primary)] text-white text-[12px] font-medium flex items-center justify-center">
                1
              </button>
              <button className="w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-secondary)] text-[12px] font-medium flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-secondary)] text-[12px] font-medium flex items-center justify-center">
                3
              </button>
              <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
