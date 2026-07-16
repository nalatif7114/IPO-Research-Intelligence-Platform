"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageFrame, PlatformHeader } from "@/components/platform/platform-shell";
import apiClient from "@/lib/api";

export default function CopilotWrapperPage() {
  const router = useRouter();
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    apiClient.get("/jobs?page_size=1")
      .then(({ data }) => {
        if (data.items && data.items.length > 0) {
          const id = data.items[0].id;
          router.replace(`/analysis/${id}?tab=copilot`);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [router]);

  return (
    <PageFrame>
      <PlatformHeader eyebrow="System routing" title="Locating investor copilot" />
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        {error ? (
          <div className="text-center">
            <h1 className="text-xl font-semibold">No active analysis found</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please upload a prospectus to begin.</p>
            <button onClick={() => router.push('/upload')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Upload prospectus</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Redirecting to latest copilot session...</p>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
