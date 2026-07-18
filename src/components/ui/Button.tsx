"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "neon";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed font-[family-name:var(--font-mono)] text-xs tracking-wide uppercase",
          {
            "bg-[#00d4ff] text-gray-900 hover:bg-[#00a8cc] shadow-lg shadow-[#00d4ff]/20 hover-glow":
              variant === "primary",
            "bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] border border-[#00d4ff]/20 hover:border-[#00d4ff]/40 hover-glow":
              variant === "secondary",
            "text-gray-500 hover:text-[#00d4ff] hover:bg-[#00d4ff]/5":
              variant === "ghost",
            "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40":
              variant === "danger",
            "bg-transparent text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/10 hover:border-[#00d4ff]/60 pulse-neon":
              variant === "neon",
          },
          {
            "px-3 py-1.5 text-[10px]": size === "sm",
            "px-4 py-2 text-xs": size === "md",
            "px-6 py-2.5 text-sm": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
