"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeepModeContextType {
  isDeep: boolean;
  toggleDeep: () => void;
}

const DeepModeContext = createContext<DeepModeContextType>({
  isDeep: false,
  toggleDeep: () => {},
});

export function useDeepMode() {
  return useContext(DeepModeContext);
}

export function DeepModeProvider({ children }: { children: ReactNode }) {
  const [isDeep, setIsDeep] = useState(false);
  const toggleDeep = () => setIsDeep((p) => !p);

  return (
    <DeepModeContext.Provider value={{ isDeep, toggleDeep }}>
      <div className={`deep-mode ${isDeep ? "deep-mode-active" : ""}`}>
        {children}
      </div>
      {/* Scan line effect when deep mode is active */}
      <AnimatePresence>
        {isDeep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[100]"
          >
            <div className="absolute inset-0 scan-line h-32 bg-gradient-to-b from-transparent via-[#00d4ff]/20 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </DeepModeContext.Provider>
  );
}
