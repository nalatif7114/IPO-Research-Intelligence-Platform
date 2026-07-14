"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Upload,
  BarChart2,
  History,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Upload Prospectus", href: "/upload", icon: Upload },
  { label: "Analysis Workspace", href: "/analysis", icon: BarChart2 },
  { label: "History", href: "/history", icon: History },
  { label: "Investor Copilot", href: "/copilot", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen flex flex-col transition-all w-[260px]"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-glass)",
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center justify-center pt-8 pb-10">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 mb-3">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-[15px] font-bold text-white tracking-wide uppercase">
          IPO INTELLIGENCE
        </h1>
        <p className="text-[10px] text-[var(--text-muted)] font-medium tracking-[0.1em] uppercase mt-0.5">
          AI RESEARCH PLATFORM
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          // For mockup purposes, treat "/" as active if it's home, but let's just make Home active if path is / or /upload for now, or match precisely.
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/upload"); // mockup shows Home / Upload as active
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[var(--bg-card)] text-white"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-glass)]"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--primary)]" />
              )}
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-6 mt-auto">
        {/* Profile */}
        <div className="flex items-center justify-between p-3 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-glass)] cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-tight">Analyst</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Premium Plan</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        </div>

        {/* Theme & Version */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <button className="text-[var(--text-muted)] hover:text-white transition-colors">
              <Sun className="w-[18px] h-[18px]" />
            </button>
            <button className="text-[var(--text-secondary)] transition-colors">
              <Moon className="w-[18px] h-[18px]" />
            </button>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            v 1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
}
