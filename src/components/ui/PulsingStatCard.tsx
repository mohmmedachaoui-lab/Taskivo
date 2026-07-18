"use client";

import { useEffect, useState, useRef } from "react";
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
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
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

  return <span>{display}</span>;
}

export default function PulsingStatCard({
  label,
  value,
  icon: Icon,
  color,
  suffix,
}: PulsingStatCardProps) {
  return (
    <div
      className="h-full stat-pulse rounded-2xl p-5 flex flex-col justify-between"
      style={
        {
          "--pulse-color": `${color}08`,
          background: `linear-gradient(135deg, ${color}06, transparent 60%)`,
        } as React.CSSProperties
      }
    >
      {/* Icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}12` }}
      >
        <Icon className="h-5 w-5" style={{ color }} strokeWidth={2.5} />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold text-white font-[family-name:var(--font-mono)] leading-none mb-1">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} />
          ) : (
            value
          )}
          {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
        </p>
        <p className="text-[10px] text-gray-500 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          {label}
        </p>
      </div>
    </div>
  );
}
