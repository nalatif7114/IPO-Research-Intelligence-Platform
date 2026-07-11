"use client";

import { useState } from "react";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder — connect to auth API
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card p-8 glow animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">
              IPO Research Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@company.com"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-dark pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500/20"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Create account
            </Link>
          </p>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          © 2026 IPO Research Intelligence Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
