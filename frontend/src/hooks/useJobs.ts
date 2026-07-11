"use client";

import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/api";
import type { Job, PaginatedResponse } from "@/lib/types";

export function useJobs(autoFetch = true) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchJobs = useCallback(
    async (page = 1, pageSize = 20) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get<PaginatedResponse<Job>>(
          "/jobs",
          { params: { page, page_size: pageSize } }
        );
        setJobs(data.items);
        setTotal(data.total);
        return data;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch jobs";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getJob = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<Job>(`/jobs/${id}`);
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch job";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchJobs();
    }
  }, [autoFetch, fetchJobs]);

  return { jobs, loading, error, total, fetchJobs, getJob };
}
