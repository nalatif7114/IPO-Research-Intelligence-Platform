"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, FileText, FileUp, LockKeyhole, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { PageFrame, PlatformHeader, SectionHeading, StatusBadge } from '@/components/platform/platform-shell';

type UploadState = 'idle' | 'ready' | 'uploading' | 'complete' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const selectFile = (selected?: File) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) { 
      setFile(selected); 
      setState('error'); 
      setErrorMsg("This file is not a PDF. Choose a valid prospectus.");
      return; 
    }
    if (selected.size > 100 * 1024 * 1024) {
      setFile(selected);
      setState('error');
      setErrorMsg("File exceeds 100 MB limit.");
      return;
    }
    setFile(selected); 
    setState('ready'); 
    setProgress(0);
    setErrorMsg(null);
  };

  const uploadFile = async () => {
    if (!file || state === 'error') return;
    
    setState('uploading'); 
    setProgress(15);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      setProgress(45);
      const res = await fetch("http://localhost:8000/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      setProgress(85);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
      
      const data = await res.json();
      setProgress(100);
      setState('complete');
      
      // Redirect to analysis page
      setTimeout(() => {
        router.push(`/analysis/${data.job_id}`);
      }, 500);
      
    } catch (err: any) {
      setErrorMsg(err.message);
      setState('error');
    }
  };

  const reset = () => { 
    setFile(null); 
    setState('idle'); 
    setProgress(0); 
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = ''; 
  };

  return (
    <PageFrame>
      <PlatformHeader eyebrow="Prospectus intake" title="Secure document upload" />
      <div className="workspace-grid mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 lg:py-12">
        <div className="text-center">
          <StatusBadge tone="positive">Encrypted ingestion</StatusBadge>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl">Upload an IPO prospectus</h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">PDF documents are validated, secured, and prepared for the multi-agent research pipeline.</p>
        </div>
        
        <motion.section initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} className="panel mx-auto w-full max-w-3xl overflow-hidden p-4 md:p-6">
          <button 
            type="button" 
            onClick={() => inputRef.current?.click()} 
            onDragOver={(event) => event.preventDefault()} 
            onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0]) }} 
            className={`flex min-h-80 w-full flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${state === 'error' ? 'border-destructive/60 bg-destructive/5' : file ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/40 hover:border-primary/50 hover:bg-primary/5'}`}
          >
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
            <motion.span animate={state === 'uploading' && !reduceMotion ? { y: [0,-6,0] } : undefined} transition={{ repeat: Infinity, duration: 1.4 }} className={`flex size-16 items-center justify-center rounded-2xl border ${state === 'error' ? 'bg-destructive/10 text-destructive' : state === 'complete' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              {state === 'complete' ? <CheckCircle2 className="size-7" /> : state === 'error' ? <AlertCircle className="size-7" /> : <FileUp className="size-7" />}
            </motion.span>
            <h2 className="mt-5 text-lg font-semibold">{file ? file.name : 'Drop your prospectus here'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{state === 'error' ? errorMsg || 'Validation failed' : file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · PDF document` : 'or click to browse · PDF only · up to 100 MB'}</p>
            {state === 'idle' && <span className="mt-5 rounded-lg border bg-card px-4 py-2 text-xs font-medium">Select PDF</span>}
          </button>
          
          {file && (
            <div className="mt-4 rounded-xl border bg-background/50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{state === 'complete' ? 'Upload complete · redirecting...' : state === 'uploading' ? `Uploading securely · ${progress}%` : state === 'error' ? 'Validation failed' : 'Validated · ready to upload'}</p>
                </div>
                <button onClick={reset} className="icon-button" aria-label="Remove file"><X /></button>
              </div>
              {state === 'uploading' && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div className="h-full bg-primary" animate={{ width: `${progress}%` }} />
                </div>
              )}
              <div className="mt-4 flex justify-end gap-2">
                {state === 'error' && <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-xs"><RotateCcw className="size-3.5" />Try another</button>}
                {state === 'ready' && <button onClick={uploadFile} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"><FileUp className="size-3.5" />Upload securely</button>}
                {state === 'complete' && <Link href="/analysis" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">Start analysis <ArrowRight className="size-3.5" /></Link>}
              </div>
            </div>
          )}
        </motion.section>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[[LockKeyhole,'Private by design','Encrypted in transit and isolated to your workspace.'],[ShieldCheck,'PDF validation','Format and integrity checks run before ingestion.'],[FileText,'Citation ready','Page structure is preserved for precise evidence links.']].map(([Icon,title,copy]) => { 
            const Glyph = Icon as typeof FileText; 
            return (
              <article key={String(title)} className="panel p-5">
                <Glyph className="size-4 text-primary" />
                <h3 className="mt-4 text-sm font-semibold">{String(title)}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{String(copy)}</p>
              </article>
            ); 
          })}
        </div>
      </div>
    </PageFrame>
  );
}
