"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 dark:border-gray-800 dark:bg-gray-900",
        hover && "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
