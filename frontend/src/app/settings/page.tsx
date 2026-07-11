"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  User,
  Mail,
  Shield,
  Save,
  Eye,
  EyeOff,
  Cpu,
  Bell,
  BellRing,
  Monitor,
  ChevronDown,
  Check,
  Settings2,
  Sparkles,
  Key,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */
type Provider = "openai" | "anthropic" | "google" | "local";

interface ProfileState {
  name: string;
  email: string;
  role: string;
  organization: string;
}

interface LLMState {
  provider: Provider;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

interface NotificationState {
  emailOnComplete: boolean;
  emailOnFailure: boolean;
  browserNotifications: boolean;
  weeklyDigest: boolean;
}

/* ── Provider → Model map ─────────────────────────────────────── */
const modelOptions: Record<Provider, string[]> = {
  openai: ["gpt-4o", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
  anthropic: [
    "claude-sonnet-4-20250514",
    "claude-3.5-sonnet",
    "claude-3-opus",
    "claude-3-haiku",
  ],
  google: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  local: ["llama-3.1-70b", "llama-3.1-8b", "mistral-7b", "phi-3"],
};

const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  local: "Local (Ollama)",
};

/* ── Toggle Component ─────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked
          ? "bg-gradient-to-r from-blue-500 to-purple-500"
          : "bg-white/10"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileState>({
    name: "Sarah Chen",
    email: "sarah.chen@research.io",
    role: "analyst",
    organization: "IPO Research Lab",
  });

  const [llm, setLLM] = useState<LLMState>({
    provider: "openai",
    model: "gpt-4o",
    apiKey: "sk-••••••••••••••••••••••••••••••••",
    temperature: 0.3,
    maxTokens: 4096,
  });

  const [notifications, setNotifications] = useState<NotificationState>({
    emailOnComplete: true,
    emailOnFailure: true,
    browserNotifications: false,
    weeklyDigest: true,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleProviderChange(provider: Provider) {
    setLLM((prev) => ({
      ...prev,
      provider,
      model: modelOptions[provider][0],
    }));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-slate-400" />
              Settings
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your profile, model configuration, and preferences.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="gradient-btn flex items-center gap-2 text-sm"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* ── Profile Section ─────────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-blue-400" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  className="input-dark pl-10"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  value={profile.role}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, role: e.target.value }))
                  }
                  className="input-dark pl-10 pr-10 appearance-none cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Organization
              </label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, organization: e.target.value }))
                }
                className="input-dark"
              />
            </div>
          </div>
        </div>

        {/* ── LLM Configuration ───────────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            LLM Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Provider
              </label>
              <div className="relative">
                <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  value={llm.provider}
                  onChange={(e) =>
                    handleProviderChange(e.target.value as Provider)
                  }
                  className="input-dark pl-10 pr-10 appearance-none cursor-pointer"
                >
                  {(
                    Object.entries(providerLabels) as [Provider, string][]
                  ).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Model
              </label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <select
                  value={llm.model}
                  onChange={(e) =>
                    setLLM((s) => ({ ...s, model: e.target.value }))
                  }
                  className="input-dark pl-10 pr-10 appearance-none cursor-pointer"
                >
                  {modelOptions[llm.provider].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* API Key */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                API Key
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showApiKey ? "text" : "password"}
                  value={llm.apiKey}
                  onChange={(e) =>
                    setLLM((s) => ({ ...s, apiKey: e.target.value }))
                  }
                  className="input-dark pl-10 pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Your API key is encrypted and stored securely. Never shared with
                third parties.
              </p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Temperature
                <span className="ml-2 text-slate-500 font-normal">
                  {llm.temperature}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={llm.temperature}
                onChange={(e) =>
                  setLLM((s) => ({
                    ...s,
                    temperature: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Max Tokens
              </label>
              <input
                type="number"
                value={llm.maxTokens}
                onChange={(e) =>
                  setLLM((s) => ({
                    ...s,
                    maxTokens: parseInt(e.target.value) || 0,
                  }))
                }
                className="input-dark font-mono text-xs"
                min={256}
                max={128000}
                step={256}
              />
            </div>
          </div>
        </div>

        {/* ── Notification Preferences ────────────────────────── */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-amber-400" />
            Notification Preferences
          </h2>

          <div className="space-y-5">
            {/* Email on complete */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Email on Completion
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Receive email when an analysis job completes successfully.
                  </p>
                </div>
              </div>
              <Toggle
                checked={notifications.emailOnComplete}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, emailOnComplete: v }))
                }
              />
            </div>

            <div className="border-t border-white/5" />

            {/* Email on failure */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <BellRing className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Email on Failure
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Get notified immediately when a job fails or encounters
                    errors.
                  </p>
                </div>
              </div>
              <Toggle
                checked={notifications.emailOnFailure}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, emailOnFailure: v }))
                }
              />
            </div>

            <div className="border-t border-white/5" />

            {/* Browser notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Browser Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Push notifications in your browser for real-time updates.
                  </p>
                </div>
              </div>
              <Toggle
                checked={notifications.browserNotifications}
                onChange={(v) =>
                  setNotifications((n) => ({
                    ...n,
                    browserNotifications: v,
                  }))
                }
              />
            </div>

            <div className="border-t border-white/5" />

            {/* Weekly digest */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Weekly Digest
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Summary of all analyses and reports delivered weekly.
                  </p>
                </div>
              </div>
              <Toggle
                checked={notifications.weeklyDigest}
                onChange={(v) =>
                  setNotifications((n) => ({ ...n, weeklyDigest: v }))
                }
              />
            </div>
          </div>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            className="gradient-btn flex items-center gap-2 text-sm"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                Changes Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
