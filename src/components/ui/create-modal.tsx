"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export  function CreateModal({
  open,
  title,
  onClose,
  children,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-start justify-center overflow-hidden p-3 pt-14 sm:items-center sm:p-6">

      {/* BACKDROP */}
      <div
        className="animate-modal-fade absolute inset-0 bg-[#121212]/70"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="animate-modal-pop modal-panel relative w-full max-w-lg overflow-hidden rounded-2xl p-4 sm:p-6"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">

          <h3 className="modal-title text-xl font-semibold">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="modal-close transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* BODY */}
        <div className="space-y-3">
          {children}
        </div>

      </div>
    </div>
  );
}
