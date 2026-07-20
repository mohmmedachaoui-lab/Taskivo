"use client";

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let globalToast: ((message: string, variant?: ToastVariant, duration?: number) => void) | null = null;

export function showToast(message: string, variant: ToastVariant = "info", duration = 4000) {
  globalToast?.(message, variant, duration);
}

export function useToast() {
  return useContext(ToastContext);
}

const variantStyles: Record<ToastVariant, { border: string; icon: React.ReactNode; bg: string; ariaLabel: string }> = {
  success: {
    border: "border-[#10b981]/30",
    icon: <CheckCircle2 className="h-4 w-4 text-[#10b981]" />,
    bg: "bg-[#10b981]/5",
    ariaLabel: "Success",
  },
  error: {
    border: "border-[#ef4444]/30",
    icon: <XCircle className="h-4 w-4 text-[#ef4444]" />,
    bg: "bg-[#ef4444]/5",
    ariaLabel: "Error",
  },
  warning: {
    border: "border-[#f97316]/30",
    icon: <AlertTriangle className="h-4 w-4 text-[#f97316]" />,
    bg: "bg-[#f97316]/5",
    ariaLabel: "Warning",
  },
  info: {
    border: "border-[#00d4ff]/30",
    icon: <Info className="h-4 w-4 text-[#00d4ff]" />,
    bg: "bg-[#00d4ff]/5",
    ariaLabel: "Information",
  },
};

function ToastItemView({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const style = variantStyles[item.variant];
  const dismissRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), item.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss, item.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="status"
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      aria-label={`${style.ariaLabel}: ${item.message}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl glass neon-border ${style.border} ${style.bg} max-w-xs backdrop-blur-xl`}
      style={{ touchAction: "pan-x" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={(_, info) => {
        if (info.offset.x > 60 || info.velocity.x > 300) {
          onDismiss(item.id);
        }
      }}
    >
      <div className="flex-shrink-0" aria-hidden="true">{style.icon}</div>
      <p className="text-xs text-gray-200 flex-1 leading-relaxed">{item.message}</p>
      <button
        ref={dismissRef}
        onClick={() => onDismiss(item.id)}
        className="flex-shrink-0 p-0.5 text-gray-500 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  useEffect(() => {
    globalToast = toast;
    return () => { globalToast = null; };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
        role="region"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <div key={item.id} className="pointer-events-auto">
              <ToastItemView item={item} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
