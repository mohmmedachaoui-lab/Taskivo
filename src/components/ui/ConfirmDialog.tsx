"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import Button from "./Button";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  loadingLabel?: string;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: React.ReactNode; accentColor: string; glowColor: string; borderClass: string; btnClass: string }
> = {
  danger: {
    icon: <ShieldAlert className="h-5 w-5 text-[#ef4444]" />,
    accentColor: "#ef4444",
    glowColor: "rgba(239,68,68,0.15)",
    borderClass: "border-[#ef4444]/30",
    btnClass: "bg-[#ef4444] hover:bg-[#dc2626] text-white border-[#ef4444]/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-[#f97316]" />,
    accentColor: "#f97316",
    glowColor: "rgba(249,115,22,0.15)",
    borderClass: "border-[#f97316]/30",
    btnClass: "bg-[#f97316] hover:bg-[#ea580c] text-white border-[#f97316]/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]",
  },
  info: {
    icon: <Info className="h-5 w-5 text-[#00d4ff]" />,
    accentColor: "#00d4ff",
    glowColor: "rgba(0,212,255,0.15)",
    borderClass: "border-[#00d4ff]/30",
    btnClass: "",
  },
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
  loadingLabel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
            onClick={onCancel}
          />
          <motion.div
            key="confirm-panel"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 200) {
                onCancel();
              }
            }}
            style={{ touchAction: "pan-x" }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-xs mx-auto z-[80] glass neon-border rounded-2xl p-5"
          >
            <div className="flex justify-center mb-3">
              <div className="h-1 w-8 rounded-full bg-gray-600" />
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: config.glowColor }}
              >
                {config.icon}
              </div>
              <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">
                {title}
              </h3>
            </div>

            <p className="text-xs text-gray-400 mb-5 leading-relaxed">{message}</p>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                className={`flex-1 ${config.btnClass}`}
                disabled={loading}
              >
                {loading ? (loadingLabel ?? "Processing...") : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
