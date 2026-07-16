'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function AnalysisError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the failure observable without exposing implementation details.
    console.error('analysis_workspace_error')
  }, [])

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col items-center justify-center text-center">
      <div className="flex size-12 items-center justify-center rounded-lg border border-destructive/25 bg-destructive/10"><AlertCircle className="size-6 text-destructive" /></div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight">Unable to load the analysis workspace</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">Please try again. If the issue persists, verify the analysis service is available.</p>
      <button onClick={reset} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
    </div>
  )
}
