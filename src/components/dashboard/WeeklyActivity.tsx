"use client";

import { BarChart3 } from "lucide-react";

export default function WeeklyActivity() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...data, 1);

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-[#00d4ff]" strokeWidth={2.5} />
        <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          Weekly Activity
        </h3>
      </div>
      <div className="flex-1 flex items-end gap-2 min-h-0">
        {days.map((day, i) => {
          const height = data[i] > 0 ? (data[i] / max) * 100 : 2;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500 relative group"
                  style={{
                    height: `${height}%`,
                    background: data[i] > 0
                      ? "linear-gradient(to top, rgba(0,212,255,0.2), rgba(0,212,255,0.6))"
                      : "rgba(0,212,255,0.05)",
                    boxShadow: data[i] > 0 ? "0 0 10px rgba(0,212,255,0.2)" : "none",
                  }}
                >
                  {data[i] > 0 && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
                  )}
                </div>
              </div>
              <span className="text-[9px] text-gray-600 font-[family-name:var(--font-mono)] uppercase">
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
