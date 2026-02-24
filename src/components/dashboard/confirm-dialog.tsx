"use client";

import { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmTone?: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmTone = "default",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[700] grid place-items-center px-4">
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="absolute inset-0 bg-transparent"
      />

      <div className="relative w-full max-w-[500px] rounded-2xl border border-white/12 bg-[rgba(14,16,20,0.98)] px-6 py-5 shadow-[0_28px_70px_rgba(0,0,0,0.58)]">
        <h3 className="text-[20px] font-semibold leading-tight text-text">{title}</h3>
        {description ? (
          <p className="mt-2 text-[12px] leading-relaxed text-mutetext">{description}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-[rgba(255,255,255,0.04)] px-5 text-base font-semibold text-text transition hover:bg-[rgba(255,255,255,0.08)]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={
              confirmTone === "danger"
                ? "inline-flex h-11 min-w-[90px] items-center justify-center rounded-xl border border-rose-300/45 bg-[#ef4444] px-6 text-base font-semibold text-white shadow-[0_8px_20px_rgba(239,68,68,0.28)] transition hover:bg-[#dc3a3a]"
                : "inline-flex h-11 min-w-[90px] items-center justify-center rounded-xl border border-[#8dd3ee]/60 bg-[#6fc4e7] px-6 text-base font-semibold text-[#0f172a] shadow-[0_8px_20px_rgba(111,196,231,0.25)] transition hover:brightness-95"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
