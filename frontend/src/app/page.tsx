"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Activity, ArrowRight, Bot, CheckCircle2, Clock3, FileSearch, FileText, FileUp, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { PageFrame, PlatformHeader, SearchBox, SectionHeading, StatusBadge } from '@/components/platform/platform-shell';
import apiClient from '@/lib/api';

interface AnalysisJob {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  created_at: string;
}

export default function DocumentFirstHomePage() {
  const router = useRouter();
  const [recentJobs, setRecentJobs] = useState<AnalysisJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const { data } = await apiClient.get("/jobs?page_size=4");
        setRecentJobs(data.items || []);
      } catch (err) {
        console.error("Failed to fetch recent jobs", err);
        setError("Network error. Could not connect to the server.");
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRecentJobs();
  }, []);

  return (
    <PageFrame>
      <PlatformHeader 
        eyebrow="Research command center" 
        title="Institutional IPO intelligence" 
        actions={
          <Link href="/upload" className="hidden items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground sm:flex">
            <FileUp className="size-3.5" />Upload prospectus
          </Link>
        } 
      />
      
      <div className="workspace-grid mx-auto flex max-w-[1500px] flex-col gap-8 px-4 py-7 md:px-8 lg:py-10">
        
        {/* Hero Section */}
        <section className="panel relative overflow-hidden p-6 md:p-10">
          <div className="absolute inset-y-0 right-0 hidden w-2/5 border-l bg-primary/5 lg:block" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <StatusBadge tone="positive">Evidence-grounded research</StatusBadge>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
              Read an IPO prospectus like an entire research desk.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
              Coordinate specialist AI agents across business quality, financials, risk, governance, and valuation—then trace every conclusion back to source evidence.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/upload" className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_30px_var(--primary-glow)]">
                Analyze a prospectus <ArrowRight className="size-4" />
              </Link>
              <Link href="/analysis" className="flex items-center justify-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm text-muted-foreground hover:text-foreground">
                Open research library
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Analysis & Activity */}
        <div className="grid gap-6">
          <section className="panel p-5 md:p-6">
            <SectionHeading 
              eyebrow="Recent analysis" 
              title="Recent Uploads" 
              description="Your latest IPO prospectus analysis runs" 
              action={
                <Link href="/analysis" className="flex items-center gap-2 text-xs font-medium text-primary">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              } 
            />
            
            <div className="mt-6 flex flex-col gap-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-10 rounded-lg border border-destructive/25 bg-destructive/5">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="flex items-center justify-center py-10 rounded-lg border bg-background/55">
                  <p className="text-sm text-muted-foreground">No recent analyses found. Upload a prospectus to begin.</p>
                </div>
              ) : (
                recentJobs.map(job => (
                  <div key={job.id} onClick={() => router.push(`/analysis/${job.id}`)} className="flex items-center justify-between p-4 rounded-xl border bg-background/55 hover:bg-card cursor-pointer transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">IPO Analysis Job</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {job.id.substring(0, 8)}... • {new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge tone={job.status === 'completed' ? 'positive' : job.status === 'failed' ? 'danger' : 'warning'}>
                        {job.status === 'running' ? `${job.progress}%` : job.status}
                      </StatusBadge>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 p-4">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tip: The multi-agent pipeline automatically triggers upon upload and runs in the background.
              </p>
            </div>
          </section>

        </div>

        <section className="panel p-4">
          <SearchBox placeholder="Search analyses, companies, findings, or citations…" />
        </section>

      </div>
    </PageFrame>
  );
}
