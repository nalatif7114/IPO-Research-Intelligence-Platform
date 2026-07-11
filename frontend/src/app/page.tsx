"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentJobs from "@/components/dashboard/RecentJobs";
import ActivityChart from "@/components/dashboard/ActivityChart";
import {
  BarChart3,
  Zap,
  FileText,
  Target,
  Plus,
  Upload,
  Search,
  ArrowRight,
} from "lucide-react";

const quickActions = [
  {
    label: "New Analysis",
    description: "Start a new IPO research analysis",
    icon: Plus,
    href: "/analysis",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    label: "Upload Data",
    description: "Upload prospectus or financial docs",
    icon: Upload,
    href: "/upload",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    label: "Browse Reports",
    description: "View generated research reports",
    icon: FileText,
    href: "/reports",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Search Companies",
    description: "Find companies in the database",
    icon: Search,
    href: "/companies",
    gradient: "from-amber-500 to-amber-600",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">Analyst</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your IPO research today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
          <StatsCard
            icon={BarChart3}
            label="Total Analyses"
            value="1,284"
            trend={12.5}
            accentColor="blue"
          />
          <StatsCard
            icon={Zap}
            label="Active Jobs"
            value="7"
            trend={-3.2}
            accentColor="purple"
          />
          <StatsCard
            icon={FileText}
            label="Reports Generated"
            value="892"
            trend={8.1}
            accentColor="emerald"
          />
          <StatsCard
            icon={Target}
            label="Success Rate"
            value="96.8%"
            trend={2.4}
            accentColor="amber"
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Jobs — spans 2 cols */}
          <div className="xl:col-span-2">
            <RecentJobs />
          </div>

          {/* Activity chart */}
          <div className="xl:col-span-1">
            <ActivityChart />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 glow-hover cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go <ArrowRight className="w-3 h-3" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
