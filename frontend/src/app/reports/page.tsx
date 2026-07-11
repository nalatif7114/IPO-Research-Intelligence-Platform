"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Download,
  FileText,
  ChevronDown,
  Eye,
  Star,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface ReportItem {
  id: string;
  title: string;
  company: string;
  type: "full" | "summary" | "risk" | "financial" | "market";
  status: "final" | "draft" | "archived";
  confidence: number;
  date: string;
  pages: number;
}

const reports: ReportItem[] = [
  {
    id: "RPT-001",
    title: "TechCorp Global — Full IPO Analysis",
    company: "TechCorp Global",
    type: "full",
    status: "final",
    confidence: 94,
    date: "2026-07-10",
    pages: 48,
  },
  {
    id: "RPT-002",
    title: "NanoMaterials Ltd — Market Assessment",
    company: "NanoMaterials Ltd",
    type: "market",
    status: "final",
    confidence: 88,
    date: "2026-07-08",
    pages: 22,
  },
  {
    id: "RPT-003",
    title: "AeroSpace Dynamics — Risk Report",
    company: "AeroSpace Dynamics",
    type: "risk",
    status: "final",
    confidence: 91,
    date: "2026-07-07",
    pages: 15,
  },
  {
    id: "RPT-004",
    title: "CloudScale AI — Financial Deep Dive",
    company: "CloudScale AI",
    type: "financial",
    status: "draft",
    confidence: 76,
    date: "2026-07-09",
    pages: 32,
  },
  {
    id: "RPT-005",
    title: "GreenEnergy Inc — Executive Summary",
    company: "GreenEnergy Inc",
    type: "summary",
    status: "draft",
    confidence: 82,
    date: "2026-07-10",
    pages: 8,
  },
  {
    id: "RPT-006",
    title: "FinLedger Systems — Full IPO Analysis",
    company: "FinLedger Systems",
    type: "full",
    status: "archived",
    confidence: 89,
    date: "2026-06-28",
    pages: 45,
  },
];

const typeColors: Record<string, string> = {
  full: "badge-info",
  summary: "badge-neutral",
  risk: "badge-error",
  financial: "badge-success",
  market: "badge-warning",
};

const statusColors: Record<string, string> = {
  final: "badge-success",
  draft: "badge-warning",
  archived: "badge-neutral",
};

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and download generated IPO research reports.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-dark pl-10 pr-10 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="all">All Types</option>
              <option value="full">Full Analysis</option>
              <option value="summary">Summary</option>
              <option value="risk">Risk</option>
              <option value="financial">Financial</option>
              <option value="market">Market</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Reports grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 glow-hover group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`badge ${statusColors[report.status]}`}>
                  {report.status.charAt(0).toUpperCase() +
                    report.status.slice(1)}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">
                {report.title}
              </h3>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {report.company}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {report.date}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className={`badge ${typeColors[report.type]}`}>
                  {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                </span>
                <span className="text-xs text-slate-500">
                  {report.pages} pages
                </span>
              </div>

              {/* Confidence */}
              <div className="mt-4 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      report.confidence >= 90
                        ? "bg-emerald-500"
                        : report.confidence >= 80
                        ? "bg-blue-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${report.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {report.confidence}%
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Link
                  href={`/reports/${report.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Link>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
