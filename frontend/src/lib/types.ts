// ─── User & Auth ─────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: "admin" | "analyst" | "viewer";
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization?: string;
  role?: "admin" | "analyst" | "viewer";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ─── Company ─────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  ticker?: string;
  sector: string;
  industry: string;
  description?: string;
  website?: string;
  logo_url?: string;
  ipo_date?: string;
  ipo_price?: number;
  status: "pre-ipo" | "filed" | "ipo" | "post-ipo";
  created_at: string;
  updated_at: string;
}

// ─── Job / Analysis ──────────────────────────────────────────
export type JobStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export interface AgentStep {
  id: string;
  agent_name: string;
  display_name: string;
  status: JobStatus;
  started_at?: string;
  completed_at?: string;
  output_preview?: string;
  error?: string;
  order: number;
}

export interface Job {
  id: string;
  company_id: string;
  company_name: string;
  status: JobStatus;
  progress: number;
  current_step?: string;
  steps: AgentStep[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
  created_by: string;
}

// ─── Report ──────────────────────────────────────────────────
export interface Report {
  id: string;
  job_id: string;
  company_id: string;
  company_name: string;
  title: string;
  report_type: "full" | "summary" | "risk" | "financial" | "market";
  status: "draft" | "final" | "archived";
  confidence_score: number;
  content_preview?: string;
  file_url?: string;
  citations: Citation[];
  created_at: string;
  updated_at: string;
}

export interface Citation {
  id: string;
  source: string;
  url?: string;
  excerpt: string;
  confidence: number;
}

// ─── Upload ──────────────────────────────────────────────────
export interface UploadedFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: "uploaded" | "processing" | "processed" | "error";
  uploaded_at: string;
  uploaded_by: string;
}

// ─── Evaluation ──────────────────────────────────────────────
export interface EvaluationMetrics {
  overall_score: number;
  groundedness: number;
  consistency: number;
  relevance: number;
  completeness: number;
  total_evaluations: number;
}

export interface EvaluationEntry {
  id: string;
  report_id: string;
  company_name: string;
  score: number;
  groundedness: number;
  consistency: number;
  feedback?: string;
  evaluated_at: string;
  evaluator: string;
}

// ─── Stats ───────────────────────────────────────────────────
export interface DashboardStats {
  total_analyses: number;
  active_jobs: number;
  reports_generated: number;
  success_rate: number;
  total_analyses_trend: number;
  active_jobs_trend: number;
  reports_trend: number;
  success_rate_trend: number;
}

// ─── Settings ────────────────────────────────────────────────
export interface LLMConfig {
  provider: "openai" | "anthropic" | "google" | "local";
  model: string;
  temperature: number;
  max_tokens: number;
  api_key_set: boolean;
}

export interface NotificationPreferences {
  email_on_complete: boolean;
  email_on_failure: boolean;
  browser_notifications: boolean;
}

// ─── API Response Wrappers ───────────────────────────────────
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
