"use client";

import React, { useState } from "react";
import { Check, XCircle, ChevronRight, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ExecutiveDashboardProps {
  result: any;
}

const TABS = ["Executive Summary", "Business", "Financial", "Risk", "Governance", "Valuation"];

// Mockup specific data structure for the chart based on the image
const chartData = [
  { name: '2021', Revenue: 8.1, NetProfit: -21.4, Ebitda: 4.7 },
  { name: '2022', Revenue: 11.2, NetProfit: -32.5, Ebitda: -4.7 },
  { name: '2023', Revenue: 14.3, NetProfit: -12.1, Ebitda: 6.1 },
];

export default function ExecutiveDashboard({ result }: ExecutiveDashboardProps) {
  const [activeTab, setActiveTab] = useState("Executive Summary");

  if (!result) return null;

  // Extract from backend data to populate dashboard accurately, 
  // with fallbacks matching the mockup visual state when possible for demonstration.
  
  const recommendation = result.valuation?.investment_recommendation?.value || "BUY";
  const confidence = result.valuation?.investment_recommendation?.confidence 
    ? Math.round(result.valuation.investment_recommendation.confidence * 100) 
    : 92;
  const healthScore = 87; // Mockup specific or calculated
  
  const fairValue = result.valuation?.fair_value?.value || "Rp 120 - 140";
  const thesis = result.valuation?.investment_thesis?.value || 
    "GoTo is Indonesia's leading digital ecosystem with strong market position in ride-hailing, food delivery, and fintech. The company shows solid growth trajectory and profitability improvement with expanding margins.";

  const strengths = (result.business_analysis?.growth_drivers || [
    "Market leader in large addressable market",
    "Dual-engine growth (On-demand & Fintech)",
    "Improving unit economics",
    "Strong ecosystem network effect"
  ]).slice(0, 4);

  const risks = (result.risk_assessment?.business_risks || [
    "High competition in all business segments",
    "Regulatory risks in fintech and digital services",
    "Macroeconomic volatility impact",
    "Execution risk in profitability improvement"
  ]).map((r: any) => typeof r === "string" ? r : r.description || "Risk identified").slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in pb-12 w-full">
      
      {/* Top Info Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recommendation */}
        <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 flex flex-col justify-between shadow-lg">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Recommendation</p>
          <div className="flex items-baseline gap-2">
            <h2 className={`text-[32px] font-bold ${recommendation.includes("BUY") ? "text-[var(--success)]" : recommendation.includes("SELL") ? "text-[var(--error)]" : "text-[var(--warning)]"}`}>
              {recommendation}
            </h2>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Long-term potential strong</p>
        </div>

        {/* Confidence Score */}
        <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 flex flex-col justify-between shadow-lg">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Confidence Score</p>
          <h2 className="text-[32px] font-bold text-[var(--success)]">{confidence}%</h2>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">High Confidence</p>
        </div>

        {/* Health Score */}
        <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 flex flex-col justify-between shadow-lg">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">IPO Health Score</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-[32px] font-bold text-[var(--success)]">{healthScore}</h2>
            <span className="text-[14px] text-[var(--text-muted)] font-medium">/ 100</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1">Very Good</p>
        </div>

        {/* Fair Value Range */}
        <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-5 flex flex-col justify-between shadow-lg">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Fair Value Range</p>
          <h2 className="text-[24px] font-bold text-white mt-2">{fairValue}</h2>
          <p className="text-[11px] text-[var(--text-secondary)] mt-2">Per Share</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-glass)] pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 ${
              activeTab === tab
                ? "border-[var(--primary)] text-white"
                : "border-transparent text-[var(--text-muted)] hover:text-white hover:border-[var(--border-glass)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Executive Summary" && (
        <div className="space-y-6">
          {/* Middle Row: Thesis & Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Investment Thesis */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-lg flex flex-col">
              <h3 className="text-[14px] font-semibold text-white mb-4">Investment Thesis</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed flex-1">
                {thesis}
              </p>
            </div>

            {/* Key Financial Highlights (Chart) */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-lg h-[280px] flex flex-col">
              <h3 className="text-[14px] font-semibold text-white mb-4">Key Financial Highlights</h3>
              <div className="flex-1 w-full min-h-0 text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-glass)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                    <Tooltip 
                      cursor={{fill: 'var(--bg-glass)'}}
                      contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: 'var(--text-muted)' }} />
                    <Bar dataKey="Revenue" name="Revenue (IDR Tn)" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="NetProfit" name="Net Profit (IDR Tn)" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="Ebitda" name="EBITDA Margin (%)" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
          </div>

          {/* Bottom Row: Strengths, Risks, Health Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Key Strengths */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-lg flex flex-col">
              <h3 className="text-[14px] font-semibold text-white mb-4">Key Strengths</h3>
              <ul className="space-y-3">
                {strengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--success)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--success)]" />
                    </div>
                    <span className="text-[12px] text-[var(--text-secondary)] leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Major Risks */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-lg flex flex-col">
              <h3 className="text-[14px] font-semibold text-white mb-4">Major Risks</h3>
              <ul className="space-y-3">
                {risks.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--error)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-3 h-3 text-[var(--error)]" />
                    </div>
                    <span className="text-[12px] text-[var(--text-secondary)] leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health Score Breakdown */}
            <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-6 shadow-lg flex flex-col">
              <h3 className="text-[14px] font-semibold text-white mb-6">IPO Health Score Breakdown</h3>
              
              <div className="space-y-4">
                {[
                  { label: "Business", score: 85, color: "var(--success)" },
                  { label: "Financial", score: 80, color: "var(--success)" },
                  { label: "Risk", score: 70, color: "var(--warning)" },
                  { label: "Governance", score: 90, color: "var(--success)" },
                  { label: "Valuation", score: 82, color: "var(--success)" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[var(--text-secondary)]">{item.label}</span>
                      <span className="text-[11px] text-white font-mono">{item.score} / 100</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${item.score}%`, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== "Executive Summary" && (
        <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-glass)] p-10 shadow-lg text-center">
          <p className="text-[13px] text-[var(--text-muted)]">Detailed {activeTab.toLowerCase()} data is available via backend extraction.</p>
        </div>
      )}

    </div>
  );
}
