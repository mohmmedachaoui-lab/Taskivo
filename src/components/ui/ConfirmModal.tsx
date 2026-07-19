"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-[70]"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-xs mx-auto z-[70] glass neon-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-[#ef4444]" />
          </div>
          <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-mono)]">
            {title}
          </h3>
        </div>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 ${danger ? "bg-[#ef4444] hover:bg-[#dc2626] text-white border-[#ef4444]/40" : ""}`}
            disabled={loading}
          >
            {loading ? "Removing..." : confirmLabel}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
