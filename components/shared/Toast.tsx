"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)", text: "#059669", icon: "#10B981" },
  error: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)", text: "#DC2626", icon: "#EF4444" },
  info: { bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.15)", text: "#2563EB", icon: "#3B82F6" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 토스트 렌더링 */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const color = COLORS[toast.type];
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full max-w-sm pointer-events-auto"
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
        style={{
          background: color.bg,
          backdropFilter: "blur(16px)",
          border: `1px solid ${color.border}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" style={{ color: color.icon }} />
        <p className="text-sm font-medium flex-1" style={{ color: color.text }}>
          {toast.message}
        </p>
        <button onClick={() => onRemove(toast.id)} className="shrink-0">
          <X className="w-3.5 h-3.5" style={{ color: color.text, opacity: 0.5 }} />
        </button>
      </div>
    </motion.div>
  );
}
