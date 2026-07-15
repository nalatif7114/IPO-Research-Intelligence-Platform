"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { SectionHeading, StatusBadge } from '@/components/platform/platform-shell';

interface ExecutiveDashboardProps {
  result: any;
}

function renderValue(val: any): React.ReactNode {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (Array.isArray(val)) {
    return (
      <ul className="list-disc pl-4 mt-2 space-y-1">
        {val.map((item, i) => (
          <li key={i}>{renderValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof val === 'object') {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {Object.entries(val).map(([k, v]) => (
          <div key={k} className="rounded border bg-background/50 p-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{k.replace(/_/g, ' ')}</span>
            <div className="text-sm">{renderValue(v)}</div>
          </div>
        ))}
      </div>
    );
  }
  return JSON.stringify(val);
}

export default function ExecutiveDashboard({ result }: ExecutiveDashboardProps) {
  if (!result || Object.keys(result).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <CheckCircle2 className="size-10 text-success mb-4" />
        <h2 className="text-xl font-semibold">Analysis Completed Successfully</h2>
        <p className="mt-2 text-sm text-muted-foreground">The AI pipeline did not return structured result data, but all stages finished successfully.</p>
      </div>
    );
  }

  return (
    <div className="workspace-grid mx-auto flex flex-col gap-6 py-4">
      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-6 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-secondary">
              <Building2 aria-hidden="true" className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Analysis Dashboard</h1>
                <StatusBadge tone="positive">Completed</StatusBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">AI-Generated Intelligence Output</p>
            </div>
          </div>
        </div>
        
        <div className="p-5 flex flex-col gap-6">
          {Object.entries(result).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className="rounded-xl border bg-background/30 p-5">
              <SectionHeading 
                eyebrow="Extracted Intelligence" 
                title={sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
              />
              <div className="mt-4 text-sm">
                {renderValue(sectionData)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
