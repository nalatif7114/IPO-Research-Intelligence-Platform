"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Loader2,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AnalysisJob {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

const statusConfig = {
  completed: {
    label: "Completed",
    badgeClass: "badge-success",
    icon: CheckCircle2,
  },
  running: {
    label: "In Progress",
    badgeClass: "badge-warning",
    icon: Loader2,
  },
  pending: {
    label: "Pending",
    badgeClass: "badge-info",
    icon: Circle,
  },
  failed: { label: "Failed", badgeClass: "badge-error", icon: AlertCircle },
  cancelled: { label: "Cancelled", badgeClass: "badge-neutral", icon: AlertCircle },
};

export default function AnalysisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/jobs?page_size=50");
        const data = await res.json();
        setJobs(data.items || []);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Analysis Jobs</h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage and monitor your IPO research analyses.
            </p>
          </div>
          <button 
            onClick={() => router.push("/upload")}
            className="gradient-btn flex items-center gap-2 text-sm self-start"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by job ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-dark pl-10 pr-10 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">In Progress</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500">
          Showing {filteredJobs.length} of {jobs.length} analyses
        </p>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                Loading jobs...
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3 text-left font-medium">Job ID</th>
                    <th className="px-6 py-3 text-left font-medium">Type</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Progress</th>
                    <th className="px-6 py-3 text-left font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No jobs found.
                      </td>
                    </tr>
                  ) : null}
                  {filteredJobs.map((job) => {
                    const cfg = statusConfig[job.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/analysis/${job.id}`}
                            className="text-sm font-mono text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {job.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-white capitalize">
                            {job.job_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${cfg.badgeClass}`}>
                            <StatusIcon
                              className={`w-3 h-3 ${
                                job.status === "running" ? "animate-spin" : ""
                              }`}
                            />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  job.status === "failed"
                                    ? "bg-red-500"
                                    : job.status === "completed"
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                                }`}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums w-8">
                              {job.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {new Date(job.created_at).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
