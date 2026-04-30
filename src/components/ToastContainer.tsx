"use client";

import type { ToastItem } from "@/hooks/useToast";

const toastIcon: Record<ToastItem["type"], string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-container" id="toastContainer" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast show toast-${toast.type}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            {toastIcon[toast.type]}
          </span>
          <span className="toast-text">{toast.message}</span>
          <button
            className="toast-dismiss"
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
