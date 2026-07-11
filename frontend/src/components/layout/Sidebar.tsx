"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  FileText,
  Building2,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Analysis", href: "/analysis", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Evaluation", href: "/evaluation", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(10,14,26,0.99) 100%)",
        borderRight: "1px solid rgba(99, 102, 241, 0.1)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/5">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden whitespace-nowrap">
            <h1 className="text-base font-bold gradient-text leading-tight">
              IPO Research
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
              Intelligence Platform
            </p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-purple-500/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-purple-500" />
              )}
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="animate-fade-in">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
