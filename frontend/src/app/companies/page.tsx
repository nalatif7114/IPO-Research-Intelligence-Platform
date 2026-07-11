"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Plus,
  Building2,
  Globe,
  TrendingUp,
  Calendar,
  ExternalLink,
  BarChart3,
  DollarSign,
  Filter,
  ChevronDown,
} from "lucide-react";

/* ── Mock Data ────────────────────────────────────────────────── */
interface CompanyItem {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  industry: string;
  status: "pre-ipo" | "filed" | "ipo" | "post-ipo";
  ipoDate: string;
  ipoPrice: string;
  website: string;
  description: string;
}

const companies: CompanyItem[] = [
  {
    id: "CMP-001",
    name: "TechCorp Global",
    ticker: "TCGL",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Enterprise Software",
    status: "ipo",
    ipoDate: "2026-08-15",
    ipoPrice: "$28–$34",
    website: "techcorp.com",
    description: "Leading enterprise SaaS platform for cloud infrastructure management.",
  },
  {
    id: "CMP-002",
    name: "GreenEnergy Inc",
    ticker: "GREN",
    exchange: "NYSE",
    sector: "Energy",
    industry: "Renewable Energy",
    status: "filed",
    ipoDate: "2026-09-01",
    ipoPrice: "$18–$22",
    website: "greenenergy.com",
    description: "Next-gen solar panel manufacturing with patented efficiency tech.",
  },
  {
    id: "CMP-003",
    name: "CloudScale AI",
    ticker: "CSAI",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Artificial Intelligence",
    status: "pre-ipo",
    ipoDate: "TBD",
    ipoPrice: "—",
    website: "cloudscale.ai",
    description: "AI infrastructure platform enabling large-scale model deployment.",
  },
  {
    id: "CMP-004",
    name: "BioHealth Pharma",
    ticker: "BHPH",
    exchange: "NYSE",
    sector: "Healthcare",
    industry: "Biotechnology",
    status: "filed",
    ipoDate: "2026-08-20",
    ipoPrice: "$40–$48",
    website: "biohealth.com",
    description: "Precision medicine company specializing in oncology therapeutics.",
  },
  {
    id: "CMP-005",
    name: "FinLedger Systems",
    ticker: "FLSYS",
    exchange: "NASDAQ",
    sector: "Fintech",
    industry: "Blockchain & Payments",
    status: "post-ipo",
    ipoDate: "2026-06-10",
    ipoPrice: "$24",
    website: "finledger.io",
    description: "Decentralized payment infrastructure for cross-border transactions.",
  },
  {
    id: "CMP-006",
    name: "NanoMaterials Ltd",
    ticker: "NANO",
    exchange: "LSE",
    sector: "Materials",
    industry: "Advanced Materials",
    status: "post-ipo",
    ipoDate: "2026-05-22",
    ipoPrice: "£16",
    website: "nanomaterials.co.uk",
    description: "Graphene-based materials for semiconductor and battery applications.",
  },
  {
    id: "CMP-007",
    name: "AeroSpace Dynamics",
    ticker: "AESD",
    exchange: "NYSE",
    sector: "Aerospace",
    industry: "Space Technology",
    status: "ipo",
    ipoDate: "2026-07-28",
    ipoPrice: "$52–$60",
    website: "aerodyn.com",
    description: "Small satellite launch services and orbital debris management.",
  },
  {
    id: "CMP-008",
    name: "UrbanMobility Corp",
    ticker: "UMOB",
    exchange: "NASDAQ",
    sector: "Transportation",
    industry: "Electric Vehicles",
    status: "pre-ipo",
    ipoDate: "TBD",
    ipoPrice: "—",
    website: "urbanmobility.com",
    description: "Autonomous electric shuttle network for smart city transit.",
  },
];

const statusConfig: Record<string, { label: string; badge: string }> = {
  "pre-ipo": { label: "Pre-IPO", badge: "badge-neutral" },
  filed: { label: "Filed", badge: "badge-info" },
  ipo: { label: "IPO", badge: "badge-warning" },
  "post-ipo": { label: "Post-IPO", badge: "badge-success" },
};

const exchangeColors: Record<string, string> = {
  NASDAQ: "text-blue-400",
  NYSE: "text-emerald-400",
  LSE: "text-purple-400",
};

/* ── Page Component ───────────────────────────────────────────── */
export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Companies</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track IPO candidates and manage your company watchlist.
            </p>
          </div>
          <button className="gradient-btn flex items-center gap-2 text-sm self-start">
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, ticker, or industry..."
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
              <option value="pre-ipo">Pre-IPO</option>
              <option value="filed">Filed</option>
              <option value="ipo">IPO</option>
              <option value="post-ipo">Post-IPO</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-500">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 stagger-children">
          {filteredCompanies.map((company) => {
            const cfg = statusConfig[company.status];
            return (
              <div
                key={company.id}
                className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 glow-hover group cursor-pointer"
              >
                {/* Top row: icon + status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>

                {/* Name & ticker */}
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {company.ticker}
                  </span>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span
                    className={`text-xs font-semibold ${
                      exchangeColors[company.exchange] ?? "text-slate-400"
                    }`}
                  >
                    {company.exchange}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {company.description}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {company.sector}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {company.industry}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {company.ipoDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {company.ipoPrice}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                  <a
                    href={`https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    {company.website}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
