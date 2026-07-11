import { BarChart3 } from "lucide-react";

export default function ActivityChart() {
  // Simulated bar chart data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [65, 45, 80, 55, 90, 40, 70];
  const maxVal = Math.max(...values);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">
            Weekly Activity
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-400">Analyses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-slate-400">Reports</span>
          </div>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex items-end gap-3 h-48">
        {days.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center gap-1 flex-1 justify-end">
              {/* Primary bar */}
              <div
                className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-out hover:from-blue-500 hover:to-blue-300 cursor-pointer relative group"
                style={{
                  height: `${(values[i] / maxVal) * 100}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-800 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {values[i]} analyses
                </div>
              </div>
              {/* Secondary bar (Reports) */}
              <div
                className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-purple-600/60 to-purple-400/60 transition-all duration-700 ease-out hover:from-purple-500/70 hover:to-purple-300/70 cursor-pointer"
                style={{
                  height: `${((values[i] * 0.6) / maxVal) * 100}%`,
                  animationDelay: `${i * 100 + 50}ms`,
                }}
              />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
        <div>
          <p className="text-lg font-bold text-white">247</p>
          <p className="text-[11px] text-slate-500">Total this week</p>
        </div>
        <div>
          <p className="text-lg font-bold text-white">35.3</p>
          <p className="text-[11px] text-slate-500">Daily average</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-400">+18%</p>
          <p className="text-[11px] text-slate-500">vs last week</p>
        </div>
      </div>
    </div>
  );
}
