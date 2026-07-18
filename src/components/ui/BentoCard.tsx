"use client";

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

type BentoVariant = "cyan" | "yellow" | "purple" | "red" | "neutral";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  variant?: BentoVariant;
  span?: number;
  rowSpan?: number;
  delay?: number;
  onClick?: () => void;
}

const VARIANT_CLASSES: Record<BentoVariant, string> = {
  cyan: "bento-cyan",
  yellow: "bento-yellow",
  purple: "bento-purple",
  red: "bento-red",
  neutral: "bento-neutral",
};

export default function BentoCard({
  children,
  className,
  variant = "cyan",
  span,
  rowSpan,
  delay = 0,
  onClick,
}: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -6,
      y: (x - 0.5) * 6,
    });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      className={clsx(
        "bento-card",
        VARIANT_CLASSES[variant],
        span && `bento-span-${span}`,
        rowSpan && `bento-row-${rowSpan}`,
        onClick && "cursor-pointer",
        className
      )}
      style={{
        "--tilt-x": `${tilt.x}deg`,
        "--tilt-y": `${tilt.y}deg`,
      } as React.CSSProperties}
    >
      {children}
    </motion.div>
  );
}
