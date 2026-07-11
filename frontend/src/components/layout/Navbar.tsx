"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Analysis Complete",
      message: "TechCorp IPO analysis finished successfully.",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Report Ready",
      message: "GreenEnergy Inc full report is available.",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "New Company Added",
      message: "CloudScale AI has been added to the database.",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div
            className={`relative flex items-center transition-all duration-300 ${
              searchFocused ? "scale-[1.02]" : ""
            }`}
          >
            <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search companies, reports, analyses…"
              className="input-dark pl-10 pr-4 py-2 text-sm bg-white/[0.03]"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-card p-2 animate-fade-in">
                <div className="px-3 py-2 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-3 py-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5 ${
                        n.unread ? "bg-blue-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && (
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        )}
                        <div className={n.unread ? "" : "ml-4"}>
                          <p className="text-sm font-medium text-white">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-white/5 mx-1" />

          {/* User avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">
                  Analyst
                </p>
                <p className="text-[10px] text-slate-500">Admin</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 glass-card p-2 animate-fade-in">
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
                <div className="my-1 border-t border-white/5" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
