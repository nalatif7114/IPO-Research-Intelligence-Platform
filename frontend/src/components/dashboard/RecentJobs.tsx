import { Clock, CheckCircle2, AlertCircle, Loader2, Circle } from "lucide-react";

interface RecentJob {
  id: string;
  company: string;
  status: "completed" | "in_progress" | "failed" | "queued";
  date: string;
  progress: number;
  analyst: string;
}

const recentJobs: RecentJob[] = [
  {
    id: "JOB-001",
    company: "TechCorp Global",
    status: "completed",
    date: "2026-07-10",
    progress: 100,
    analyst: "Sarah Chen",
  },
  {
    id: "JOB-002",
    company: "GreenEnergy Inc",
    status: "in_progress",
    date: "2026-07-10",
    progress: 67,
    analyst: "James Miller",
  },
  {
    id: "JOB-003",
    company: "CloudScale AI",
    status: "in_progress",
    date: "2026-07-09",
    progress: 42,
    analyst: "Sarah Chen",
  },
  {
    id: "JOB-004",
    company: "BioHealth Pharma",
    status: "failed",
    date: "2026-07-09",
    progress: 83,
    analyst: "Alex Kumar",
  },
  {
    id: "JOB-005",
    company: "FinLedger Systems",
    status: "queued",
    date: "2026-07-09",
    progress: 0,
    analyst: "James Miller",
  },
  {
    id: "JOB-006",
    company: "NanoMaterials Ltd",
    status: "completed",
    date: "2026-07-08",
    progress: 100,
    analyst: "Alex Kumar",
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    badgeClass: "badge-success",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "badge-warning",
    icon: Loader2,
  },
  failed: {
    label: "Failed",
    badgeClass: "badge-error",
    icon: AlertCircle,
  },
  queued: {
    label: "Queued",
    badgeClass: "badge-info",
    icon: Circle,
  },
};

export default function RecentJobs() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">Recent Jobs</h3>
        </div>
        <a
          href="/analysis"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3 text-left font-medium">Job ID</th>
              <th className="px-6 py-3 text-left font-medium">Company</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Progress</th>
              <th className="px-6 py-3 text-left font-medium">Analyst</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recentJobs.map((job) => {
              const cfg = statusConfig[job.status];
              const StatusIcon = cfg.icon;
              return (
                <tr
                  key={job.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-mono text-slate-300">
                      {job.id}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-white">
                      {job.company}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`badge ${cfg.badgeClass}`}>
                      <StatusIcon
                        className={`w-3 h-3 ${
                          job.status === "in_progress" ? "animate-spin" : ""
                        }`}
                      />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            job.status === "failed"
                              ? "bg-red-500"
                              : job.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-slate-400">{job.analyst}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-sm text-slate-500">{job.date}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
