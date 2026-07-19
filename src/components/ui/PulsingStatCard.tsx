"use client";

import { useEffect, useState, useRef, memo } from "react";
import { LucideIcon } from "lucide-react";

interface PulsingStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  suffix?: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState("0");
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 900;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current.toLocaleString());

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

export default memo(function PulsingStatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: PulsingStatCardProps) {
  return (
    <div
      className="h-full stat-pulse rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
      style={
        {
          "--pulse-color": `${color}06`,
          background: `linear-gradient(145deg, ${color}04, rgba(5, 8, 15, 0.9) 60%)`,
        } as React.CSSProperties
      }
    >
      {/* Subtle corner glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />

      {/* Icon */}
      <div
        className="relative h-10 w-10 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}10, ${color}06)`,
          border: `1px solid ${color}15`,
          boxShadow: `0 0 12px ${color}08, inset 0 0 8px ${color}05`,
        }}
      >
        <Icon
          className="h-5 w-5"
          style={{
            color,
            filter: `drop-shadow(0 0 4px ${color}60)`,
          }}
          strokeWidth={2.5}
        />
      </div>

      {/* Value */}
      <div className="relative">
        <p className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] leading-none mb-1.5">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} />
          ) : (
            value
          )}
          {suffix && (
            <span className="text-sm text-gray-500 ml-1 font-normal">{suffix}</span>
          )}
        </p>
        <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          {label}
        </p>
      </div>
    </div>
  );
})
