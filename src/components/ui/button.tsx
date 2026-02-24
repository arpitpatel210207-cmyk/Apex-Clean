"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<Variant, string> = {
    primary: "bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 hover:brightness-95",
    secondary: "bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 hover:brightness-95",
    ghost: "bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 hover:brightness-95",
    danger: "bg-[#6fc4e7] text-[#121212] border border-[#6fc4e7]/60 hover:brightness-95"
  };

  const sizes: Record<Size, string> = {
    md: "h-11 px-4 text-sm",
    sm: "h-9 px-3 text-sm"
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
