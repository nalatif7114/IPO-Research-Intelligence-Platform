"use client";

import { useState } from "react";
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

interface AnalysisJob {
  id: string;
  company: string;
  sector: string;
  status: "completed" | "in_progress" | "failed" | "queued";
  progress: number;
  currentStep: string;
  date: string;
  analyst: string;
}

const analysisJobs: AnalysisJob[] = [
  {
    id: "ANL-001",
    company: "TechCorp Global",
    sector: "Technology",
    status: "completed",
    progress: 100,
    currentStep: "Report Generated",
    date: "2026-07-10",
    analyst: "Sarah Chen",
  },
  {
    id: "ANL-002",
    company: "GreenEnergy Inc",
    sector: "Energy",
    status: "in_progress",
    progress: 67,
    currentStep: "Financial Analysis",
    date: "2026-07-10",
    analyst: "James Miller",
  },
  {
    id: "ANL-003",
    company: "CloudScale AI",
    sector: "Technology",
    status: "in_progress",
    progress: 42,
    currentStep: "Market Research",
    date: "2026-07-09",
    analyst: "Sarah Chen",
  },
  {
    id: "ANL-004",
    company: "BioHealth Pharma",
    sector: "Healthcare",
    status: "failed",
    progress: 83,
    currentStep: "Risk Assessment (Error)",
    date: "2026-07-09",
    analyst: "Alex Kumar",
  },
  {
    id: "ANL-005",
    company: "FinLedger Systems",
    sector: "Fintech",
    status: "queued",
    progress: 0,
    currentStep: "Waiting...",
    date: "2026-07-09",
    analyst: "James Miller",
  },
  {
    id: "ANL-006",
    company: "NanoMaterials Ltd",
    sector: "Materials",
    status: "completed",
    progress: 100,
    currentStep: "Report Generated",
    date: "2026-07-08",
    analyst: "Alex Kumar",
  },
  {
    id: "ANL-007",
    company: "AeroSpace Dynamics",
    sector: "Aerospace",
    status: "completed",
    progress: 100,
    currentStep: "Report Generated",
    date: "2026-07-07",
    analyst: "Sarah Chen",
  },
  {
    id: "ANL-008",
    company: "UrbanMobility Corp",
    sector: "Transportation",
    status: "in_progress",
    progress: 25,
    currentStep: "Document Parsing",
    date: "2026-07-10",
    analyst: "Alex Kumar",
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    badgeClass: "badge-success",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "badge-warning",
    icon: Loader2,
  },
  failed: { label: "Failed", badgeClass: "badge-error", icon: AlertCircle },
  queued: { label: "Queued", badgeClass: "badge-info", icon: Circle },
};

export default function AnalysisPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = analysisJobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || job.status === statusFilter;
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
          <button className="gradient-btn flex items-center gap-2 text-sm self-start">
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
              placeholder="Search by company or job ID..."
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
              <option value="in_progress">In Progress</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500">
          Showing {filteredJobs.length} of {analysisJobs.length} analyses
        </p>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-3 text-left font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                      Job ID <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Company</th>
                  <th className="px-6 py-3 text-left font-medium">Sector</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Progress</th>
                  <th className="px-6 py-3 text-left font-medium">
                    Current Step
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Analyst</th>
                  <th className="px-6 py-3 text-left font-medium">
                    <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredJobs.map((job) => {
                  const cfg = statusConfig[job.status];
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
                        <span className="text-sm font-medium text-white">
                          {job.company}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-neutral">{job.sector}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${cfg.badgeClass}`}>
                          <StatusIcon
                            className={`w-3 h-3 ${
                              job.status === "in_progress" ? "animate-spin" : ""
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
                        <span className="text-sm text-slate-400">
                          {job.currentStep}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">
                          {job.analyst}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {job.date}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
