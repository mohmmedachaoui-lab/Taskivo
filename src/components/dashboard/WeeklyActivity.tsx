"use client";

import { BarChart3 } from "lucide-react";

export default function WeeklyActivity() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(...data, 1);

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(0, 212, 255, 0.03))",
            border: "1px solid rgba(0, 212, 255, 0.1)",
          }}
        >
          <BarChart3 className="h-3.5 w-3.5 text-[#00d4ff]" style={{ filter: "drop-shadow(0 0 3px rgba(0, 212, 255, 0.4))" }} strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          Weekly Activity
        </h3>
      </div>

      <div className="flex-1 flex items-end gap-1.5 min-h-0">
        {days.map((day, i) => {
          const height = data[i] > 0 ? (data[i] / max) * 100 : 3;
          const hasData = data[i] > 0;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-700 relative group"
                  style={{
                    height: `${height}%`,
                    minHeight: "3px",
                    background: hasData
                      ? "linear-gradient(to top, rgba(0,212,255,0.15), rgba(0,212,255,0.5), rgba(59,130,246,0.7))"
                      : "rgba(0,212,255,0.04)",
                    boxShadow: hasData
                      ? "0 0 8px rgba(0,212,255,0.15), 0 -2px 12px rgba(0,212,255,0.1)"
                      : "none",
                    border: hasData ? "1px solid rgba(0,212,255,0.15)" : "1px solid rgba(0,212,255,0.04)",
                    borderBottom: "none",
                  }}
                >
                  {hasData && (
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full"
                      style={{
                        background: "#00d4ff",
                        boxShadow: "0 0 6px rgba(0,212,255,0.6), 0 0 12px rgba(0,212,255,0.3)",
                      }}
                    />
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
