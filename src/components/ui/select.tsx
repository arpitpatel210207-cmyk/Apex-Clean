"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select
        {...props}
        className={cn(
          "input cursor-pointer appearance-none pr-10",
          "bg-[#121212] text-text",          // main closed select
          props.disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      >
        {props.children}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-mutetext"
      />

      {/* Ã°Å¸â€Â¥ global option styling */}
      <style jsx global>{`
        select option {
          background-color: #121212;
          color: white;
        }

        select option:hover {
          background-color: rgba(250, 204, 21, 0.2); /* soft yellow hover */
        }
      `}</style>
    </div>
  );
}
