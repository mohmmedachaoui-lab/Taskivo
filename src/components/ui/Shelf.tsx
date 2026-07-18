"use client";

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ShelfProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  delay?: number;
}

export default function Shelf({ title, icon, children, delay = 0 }: ShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Shelf Title */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        {icon && <span className="text-[#00d4ff]">{icon}</span>}
        <h2 className="text-[13px] font-semibold text-gray-400 font-[family-name:var(--font-mono)] uppercase tracking-[0.2em]">
          {title}
        </h2>
      </div>

      {/* Scroll Container */}
      <div className="shelf-row group">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-10 flex items-center justify-center
                       bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover:opacity-100
                       transition-opacity duration-300 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 text-white/70" />
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="shelf-scroll flex gap-3 overflow-x-auto pb-2"
        >
          {children}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-10 flex items-center justify-center
                       bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover:opacity-100
                       transition-opacity duration-300 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 text-white/70" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
