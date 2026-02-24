"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { createPortal } from "react-dom";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  disabledOptions?: string[];
  searchable?: boolean; // Ã°Å¸â€˜Ë† turn search on/off
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
};

export function Dropdown({
  value,
  options,
  placeholder = "Select option",
  onChange,
  disabledOptions = [],
  searchable = false,
  clearable = false,
  className = "",
  inputClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const selected =
    options.find((o) => o.value === value)?.label || "";

  const filtered = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
  const handler = (e: MouseEvent) => {
    const target = e.target as Node;

    if (
      ref.current &&
      !ref.current.contains(target) &&
      menuRef.current &&
      !menuRef.current.contains(target)
    ) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handler);
  return () =>
    document.removeEventListener("mousedown", handler);
}, []);


  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* MAIN INPUT */}
      <div className="relative">
        <input
          readOnly
          value={selected}
          placeholder={placeholder}
          onClick={() => {
  setOpen(o => !o);

  if (!open && ref.current) {
    const rect = ref.current.getBoundingClientRect();

    setMenuPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }
}}

          className={`w-full cursor-pointer rounded-xl border border-[#2a3a45]/60 bg-card2 px-4 py-3 pr-10 text-text outline-none focus:border-[#355466]/55 focus:ring-0 ${inputClassName}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {clearable && value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setQuery("");
              }}
              className="text-muted-foreground hover:text-text"
            >
              <X size={16} />
            </button>
          )}

          {open ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>

      {open &&
  createPortal(
   <div
  ref={menuRef}
  style={{
    position: "absolute",
    top: menuPos.top,
    left: menuPos.left,
    width: menuPos.width,
    zIndex: 9999,
  }}
  className="rounded-2xl border border-[#2a3a45]/55 bg-[rgba(14,18,24,0.92)] shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl"
>

      {searchable && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="input pl-9 h-10 bg-transparent"
          />
        </div>
      )}

      <div className="max-h-64 overflow-auto p-1.5 scrollbar-hide">
        {filtered.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground">
            No results
          </div>
        )}

        {filtered.map((o) => {
          const disabled = disabledOptions.includes(o.value);

          return (
            <button
              key={o.value}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onChange(o.value);
                setOpen(false);
                setQuery("");
              }}
              className={`w-full rounded-lg px-3.5 py-2.5 text-left text-sm text-text transition hover:bg-[#182230]
                ${disabled ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  )}

    </div>
  );
}
