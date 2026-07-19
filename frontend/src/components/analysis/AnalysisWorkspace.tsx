'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  FileText,
  MoreHorizontal,
  PanelLeftClose,
  PanelRightClose,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  Loader2,
} from 'lucide-react'
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { ProductNav } from '@/components/platform/platform-shell'
import { currentModelLabel } from '@/lib/model-label'

type StageState = 'complete' | 'running' | 'queued' | 'failed'
type View = 'Thinking' | 'Findings' | 'Logs' | 'Reasoning' | 'Citations' | 'Progress'

interface JobStep {
  id: string;
  step_name: string;
  step_order: number;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface Job {
  id: string;
  job_type: string;
  status: string;
  progress: number;
  created_at: string;
  started_at: string | null;
}

interface AnalysisWorkspaceProps {
  job: Job | null;
  steps: JobStep[];
  logs?: any[];
  startedAt: string | null;
  completedAt: string | null;
}

function StateGlyph({ state, paused }: { state: StageState; paused: boolean }) {
  const reduceMotion = useReducedMotion()
  if (state === 'complete') return <Check aria-hidden="true" className="size-3.5" />
  if (state === 'failed') return <X aria-hidden="true" className="size-3.5" />
  if (state === 'running') {
    return (
      <motion.span
        className="block size-2 rounded-full bg-primary"
        animate={!reduceMotion && !paused ? { opacity: [0.35, 1, 0.35], scale: [0.8, 1, 0.8] } : undefined}
        transition={{ duration: 1.8, repeat: Infinity }}
      />
    )
  }
  return <span className="block size-1.5 rounded-full bg-muted-foreground/40" />
}

export function AnalysisWorkspace({ job, steps, logs = [], startedAt, completedAt }: AnalysisWorkspaceProps) {
  const [view, setView] = useState<View>('Thinking')
  const [selectedStage, setSelectedStage] = useState(0)
  const [paused, setPaused] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const workspaceScrollRef = useRef<HTMLDivElement>(null)
  const workspaceScrollTopRef = useRef(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!startedAt) {
      setElapsedTime(0);
      return;
    }
    const startMs = new Date(startedAt).getTime();
    if (job && (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled')) {
      const endMs = completedAt ? new Date(completedAt).getTime() : Date.now();
      setElapsedTime(Math.floor((endMs - startMs) / 1000));
      return;
    }
    const tick = () => setElapsedTime(Math.floor((Date.now() - startMs) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, completedAt, job?.status]);

  const userSelectedStageRef = useRef(false)

  // Auto-follow the running stage, but only until the user manually picks one.
  // Previously this ran on every polling update (new `steps` reference each
  // 2s tick) and force-reselected the running stage every time, silently
  // discarding whatever stage the user had clicked on.
  useEffect(() => {
    if (userSelectedStageRef.current) return
    const runningIndex = steps.findIndex(s => s.status === 'running')
    if (runningIndex !== -1) {
      setSelectedStage(runningIndex)
    }
  }, [steps])

  const selectStage = (index: number) => {
    userSelectedStageRef.current = true
    setSelectedStage(index)
  }

  // Polling updates data only. Restore the internal workspace scroll offset so
  // an updated status never moves the reader back to the top.
  useLayoutEffect(() => {
    if (workspaceScrollRef.current) {
      workspaceScrollRef.current.scrollTop = workspaceScrollTopRef.current
    }
  }, [job?.progress, steps])

  const copyJobId = async () => {
    if (!job) return
    await navigator.clipboard.writeText(job.id)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
  }

  const currentStep = steps[selectedStage] || null;
  const runningStep = steps.find(s => s.status === 'running') || currentStep;
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const stageCompletionPct = job?.progress !== undefined ? Math.round(job.progress) : 0;
  const uploadedProspectusStatus = steps.some(s => s.status === 'failed')
    ? 'Failed'
    : runningStep
      ? `Processing · ${runningStep.step_name}`
      : job?.status === 'completed'
        ? 'Processed'
        : job?.status || 'Pending';

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-64px)] bg-background text-foreground overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card/70 px-3 backdrop-blur-xl md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-[0_0_24px_var(--primary-glow)] animate-pulse-glow">
            <BrainCircuit aria-hidden="true" className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">Analysis OS</span>
              <span className="hidden rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground sm:inline">Active</span>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">Prospectus Upload · ID: {job?.id ? job.id.substring(0, 8) : 'Loading...'}</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 md:flex">
          <motion.span
            className="size-1.5 rounded-full bg-success"
            animate={!reduceMotion && !paused ? { opacity: [0.4, 1, 0.4] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{paused ? 'Agents paused' : 'Agents working'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="icon-button hidden sm:flex" aria-label="Search workspace"><Search /></button>
          <button className="icon-button relative" aria-label="Notifications"><Bell /><span className="absolute right-2 top-2 size-1 rounded-full bg-primary" /></button>
          <button
            className="ml-1 flex h-8 items-center gap-2 rounded-md border bg-secondary px-3 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play aria-hidden="true" className="size-3.5" /> : <Pause aria-hidden="true" className="size-3.5" />}
            <span className="hidden sm:inline">{paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 292, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="w-full shrink-0 overflow-hidden border-b bg-card/35 lg:border-b-0 lg:border-r"
            >
              <div className="flex h-full min-w-[292px] flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="eyebrow">Analysis pipeline</p>
                    <p className="mt-1 text-xs text-muted-foreground">{completedCount} of {steps.length} stages completed</p>
                  </div>
                  <button className="icon-button hidden lg:flex" onClick={() => setLeftOpen(false)} aria-label="Collapse pipeline"><PanelLeftClose /></button>
                </div>
                <nav aria-label="Analysis pipeline stages" className="pipeline-scroll flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-y-auto">
                  {steps.map((stage, index) => {
                    const state = stage.status === 'pending' ? 'queued' : stage.status;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => selectStage(index)}
                        aria-current={selectedStage === index ? 'step' : undefined}
                        className="group relative flex min-w-[230px] items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-w-0"
                      >
                        {index < steps.length - 1 && <span className="absolute left-[21px] top-8 hidden h-7 w-px bg-border lg:block" />}
                        <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${state === 'completed' ? 'border-success/20 bg-success/10 text-success' : state === 'running' ? 'border-primary/20 bg-primary/10 text-primary' : state === 'failed' ? 'border-destructive/20 bg-destructive/10 text-destructive' : 'border-border bg-background/50 text-muted-foreground'}`}>
                          <StateGlyph state={state as StageState} paused={paused} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-xs font-medium ${selectedStage === index ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{stage.step_name}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-muted-foreground/70">{stage.status}</span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {!leftOpen && <button className="absolute top-3 left-3 z-10 flex size-7 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm" onClick={() => setLeftOpen(true)} aria-label="Open pipeline"><ChevronRight className="size-4" /></button>}
          {!rightOpen && <button className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-md border bg-card text-muted-foreground hover:bg-accent hover:text-foreground shadow-sm" onClick={() => setRightOpen(true)} aria-label="Open job details"><ChevronLeft className="size-4" /></button>}

          <div ref={workspaceScrollRef} onScroll={(event) => { workspaceScrollTopRef.current = event.currentTarget.scrollTop }} className="workspace-grid flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
              <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative flex size-11 shrink-0 items-center justify-center rounded-lg border bg-secondary">
                    <Sparkles aria-hidden="true" className="size-5 text-primary" />
                    {!paused && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-background bg-success" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-balance text-lg font-semibold tracking-tight">{runningStep ? runningStep.step_name : "Analysis Agent"}</h1>
                      <span className="status-badge">{paused ? 'Paused' : runningStep ? 'Working' : 'Completed'}</span>
                    </div>
                    <p className="mt-1 max-w-xl text-pretty text-sm leading-6 text-muted-foreground">Extracting insights and synthesizing data points across the prospectus.</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  <span>Elapsed {formatTime(elapsedTime)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div role="tablist" aria-label="Agent activity views" className="flex max-w-full overflow-x-auto rounded-md border bg-card p-1">
                  {(['Thinking', 'Logs', 'Progress'] as View[]).map((item) => (
                    <button
                      key={item}
                      role="tab"
                      aria-selected={view === item}
                      onClick={() => setView(item)}
                      className={`rounded px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === item ? 'bg-secondary text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >{item}</button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18 }}
                >
                  {view === 'Thinking' && (
                    <div className="panel overflow-hidden">
                      <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2"><CircleDot aria-hidden="true" className="size-3.5 text-primary" /><p className="eyebrow">Live reasoning trace</p></div>
                      </div>
                      <div className="flex flex-col gap-5 p-5 font-mono text-xs leading-6 text-muted-foreground">
                        <p><span className="mr-3 text-primary">01</span>Initializing {currentStep?.step_name || 'Agent'}.</p>
                        <p><span className="mr-3 text-primary">02</span>Polling vector database for relevant prospectus chunks.</p>
                        <p><span className="mr-3 text-primary">03</span>Synthesizing findings.</p>
                        <div className="rounded-md border-l-2 border-l-primary bg-secondary/60 p-4 text-foreground">
                          {currentStep?.status === 'running' ? 'Agent is actively extracting and formatting data...' : currentStep?.status === 'completed' ? 'Agent finished successfully.' : 'Agent is queued.'}
                          {!paused && currentStep?.status === 'running' && <motion.span className="ml-1 inline-block h-3 w-1 bg-primary" animate={!reduceMotion ? { opacity: [0, 1, 0] } : undefined} transition={{ duration: 1, repeat: Infinity }} />}
                        </div>
                      </div>
                    </div>
                  )}

                  {view === 'Logs' && (
                    logs.length > 0 ? (
                      <div className="panel p-3 font-mono text-[11px] min-h-[200px] max-h-[420px] overflow-y-auto flex flex-col gap-1.5">
                        {logs.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-2 text-muted-foreground">
                            <span className="shrink-0 text-[10px] opacity-60">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            <span className={`shrink-0 uppercase text-[10px] ${entry.level === 'error' ? 'text-destructive' : entry.level === 'warning' ? 'text-primary' : 'text-muted-foreground/70'}`}>{entry.level}</span>
                            <span className="text-foreground">{entry.event}</span>
                            {entry.step_name && <span className="opacity-60">· {entry.step_name}</span>}
                            {entry.message && <span className="truncate opacity-80">{entry.message}</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="panel p-2 font-mono text-[11px] min-h-[200px] flex items-center justify-center">
                        <div className="max-w-sm px-4 text-center text-muted-foreground">
                          <TerminalSquare className="mx-auto mb-3 size-4 text-primary" />
                          <p className="text-xs font-medium text-foreground">Live agent logs are unavailable</p>
                          <p className="mt-1 text-[11px] leading-relaxed">
                            Waiting for log events from the agent pipeline.
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  {view === 'Progress' && (
                    <div className="panel p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="eyebrow">Agent completion</p>
                          <p className="mt-2 text-4xl font-semibold">{stageCompletionPct}%</p>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{completedCount} of {steps.length} checkpoints</span>
                      </div>
                      <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${stageCompletionPct}%` }} />
                      </div>
                      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">The multi-agent pipeline is orchestrating the document review.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <footer className="flex h-9 shrink-0 items-center justify-between border-t bg-card/60 px-4 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-4"><span>Model: {currentModelLabel}</span><span className="hidden sm:inline">Context: Dynamic</span></div>
            <div className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-3" /><span>Evidence grounded</span></div>
          </footer>
        </section>

        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 286, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="w-full shrink-0 overflow-hidden border-t bg-card/35 lg:border-l lg:border-t-0"
            >
              <div className="min-w-[286px]">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div><p className="eyebrow">Job information</p><p className="mt-1 text-xs text-muted-foreground">Active analysis run</p></div>
                  <button className="icon-button hidden lg:flex" onClick={() => setRightOpen(false)} aria-label="Collapse job details"><PanelRightClose /></button>
                </div>
                <div className="flex flex-col gap-6 p-4">
                  <section>
                    <div className="mb-3 flex items-center justify-between"><p className="eyebrow">Run ID</p><button onClick={copyJobId} className="icon-button" aria-label="Copy job ID">{copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}</button></div>
                    <p className="font-mono text-[10px] break-all">{job?.id}</p>
                  </section>
                  <section className="panel p-3">
                    <div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-xs font-medium">Uploaded Prospectus</p><p className="mt-1 font-mono text-[9px] text-muted-foreground">{uploadedProspectusStatus}</p></div></div>
                  </section>
                  <section>
                    <p className="eyebrow">Overall completion</p>
                    <div className="mt-3 flex items-end justify-between"><span className="text-3xl font-semibold tracking-tight">{completedCount}<span className="text-base text-muted-foreground">/{steps.length}</span></span></div>
                    <div className="mt-3 flex gap-1 h-1" aria-label="stages complete">
                      {steps.map((stage) => <span key={stage.id} className={`flex-1 rounded-full ${stage.status === 'completed' ? 'bg-success' : stage.status === 'running' ? 'bg-primary' : 'bg-secondary'}`} />)}
                    </div>
                  </section>
                  <dl className="flex flex-col gap-3 border-t pt-5 text-xs">
                    <div className="flex items-center justify-between"><dt className="text-muted-foreground">Current stage</dt><dd className="truncate ml-4">{runningStep?.step_name || 'N/A'}</dd></div>
                    <div className="flex items-center justify-between"><dt className="text-muted-foreground">Agent state</dt><dd className="text-primary">{paused ? 'Paused' : runningStep ? 'Running' : 'Complete'}</dd></div>
                  </dl>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}