"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, AlertTriangle, ArrowUpDown, CalendarDays, ChevronLeft, ChevronRight, Clock3, FileText, Filter, LayoutDashboard, Search, Trash2, Loader2 } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { PageFrame, PlatformHeader, SectionHeading, StatusBadge } from '@/components/platform/platform-shell'

interface Job {
  id: string;
  job_type: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  created_at: string;
}

type Analysis = { 
  id: string; 
  date: string; 
  status: 'Completed' | 'Running' | 'Failed'; 
  progress: number;
}

export default function AnalysisHistoryPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [sortNewest, setSortNewest] = useState(true)
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.items || []);
          setTotal(data.total || 0);
        } else {
          setError("Failed to load history. Please try again later.");
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setError("Network error. Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const analyses: Analysis[] = useMemo(() => {
    return jobs.map((job) => {
      const isCompleted = job.status === 'completed';
      const isFailed = job.status === 'failed';
      return {
        id: job.id,
        date: new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' }),
        status: isCompleted ? 'Completed' : (isFailed ? 'Failed' : 'Running'),
        progress: job.progress
      }
    })
  }, [jobs]);

  const pageSize = 6
  const filtered = useMemo(() => 
    analyses.filter((item) => 
      (status === 'All' || item.status === status) && 
      item.id.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => sortNewest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), 
  [analyses, search, status, sortNewest])
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const changeFilter = (value: string) => { setStatus(value); setPage(1) }

  return (
    <PageFrame>
      <PlatformHeader eyebrow="Analysis library" title="Past prospectus runs, recommendations, and evidence packs" />
      <div className="workspace-grid mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-7 md:px-6">
        <SectionHeading 
          eyebrow="Research archive" 
          title="Analysis history" 
          description="Review completed intelligence packs, monitor active runs, and revisit underwriting decisions." 
          action={<Link href="/upload" className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"><FileText className="size-3.5" />New analysis</Link>} 
        />
        
        <section className="panel p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-background px-3 py-2.5">
              <Search className="size-4 text-muted-foreground" />
              <span className="sr-only">Search analyses</span>
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by Job ID…" className="w-full bg-transparent text-sm outline-none" />
            </label>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 rounded-md border bg-background p-1" aria-label="Filter by status">
                <Filter className="ml-2 size-3.5 text-muted-foreground" />
                {['All','Completed','Running','Failed'].map((item) => (
                  <button key={item} onClick={() => changeFilter(item)} className={`rounded px-2.5 py-1.5 text-[11px] transition-colors ${status === item ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{item}</button>
                ))}
              </div>
              <button onClick={() => setSortNewest((value) => !value)} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="size-3.5" />{sortNewest ? 'Newest first' : 'Oldest first'}
              </button>
            </div>
          </div>
        </section>
        
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{filtered.length} analysis{filtered.length === 1 ? '' : 'es'} found</p>
          <p className="font-mono text-[10px] text-muted-foreground">Page {page} of {totalPages}</p>
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="size-4 animate-pulse text-primary" /> Loading history...</div></div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-destructive/25 bg-destructive/5">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3" aria-label="Analysis results">
            {visible.map((analysis) => (
              <article key={analysis.id} className="panel group flex flex-col overflow-hidden transition-colors hover:border-primary/25">
                <div className="flex items-start justify-between gap-3 border-b p-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-secondary"><FileText className="size-4 text-primary" /></span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">Analysis Job</h2>
                      <p className="mt-1 truncate font-mono text-[9px] text-muted-foreground">{analysis.id.substring(0, 16)}...</p>
                    </div>
                  </div>
                  <StatusBadge tone={analysis.status === 'Completed' ? 'positive' : analysis.status === 'Running' ? 'warning' : 'danger'}>{analysis.status === 'Running' ? `${analysis.progress}%` : analysis.status}</StatusBadge>
                </div>
                <div className="flex flex-1 flex-col gap-5 p-4">
                  <div className="flex gap-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CalendarDays className="size-3" />{analysis.date}</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    {analysis.status === 'Completed' ? (
                      <button onClick={() => router.push(`/analysis/${analysis.id}`)} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
                        <LayoutDashboard className="size-3.5" />Open dashboard
                      </button>
                    ) : (
                      <button onClick={() => router.push(`/analysis/${analysis.id}`)} className="flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
                        {analysis.status === 'Running' ? 'View progress' : 'View error'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed">
            <div className="flex size-10 items-center justify-center rounded-lg bg-secondary"><Search className="size-5 text-muted-foreground" /></div>
            <p className="mt-4 text-sm font-medium">No analyses found</p>
            <p className="mt-1 text-xs text-muted-foreground">Adjust your filters or try a different search term.</p>
          </div>
        )}
        
        <div className="flex justify-center gap-2">
          <button className="icon-button border" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft /></button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button key={index} onClick={() => setPage(index + 1)} className={`size-8 rounded-md border font-mono text-[10px] ${page === index + 1 ? 'border-primary/40 bg-primary/10 text-primary' : 'text-muted-foreground'}`}>{index + 1}</button>
          ))}
          <button className="icon-button border" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} aria-label="Next page"><ChevronRight /></button>
        </div>
      </div>
    </PageFrame>
  )
}
