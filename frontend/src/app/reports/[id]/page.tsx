"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  Star,
  ExternalLink,
  FileText,
  Clock,
  Building2,
  CheckCircle2,
  Copy,
  BookOpen,
  ChevronRight,
} from "lucide-react";

/* ── Mock Data ────────────────────────────────────────────────── */
const reportData: Record<
  string,
  {
    id: string;
    title: string;
    company: string;
    type: string;
    status: "final" | "draft" | "archived";
    confidence: number;
    date: string;
    pages: number;
    analyst: string;
    sections: { title: string; preview: string }[];
    citations: {
      id: number;
      source: string;
      excerpt: string;
      url: string;
      confidence: number;
    }[];
  }
> = {
  "RPT-001": {
    id: "RPT-001",
    title: "TechCorp Global — Full IPO Analysis",
    company: "TechCorp Global",
    type: "Full Analysis",
    status: "final",
    confidence: 94,
    date: "2026-07-10",
    pages: 48,
    analyst: "Sarah Chen",
    sections: [
      {
        title: "Executive Summary",
        preview:
          "TechCorp Global is a leading enterprise SaaS provider with a strong growth trajectory. The company has demonstrated consistent revenue growth of 45% YoY, with improving unit economics and a clear path to profitability. Our analysis indicates a favorable risk-reward profile for the upcoming IPO, with an estimated fair value range of $28-$34 per share.",
      },
      {
        title: "Market Opportunity",
        preview:
          "The global enterprise software market is projected to reach $1.2T by 2028, growing at a CAGR of 11.5%. TechCorp's addressable market within cloud infrastructure management represents a $180B opportunity, with the company currently capturing approximately 2.3% market share.",
      },
      {
        title: "Financial Analysis",
        preview:
          "Revenue for FY2025 reached $892M, representing 45% growth YoY. Gross margins expanded to 72% from 68% in the prior year. Operating cash flow turned positive in Q3 2025, and the company projects EBITDA breakeven by Q2 2026. Customer acquisition costs have decreased by 18% while LTV/CAC ratio improved to 4.2x.",
      },
      {
        title: "Risk Assessment",
        preview:
          "Key risks include concentrated customer base (top 10 customers represent 35% of ARR), increasing competition from hyperscaler native solutions, and regulatory headwinds in the EU market. The company's reliance on a single cloud provider for 60% of its infrastructure poses operational risk.",
      },
      {
        title: "Valuation & Recommendation",
        preview:
          "Based on DCF analysis with a 12% WACC and 3% terminal growth rate, we derive a fair value of $31.50 per share. Comparable company analysis using EV/Revenue multiples suggests a range of $28-$34. We recommend a BUY rating for long-term investors with moderate risk tolerance.",
      },
    ],
    citations: [
      {
        id: 1,
        source: "SEC S-1 Filing — TechCorp Global Inc.",
        excerpt:
          "Revenue for the fiscal year ended December 31, 2025 was $892 million, representing a 45% increase compared to $615 million for the fiscal year ended December 31, 2024.",
        url: "https://sec.gov/filing/techcorp-s1",
        confidence: 98,
      },
      {
        id: 2,
        source: "Gartner Market Report — Enterprise Software 2026",
        excerpt:
          "The global enterprise software market is expected to reach $1.2 trillion by 2028, driven by cloud adoption and digital transformation initiatives across industries.",
        url: "https://gartner.com/reports/enterprise-software-2026",
        confidence: 95,
      },
      {
        id: 3,
        source: "Bloomberg Terminal — Comparable Analysis",
        excerpt:
          "Median EV/Revenue multiple for high-growth enterprise SaaS companies (>40% growth) stands at 18.5x, with a range of 14x-24x depending on profitability metrics.",
        url: "https://bloomberg.com/terminal",
        confidence: 92,
      },
      {
        id: 4,
        source: "Company Investor Presentation Q4 2025",
        excerpt:
          "Net dollar retention rate of 135% demonstrates strong expansion within existing customer base. LTV/CAC ratio improved to 4.2x from 3.5x in the prior year.",
        url: "https://techcorp.com/investors/q4-2025",
        confidence: 96,
      },
      {
        id: 5,
        source: "IDC Cloud Infrastructure Report 2025",
        excerpt:
          "TechCorp has captured approximately 2.3% of the cloud infrastructure management market, positioning it as the 5th largest vendor globally.",
        url: "https://idc.com/cloud-infra-2025",
        confidence: 88,
      },
      {
        id: 6,
        source: "Reuters — IPO Market Analysis",
        excerpt:
          "The 2026 IPO market shows renewed investor appetite for profitable or near-profitable technology companies, with average first-day returns of 22% for enterprise software IPOs.",
        url: "https://reuters.com/ipo-market-2026",
        confidence: 85,
      },
    ],
  },
};

/* ── Fallback data for unknown report IDs ─────────────────────── */
const fallbackReport = {
  id: "RPT-000",
  title: "IPO Research Report",
  company: "Unknown Company",
  type: "Full Analysis",
  status: "draft" as const,
  confidence: 78,
  date: "2026-07-10",
  pages: 24,
  analyst: "System",
  sections: [
    {
      title: "Executive Summary",
      preview:
        "This report contains a comprehensive analysis of the company's IPO readiness, financial health, market opportunity, and risk factors. Full data will be loaded when the analysis pipeline completes.",
    },
    {
      title: "Financial Overview",
      preview:
        "Financial metrics and projections will appear here once the analysis engine has processed all uploaded documents and market data feeds.",
    },
  ],
  citations: [
    {
      id: 1,
      source: "SEC EDGAR Filing Database",
      excerpt: "Source document data will be populated upon analysis completion.",
      url: "#",
      confidence: 80,
    },
  ],
};

/* ── Confidence Ring Component ────────────────────────────────── */
function ConfidenceRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90
      ? "#22c55e"
      : score >= 80
      ? "#3b82f6"
      : score >= 70
      ? "#eab308"
      : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}%</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
}

/* ── Main Page Component ──────────────────────────────────────── */
export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;
  const report = reportData[reportId] ?? { ...fallbackReport, id: reportId };

  const [activeSection, setActiveSection] = useState(0);
  const [copiedCitation, setCopiedCitation] = useState<number | null>(null);

  const statusColors: Record<string, string> = {
    final: "badge-success",
    draft: "badge-warning",
    archived: "badge-neutral",
  };

  function handleCopyCitation(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedCitation(id);
    setTimeout(() => setCopiedCitation(null), 2000);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* ── Back + Header ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{report.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {report.company}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.date}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {report.pages} pages
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button className="gradient-btn flex items-center gap-1.5 text-xs !py-2 !px-4">
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* ── Main Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ── Report Content (3 cols) ────────────────────────── */}
          <div className="xl:col-span-3 space-y-6">
            {/* Meta bar */}
            <div className="glass-card p-4 flex flex-wrap items-center gap-4">
              <span className={`badge ${statusColors[report.status]}`}>
                <CheckCircle2 className="w-3 h-3" />
                {report.status.charAt(0).toUpperCase() +
                  report.status.slice(1)}
              </span>
              <span className="badge badge-info">{report.type}</span>
              <span className="text-xs text-slate-500">
                Analyst: <span className="text-slate-300">{report.analyst}</span>
              </span>
              <span className="text-xs text-slate-500">
                ID: <span className="font-mono text-slate-400">{report.id}</span>
              </span>
            </div>

            {/* Section navigation */}
            <div className="glass-card overflow-hidden">
              <div className="flex border-b border-white/5 overflow-x-auto">
                {report.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(idx)}
                    className={`px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors relative ${
                      activeSection === idx
                        ? "text-blue-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {section.title}
                    {activeSection === idx && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Content area */}
              <div className="p-6 lg:p-8 min-h-[400px]">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    {report.sections[activeSection].title}
                  </h2>
                </div>
                <div className="text-sm text-slate-300 leading-relaxed space-y-4">
                  <p>{report.sections[activeSection].preview}</p>
                  {/* Simulated content paragraphs */}
                  <div className="space-y-3 mt-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div
                          className="h-3 rounded bg-white/[0.03]"
                          style={{ width: `${95 - i * 10}%` }}
                        />
                        <div
                          className="h-3 rounded bg-white/[0.03]"
                          style={{ width: `${85 - i * 5}%` }}
                        />
                        <div
                          className="h-3 rounded bg-white/[0.03]"
                          style={{ width: `${70 + i * 5}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar (1 col) ────────────────────────────────── */}
          <div className="space-y-6">
            {/* Confidence Score */}
            <div className="glass-card p-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Confidence Score
              </h3>
              <ConfidenceRing score={report.confidence} />
              <p className="text-center text-xs text-slate-500 mt-3">
                Based on {report.citations.length} verified sources
              </p>
            </div>

            {/* Source Citations */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Source Citations ({report.citations.length})
              </h3>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {report.citations.map((citation) => (
                  <div
                    key={citation.id}
                    className="group p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {citation.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 line-clamp-1">
                          {citation.source}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          &ldquo;{citation.excerpt}&rdquo;
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-slate-600">
                            {citation.confidence}% match
                          </span>
                          <button
                            onClick={() =>
                              handleCopyCitation(
                                citation.id,
                                citation.excerpt
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy citation"
                          >
                            {copiedCitation === citation.id ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                            )}
                          </button>
                          {citation.url !== "#" && (
                            <a
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Open source"
                            >
                              <ExternalLink className="w-3 h-3 text-slate-500 hover:text-blue-400" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick nav */}
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Sections
              </h3>
              <nav className="space-y-1">
                {report.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeSection === idx
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                    }`}
                  >
                    {section.title}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
